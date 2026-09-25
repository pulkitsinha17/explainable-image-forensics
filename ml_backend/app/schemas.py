"""
PIXENTRA ML Backend — Pydantic response schemas.
"""
from __future__ import annotations
from pydantic import BaseModel
from typing import Optional, Dict, Any


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    mpc_loaded: bool
    bundle_loaded: bool         # True when the full V2 classifier bundle is loaded
    device: str
    proposed_checkpoint: str
    mpc_checkpoint: str
    bundle_path: str


class LocalizationOutput(BaseModel):
    """
    Web-friendly localization results.
    Raw tensors are NOT returned; only derived artifacts and summary statistics.
    """
    mask_path: Optional[str] = None       # path or URL to the binary mask PNG
    overlay_path: Optional[str] = None   # path or URL to the heatmap overlay PNG
    forgery_pixel_fraction: float         # fraction of pixels predicted as forged


class EvidenceScores(BaseModel):
    """
    Per-channel evidence summary scores normalised to [0, 1].
    These are spatial means of the evidence maps, not arbitrary weights.
    """
    compression: float = 0.0    # channel 0 in comp evidence (compression artifact residual)
    noise_residual: float       # channel 0 in freq evidence (Gaussian-blur residual)
    frequency_dct: float        # channel 1 in freq evidence (Laplacian/frequency response)
    ela: float                  # channel 0 in ela evidence (Error Level Analysis)
    local_statistics: float     # channel 1 in stat evidence (local std dev)
    metadata: float = 0.0       # metadata vector mean score (0.0 if metadata not available)


class AnalysisResult(BaseModel):
    verdict: str                        # "manipulated" | "authentic" | "inconclusive"
    risk_score: float                   # backwards-compat alias for manipulation_probability
    proposed_risk_score: float          # StrongMultiEvidenceNet localization p999 (pixel-level)
    confidence: float                   # 1 – entropy of localization map (spatial certainty)
    # ── Classifier-based image-level fields (PIXENTRA_FORGERY_CLASSIFIER_V2) ──
    manipulation_probability: float     # 0.0–1.0 calibrated probability of manipulation
    authenticity_probability: float     # 1.0 - manipulation_probability
    prediction_certainty: float         # 2*|manipulation_prob - 0.5|; 0=uncertain, 1=certain
    # ── Forensic evidence score & Hybrid resolution fields ─────────────────────
    forensic_manipulation_score: float                # 0.0–1.0 fused deterministic forensic evidence score
    forensic_authenticity_score: float                # 1.0 - forensic_manipulation_score
    classifier_verdict: Optional[str] = None          # original classifier verdict before hybrid resolution
    hybrid_verdict: Optional[str] = None              # final hybrid verdict (also assigned to verdict for full compat)
    localization_support: Optional[bool] = None       # whether strong compact localization support was detected
    localization_support_reason: Optional[str] = None  # human-readable explanation of localization support
    # ─────────────────────────────────────────────────────────────────────────
    localization: LocalizationOutput
    evidence: EvidenceScores
    mpc_risk_score: float              # raw MPC backbone baseline output (before fusion)
    analysis_id: str                   # UUID for this request


class AnalysisResponse(BaseModel):
    success: bool
    analysis: Optional[AnalysisResult] = None
    error: Optional[str] = None


class ErrorResponse(BaseModel):
    success: bool = False
    error: str
