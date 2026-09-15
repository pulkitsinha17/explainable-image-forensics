"""
PIXENTRA — preprocessing pipeline.

Implements the exact preprocessing and forensic evidence extraction used by
the authoritative training notebook `final_completed_major_project(1)`.

Evidence extractors:
  1. Compression Evidence (JPEG recompression discrepancy) -> (1, 128, 128)
  2. Frequency / Noise Evidence (Gaussian blur residual + Laplacian) -> (2, 128, 128)
  3. Statistical Evidence (local mean + std) -> (2, 128, 128)
  4. ELA Evidence (Error Level Analysis) -> (1, 128, 128)
  5. Metadata Vector (EXIF tags availability & flags) -> (10,) + available flag
"""
from __future__ import annotations
import io
import logging
from pathlib import Path
from typing import Optional, Tuple, Union

import cv2
import numpy as np
import torch
from PIL import Image, ExifTags

from app.config import INPUT_SIZE

logger = logging.getLogger(__name__)

EVIDENCE_SIZE = 128
METADATA_DIM = 10


# ─────────────────────────────────────────────────────────────────────────────
#  Image loading
# ─────────────────────────────────────────────────────────────────────────────

def load_image_bytes(data: bytes) -> np.ndarray:
    """
    Load raw image bytes → RGB uint8 numpy array (H, W, 3).
    Raises ValueError on failure.
    """
    try:
        img_pil = Image.open(io.BytesIO(data)).convert("RGB")
        return np.array(img_pil, dtype=np.uint8)
    except Exception as exc:
        raise ValueError(f"Cannot decode image: {exc}") from exc


# ─────────────────────────────────────────────────────────────────────────────
#  Forensic Evidence Extraction — verbatim from notebook cells 2 & 7
# ─────────────────────────────────────────────────────────────────────────────

def compute_compression_evidence(
    image_rgb_uint8: np.ndarray, quality: int = 90, target_size: int = EVIDENCE_SIZE
) -> np.ndarray:
    """
    Compression discrepancy map. Returns (1, target_size, target_size) float32 in [0, 1].
    """
    try:
        bgr = cv2.cvtColor(image_rgb_uint8, cv2.COLOR_RGB2BGR)
        ok, enc = cv2.imencode(".jpg", bgr, [int(cv2.IMWRITE_JPEG_QUALITY), quality])
        if not ok:
            raise RuntimeError("JPEG re-encode failed")
        recompressed = cv2.imdecode(enc, cv2.IMREAD_COLOR)
        diff = cv2.absdiff(bgr, recompressed).astype(np.float32)
        ela = diff.mean(axis=2)
        ela = cv2.resize(ela, (target_size, target_size), interpolation=cv2.INTER_AREA)
        lo, hi = ela.min(), ela.max()
        ela = (ela - lo) / (hi - lo + 1e-6)
        return ela.astype(np.float32)[None, ...]
    except Exception:
        return np.zeros((1, target_size, target_size), dtype=np.float32)


def compute_frequency_noise_evidence(
    image_rgb_uint8: np.ndarray, target_size: int = EVIDENCE_SIZE
) -> np.ndarray:
    """
    Frequency and noise residuals. Returns (2, target_size, target_size) float32 in [0, 1].
    channel 0: high-frequency noise residual
    channel 1: Laplacian edge response
    """
    try:
        gray = cv2.cvtColor(image_rgb_uint8, cv2.COLOR_RGB2GRAY).astype(np.float32)
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        residual = np.abs(gray - blurred)
        laplacian = np.abs(cv2.Laplacian(gray, cv2.CV_32F, ksize=3))

        def resize_norm(x: np.ndarray) -> np.ndarray:
            x_res = cv2.resize(x, (target_size, target_size), interpolation=cv2.INTER_AREA)
            lo, hi = x_res.min(), x_res.max()
            return (x_res - lo) / (hi - lo + 1e-6)

        return np.stack([resize_norm(residual), resize_norm(laplacian)], axis=0).astype(np.float32)
    except Exception:
        return np.zeros((2, target_size, target_size), dtype=np.float32)


def compute_statistical_evidence(
    image_rgb_uint8: np.ndarray, target_size: int = EVIDENCE_SIZE, win: int = 8
) -> np.ndarray:
    """
    Statistical inconsistency maps. Returns (2, target_size, target_size) float32 in [0, 1].
    channel 0: local mean map
    channel 1: local std map
    """
    try:
        gray = cv2.cvtColor(image_rgb_uint8, cv2.COLOR_RGB2GRAY).astype(np.float32)
        mean_map = cv2.boxFilter(gray, ddepth=-1, ksize=(win, win))
        sq_mean_map = cv2.boxFilter(gray * gray, ddepth=-1, ksize=(win, win))
        var_map = np.clip(sq_mean_map - mean_map ** 2, 0, None)
        std_map = np.sqrt(var_map)

        def resize_norm(x: np.ndarray) -> np.ndarray:
            x_res = cv2.resize(x, (target_size, target_size), interpolation=cv2.INTER_AREA)
            lo, hi = x_res.min(), x_res.max()
            return (x_res - lo) / (hi - lo + 1e-6)

        return np.stack([resize_norm(mean_map), resize_norm(std_map)], axis=0).astype(np.float32)
    except Exception:
        return np.zeros((2, target_size, target_size), dtype=np.float32)


def compute_ela_evidence(
    image_rgb_uint8: np.ndarray, quality: int = 90, target_size: int = EVIDENCE_SIZE
) -> np.ndarray:
    """
    Error Level Analysis (PIL recompression). Returns (1, target_size, target_size) float32 in [0, 1].
    """
    try:
        image_rgb = np.asarray(image_rgb_uint8).astype(np.uint8)
        original = Image.fromarray(image_rgb).convert("RGB")
        buffer = io.BytesIO()
        original.save(buffer, format="JPEG", quality=quality)
        buffer.seek(0)
        recompressed = Image.open(buffer).convert("RGB")
        recompressed = np.asarray(recompressed).astype(np.float32)
        original_float = image_rgb.astype(np.float32)
        ela = np.abs(original_float - recompressed).mean(axis=2)
        max_value = ela.max()
        if max_value > 0:
            ela = ela / max_value
        if target_size is not None:
            ela = cv2.resize(ela, (target_size, target_size), interpolation=cv2.INTER_LINEAR)
        return ela.astype(np.float32)[None, ...]
    except Exception:
        return np.zeros((1, target_size, target_size), dtype=np.float32)


def extract_metadata_vector(
    image_input: Union[str, Path, bytes, Image.Image, None]
) -> Tuple[np.ndarray, float]:
    """
    Extract 10-dimensional metadata embedding flags + available flag (1.0 or 0.0).
    """
    vec = np.zeros(METADATA_DIM, dtype=np.float32)
    available = 0.0
    try:
        img: Optional[Image.Image] = None
        if isinstance(image_input, (str, Path)):
            img = Image.open(image_input)
        elif isinstance(image_input, bytes):
            img = Image.open(io.BytesIO(image_input))
        elif isinstance(image_input, Image.Image):
            img = image_input

        if img is not None:
            exif = img.getexif()
            if exif is not None and len(exif) > 0:
                tags = {ExifTags.TAGS.get(k, k): v for k, v in exif.items()}
                available = 1.0
                vec[0] = 1.0 if "Make" in tags else 0.0
                vec[1] = 1.0 if "Model" in tags else 0.0
                vec[2] = 1.0 if "Software" in tags else 0.0
                vec[3] = 1.0 if "DateTime" in tags else 0.0
                vec[4] = 1.0 if "Orientation" in tags else 0.0
                vec[5] = 1.0 if ("ExifImageWidth" in tags or "ExifImageHeight" in tags) else 0.0
                vec[6] = 1.0 if any(str(k).lower().startswith("gps") for k in tags) else 0.0
                vec[7] = 1.0 if ("ColorSpace" in tags or "FlashPixVersion" in tags) else 0.0
                vec[8] = float(min(len(tags) / 20.0, 1.0))
                vec[9] = 1.0 if "Compression" in tags else 0.0
    except Exception:
        available = 0.0
        vec = np.zeros(METADATA_DIM, dtype=np.float32)
    return vec, float(available)


# ─────────────────────────────────────────────────────────────────────────────
#  Full preprocessing pipeline
# ─────────────────────────────────────────────────────────────────────────────

def prepare_inference_inputs(
    img_rgb: np.ndarray,
    device: torch.device,
    raw_bytes: Optional[bytes] = None,
    img_path: Optional[Union[str, Path]] = None,
    input_size: int = INPUT_SIZE,
    evidence_size: int = EVIDENCE_SIZE,
) -> dict:
    """
    Prepare all exact input tensors required by StrongMultiEvidenceNet.forward().

    Returns a dict containing:
      - 'image': (1, 3, 512, 512)
      - 'comp': (1, 1, 128, 128)
      - 'freq': (1, 2, 128, 128)
      - 'stat': (1, 2, 128, 128)
      - 'ela': (1, 1, 128, 128)
      - 'meta': (1, 10)
      - 'meta_avail': (1,)
      - 'raw_evidence': dict of raw numpy maps for reporting
    """
    # ── 1. Resize RGB image for model input ────────────────────────────────────
    img_resized = cv2.resize(img_rgb, (input_size, input_size), interpolation=cv2.INTER_LINEAR)
    rgb_f = img_resized.astype(np.float32) / 255.0
    img_tensor = torch.from_numpy(rgb_f).permute(2, 0, 1).unsqueeze(0).to(device)

    # ── 2. Compute evidence maps ──────────────────────────────────────────────
    comp_map = compute_compression_evidence(img_rgb, target_size=evidence_size)
    freq_map = compute_frequency_noise_evidence(img_rgb, target_size=evidence_size)
    stat_map = compute_statistical_evidence(img_rgb, target_size=evidence_size)
    ela_map = compute_ela_evidence(img_rgb, target_size=evidence_size)

    meta_source = raw_bytes if raw_bytes is not None else img_path
    meta_vec, meta_avail = extract_metadata_vector(meta_source)

    # ── 3. Convert to device tensors ──────────────────────────────────────────
    comp_tensor = torch.from_numpy(comp_map).unsqueeze(0).to(device)
    freq_tensor = torch.from_numpy(freq_map).unsqueeze(0).to(device)
    stat_tensor = torch.from_numpy(stat_map).unsqueeze(0).to(device)
    ela_tensor = torch.from_numpy(ela_map).unsqueeze(0).to(device)
    meta_tensor = torch.from_numpy(meta_vec).unsqueeze(0).to(device)
    meta_avail_tensor = torch.tensor([meta_avail], dtype=torch.float32, device=device)

    return {
        "image": img_tensor,
        "comp": comp_tensor,
        "freq": freq_tensor,
        "stat": stat_tensor,
        "ela": ela_tensor,
        "meta": meta_tensor,
        "meta_avail": meta_avail_tensor,
        "raw_evidence": {
            "comp": comp_map,
            "freq": freq_map,
            "stat": stat_map,
            "ela": ela_map,
        },
    }
