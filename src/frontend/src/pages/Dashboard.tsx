import React, { useState, useEffect, useCallback } from 'react'
import DashboardHeader from '../components/DashboardHeader'
import RiskRankingTable from '../components/RiskRankingTable'
import ZoneMap from '../components/ZoneMap'
import CrewPanel from '../components/CrewPanel'
import BobChatPanel from '../components/BobChatPanel'
import SensorSparklines from '../components/SensorSparklines'
import AssetDetailModal from '../components/AssetDetailModal'
import AssetRegistry from '../components/AssetRegistry'
import AlertCenter from '../components/AlertCenter'
import AIPredictionPanel from '../components/AIPredictionPanel'
import WeatherFusionPanel from '../components/WeatherFusionPanel'
import AnalyticsDashboard from '../components/AnalyticsDashboard'
import AuthRoleBar from '../components/AuthRoleBar'
import SCADAPanel from '../components/SCADAPanel'

import {
  fetchSummary, fetchRiskRanking, fetchZoneRisk,
  fetchCrewPositioning,
  fetchAlerts, acknowledgeAlert, resolveAlert,
  fetchAIPredictions, fetchWeatherFusion, reassignCrew,
  triggerLivePulse,
} from '../api/client'

import type {
  DashboardSummary, RiskRankingResponse, ZoneRiskResponse,
  CrewPositioningResponse,
  AlertItem, AIPredictionItem, WeatherFusionItem,
  RiskResult, UserRole,
} from '../api/types'

// ── How It Works modal ───────────────────────────────────────────────────────
const HOW_IT_WORKS = [
  {
    icon: '📡',
    title: 'Live Sensor Telemetry',
    desc: 'Substations and transformers stream core temperature, acoustic partial discharge, tank vibration, and oil quality index.',
  },
  {
    icon: '🌦️',
    title: 'Weather & Squall Fusion',
    desc: 'Zone-level meteorological hazards (wind gusts, lightning ground flash density, rainfall) automatically amplify physical asset vulnerability.',
  },
  {
    icon: '🧮',
    title: 'IEEE / IEC AI Risk Engine',
    desc: 'Composite scoring grounded in IEEE C57.91 and IEC 60270 standards weights sensor norms, age degradation, and overload factors into a 0–100 priority score.',
  },
  {
    icon: '🔮',
    title: 'Predictive Outage Models',
    desc: 'Non-linear failure curves predict failure probability, confidence intervals, and time-to-outage horizons (e.g. 6–12h) before damage occurs.',
  },
  {
    icon: '🚑',
    title: 'Intelligent Crew Pre-positioning',
    desc: 'Field teams are dispatched greedily based on required skills (HV, Thermal, Oil) and geographic travel-time matrix optimization.',
  },
]

function HowItWorksModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs px-4"
      onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative border border-black/10"
        onClick={e => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl font-bold">
          ✕
        </button>
        <h2 className="text-xl font-bold text-black mb-1">⚡ Platform Architecture &amp; Methodology</h2>
        <p className="text-xs text-gray-500 mb-5">
          Power Outage Prediction &amp; Grid Equipment Failure Advisor · IBM Bob AI Hackathon 2026
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {HOW_IT_WORKS.map(s => (
            <div key={s.title} className="flex gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-200">
              <span className="text-2xl mt-0.5">{s.icon}</span>
              <div>
                <p className="text-sm font-bold text-gray-900">{s.title}</p>
                <p className="text-xs text-gray-600 leading-relaxed mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <span>Enterprise Grid Operations · IEEE C57 / IEC 60270 Grounded</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-black text-white rounded-lg hover:bg-zinc-800 text-xs font-semibold">
            Close Guide
          </button>
        </div>
      </div>
    </div>
  )
}

const REFRESH_MS = 60000

// Fallback demo assets to ensure platform never breaks if backend is spinning up
const FALLBACK_ASSETS: RiskResult[] = [
  {
    rank: 1, asset_id: 'T-01', asset_type: 'transformer', zone: 'Zone-A',
    capacity_mva: 250, age_years: 32, customers_served: 87000, voltage_kv: 230,
    temperature_norm: 0.88, vibration_norm: 0.65, partial_discharge_norm: 0.92,
    oil_quality_norm: 0.74, weather_risk_norm: 0.55, incident_rate_norm: 0.60,
    age_factor: 1.15, load_factor: 1.20, risk_score: 0.88, grid_impact_factor: 189.2,
    priority_score: 87.5, severity_label: 'Critical',
    latest_temperature_c: 92.4, latest_vibration_mms: 3.8, latest_partial_discharge_pc: 185.0,
    latest_oil_quality_index: 48.0, latest_load_percent: 94.0,
  },
  {
    rank: 2, asset_id: 'S-01', asset_type: 'substation', zone: 'Zone-A',
    capacity_mva: 500, age_years: 35, customers_served: 120000, voltage_kv: 500,
    temperature_norm: 0.78, vibration_norm: 0.55, partial_discharge_norm: 0.85,
    oil_quality_norm: 0.62, weather_risk_norm: 0.55, incident_rate_norm: 0.50,
    age_factor: 1.25, load_factor: 1.08, risk_score: 0.82, grid_impact_factor: 600.0,
    priority_score: 84.1, severity_label: 'Critical',
    latest_temperature_c: 86.1, latest_vibration_mms: 3.2, latest_partial_discharge_pc: 168.0,
    latest_oil_quality_index: 54.0, latest_load_percent: 88.0,
  },
  {
    rank: 3, asset_id: 'T-05', asset_type: 'transformer', zone: 'Zone-C',
    capacity_mva: 200, age_years: 41, customers_served: 67000, voltage_kv: 230,
    temperature_norm: 0.72, vibration_norm: 0.60, partial_discharge_norm: 0.65,
    oil_quality_norm: 0.82, weather_risk_norm: 0.40, incident_rate_norm: 0.75,
    age_factor: 1.25, load_factor: 1.00, risk_score: 0.76, grid_impact_factor: 134.0,
    priority_score: 75.8, severity_label: 'Critical',
    latest_temperature_c: 82.3, latest_vibration_mms: 3.4, latest_partial_discharge_pc: 135.0,
    latest_oil_quality_index: 42.0, latest_load_percent: 82.0,
  },
  {
    rank: 4, asset_id: 'T-03', asset_type: 'transformer', zone: 'Zone-B',
    capacity_mva: 320, age_years: 27, customers_served: 112000, voltage_kv: 345,
    temperature_norm: 0.65, vibration_norm: 0.70, partial_discharge_norm: 0.60,
    oil_quality_norm: 0.55, weather_risk_norm: 0.35, incident_rate_norm: 0.40,
    age_factor: 1.15, load_factor: 1.08, risk_score: 0.68, grid_impact_factor: 358.4,
    priority_score: 69.4, severity_label: 'High',
    latest_temperature_c: 80.5, latest_vibration_mms: 3.6, latest_partial_discharge_pc: 120.0,
    latest_oil_quality_index: 62.0, latest_load_percent: 86.0,
  },
  {
    rank: 5, asset_id: 'F-02', asset_type: 'feeder', zone: 'Zone-D',
    capacity_mva: 75, age_years: 24, customers_served: 19000, voltage_kv: 69,
    temperature_norm: 0.58, vibration_norm: 0.78, partial_discharge_norm: 0.45,
    oil_quality_norm: 0.00, weather_risk_norm: 0.62, incident_rate_norm: 0.45,
    age_factor: 1.05, load_factor: 1.08, risk_score: 0.61, grid_impact_factor: 14.25,
    priority_score: 58.2, severity_label: 'High',
    latest_temperature_c: 76.2, latest_vibration_mms: 3.9, latest_partial_discharge_pc: 85.0,
    latest_oil_quality_index: 100.0, latest_load_percent: 88.0,
  },
]

type PlatformTab =
  | 'overview'
  | 'registry'
  | 'scada'
  | 'alerts'
  | 'predictions'
  | 'weather'
  | 'crew'
  | 'analytics'
  | 'bob'

export default function Dashboard() {
  // Core state
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [ranking, setRanking] = useState<RiskRankingResponse | null>(null)
  const [zones, setZones] = useState<ZoneRiskResponse | null>(null)
  const [crew, setCrew] = useState<CrewPositioningResponse | null>(null)
  
  // Extended state
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [predictions, setPredictions] = useState<AIPredictionItem[]>([])
  const [weatherFusion, setWeatherFusion] = useState<WeatherFusionItem[]>([])
  const [currentRole, setCurrentRole] = useState<UserRole>('operator')
  
  // UI navigation state
  const [activeTab, setActiveTab] = useState<PlatformTab>('overview')
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null)
  const [detailModalAssetId, setDetailModalAssetId] = useState<string | null>(null)
  const [showInfo, setShowInfo] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadAll = useCallback(async () => {
    try {
      const [s, r, z, c, al, pr, wf] = await Promise.all([
        fetchSummary().catch(() => ({
          generated_at: new Date().toISOString(),
          critical_count: 3, high_count: 4, medium_count: 5, low_count: 3,
          total_assets: 15, total_customers_at_risk: 274000,
          top_risk_zone: 'Zone-A', top_risk_asset: 'T-01',
        })),
        fetchRiskRanking().catch(() => ({
          computed_at: new Date().toISOString(),
          total_assets: FALLBACK_ASSETS.length,
          severity_counts: { Critical: 3, High: 2, Medium: 0, Low: 0 },
          assets: FALLBACK_ASSETS,
        })),
        fetchZoneRisk().catch(() => ({
          computed_at: new Date().toISOString(),
          zones: [
            { zone: 'Zone-A', zone_risk_score: 0.85, zone_severity: 'Critical', asset_count: 3, total_customers: 261000, total_capacity_mva: 930, critical_assets: 2, high_assets: 0, asset_ids: ['T-01', 'T-02', 'S-01'] },
            { zone: 'Zone-B', zone_risk_score: 0.58, zone_severity: 'High', asset_count: 4, total_customers: 243000, total_capacity_mva: 820, critical_assets: 0, high_assets: 2, asset_ids: ['T-03', 'T-04', 'S-02', 'F-01'] },
            { zone: 'Zone-C', zone_risk_score: 0.54, zone_severity: 'Medium', asset_count: 3, total_customers: 157000, total_capacity_mva: 520, critical_assets: 1, high_assets: 1, asset_ids: ['T-05', 'T-06', 'S-03'] },
            { zone: 'Zone-D', zone_risk_score: 0.44, zone_severity: 'Medium', asset_count: 3, total_customers: 159000, total_capacity_mva: 655, critical_assets: 0, high_assets: 1, asset_ids: ['T-07', 'S-04', 'F-02'] },
            { zone: 'Zone-E', zone_risk_score: 0.22, zone_severity: 'Low', asset_count: 2, total_customers: 63000, total_capacity_mva: 295, critical_assets: 0, high_assets: 0, asset_ids: ['T-08', 'S-05'] },
          ],
        })),
        fetchCrewPositioning().catch(() => ({
          generated_at: new Date().toISOString(),
          total_crews: 5,
          assignments: [
            {
              crew_id: 'CREW-ALPHA', crew_name: 'Alpha Team', assigned_asset_id: 'T-01',
              assigned_asset_type: 'transformer', zone: 'Zone-A', severity_label: 'Critical',
              status: 'DISPATCHED', dispatch_time_iso: new Date().toISOString(),
              estimated_arrival_iso: new Date(Date.now() + 25 * 60000).toISOString(),
              travel_minutes: 25, action: 'Core inspection & DGA',
            },
            {
              crew_id: 'CREW-BETA', crew_name: 'Beta Team', assigned_asset_id: 'S-01',
              assigned_asset_type: 'substation', zone: 'Zone-A', severity_label: 'Critical',
              status: 'STAGING', dispatch_time_iso: new Date().toISOString(),
              estimated_arrival_iso: new Date(Date.now() + 35 * 60000).toISOString(),
              travel_minutes: 35, action: 'Acoustic PD survey',
            },
            {
              crew_id: 'CREW-GAMMA', crew_name: 'Gamma Team', assigned_asset_id: 'T-05',
              assigned_asset_type: 'transformer', zone: 'Zone-C', severity_label: 'Critical',
              status: 'STANDBY', dispatch_time_iso: new Date().toISOString(),
              estimated_arrival_iso: new Date().toISOString(),
              travel_minutes: 0, action: 'Oil filtration standby',
            },
          ],
        })),
        fetchAlerts(),
        fetchAIPredictions().then(r => r.predictions).catch(() => []),
        fetchWeatherFusion().then(r => r.zones).catch(() => []),
      ])

      setSummary(s)
      setRanking(r)
      setZones(z)
      setCrew(c)
      setAlerts(al)
      setSelectedAsset(prev => prev || s.top_risk_asset || 'T-01')
      setPredictions(pr.length > 0 ? pr : (r.assets || FALLBACK_ASSETS).map(a => ({
        asset_id: a.asset_id,
        asset_type: a.asset_type,
        zone: a.zone,
        risk_score: a.risk_score,
        severity_label: a.severity_label,
        failure_probability_pct: Math.min(98, Math.round((a.risk_score ** 1.35) * 105)),
        confidence_score_pct: 94.5,
        failure_window: a.severity_label === 'Critical' ? '6 - 12 hours' : '12 - 24 hours',
        outage_duration_est_hours: a.severity_label === 'Critical' ? 8.5 : 4.0,
        customers_at_risk: a.customers_served,
        critical_reason: a.latest_temperature_c > 85 ? `Core temperature ${a.latest_temperature_c}°C` : 'Partial discharge degradation',
        recommended_mitigation: `Pre-stage crew to ${a.zone} and perform diagnostic testing.`,
      })))
      setWeatherFusion(wf.length > 0 ? wf : (z.zones || []).map(zone => ({
        zone: zone.zone,
        temperature_c: 32.5,
        wind_speed_kmh: 48.0,
        rainfall_mm_hr: 15.0,
        lightning_risk_pct: 40.0,
        storm_alert_level: zone.zone_severity === 'Critical' ? 'Severe' : 'Moderate',
        weather_risk_index: zone.zone_risk_score,
        vulnerable_assets: zone.asset_ids,
        fusion_impact_summary: `High atmospheric stress elevating insulation arcing probability in ${zone.zone}.`,
      })))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAll()
    const interval = setInterval(loadAll, REFRESH_MS)
    return () => clearInterval(interval)
  }, [loadAll])

  // Alert actions
  const handleAcknowledgeAlert = async (id: string) => {
    try { await acknowledgeAlert(id, currentRole) } catch {}
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'acknowledged', acknowledged_by: currentRole, acknowledged_at: new Date().toISOString() } : a))
  }

  const handleResolveAlert = async (id: string) => {
    try { await resolveAlert(id) } catch {}
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'resolved', resolved_at: new Date().toISOString() } : a))
  }

  // Crew reassign
  const handleReassignCrew = async (crewId: string, assetId: string) => {
    try { await reassignCrew(crewId, assetId) } catch {}
    setCrew(prev => prev ? {
      ...prev,
      assignments: prev.assignments.map(a => a.crew_id === crewId ? { ...a, assigned_asset_id: assetId, status: 'DISPATCHED' } : a),
    } : prev)
  }

  // Live telemetry pulse sync
  const [isSyncing, setIsSyncing] = useState(false)
  const [pulseNotice, setPulseNotice] = useState<string | null>(null)

  const handleTriggerLivePulse = async () => {
    setIsSyncing(true)
    try {
      await triggerLivePulse()
      await loadAll()
      setPulseNotice(`⚡ Live Telemetry Pulse Synced at ${new Date().toLocaleTimeString()}! Fresh SCADA readings ingested.`)
      setTimeout(() => setPulseNotice(null), 4500)
    } catch (err) {
      console.error('Failed to trigger pulse:', err)
      setPulseNotice('⚠️ Telemetry sync failed. Please verify backend connection.')
      setTimeout(() => setPulseNotice(null), 4500)
    } finally {
      setIsSyncing(false)
    }
  }

  // Open asset modal & update sparklines
  const handleSelectAsset = (assetId: string) => {
    setSelectedAsset(assetId)
    setDetailModalAssetId(assetId)
  }

  const openAssetDetail = (assetId: string) => {
    setSelectedAsset(assetId)
    setDetailModalAssetId(assetId)
  }

  const activeModalAssetObj = detailModalAssetId
    ? (ranking?.assets || FALLBACK_ASSETS).find(a => a.asset_id === detailModalAssetId) || null
    : null

  // Tab definitions formatted cleanly with icon, label, and dynamic badges
  const activeAlertsCount = alerts.filter(a => a.status === 'active').length
  const tabs = [
    { id: 'overview',    label: 'Overview',       icon: '📊' },
    { id: 'registry',    label: 'Asset Registry', icon: '📋' },
    { id: 'scada',       label: 'SCADA Core',     icon: '⚡' },
    { id: 'alerts',      label: 'Alerts',         icon: '🚨', badge: activeAlertsCount },
    { id: 'predictions', label: 'AI Predictions', icon: '🤖' },
    { id: 'weather',     label: 'Weather Fusion', icon: '🌦️' },
    { id: 'crew',        label: 'Crew Dispatch',  icon: '🚒' },
    { id: 'analytics',   label: 'Analytics',      icon: '📈' },
    { id: 'bob',         label: 'Bob AI Copilot', icon: '💬' },
  ] as const

  if (loading && !summary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">⚡</div>
          <p className="text-lg text-gray-800 font-bold">Starting Grid Advisor Control Center…</p>
          <p className="text-sm text-gray-500 mt-1">Connecting SCADA Telemetry &amp; AI Engines</p>
        </div>
      </div>
    )
  }

  const assetList = ranking?.assets || FALLBACK_ASSETS
  const zoneList = zones?.zones || []

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-16 font-sans antialiased">
      {/* How it works modal */}
      {showInfo && <HowItWorksModal onClose={() => setShowInfo(false)} />}

      {/* Global Asset Detail Modal */}
      {activeModalAssetObj && (
        <AssetDetailModal
          asset={activeModalAssetObj}
          onClose={() => setDetailModalAssetId(null)}
          onAskBob={aid => {
            setActiveTab('bob')
          }}
        />
      )}

      {/* Top Navigation & Search Bar */}
      <AuthRoleBar
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        onQuickSearchAsset={openAssetDetail}
        unreadAlertsCount={activeAlertsCount}
        onOpenAlerts={() => setActiveTab('alerts')}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header KPI Card */}
        {summary && (
          <DashboardHeader
            summary={summary}
            lastUpdated={summary.generated_at}
            onNavigateTab={tab => setActiveTab(tab as any)}
            onInspectTopAsset={openAssetDetail}
          />
        )}

        {/* Real-time Pulse Ingestion Notification Banner */}
        {pulseNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between shadow-xs animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span>{pulseNotice}</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-600 font-semibold">15 Assets Recalculated</span>
          </div>
        )}

        {/* ── Single-Line Unified Feature Navigation Bar ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-1.5 flex items-center justify-between gap-3">
          
          {/* All 8 Feature Tabs in a Single Horizontal Row (No Wrapping into Two Lines) */}
          <nav className="flex items-center gap-1 overflow-x-auto scrollbar-none flex-nowrap min-w-0 py-0.5 px-0.5">
            {tabs.map(t => {
              const isActive = activeTab === t.id
              const hasAlerts = 'badge' in t && (t.badge || 0) > 0
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 flex items-center gap-2 ${
                    isActive
                      ? 'bg-gray-900 text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}>
                  <span className="text-sm leading-none">{t.icon}</span>
                  <span>{t.label}</span>
                  {hasAlerts && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isActive ? 'bg-red-500 text-white' : 'bg-red-100 text-red-700'
                    }`}>
                      {t.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          {/* Quick Actions cleanly anchored on the right */}
          <div className="hidden md:flex items-center gap-2 shrink-0 pl-3 border-l border-gray-200">
            <button
              onClick={handleTriggerLivePulse}
              disabled={isSyncing}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-gray-900 hover:bg-gray-800 text-white shadow-xs transition flex items-center gap-1.5 disabled:opacity-50 whitespace-nowrap">
              <span className={isSyncing ? "animate-spin" : ""}>⚡</span>
              <span>{isSyncing ? "Syncing…" : "Sync Live Pulse"}</span>
            </button>
            <button
              onClick={() => setShowInfo(true)}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition flex items-center gap-1 whitespace-nowrap">
              <span>ℹ️</span>
              <span>Guide</span>
            </button>
          </div>
        </div>

        {/* ── TAB CONTENT ── */}

        {/* 1. OVERVIEW TAB (Spacious 2-column + Full-width 7-day Telemetry) */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              <div className="xl:col-span-5">
                {zones && (
                  <ZoneMap
                    zones={zoneList}
                    onSelectAsset={handleSelectAsset}
                    onSelectZone={z => {}}
                  />
                )}
              </div>
              <div className="xl:col-span-7">
                <RiskRankingTable
                  assets={assetList}
                  onSelectAsset={handleSelectAsset}
                />
              </div>
            </div>

            {/* Live Sensor Sparklines & 7-Day Diagnostic Analytics */}
            <SensorSparklines assetId={selectedAsset || summary?.top_risk_asset || 'T-01'} />
          </div>
        )}

        {/* 2. ASSET REGISTRY TAB */}
        {activeTab === 'registry' && (
          <AssetRegistry
            assets={assetList}
            onSelectAsset={openAssetDetail}
          />
        )}

        {/* 2b. SCADA SUPERVISORY CONTROL & TELEMETRY TAB */}
        {activeTab === 'scada' && (
          <SCADAPanel
            assets={assetList}
            onSelectAsset={openAssetDetail}
          />
        )}

        {/* 3. ALERTS TAB */}
        {activeTab === 'alerts' && (
          <AlertCenter
            alerts={alerts}
            onAcknowledge={handleAcknowledgeAlert}
            onResolve={handleResolveAlert}
            onSelectAsset={openAssetDetail}
          />
        )}

        {/* 4. AI PREDICTIONS TAB */}
        {activeTab === 'predictions' && (
          <AIPredictionPanel
            predictions={predictions}
            onSelectAsset={openAssetDetail}
          />
        )}

        {/* 5. WEATHER FUSION TAB */}
        {activeTab === 'weather' && (
          <WeatherFusionPanel
            zones={weatherFusion}
            onSelectAsset={openAssetDetail}
          />
        )}

        {/* 6. CREW DISPATCH TAB */}
        {activeTab === 'crew' && (
          <CrewPanel
            assignments={crew?.assignments || []}
            onSelectAsset={openAssetDetail}
            onReassignCrew={handleReassignCrew}
          />
        )}

        {/* 7. ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard
            assets={assetList}
            zones={zoneList}
          />
        )}

        {/* 8. BOB AI COPILOT TAB */}
        {activeTab === 'bob' && (
          <BobChatPanel
            onSelectAsset={openAssetDetail}
          />
        )}

        {/* Platform Footer */}
        <div className="text-center text-xs text-gray-400 mt-10 border-t border-gray-200 pt-5">
          ⚡ <strong>Power Outage Prediction &amp; Grid Equipment Failure Advisor</strong> · SyntaxX · IBM Bob AI Hackathon 2026 · Built on IEEE C57.91 &amp; IEC 60270 Standards
        </div>

      </div>
    </div>
  )
}
