import type { ZoneRisk } from '../api/types'

const ZONE_FILL: Record<string, string> = {
  Critical: '#ef4444',
  High:     '#f97316',
  Medium:   '#eab308',
  Low:      '#22c55e',
}

const ZONE_POS: Record<string, { x: number; y: number; w: number; h: number }> = {
  'Zone-A': { x: 20,  y: 20,  w: 130, h: 110 },
  'Zone-B': { x: 170, y: 20,  w: 130, h: 110 },
  'Zone-C': { x: 20,  y: 150, w: 130, h: 110 },
  'Zone-D': { x: 170, y: 150, w: 130, h: 110 },
  'Zone-E': { x: 95,  y: 280, w: 130, h: 110 },
}

interface Props { zones: ZoneRisk[]; onSelectZone?: (zone: string) => void }

export default function ZoneMap({ zones, onSelectZone }: Props) {
  const zoneMap = Object.fromEntries(zones.map(z => [z.zone, z]))

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h2 className="text-lg font-bold text-gray-800 mb-3">🗺️ Zone Risk Heatmap</h2>
      <svg viewBox="0 0 320 410" className="w-full max-h-80">
        {Object.entries(ZONE_POS).map(([zone, pos]) => {
          const data = zoneMap[zone]
          const fill = data ? ZONE_FILL[data.zone_severity] : '#d1d5db'
          const score = data ? (data.zone_risk_score * 100).toFixed(0) : '?'
          return (
            <g key={zone} onClick={() => onSelectZone?.(zone)} className="cursor-pointer">
              <rect
                x={pos.x} y={pos.y} width={pos.w} height={pos.h}
                rx="12" fill={fill} fillOpacity={0.25}
                stroke={fill} strokeWidth={2}
              />
              <text x={pos.x + pos.w / 2} y={pos.y + 30} textAnchor="middle"
                fontSize="13" fontWeight="bold" fill="#1f2937">
                {zone}
              </text>
              <text x={pos.x + pos.w / 2} y={pos.y + 52} textAnchor="middle"
                fontSize="22" fontWeight="bold" fill={fill}>
                {score}%
              </text>
              <text x={pos.x + pos.w / 2} y={pos.y + 72} textAnchor="middle"
                fontSize="11" fill="#374151">
                {data?.zone_severity ?? '—'}
              </text>
              {data && (
                <text x={pos.x + pos.w / 2} y={pos.y + 92} textAnchor="middle"
                  fontSize="10" fill="#6b7280">
                  {data.asset_count} assets · {data.total_customers.toLocaleString()} cust.
                </text>
              )}
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <div className="flex gap-3 mt-2 flex-wrap text-xs">
        {Object.entries(ZONE_FILL).map(([label, color]) => (
          <span key={label} className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: color, opacity: 0.6 }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
