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


# ── Alerts ────────────────────────────────────────────────────────────────────

class AlertItemSchema(BaseModel):
    id: str
    asset_id: str
    zone: str
    severity: str  # Critical | High | Warning | Info
    title: str
    description: str
    timestamp: str
    status: str    # active | acknowledged | resolved
    acknowledged_by: Optional[str] = None
    acknowledged_at: Optional[str] = None
    resolved_at: Optional[str] = None


# ── Work Orders ───────────────────────────────────────────────────────────────

class WorkOrderItemSchema(BaseModel):
    id: str
    asset_id: str
    zone: str
    title: str
    description: str
    priority: str       # P1-Critical | P2-High | P3-Medium | P4-Routine
    status: str         # pending | assigned | in_progress | completed
    assigned_crew: Optional[str] = None
    assigned_technician: Optional[str] = None
    created_at: str
    deadline_iso: str
    completed_at: Optional[str] = None
    required_skills: List[str] = []
    notes: Optional[str] = None


class CreateWorkOrderRequest(BaseModel):
    asset_id: str
    title: str
    description: str
    priority: str
    assigned_crew: Optional[str] = None
    assigned_technician: Optional[str] = None
    deadline_hours: Optional[float] = 24.0
    required_skills: Optional[List[str]] = []
    notes: Optional[str] = None


class UpdateWorkOrderStatusRequest(BaseModel):
    status: str
    notes: Optional[str] = None


# ── AI Predictions ────────────────────────────────────────────────────────────

class AIPredictionItemSchema(BaseModel):
    asset_id: str
    asset_type: str
    zone: str
    risk_score: float
    severity_label: str
    failure_probability_pct: float
    confidence_score_pct: float
    failure_window: str          # e.g. "6-12 hours"
    outage_duration_est_hours: float
    customers_at_risk: int
    critical_reason: str
    recommended_mitigation: str


class AIPredictionsResponse(BaseModel):
    computed_at: str
    predictions: List[AIPredictionItemSchema]


# ── Weather Fusion ────────────────────────────────────────────────────────────

class WeatherFusionItemSchema(BaseModel):
    zone: str
    temperature_c: float
    wind_speed_kmh: float
    rainfall_mm_hr: float
    lightning_risk_pct: float
    storm_alert_level: str       # Severe | High | Moderate | Low
    weather_risk_index: float    # 0.0 - 1.0
    vulnerable_assets: List[str]
    fusion_impact_summary: str


class WeatherFusionResponse(BaseModel):
    computed_at: str
    zones: List[WeatherFusionItemSchema]


# ── What-If Simulator ─────────────────────────────────────────────────────────

class SimulationRequest(BaseModel):
    temp_delta_c: float = 0.0
    load_surge_pct: float = 0.0
    wind_speed_kmh: float = 35.0
    lightning_risk_pct: float = 20.0
    target_zone: Optional[str] = "All"


class SimulationAssetImpact(BaseModel):
    asset_id: str
    zone: str
    base_risk_score: float
    simulated_risk_score: float
    risk_delta: float
    base_severity: str
    simulated_severity: str
    failure_probability_pct: float


class SimulationResponse(BaseModel):
    scenario_name: str
    simulated_at: str
    average_risk_score: float
    critical_assets_count: int
    high_assets_count: int
    newly_critical_assets: List[str]
    highest_risk_zone: str
    fleet_health_impact_pct: float
    asset_impacts: List[SimulationAssetImpact]


# ── Bob Chat ──────────────────────────────────────────────────────────────────

class BobChatMessage(BaseModel):
    role: str  # user | assistant
    content: str


class BobChatRequest(BaseModel):
    message: str
    history: Optional[List[BobChatMessage]] = []


class BobChatResponse(BaseModel):
    reply: str
    source: str
    suggested_actions: List[str] = []
    referenced_asset: Optional[str] = None

