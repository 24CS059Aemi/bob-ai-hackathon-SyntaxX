"""
FastAPI application entry point.

Startup sequence:
  1. Create DB tables (if not exist)
  2. Seed data (if DB is empty)
  3. Register all routers
  4. Add CORS middleware for React frontend (dev) / serve static build (prod)
"""

import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from . import models
from .routes import assets, risk, maintenance, crew, bob

app = FastAPI(
    title="Power Outage Prediction & Grid Equipment Failure Advisor",
    description=(
        "AI-powered grid intelligence platform that combines asset health sensor data, "
        "weather forecasts, and historical incident records to predict outage-prone areas "
        "and generate prioritised maintenance and crew pre-positioning plans."
    ),
    version="1.0.0",
)

# CORS — allow React dev server in development; in production the frontend is
# served from the same origin so CORS is not needed, but we keep it permissive.
_CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    """Create tables, seed database, then start live data simulator."""
    from .database import engine
    from .data.seed import seed
    from .data.live_simulator import start_live_simulator
    models.Base.metadata.create_all(bind=engine)
    seed()
    start_live_simulator()


# Register API routers
app.include_router(assets.router)
app.include_router(risk.router)
app.include_router(maintenance.router)
app.include_router(crew.router)
app.include_router(bob.router)


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}


# ── Static frontend (production build) ──────────────────────────────────────
# Mounted AFTER API routes so /assets, /risk, etc. are never shadowed.
_STATIC_DIR = Path(__file__).parent / "static"

if _STATIC_DIR.is_dir():
    # Serve JS/CSS/assets from /static sub-path
    app.mount("/static", StaticFiles(directory=_STATIC_DIR / "assets" if (_STATIC_DIR / "assets").is_dir() else _STATIC_DIR), name="vite-assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    def serve_spa(full_path: str):
        """Catch-all: serve index.html for client-side routing."""
        index = _STATIC_DIR / "index.html"
        return FileResponse(str(index))
else:
    # Development fallback — JSON root response
    @app.get("/", tags=["Health"])
    def root():
        return {
            "service": "Grid Advisor API",
            "version": "1.0.0",
            "status": "running",
            "docs": "/docs",
        }
