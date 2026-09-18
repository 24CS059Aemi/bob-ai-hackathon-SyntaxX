import React, { useState } from 'react'
import type { AlertItem } from '../api/types'

interface Props {
  alerts: AlertItem[]
  onAcknowledge: (id: string) => void
  onResolve: (id: string) => void
  onSelectAsset?: (assetId: string) => void
}

const SEVERITY_STYLE: Record<string, { badge: string; border: string; bg: string }> = {
  Critical: {
    badge: 'bg-red-600 text-white',
    border: 'border-l-4 border-red-600',
    bg: 'bg-red-50/60',
  },
  High: {
    badge: 'bg-amber-600 text-white',
    border: 'border-l-4 border-amber-500',
    bg: 'bg-amber-50/60',
  },
  Warning: {
    badge: 'bg-yellow-400 text-yellow-950',
    border: 'border-l-4 border-yellow-400',
    bg: 'bg-yellow-50/60',
  },
  Info: {
    badge: 'bg-blue-600 text-white',
    border: 'border-l-4 border-blue-500',
    bg: 'bg-blue-50/60',
  },
}

export default function AlertCenter({ alerts, onAcknowledge, onResolve, onSelectAsset }: Props) {
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'acknowledged' | 'resolved'>('all')
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [soundEnabled, setSoundEnabled] = useState(true)

  const filtered = alerts.filter(a => {
    const matchStatus = statusFilter === 'all' || a.status === statusFilter
    const matchSev = severityFilter === 'all' || a.severity === severityFilter
    return matchStatus && matchSev
  })

  const activeCount = alerts.filter(a => a.status === 'active').length
  const ackCount = alerts.filter(a => a.status === 'acknowledged').length
  const resCount = alerts.filter(a => a.status === 'resolved').length

  return (
    <div className="bg-white/95 rounded-3xl shadow-xl shadow-slate-200/80 p-6 sm:p-8 border border-slate-200 backdrop-blur-md space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              🔴 Grid Alarm &amp; Emergency Incident Center
            </h2>
            {activeCount > 0 && (
              <span className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-extrabold shadow-sm animate-pulse">
                {activeCount} Active Alarms
              </span>
            )}
          </div>
          <p className="text-sm text-slate-600 font-medium mt-1">
            Real-time SCADA anomaly detection, storm squall triggers, and insulation breakdown threshold violations.
          </p>
        </div>

        {/* Sound toggle & quick stats */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold border transition flex items-center gap-2 shadow-xs ${
              soundEnabled
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-slate-100 text-slate-600 border-slate-300'
            }`}>
            {soundEnabled ? '🔔 Audio Alarms ON' : '🔕 Audio Alarms Muted'}
          </button>
        </div>
      </div>

      {/* Tabs for Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex gap-2 flex-wrap">
          {[
            { id: 'all', label: `All Alerts (${alerts.length})` },
            { id: 'active', label: `🔴 Active (${activeCount})` },
            { id: 'acknowledged', label: `🟡 Acknowledged (${ackCount})` },
            { id: 'resolved', label: `🟢 Resolved (${resCount})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Severity filter */}
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-bold text-slate-600">Filter Severity:</span>
          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="text-xs font-bold bg-white border border-slate-300 rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800 shadow-xs">
            <option value="all">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Warning">Warning</option>
            <option value="Info">Info</option>
          </select>
        </div>
      </div>

      {/* Alerts Stream */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm font-medium">
            ✅ No alarms currently in this view. All operating conditions normal.
          </div>
        ) : (
          filtered.map(a => {
            const style = SEVERITY_STYLE[a.severity] || SEVERITY_STYLE.Info
            return (
              <div
                key={a.id}
                className={`p-5 rounded-2xl border border-slate-200 ${style.border} ${style.bg} transition hover:shadow-md flex flex-col sm:flex-row sm:items-start justify-between gap-4`}>
                
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold shadow-xs ${style.badge}`}>
                      {a.severity}
                    </span>
                    <button
                      onClick={() => onSelectAsset?.(a.asset_id)}
                      className="font-extrabold text-base text-slate-900 font-mono hover:underline">
                      {a.asset_id}
                    </button>
                    <span className="text-xs text-slate-600 font-bold">· {a.zone}</span>
                    <span className="text-xs text-slate-500 font-mono">
                      {new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    <span className={`text-xs uppercase font-extrabold px-2.5 py-0.5 rounded-full ${
                      a.status === 'active' ? 'bg-red-100 text-red-700' :
                      a.status === 'acknowledged' ? 'bg-amber-100 text-amber-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {a.status}
                    </span>
                  </div>

                  <p className="text-sm font-bold text-slate-900">{a.title}</p>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">{a.description}</p>

                  {a.acknowledged_by && (
                    <p className="text-xs text-slate-500 pt-1 font-medium">
                      👤 Acknowledged by <strong className="text-slate-800 font-bold">{a.acknowledged_by}</strong> at {new Date(a.acknowledged_at || '').toLocaleTimeString()}
                    </p>
                  )}
                  {a.resolved_at && (
                    <p className="text-xs text-emerald-700 font-bold">
                      ✅ Resolved at {new Date(a.resolved_at).toLocaleTimeString()}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center sm:flex-col sm:items-end gap-2.5 shrink-0">
                  {a.status === 'active' && (
                    <button
                      onClick={() => onAcknowledge(a.id)}
                      className="px-4 py-2 bg-white border border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white rounded-xl text-xs font-extrabold transition shadow-xs">
                      Acknowledge
                    </button>
                  )}
                  {a.status !== 'resolved' && (
                    <button
                      onClick={() => onResolve(a.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition shadow-xs">
                      Mark Resolved
                    </button>
                  )}
                  {onSelectAsset && (
                    <button
                      onClick={() => onSelectAsset(a.asset_id)}
                      className="text-xs text-blue-600 hover:underline font-bold">
                      Inspect Asset →
                    </button>
                  )}
                </div>

              </div>
            )
          })
        )}
      </div>

    </div>
  )
}
