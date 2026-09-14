import { useState } from 'react'
import type { RiskResult } from '../api/types'

const SEVERITY_COLOR: Record<string, string> = {
  Critical: 'bg-red-100 text-red-700 border border-red-300',
  High:     'bg-orange-100 text-orange-700 border border-orange-300',
  Medium:   'bg-yellow-100 text-yellow-700 border border-yellow-300',
  Low:      'bg-green-100 text-green-700 border border-green-300',
}

const SEVERITY_BAR: Record<string, string> = {
  Critical: 'bg-red-500',
  High:     'bg-orange-500',
  Medium:   'bg-yellow-500',
  Low:      'bg-green-500',
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

  const thClass = 'px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase cursor-pointer hover:text-gray-800'

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-gray-800">🏭 Asset Risk Ranking</h2>
        <div className="flex gap-2 text-xs">
          {['All', 'Critical', 'High', 'Medium', 'Low'].map(s => (
            <button
              key={s}
              onClick={() => setFilterSeverity(s)}
              className={`px-2 py-1 rounded-full border ${filterSeverity === s ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
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
              <tr key={a.asset_id} className="border-b hover:bg-gray-50 transition-colors">
                <td className="px-3 py-2 font-bold text-gray-500">{a.rank}</td>
                <td className="px-3 py-2 font-semibold text-blue-700">{a.asset_id}</td>
                <td className="px-3 py-2 capitalize text-gray-600">{a.asset_type}</td>
                <td className="px-3 py-2 text-gray-600">{a.zone}</td>
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
                <td className="px-3 py-2 text-gray-600">{a.customers_served.toLocaleString()}</td>
                <td className="px-3 py-2 text-gray-600">{a.age_years}y</td>
                <td className={`px-3 py-2 font-mono text-xs ${a.latest_temperature_c > 85 ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                  {a.latest_temperature_c}
                </td>
                <td className={`px-3 py-2 font-mono text-xs ${a.latest_partial_discharge_pc > 150 ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                  {a.latest_partial_discharge_pc}
                </td>
                <td className={`px-3 py-2 font-mono text-xs ${a.latest_oil_quality_index < 60 ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                  {a.latest_oil_quality_index}
                </td>
                <td className="px-3 py-2">
                  <button
                    onClick={() => onSelectAsset(a.asset_id)}
                    className="text-xs text-blue-600 hover:underline"
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
