"""
PIXENTRA — inference pipeline.

Accepts an RGB image, runs the full analysis pipeline, and returns
structured results matching the Pydantic schema:
  - Binary forgery mask (localization)
  - Heatmap overlay
  - Calibrated manipulation_probability  (new V2 path)
  - Verdict: MANIPULATED / AUTHENTIC / INCONCLUSIVE
  - Per-evidence channel scores
  - prediction_certainty (confidence in [0, 1])

V2 verdict path (when classifier bundle is loaded):
  1. Forward pass → MultiEvidenceModel → fused_features, prob, mpc_prob, branch_contribution
  2. build_classifier_features() → 270-dim vector
  3. ImageLevelClassifier(270) → raw logit
  4. Logistic calibration: manipulation_probability = sigmoid(coef * logit + intercept)
  5. prediction_certainty = 2 * |manipulation_prob - 0.5|
  6. INCONCLUSIVE if certainty < inconclusive_threshold
  7. MANIPULATED if manipulation_prob >= 0.5, else AUTHENTIC

Legacy path (fallback, no bundle):
  p999 = 99.9th percentile of localization probability map
  verdict derived from p999 >= CALIBRATED_IMAGE_THRESHOLD
"""
from __future__ import annotations
import logging
import uuid
from pathlib import Path
from typing import Optional, Union

import cv2
import numpy as np
import torch

from app.config import CALIBRATED_IMAGE_THRESHOLD, FORGERY_THRESHOLD, MASKS_DIR, OVERLAYS_DIR
from app.inference.model_arch import build_classifier_features
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
#  Confidence metric (used in legacy path only)
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
#  Verdict helpers
# ─────────────────────────────────────────────────────────────────────────────

def _compute_verdict_v2(
    manipulation_prob: float,
    certainty: float,
    inconclusive_threshold: float,
) -> str:
    """
    V2 verdict using the calibrated classifier probability.
      - INCONCLUSIVE: certainty < inconclusive_threshold
      - MANIPULATED:  manipulation_prob >= 0.5
      - AUTHENTIC:    manipulation_prob < 0.5
    """
    if certainty < inconclusive_threshold:
        return "inconclusive"
    if manipulation_prob >= 0.5:
        return "manipulated"
    return "authentic"


def _analyze_localization_support(
    prob_map: np.ndarray,
    mask_arr: np.ndarray,
    manipulation_probability: float,
) -> tuple[bool, str, dict]:
    """
    Compute localization-support analysis from the existing probability map
    and binary mask (0.38 threshold).

    Evaluates:
      - localization_area_fraction
      - max_probability
      - q999, q995, q990
      - largest_connected_component_area_fraction
      - largest_component_bbox_fill
      - number_of_connected_components

    Returns (strong_localization_support, reason, stats_dict).
    """
    flat = prob_map.astype(np.float64).ravel()
    max_p = float(np.max(flat))
    q999 = float(np.percentile(flat, 99.9))
    q995 = float(np.percentile(flat, 99.5))
    q990 = float(np.percentile(flat, 99.0))

    h, w = mask_arr.shape[:2]
    total_px = max(h * w, 1)
    mask_bin = (mask_arr > 0).astype(np.uint8)
    loc_area_frac = float(np.mean(mask_bin))

    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(mask_bin, connectivity=8)
    num_components = int(num_labels - 1)

    if num_components > 0:
        areas = stats[1:, cv2.CC_STAT_AREA]
        largest_idx = 1 + int(np.argmax(areas))
        largest_area = int(stats[largest_idx, cv2.CC_STAT_AREA])
        largest_comp_frac = float(largest_area / total_px)
        bx = int(stats[largest_idx, cv2.CC_STAT_LEFT])
        by = int(stats[largest_idx, cv2.CC_STAT_TOP])
        bw = int(stats[largest_idx, cv2.CC_STAT_WIDTH])
        bh = int(stats[largest_idx, cv2.CC_STAT_HEIGHT])
        bbox_area = max(bw * bh, 1)
        bbox_fill = float(largest_area / bbox_area)
        largest_to_total_ratio = float(largest_area / max(np.sum(mask_bin), 1))
        spans_full_canvas = (bw >= 0.75 * w) or (bh >= 0.75 * h)
    else:
        largest_area = 0
        largest_comp_frac = 0.0
        bbox_fill = 0.0
        largest_to_total_ratio = 0.0
        spans_full_canvas = False

    stats_dict = {
        "localization_area_fraction": loc_area_frac,
        "max_probability": max_p,
        "q999": q999,
        "q995": q995,
        "q990": q990,
        "largest_connected_component_area_fraction": largest_comp_frac,
        "largest_component_bbox_fill": bbox_fill,
        "number_of_connected_components": num_components,
        "largest_to_total_ratio": largest_to_total_ratio,
    }

    # Conservative conditions for strong localization support:
    # 1. High peak probability in anomaly map
    has_high_peak = (max_p >= 0.90) and (q999 >= 0.80)
    # 2. Non-trivial area
    has_non_trivial_area = (loc_area_frac >= 0.01)
    # 3. Compact coherent object component
    has_coherent_component = (largest_comp_frac >= 0.008)
    # 4. Solid bounding-box fill
    has_solid_fill = (bbox_fill >= 0.20)
    # 5. Not diffuse noise scatter: compact object should not be shattered into dozens of noise fragments
    not_diffuse_scatter = (num_components <= 20) and (num_components <= 5 or largest_to_total_ratio >= 0.40)
    # 6. Not full canvas/span saturation when classifier strongly indicates authentic
    not_canvas_saturation = not (manipulation_probability < 0.20 and spans_full_canvas)

    if (
        has_high_peak
        and has_non_trivial_area
        and has_coherent_component
        and has_solid_fill
        and not_diffuse_scatter
        and not_canvas_saturation
    ):
        strong_localization_support = True
        reason = (
            f"Strong compact localized anomaly detected (area={loc_area_frac*100:.1f}%, "
            f"largest_comp={largest_comp_frac*100:.1f}%, q999={q999:.4f}, fill={bbox_fill:.2f})"
        )
    else:
        strong_localization_support = False
        reasons = []
        if not has_high_peak:
            reasons.append(f"peak probability low (max={max_p:.2f}, q999={q999:.2f})")
        if not has_non_trivial_area:
            reasons.append(f"area too small ({loc_area_frac*100:.2f}%)")
        if not has_coherent_component:
            reasons.append(f"no coherent component (largest={largest_comp_frac*100:.2f}%)")
        if not has_solid_fill:
            reasons.append(f"bbox fill low ({bbox_fill:.2f})")
        if not not_diffuse_scatter:
            reasons.append(f"diffuse noise scatter ({num_components} components)")
        if not not_canvas_saturation:
            reasons.append("edge-to-edge canvas saturation on authentic background")
        reason = "; ".join(reasons) if reasons else "No significant localized anomaly"

    return strong_localization_support, reason, stats_dict


def _compute_forensic_manipulation_score(
    manipulation_probability: float,
    strong_localization_support: bool,
    loc_stats: dict,
) -> float:
    """
    Constructs a deterministic combined forensic evidence score from localization diagnostics:
      q_score = clamp(q999, 0, 1)
      component_score = clamp(largest_connected_component_area_fraction / 0.03, 0, 1)
      bbox_score = clamp(largest_component_bbox_fill, 0, 1)
      area_score = clamp(localization_area_fraction / 0.05, 0, 1)

      localization_evidence_score = (
          0.40 * q_score +
          0.25 * component_score +
          0.20 * bbox_score +
          0.15 * area_score
      )

      if strong_localization_support:
          forensic_manipulation_score = max(manipulation_probability, localization_evidence_score)
      else:
          forensic_manipulation_score = manipulation_probability
    """
    q_score = float(np.clip(loc_stats.get("q999", 0.0), 0.0, 1.0))
    component_score = float(np.clip(loc_stats.get("largest_connected_component_area_fraction", 0.0) / 0.03, 0.0, 1.0))
    bbox_score = float(np.clip(loc_stats.get("largest_component_bbox_fill", 0.0), 0.0, 1.0))
    area_score = float(np.clip(loc_stats.get("localization_area_fraction", 0.0) / 0.05, 0.0, 1.0))

    localization_evidence_score = (
        0.40 * q_score +
        0.25 * component_score +
        0.20 * bbox_score +
        0.15 * area_score
    )

    if strong_localization_support:
        return float(max(manipulation_probability, localization_evidence_score))
    return float(manipulation_probability)


def _compute_hybrid_verdict(
    classifier_verdict: str,
    manipulation_probability: float,
    strong_localization_support: bool,
) -> str:
    """
    Final hybrid forensic verdict decision layer.
      A. classifier_verdict == "manipulated" -> manipulated
      B. strong_localization_support == True -> manipulated
      C. otherwise -> use original classifier verdict unchanged
    """
    if classifier_verdict == "manipulated":
        return "manipulated"

    if strong_localization_support:
        return "manipulated"

    if classifier_verdict in ("authenticated", "authentic"):
        return "authentic"

    return classifier_verdict


def _compute_verdict_legacy(
    risk_score: float,
    confidence: float,
    threshold: float = CALIBRATED_IMAGE_THRESHOLD,
) -> str:
    """
    Legacy verdict based on p999 localization score.
    Kept as a fallback when the classifier bundle is not loaded.
    """
    if confidence < 0.30:
        return "inconclusive"
    if risk_score >= threshold:
        return "manipulated"
    return "authentic"


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
            "Provide pixentra_forensic_classifier_bundle.pth in ml_backend/models/."
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

    # ── 3. Extract localization probability map ───────────────────────────────
    if isinstance(out, dict) and "prob" in out:
        prob_t = out["prob"]
    elif isinstance(out, dict) and "logits" in out:
        prob_t = torch.sigmoid(out["logits"])
    elif torch.is_tensor(out):
        prob_t = torch.sigmoid(out)
    else:
        raise RuntimeError(f"Unexpected model output format: {type(out)}")

    prob_map = prob_t[0, 0].detach().float().cpu().numpy()  # (512, 512)

    # ── 4. MPC baseline probability (for mpc_risk_score) ─────────────────────
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

    # ── 5. Binary mask and localization artifacts ─────────────────────────────
    mask_arr = _make_binary_mask(prob_map, original_shape, threshold)
    overlay_arr = _make_heatmap_overlay(img_rgb, prob_map)

    mask_path = MASKS_DIR / f"{analysis_id}_mask.png"
    overlay_path = OVERLAYS_DIR / f"{analysis_id}_overlay.png"

    cv2.imwrite(str(mask_path), mask_arr)
    cv2.imwrite(str(overlay_path), overlay_arr)

    forgery_pixel_fraction = float(np.mean(mask_arr > 0))

    # ── 6. Localization p999 (pixel-level legacy metric, kept for transparency) ─
    p999 = float(np.percentile(prob_map, 99.9))
    proposed_risk_score = float(np.clip(p999, 0.0, 1.0))
    # Spatial entropy confidence (used in legacy verdict path)
    spatial_confidence = _binary_entropy_confidence(prob_map)

    # ── 7. V2 Classifier verdict + Hybrid localization resolution ─────────────
    if models.bundle_loaded and models.classifier is not None:
        feat = build_classifier_features(out)                      # (1, 270)
        raw_logit = models.classifier(feat)[0].item()              # scalar
        manipulation_probability = models.calibrate(raw_logit)    # calibrated [0,1]
        authenticity_probability = 1.0 - manipulation_probability
        prediction_certainty = 2.0 * abs(manipulation_probability - 0.5)

        classifier_verdict = _compute_verdict_v2(
            manipulation_prob=manipulation_probability,
            certainty=prediction_certainty,
            inconclusive_threshold=models.inconclusive_threshold,
        )

        strong_localization_support, loc_reason, loc_stats = _analyze_localization_support(
            prob_map=prob_map,
            mask_arr=mask_arr,
            manipulation_probability=manipulation_probability,
        )

        hybrid_verdict = _compute_hybrid_verdict(
            classifier_verdict=classifier_verdict,
            manipulation_probability=manipulation_probability,
            strong_localization_support=strong_localization_support,
        )

        # Canonical verdict is hybrid_verdict for full backward compatibility
        verdict = hybrid_verdict
        risk_score = manipulation_probability

        forensic_manipulation_score = _compute_forensic_manipulation_score(
            manipulation_probability=manipulation_probability,
            strong_localization_support=strong_localization_support,
            loc_stats=loc_stats,
        )
        forensic_authenticity_score = 1.0 - forensic_manipulation_score

        logger.info(
            "[V2-HYBRID] id=%s classifier_verdict=%s manipulation_probability=%.4f "
            "forensic_manip_score=%.4f forensic_auth_score=%.4f prediction_certainty=%.4f "
            "localization_area=%.4f localization_q999=%.4f "
            "largest_component_fraction=%.4f strong_localization_support=%s hybrid_verdict=%s",
            analysis_id,
            classifier_verdict,
            manipulation_probability,
            forensic_manipulation_score,
            forensic_authenticity_score,
            prediction_certainty,
            forgery_pixel_fraction,
            loc_stats["q999"],
            loc_stats["largest_connected_component_area_fraction"],
            strong_localization_support,
            hybrid_verdict,
        )
    else:
        # ── Legacy path (no classifier bundle) ───────────────────────────────
        verdict = _compute_verdict_legacy(proposed_risk_score, spatial_confidence)
        classifier_verdict = verdict
        hybrid_verdict = verdict
        strong_localization_support = False
        loc_reason = "Legacy path; classifier bundle not loaded"
        manipulation_probability = proposed_risk_score  # best approximation
        forensic_manipulation_score = proposed_risk_score
        forensic_authenticity_score = 1.0 - forensic_manipulation_score
        authenticity_probability = 1.0 - manipulation_probability
        prediction_certainty = spatial_confidence
        risk_score = proposed_risk_score

        logger.info(
            "Legacy Inference — id=%s  p999=%.4f  conf=%.4f  verdict=%s  forgery_px=%.2f%%",
            analysis_id, p999, spatial_confidence, verdict, forgery_pixel_fraction * 100,
        )

    # ── 8. Evidence channel scores ────────────────────────────────────────────
    raw_ev = inputs["raw_evidence"]
    meta_avail = float(inputs["meta_avail"][0].item())
    meta_score = float(np.mean(inputs["meta"][0].cpu().numpy())) if meta_avail > 0 else 0.0

    evidence = EvidenceScores(
        compression=float(np.mean(raw_ev["comp"][0])),
        noise_residual=float(np.mean(raw_ev["freq"][0])),
        frequency_dct=float(np.mean(raw_ev["freq"][1])),
        ela=float(np.mean(raw_ev["ela"][0])),
        local_statistics=float(np.mean(raw_ev["stat"][1])),
        metadata=meta_score,
    )

    localization = LocalizationOutput(
        mask_path=str(mask_path),
        overlay_path=str(overlay_path),
        forgery_pixel_fraction=forgery_pixel_fraction,
    )

    return AnalysisResult(
        verdict=verdict,
        risk_score=round(risk_score, 4),
        proposed_risk_score=round(proposed_risk_score, 4),
        confidence=round(spatial_confidence, 4),
        manipulation_probability=round(manipulation_probability, 4),
        authenticity_probability=round(authenticity_probability, 4),
        prediction_certainty=round(prediction_certainty, 4),
        forensic_manipulation_score=round(forensic_manipulation_score, 4),
        forensic_authenticity_score=round(forensic_authenticity_score, 4),
        classifier_verdict=classifier_verdict,
        hybrid_verdict=hybrid_verdict,
        localization_support=strong_localization_support,
        localization_support_reason=loc_reason,
        localization=localization,
        evidence=evidence,
        mpc_risk_score=round(mpc_risk_score, 4),
        analysis_id=analysis_id,
    )
