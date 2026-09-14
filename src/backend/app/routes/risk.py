"""Routes: GET /risk/ranking, GET /risk/zones, GET /risk/summary"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime

from ..database import get_db
from ..engine.asset_ranker import rank_assets, get_zone_summary, severity_counts
from ..schemas import (
    RiskRankingResponse, RiskResultSchema, ZoneRiskResponse, DashboardSummaryResponse
)

router = APIRouter(prefix="/risk", tags=["Risk"])


@router.get("/ranking", response_model=RiskRankingResponse)
def get_risk_ranking(db: Session = Depends(get_db)):
    ranked = rank_assets(db)
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
def get_dashboard_summary(db: Session = Depends(get_db)):
    ranked = rank_assets(db)
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
