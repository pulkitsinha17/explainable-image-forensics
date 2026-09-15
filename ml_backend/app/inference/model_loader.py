"""
PIXENTRA — model loader.

Loads both the MPC backbone and the StrongMultiEvidenceNet exactly as done in
the authoritative Kaggle notebook (MPC_MultiEvidence_Corrected_STRONG_FINAL.ipynb).

Loading strategy
────────────────
MPC backbone:
    torch.load(checkpoint, map_location="cpu", weights_only=False)
    Handle module. prefix stripping; require >95% key match.

StrongMultiEvidenceNet:
    checkpoint["model_state_dict"]  — this is the save convention from cell 16:
        torch.save({"epoch": epoch, "model_state_dict": model.state_dict(), ...}, BEST_PATH)

Both models are frozen after loading (eval(), requires_grad=False).
"""
from __future__ import annotations
import logging
from pathlib import Path
from typing import Optional

import torch

from app.config import PROPOSED_CHECKPOINT, MPC_CHECKPOINT
from app.inference.model_arch import StrongMultiEvidenceNet, _import_mpc_model

logger = logging.getLogger(__name__)


class LoadedModels:
    """Container for the two loaded models, shared across requests."""

    def __init__(
        self,
        proposed: StrongMultiEvidenceNet,
        mpc,
        device: torch.device,
    ):
        self.proposed = proposed
        self.mpc = mpc
        self.device = device

    @property
    def proposed_loaded(self) -> bool:
        return self.proposed is not None

    @property
    def mpc_loaded(self) -> bool:
        return self.mpc is not None


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


def _load_proposed(path: Path, device: torch.device) -> Optional[StrongMultiEvidenceNet]:
    """
    Load StrongMultiEvidenceNet from BEST_PATH checkpoint.
    checkpoint["model_state_dict"] — save convention from notebook cell 16.
    """
    if not path.exists():
        logger.error(
            "Proposed checkpoint not found: %s\n"
            "Place best_multi_evidence_stage1.pth in ml_backend/models/.",
            path,
        )
        return None

    if path.stat().st_size == 0:
        logger.error(
            "Proposed checkpoint is EMPTY (0 bytes): %s\n"
            "The file best_multi_evidence_stage1 .pth downloaded from Kaggle was a "
            "0-byte placeholder. Re-download the actual trained checkpoint from your "
            "Kaggle notebook output and place it at:\n"
            "  ml_backend/models/best_multi_evidence_stage1.pth",
            path,
        )
        return None

    try:
        model = StrongMultiEvidenceNet().to(device)

        ck = torch.load(str(path), map_location=device, weights_only=False)

        # Notebook saves: {"epoch": ..., "model_state_dict": ..., "history": ..., "val_score": ...}
        if isinstance(ck, dict) and "model_state_dict" in ck:
            epoch = ck.get("epoch", "unknown")
            val_score = ck.get("val_score", float("nan"))
            state_dict = ck["model_state_dict"]
            logger.info(
                "Proposed checkpoint: epoch=%s  val_score=%.4f", epoch, val_score
            )
        elif isinstance(ck, dict):
            # Fallback: assume the dict IS the state dict
            state_dict = ck
        else:
            raise RuntimeError(
                f"Unexpected checkpoint format: {type(ck)}. "
                "Expected a dict with 'model_state_dict'."
            )

        model.load_state_dict(state_dict, strict=True)
        model.eval()
        for p in model.parameters():
            p.requires_grad_(False)

        logger.info(
            "StrongMultiEvidenceNet loaded from %s — %s parameters",
            path.name,
            f"{sum(p.numel() for p in model.parameters()):,}",
        )
        return model

    except Exception as exc:
        logger.error("Failed to load proposed checkpoint: %s", exc)
        return None


def load_all_models() -> LoadedModels:
    """
    Called once at FastAPI startup.
    Loads both models and returns a LoadedModels container.
    """
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    logger.info("=" * 60)
    logger.info("PIXENTRA ML Backend — model loading")
    logger.info("Device: %s", device)
    logger.info("Proposed checkpoint: %s", PROPOSED_CHECKPOINT)
    logger.info("MPC checkpoint:      %s", MPC_CHECKPOINT)
    logger.info("=" * 60)

    proposed = _load_proposed(Path(PROPOSED_CHECKPOINT), device)
    mpc = _load_mpc(Path(MPC_CHECKPOINT), device)

    if proposed is None:
        logger.critical(
            "StrongMultiEvidenceNet could not be loaded. "
            "/analyze will return errors until the checkpoint is available."
        )
    if mpc is None:
        logger.warning(
            "MPC backbone unavailable. "
            "Evidence channel 0 will be zero-filled. "
            "Risk scores will be less accurate."
        )

    logger.info(
        "Startup complete — proposed_loaded=%s  mpc_loaded=%s",
        proposed is not None,
        mpc is not None,
    )
    return LoadedModels(proposed=proposed, mpc=mpc, device=device)
