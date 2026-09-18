"""
DB seed script — creates all tables and populates them with synthetic data.
Run once before starting the server:
    python -m app.data.seed
"""

import json
import sys
import os
from datetime import datetime

# Allow running as a standalone script
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

import app.database as _db
from app import models
from app.data.generator import (
    generate_sensor_readings,
    generate_weather_forecasts,
    generate_incidents,
    get_assets,
    get_crews,
)


def seed():
    print("Creating database tables...")
    models.Base.metadata.create_all(bind=_db.engine)

    db = _db.SessionLocal()
    try:
        # Skip if already seeded
        if db.query(models.Asset).count() > 0:
            print("Database already seeded. Skipping.")
            return

        print("Seeding assets...")
        for a in get_assets():
            db.add(models.Asset(**a))
        db.commit()

        print("Seeding weather forecasts...")
        for w in generate_weather_forecasts():
            db.add(models.WeatherForecast(**w))
        db.commit()

        print("Seeding sensor readings (30 days × 15 assets × 4 intervals)...")
        readings = generate_sensor_readings(days=30)
        for r in readings:
            r["timestamp"] = datetime.fromisoformat(r["timestamp"])
            db.add(models.SensorReading(**r))
        db.commit()

        print("Seeding historical incidents...")
        incidents = generate_incidents(years=3)
        for inc in incidents:
            inc["incident_date"] = datetime.fromisoformat(inc["incident_date"])
            db.add(models.Incident(**inc))
        db.commit()

        print("Seeding crew roster...")
        for c in get_crews():
            db.add(models.CrewRecord(
                crew_id=c["crew_id"],
                name=c["name"],
                home_zone=c["home_zone"],
                size=c["size"],
                skills=json.dumps(c["skills"]),
            ))
        db.commit()

        print(f"Seeded: {len(get_assets())} assets, {len(readings)} sensor readings, "
              f"{len(incidents)} incidents.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
