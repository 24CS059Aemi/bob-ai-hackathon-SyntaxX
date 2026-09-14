"""
Live Data Simulator — runs as a background thread after startup.

Every 6 minutes (configurable via LIVE_INTERVAL_SECONDS env var) it:
  1. Generates a fresh sensor reading for every asset
  2. Inserts it into the database
  3. Refreshes today's weather forecast for all zones

This makes the dashboard truly live — risk scores, trends, and sparklines
update automatically without restarting the server.
"""

import os
import threading
import random
import logging
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from ..database import SessionLocal
from .. import models
from ..data.generator import ASSETS, ASSET_RISK_PROFILE, ZONE_WEATHER_PROFILE, _sensor_value

logger = logging.getLogger("grid_advisor.live")

# How often to generate a new sensor reading per asset (default: every 6 minutes)
LIVE_INTERVAL_SECONDS = int(os.getenv("LIVE_INTERVAL_SECONDS", "360"))

# Each call to the simulator uses a slightly different random seed
# so readings vary naturally over time
_sim_counter = 0


def _generate_live_reading(asset: dict, rng: random.Random) -> dict:
    """Generate one live sensor reading for an asset."""
    aid = asset["asset_id"]
    base = ASSET_RISK_PROFILE[aid]

    # Add a small random walk so sensors drift naturally over time
    drift = rng.uniform(-0.02, 0.03)   # slight upward bias = degradation
    effective_risk = min(1.0, max(0.0, base + drift))

    return {
        "asset_id": aid,
        "timestamp": datetime.now(timezone.utc).replace(tzinfo=None),
        "temperature_c":         _sensor_value(effective_risk, rng, 60, 75, 85, 105),
        "vibration_mms":         _sensor_value(effective_risk, rng, 0.5, 2.0, 3.5, 6.0),
        "partial_discharge_pc":  _sensor_value(effective_risk, rng, 10, 50, 150, 250),
        "oil_quality_index":     round(100 - _sensor_value(effective_risk, rng, 0, 25, 40, 60), 2),
        "load_percent":          _sensor_value(effective_risk, rng, 40, 80, 85, 98),
    }


def _generate_live_weather(zone: str, rng: random.Random) -> dict:
    """Generate a fresh weather forecast row for today."""
    wprofile = ZONE_WEATHER_PROFILE[zone]
    wp = min(1.0, max(0.0, wprofile + rng.uniform(-0.08, 0.08)))
    today = datetime.now(timezone.utc).date().isoformat()
    return {
        "zone": zone,
        "forecast_date": today,
        "wind_speed_kmh":    round(10 + wp * 90 + rng.uniform(-5, 5), 1),
        "rainfall_mm_hr":    round(wp * 25 + rng.uniform(-2, 2), 1),
        "temp_deviation_c":  round(wp * 8 - 2 + rng.uniform(-1, 1), 1),
        "lightning_risk":    round(min(10, wp * 10 + rng.uniform(-0.5, 0.5)), 1),
        "weather_risk_index": round(min(1.0, wp), 3),
    }


def _run_live_cycle():
    """Insert one live sensor reading per asset + refresh today's weather."""
    global _sim_counter
    _sim_counter += 1
    rng = random.Random(hash(datetime.now(timezone.utc).isoformat()) ^ _sim_counter)

    db: Session = SessionLocal()
    try:
        inserted = 0
        for asset in ASSETS:
            reading = _generate_live_reading(asset, rng)
            db.add(models.SensorReading(**reading))
            inserted += 1

        # Refresh today's weather — delete old today rows first, then insert fresh
        today = datetime.now(timezone.utc).date().isoformat()
        db.query(models.WeatherForecast).filter(
            models.WeatherForecast.forecast_date == today
        ).delete()
        zones = set(a["zone"] for a in ASSETS)
        for zone in zones:
            db.add(models.WeatherForecast(**_generate_live_weather(zone, rng)))

        db.commit()
        logger.info(f"[Live Simulator] Cycle #{_sim_counter}: inserted {inserted} readings + refreshed weather for {len(zones)} zones")
    except Exception as e:
        logger.error(f"[Live Simulator] Error in cycle #{_sim_counter}: {e}")
        db.rollback()
    finally:
        db.close()


def _scheduler_loop():
    """Background thread — runs every LIVE_INTERVAL_SECONDS forever."""
    logger.info(f"[Live Simulator] Started — new readings every {LIVE_INTERVAL_SECONDS}s ({LIVE_INTERVAL_SECONDS//60} min)")
    while True:
        import time
        time.sleep(LIVE_INTERVAL_SECONDS)
        _run_live_cycle()


def start_live_simulator():
    """
    Spawn the background data simulator thread.
    Called once from main.py startup event.
    Also runs one immediate cycle so data is fresh right away.
    """
    # Run one cycle immediately so the dashboard shows fresh data on startup
    _run_live_cycle()

    # Start the background scheduler thread (daemon=True so it exits with the server)
    t = threading.Thread(target=_scheduler_loop, daemon=True, name="LiveSimulator")
    t.start()
    logger.info("[Live Simulator] Background thread started.")
