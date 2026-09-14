import { useState, useEffect, useCallback } from 'react'
import DashboardHeader from '../components/DashboardHeader'
import RiskRankingTable from '../components/RiskRankingTable'
import ZoneMap from '../components/ZoneMap'
import MaintenancePlan from '../components/MaintenancePlan'
import CrewPanel from '../components/CrewPanel'
import BobAdvisorPanel from '../components/BobAdvisorPanel'
import SensorSparklines from '../components/SensorSparklines'
import {
  fetchSummary, fetchRiskRanking, fetchZoneRisk,
  fetchMaintenancePlan, fetchCrewPositioning,
} from '../api/client'
import type {
  DashboardSummary, RiskRankingResponse, ZoneRiskResponse,
  MaintenancePlanResponse, CrewPositioningResponse,
} from '../api/types'

// ── How It Works modal ───────────────────────────────────────────────────────
const HOW_IT_WORKS = [
  {
    icon: '📡',
    title: 'Live Sensor Data',
    desc: 'Transformers & substations stream temperature, vibration, partial discharge, oil quality and load readings every 6 hours.',
  },
  {
    icon: '🌦️',
    title: 'Weather Forecast',
    desc: 'Zone-level weather risk (wind, rain, lightning) is overlaid on equipment health to amplify risk in storm-affected areas.',
  },
  {
    icon: '🧮',
    title: 'AI Risk Scoring',
    desc: 'A composite risk score (IEEE/IEC grounded) blends sensor norms, age factor, load factor and incident history into a 0–100 priority score.',
  },
  {
    icon: '🔧',
    title: 'Maintenance Plan',
    desc: 'Assets ranked Critical/High/Medium get auto-generated maintenance actions with deadlines, required skills and estimated durations.',
  },
  {
    icon: '🚑',
    title: 'Crew Pre-positioning',
    desc: 'Field crews are greedily assigned to highest-priority assets using skill-matching + travel-time optimisation.',
  },
  {
    icon: '🤖',
    title: 'IBM Bob AI Briefing',
    desc: 'Bob generates a plain-English operational briefing and per-asset risk explanation, powered by watsonx.ai Granite (or rule-based fallback).',
  },
]

function HowItWorksModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative"
        onClick={e => e.stopPropagation()}>
        <button onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl font-bold">✕</button>
        <h2 className="text-xl font-bold text-blue-800 mb-1">⚡ How This Works</h2>
        <p className="text-xs text-gray-500 mb-5">
          Power Outage Prediction &amp; Grid Equipment Failure Advisor · SyntaxX
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {HOW_IT_WORKS.map(s => (
            <div key={s.title} className="flex gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-2xl mt-0.5">{s.icon}</span>
              <div>
                <p className="text-sm font-bold text-gray-800">{s.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 pt-4 border-t flex items-center justify-between text-xs text-gray-400">
          <span>🌐 Live at <a href="https://grid-advisor-yipp.onrender.com"
            className="text-blue-500 underline" target="_blank" rel="noreferrer">
            grid-advisor-yipp.onrender.com</a></span>
          <button onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-semibold">
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}

const REFRESH_MS = 60000

export default function Dashboard() {
  const [summary,     setSummary]     = useState<DashboardSummary | null>(null)
  const [ranking,     setRanking]     = useState<RiskRankingResponse | null>(null)
  const [zones,       setZones]       = useState<ZoneRiskResponse | null>(null)
  const [maintenance, setMaintenance] = useState<MaintenancePlanResponse | null>(null)
  const [crew,        setCrew]        = useState<CrewPositioningResponse | null>(null)
  const [error,       setError]       = useState<string | null>(null)
  const [loading,     setLoading]     = useState(true)
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null)
  const [activeTab,   setActiveTab]   = useState<'overview' | 'maintenance' | 'crew' | 'bob'>('overview')
  const [showInfo,    setShowInfo]    = useState(false)

  const loadAll = useCallback(async () => {
    try {
      const [s, r, z, m, c] = await Promise.all([
        fetchSummary(), fetchRiskRanking(), fetchZoneRisk(),
        fetchMaintenancePlan(), fetchCrewPositioning(),
      ])
      setSummary(s); setRanking(r); setZones(z); setMaintenance(m); setCrew(c)
      setError(null)
    } catch (e) {
      setError('Cannot connect to Grid Advisor API. Make sure the backend is running on port 8000.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAll()
    const interval = setInterval(loadAll, REFRESH_MS)
    return () => clearInterval(interval)
  }, [loadAll])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="text-center">
        <div className="text-5xl mb-4">⚡</div>
        <p className="text-lg text-gray-600 font-semibold">Loading Grid Advisor…</p>
        <p className="text-sm text-gray-400 mt-1">Connecting to backend API</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
      <div className="bg-white rounded-2xl shadow p-8 max-w-md text-center">
        <div className="text-4xl mb-4">🔌</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Backend Not Running</h2>
        <p className="text-gray-500 text-sm mb-4">{error}</p>
        <code className="block bg-gray-50 rounded-lg p-3 text-xs text-left text-gray-700 mb-4">
          cd src/backend<br />
          pip install -r requirements.txt<br />
          uvicorn app.main:app --reload
        </code>
        <button onClick={loadAll} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
          Retry Connection
        </button>
      </div>
    </div>
  )

  const tabs = [
    { id: 'overview',     label: '📊 Overview' },
    { id: 'maintenance',  label: '🔧 Maintenance' },
    { id: 'crew',         label: '🚑 Crew' },
    { id: 'bob',          label: '🤖 Bob AI' },
  ] as const

  return (
    <div className="min-h-screen bg-slate-100">
      {showInfo && <HowItWorksModal onClose={() => setShowInfo(false)} />}
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        {/* Header */}
        {summary && <DashboardHeader summary={summary} lastUpdated={summary.generated_at} />}

        {/* Tabs + How it works button */}
        <div className="flex gap-2 mb-4 flex-wrap items-center">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                activeTab === t.id
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
              }`}>
              {t.label}
            </button>
          ))}
          <button onClick={() => setShowInfo(true)}
            className="ml-auto px-3 py-2 rounded-xl text-sm font-semibold bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 shadow-sm transition flex items-center gap-1">
            ℹ️ How it works
          </button>
        </div>

        {/* Overview tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                {zones && <ZoneMap zones={zones.zones} />}
              </div>
              <div className="lg:col-span-2">
                {ranking && (
                  <RiskRankingTable
                    assets={ranking.assets}
                    onSelectAsset={id => setSelectedAsset(id === selectedAsset ? null : id)}
                  />
                )}
              </div>
            </div>
            {selectedAsset && (
              <SensorSparklines assetId={selectedAsset} />
            )}
          </div>
        )}

        {/* Maintenance tab */}
        {activeTab === 'maintenance' && maintenance && (
          <MaintenancePlan actions={maintenance.actions} />
        )}

        {/* Crew tab */}
        {activeTab === 'crew' && crew && (
          <CrewPanel assignments={crew.assignments} />
        )}

        {/* Bob AI tab */}
        {activeTab === 'bob' && (
          <BobAdvisorPanel topAsset={summary?.top_risk_asset} />
        )}

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 mt-8 pb-4">
          ⚡ Grid Equipment Failure Advisor · SyntaxX · IBM Bob AI Hackathon 2026
        </div>
      </div>
    </div>
  )
}
