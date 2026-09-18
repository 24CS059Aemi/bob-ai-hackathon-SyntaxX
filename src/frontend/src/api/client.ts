import axios from 'axios'
import type {
  RiskRankingResponse, ZoneRiskResponse, DashboardSummary,
  MaintenancePlanResponse, CrewPositioningResponse,
  BobBriefingResponse, SensorReading,
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
