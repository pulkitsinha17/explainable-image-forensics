"""
PIXENTRA — inference pipeline.

Accepts an RGB image, runs the full analysis pipeline, and returns
structured results:
  - Binary forgery mask
  - Heatmap overlay
  - Risk score (0-1)
  - Verdict
  - Per-evidence channel scores
  - Confidence

All heavy computation happens inside this module; the FastAPI route
only calls `run_inference()`.
"""
from __future__ import annotations
import logging
import uuid
from pathlib import Path
from typing import Optional

import cv2
import numpy as np
import torch

from app.config import FORGERY_THRESHOLD, MASKS_DIR, OVERLAYS_DIR
from app.inference.model_loader import LoadedModels
from app.inference.preprocessor import build_inference_tensors
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
    prob_map: np.ndarray,          # (H, W) float32 in [0, 1] — at model resolution
    alpha: float = 0.50,
) -> np.ndarray:
    """
    Blend a JET heatmap onto the original image.
    Returns a uint8 BGR image at the original resolution.
    """
    # Resize prob_map to original image dimensions
    h, w = original_rgb.shape[:2]
    prob_r = cv2.resize(prob_map, (w, h), interpolation=cv2.INTER_LINEAR)

    heat = cv2.applyColorMap(
        (prob_r * 255).astype(np.uint8), cv2.COLORMAP_JET
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
    p = prob_map.astype(np.float64).ravel()
    eps = 1e-8
    entropy = -p * np.log2(p + eps) - (1 - p) * np.log2(1 - p + eps)
    normalised_entropy = float(np.mean(entropy))      # in [0, 1]
    return float(np.clip(1.0 - normalised_entropy, 0.0, 1.0))


# ─────────────────────────────────────────────────────────────────────────────
#  Verdict
# ─────────────────────────────────────────────────────────────────────────────

def _compute_verdict(risk_score: float, confidence: float) -> str:
    """
    Convert numeric scores to a verdict string.

    Thresholds are intentionally conservative to avoid false positives.
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
) -> AnalysisResult:
    """
    Run the full PIXENTRA inference pipeline on a single RGB image.

    Parameters
    ----------
    img_rgb      : H×W×3 uint8 NumPy array
    models       : loaded model container from model_loader.load_all_models()
    threshold    : probability threshold for binary mask (default: PROP_THR from notebook)
    analysis_id  : optional UUID string; generated if not provided

    Returns
    -------
    AnalysisResult (Pydantic model)

    Raises
    ------
    RuntimeError if proposed model is not loaded
    """
    if models.proposed is None:
        raise RuntimeError(
            "StrongMultiEvidenceNet is not loaded. "
            "Provide best_multi_evidence_stage1.pth in ml_backend/models/."
        )

    analysis_id = analysis_id or str(uuid.uuid4())
    device = models.device
    original_shape = img_rgb.shape  # (H_orig, W_orig, 3)

    # ── 1. Build input tensors ────────────────────────────────────────────────
    rgb_t, ev_t, mpc_map = build_inference_tensors(
        img_rgb, models.mpc, device
    )

    # ── 2. Forward pass through StrongMultiEvidenceNet ────────────────────────
    with torch.amp.autocast("cuda", enabled=device.type == "cuda"):
        logits = models.proposed(rgb_t, ev_t)  # (1, 1, H, W)

    prob_map = torch.sigmoid(logits).squeeze().float().cpu().numpy()  # (H, W)

    # ── 3. Compute MPC risk score (spatial mean of MPC prior) ─────────────────
    mpc_risk_score = float(np.mean(mpc_map))

    # ── 4. Risk score & confidence ────────────────────────────────────────────
    risk_score = float(np.mean(prob_map))
    confidence = _binary_entropy_confidence(prob_map)
    verdict = _compute_verdict(risk_score, confidence)

    # ── 5. Evidence channel scores (spatial mean of each ev channel) ──────────
    ev_np = ev_t.squeeze().cpu().numpy()  # (5, H, W)
    # ev_np[0] = MPC prior, ev_np[1..4] = noise, freq, ela, stats
    evidence = EvidenceScores(
        noise_residual=float(np.mean(ev_np[1])),
        frequency_dct=float(np.mean(ev_np[2])),
        ela=float(np.mean(ev_np[3])),
        local_statistics=float(np.mean(ev_np[4])),
    )

    # ── 6. Produce binary mask and overlay ────────────────────────────────────
    mask_arr = _make_binary_mask(prob_map, original_shape, threshold)
    overlay_arr = _make_heatmap_overlay(img_rgb, prob_map)

    mask_path = MASKS_DIR / f"{analysis_id}_mask.png"
    overlay_path = OVERLAYS_DIR / f"{analysis_id}_overlay.png"

    cv2.imwrite(str(mask_path), mask_arr)
    cv2.imwrite(str(overlay_path), overlay_arr)

    # ── 7. Pixel-fraction of predicted forgery ────────────────────────────────
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
