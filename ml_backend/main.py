"""
PIXENTRA ML Backend — Vercel entrypoint re-export.
Exposes the FastAPI application instance from app.main.
"""
from app.main import app

__all__ = ["app"]
