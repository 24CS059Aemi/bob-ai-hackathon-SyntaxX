import type { CrewAssignment } from '../api/types'

const STATUS_STYLE: Record<string, string> = {
  DISPATCHED: 'bg-red-600 text-white',
  STAGING:    'bg-orange-500 text-white',
  SCHEDULED:  'bg-amber-300 text-amber-950',
  STANDBY:    'bg-emerald-100 text-emerald-800 border border-emerald-400',
  QUEUED:     'bg-gray-100 text-gray-700 border border-gray-300',
}

interface Props { assignments: CrewAssignment[] }

export default function CrewPanel({ assignments }: Props) {
  const active    = assignments.filter(a => ['DISPATCHED', 'STAGING', 'SCHEDULED'].includes(a.status))
  const standby   = assignments.filter(a => a.status === 'STANDBY')
  const queued    = assignments.filter(a => a.status === 'QUEUED')

  return (
    <div className="bg-white rounded-2xl shadow p-4 border border-black/10">
      <h2 className="text-lg font-bold text-black mb-4">🚑 Crew Pre-Positioning</h2>

      {/* Active assignments */}
      <div className="space-y-2 mb-4">
        {active.map(a => (
          <div key={a.crew_id + a.assigned_asset_id}
            className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 border border-black/10">
            <div className="shrink-0">
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${STATUS_STYLE[a.status]}`}>
                {a.status}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-black truncate">{a.crew_name}</p>
              <p className="text-xs text-gray-600 truncate">→ {a.assigned_asset_id} ({a.zone})</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-gray-600">{a.travel_minutes} min travel</p>
              <p className="text-xs text-gray-500">
                ETA {new Date(a.estimated_arrival_iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Queued */}
      {queued.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Queued (no crew available)</p>
          {queued.map(a => (
            <div key={a.assigned_asset_id} className="text-xs text-gray-600 py-1 border-b border-black/10">
              {a.assigned_asset_id} ({a.zone}) — {a.action}
            </div>
          ))}
        </div>
      )}

      {/* Standby crews */}
      <div>
        <p className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Standby Crews</p>
        <div className="flex flex-wrap gap-2">
          {standby.map(a => (
            <span key={a.crew_id}
              className="text-xs bg-white border border-black text-black px-3 py-1 rounded-full">
              ✅ {a.crew_name} ({a.zone})
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
