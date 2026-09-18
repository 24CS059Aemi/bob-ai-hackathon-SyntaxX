import React from 'react'
import type { DashboardSummary } from '../api/types'

const pill = (label: string, count: number, color: string, ring: string) => (
  <div className={`flex flex-col items-center justify-center p-4 rounded-2xl ${color} shadow-lg transition transform hover:-translate-y-0.5 border ${ring}`}>
    <span className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight">{count}</span>
    <span className="text-xs sm:text-sm font-bold uppercase tracking-wider mt-1.5 opacity-90">{label}</span>
  </div>
)

interface Props {
  summary: DashboardSummary
  lastUpdated: string
  onNavigateTab?: (tabId: string) => void
  onInspectTopAsset?: (assetId: string) => void
}

export default function DashboardHeader({
  summary,
  lastUpdated,
  onNavigateTab,
  onInspectTopAsset,
}: Props) {
  // Fleet Health Score (100% minus weighted penalty of critical and high assets)
  const healthScore = Math.max(
    15,
    Math.round(
      100 -
        ((summary.critical_count * 18 + summary.high_count * 8 + summary.medium_count * 3) /
          Math.max(1, summary.total_assets)) *
          10
    )
  )

  return (
    <div className="bg-white/95 rounded-3xl shadow-xl shadow-slate-200/80 p-6 sm:p-8 mb-6 border border-slate-200 backdrop-blur-md">
      {/* Top row: Title and Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              ⚡ Grid Equipment Failure Advisor
            </h1>
            <span className="text-xs font-mono font-extrabold bg-slate-900 text-cyan-400 px-3 py-1 rounded-lg border border-slate-800 shadow-xs">
              LIVE OPERATIONS
            </span>
          </div>
          <p className="text-sm text-slate-600 font-medium mt-1.5">
            AI-Driven Multi-Sensor Power Outage Prediction &amp; Transmission Intelligence Platform
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-2xl">
          <div className="text-right">
            <div className="text-xs font-bold text-slate-600 flex items-center justify-end gap-2">
              <span>Telemetry sync:</span>
              <span className="font-mono text-slate-900 font-extrabold">{new Date(lastUpdated).toLocaleTimeString()}</span>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <button
              onClick={() => onNavigateTab && onNavigateTab('scada')}
              title="Open SCADA Supervisory Control & Telemetry"
              className="text-xs text-emerald-700 hover:text-emerald-900 font-bold mt-0.5 cursor-pointer bg-transparent border-none p-0 flex items-center gap-1 transition">
              <span>● SCADA Real-Time Bridge Active</span>
              <span className="text-[10px] font-mono">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Critical Alert Ticker if any critical assets exist */}
      {summary.critical_count > 0 && (
        <div className="mb-5 p-4 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-red-950 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-bounce">🚨</span>
            <div>
              <strong className="text-red-700 font-extrabold tracking-wide uppercase text-xs block mb-0.5">Urgent Grid Failure Alert</strong>
              <span>
                Asset <strong className="font-mono text-red-800 bg-red-100 px-1.5 py-0.5 rounded border border-red-300">{summary.top_risk_asset}</strong> in{' '}
                <strong className="text-slate-900">{summary.top_risk_zone}</strong> exhibits severe thermal &amp; insulation distress. <strong>{summary.total_customers_at_risk.toLocaleString()}</strong> customers exposed.
              </span>
            </div>
          </div>
          {onInspectTopAsset && (
            <button
              onClick={() => onInspectTopAsset(summary.top_risk_asset)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-extrabold shrink-0 transition shadow-md hover:shadow-lg">
              Inspect Asset {summary.top_risk_asset} →
            </button>
          )}
        </div>
      )}

      {/* Primary KPI Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-5">
        {pill('Critical Outage Risk', summary.critical_count, 'bg-red-600 text-white', 'border-red-700')}
        {pill('High Risk Warning', summary.high_count, 'bg-amber-500 text-white', 'border-amber-600')}
        {pill('Medium Health Risk', summary.medium_count, 'bg-yellow-400 text-yellow-950', 'border-yellow-500')}
        {pill('Nominal / Low Risk', summary.low_count, 'bg-emerald-500 text-white', 'border-emerald-600')}
      </div>

      {/* Secondary Metrics Bar with larger, clear fonts */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-slate-700 border-t border-slate-200 pt-4 font-medium">
        <div className="flex flex-wrap items-center gap-5">
          <span className="flex items-center gap-1.5">
            <span>📊</span> Monitored Assets: <strong className="text-slate-900 font-bold font-mono">{summary.total_assets}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span>👥</span> Total Customers Protected: <strong className="text-slate-900 font-bold font-mono">{summary.total_customers_at_risk.toLocaleString()}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span>📍</span> High-Alert Sector: <strong className="text-red-700 font-bold">{summary.top_risk_zone}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span>⚠️</span> Prime Mitigation Focus: <strong className="text-slate-900 font-mono font-bold">{summary.top_risk_asset}</strong>
          </span>
        </div>

        {/* Fleet Health Index Gauge */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl">
          <span className="text-xs font-bold text-slate-600 uppercase">Fleet Integrity:</span>
          <div className="w-24 h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${healthScore > 75 ? 'bg-emerald-500' : healthScore > 50 ? 'bg-amber-500' : 'bg-red-600'}`}
              style={{ width: `${healthScore}%` }}
            />
          </div>
          <span className="font-mono text-sm font-extrabold text-slate-900">{healthScore}%</span>
        </div>
      </div>
    </div>
  )
}
