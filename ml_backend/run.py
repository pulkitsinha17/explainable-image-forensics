#!/usr/bin/env python3
"""
PIXENTRA ML Backend — development startup entry point.
Run from the ml_backend directory:
    python run.py
Or from the project root:
    python ml_backend/run.py
"""
import sys
import os
from pathlib import Path

# Ensure ml_backend is importable as the package root
_HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(_HERE))

# Optional: load .env file if present
try:
    from dotenv import load_dotenv
    load_dotenv(_HERE / ".env")
except ImportError:
    pass  # python-dotenv is optional

import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=int(os.environ.get("ML_BACKEND_PORT", "8001")),
        reload=os.environ.get("ML_BACKEND_RELOAD", "false").lower() == "true",
        log_level="info",
        app_dir=str(_HERE),
    )
