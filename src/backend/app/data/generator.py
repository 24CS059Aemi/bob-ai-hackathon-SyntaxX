"""
Synthetic data generator for Power Outage Prediction & Grid Equipment Failure Advisor.

All thresholds grounded in real standards:
  - IEEE C57.91  : transformer loading and temperature limits
  - IEC 60270    : partial discharge measurement (alarm > 150 pC)
  - IEC 60422    : insulation oil quality assessment
  - ISO 10816    : vibration severity (alarm > 3.5 mm/s)
  - CIGRE survey : transformer failure rate ~1.2 % / year
"""

import random
import math
from datetime import datetime, timedelta
from typing import List, Dict, Any

RANDOM_SEED = 42


# ---------------------------------------------------------------------------
# Asset catalogue
# ---------------------------------------------------------------------------

ASSETS: List[Dict[str, Any]] = [
    # Transformers
    {"asset_id": "T-01", "asset_type": "transformer", "zone": "Zone-A", "capacity_mva": 250, "age_years": 32, "customers_served": 87000, "voltage_kv": 230},
    {"asset_id": "T-02", "asset_type": "transformer", "zone": "Zone-A", "capacity_mva": 180, "age_years": 18, "customers_served": 54000, "voltage_kv": 138},
    {"asset_id": "T-03", "asset_type": "transformer", "zone": "Zone-B", "capacity_mva": 320, "age_years": 27, "customers_served": 112000, "voltage_kv": 345},
    {"asset_id": "T-04", "asset_type": "transformer", "zone": "Zone-B", "capacity_mva": 150, "age_years": 8,  "customers_served": 38000, "voltage_kv": 138},
    {"asset_id": "T-05", "asset_type": "transformer", "zone": "Zone-C", "capacity_mva": 200, "age_years": 41, "customers_served": 67000, "voltage_kv": 230},
    {"asset_id": "T-06", "asset_type": "transformer", "zone": "Zone-C", "capacity_mva": 100, "age_years": 15, "customers_served": 29000, "voltage_kv": 115},
    {"asset_id": "T-07", "asset_type": "transformer", "zone": "Zone-D", "capacity_mva": 400, "age_years": 22, "customers_served": 95000, "voltage_kv": 500},
    {"asset_id": "T-08", "asset_type": "transformer", "zone": "Zone-E", "capacity_mva": 175, "age_years": 11, "customers_served": 41000, "voltage_kv": 138},
    # Substations
    {"asset_id": "S-01", "asset_type": "substation", "zone": "Zone-A", "capacity_mva": 500, "age_years": 35, "customers_served": 120000, "voltage_kv": 500},
    {"asset_id": "S-02", "asset_type": "substation", "zone": "Zone-B", "capacity_mva": 300, "age_years": 20, "customers_served": 78000, "voltage_kv": 345},
    {"asset_id": "S-03", "asset_type": "substation", "zone": "Zone-C", "capacity_mva": 220, "age_years": 29, "customers_served": 61000, "voltage_kv": 230},
    {"asset_id": "S-04", "asset_type": "substation", "zone": "Zone-D", "capacity_mva": 180, "age_years": 14, "customers_served": 45000, "voltage_kv": 138},
    {"asset_id": "S-05", "asset_type": "substation", "zone": "Zone-E", "capacity_mva": 120, "age_years": 7,  "customers_served": 22000, "voltage_kv": 115},
    # Feeders
    {"asset_id": "F-01", "asset_type": "feeder", "zone": "Zone-B", "capacity_mva": 50,  "age_years": 19, "customers_served": 15000, "voltage_kv": 69},
    {"asset_id": "F-02", "asset_type": "feeder", "zone": "Zone-D", "capacity_mva": 75,  "age_years": 24, "customers_served": 19000, "voltage_kv": 69},
]

ZONES = ["Zone-A", "Zone-B", "Zone-C", "Zone-D", "Zone-E"]

# Risk profiles: higher = worse health (used to shape sensor readings)
# Grounded so the demo always has a spread of Critical/High/Medium/Low
ASSET_RISK_PROFILE: Dict[str, float] = {
    "T-01": 0.88,  # critical — old age + high load
    "S-01": 0.82,  # critical — oldest substation
    "T-05": 0.76,  # critical — 41 years old
    "T-03": 0.68,  # high
    "S-03": 0.64,  # high
    "F-02": 0.61,  # high
    "T-02": 0.52,  # medium
    "S-02": 0.48,  # medium
    "T-07": 0.44,  # medium
    "F-01": 0.38,  # medium
    "T-06": 0.30,  # low
    "S-04": 0.26,  # low
    "T-04": 0.22,  # low
    "T-08": 0.18,  # low
    "S-05": 0.14,  # low
}


# ---------------------------------------------------------------------------
# Sensor reading generation  (IEEE / IEC grounded ranges)
# ---------------------------------------------------------------------------

def _sensor_value(base_risk: float, rng: random.Random,
                  normal_lo: float, normal_hi: float,
                  alarm_lo: float, alarm_hi: float,
                  noise: float = 0.05) -> float:
    """Interpolate between normal and alarm range based on risk profile."""
    t = min(1.0, base_risk + rng.uniform(-noise, noise))
    t = max(0.0, t)
    lo = normal_lo + t * (alarm_lo - normal_lo)
    hi = normal_hi + t * (alarm_hi - normal_hi)
    return round(rng.uniform(lo, hi), 2)


def generate_sensor_readings(days: int = 30) -> List[Dict[str, Any]]:
    """Generate 6-hourly sensor readings for every asset over `days` days."""
    rng = random.Random(RANDOM_SEED)
    readings = []
    now = datetime.utcnow()
    intervals_per_day = 4  # every 6 hours

    for asset in ASSETS:
        aid = asset["asset_id"]
        base = ASSET_RISK_PROFILE[aid]
        # Slowly trending upward over the window to simulate degradation
        for day in range(days):
            trend = base * (1 + 0.002 * day)  # +0.2 % per day drift
            for interval in range(intervals_per_day):
                ts = now - timedelta(days=(days - day), hours=interval * 6)
                readings.append({
                    "asset_id": aid,
                    "timestamp": ts.isoformat(),
                    # Temperature °C  — IEEE C57.91: normal 60-75, alarm >85
                    "temperature_c": _sensor_value(trend, rng, 60, 75, 85, 105),
                    # Vibration mm/s  — ISO 10816: normal 0.5-2.0, alarm >3.5
                    "vibration_mms": _sensor_value(trend, rng, 0.5, 2.0, 3.5, 6.0),
                    # Partial discharge pC — IEC 60270: normal 10-50, alarm >150
                    "partial_discharge_pc": _sensor_value(trend, rng, 10, 50, 150, 250),
                    # Oil quality index 0-100 — IEC 60422: good >75, poor <60
                    # Inverted: high risk → low oil quality
                    "oil_quality_index": round(100 - _sensor_value(trend, rng, 0, 25, 40, 60), 2),
                    # Load % — normal 40-80, overload >90
                    "load_percent": _sensor_value(trend, rng, 40, 80, 85, 98),
                })
    return readings


# ---------------------------------------------------------------------------
# Weather forecast generation
# ---------------------------------------------------------------------------

ZONE_WEATHER_PROFILE: Dict[str, float] = {
    "Zone-A": 0.85,  # incoming storm
    "Zone-B": 0.65,  # elevated risk
    "Zone-C": 0.50,  # moderate
    "Zone-D": 0.30,  # mild
    "Zone-E": 0.15,  # clear
}


def generate_weather_forecasts(days_ahead: int = 5) -> List[Dict[str, Any]]:
    """Generate daily weather forecasts per zone for `days_ahead` days."""
    rng = random.Random(RANDOM_SEED + 1)
    forecasts = []
    now = datetime.utcnow()
    for zone in ZONES:
        wprofile = ZONE_WEATHER_PROFILE[zone]
        for d in range(days_ahead):
            ts = now + timedelta(days=d)
            # Daily variation: storm intensifies on day 1-2 for Zone-A
            daily_boost = 0.10 if (zone == "Zone-A" and d in (1, 2)) else 0.0
            wp = min(1.0, wprofile + daily_boost + rng.uniform(-0.05, 0.05))
            forecasts.append({
                "zone": zone,
                "forecast_date": ts.date().isoformat(),
                # Wind km/h — calm <30, storm >80
                "wind_speed_kmh": round(10 + wp * 90 + rng.uniform(-5, 5), 1),
                # Rainfall mm/hr
                "rainfall_mm_hr": round(wp * 25 + rng.uniform(-2, 2), 1),
                # Temperature deviation from seasonal norm (°C)
                "temp_deviation_c": round(wp * 8 - 2 + rng.uniform(-1, 1), 1),
                # Lightning risk index 0-10
                "lightning_risk": round(min(10, wp * 10 + rng.uniform(-0.5, 0.5)), 1),
                # Composite weather risk 0-1
                "weather_risk_index": round(min(1.0, wp), 3),
            })
    return forecasts


# ---------------------------------------------------------------------------
# Historical incident generation
# ---------------------------------------------------------------------------

FAILURE_TYPES = [
    "Insulation breakdown",
    "Overheating",
    "Oil contamination",
    "Mechanical failure",
    "Lightning strike",
    "Overload",
    "Partial discharge fault",
    "Bushing failure",
]


def generate_incidents(years: int = 3) -> List[Dict[str, Any]]:
    """Generate ~200 historical incidents over `years` years (CIGRE ~1.2%/yr)."""
    rng = random.Random(RANDOM_SEED + 2)
    incidents = []
    now = datetime.utcnow()
    incident_id = 1

    for asset in ASSETS:
        aid = asset["asset_id"]
        base = ASSET_RISK_PROFILE[aid]
        # Higher risk assets have more incidents historically
        n_incidents = max(1, int(base * 15 * rng.uniform(0.8, 1.2)))
        for _ in range(n_incidents):
            days_ago = rng.randint(1, years * 365)
            ts = now - timedelta(days=days_ago)
            outage_hours = round(rng.uniform(0.5, 24) * (0.5 + base), 2)
            customers = int(asset["customers_served"] * rng.uniform(0.1, 0.8))
            incidents.append({
                "incident_id": f"INC-{incident_id:04d}",
                "asset_id": aid,
                "incident_date": ts.isoformat(),
                "failure_type": rng.choice(FAILURE_TYPES),
                "outage_duration_hours": outage_hours,
                "customers_affected": customers,
                "restoration_cost_usd": round(outage_hours * customers * rng.uniform(8, 15), 2),
                "root_cause": rng.choice(FAILURE_TYPES),
                "severity": "Critical" if base >= 0.75 else ("High" if base >= 0.55 else "Medium"),
            })
            incident_id += 1

    return incidents


# ---------------------------------------------------------------------------
# Crew roster
# ---------------------------------------------------------------------------

CREWS: List[Dict[str, Any]] = [
    {"crew_id": "CREW-ALPHA", "name": "Alpha Team",  "home_zone": "Zone-A", "size": 4, "skills": ["HV Technician", "Oil Specialist", "Thermal Imaging"]},
    {"crew_id": "CREW-BETA",  "name": "Beta Team",   "home_zone": "Zone-B", "size": 3, "skills": ["HV Technician", "Mechanical", "Thermal Imaging"]},
    {"crew_id": "CREW-GAMMA", "name": "Gamma Team",  "home_zone": "Zone-C", "size": 3, "skills": ["HV Technician", "Oil Specialist"]},
    {"crew_id": "CREW-DELTA", "name": "Delta Team",  "home_zone": "Zone-D", "size": 4, "skills": ["HV Technician", "Mechanical", "Thermal Imaging"]},
    {"crew_id": "CREW-ECHO",  "name": "Echo Team",   "home_zone": "Zone-E", "size": 2, "skills": ["HV Technician"]},
]

# Travel time matrix (minutes) between zones — symmetric approximation
ZONE_TRAVEL_MINUTES: Dict[str, Dict[str, int]] = {
    "Zone-A": {"Zone-A": 0,  "Zone-B": 35, "Zone-C": 55, "Zone-D": 80, "Zone-E": 110},
    "Zone-B": {"Zone-A": 35, "Zone-B": 0,  "Zone-C": 30, "Zone-D": 50, "Zone-E": 85},
    "Zone-C": {"Zone-A": 55, "Zone-B": 30, "Zone-C": 0,  "Zone-D": 40, "Zone-E": 65},
    "Zone-D": {"Zone-A": 80, "Zone-B": 50, "Zone-C": 40, "Zone-D": 0,  "Zone-E": 45},
    "Zone-E": {"Zone-A": 110,"Zone-B": 85, "Zone-C": 65, "Zone-D": 45, "Zone-E": 0 },
}


def get_assets() -> List[Dict[str, Any]]:
    return ASSETS


def get_crews() -> List[Dict[str, Any]]:
    return CREWS
