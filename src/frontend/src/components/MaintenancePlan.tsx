import type { MaintenanceAction } from '../api/types'

const SEVERITY_STYLE: Record<string, string> = {
  Critical: 'border-l-4 border-red-500 bg-red-50',
  High:     'border-l-4 border-orange-500 bg-orange-50',
  Medium:   'border-l-4 border-yellow-500 bg-yellow-50',
  Low:      'border-l-4 border-green-500 bg-green-50',
}

const BADGE: Record<string, string> = {
  Critical: 'bg-red-100 text-red-700',
  High:     'bg-orange-100 text-orange-700',
  Medium:   'bg-yellow-100 text-yellow-700',
  Low:      'bg-green-100 text-green-700',
}

function formatDeadline(isoStr: string): string {
  const dt = new Date(isoStr)
  const now = new Date()
  const diffH = (dt.getTime() - now.getTime()) / 3600000
  if (diffH < 0) return 'OVERDUE'
  if (diffH < 1) return `${Math.round(diffH * 60)} min`
  if (diffH < 24) return `${diffH.toFixed(0)}h`
  return `${(diffH / 24).toFixed(0)} days`
}

interface Props { actions: MaintenanceAction[] }

export default function MaintenancePlan({ actions }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h2 className="text-lg font-bold text-gray-800 mb-4">🔧 Maintenance Priority Plan</h2>
      <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
        {actions.map(a => (
          <div key={a.asset_id} className={`rounded-xl p-3 ${SEVERITY_STYLE[a.severity_label]}`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-gray-800">{a.asset_id}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${BADGE[a.severity_label]}`}>
                    {a.severity_label}
                  </span>
                  <span className="text-xs text-gray-500">{a.zone}</span>
                  <span className="text-xs text-gray-500 capitalize">{a.asset_type}</span>
                </div>
                <p className="text-sm font-semibold text-gray-700 mt-1">{a.action}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{a.action_detail}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-lg font-bold text-gray-700">{formatDeadline(a.deadline_iso)}</div>
                <div className="text-xs text-gray-400">deadline</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {a.required_skills.map(sk => (
                <span key={sk} className="text-xs bg-white px-2 py-0.5 rounded-full border border-gray-200 text-gray-600">
                  {sk}
                </span>
              ))}
              <span className="text-xs text-gray-400 ml-auto">
                Est. {a.estimated_duration_hours}h · {a.customers_at_risk.toLocaleString()} customers
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
