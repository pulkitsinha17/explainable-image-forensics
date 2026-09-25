"""
PIXENTRA — model loader.

Loads the PIXENTRA_FORGERY_CLASSIFIER_V2 bundle which contains:
  - base_model_state_dict   → StrongMultiEvidenceNet (localization backbone)
  - classifier_state_dict   → ImageLevelClassifier (270-dim MLP head)
  - calibrator_coef / calibrator_intercept → logistic calibration layer
  - inconclusive_confidence_threshold
  - localization_threshold

Legacy fallback:
  If the bundle is not present, falls back to loading best_multi_evidence_stage1.pth
  and using the p999 localization score for the verdict (original pipeline).

Loading strategy
────────────────
Bundle:
    torch.load(bundle_path, map_location="cpu", weights_only=False)
    Reads base_model_state_dict, classifier_state_dict, calibrator_coef, calibrator_intercept.

MPC backbone (standalone):
    torch.load(checkpoint, map_location="cpu", weights_only=False)
    Handle module. prefix stripping; require >95% key match.

Both models are frozen after loading (eval(), requires_grad=False).
"""
from __future__ import annotations
import logging
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

import numpy as np
import torch

from app.config import (
    FORENSIC_BUNDLE_PATH,
    PROPOSED_CHECKPOINT,
    MPC_CHECKPOINT,
    INCONCLUSIVE_CONFIDENCE_THRESHOLD,
)
from app.inference.model_arch import (
    StrongMultiEvidenceNet,
    ImageLevelClassifier,
    CLASSIFIER_INPUT_DIM,
    _import_mpc_model,
)

logger = logging.getLogger(__name__)


@dataclass
class LoadedModels:
    """Container for all loaded models and calibration state, shared across requests."""

    proposed: Optional[StrongMultiEvidenceNet]   # localization backbone
    mpc: Optional[object]                         # MPC backbone (standalone, optional)
    classifier: Optional[ImageLevelClassifier]    # image-level classification head
    # Logistic calibration: probability = sigmoid(coef * logit + intercept)
    calibrator_coef: Optional[np.ndarray] = None        # shape (1,)
    calibrator_intercept: Optional[np.ndarray] = None   # shape (1,)
    inconclusive_threshold: float = INCONCLUSIVE_CONFIDENCE_THRESHOLD
    device: torch.device = field(default_factory=lambda: torch.device("cpu"))
    bundle_loaded: bool = False

    @property
    def proposed_loaded(self) -> bool:
        return self.proposed is not None

    @property
    def mpc_loaded(self) -> bool:
        return self.mpc is not None

    @property
    def classifier_loaded(self) -> bool:
        return self.classifier is not None

    def calibrate(self, logit: float) -> float:
        """
        Apply logistic calibration to a raw classifier logit.
        Returns calibrated manipulation probability in [0, 1].
        Falls back to sigmoid(logit) if calibrator is not loaded.
        """
        if self.calibrator_coef is not None and self.calibrator_intercept is not None:
            cal_logit = float(self.calibrator_coef[0]) * logit + float(self.calibrator_intercept[0])
        else:
            cal_logit = logit
        return float(1.0 / (1.0 + np.exp(-cal_logit)))


# ─────────────────────────────────────────────────────────────────────────────
#  MPC backbone loader (unchanged from original)
# ─────────────────────────────────────────────────────────────────────────────

def _load_mpc(path: Path, device: torch.device):
    """
    Load the MPC backbone exactly as notebook cell 4.
    Returns the model or None if loading fails.
    """
    try:
        MyModel = _import_mpc_model()
        mpc_model = MyModel().to(device)

        raw = torch.load(str(path), map_location="cpu", weights_only=False)
        if isinstance(raw, dict) and "state_dict" in raw and isinstance(raw["state_dict"], dict):
            raw = raw["state_dict"]

        state = mpc_model.state_dict()
        clean = {}
        for k, v in raw.items():
            kk = k[7:] if k.startswith("module.") else k
            if kk in state and state[kk].shape == v.shape:
                clean[kk] = v

        loaded_fraction = len(clean) / max(len(state), 1)
        if loaded_fraction < 0.95:
            raise RuntimeError(
                f"MPC checkpoint loaded only {len(clean)}/{len(state)} tensors "
                f"({loaded_fraction:.1%}). Checkpoint/model mismatch."
            )

        state.update(clean)
        mpc_model.load_state_dict(state, strict=False)
        mpc_model.eval()
        for p in mpc_model.parameters():
            p.requires_grad_(False)

        logger.info(
            "MPC backbone loaded: %d/%d tensors from %s",
            len(clean), len(state), path.name,
        )

        # Sanity-check forward pass
        with torch.no_grad():
            dummy = torch.randn(1, 3, 512, 512, device=device)
            out = mpc_model(dummy)
            if isinstance(out, (tuple, list)):
                out = out[0]
        logger.info("MPC sanity pass OK — output shape: %s", tuple(out.shape))
        return mpc_model

    except ImportError as exc:
        logger.error("MPC import failed: %s", exc)
        logger.warning(
            "Continuing without MPC backbone. "
            "Evidence channel 0 (MPC prior) will be zero-filled during inference."
        )
        return None
    except Exception as exc:
        logger.error("MPC checkpoint load failed: %s", exc)
        logger.warning("Continuing without MPC backbone.")
        return None


# ─────────────────────────────────────────────────────────────────────────────
#  Legacy proposed-only loader (fallback when bundle is unavailable)
# ─────────────────────────────────────────────────────────────────────────────

def _load_proposed_legacy(path: Path, device: torch.device) -> Optional[StrongMultiEvidenceNet]:
    """
    Load StrongMultiEvidenceNet from a standalone best_multi_evidence_stage1.pth checkpoint.
    Used as a fallback when the full classifier bundle is not present.
    """
    if not path.exists() or path.stat().st_size == 0:
        logger.error("Legacy proposed checkpoint not found or empty: %s", path)
        return None

    try:
        model = StrongMultiEvidenceNet().to(device)
        ck = torch.load(str(path), map_location=device, weights_only=False)

        if isinstance(ck, dict) and "model_state_dict" in ck:
            state_dict = ck["model_state_dict"]
            logger.info(
                "Legacy proposed checkpoint: epoch=%s  val_score=%.4f",
                ck.get("epoch", "?"), ck.get("val_score", float("nan")),
            )
        elif isinstance(ck, dict):
            state_dict = ck
        else:
            raise RuntimeError(f"Unexpected checkpoint format: {type(ck)}")

        model.load_state_dict(state_dict, strict=True)
        model.eval()
        for p in model.parameters():
            p.requires_grad_(False)

        logger.info(
            "StrongMultiEvidenceNet loaded (legacy) from %s — %s parameters",
            path.name, f"{sum(p.numel() for p in model.parameters()):,}",
        )
        return model

    except Exception as exc:
        logger.error("Failed to load legacy proposed checkpoint: %s", exc)
        return None


# ─────────────────────────────────────────────────────────────────────────────
#  Bundle loader (PIXENTRA_FORGERY_CLASSIFIER_V2)
# ─────────────────────────────────────────────────────────────────────────────

def _load_bundle(path: Path, device: torch.device):
    """
    Load the full PIXENTRA_FORGERY_CLASSIFIER_V2 bundle.

    Returns (proposed, classifier, cal_coef, cal_intercept, inconclusive_threshold)
    or raises on failure.
    """
    logger.info("Loading PIXENTRA_FORGERY_CLASSIFIER_V2 bundle from %s", path)

    bundle = torch.load(str(path), map_location="cpu", weights_only=False)
    fmt = bundle.get("format_version", "UNKNOWN")
    logger.info("Bundle format version: %s", fmt)

    # ── 1. Load base model ────────────────────────────────────────────────────
    proposed = StrongMultiEvidenceNet().to(device)
    base_sd = bundle["base_model_state_dict"]
    proposed.load_state_dict(base_sd, strict=True)
    proposed.eval()
    for p in proposed.parameters():
        p.requires_grad_(False)
    logger.info(
        "Bundle base model loaded — %s parameters",
        f"{sum(p.numel() for p in proposed.parameters()):,}",
    )

    # ── 2. Load classifier head ───────────────────────────────────────────────
    in_dim = bundle.get("classifier_input_dim", CLASSIFIER_INPUT_DIM)
    classifier = ImageLevelClassifier(in_dim=in_dim).to(device)
    classifier.load_state_dict(bundle["classifier_state_dict"], strict=True)
    classifier.eval()
    for p in classifier.parameters():
        p.requires_grad_(False)
    logger.info("Bundle classifier head loaded — input_dim=%d", in_dim)

    # ── 3. Calibration ────────────────────────────────────────────────────────
    # calibrator_coef / calibrator_intercept may be torch.Tensor OR numpy.ndarray
    # depending on the torch.save() call in the notebook.
    def _to_numpy_1d(v) -> np.ndarray:
        if isinstance(v, torch.Tensor):
            return v.cpu().numpy().reshape(-1).astype(np.float64)
        return np.asarray(v, dtype=np.float64).reshape(-1)

    cal_coef = _to_numpy_1d(bundle["calibrator_coef"])         # shape (1,)
    cal_intercept = _to_numpy_1d(bundle["calibrator_intercept"])  # shape (1,)
    logger.info(
        "Bundle calibrator: coef=%.6f  intercept=%.6f",
        float(cal_coef[0]), float(cal_intercept[0]),
    )


    # ── 4. Thresholds ─────────────────────────────────────────────────────────
    inconclusive_thr = float(bundle.get(
        "inconclusive_confidence_threshold",
        INCONCLUSIVE_CONFIDENCE_THRESHOLD,
    ))
    loc_thr = float(bundle.get("localization_threshold", 0.38))
    logger.info(
        "Bundle thresholds: inconclusive_conf=%.4f  localization=%.4f",
        inconclusive_thr, loc_thr,
    )

    return proposed, classifier, cal_coef, cal_intercept, inconclusive_thr


# ─────────────────────────────────────────────────────────────────────────────
#  Public entry point
# ─────────────────────────────────────────────────────────────────────────────

def load_all_models() -> LoadedModels:
    """
    Called once at FastAPI startup.
    Tries to load the full V2 bundle first; falls back to the legacy checkpoint.
    """
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    logger.info("=" * 60)
    logger.info("PIXENTRA ML Backend — model loading")
    logger.info("Device: %s", device)
    logger.info("Bundle path:         %s", FORENSIC_BUNDLE_PATH)
    logger.info("Legacy proposed:     %s", PROPOSED_CHECKPOINT)
    logger.info("MPC checkpoint:      %s", MPC_CHECKPOINT)
    logger.info("=" * 60)

    proposed = None
    classifier = None
    cal_coef = None
    cal_intercept = None
    inconclusive_threshold = INCONCLUSIVE_CONFIDENCE_THRESHOLD
    bundle_loaded = False

    bundle_path = Path(FORENSIC_BUNDLE_PATH)
    if bundle_path.exists() and bundle_path.stat().st_size > 0:
        try:
            proposed, classifier, cal_coef, cal_intercept, inconclusive_threshold = (
                _load_bundle(bundle_path, device)
            )
            bundle_loaded = True
            logger.info("✓ Bundle loaded successfully (V2 inference path active)")
        except Exception as exc:
            logger.error("Bundle load failed, falling back to legacy: %s", exc)
            proposed = None
    else:
        logger.warning(
            "Bundle not found at %s — using legacy checkpoint path.", bundle_path
        )

    # Fallback: load base model from standalone checkpoint if bundle failed
    if proposed is None:
        proposed = _load_proposed_legacy(Path(PROPOSED_CHECKPOINT), device)

    # MPC backbone (standalone — also embedded in bundle's base model, but kept
    # for the separate mpc_risk_score output and legacy compat)
    mpc = _load_mpc(Path(MPC_CHECKPOINT), device)

    if proposed is None:
        logger.critical(
            "StrongMultiEvidenceNet could not be loaded from any source. "
            "/analyze will return errors until a valid checkpoint is available."
        )
    if mpc is None:
        logger.warning(
            "MPC backbone unavailable. "
            "Evidence channel 0 will be zero-filled. "
            "mpc_risk_score will be 0.0."
        )

    logger.info(
        "Startup complete — proposed=%s  mpc=%s  bundle=%s  inconclusive_thr=%.4f",
        proposed is not None,
        mpc is not None,
        bundle_loaded,
        inconclusive_threshold,
    )

    return LoadedModels(
        proposed=proposed,
        mpc=mpc,
        classifier=classifier,
        calibrator_coef=cal_coef,
        calibrator_intercept=cal_intercept,
        inconclusive_threshold=inconclusive_threshold,
        device=device,
        bundle_loaded=bundle_loaded,
    )
