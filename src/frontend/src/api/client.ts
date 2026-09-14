import axios from 'axios'
import type {
  RiskRankingResponse, ZoneRiskResponse, DashboardSummary,
  MaintenancePlanResponse, CrewPositioningResponse,
  BobBriefingResponse, SensorReading,
} from './types'

// In development VITE_API_URL defaults to localhost:8000.
// In production (Docker/Render) it is set to "" so calls go to the same origin.
const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

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
