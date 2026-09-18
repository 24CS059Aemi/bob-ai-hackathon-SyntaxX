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

// ── Extended Platform Types ────────────────────────────────────────────────

export type UserRole = 'admin' | 'operator' | 'engineer' | 'technician'

export interface UserProfile {
  id: string
  name: string
  email: string
  role: UserRole
  avatar: string
}

export interface AlertItem {
  id: string
  asset_id: string
  zone: string
  severity: 'Critical' | 'High' | 'Warning' | 'Info'
  title: string
  description: string
  timestamp: string
  status: 'active' | 'acknowledged' | 'resolved'
  acknowledged_by?: string | null
  acknowledged_at?: string | null
  resolved_at?: string | null
}

export interface WorkOrderItem {
  id: string
  asset_id: string
  zone: string
  title: string
  description: string
  priority: 'P1-Critical' | 'P2-High' | 'P3-Medium' | 'P4-Routine'
  status: 'pending' | 'assigned' | 'in_progress' | 'completed'
  assigned_crew?: string | null
  assigned_technician?: string | null
  created_at: string
  deadline_iso: string
  completed_at?: string | null
  required_skills: string[]
  notes?: string | null
}

export interface CreateWorkOrderPayload {
  asset_id: string
  title: string
  description: string
  priority: string
  assigned_crew?: string
  assigned_technician?: string
  deadline_hours?: number
  required_skills?: string[]
  notes?: string
}

export interface AIPredictionItem {
  asset_id: string
  asset_type: string
  zone: string
  risk_score: number
  severity_label: string
  failure_probability_pct: number
  confidence_score_pct: number
  failure_window: string
  outage_duration_est_hours: number
  customers_at_risk: number
  critical_reason: string
  recommended_mitigation: string
}

export interface AIPredictionsResponse {
  computed_at: string
  predictions: AIPredictionItem[]
}

export interface WeatherFusionItem {
  zone: string
  temperature_c: number
  wind_speed_kmh: number
  rainfall_mm_hr: number
  lightning_risk_pct: number
  storm_alert_level: 'Severe' | 'High' | 'Moderate' | 'Low'
  weather_risk_index: number
  vulnerable_assets: string[]
  fusion_impact_summary: string
}

export interface WeatherFusionResponse {
  computed_at: string
  zones: WeatherFusionItem[]
}

export interface SimulationRequest {
  temp_delta_c: number
  load_surge_pct: number
  wind_speed_kmh: number
  lightning_risk_pct: number
  target_zone?: string
}

export interface SimulationAssetImpact {
  asset_id: string
  zone: string
  base_risk_score: number
  simulated_risk_score: number
  risk_delta: number
  base_severity: string
  simulated_severity: string
  failure_probability_pct: number
}

export interface SimulationResponse {
  scenario_name: string
  simulated_at: string
  average_risk_score: number
  critical_assets_count: number
  high_assets_count: number
  newly_critical_assets: string[]
  highest_risk_zone: string
  fleet_health_impact_pct: number
  asset_impacts: SimulationAssetImpact[]
}

export interface BobChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  suggested_actions?: string[]
  referenced_asset?: string
}

export interface BobChatResponse {
  reply: string
  source: string
  suggested_actions?: string[]
  referenced_asset?: string
}

export interface SystemSettings {
  tempAlarmThresholdC: number
  vibrationAlarmThresholdMms: number
  pdAlarmThresholdPc: number
  oilQualityMinThreshold: number
  maxLoadPercentThreshold: number
  soundAlertsEnabled: boolean
  autoRefreshIntervalSec: number
  watsonxEndpoint: string
  scadaMqttTopic: string
}

