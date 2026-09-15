# PIXENTRA ML Backend

FastAPI service for image forgery detection using **StrongMultiEvidenceNet** — a ResNet34 multi-scale FPN fused with a 5-channel hand-crafted evidence encoder and a frozen MPC backbone prior.

## Architecture

```
ml_backend/
├── app/
│   ├── main.py               # FastAPI app — endpoints: GET /health, POST /analyze
│   ├── config.py             # All settings (paths, thresholds, env vars)
│   ├── schemas.py            # Pydantic request/response models
│   └── inference/
│       ├── model_arch.py     # StrongMultiEvidenceNet (verbatim from notebook)
│       ├── model_loader.py   # Checkpoint loading logic (matches notebook cell 4/17)
│       ├── preprocessor.py   # Preprocessing pipeline (verbatim from notebook cell 12)
│       └── pipeline.py       # Full inference run: preprocess → forward → postprocess
├── models/                   # Checkpoint files (NOT committed to git)
│   ├── best_multi_evidence_stage1.pth   ← PRIMARY (must download from Kaggle)
│   ├── MPC_CASIAv2_stage2_weights.pth  ← MPC backbone
│   └── MPC_CATNet_stage2_weights.pth   ← alternate MPC backbone
├── HRFormer/                 # MPC backbone source (copied from MPC-main)
├── decoder_head.py           # MPC decoder head (copied from MPC-main)
├── outputs/
│   ├── masks/                # Binary forgery mask PNGs
│   └── overlays/             # JET heatmap overlay PNGs
├── requirements.txt
├── run.py                    # Development startup script
└── README.md
```

## Setup

### 1. Install Python

Download Python 3.10+ from https://www.python.org/downloads/ (Windows installer).  
Check "Add Python to PATH" during installation.

### 2. Create and activate a virtual environment

```powershell
cd ml_backend
python -m venv .venv
.venv\Scripts\activate
```

### 3. Install dependencies

**CPU-only** (no GPU):
```powershell
pip install -r requirements.txt
```

**GPU (CUDA 12.x)** — recommended for production speed:
```powershell
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
pip install -r requirements.txt
```

### 4. Download the trained checkpoint

The file `best_multi_evidence_stage1.pth` must be downloaded from your Kaggle notebook output.

The copy in `models/best_multi_evidence_stage1.pth` is currently 0 bytes (the Download was a placeholder).

**Steps:**
1. Go to your Kaggle notebook → Output tab
2. Download `proposed_strong_best.pth` (the actual saved checkpoint from cell 16)
3. Rename it to `best_multi_evidence_stage1.pth`
4. Place it in `ml_backend/models/`

### 5. Run the service

```powershell
# From the project root (explainable-image-forensics/)
python ml_backend/run.py
```

The service starts on **http://localhost:8001**.

### 6. Verify

```powershell
curl http://localhost:8001/health
```

Expected response:
```json
{
  "status": "ok",
  "model_loaded": true,
  "mpc_loaded": true,
  "device": "cpu",
  ...
}
```

## API Endpoints

### `GET /health`
Returns service health and model load status.

### `POST /analyze`
Accepts a multipart form with:
- `file`: image file (JPEG / PNG / WebP / TIFF, max 10 MB)
- `analysis_id` (optional): MongoDB document ID

Returns:
```json
{
  "success": true,
  "analysis": {
    "verdict": "forged",
    "risk_score": 0.71,
    "confidence": 0.83,
    "mpc_risk_score": 0.64,
    "localization": {
      "mask_path": "...",
      "overlay_path": "...",
      "forgery_pixel_fraction": 0.34
    },
    "evidence": {
      "noise_residual": 0.12,
      "frequency_dct": 0.08,
      "ela": 0.24,
      "local_statistics": 0.17
    },
    "analysis_id": "..."
  }
}
```

## Next.js Integration

The Next.js frontend calls the ML backend indirectly through two new API routes:

| Route | Purpose |
|---|---|
| `POST /api/analyze/record` | Create MongoDB document, get analysisId |
| `POST /api/analyze/run` | Download from S3, call FastAPI, save result |

Add to `.env.local`:
```
ML_BACKEND_URL=http://localhost:8001
```

## Model Architecture Summary

| Component | Detail |
|---|---|
| RGB backbone | ResNet34 (pretrained ImageNet) |
| Evidence encoder | 4-level CNN on 5-channel evidence |
| Fusion | Multi-scale FPN (4 scales) |
| Gate | Spatial softmax attention |
| Prior | Frozen MPC backbone probability map |
| Input size | 512 × 512 |
| Evidence channels | MPC prior · Noise residual · Frequency/DCT · ELA · Local statistics |
| Training data | CASIA v2 (700 train / 200 val / 300 test) |
| Save key | `model_state_dict` in checkpoint dict |
