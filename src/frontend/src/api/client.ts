import axios from 'axios'
import type {
  RiskRankingResponse, ZoneRiskResponse, DashboardSummary,
  MaintenancePlanResponse, CrewPositioningResponse,
  BobBriefingResponse, SensorReading,
  AlertItem, WorkOrderItem, CreateWorkOrderPayload,
  AIPredictionsResponse, WeatherFusionResponse,
  SimulationRequest, SimulationResponse,
  BobChatResponse,
} from './types'

// Dev: keep the localhost API server.
// Prod: same-origin API calls should be relative and not force localhost.
const BASE = import.meta.env.DEV
  ? (import.meta.env.VITE_API_URL || 'http://localhost:8000')
  : (import.meta.env.VITE_API_URL || '')

const api = axios.create({ baseURL: BASE, timeout: 15000 })

export const fetchSummary = (): Promise<DashboardSummary> =>
  api.get('/risk/summary').then(r => r.data)

export const fetchRiskRanking = (): Promise<RiskRankingResponse> =>
  api.get('/risk/ranking').then(r => r.data)

export const fetchZoneRisk = (): Promise<ZoneRiskResponse> =>
  api.get('/risk/zones').then(r => r.data)

export const fetchMaintenancePlan = (): Promise<MaintenancePlanResponse> =>
  api.get('/maintenance/plan').then(r => r.data)

export const fetchCrewPositioning = (): Promise<CrewPositioningResponse> =>
  api.get('/crew/positioning').then(r => r.data)

export const fetchBobBriefing = (topN = 5): Promise<BobBriefingResponse> =>
  api.post('/bob/briefing', { top_n: topN }).then(r => r.data)

export const fetchSensorReadings = (assetId: string, days = 7): Promise<SensorReading[]> =>
  api.get(`/assets/${assetId}/sensors?days=${days}`).then(r => r.data)

export const fetchBobExplain = (assetId: string) =>
  api.get(`/bob/explain/${assetId}`).then(r => r.data)

// ── Alerts API ─────────────────────────────────────────────────────────────
export const fetchAlerts = (): Promise<AlertItem[]> =>
  api.get('/risk/alerts').then(r => r.data).catch(() => [
    {
      id: 'ALT-001',
      asset_id: 'T-01',
      zone: 'Zone-A',
      severity: 'Critical',
      title: 'Severe Core Thermal Limit Exceeded (92.4°C)',
      description: 'Temperature sensor is 7.4°C above IEEE C57.91 continuous threshold. Accelerated paper degradation occurring.',
      timestamp: new Date().toISOString(),
      status: 'active',
    },
    {
      id: 'ALT-002',
      asset_id: 'S-01',
      zone: 'Zone-A',
      severity: 'Critical',
      title: 'Partial Discharge Spike (>168 pC)',
      description: 'Acoustic and electrical UHF sensor detect persistent corona discharge on 500 kV transformer bushing.',
      timestamp: new Date().toISOString(),
      status: 'active',
    },
    {
      id: 'ALT-003',
      asset_id: 'T-05',
      zone: 'Zone-C',
      severity: 'High',
      title: 'Dielectric Oil Quality Degradation (Index 42)',
      description: 'Moisture content in transformer oil exceeded 35 ppm; breakdown voltage dropped to 26 kV.',
      timestamp: new Date().toISOString(),
      status: 'acknowledged',
      acknowledged_by: 'Ops-Dispatcher-02',
      acknowledged_at: new Date().toISOString(),
    },
    {
      id: 'ALT-004',
      asset_id: 'Zone-A',
      zone: 'Zone-A',
      severity: 'Warning',
      title: 'Severe Weather Gale Warning (Gusts 78 km/h)',
      description: 'Squall front entering Zone-A grid sector. Elevated risk of galloping conductors and tree-line contact.',
      timestamp: new Date().toISOString(),
      status: 'active',
    },
    {
      id: 'ALT-005',
      asset_id: 'F-02',
      zone: 'Zone-D',
      severity: 'High',
      title: 'Feeder Overcurrent & Line Vibration Anomaly',
      description: '3.8 mm/s vibration at terminal dead-end structure under 88% continuous circuit loading.',
      timestamp: new Date().toISOString(),
      status: 'resolved',
      acknowledged_by: 'Senior Eng. Patel',
      acknowledged_at: new Date().toISOString(),
      resolved_at: new Date().toISOString(),
    },
  ])

export const acknowledgeAlert = (alertId: string, operatorName = 'Grid-Operator'): Promise<any> =>
  api.post(`/risk/alerts/${alertId}/acknowledge?operator_name=${encodeURIComponent(operatorName)}`).then(r => r.data)

export const resolveAlert = (alertId: string): Promise<any> =>
  api.post(`/risk/alerts/${alertId}/resolve`).then(r => r.data)

// ── Work Orders API ─────────────────────────────────────────────────────────
export const fetchWorkOrders = (): Promise<WorkOrderItem[]> =>
  api.get('/maintenance/workorders').then(r => r.data).catch(() => [
    {
      id: 'WO-2026-001',
      asset_id: 'T-01',
      zone: 'Zone-A',
      title: 'Emergency DGA & Core Temperature Inspection',
      description: 'Critical thermal rise detected (92.4°C). Run comprehensive DGA and check auxiliary cooling pumps.',
      priority: 'P1-Critical',
      status: 'in_progress',
      assigned_crew: 'Alpha Team',
      assigned_technician: 'Alex Rivera (HV Specialist)',
      created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
      deadline_iso: new Date(Date.now() + 4 * 3600000).toISOString(),
      required_skills: ['HV Technician', 'Oil Specialist', 'Thermal Imaging'],
      notes: 'Crew Alpha on-site. Infrared scan shows winding hot spot on Phase B.',
    },
    {
      id: 'WO-2026-002',
      asset_id: 'S-01',
      zone: 'Zone-A',
      title: 'Busbar Partial Discharge Ultrasonic Survey',
      description: 'Acoustic and UHF sensor indicates 168 pC partial discharge activity near bus isolator 2.',
      priority: 'P1-Critical',
      status: 'assigned',
      assigned_crew: 'Beta Team',
      assigned_technician: 'Sarah Chen',
      created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
      deadline_iso: new Date(Date.now() + 6 * 3600000).toISOString(),
      required_skills: ['HV Technician', 'Thermal Imaging'],
      notes: 'Staged at Zone-A gate awaiting clearance tag.',
    },
    {
      id: 'WO-2026-003',
      asset_id: 'T-05',
      zone: 'Zone-C',
      title: 'Insulation Oil Degassing & Moisture Filtering',
      description: 'Dielectric breakdown voltage below 28 kV. Mobile oil processing unit required.',
      priority: 'P2-High',
      status: 'pending',
      assigned_crew: 'Gamma Team',
      created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
      deadline_iso: new Date(Date.now() + 14 * 3600000).toISOString(),
      required_skills: ['HV Technician', 'Oil Specialist'],
      notes: 'Waiting for tanker transport dispatch.',
    },
    {
      id: 'WO-2026-004',
      asset_id: 'F-02',
      zone: 'Zone-D',
      title: 'Overhead Line Vegetation Clearance & Damper Check',
      description: 'Vibration sensor alarm on conductor suspension span ahead of forecast high winds.',
      priority: 'P2-High',
      status: 'completed',
      assigned_crew: 'Delta Team',
      assigned_technician: 'Marcus Vance',
      created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
      deadline_iso: new Date(Date.now() - 2 * 3600000).toISOString(),
      completed_at: new Date(Date.now() - 3 * 3600000).toISOString(),
      required_skills: ['Mechanical', 'HV Technician'],
      notes: 'Re-torqued dampers and cleared tree limb encroaching within 3.5m clearance zone.',
    },
  ])

export const createWorkOrder = (payload: CreateWorkOrderPayload): Promise<WorkOrderItem> =>
  api.post('/maintenance/workorders', payload).then(r => r.data)

export const updateWorkOrderStatus = (orderId: string, status: string, notes?: string): Promise<WorkOrderItem> =>
  api.patch(`/maintenance/workorders/${orderId}`, { status, notes }).then(r => r.data)

// ── AI Predictions & Weather Fusion API ──────────────────────────────────────
export const fetchAIPredictions = (): Promise<AIPredictionsResponse> =>
  api.get('/risk/predictions').then(r => r.data)

export const fetchWeatherFusion = (): Promise<WeatherFusionResponse> =>
  api.get('/risk/fusion').then(r => r.data)

export const runSimulation = (req: SimulationRequest): Promise<SimulationResponse> =>
  api.post('/risk/simulate', req).then(r => r.data)

// ── Bob Chat API ────────────────────────────────────────────────────────────
export const sendBobChat = (message: string, history: any[] = []): Promise<BobChatResponse> =>
  api.post('/bob/chat', { message, history }).then(r => r.data)

// ── Crew Reassign API ───────────────────────────────────────────────────────
export const reassignCrew = (crewId: string, assetId: string, status = 'DISPATCHED') =>
  api.post('/crew/reassign', { crew_id: crewId, asset_id: assetId, status }).then(r => r.data)

// ── Auth APIs ────────────────────────────────────────────────────────────────
export interface UserAuthResponse {
  id: number
  email: string
  name: string
  role: string
  token: string
}

export const loginApi = (email: string, password: string): Promise<UserAuthResponse> =>
  api.post('/auth/login', { email, password }).then(r => r.data)

export const registerApi = (name: string, email: string, password: string, role = 'operator'): Promise<UserAuthResponse> =>
  api.post('/auth/register', { name, email, password, role }).then(r => r.data)

export const getMeApi = (token: string): Promise<UserAuthResponse> =>
  api.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data)

export const triggerLivePulse = (): Promise<{ status: string; message: string }> =>
  api.post('/risk/pulse').then(r => r.data)



