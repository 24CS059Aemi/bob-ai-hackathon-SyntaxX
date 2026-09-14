"""
FastAPI application entry point.

Startup sequence:
  1. Create DB tables (if not exist)
  2. Seed data (if DB is empty)
  3. Register all routers
  4. Add CORS middleware for React frontend (dev) / serve static build (prod)
"""

import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from . import models
from .routes import assets, risk, maintenance, crew, bob


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
app.include_router(assets.router)
app.include_router(risk.router)
app.include_router(maintenance.router)
app.include_router(crew.router)
app.include_router(bob.router)


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}


# ── Static frontend (production build) ──────────────────────────────────────
# Vite builds to app/static/:
#   static/index.html
#   static/assets/index-xxx.js
#   static/assets/index-xxx.css
#
# StaticFiles with html=True serves index.html for unknown paths (SPA routing).
# Mounted LAST so API routes take priority.
_STATIC_DIR = Path(__file__).parent / "static"

if _STATIC_DIR.is_dir():
    app.mount("/", StaticFiles(directory=str(_STATIC_DIR), html=True), name="spa")
else:
    @app.get("/", tags=["Health"])
    def root():
        return {
            "service": "Grid Advisor API",
            "version": "1.0.0",
            "status": "running",
            "docs": "/docs",
        }
