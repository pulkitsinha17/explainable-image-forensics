"""
PIXENTRA — preprocessing pipeline.

Implements the exact preprocessing used by the training notebook:

1. RGB preprocessing for the ResNet34 backbone:
   - Resize to 512×512 (INTER_LINEAR)
   - Divide by 255 → float32 in [0, 1]
   - Transpose to (C, H, W) and add batch dim

2. Evidence extraction — verbatim from notebook cell 12 (evidence_from_image):
   - Noise residual  : |gray - GaussianBlur(gray, 5, 0)|
   - Frequency/DCT   : mean high-frequency energy of 8×8 DCT blocks
   - ELA             : |original - JPEG-recompressed (quality=90)| → grayscale
   - Local stats     : local std in 11×11 window

3. MPC probability map — forward pass through frozen MPC backbone on the
   512×512 RGB tensor, with flip-TTA (original, H-flip, V-flip, HV-flip).

All evidence channels are normalised to [0, 1] with norm01 (1st–99th percentile).
"""
from __future__ import annotations
import logging
from io import BytesIO
from typing import Optional

import cv2
import numpy as np
import torch
from PIL import Image

from app.config import INPUT_SIZE

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
#  Normalisation helper — exact copy from notebook cell 12
# ─────────────────────────────────────────────────────────────────────────────

def norm01(x: np.ndarray) -> np.ndarray:
    x = x.astype(np.float32)
    lo = np.percentile(x, 1)
    hi = np.percentile(x, 99)
    if hi - lo < 1e-6:
        return np.zeros_like(x, dtype=np.float32)
    return np.clip((x - lo) / (hi - lo), 0.0, 1.0).astype(np.float32)


# ─────────────────────────────────────────────────────────────────────────────
#  Image loading
# ─────────────────────────────────────────────────────────────────────────────

def load_image_bytes(data: bytes) -> np.ndarray:
    """
    Load raw image bytes → RGB uint8 numpy array (H, W, 3).
    Raises ValueError on failure.
    """
    try:
        img_pil = Image.open(BytesIO(data)).convert("RGB")
        return np.array(img_pil, dtype=np.uint8)
    except Exception as exc:
        raise ValueError(f"Cannot decode image: {exc}") from exc


# ─────────────────────────────────────────────────────────────────────────────
#  Evidence computation — verbatim from notebook cell 12
# ─────────────────────────────────────────────────────────────────────────────

def evidence_from_image(img_rgb: np.ndarray) -> np.ndarray:
    """
    Compute the 4-channel hand-crafted evidence array from an RGB image.

    Returns: float32 ndarray of shape (4, H, W)
        channel 0 — noise residual
        channel 1 — frequency / DCT high-frequency energy
        channel 2 — ELA (error level analysis)
        channel 3 — local statistical inconsistency
    """
    gray = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY).astype(np.float32) / 255.0

    # ── Noise / residual ───────────────────────────────────────────────────────
    blur = cv2.GaussianBlur(gray, (5, 5), 0)
    noise = norm01(np.abs(gray - blur))

    # ── Frequency / DCT ───────────────────────────────────────────────────────
    h, w = gray.shape
    freq = np.zeros_like(gray, np.float32)
    weight = np.zeros_like(gray, np.float32)
    for y in range(0, h - 7, 8):
        for x in range(0, w - 7, 8):
            block = gray[y : y + 8, x : x + 8]
            d = cv2.dct(block)
            e = np.abs(d)
            e[0:2, 0:2] = 0  # suppress DC and near-DC
            val = float(np.mean(e))
            freq[y : y + 8, x : x + 8] += val
            weight[y : y + 8, x : x + 8] += 1
    freq = np.divide(freq, np.maximum(weight, 1), where=weight > 0)
    freq = norm01(freq)

    # ── ELA — recompression discrepancy ──────────────────────────────────────
    bgr = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2BGR)
    ok, enc = cv2.imencode(".jpg", bgr, [int(cv2.IMWRITE_JPEG_QUALITY), 90])
    if ok:
        rec = cv2.imdecode(enc, cv2.IMREAD_COLOR)
        rec = cv2.cvtColor(rec, cv2.COLOR_BGR2RGB)
        ela = norm01(
            cv2.cvtColor(cv2.absdiff(img_rgb, rec), cv2.COLOR_RGB2GRAY).astype(np.float32)
        )
    else:
        ela = np.zeros_like(gray, dtype=np.float32)

    # ── Local statistical inconsistency ───────────────────────────────────────
    mean = cv2.blur(gray, (11, 11))
    sq = cv2.blur(gray * gray, (11, 11))
    var = np.maximum(sq - mean * mean, 0)
    stats = norm01(np.sqrt(var + 1e-6))

    return np.stack([noise, freq, ela, stats], axis=0).astype(np.float32)


# ─────────────────────────────────────────────────────────────────────────────
#  MPC inference (frozen backbone, flip-TTA)
# ─────────────────────────────────────────────────────────────────────────────

@torch.no_grad()
def mpc_prob_tta(img_rgb: np.ndarray, mpc_model, device: torch.device) -> np.ndarray:
    """
    Run MPC backbone with 4-way flip TTA.
    Matches notebook cell for mpc_prob_tta.

    img_rgb: (H, W, 3) uint8 or float32 — will be resized to 512×512
    Returns: float32 (128, 128) probability map in [0, 1]
    """
    rgb = img_rgb.astype(np.float32) / 255.0 if img_rgb.dtype != np.float32 else img_rgb
    rgb = cv2.resize(rgb, (512, 512), interpolation=cv2.INTER_LINEAR)

    variants = [
        rgb,
        np.flip(rgb, 1).copy(),       # horizontal
        np.flip(rgb, 0).copy(),       # vertical
        np.flip(np.flip(rgb, 1), 0).copy(),  # HV
    ]
    preds = []
    for j, v in enumerate(variants):
        t = torch.from_numpy(v).permute(2, 0, 1).unsqueeze(0).to(device)
        y = mpc_model(t)
        if isinstance(y, (tuple, list)):
            y = y[0]
        p = torch.sigmoid(y).squeeze().float().cpu().numpy()
        # flip back
        if j == 1:
            p = np.flip(p, 1).copy()
        elif j == 2:
            p = np.flip(p, 0).copy()
        elif j == 3:
            p = np.flip(np.flip(p, 1), 0).copy()
        preds.append(p)

    return np.mean(preds, axis=0).astype(np.float32)


# ─────────────────────────────────────────────────────────────────────────────
#  Full preprocessing pipeline
# ─────────────────────────────────────────────────────────────────────────────

def build_inference_tensors(
    img_rgb: np.ndarray,
    mpc_model: Optional[object],
    device: torch.device,
    input_size: int = INPUT_SIZE,
) -> tuple[torch.Tensor, torch.Tensor, np.ndarray]:
    """
    Build the (rgb_tensor, evidence_tensor) pair expected by StrongMultiEvidenceNet.forward().

    Returns
    -------
    rgb_t      : (1, 3, input_size, input_size) float32 tensor in [0, 1]
    ev_t       : (1, 5, input_size, input_size) float32 tensor
                 channel 0 = MPC prior (zeros if MPC unavailable)
                 channels 1-4 = hand-crafted evidence
    mpc_map    : (input_size, input_size) float32 numpy array (for reporting)
    """
    # ── Resize for model input ────────────────────────────────────────────────
    img_resized = cv2.resize(img_rgb, (input_size, input_size), interpolation=cv2.INTER_LINEAR)

    # ── RGB tensor ────────────────────────────────────────────────────────────
    rgb_f = img_resized.astype(np.float32) / 255.0
    rgb_t = torch.from_numpy(rgb_f).permute(2, 0, 1).unsqueeze(0).to(device)  # (1, 3, H, W)

    # ── Evidence channels ─────────────────────────────────────────────────────
    # Computed at native resolution then resized — consistent with notebook's
    # train-time procedure: "resize first, then stack"
    ev_raw = evidence_from_image(img_resized)  # (4, H, W) already at input_size

    # ── MPC prior (channel 0) ─────────────────────────────────────────────────
    if mpc_model is not None:
        try:
            mpc_map = mpc_prob_tta(img_resized, mpc_model, device)
            # MPC output is 128×128; resize to input_size
            if mpc_map.shape != (input_size, input_size):
                mpc_map = cv2.resize(
                    mpc_map, (input_size, input_size), interpolation=cv2.INTER_LINEAR
                )
        except Exception as exc:
            logger.warning("MPC forward pass failed: %s — using zero prior", exc)
            mpc_map = np.zeros((input_size, input_size), dtype=np.float32)
    else:
        mpc_map = np.zeros((input_size, input_size), dtype=np.float32)

    # Assemble 5-channel evidence: [mpc, noise, freq, ela, stats]
    ev_full = np.concatenate([mpc_map[np.newaxis], ev_raw], axis=0)  # (5, H, W)
    ev_t = torch.from_numpy(ev_full).unsqueeze(0).to(device)  # (1, 5, H, W)

    return rgb_t, ev_t, mpc_map
