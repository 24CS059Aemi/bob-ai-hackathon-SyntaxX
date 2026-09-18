"""
Pydantic response schemas for the Grid Advisor API.
"""

from pydantic import BaseModel
from typing import List, Optional, Dict, Any


# ── Asset ────────────────────────────────────────────────────────────────────

class AssetSchema(BaseModel):
    asset_id: str
    asset_type: str
    zone: str
    capacity_mva: float
    age_years: int
    customers_served: int
    voltage_kv: float

    class Config:
        from_attributes = True


# ── Sensor reading ────────────────────────────────────────────────────────────

class SensorReadingSchema(BaseModel):
    asset_id: str
    timestamp: str
    temperature_c: float
    vibration_mms: float
    partial_discharge_pc: float
    oil_quality_index: float
    load_percent: float

    class Config:
        from_attributes = True


# ── Risk ──────────────────────────────────────────────────────────────────────

class RiskResultSchema(BaseModel):
    rank: int
    asset_id: str
    asset_type: str
    zone: str
    capacity_mva: float
    age_years: int
    customers_served: int
    voltage_kv: float
    temperature_norm: float
    vibration_norm: float
    partial_discharge_norm: float
    oil_quality_norm: float
    weather_risk_norm: float
    incident_rate_norm: float
    age_factor: float
    load_factor: float
    risk_score: float
    grid_impact_factor: float
    priority_score: float
    severity_label: str
    latest_temperature_c: float
    latest_vibration_mms: float
    latest_partial_discharge_pc: float
    latest_oil_quality_index: float
    latest_load_percent: float


class ZoneRiskSchema(BaseModel):
    zone: str
    zone_risk_score: float
    zone_severity: str
    asset_count: int
    total_customers: int
    total_capacity_mva: float
    critical_assets: int
    high_assets: int
    asset_ids: List[str]


class RiskRankingResponse(BaseModel):
    computed_at: str
    total_assets: int
    severity_counts: Dict[str, int]
    assets: List[RiskResultSchema]


class ZoneRiskResponse(BaseModel):
    computed_at: str
    zones: List[ZoneRiskSchema]


# ── Maintenance ────────────────────────────────────────────────────────────────

class MaintenanceActionSchema(BaseModel):
    rank: int
    asset_id: str
    asset_type: str
    zone: str
    severity_label: str
    risk_score: float
    action: str
    action_detail: str
    deadline_iso: str
    deadline_hours: float
    estimated_duration_hours: float
    required_skills: List[str]
    priority_score: float
    customers_at_risk: int


class MaintenancePlanResponse(BaseModel):
    generated_at: str
    total_actions: int
    actions: List[MaintenanceActionSchema]


# ── Crew ──────────────────────────────────────────────────────────────────────

class CrewAssignmentSchema(BaseModel):
    crew_id: str
    crew_name: str
    assigned_asset_id: str
    assigned_asset_type: str
    zone: str
    severity_label: str
    status: str
    dispatch_time_iso: str
    estimated_arrival_iso: str
    travel_minutes: int
    action: str


class CrewPositioningResponse(BaseModel):
    generated_at: str
    total_crews: int
    assignments: List[CrewAssignmentSchema]


# ── Bob advisor ────────────────────────────────────────────────────────────────

class BobBriefingRequest(BaseModel):
    top_n: Optional[int] = 5


class BobBriefingResponse(BaseModel):
    generated_at: str
    briefing: str
    source: str   # "watsonx" | "rule-based"
    top_assets: List[str]


class BobExplainResponse(BaseModel):
    asset_id: str
    explanation: str
    source: str
    recommended_action: str


# ── Summary (dashboard header) ────────────────────────────────────────────────

class DashboardSummaryResponse(BaseModel):
    generated_at: str
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int
    total_assets: int
    total_customers_at_risk: int
    top_risk_zone: str
    top_risk_asset: str
