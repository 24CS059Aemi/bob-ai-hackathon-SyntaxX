"""
FastAPI application entry point.

Startup sequence:
  1. Create DB tables (if not exist)
  2. Seed data (if DB is empty)
  3. Register all routers
  4. Add CORS middleware for React frontend (dev) / serve static build (prod)
"""

import os
import mimetypes
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from . import models
from .routes import assets, risk, maintenance, crew, bob, auth

# Resolve static dir early — used by both debug endpoint and spa_fallback
_STATIC_DIR = Path(__file__).parent / "static"


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create tables, seed database, then start live data simulator."""
    from .database import engine
    from .data.seed import seed
    from .data.live_simulator import start_live_simulator
    models.Base.metadata.create_all(bind=engine)
    seed()
    start_live_simulator()
    yield  # application runs here


app = FastAPI(
    title="Power Outage Prediction & Grid Equipment Failure Advisor",
    description=(
        "AI-powered grid intelligence platform that combines asset health sensor data, "
        "weather forecasts, and historical incident records to predict outage-prone areas "
        "and generate prioritised maintenance and crew pre-positioning plans."
    ),
    version="1.0.0",
    lifespan=lifespan,
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


# Register API routers
app.include_router(auth.router)
app.include_router(assets.router)
app.include_router(risk.router)
app.include_router(maintenance.router)
app.include_router(crew.router)
app.include_router(bob.router)


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}


@app.get("/debug-static", include_in_schema=False)
def debug_static():
    """Show what files are in the static dir on the server — used for debugging."""
    files = []
    if _STATIC_DIR.is_dir():
        for root, dirs, fs in os.walk(str(_STATIC_DIR)):
            for f in fs:
                full = os.path.join(root, f)
                files.append(full.replace(str(_STATIC_DIR), ""))
    return {"static_dir": str(_STATIC_DIR), "exists": _STATIC_DIR.is_dir(), "files": files}


# ── Static frontend (production build) ──────────────────────────────────────
# Vite builds to app/static/:
#   static/index.html
#   static/_app/index-xxx.js   (assetsDir="_app" avoids clash with /assets API)
#   static/_app/index-xxx.css
#
# A catch-all GET route serves files by exact path or falls back to index.html.
# No StaticFiles mount — avoids FastAPI sub-path 404 issues.

if _STATIC_DIR.is_dir():
    @app.get("/{full_path:path}", include_in_schema=False)
    def spa_fallback(full_path: str):
        """Serve static files by exact path, fallback to index.html for SPA routing."""
        clean = full_path.lstrip("/")
        candidate = _STATIC_DIR / clean if clean else _STATIC_DIR / "index.html"

        if candidate.is_file():
            mime, _ = mimetypes.guess_type(str(candidate))
            return FileResponse(str(candidate), media_type=mime or "application/octet-stream")

        return FileResponse(str(_STATIC_DIR / "index.html"), media_type="text/html")
else:
    @app.get("/", tags=["Health"])
    def root():
        return {
            "service": "Grid Advisor API",
            "version": "1.0.0",
            "status": "running",
            "docs": "/docs",
        }
