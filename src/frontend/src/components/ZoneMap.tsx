import React, { useState } from 'react'
import type { ZoneRisk } from '../api/types'

const ZONE_FILL: Record<string, string> = {
  Critical: '#dc2626',
  High:     '#f97316',
  Medium:   '#f59e0b',
  Low:      '#10b981',
}

const ZONE_POS: Record<string, { x: number; y: number; w: number; h: number }> = {
  'Zone-A': { x: 20,  y: 20,  w: 130, h: 120 },
  'Zone-B': { x: 170, y: 20,  w: 130, h: 120 },
  'Zone-C': { x: 20,  y: 160, w: 130, h: 120 },
  'Zone-D': { x: 170, y: 160, w: 130, h: 120 },
  'Zone-E': { x: 95,  y: 300, w: 130, h: 115 },
}

interface Props {
  zones: ZoneRisk[]
  onSelectZone?: (zone: string) => void
  onSelectAsset?: (assetId: string) => void
}

export default function ZoneMap({ zones, onSelectZone, onSelectAsset }: Props) {
  const [inspectedZone, setInspectedZone] = useState<string | null>(null)
  const zoneMap = Object.fromEntries(zones.map(z => [z.zone, z]))

  const handleZoneClick = (z: string) => {
    setInspectedZone(z === inspectedZone ? null : z)
    onSelectZone?.(z)
  }

  const activeZoneObj = inspectedZone ? zoneMap[inspectedZone] : null

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6 border border-gray-200 relative flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            🗺️ Zone Risk Heatmap
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            5-Sector Geographic Health &amp; Vulnerability Matrix
          </p>
        </div>
        <span className="text-xs font-semibold bg-gray-100 text-gray-700 px-3 py-1 rounded-full border border-gray-200">
          Interactive Map
        </span>
      </div>

      {/* SVG Map (Clean Cards - Dotted lines and 3 colored dots removed) */}
      <div className="bg-gray-50/70 rounded-2xl p-2 border border-gray-200/80">
        <svg viewBox="0 0 320 430" className="w-full max-h-88 select-none">
          <defs>
            <filter id="zoneShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.08" />
            </filter>
          </defs>

          {/* Clean Zone Rectangles */}
          {Object.entries(ZONE_POS).map(([zone, pos]) => {
            const data = zoneMap[zone]
            const fill = data ? ZONE_FILL[data.zone_severity] : '#94a3b8'
            const score = data ? (data.zone_risk_score * 100).toFixed(0) : '?'
            const isSelected = inspectedZone === zone

            return (
              <g
                key={zone}
                onClick={() => handleZoneClick(zone)}
                className="cursor-pointer group"
                filter="url(#zoneShadow)">
                <rect
                  x={pos.x} y={pos.y} width={pos.w} height={pos.h}
                  rx="16" fill={fill} fillOpacity={isSelected ? 0.28 : 0.12}
                  stroke={isSelected ? '#0f172a' : fill} strokeWidth={isSelected ? 2.5 : 1.5}
                  className="transition-all duration-200 group-hover:fill-opacity-25"
                />
                <text x={pos.x + pos.w / 2} y={pos.y + 30} textAnchor="middle"
                  fontSize="15" fontWeight="800" fill="#0f172a">
                  {zone}
                </text>
                <text x={pos.x + pos.w / 2} y={pos.y + 60} textAnchor="middle"
                  fontSize="26" fontWeight="800" fill={fill} fontFamily="monospace">
                  {score}%
                </text>
                <text x={pos.x + pos.w / 2} y={pos.y + 82} textAnchor="middle"
                  fontSize="13" fontWeight="700" fill="#334155" letterSpacing="0.5">
                  {data?.zone_severity ?? '—'}
                </text>
                {data && (
                  <text x={pos.x + pos.w / 2} y={pos.y + 102} textAnchor="middle"
                    fontSize="11" fontWeight="600" fill="#64748b">
                    {data.asset_count} assets · {Math.round(data.total_customers / 1000)}k cust.
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-gray-200 text-xs">
        <div className="flex gap-3 flex-wrap">
          {Object.entries(ZONE_FILL).map(([label, color]) => (
            <span key={label} className="flex items-center gap-1.5 font-semibold text-gray-700 text-xs">
              <span className="w-2.5 h-2.5 rounded-full inline-block shadow-xs" style={{ background: color }} />
              {label}
            </span>
          ))}
        </div>
        <span className="text-xs text-gray-400 font-medium">Click sector for breakdown</span>
      </div>

      {/* Slide-out Zone Inspection Drawer */}
      {activeZoneObj && (
        <div className="mt-4 p-4 bg-gray-900 text-white rounded-2xl border border-gray-800 shadow-xl text-xs space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white flex items-center gap-2 text-sm">
              📍 {activeZoneObj.zone} Operational Breakdown
            </h4>
            <button
              onClick={() => setInspectedZone(null)}
              className="text-gray-400 hover:text-white font-bold text-xs bg-gray-800 px-2 py-0.5 rounded-md transition">
              ✕ Close
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-800/80 p-2.5 rounded-xl border border-gray-700/50">
              <span className="text-gray-400 block text-[11px]">Load Capacity:</span>
              <strong className="text-cyan-400 font-mono text-sm">{activeZoneObj.total_capacity_mva} MVA</strong>
            </div>
            <div className="bg-gray-800/80 p-2.5 rounded-xl border border-gray-700/50">
              <span className="text-gray-400 block text-[11px]">Customers:</span>
              <strong className="text-white font-mono text-sm">{activeZoneObj.total_customers.toLocaleString()}</strong>
            </div>
            <div className="bg-gray-800/80 p-2.5 rounded-xl border border-gray-700/50">
              <span className="text-gray-400 block text-[11px]">Critical Equipment:</span>
              <strong className="text-red-400 font-mono text-sm">{activeZoneObj.critical_assets}</strong>
            </div>
            <div className="bg-gray-800/80 p-2.5 rounded-xl border border-gray-700/50">
              <span className="text-gray-400 block text-[11px]">High Vulnerability:</span>
              <strong className="text-amber-400 font-mono text-sm">{activeZoneObj.high_assets}</strong>
            </div>
          </div>

          <div>
            <span className="text-gray-400 text-xs font-semibold block mb-1.5">Connected Equipment in {activeZoneObj.zone}:</span>
            <div className="flex flex-wrap gap-2">
              {activeZoneObj.asset_ids.map(aid => (
                <button
                  key={aid}
                  onClick={() => onSelectAsset?.(aid)}
                  className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-xs font-mono font-bold transition">
                  {aid} →
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
