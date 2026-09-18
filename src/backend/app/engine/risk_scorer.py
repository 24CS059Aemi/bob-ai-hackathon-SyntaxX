"""
Risk Scorer — computes a composite risk score per asset.

Formula (IEEE/IEC grounded weights):
  risk_score = (
    0.25 × temp_norm +
    0.20 × vibration_norm +
    0.20 × partial_discharge_norm +
    0.15 × (1 - oil_quality_norm) +
    0.10 × weather_risk_norm +
    0.10 × incident_rate_norm
  ) × age_factor × load_factor

All inputs normalised to [0, 1].
Higher score = worse health = higher outage risk.
"""

from dataclasses import dataclass, field
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from .. import models


# ---------------------------------------------------------------------------
# Normalisation helpers
# ---------------------------------------------------------------------------

def _clamp(v: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, v))


def _norm(value: float, normal_hi: float, alarm_lo: float) -> float:
    """Map value from [0, alarm_lo] to [0, 1]; anything at or above alarm_lo = 1."""
    if value <= normal_hi:
        return 0.0
    if value >= alarm_lo:
        return 1.0
    return (value - normal_hi) / (alarm_lo - normal_hi)


# ---------------------------------------------------------------------------
# Data classes
# ---------------------------------------------------------------------------

@dataclass
class AssetFeatures:
    asset_id: str
    zone: str
    capacity_mva: float
    age_years: int
    customers_served: int
    # Normalised sensor features (0-1)
    temperature_norm: float = 0.0
    vibration_norm: float = 0.0
    partial_discharge_norm: float = 0.0
    oil_quality_norm: float = 0.0   # already inverted: high = bad oil
    load_norm: float = 0.0
    # Weather
    weather_risk_norm: float = 0.0
    # Historical
    incident_rate_norm: float = 0.0
    # Computed factors
    age_factor: float = 1.0
    load_factor: float = 1.0


@dataclass
class RiskResult:
    asset_id: str
    asset_type: str
    zone: str
    capacity_mva: float
    age_years: int
    customers_served: int
    voltage_kv: float
    # Individual feature scores
    temperature_norm: float
    vibration_norm: float
    partial_discharge_norm: float
    oil_quality_norm: float
    weather_risk_norm: float
    incident_rate_norm: float
    age_factor: float
    load_factor: float
    # Composite
    risk_score: float         # 0-1
    grid_impact_factor: float
    priority_score: float     # 0-100
    severity_label: str       # Critical / High / Medium / Low
    rank: int = 0
    # Latest raw sensor values (for display)
    latest_temperature_c: float = 0.0
    latest_vibration_mms: float = 0.0
    latest_partial_discharge_pc: float = 0.0
    latest_oil_quality_index: float = 0.0
    latest_load_percent: float = 0.0


# ---------------------------------------------------------------------------
# Core scorer
# ---------------------------------------------------------------------------

def _severity_label(score: float) -> str:
    if score >= 0.75:
        return "Critical"
    if score >= 0.55:
        return "High"
    if score >= 0.35:
        return "Medium"
    return "Low"


def _age_factor(age_years: int) -> float:
    """Assets older than 25 years carry a 15% penalty (CIGRE ageing curve)."""
    if age_years >= 35:
        return 1.25
    if age_years >= 25:
        return 1.15
    if age_years >= 15:
        return 1.05
    return 1.0


def _load_factor(load_norm: float) -> float:
    """Overloaded assets (>90% rated) carry additional risk."""
    if load_norm >= 0.9:
        return 1.20
    if load_norm >= 0.7:
        return 1.08
    return 1.0


def compute_risk_scores(db: Session) -> List[RiskResult]:
    """
    Compute risk scores for all assets using the latest 24-hour sensor window,
    current weather forecasts, and 3-year incident history.
    """
    now = datetime.utcnow()
    window_start = now - timedelta(hours=24)

    # ── 1. Latest weather per zone ────────────────────────────────────────
    today_str = now.date().isoformat()
    weather_rows = db.query(models.WeatherForecast).filter(
        models.WeatherForecast.forecast_date == today_str
    ).all()
    # Fallback: use most recent available if today not present
    if not weather_rows:
        weather_rows = db.query(models.WeatherForecast).all()
    zone_weather: Dict[str, float] = {w.zone: w.weather_risk_index for w in weather_rows}

    # ── 2. Incident stats per asset ───────────────────────────────────────
    all_incidents = db.query(models.Incident).all()
    incident_counts: Dict[str, int] = {}
    for inc in all_incidents:
        incident_counts[inc.asset_id] = incident_counts.get(inc.asset_id, 0) + 1

    max_incidents = max(incident_counts.values()) if incident_counts else 1

    # ── 3. Sensor aggregates per asset (24-hour mean) ─────────────────────
    recent_readings = db.query(models.SensorReading).filter(
        models.SensorReading.timestamp >= window_start
    ).all()

    # Group by asset_id
    sensor_groups: Dict[str, List[models.SensorReading]] = {}
    for r in recent_readings:
        sensor_groups.setdefault(r.asset_id, []).append(r)

    # If no recent readings (e.g. fresh seed), fall back to all readings
    if not sensor_groups:
        all_readings = db.query(models.SensorReading).all()
        for r in all_readings:
            sensor_groups.setdefault(r.asset_id, []).append(r)

    # ── 4. Score each asset ───────────────────────────────────────────────
    assets = db.query(models.Asset).all()
    results: List[RiskResult] = []

    for asset in assets:
        aid = asset.asset_id
        readings = sensor_groups.get(aid, [])

        if readings:
            # Latest values for immediate display & real-time responsiveness
            latest = max(readings, key=lambda r: r.timestamp)
            hist_temp = sum(r.temperature_c for r in readings) / len(readings)
            hist_vib  = sum(r.vibration_mms for r in readings) / len(readings)
            hist_pd   = sum(r.partial_discharge_pc for r in readings) / len(readings)
            hist_oil  = sum(r.oil_quality_index for r in readings) / len(readings)
            hist_load = sum(r.load_percent for r in readings) / len(readings)

            # Responsive SCADA blend: 75% real-time pulse + 25% historical baseline
            mean_temp  = 0.75 * latest.temperature_c + 0.25 * hist_temp
            mean_vib   = 0.75 * latest.vibration_mms + 0.25 * hist_vib
            mean_pd    = 0.75 * latest.partial_discharge_pc + 0.25 * hist_pd
            mean_oil   = 0.75 * latest.oil_quality_index + 0.25 * hist_oil
            mean_load  = 0.75 * latest.load_percent + 0.25 * hist_load
        else:
            mean_temp = mean_vib = mean_pd = 0.0
            mean_oil  = 100.0
            mean_load = 50.0
            latest = None

        # Normalise sensors (IEEE/IEC thresholds)
        temp_norm = _norm(mean_temp, normal_hi=75.0, alarm_lo=85.0)
        vib_norm  = _norm(mean_vib,  normal_hi=2.0,  alarm_lo=3.5)
        pd_norm   = _norm(mean_pd,   normal_hi=50.0, alarm_lo=150.0)
        # Oil: high oil quality index is GOOD; invert so high norm = bad
        oil_inv   = 100.0 - mean_oil
        oil_norm  = _norm(oil_inv,   normal_hi=25.0, alarm_lo=40.0)
        load_norm_v = _clamp(mean_load / 100.0, 0.0, 1.0)

        # Weather (zone-level)
        w_risk = zone_weather.get(asset.zone, 0.3)

        # Incident rate normalised
        inc_norm = incident_counts.get(aid, 0) / max_incidents

        # Factors
        af = _age_factor(asset.age_years)
        lf = _load_factor(load_norm_v)

        # Composite risk score
        raw = (
            0.25 * temp_norm +
            0.20 * vib_norm  +
            0.20 * pd_norm   +
            0.15 * oil_norm  +
            0.10 * w_risk    +
            0.10 * inc_norm
        ) * af * lf
        risk = _clamp(raw, 0.0, 1.0)

        # Grid impact factor — normalised so a 500 MVA / 120k-customer asset = 1.0
        # max_gif ≈ (120000/1000) * (500/100) = 120 * 5 = 600
        gif = (asset.customers_served / 1000.0) * (asset.capacity_mva / 100.0)
        gif_norm = _clamp(gif / 600.0, 0.0, 1.0)

        # Priority score 0-100: blend of risk severity and grid impact
        priority = _clamp(risk * 0.7 * 100.0 + gif_norm * 0.3 * 100.0, 0.0, 100.0)

        results.append(RiskResult(
            asset_id=aid,
            asset_type=asset.asset_type,
            zone=asset.zone,
            capacity_mva=asset.capacity_mva,
            age_years=asset.age_years,
            customers_served=asset.customers_served,
            voltage_kv=asset.voltage_kv,
            temperature_norm=round(temp_norm, 4),
            vibration_norm=round(vib_norm, 4),
            partial_discharge_norm=round(pd_norm, 4),
            oil_quality_norm=round(oil_norm, 4),
            weather_risk_norm=round(w_risk, 4),
            incident_rate_norm=round(inc_norm, 4),
            age_factor=round(af, 4),
            load_factor=round(lf, 4),
            risk_score=round(risk, 4),
            grid_impact_factor=round(gif, 2),
            priority_score=round(priority, 2),
            severity_label=_severity_label(risk),
            latest_temperature_c=round(latest.temperature_c, 2) if latest else 0.0,
            latest_vibration_mms=round(latest.vibration_mms, 2) if latest else 0.0,
            latest_partial_discharge_pc=round(latest.partial_discharge_pc, 2) if latest else 0.0,
            latest_oil_quality_index=round(latest.oil_quality_index, 2) if latest else 0.0,
            latest_load_percent=round(latest.load_percent, 2) if latest else 0.0,
        ))

    return results


def compute_zone_risk(risk_results: List[RiskResult]) -> List[Dict]:
    """Aggregate asset-level risk scores into zone-level summaries."""
    zones: Dict[str, Dict] = {}
    for r in risk_results:
        z = r.zone
        if z not in zones:
            zones[z] = {
                "zone": z,
                "asset_count": 0,
                "total_customers": 0,
                "total_capacity_mva": 0.0,
                "weighted_risk_sum": 0.0,
                "critical_count": 0,
                "high_count": 0,
                "assets": [],
            }
        zones[z]["asset_count"] += 1
        zones[z]["total_customers"] += r.customers_served
        zones[z]["total_capacity_mva"] += r.capacity_mva
        zones[z]["weighted_risk_sum"] += r.risk_score * r.capacity_mva
        if r.severity_label == "Critical":
            zones[z]["critical_count"] += 1
        elif r.severity_label == "High":
            zones[z]["high_count"] += 1
        zones[z]["assets"].append(r.asset_id)

    summaries = []
    for z, data in zones.items():
        zone_risk = data["weighted_risk_sum"] / data["total_capacity_mva"] if data["total_capacity_mva"] else 0
        summaries.append({
            "zone": z,
            "zone_risk_score": round(zone_risk, 4),
            "zone_severity": _severity_label(zone_risk),
            "asset_count": data["asset_count"],
            "total_customers": data["total_customers"],
            "total_capacity_mva": data["total_capacity_mva"],
            "critical_assets": data["critical_count"],
            "high_assets": data["high_count"],
            "asset_ids": data["assets"],
        })

    summaries.sort(key=lambda x: x["zone_risk_score"], reverse=True)
    return summaries
