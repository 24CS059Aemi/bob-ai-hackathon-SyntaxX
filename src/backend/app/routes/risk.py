"""Routes: GET /risk/ranking, GET /risk/zones, GET /risk/summary"""

from fastapi import APIRouter, Depends
from typing import List
from datetime import datetime

from ..engine.asset_ranker import get_ranked_assets, get_zone_summary, severity_counts
from ..engine.risk_scorer import RiskResult
from ..database import get_db
from sqlalchemy.orm import Session
from ..schemas import (
    RiskRankingResponse, RiskResultSchema, ZoneRiskResponse, DashboardSummaryResponse
)

router = APIRouter(prefix="/risk", tags=["Risk"])


@router.get("/ranking", response_model=RiskRankingResponse)
def get_risk_ranking(ranked: List[RiskResult] = Depends(get_ranked_assets)):
    counts = severity_counts(ranked)
    return RiskRankingResponse(
        computed_at=datetime.utcnow().isoformat(),
        total_assets=len(ranked),
        severity_counts=counts,
        assets=[RiskResultSchema(**{
            "rank": r.rank,
            "asset_id": r.asset_id,
            "asset_type": r.asset_type,
            "zone": r.zone,
            "capacity_mva": r.capacity_mva,
            "age_years": r.age_years,
            "customers_served": r.customers_served,
            "voltage_kv": r.voltage_kv,
            "temperature_norm": r.temperature_norm,
            "vibration_norm": r.vibration_norm,
            "partial_discharge_norm": r.partial_discharge_norm,
            "oil_quality_norm": r.oil_quality_norm,
            "weather_risk_norm": r.weather_risk_norm,
            "incident_rate_norm": r.incident_rate_norm,
            "age_factor": r.age_factor,
            "load_factor": r.load_factor,
            "risk_score": r.risk_score,
            "grid_impact_factor": r.grid_impact_factor,
            "priority_score": r.priority_score,
            "severity_label": r.severity_label,
            "latest_temperature_c": r.latest_temperature_c,
            "latest_vibration_mms": r.latest_vibration_mms,
            "latest_partial_discharge_pc": r.latest_partial_discharge_pc,
            "latest_oil_quality_index": r.latest_oil_quality_index,
            "latest_load_percent": r.latest_load_percent,
        }) for r in ranked],
    )


@router.get("/zones", response_model=ZoneRiskResponse)
def get_zone_risk(db: Session = Depends(get_db)):
    zones = get_zone_summary(db)
    return ZoneRiskResponse(
        computed_at=datetime.utcnow().isoformat(),
        zones=zones,
    )


@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(
    ranked: List[RiskResult] = Depends(get_ranked_assets),
    db: Session = Depends(get_db),
):
    counts = severity_counts(ranked)
    zones = get_zone_summary(db)
    at_risk = sum(
        r.customers_served for r in ranked if r.severity_label in ("Critical", "High")
    )
    top_zone = zones[0]["zone"] if zones else "—"
    top_asset = ranked[0].asset_id if ranked else "—"
    return DashboardSummaryResponse(
        generated_at=datetime.utcnow().isoformat(),
        critical_count=counts.get("Critical", 0),
        high_count=counts.get("High", 0),
        medium_count=counts.get("Medium", 0),
        low_count=counts.get("Low", 0),
        total_assets=len(ranked),
        total_customers_at_risk=at_risk,
        top_risk_zone=top_zone,
        top_risk_asset=top_asset,
    )


# ── AI Predictions ────────────────────────────────────────────────────────────

from ..schemas import (
    AIPredictionsResponse, AIPredictionItemSchema,
    WeatherFusionResponse, WeatherFusionItemSchema,
    SimulationRequest, SimulationResponse, SimulationAssetImpact,
    AlertItemSchema,
)

@router.get("/predictions", response_model=AIPredictionsResponse)
def get_ai_predictions(ranked: List[RiskResult] = Depends(get_ranked_assets)):
    predictions = []
    for r in ranked:
        # Failure probability non-linearly ramps as risk score passes 0.5
        prob = min(0.96, max(0.04, (r.risk_score ** 1.35) * 1.05))
        # Confidence score based on data completeness
        conf = 88.0 + (10.0 * (1.0 - abs(r.risk_score - 0.5)))
        # Failure time window
        if r.severity_label == "Critical":
            window = "6 - 12 hours"
            outage_hrs = 8.5
        elif r.severity_label == "High":
            window = "12 - 24 hours"
            outage_hrs = 4.2
        elif r.severity_label == "Medium":
            window = "24 - 48 hours"
            outage_hrs = 2.5
        else:
            window = "Stable > 72h"
            outage_hrs = 1.0

        # Dominant cause
        reasons = []
        if r.temperature_norm > 0.5:
            reasons.append(f"Thermal overload ({r.latest_temperature_c}°C)")
        if r.partial_discharge_norm > 0.5:
            reasons.append(f"Severe partial discharge ({r.latest_partial_discharge_pc} pC)")
        if r.oil_quality_norm > 0.5:
            reasons.append(f"Oil degradation (Index {r.latest_oil_quality_index})")
        if r.vibration_norm > 0.5:
            reasons.append(f"High mechanical vibration ({r.latest_vibration_mms} mm/s)")
        if not reasons:
            reasons.append(f"Operational age stress ({r.age_years} yrs)")

        mitigation = (
            f"Immediate de-load by 20% and deploy mobile cooling/oil unit to {r.asset_id} in {r.zone}."
            if r.severity_label in ("Critical", "High")
            else f"Schedule routine thermal imaging and dissolved gas analysis (DGA) for {r.asset_id}."
        )

        predictions.append(AIPredictionItemSchema(
            asset_id=r.asset_id,
            asset_type=r.asset_type,
            zone=r.zone,
            risk_score=r.risk_score,
            severity_label=r.severity_label,
            failure_probability_pct=round(prob * 100, 1),
            confidence_score_pct=round(conf, 1),
            failure_window=window,
            outage_duration_est_hours=outage_hrs,
            customers_at_risk=r.customers_served if r.severity_label in ("Critical", "High") else int(r.customers_served * 0.15),
            critical_reason=", ".join(reasons),
            recommended_mitigation=mitigation,
        ))

    return AIPredictionsResponse(
        computed_at=datetime.utcnow().isoformat(),
        predictions=predictions,
    )


# ── Weather Fusion ────────────────────────────────────────────────────────────

@router.get("/fusion", response_model=WeatherFusionResponse)
def get_weather_fusion(
    ranked: List[RiskResult] = Depends(get_ranked_assets),
    db: Session = Depends(get_db),
):
    from .. import models
    today_str = datetime.utcnow().date().isoformat()
    weather_rows = db.query(models.WeatherForecast).all()
    weather_map = {w.zone: w for w in weather_rows}

    # Group high-risk assets by zone
    zone_vulnerable: dict = {}
    for r in ranked:
        if r.severity_label in ("Critical", "High"):
            zone_vulnerable.setdefault(r.zone, []).append(r.asset_id)

    fusion_items = []
    zones = ["Zone-A", "Zone-B", "Zone-C", "Zone-D", "Zone-E"]
    for z in zones:
        w = weather_map.get(z)
        wind = w.wind_speed_kmh if w else 42.0
        rain = w.rainfall_mm_hr if w else 12.5
        w_index = w.weather_risk_index if w else 0.45
        lightning = (w.lightning_risk * 100) if (w and w.lightning_risk) else 35.0

        if w_index >= 0.70:
            level = "Severe"
            summary = "Gale-force winds & lightning surge. Severe insulation breakdown vulnerability."
        elif w_index >= 0.50:
            level = "High"
            summary = "Squall line & high ambient humidity. Multiplies partial discharge arcing risk."
        elif w_index >= 0.30:
            level = "Moderate"
            summary = "Elevated ambient temperature causing higher baseline transformer loading."
        else:
            level = "Low"
            summary = "Normal meteorological conditions with minimal grid stress."

        fusion_items.append(WeatherFusionItemSchema(
            zone=z,
            temperature_c=round(28.0 + (w.temp_deviation_c if w else 4.0), 1),
            wind_speed_kmh=round(wind, 1),
            rainfall_mm_hr=round(rain, 1),
            lightning_risk_pct=round(lightning, 1),
            storm_alert_level=level,
            weather_risk_index=round(w_index, 2),
            vulnerable_assets=zone_vulnerable.get(z, []),
            fusion_impact_summary=summary,
        ))

    return WeatherFusionResponse(
        computed_at=datetime.utcnow().isoformat(),
        zones=fusion_items,
    )


# ── What-If Simulator ─────────────────────────────────────────────────────────

@router.post("/simulate", response_model=SimulationResponse)
def run_simulation(
    req: SimulationRequest,
    ranked: List[RiskResult] = Depends(get_ranked_assets),
):
    impacts = []
    crit_count = 0
    high_count = 0
    newly_crit = []
    sum_risk = 0.0

    # Simulate stress multipliers
    temp_mult = 1.0 + max(0.0, req.temp_delta_c * 0.02)
    load_mult = 1.0 + (req.load_surge_pct / 100.0) * 0.25
    wind_factor = min(0.35, max(0.0, (req.wind_speed_kmh - 30.0) / 120.0))
    lightning_factor = (req.lightning_risk_pct / 100.0) * 0.20
    weather_delta = wind_factor + lightning_factor

    for r in ranked:
        is_target = (req.target_zone == "All" or req.target_zone == r.zone)
        if is_target:
            sim_score = min(1.0, max(0.05, (r.risk_score * temp_mult * load_mult) + (weather_delta * 0.25)))
        else:
            sim_score = r.risk_score

        sim_score = round(sim_score, 4)
        sum_risk += sim_score

        if sim_score >= 0.75:
            sim_sev = "Critical"
            crit_count += 1
            if r.severity_label != "Critical":
                newly_crit.append(r.asset_id)
        elif sim_score >= 0.55:
            sim_sev = "High"
            high_count += 1
        elif sim_score >= 0.35:
            sim_sev = "Medium"
        else:
            sim_sev = "Low"

        impacts.append(SimulationAssetImpact(
            asset_id=r.asset_id,
            zone=r.zone,
            base_risk_score=r.risk_score,
            simulated_risk_score=sim_score,
            risk_delta=round(sim_score - r.risk_score, 4),
            base_severity=r.severity_label,
            simulated_severity=sim_sev,
            failure_probability_pct=round(min(98.0, (sim_score ** 1.3) * 105), 1),
        ))

    avg_sim = round(sum_risk / len(ranked), 3) if ranked else 0.0
    base_avg = round(sum(r.risk_score for r in ranked) / len(ranked), 3) if ranked else 0.0

    return SimulationResponse(
        scenario_name=f"Stress Test (ΔT: +{req.temp_delta_c}°C, +{req.load_surge_pct}% Load, Wind: {req.wind_speed_kmh}km/h)",
        simulated_at=datetime.utcnow().isoformat(),
        average_risk_score=avg_sim,
        critical_assets_count=crit_count,
        high_assets_count=high_count,
        newly_critical_assets=newly_crit,
        highest_risk_zone=req.target_zone if req.target_zone != "All" else "Zone-A",
        fleet_health_impact_pct=round((avg_sim - base_avg) * 100, 1),
        asset_impacts=impacts,
    )


# ── Alert Center ──────────────────────────────────────────────────────────────

_ALERTS_STORE = [
    {
        "id": "ALT-001",
        "asset_id": "T-01",
        "zone": "Zone-A",
        "severity": "Critical",
        "title": "Severe Core Thermal Limit Exceeded (92.4°C)",
        "description": "Temperature sensor is 7.4°C above IEEE C57.91 continuous threshold. Accelerated paper degradation occurring.",
        "timestamp": datetime.utcnow().isoformat(),
        "status": "active",
        "acknowledged_by": None,
        "acknowledged_at": None,
        "resolved_at": None,
    },
    {
        "id": "ALT-002",
        "asset_id": "S-01",
        "zone": "Zone-A",
        "severity": "Critical",
        "title": "Partial Discharge Spike (>168 pC)",
        "description": "Acoustic and electrical UHF sensor detect persistent corona discharge on 500 kV transformer bushing.",
        "timestamp": datetime.utcnow().isoformat(),
        "status": "active",
        "acknowledged_by": None,
        "acknowledged_at": None,
        "resolved_at": None,
    },
    {
        "id": "ALT-003",
        "asset_id": "T-05",
        "zone": "Zone-C",
        "severity": "High",
        "title": "Dielectric Oil Quality Degradation (Index 42)",
        "description": "Moisture content in transformer oil exceeded 35 ppm; breakdown voltage dropped to 26 kV.",
        "timestamp": datetime.utcnow().isoformat(),
        "status": "acknowledged",
        "acknowledged_by": "Ops-Dispatcher-02",
        "acknowledged_at": datetime.utcnow().isoformat(),
        "resolved_at": None,
    },
    {
        "id": "ALT-004",
        "asset_id": "Zone-A",
        "zone": "Zone-A",
        "severity": "Warning",
        "title": "Severe Weather Gale Warning (Gusts 78 km/h)",
        "description": "Squall front entering Zone-A grid sector. Elevated risk of galloping conductors and tree-line contact.",
        "timestamp": datetime.utcnow().isoformat(),
        "status": "active",
        "acknowledged_by": None,
        "acknowledged_at": None,
        "resolved_at": None,
    },
    {
        "id": "ALT-005",
        "asset_id": "F-02",
        "zone": "Zone-D",
        "severity": "High",
        "title": "Feeder Overcurrent & Line Vibration Anomaly",
        "description": "3.8 mm/s vibration at terminal dead-end structure under 88% continuous circuit loading.",
        "timestamp": datetime.utcnow().isoformat(),
        "status": "resolved",
        "acknowledged_by": "Senior Eng. Patel",
        "acknowledged_at": datetime.utcnow().isoformat(),
        "resolved_at": datetime.utcnow().isoformat(),
    },
]


@router.get("/alerts", response_model=List[AlertItemSchema])
def get_alerts():
    return _ALERTS_STORE


@router.post("/alerts/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: str, operator_name: str = "Grid-Operator"):
    for a in _ALERTS_STORE:
        if a["id"] == alert_id:
            a["status"] = "acknowledged"
            a["acknowledged_by"] = operator_name
            a["acknowledged_at"] = datetime.utcnow().isoformat()
            return a
    return {"error": "Alert not found"}


@router.post("/alerts/{alert_id}/resolve")
def resolve_alert(alert_id: str):
    for a in _ALERTS_STORE:
        if a["id"] == alert_id:
            a["status"] = "resolved"
            a["resolved_at"] = datetime.utcnow().isoformat()
            return a
    return {"error": "Alert not found"}


@router.post("/pulse")
def trigger_live_pulse():
    from ..data.live_simulator import _run_live_cycle
    _run_live_cycle()
    return {"status": "ok", "message": "Fresh live sensor reading generated"}


