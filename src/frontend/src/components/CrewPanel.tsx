import React, { useState } from 'react'
import type { CrewAssignment } from '../api/types'

const STATUS_STYLE: Record<string, string> = {
  DISPATCHED: 'bg-red-600 text-white',
  STAGING:    'bg-amber-500 text-white',
  SCHEDULED:  'bg-yellow-400 text-yellow-950',
  STANDBY:    'bg-emerald-50 text-emerald-800 border border-emerald-300',
  QUEUED:     'bg-slate-100 text-slate-700 border border-slate-300',
}

interface Props {
  assignments: CrewAssignment[]
  onSelectAsset?: (assetId: string) => void
  onReassignCrew?: (crewId: string, assetId: string) => void
}

export default function CrewPanel({ assignments, onSelectAsset, onReassignCrew }: Props) {
  const [reassignModal, setReassignModal] = useState<CrewAssignment | null>(null)
  const [targetAsset, setTargetAsset] = useState('T-01')

  const active    = assignments.filter(a => ['DISPATCHED', 'STAGING', 'SCHEDULED'].includes(a.status))
  const standby   = assignments.filter(a => a.status === 'STANDBY')
  const queued    = assignments.filter(a => a.status === 'QUEUED')

  const handleReassignConfirm = () => {
    if (reassignModal && onReassignCrew) {
      onReassignCrew(reassignModal.crew_id, targetAsset)
    }
    setReassignModal(null)
  }

  return (
    <div className="bg-white/95 rounded-3xl shadow-xl shadow-slate-200/80 p-6 sm:p-8 border border-slate-200 backdrop-blur-md space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            🚑 Crew Pre-Positioning &amp; Emergency Dispatch
          </h2>
          <p className="text-sm text-slate-600 font-medium mt-1">
            Real-time field personnel tracking, skill verification, travel-time matrix optimization, and proactive dispatch.
          </p>
        </div>
      </div>

      {/* Active assignments */}
      <div className="space-y-4">
        <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <span>⚡</span> Active Deployed Units ({active.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {active.map(a => (
            <div
              key={a.crew_id + a.assigned_asset_id}
              className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition space-y-4 flex flex-col justify-between shadow-xs">
              
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${STATUS_STYLE[a.status]}`}>
                      {a.status}
                    </span>
                    <span className="font-extrabold text-base text-slate-900">{a.crew_name}</span>
                    <span className="text-xs text-slate-500 font-mono font-bold">({a.crew_id})</span>
                  </div>
                  <div className="pt-2 text-sm text-slate-700 font-medium">
                    Target Asset:{' '}
                    <button
                      onClick={() => onSelectAsset?.(a.assigned_asset_id)}
                      className="font-extrabold font-mono text-blue-600 hover:underline">
                      {a.assigned_asset_id}
                    </button>{' '}
                    <span className="text-slate-500 font-normal">({a.assigned_asset_type} · {a.zone})</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 font-medium">{a.action}</p>
                </div>

                <div className="text-right shrink-0 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-xs">
                  <p className="text-base font-extrabold font-mono text-slate-900">{a.travel_minutes} min</p>
                  <p className="text-xs text-slate-500 font-medium">
                    ETA {new Date(a.estimated_arrival_iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {/* Reassign action */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs">
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <span>✓</span> High-Voltage Certified
                </span>
                <button
                  onClick={() => {
                    setReassignModal(a)
                    setTargetAsset(a.assigned_asset_id)
                  }}
                  className="px-3 py-1.5 bg-white border border-slate-300 hover:border-slate-800 rounded-xl text-xs font-bold text-slate-800 transition shadow-xs">
                  Reassign Target
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Standby & Queued units */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
        {/* Standby */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs">
          <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <span>🟢</span> Standby Quick-Response Teams ({standby.length})
          </h4>
          {standby.length === 0 ? (
            <p className="text-xs text-slate-400">All teams actively dispatched.</p>
          ) : (
            standby.map(c => (
              <div key={c.crew_id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <strong className="text-slate-900 font-bold block">{c.crew_name}</strong>
                  <span className="text-slate-500 font-medium">Base: {c.zone} · {c.action}</span>
                </div>
                <button
                  onClick={() => {
                    setReassignModal(c)
                    setTargetAsset('T-01')
                  }}
                  className="px-3 py-1.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 text-xs shadow-xs">
                  Dispatch →
                </button>
              </div>
            ))
          )}
        </div>

        {/* Queued */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs">
          <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <span>📋</span> Support Units ({queued.length})
          </h4>
          {queued.length === 0 ? (
            <p className="text-xs text-slate-400">No secondary crews queued.</p>
          ) : (
            queued.map(c => (
              <div key={c.crew_id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <strong className="text-slate-900 font-bold block">{c.crew_name}</strong>
                  <span className="text-slate-500 font-medium">Equipped for oil filtration &amp; transformer degasification</span>
                </div>
                <span className="text-xs text-slate-400 font-bold uppercase">{c.status}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Reassign Modal */}
      {reassignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <h3 className="text-lg font-extrabold text-slate-900">
              Reassign {reassignModal.crew_name}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Update field dispatch objective for this team. System automatically calculates new transit time and route.
            </p>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Target High-Risk Asset:
              </label>
              <select
                value={targetAsset}
                onChange={e => setTargetAsset(e.target.value)}
                className="w-full text-sm bg-white border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-slate-900">
                <option value="T-01">T-01 (Zone-A, Transformer - Critical)</option>
                <option value="S-01">S-01 (Zone-A, Substation - Critical)</option>
                <option value="T-05">T-05 (Zone-C, Transformer - Critical)</option>
                <option value="T-03">T-03 (Zone-B, Transformer - High)</option>
                <option value="F-02">F-02 (Zone-D, Feeder - High)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2.5 pt-3">
              <button
                onClick={() => setReassignModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 transition">
                Cancel
              </button>
              <button
                onClick={handleReassignConfirm}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold transition shadow-md">
                Confirm Deployment
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
