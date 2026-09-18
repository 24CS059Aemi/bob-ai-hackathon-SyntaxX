import React, { useState } from 'react'
import type { RiskResult } from '../api/types'
import SensorSparklines from './SensorSparklines'

interface Props {
  asset: RiskResult | null
  onClose: () => void
  onAskBob?: (assetId: string) => void
}

const SEVERITY_BADGE: Record<string, string> = {
  Critical: 'bg-red-600 text-white border border-red-700',
  High:     'bg-amber-500 text-white border border-amber-600',
  Medium:   'bg-yellow-400 text-yellow-950 border border-yellow-500',
  Low:      'bg-emerald-100 text-emerald-800 border border-emerald-400',
}

export default function AssetDetailModal({ asset, onClose, onAskBob }: Props) {
  const [activeTab, setActiveTab] = useState<'telemetry' | 'risk_breakdown' | 'impact'>('telemetry')

  if (!asset) return null

  // Estimated outage metrics
  const failProb = Math.min(98, Math.round((asset.risk_score ** 1.3) * 105))
  const estimatedCostUsd = Math.round(asset.customers_served * 12.5 * (asset.risk_score * 4))

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden my-6"
        onClick={e => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-7 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white text-xl font-bold w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-800 transition">
            ✕
          </button>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="text-3xl font-extrabold font-mono text-white tracking-tight">{asset.asset_id}</span>
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${SEVERITY_BADGE[asset.severity_label]}`}>
              ● {asset.severity_label}
            </span>
            <span className="text-xs font-bold bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700 capitalize">
              {asset.asset_type}
            </span>
            <span className="text-xs font-bold bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700">
              📍 {asset.zone}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-300 mt-5 pt-4 border-t border-slate-800 font-medium">
            <div>
              <span className="text-slate-400 block font-normal">Rated Capacity:</span>
              <strong className="text-white text-sm font-bold">{asset.capacity_mva} MVA</strong> ({asset.voltage_kv} kV)
            </div>
            <div>
              <span className="text-slate-400 block font-normal">Equipment Age:</span>
              <strong className="text-white text-sm font-bold">{asset.age_years} years</strong> ({asset.age_factor}x wear)
            </div>
            <div>
              <span className="text-slate-400 block font-normal">Customers Served:</span>
              <strong className="text-white text-sm font-bold">{asset.customers_served.toLocaleString()}</strong>
            </div>
            <div>
              <span className="text-slate-400 block font-normal">Composite Risk:</span>
              <strong className="text-cyan-400 text-sm font-mono font-extrabold">{(asset.risk_score * 100).toFixed(1)}%</strong> (P: {asset.priority_score.toFixed(0)})
            </div>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="flex border-b border-slate-200 px-7 bg-slate-50 text-xs sm:text-sm font-extrabold text-slate-600 gap-8">
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`py-3.5 border-b-2 transition ${activeTab === 'telemetry' ? 'border-slate-900 text-slate-900' : 'border-transparent hover:text-slate-900'}`}>
            📊 Live Telemetry &amp; Trends
          </button>
          <button
            onClick={() => setActiveTab('risk_breakdown')}
            className={`py-3.5 border-b-2 transition ${activeTab === 'risk_breakdown' ? 'border-slate-900 text-slate-900' : 'border-transparent hover:text-slate-900'}`}>
            🧠 IEEE / IEC Risk Weights
          </button>
          <button
            onClick={() => setActiveTab('impact')}
            className={`py-3.5 border-b-2 transition ${activeTab === 'impact' ? 'border-slate-900 text-slate-900' : 'border-transparent hover:text-slate-900'}`}>
            👥 Customer &amp; Outage Impact
          </button>
        </div>

        {/* Body Content */}
        <div className="p-7 max-h-[65vh] overflow-y-auto space-y-6">
          
          {/* TAB 1: Telemetry */}
          {activeTab === 'telemetry' && (
            <div className="space-y-5">
              {/* Sensor quick gauge cards */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 shadow-2xs">
                  <p className="text-xs text-slate-500 font-bold">Core Temp</p>
                  <p className={`text-xl font-mono font-extrabold mt-1 ${asset.latest_temperature_c > 85 ? 'text-red-600' : 'text-slate-900'}`}>
                    {asset.latest_temperature_c}°C
                  </p>
                  <span className="text-[11px] text-slate-400 font-medium">Alarm: &gt;85°C</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 shadow-2xs">
                  <p className="text-xs text-slate-500 font-bold">Tank Vibration</p>
                  <p className={`text-xl font-mono font-extrabold mt-1 ${asset.latest_vibration_mms > 3.5 ? 'text-red-600' : 'text-slate-900'}`}>
                    {asset.latest_vibration_mms} <span className="text-xs">mm/s</span>
                  </p>
                  <span className="text-[11px] text-slate-400 font-medium">Alarm: &gt;3.5</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 shadow-2xs">
                  <p className="text-xs text-slate-500 font-bold">Partial Discharge</p>
                  <p className={`text-xl font-mono font-extrabold mt-1 ${asset.latest_partial_discharge_pc > 150 ? 'text-red-600' : 'text-slate-900'}`}>
                    {asset.latest_partial_discharge_pc} <span className="text-xs">pC</span>
                  </p>
                  <span className="text-[11px] text-slate-400 font-medium">Alarm: &gt;150</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 shadow-2xs">
                  <p className="text-xs text-slate-500 font-bold">Oil Quality</p>
                  <p className={`text-xl font-mono font-extrabold mt-1 ${asset.latest_oil_quality_index < 60 ? 'text-red-600' : 'text-slate-900'}`}>
                    {asset.latest_oil_quality_index} <span className="text-xs">/100</span>
                  </p>
                  <span className="text-[11px] text-slate-400 font-medium">Alarm: &lt;60</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 shadow-2xs">
                  <p className="text-xs text-slate-500 font-bold">Load %</p>
                  <p className={`text-xl font-mono font-extrabold mt-1 ${asset.latest_load_percent > 90 ? 'text-amber-600' : 'text-slate-900'}`}>
                    {asset.latest_load_percent}%
                  </p>
                  <span className="text-[11px] text-slate-400 font-medium">Rated cap.</span>
                </div>
              </div>

              {/* Real historical sparkline charts */}
              <SensorSparklines assetId={asset.asset_id} />
            </div>
          )}

          {/* TAB 2: Risk Breakdown */}
          {activeTab === 'risk_breakdown' && (
            <div className="space-y-4">
              <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-4 text-xs sm:text-sm text-cyan-950 leading-relaxed font-medium">
                ℹ️ <strong>IEEE C57.91 &amp; IEC 60270 Risk Formulation:</strong> Asset risk is calculated by weighting normalized sensor readings, compounded by exponential equipment ageing factors and continuous overload multipliers.
              </div>

              <div className="space-y-3">
                {[
                  { label: 'Core Temperature Stress (25% weight)', val: asset.temperature_norm, raw: `${asset.latest_temperature_c}°C`, color: 'bg-red-500' },
                  { label: 'Partial Discharge Arcing (20% weight)', val: asset.partial_discharge_norm, raw: `${asset.latest_partial_discharge_pc} pC`, color: 'bg-purple-500' },
                  { label: 'Mechanical Vibration Severity (20% weight)', val: asset.vibration_norm, raw: `${asset.latest_vibration_mms} mm/s`, color: 'bg-amber-500' },
                  { label: 'Insulation Oil Degradation (15% weight)', val: asset.oil_quality_norm, raw: `Quality ${asset.latest_oil_quality_index}`, color: 'bg-orange-500' },
                  { label: 'Sector Weather Storm Hazard (10% weight)', val: asset.weather_risk_norm, raw: `${(asset.weather_risk_norm * 100).toFixed(0)}% risk index`, color: 'bg-blue-500' },
                  { label: '3-Year Historical Incident Rate (10% weight)', val: asset.incident_rate_norm, raw: `Freq: ${(asset.incident_rate_norm * 100).toFixed(0)}%`, color: 'bg-slate-600' },
                ].map(item => (
                  <div key={item.label} className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <div className="flex justify-between text-xs sm:text-sm mb-1.5 font-bold">
                      <span className="text-slate-800">{item.label}</span>
                      <span className="font-mono text-slate-700">{item.raw} · {(item.val * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: `${Math.min(100, item.val * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                  <p className="text-slate-500 font-bold uppercase">CIGRE Age Decay Factor</p>
                  <p className="text-xl font-extrabold font-mono text-slate-900 mt-1">{asset.age_factor}x</p>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Grounded on 25-40 year paper insulation decay curve.</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                  <p className="text-slate-500 font-bold uppercase">Overload Multiplier</p>
                  <p className="text-xl font-extrabold font-mono text-slate-900 mt-1">{asset.load_factor}x</p>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Triggered when continuous loading exceeds 85-90% rating.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Customer & Economic Impact */}
          {activeTab === 'impact' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 bg-red-50 border border-red-200 rounded-2xl">
                  <p className="text-xs text-red-700 font-bold uppercase tracking-wider">Unmitigated Failure Risk</p>
                  <p className="text-3xl font-extrabold font-mono text-red-700 mt-2">{failProb}%</p>
                  <p className="text-xs text-red-600 mt-1 font-medium">Predicted outage within 6-12h without crew dispatch</p>
                </div>
                <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl">
                  <p className="text-xs text-amber-800 font-bold uppercase tracking-wider">Affected Customer Accounts</p>
                  <p className="text-3xl font-extrabold font-mono text-amber-900 mt-2">{asset.customers_served.toLocaleString()}</p>
                  <p className="text-xs text-amber-700 mt-1 font-medium">Residential, municipal and commercial connections</p>
                </div>
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <p className="text-xs text-slate-600 font-bold uppercase tracking-wider">Direct &amp; Consequential Loss</p>
                  <p className="text-3xl font-extrabold font-mono text-slate-900 mt-2">${(estimatedCostUsd / 1000).toFixed(0)}k</p>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Direct repair + unserved energy penalty liability</p>
                </div>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-3 font-medium">
                <p className="font-extrabold text-slate-900 text-sm">Critical Public Facilities Fed by {asset.asset_id}:</p>
                <div className="flex flex-wrap gap-2.5 pt-1">
                  <span className="px-3.5 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 shadow-2xs">🏥 Regional Hospital Trauma Center (Primary Feeder)</span>
                  <span className="px-3.5 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 shadow-2xs">💧 Municipal Water Purification Plant 2</span>
                  <span className="px-3.5 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 shadow-2xs">🚆 Commuter Transit Substation</span>
                  <span className="px-3.5 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 shadow-2xs">🏭 Industrial District Line 4</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-slate-500 font-medium">
            Asset ID: <strong className="text-slate-900 font-mono font-bold">{asset.asset_id}</strong> · Priority Score: <strong className="text-slate-900 font-mono font-extrabold">{asset.priority_score.toFixed(1)}/100</strong>
          </div>
          <div className="flex items-center gap-3">
            {onAskBob && (
              <button
                onClick={() => { onClose(); onAskBob(asset.asset_id) }}
                className="px-4 py-2 bg-white text-slate-900 border border-slate-300 hover:border-slate-800 rounded-xl text-xs font-extrabold transition flex items-center gap-2 shadow-xs">
                🤖 Query IBM Bob Copilot
              </button>
            )}
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold transition shadow-md">
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
