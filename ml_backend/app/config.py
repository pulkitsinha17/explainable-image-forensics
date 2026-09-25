"""
PIXENTRA ML Backend — configuration.
All paths and settings are read from environment variables or project-relative defaults.
"""
import os
from pathlib import Path

# ── Root of the ml_backend directory (one level up from this file's package) ──
ML_BACKEND_ROOT = Path(__file__).resolve().parent.parent

# ── Model checkpoints ──────────────────────────────────────────────────────────
MODELS_DIR = ML_BACKEND_ROOT / "models"

# Primary trained checkpoint: StrongMultiEvidenceNet trained on CASIAv2
PROPOSED_CHECKPOINT = Path(
    os.environ.get(
        "PROPOSED_CHECKPOINT",
        str(MODELS_DIR / "best_multi_evidence_stage1.pth"),
    )
)

# MPC foundation backbone checkpoint (CASIAv2 stage-2 weights)
# CATNet weights are also available; prefer CASIAv2 as used by the notebook
MPC_CHECKPOINT = Path(
    os.environ.get(
        "MPC_CHECKPOINT",
        str(MODELS_DIR / "MPC_CASIAv2_stage2_weights.pth"),
    )
)

# Final Kaggle forensic classifier bundle (PIXENTRA_FORGERY_CLASSIFIER_V2)
# Contains: base_model_state_dict, classifier_state_dict, calibrator_coef/intercept, thresholds
FORENSIC_BUNDLE_PATH = Path(
    os.environ.get(
        "PIXENTRA_FORENSIC_BUNDLE_PATH",
        str(MODELS_DIR / "pixentra_forensic_classifier_bundle.pth"),
    )
)

# ── Inference settings ─────────────────────────────────────────────────────────
# Input spatial resolution expected by the trained model and MPC backbone
INPUT_SIZE: int = int(os.environ.get("INPUT_SIZE", "512"))

# Probability threshold for the binary forgery mask (validated on CASIAv2)
# This is PROP_THR from the notebook; default 0.38 (typical after validation search)
FORGERY_THRESHOLD: float = float(os.environ.get("FORGERY_THRESHOLD", "0.38"))

# Image-level decision threshold derived from 400-image calibration experiment (p999 >= 0.995)
# (Legacy / localization-only path — superseded by the classifier bundle when available)
CALIBRATED_IMAGE_THRESHOLD: float = float(os.environ.get("CALIBRATED_IMAGE_THRESHOLD", "0.995"))

# Confidence threshold below which a verdict is INCONCLUSIVE.
# conf = 2 * |manipulation_prob - 0.5|; loaded from bundle at startup; overridable via env.
# Bundle value: 0.5851
INCONCLUSIVE_CONFIDENCE_THRESHOLD: float = float(
    os.environ.get("INCONCLUSIVE_CONFIDENCE_THRESHOLD", "0.5851")
)

# ── Upload / file handling ─────────────────────────────────────────────────────
MAX_UPLOAD_MB: int = int(os.environ.get("MAX_UPLOAD_MB", "10"))
MAX_UPLOAD_BYTES: int = MAX_UPLOAD_MB * 1024 * 1024

ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/tiff",
}

# ── Output directories ─────────────────────────────────────────────────────────
OUTPUTS_DIR = ML_BACKEND_ROOT / "outputs"
MASKS_DIR = OUTPUTS_DIR / "masks"
OVERLAYS_DIR = OUTPUTS_DIR / "overlays"
