"""
PIXENTRA ML Backend — FastAPI application.

Endpoints:
    GET  /health          — model and service health
    POST /analyze         — single-image forensics analysis
"""
from __future__ import annotations
import logging
import os
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import (
    ALLOWED_CONTENT_TYPES,
    MAX_UPLOAD_BYTES,
    MPC_CHECKPOINT,
    PROPOSED_CHECKPOINT,
    FORENSIC_BUNDLE_PATH,
)
from app.inference.model_loader import load_all_models, LoadedModels
from app.inference.pipeline import run_inference
from app.inference.preprocessor import load_image_bytes
from app.schemas import AnalysisResponse, ErrorResponse, HealthResponse

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
#  Application lifespan — model loading at startup
# ─────────────────────────────────────────────────────────────────────────────

_models: Optional[LoadedModels] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _models
    _models = load_all_models()
    yield
    # Clean shutdown (nothing to do for pure PyTorch)


# ─────────────────────────────────────────────────────────────────────────────
#  FastAPI app
# ─────────────────────────────────────────────────────────────────────────────

# ─────────────────────────────────────────────────────────────────────────────
#  Inter-service authentication
#  Set PIXENTRA_INTERNAL_SECRET in the FastAPI process environment.
#  The Next.js side sends the same value in X-Internal-Secret header.
#  In development, if not set, a warning is logged and auth is skipped.
# ─────────────────────────────────────────────────────────────────────────────

_INTERNAL_SECRET: Optional[str] = os.environ.get("PIXENTRA_INTERNAL_SECRET") or None

if _INTERNAL_SECRET is None:
    logger.warning(
        "[SECURITY] PIXENTRA_INTERNAL_SECRET is not set. "
        "/analyze has NO inter-service authentication. "
        "Set this in production to prevent unauthorized access."
    )


def _verify_internal_secret(request: Request) -> None:
    """Verify X-Internal-Secret header. Skips in dev when secret is unset."""
    if _INTERNAL_SECRET is None:
        return  # dev mode — skip
    import hmac
    provided = request.headers.get("X-Internal-Secret", "")
    if not hmac.compare_digest(provided, _INTERNAL_SECRET):
        logger.warning(
            "[SECURITY] Rejected %s — invalid X-Internal-Secret",
            request.url.path,
        )
        raise HTTPException(status_code=403, detail="Forbidden")


app = FastAPI(
    title="PIXENTRA ML Backend",
    version="1.0.0",
    description=(
        "Image forensics inference service for PIXENTRA. "
        "Runs StrongMultiEvidenceNet (ResNet34 FPN + 5-channel evidence + MPC prior)."
    ),
    lifespan=lifespan,
    # Disable Swagger/ReDoc in production
    docs_url=None if os.environ.get("ENVIRONMENT") == "production" else "/docs",
    redoc_url=None if os.environ.get("ENVIRONMENT") == "production" else "/redoc",
)

# CORS — only the Next.js frontend origin(s); never "*" with credentials
_allowed_origins = os.environ.get(
    "CORS_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in _allowed_origins],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "X-Internal-Secret"],
)


# ─────────────────────────────────────────────────────────────────────────────
#  Exception handlers
# ─────────────────────────────────────────────────────────────────────────────

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Log full exception server-side — never expose internal details to client
    logger.error("Unhandled exception on %s: %s", request.url.path, exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(error="An internal error occurred. Please try again.").model_dump(),
    )


# ─────────────────────────────────────────────────────────────────────────────
#  Endpoints
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/health", tags=["health"])
async def health():
    """Return minimal liveness status. Does NOT expose internal paths or device info."""
    return {
        "status": "ok",
        "model_loaded": _models is not None and _models.proposed_loaded,
        "mpc_loaded": _models is not None and _models.mpc_loaded,
        "bundle_loaded": _models is not None and _models.bundle_loaded,
    }


@app.post("/analyze", response_model=AnalysisResponse, tags=["inference"])
async def analyze(
    request: Request,
    file: UploadFile = File(..., description="Image file to analyse (JPEG / PNG / WebP)"),
    analysis_id: Optional[str] = Form(
        None,
        description="Optional analysis ID (MongoDB ObjectId hex string).",
    ),
    user_id: Optional[str] = Form(
        None,
        description="Optional Clerk user ID for user-scoped S3 storage.",
    ),
):
    """
    Run image forgery detection on the uploaded image.

    Returns verdict, risk score, confidence, per-evidence scores, and
    paths to the binary mask and heatmap overlay.
    """
    # ── Guard: inter-service authentication ───────────────────────────────────
    _verify_internal_secret(request)

    # ── Guard: model must be loaded ───────────────────────────────────────────
    if _models is None or not _models.proposed_loaded:
        raise HTTPException(
            status_code=503,
            detail="Model not ready. Please try again later.",
        )

    # ── Content-type validation ────────────────────────────────────────────────
    ct = file.content_type or ""
    if ct and ct not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported media type: {ct!r}. Allowed: {sorted(ALLOWED_CONTENT_TYPES)}",
        )

    # ── Read and size-check the upload ─────────────────────────────────────────
    raw = await file.read()
    if len(raw) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File too large: {len(raw) / 1_048_576:.1f} MB. Max {MAX_UPLOAD_BYTES // 1_048_576} MB.",
        )

    # ── Decode image ──────────────────────────────────────────────────────────
    try:
        img_rgb = load_image_bytes(raw)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    # ── Run inference ─────────────────────────────────────────────────────────
    try:
        result = run_inference(
            img_rgb=img_rgb,
            models=_models,
            analysis_id=analysis_id,
            user_id=user_id,
            raw_bytes=raw,
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        logger.error("Inference failed: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail="Inference failed. Please try again.") from exc

    return AnalysisResponse(success=True, analysis=result)
