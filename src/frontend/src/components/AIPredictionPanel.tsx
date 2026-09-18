import React, { useState } from 'react'
import type { AIPredictionItem } from '../api/types'

interface Props {
  predictions: AIPredictionItem[]
  onSelectAsset?: (assetId: string) => void
}

export default function AIPredictionPanel({ predictions, onSelectAsset }: Props) {
  const [filterSeverity, setFilterSeverity] = useState('All')

  const filtered = predictions.filter(p => filterSeverity === 'All' || p.severity_label === filterSeverity)

  return (
    <div className="bg-white/95 rounded-3xl shadow-xl shadow-slate-200/80 p-6 sm:p-8 border border-slate-200 backdrop-blur-md space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            🤖 AI Outage &amp; Failure-Risk Prediction Engine
          </h2>
          <p className="text-sm text-slate-600 font-medium mt-1">
            Predictive machine learning models estimate equipment failure probability, lead time horizon, and customer outage exposure.
          </p>
        </div>

        {/* Severity Filter */}
        <div className="flex gap-2 flex-wrap text-xs font-bold">
          {['All', 'Critical', 'High', 'Medium', 'Low'].map(s => (
            <button
              key={s}
              onClick={() => setFilterSeverity(s)}
              className={`px-3.5 py-1.5 rounded-xl border text-xs font-extrabold transition ${
                filterSeverity === s
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white border-slate-300 text-slate-700 hover:border-slate-500'
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* High-level Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-gradient-to-br from-red-50 to-rose-100/60 rounded-2xl border border-red-200 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-red-700">Immediate Outage Threat</p>
          <p className="text-3xl font-extrabold font-mono text-red-600 mt-2">
            {predictions.filter(p => p.severity_label === 'Critical').length} Units
          </p>
          <p className="text-xs text-red-600 font-medium mt-1">Predicted failure within 6-12h horizon</p>
        </div>

        <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-100/60 rounded-2xl border border-amber-200 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-800">Model Inference Confidence</p>
          <p className="text-3xl font-extrabold font-mono text-amber-900 mt-2">94.8%</p>
          <p className="text-xs text-amber-700 font-medium mt-1">Cross-validated SCADA telemetry</p>
        </div>

        <div className="p-5 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-700">Accounts at Critical Risk</p>
          <p className="text-3xl font-extrabold font-mono text-slate-900 mt-2">
            {predictions
              .filter(p => p.severity_label === 'Critical')
              .reduce((acc, curr) => acc + curr.customers_at_risk, 0)
              .toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 font-medium mt-1">High probability of interruption</p>
        </div>

        <div className="p-5 bg-gradient-to-br from-cyan-50 to-blue-100/60 rounded-2xl border border-cyan-200 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-cyan-800">Pre-Outage Action Window</p>
          <p className="text-3xl font-extrabold font-mono text-blue-900 mt-2">&lt; 4 Hours</p>
          <p className="text-xs text-cyan-700 font-medium mt-1">Optimal crew intervention window</p>
        </div>
      </div>

      {/* Predictions Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map(p => {
          const isCrit = p.severity_label === 'Critical'
          const isHigh = p.severity_label === 'High'
          return (
            <div
              key={p.asset_id}
              className={`p-6 rounded-2xl border transition-all hover:shadow-lg flex flex-col justify-between ${
                isCrit
                  ? 'border-red-300 bg-gradient-to-br from-red-50/40 via-white to-white ring-1 ring-red-400/20'
                  : isHigh
                  ? 'border-amber-300 bg-gradient-to-br from-amber-50/30 via-white to-white'
                  : 'border-slate-200 bg-white'
              }`}>
              
              <div className="space-y-4">
                {/* Card Top */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="font-extrabold text-lg font-mono text-slate-900">{p.asset_id}</span>
                    <span className="text-xs text-slate-500 font-bold capitalize bg-slate-100 px-2.5 py-1 rounded-lg">
                      {p.asset_type} · {p.zone}
                    </span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                    isCrit ? 'bg-red-600 text-white' : isHigh ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-800'
                  }`}>
                    {p.severity_label}
                  </span>
                </div>

                {/* Probability Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700">Estimated Failure Probability:</span>
                    <span className="font-mono text-sm text-red-600 font-extrabold">{p.failure_probability_pct}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isCrit ? 'bg-gradient-to-r from-red-500 to-rose-600' : isHigh ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${p.failure_probability_pct}%` }}
                    />
                  </div>
                </div>

                {/* Key Telemetry Stressors */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 space-y-1.5 font-medium">
                  <p><strong className="text-slate-900 font-bold">Primary Stressor:</strong> {p.critical_reason}</p>
                  <p className="text-slate-600">
                    <strong className="text-slate-900 font-bold">Time Horizon to Outage:</strong>{' '}
                    <span className="font-mono font-extrabold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">{p.failure_window}</span> (Est. duration {p.outage_duration_est_hours}h)
                  </p>
                  <p className="text-slate-600">
                    <strong className="text-slate-900 font-bold">Customer Exposure:</strong> {p.customers_at_risk.toLocaleString()} metered accounts
                  </p>
                </div>

                {/* Action recommendation */}
                <div className="p-3.5 bg-cyan-50/70 rounded-xl border border-cyan-200 text-xs text-slate-800 font-medium">
                  <span className="font-extrabold text-cyan-950 block mb-1">⚡ Recommended Mitigation:</span>
                  <p className="text-slate-700">{p.recommended_mitigation}</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
                <span className="text-xs text-slate-500 font-medium">
                  Model Confidence: <strong className="font-mono text-slate-900 font-bold">{p.confidence_score_pct}%</strong>
                </span>
                {onSelectAsset && (
                  <button
                    onClick={() => onSelectAsset(p.asset_id)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold transition shadow-xs">
                    Inspect Asset Diagnostics →
                  </button>
                )}
              </div>

            </div>
          )
        })}
      </div>

    </div>
  )
}
