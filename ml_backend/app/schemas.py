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
    device: str
    proposed_checkpoint: str
    mpc_checkpoint: str


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
    noise_residual: float       # channel 1 in EvidenceEncoder input
    frequency_dct: float        # channel 2
    ela: float                  # channel 3
    local_statistics: float     # channel 4


class AnalysisResult(BaseModel):
    verdict: str                        # "forged" | "authentic" | "inconclusive"
    risk_score: float                   # 0.0 – 1.0  (overall forgery risk derived from proposed model)
    proposed_risk_score: float          # 0.0 – 1.0  (StrongMultiEvidenceNet proposed model risk score)
    confidence: float                   # 1 – entropy (higher = more certain)
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
