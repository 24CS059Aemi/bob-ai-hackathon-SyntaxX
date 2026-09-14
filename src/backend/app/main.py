"""
FastAPI application entry point.

Startup sequence:
  1. Create DB tables (if not exist)
  2. Seed data (if DB is empty)
  3. Register all routers
  4. Add CORS middleware for React frontend
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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

# CORS — allow React dev server on port 3000 and 5173 (Vite default)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    """Create tables and seed database with synthetic data on first run."""
    from .database import engine
    from .data.seed import seed
    models.Base.metadata.create_all(bind=engine)
    seed()


# Register routers
app.include_router(assets.router)
app.include_router(risk.router)
app.include_router(maintenance.router)
app.include_router(crew.router)
app.include_router(bob.router)


@app.get("/", tags=["Health"])
def root():
    return {
        "service": "Grid Advisor API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}
