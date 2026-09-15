"""
PIXENTRA — inference pipeline.

Accepts an RGB image, runs the full analysis pipeline, and returns
structured results matching the Pydantic schema:
  - Binary forgery mask
  - Heatmap overlay
  - Risk score (0-1)
  - Verdict
  - Per-evidence channel scores
  - Confidence
"""
from __future__ import annotations
import logging
import uuid
from pathlib import Path
from typing import Optional, Union

import cv2
import numpy as np
import torch

from app.config import FORGERY_THRESHOLD, MASKS_DIR, OVERLAYS_DIR
from app.inference.model_loader import LoadedModels
from app.inference.preprocessor import prepare_inference_inputs
from app.schemas import AnalysisResult, EvidenceScores, LocalizationOutput

logger = logging.getLogger(__name__)

# Ensure output directories exist
MASKS_DIR.mkdir(parents=True, exist_ok=True)
OVERLAYS_DIR.mkdir(parents=True, exist_ok=True)


# ─────────────────────────────────────────────────────────────────────────────
#  Colourmap helpers
# ─────────────────────────────────────────────────────────────────────────────

def _make_heatmap_overlay(
    original_rgb: np.ndarray,
    prob_map: np.ndarray,          # (H, W) float32 in [0, 1]
    alpha: float = 0.50,
) -> np.ndarray:
    """
    Blend a JET heatmap onto the original image.
    Returns a uint8 BGR image at the original resolution.
    """
    h, w = original_rgb.shape[:2]
    prob_r = cv2.resize(prob_map, (w, h), interpolation=cv2.INTER_LINEAR)

    heat = cv2.applyColorMap(
        (np.clip(prob_r, 0.0, 1.0) * 255).astype(np.uint8), cv2.COLORMAP_JET
    )  # BGR

    orig_bgr = cv2.cvtColor(original_rgb, cv2.COLOR_RGB2BGR)
    overlay = cv2.addWeighted(orig_bgr, 1 - alpha, heat, alpha, 0)
    return overlay


def _make_binary_mask(
    prob_map: np.ndarray,          # (H, W) float32
    original_shape: tuple,         # (H_orig, W_orig)
    threshold: float,
) -> np.ndarray:
    """
    Threshold the probability map and resize to original resolution.
    Returns a uint8 grayscale image (0 or 255).
    """
    h, w = original_shape[:2]
    prob_r = cv2.resize(prob_map, (w, h), interpolation=cv2.INTER_LINEAR)
    mask = ((prob_r >= threshold) * 255).astype(np.uint8)
    return mask


# ─────────────────────────────────────────────────────────────────────────────
#  Confidence metric
# ─────────────────────────────────────────────────────────────────────────────

def _binary_entropy_confidence(prob_map: np.ndarray) -> float:
    """
    1 - normalised entropy of the probability map.
    Perfectly certain (all 0 or all 1) → 1.0
    Maximum uncertainty (all 0.5) → 0.0
    """
    p = np.clip(prob_map.astype(np.float64).ravel(), 1e-7, 1.0 - 1e-7)
    entropy = -p * np.log2(p) - (1 - p) * np.log2(1 - p)
    normalised_entropy = float(np.mean(entropy))      # in [0, 1]
    return float(np.clip(1.0 - normalised_entropy, 0.0, 1.0))


# ─────────────────────────────────────────────────────────────────────────────
#  Verdict
# ─────────────────────────────────────────────────────────────────────────────

def _compute_verdict(risk_score: float, confidence: float) -> str:
    """
    Convert numeric scores to a verdict string.
    """
    if confidence < 0.30:
        return "inconclusive"
    if risk_score >= 0.55:
        return "forged"
    if risk_score <= 0.25:
        return "authentic"
    return "inconclusive"


# ─────────────────────────────────────────────────────────────────────────────
#  Main inference function
# ─────────────────────────────────────────────────────────────────────────────

@torch.no_grad()
def run_inference(
    img_rgb: np.ndarray,
    models: LoadedModels,
    threshold: float = FORGERY_THRESHOLD,
    analysis_id: Optional[str] = None,
    raw_bytes: Optional[bytes] = None,
    img_path: Optional[Union[str, Path]] = None,
) -> AnalysisResult:
    """
    Run the full PIXENTRA inference pipeline on a single RGB image.
    """
    if models.proposed is None:
        raise RuntimeError(
            "StrongMultiEvidenceNet is not loaded. "
            "Provide best_multi_evidence_stage1.pth in ml_backend/models/."
        )

    analysis_id = analysis_id or str(uuid.uuid4())
    device = models.device
    original_shape = img_rgb.shape  # (H_orig, W_orig, 3)

    # ── 1. Prepare exact input tensors matching notebook ──────────────────────
    inputs = prepare_inference_inputs(
        img_rgb=img_rgb,
        device=device,
        raw_bytes=raw_bytes,
        img_path=img_path,
    )

    # ── 2. Forward pass through StrongMultiEvidenceNet ────────────────────────
    out = models.proposed(
        inputs["image"],
        inputs["comp"],
        inputs["freq"],
        inputs["stat"],
        inputs["ela"],
        inputs["meta"],
        inputs["meta_avail"],
    )

    # ── 3. Extract probability map ────────────────────────────────────────────
    if isinstance(out, dict) and "prob" in out:
        prob_t = out["prob"]
    elif isinstance(out, dict) and "logits" in out:
        prob_t = torch.sigmoid(out["logits"])
    elif torch.is_tensor(out):
        prob_t = torch.sigmoid(out)
    else:
        raise RuntimeError(f"Unexpected model output format: {type(out)}")

    prob_map = prob_t[0, 0].detach().float().cpu().numpy()  # (512, 512)

    # ── 4. MPC probability & risk score ───────────────────────────────────────
    if isinstance(out, dict) and "mpc_prob" in out and out["mpc_prob"] is not None:
        mpc_prob_map = out["mpc_prob"][0, 0].detach().float().cpu().numpy()
        mpc_risk_score = float(np.mean(mpc_prob_map))
    elif models.mpc is not None:
        with torch.no_grad():
            mpc_logits = models.mpc(inputs["image"])
            mpc_prob_map = torch.sigmoid(mpc_logits)[0, 0].detach().float().cpu().numpy()
            mpc_risk_score = float(np.mean(mpc_prob_map))
    else:
        mpc_risk_score = 0.0

    # ── 5. Overall risk score & confidence ────────────────────────────────────
    if isinstance(out, dict) and "risk_score" in out and out["risk_score"] is not None:
        risk_score = float(out["risk_score"].item())
    else:
        risk_score = float(np.mean(prob_map))

    confidence = _binary_entropy_confidence(prob_map)
    verdict = _compute_verdict(risk_score, confidence)

    # ── 6. Evidence channel scores ────────────────────────────────────────────
    raw_ev = inputs["raw_evidence"]
    evidence = EvidenceScores(
        noise_residual=float(np.mean(raw_ev["freq"][0])),
        frequency_dct=float(np.mean(raw_ev["freq"][1])),
        ela=float(np.mean(raw_ev["ela"][0])),
        local_statistics=float(np.mean(raw_ev["stat"][1])),
    )

    # ── 7. Produce binary mask and overlay ────────────────────────────────────
    mask_arr = _make_binary_mask(prob_map, original_shape, threshold)
    overlay_arr = _make_heatmap_overlay(img_rgb, prob_map)

    mask_path = MASKS_DIR / f"{analysis_id}_mask.png"
    overlay_path = OVERLAYS_DIR / f"{analysis_id}_overlay.png"

    cv2.imwrite(str(mask_path), mask_arr)
    cv2.imwrite(str(overlay_path), overlay_arr)

    # ── 8. Pixel-fraction of predicted forgery ────────────────────────────────
    forgery_pixel_fraction = float(np.mean(mask_arr > 0))

    localization = LocalizationOutput(
        mask_path=str(mask_path),
        overlay_path=str(overlay_path),
        forgery_pixel_fraction=forgery_pixel_fraction,
    )

    logger.info(
        "Inference complete — id=%s  risk=%.3f  conf=%.3f  verdict=%s  forgery_px=%.2f%%",
        analysis_id, risk_score, confidence, verdict, forgery_pixel_fraction * 100,
    )

    return AnalysisResult(
        verdict=verdict,
        risk_score=round(risk_score, 4),
        confidence=round(confidence, 4),
        localization=localization,
        evidence=evidence,
        mpc_risk_score=round(mpc_risk_score, 4),
        analysis_id=analysis_id,
    )
