import React, { useState, useMemo } from 'react'
import type { RiskResult } from '../api/types'

const SEVERITY_BADGE: Record<string, string> = {
  Critical: 'bg-red-50 text-red-700 border-2 border-red-200 ring-2 ring-red-500/10 font-bold',
  High:     'bg-amber-50 text-amber-800 border-2 border-amber-200 ring-2 ring-amber-500/10 font-bold',
  Medium:   'bg-yellow-50 text-yellow-900 border-2 border-yellow-200 font-bold',
  Low:      'bg-emerald-50 text-emerald-800 border-2 border-emerald-200 font-bold',
}

const SEVERITY_BAR: Record<string, string> = {
  Critical: 'bg-gradient-to-r from-red-500 to-rose-600',
  High:     'bg-gradient-to-r from-amber-500 to-orange-500',
  Medium:   'bg-gradient-to-r from-yellow-400 to-amber-400',
  Low:      'bg-gradient-to-r from-emerald-400 to-teal-500',
}

interface Props {
  assets: RiskResult[]
  onSelectAsset: (assetId: string) => void
}

type SortKey = 'rank' | 'risk_score' | 'priority_score' | 'customers_served' | 'age_years' | 'capacity_mva' | 'latest_temperature_c'

export default function AssetRegistry({ assets, onSelectAsset }: Props) {
  const [search, setSearch] = useState('')
  const [filterSeverity, setFilterSeverity] = useState('All')
  const [filterType, setFilterType] = useState('All')
  const [filterZone, setFilterZone] = useState('All')
  const [sortKey, setSortKey] = useState<SortKey>('rank')
  const [sortAsc, setSortAsc] = useState(true)

  const filteredAssets = useMemo(() => {
    return assets.filter(a => {
      const matchSearch = search.trim() === '' ||
        a.asset_id.toLowerCase().includes(search.toLowerCase()) ||
        a.zone.toLowerCase().includes(search.toLowerCase()) ||
        a.asset_type.toLowerCase().includes(search.toLowerCase())
      const matchSev = filterSeverity === 'All' || a.severity_label === filterSeverity
      const matchType = filterType === 'All' || a.asset_type.toLowerCase() === filterType.toLowerCase()
      const matchZone = filterZone === 'All' || a.zone === filterZone
      return matchSearch && matchSev && matchType && matchZone
    }).sort((a, b) => {
      const va = a[sortKey]
      const vb = b[sortKey]
      if (typeof va === 'number' && typeof vb === 'number') {
        return sortAsc ? va - vb : vb - va
      }
      const sa = String(va).toLowerCase()
      const sb = String(vb).toLowerCase()
      if (sa < sb) return sortAsc ? -1 : 1
      if (sa > sb) return sortAsc ? 1 : -1
      return 0
    })
  }, [assets, search, filterSeverity, filterType, filterZone, sortKey, sortAsc])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc)
    } else {
      setSortKey(key)
      setSortAsc(key === 'rank')
    }
  }

  const exportCSV = () => {
    const headers = ['Asset ID', 'Type', 'Zone', 'Capacity MVA', 'Age (Y)', 'Customers', 'Risk Score', 'Priority', 'Severity', 'Temp C', 'PD pC', 'Oil Quality', 'Load %']
    const rows = filteredAssets.map(a => [
      a.asset_id,
      a.asset_type,
      a.zone,
      a.capacity_mva,
      a.age_years,
      a.customers_served,
      (a.risk_score * 100).toFixed(1) + '%',
      a.priority_score.toFixed(1),
      a.severity_label,
      a.latest_temperature_c,
      a.latest_partial_discharge_pc,
      a.latest_oil_quality_index,
      a.latest_load_percent + '%',
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `grid_assets_registry_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredAssets, null, 2))
    const link = document.createElement('a')
    link.setAttribute('href', dataStr)
    link.setAttribute('download', `grid_assets_registry_${new Date().toISOString().slice(0, 10)}.json`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="bg-white/95 rounded-3xl shadow-xl shadow-slate-200/80 p-6 sm:p-8 border border-slate-200 backdrop-blur-md space-y-6">
      
      {/* Header & Export controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              🔍 Grid Asset Inventory &amp; Telemetry Registry
            </h2>
            <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-300">
              {filteredAssets.length} Assets
            </span>
          </div>
          <p className="text-sm text-slate-600 font-medium mt-1">
            Real-time physical equipment register with high-voltage sensor baselines, age risk factors, and customer exposure.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 transition shadow-xs flex items-center gap-1.5">
            📥 Export CSV
          </button>
          <button
            onClick={exportJSON}
            className="px-4 py-2 bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 transition shadow-xs flex items-center gap-1.5">
            📄 Export JSON
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5 p-4 bg-slate-50 rounded-2xl border border-slate-200">
        
        {/* Search */}
        <div className="md:col-span-2 relative">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by ID, Zone or Type…"
            className="w-full text-sm bg-white border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent font-medium shadow-xs"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-3 text-xs text-slate-400 hover:text-slate-800 font-bold">
              ✕
            </button>
          )}
        </div>

        {/* Severity */}
        <div>
          <select
            value={filterSeverity}
            onChange={e => setFilterSeverity(e.target.value)}
            className="w-full text-sm bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-700 font-semibold shadow-xs">
            <option value="All">All Severities</option>
            <option value="Critical">Critical Only</option>
            <option value="High">High Only</option>
            <option value="Medium">Medium Only</option>
            <option value="Low">Low Only</option>
          </select>
        </div>

        {/* Type */}
        <div>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="w-full text-sm bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-700 font-semibold shadow-xs">
            <option value="All">All Equipment</option>
            <option value="transformer">Transformers</option>
            <option value="substation">Substations</option>
            <option value="feeder">Feeders</option>
          </select>
        </div>

        {/* Zone */}
        <div>
          <select
            value={filterZone}
            onChange={e => setFilterZone(e.target.value)}
            className="w-full text-sm bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-700 font-semibold shadow-xs">
            <option value="All">All Grid Sectors</option>
            <option value="Zone-A">Zone-A</option>
            <option value="Zone-B">Zone-B</option>
            <option value="Zone-C">Zone-C</option>
            <option value="Zone-D">Zone-D</option>
            <option value="Zone-E">Zone-E</option>
          </select>
        </div>

      </div>

      {/* Asset Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-sm text-left">
          <thead className="text-xs font-extrabold text-slate-600 uppercase bg-slate-100 border-b border-slate-200 tracking-wider">
            <tr>
              <th onClick={() => handleSort('rank')} className="px-4 py-3.5 cursor-pointer hover:text-slate-900">
                Rank {sortKey === 'rank' && (sortAsc ? '↑' : '↓')}
              </th>
              <th className="px-4 py-3.5">Asset ID</th>
              <th className="px-4 py-3.5">Type</th>
              <th className="px-4 py-3.5">Sector</th>
              <th onClick={() => handleSort('risk_score')} className="px-4 py-3.5 cursor-pointer hover:text-slate-900">
                Risk Score {sortKey === 'risk_score' && (sortAsc ? '↑' : '↓')}
              </th>
              <th className="px-4 py-3.5">Condition</th>
              <th onClick={() => handleSort('customers_served')} className="px-4 py-3.5 cursor-pointer hover:text-slate-900">
                Customers {sortKey === 'customers_served' && (sortAsc ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('age_years')} className="px-4 py-3.5 cursor-pointer hover:text-slate-900">
                Age {sortKey === 'age_years' && (sortAsc ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('latest_temperature_c')} className="px-4 py-3.5 cursor-pointer hover:text-slate-900">
                Core Temp {sortKey === 'latest_temperature_c' && (sortAsc ? '↑' : '↓')}
              </th>
              <th className="px-4 py-3.5">Acoustic PD</th>
              <th className="px-4 py-3.5">Oil Index</th>
              <th className="px-4 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredAssets.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-4 py-12 text-center text-slate-400 font-medium">
                  No assets match your search or filter criteria.
                </td>
              </tr>
            ) : (
              filteredAssets.map(a => (
                <tr key={a.asset_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-sm font-bold text-slate-400">#{a.rank}</td>
                  <td className="px-4 py-3.5 font-bold font-mono text-base text-slate-900">
                    <button
                      onClick={() => onSelectAsset(a.asset_id)}
                      className="hover:underline hover:text-blue-600 text-left font-extrabold">
                      {a.asset_id}
                    </button>
                  </td>
                  <td className="px-4 py-3.5 capitalize text-slate-700 font-medium">{a.asset_type}</td>
                  <td className="px-4 py-3.5 text-slate-700 font-semibold">{a.zone}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-20 h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div
                          className={`h-full ${SEVERITY_BAR[a.severity_label]}`}
                          style={{ width: `${a.risk_score * 100}%` }}
                        />
                      </div>
                      <span className="font-mono text-sm font-extrabold text-slate-900">{(a.risk_score * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${SEVERITY_BADGE[a.severity_label]}`}>
                      {a.severity_label}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-700 font-medium">{a.customers_served.toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-slate-700 font-medium">{a.age_years} yrs</td>
                  <td className={`px-4 py-3.5 font-mono font-bold ${a.latest_temperature_c > 85 ? 'text-red-600 font-extrabold' : 'text-slate-800'}`}>
                    {a.latest_temperature_c}°C
                  </td>
                  <td className={`px-4 py-3.5 font-mono font-bold ${a.latest_partial_discharge_pc > 150 ? 'text-red-600 font-extrabold' : 'text-slate-800'}`}>
                    {a.latest_partial_discharge_pc} pC
                  </td>
                  <td className={`px-4 py-3.5 font-mono font-bold ${a.latest_oil_quality_index < 60 ? 'text-red-600 font-extrabold' : 'text-slate-800'}`}>
                    {a.latest_oil_quality_index}/100
                  </td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <button
                      onClick={() => onSelectAsset(a.asset_id)}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold shadow-sm transition transform hover:scale-102">
                      Inspect →
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="pt-2 flex flex-wrap items-center justify-between text-xs text-slate-500 font-medium">
        <span>Showing <strong className="text-slate-800 font-bold">{filteredAssets.length}</strong> of {assets.length} monitored grid units</span>
        <span>Click any column header to sort · Click asset ID or Inspect to trigger full diagnostic suite</span>
      </div>

    </div>
  )
}
