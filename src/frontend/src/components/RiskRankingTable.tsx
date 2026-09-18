import { useState } from 'react'
import type { RiskResult } from '../api/types'

const SEVERITY_BADGE: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  Critical: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
  High:     { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
  Medium:   { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  Low:      { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
}

const SEVERITY_BAR: Record<string, string> = {
  Critical: 'bg-red-500',
  High:     'bg-orange-500',
  Medium:   'bg-amber-500',
  Low:      'bg-emerald-500',
}

interface Props {
  assets: RiskResult[]
  onSelectAsset: (id: string) => void
}

type SortKey = 'rank' | 'risk_score' | 'customers_served' | 'age_years'

export default function RiskRankingTable({ assets, onSelectAsset }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('rank')
  const [filterSeverity, setFilterSeverity] = useState<string>('All')

  const counts = {
    All: assets.length,
    Critical: assets.filter(a => a.severity_label === 'Critical').length,
    High: assets.filter(a => a.severity_label === 'High').length,
    Medium: assets.filter(a => a.severity_label === 'Medium').length,
    Low: assets.filter(a => a.severity_label === 'Low').length,
  }

  const sorted = [...assets]
    .filter(a => filterSeverity === 'All' || a.severity_label === filterSeverity)
    .sort((a, b) => {
      if (sortKey === 'rank') return a.rank - b.rank
      return (b[sortKey] as number) - (a[sortKey] as number)
    })

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">
              Asset Risk Priority Ranking
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
              {sorted.length} Assets Listed
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Real-time composite failure scoring according to IEEE C57.91 &amp; IEC 60270 standards
          </p>
        </div>

        {/* Severity Filter Pills with dynamic counts */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {(['All', 'Critical', 'High', 'Medium', 'Low'] as const).map(s => {
            const isActive = filterSeverity === s
            return (
              <button
                key={s}
                onClick={() => setFilterSeverity(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  isActive
                    ? 'bg-gray-900 text-white border-gray-900 shadow-xs'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {s} <span className={`ml-1 text-[11px] opacity-75 font-mono`}>({counts[s]})</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Responsive Table: Zero horizontal scroll on desktop, clean layout */}
      <div className="w-full rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-3 px-4 w-[28%] cursor-pointer hover:text-gray-900 transition" onClick={() => setSortKey('rank')}>
                Asset &amp; Location ⇅
              </th>
              <th className="py-3 px-4 w-[24%] cursor-pointer hover:text-gray-900 transition" onClick={() => setSortKey('risk_score')}>
                Risk &amp; Severity ⇅
              </th>
              <th className="py-3 px-4 w-[20%]">
                Live Sensor Telemetry
              </th>
              <th className="py-3 px-4 w-[16%] cursor-pointer hover:text-gray-900 transition" onClick={() => setSortKey('customers_served')}>
                Impact &amp; Age ⇅
              </th>
              <th className="py-3 px-4 w-[12%] text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white text-xs sm:text-sm">
            {sorted.map(a => {
              const sev = SEVERITY_BADGE[a.severity_label] || SEVERITY_BADGE.Low
              const barColor = SEVERITY_BAR[a.severity_label] || SEVERITY_BAR.Low

              return (
                <tr key={a.asset_id} className="hover:bg-gray-50/70 transition-colors">
                  {/* Column 1: Asset Code, Type, Zone, and Rank */}
                  <td className="py-3.5 px-4 align-middle">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-gray-400 w-6">
                        #{a.rank}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 text-sm font-mono">
                            {a.asset_id}
                          </span>
                          <span className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-gray-100 text-gray-700 capitalize border border-gray-200">
                            {a.asset_type}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1 font-medium">
                          <span>📍 {a.zone}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Column 2: Composite Risk Score + Progress Meter + Severity Badge */}
                  <td className="py-3.5 px-4 align-middle">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2 max-w-[200px]">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${sev.bg} ${sev.text} ${sev.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />
                          {a.severity_label}
                        </span>
                        <span className="font-mono font-bold text-xs text-gray-900">
                          {(a.risk_score * 100).toFixed(1)}% Risk
                        </span>
                      </div>
                      <div className="w-full max-w-[200px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                          style={{ width: `${Math.min(100, Math.max(5, a.risk_score * 100))}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Column 3: Live Sensor Telemetry (Temp & PD) */}
                  <td className="py-3.5 px-4 align-middle">
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-[11px]">Temp:</span>
                        <span className={`font-mono font-bold ${a.latest_temperature_c > 85 ? 'text-red-600' : 'text-gray-800'}`}>
                          {a.latest_temperature_c.toFixed(1)}°C
                        </span>
                        {a.latest_temperature_c > 85 && (
                          <span className="text-[10px] text-red-600 font-bold bg-red-50 px-1 rounded">High</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-[11px]">PD:</span>
                        <span className={`font-mono font-semibold ${a.latest_partial_discharge_pc > 150 ? 'text-red-600 font-bold' : 'text-gray-800'}`}>
                          {a.latest_partial_discharge_pc} pC
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Column 4: Impact & Age */}
                  <td className="py-3.5 px-4 align-middle">
                    <div className="text-xs">
                      <div className="font-semibold text-gray-900 font-mono">
                        {a.customers_served.toLocaleString()} <span className="text-[11px] font-sans font-normal text-gray-500">cust</span>
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        Age: <span className="font-medium text-gray-700">{a.age_years} yrs</span>
                      </div>
                    </div>
                  </td>

                  {/* Column 5: Action Button */}
                  <td className="py-3.5 px-4 align-middle text-right">
                    <button
                      onClick={() => onSelectAsset(a.asset_id)}
                      className="px-3.5 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs inline-flex items-center gap-1">
                      <span>Inspect</span>
                      <span>→</span>
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500 px-1">
        <span>Click column headers to sort. Assets update continuously via live sensor feeds.</span>
        <span>IEEE C57.91-2011 Compliant</span>
      </div>
    </div>
  )
}
