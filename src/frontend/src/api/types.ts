// Shared TypeScript types matching the backend Pydantic schemas

export interface Asset {
  asset_id: string
  asset_type: string
  zone: string
  capacity_mva: number
  age_years: number
  customers_served: number
  voltage_kv: number
}

export interface RiskResult {
  rank: number
  asset_id: string
  asset_type: string
  zone: string
  capacity_mva: number
  age_years: number
  customers_served: number
  voltage_kv: number
  temperature_norm: number
  vibration_norm: number
  partial_discharge_norm: number
  oil_quality_norm: number
  weather_risk_norm: number
  incident_rate_norm: number
  age_factor: number
  load_factor: number
  risk_score: number
  grid_impact_factor: number
  priority_score: number
  severity_label: 'Critical' | 'High' | 'Medium' | 'Low'
  latest_temperature_c: number
  latest_vibration_mms: number
  latest_partial_discharge_pc: number
  latest_oil_quality_index: number
  latest_load_percent: number
}

export interface RiskRankingResponse {
  computed_at: string
  total_assets: number
  severity_counts: Record<string, number>
  assets: RiskResult[]
}

export interface ZoneRisk {
  zone: string
  zone_risk_score: number
  zone_severity: string
  asset_count: number
  total_customers: number
  total_capacity_mva: number
  critical_assets: number
  high_assets: number
  asset_ids: string[]
}

export interface ZoneRiskResponse {
  computed_at: string
  zones: ZoneRisk[]
}

export interface DashboardSummary {
  generated_at: string
  critical_count: number
  high_count: number
  medium_count: number
  low_count: number
  total_assets: number
  total_customers_at_risk: number
  top_risk_zone: string
  top_risk_asset: string
}

export interface MaintenanceAction {
  rank: number
  asset_id: string
  asset_type: string
  zone: string
  severity_label: string
  risk_score: number
  action: string
  action_detail: string
  deadline_iso: string
  deadline_hours: number
  estimated_duration_hours: number
  required_skills: string[]
  priority_score: number
  customers_at_risk: number
}

export interface MaintenancePlanResponse {
  generated_at: string
  total_actions: number
  actions: MaintenanceAction[]
}

export interface CrewAssignment {
  crew_id: string
  crew_name: string
  assigned_asset_id: string
  assigned_asset_type: string
  zone: string
  severity_label: string
  status: string
  dispatch_time_iso: string
  estimated_arrival_iso: string
  travel_minutes: number
  action: string
}

export interface CrewPositioningResponse {
  generated_at: string
  total_crews: number
  assignments: CrewAssignment[]
}

export interface BobBriefingResponse {
  generated_at: string
  briefing: string
  source: string
  top_assets: string[]
}

export interface SensorReading {
  asset_id: string
  timestamp: string
  temperature_c: number
  vibration_mms: number
  partial_discharge_pc: number
  oil_quality_index: number
  load_percent: number
}
