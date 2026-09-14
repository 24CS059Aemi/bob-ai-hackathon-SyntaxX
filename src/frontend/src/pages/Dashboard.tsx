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
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        {/* Header */}
        {summary && <DashboardHeader summary={summary} lastUpdated={summary.generated_at} />}

        {/* Tabs */}
        <div className="flex gap-2 mb-4 flex-wrap">
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
