import { useState } from 'react'
import type { RiskResult } from '../api/types'

const SEVERITY_COLOR: Record<string, string> = {
  Critical: 'bg-black text-white border border-black',
  High:     'bg-zinc-800 text-white border border-zinc-800',
  Medium:   'bg-zinc-700 text-white border border-zinc-700',
  Low:      'bg-white text-black border border-black',
}

const SEVERITY_BAR: Record<string, string> = {
  Critical: 'bg-black',
  High:     'bg-zinc-800',
  Medium:   'bg-zinc-700',
  Low:      'bg-white border border-black',
}

interface Props {
  assets: RiskResult[]
  onSelectAsset: (id: string) => void
}

type SortKey = 'rank' | 'risk_score' | 'priority_score' | 'customers_served' | 'age_years'

export default function RiskRankingTable({ assets, onSelectAsset }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('rank')
  const [filterSeverity, setFilterSeverity] = useState<string>('All')

  const sorted = [...assets]
    .filter(a => filterSeverity === 'All' || a.severity_label === filterSeverity)
    .sort((a, b) => {
      if (sortKey === 'rank') return a.rank - b.rank
      return (b[sortKey] as number) - (a[sortKey] as number)
    })

  const thClass = 'px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:text-black'

  return (
    <div className="bg-white rounded-2xl shadow p-4 border border-black/10">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-black">🏭 Asset Risk Ranking</h2>
        <div className="flex gap-2 text-xs">
          {['All', 'Critical', 'High', 'Medium', 'Low'].map(s => (
            <button
              key={s}
              onClick={() => setFilterSeverity(s)}
              className={`px-2 py-1 rounded-full border ${filterSeverity === s ? 'bg-black text-white border-black' : 'border-black text-black hover:bg-black hover:text-white'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr>
              <th className={thClass} onClick={() => setSortKey('rank')}>#</th>
              <th className={thClass}>Asset</th>
              <th className={thClass}>Type</th>
              <th className={thClass}>Zone</th>
              <th className={thClass} onClick={() => setSortKey('risk_score')}>Risk Score</th>
              <th className={thClass}>Severity</th>
              <th className={thClass} onClick={() => setSortKey('customers_served')}>Customers</th>
              <th className={thClass} onClick={() => setSortKey('age_years')}>Age</th>
              <th className={thClass}>Temp °C</th>
              <th className={thClass}>PD pC</th>
              <th className={thClass}>Oil</th>
              <th className={thClass}>Detail</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(a => (
              <tr key={a.asset_id} className="border-b hover:bg-black hover:text-white transition-colors">
                <td className="px-3 py-2 font-bold text-gray-600">{a.rank}</td>
                <td className="px-3 py-2 font-semibold text-black">{a.asset_id}</td>
                <td className="px-3 py-2 capitalize text-gray-700">{a.asset_type}</td>
                <td className="px-3 py-2 text-gray-700">{a.zone}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full">
                      <div
                        className={`h-2 rounded-full ${SEVERITY_BAR[a.severity_label]}`}
                        style={{ width: `${a.risk_score * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono">{(a.risk_score * 100).toFixed(0)}%</span>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${SEVERITY_COLOR[a.severity_label]}`}>
                    {a.severity_label}
                  </span>
                </td>
                <td className="px-3 py-2 text-gray-700">{a.customers_served.toLocaleString()}</td>
                <td className="px-3 py-2 text-gray-700">{a.age_years}y</td>
                <td className={`px-3 py-2 font-mono text-xs ${a.latest_temperature_c > 85 ? 'text-black font-bold' : 'text-gray-700'}`}>
                  {a.latest_temperature_c}
                </td>
                <td className={`px-3 py-2 font-mono text-xs ${a.latest_partial_discharge_pc > 150 ? 'text-black font-bold' : 'text-gray-700'}`}>
                  {a.latest_partial_discharge_pc}
                </td>
                <td className={`px-3 py-2 font-mono text-xs ${a.latest_oil_quality_index < 60 ? 'text-black font-bold' : 'text-gray-700'}`}>
                  {a.latest_oil_quality_index}
                </td>
                <td className="px-3 py-2">
                  <button
                    onClick={() => onSelectAsset(a.asset_id)}
                    className="text-xs text-black hover:underline font-bold"
                  >
                    View →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
