import type { DashboardSummary } from '../api/types'

const pill = (label: string, count: number, color: string) => (
  <div className={`flex flex-col items-center px-6 py-3 rounded-xl ${color} shadow`}>
    <span className="text-3xl font-bold">{count}</span>
    <span className="text-sm font-semibold mt-1">{label}</span>
  </div>
)

interface Props { summary: DashboardSummary; lastUpdated: string }

export default function DashboardHeader({ summary, lastUpdated }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow p-6 mb-6 border border-black/10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-black">⚡ Grid Equipment Failure Advisor</h1>
          <p className="text-sm text-gray-600 mt-1">
            Power Outage Prediction &amp; Maintenance Intelligence Platform
          </p>
        </div>
        <div className="text-xs text-gray-500">
          Last updated: {new Date(lastUpdated).toLocaleTimeString()}
          <span className="ml-2 inline-block w-2 h-2 bg-black rounded-full animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {pill('● Critical', summary.critical_count, 'bg-red-600 text-white border border-red-700')}
        {pill('● High', summary.high_count, 'bg-orange-500 text-white border border-orange-600')}
        {pill('● Medium', summary.medium_count, 'bg-amber-300 text-amber-950 border border-amber-400')}
        {pill('● Low', summary.low_count, 'bg-emerald-100 text-emerald-800 border border-emerald-400')}
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-gray-700 border-t border-black/10 pt-3">
        <span>📊 <strong>{summary.total_assets}</strong> assets monitored</span>
        <span>👥 <strong>{summary.total_customers_at_risk.toLocaleString()}</strong> customers at risk</span>
        <span>📍 Highest risk zone: <strong className="text-black">{summary.top_risk_zone}</strong></span>
        <span>⚠️ Top asset: <strong className="text-black">{summary.top_risk_asset}</strong></span>
      </div>
    </div>
  )
}

