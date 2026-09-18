import React, { useState } from 'react'
import type { WeatherFusionItem } from '../api/types'

interface Props {
  zones: WeatherFusionItem[]
  onSelectAsset?: (assetId: string) => void
  onSelectZone?: (zone: string) => void
}

const STORM_BADGE: Record<string, string> = {
  Severe:   'bg-red-600 text-white',
  High:     'bg-amber-500 text-white',
  Moderate: 'bg-yellow-400 text-yellow-950',
  Low:      'bg-emerald-100 text-emerald-800 border border-emerald-300',
}

export default function WeatherFusionPanel({ zones, onSelectAsset, onSelectZone }: Props) {
  const [selectedZone, setSelectedZone] = useState<string>(zones[0]?.zone || 'Zone-A')

  const activeZoneData = zones.find(z => z.zone === selectedZone) || zones[0]

  return (
    <div className="bg-white/95 rounded-3xl shadow-xl shadow-slate-200/80 p-6 sm:p-8 border border-slate-200 backdrop-blur-md space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            🌧️ Weather &amp; SCADA Risk Fusion Engine
          </h2>
          <p className="text-sm text-slate-600 font-medium mt-1">
            Real-time correlation of atmospheric storm stress (wind velocity, rainfall, lightning, ambient heat) with equipment telemetry.
          </p>
        </div>
      </div>

      {/* Weather cards across all zones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {zones.map(z => {
          const isSel = z.zone === selectedZone
          return (
            <button
              key={z.zone}
              onClick={() => {
                setSelectedZone(z.zone)
                onSelectZone?.(z.zone)
              }}
              className={`p-4 rounded-2xl border text-left transition transform hover:-translate-y-0.5 ${
                isSel
                  ? 'border-slate-900 bg-slate-900 text-white shadow-lg ring-2 ring-slate-900'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-900'
              }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="font-extrabold text-base tracking-tight">{z.zone}</span>
                <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${STORM_BADGE[z.storm_alert_level]}`}>
                  {z.storm_alert_level}
                </span>
              </div>
              <div className="space-y-1.5 text-xs font-medium">
                <p className={isSel ? 'text-slate-300' : 'text-slate-600'}>
                  🌡️ Ambient: <strong className={isSel ? 'text-white' : 'text-slate-900'}>{z.temperature_c}°C</strong>
                </p>
                <p className={isSel ? 'text-slate-300' : 'text-slate-600'}>
                  💨 Wind: <strong className={isSel ? 'text-white' : 'text-slate-900'}>{z.wind_speed_kmh} km/h</strong>
                </p>
                <p className={isSel ? 'text-slate-300' : 'text-slate-600'}>
                  ⚡ Lightning: <strong className={isSel ? 'text-white' : 'text-slate-900'}>{z.lightning_risk_pct}%</strong>
                </p>
                <div className="pt-2 mt-2 border-t border-slate-700/30">
                  <span className={`text-xs font-mono font-extrabold ${isSel ? 'text-cyan-400' : 'text-blue-600'}`}>
                    Weather Factor: {(z.weather_risk_index * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Deep-dive Fusion Detail for Selected Zone */}
      {activeZoneData && (
        <div className="p-6 sm:p-7 bg-slate-50 rounded-2xl border border-slate-200 space-y-5">
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                📍 {activeZoneData.zone} — Atmospheric Grid Stress Analysis
              </h3>
              <p className="text-sm text-slate-600 font-medium mt-0.5">
                {activeZoneData.fusion_impact_summary}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold self-start sm:self-auto ${STORM_BADGE[activeZoneData.storm_alert_level]}`}>
              Sector Alert: {activeZoneData.storm_alert_level}
            </span>
          </div>

          {/* Meteorological Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="text-slate-500 font-medium block">Ambient Temperature</span>
              <strong className="text-xl font-extrabold text-slate-900 block mt-1">{activeZoneData.temperature_c}°C</strong>
              <span className="text-xs text-amber-600 font-bold block mt-1">+4.2°C thermal offset</span>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="text-slate-500 font-medium block">Peak Gust Velocity</span>
              <strong className="text-xl font-extrabold text-slate-900 block mt-1">{activeZoneData.wind_speed_kmh} km/h</strong>
              <span className="text-xs text-slate-500 font-bold block mt-1">Conductor harmonic strain</span>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="text-slate-500 font-medium block">Precipitation Volume</span>
              <strong className="text-xl font-extrabold text-slate-900 block mt-1">{activeZoneData.rainfall_mm_hr} mm/h</strong>
              <span className="text-xs text-emerald-600 font-bold block mt-1">Substation drainage clear</span>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="text-slate-500 font-medium block">Lightning Strike Density</span>
              <strong className="text-xl font-extrabold text-slate-900 block mt-1">{activeZoneData.lightning_risk_pct}%</strong>
              <span className="text-xs text-red-600 font-bold block mt-1">Arrester impulse load</span>
            </div>
          </div>

          {/* Vulnerable equipment in this zone */}
          <div className="p-5 bg-white rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                ⚠️ Equipment Vulnerable to Atmospheric Shock in {activeZoneData.zone}:
              </span>
              <span className="text-xs font-bold text-slate-500">
                {activeZoneData.vulnerable_assets.length} Flagged Units
              </span>
            </div>
            {activeZoneData.vulnerable_assets.length === 0 ? (
              <p className="text-sm text-emerald-700 font-medium">No high-risk equipment currently compromised by weather in {activeZoneData.zone}.</p>
            ) : (
              <div className="flex flex-wrap gap-2.5 pt-1">
                {activeZoneData.vulnerable_assets.map(aid => (
                  <button
                    key={aid}
                    onClick={() => onSelectAsset?.(aid)}
                    className="px-3.5 py-2 bg-red-50 hover:bg-red-100 border-2 border-red-200 rounded-xl text-xs font-mono font-extrabold text-red-700 transition flex items-center gap-2">
                    <span>⚡ {aid}</span>
                    <span className="text-xs text-red-500 font-sans font-medium">Run Diagnostics →</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Physics Explanation */}
          <div className="p-4 bg-cyan-50/70 rounded-xl border border-cyan-200 text-xs text-cyan-950 space-y-1.5 font-medium leading-relaxed">
            <p className="font-extrabold text-cyan-950 flex items-center gap-2 text-sm">
              🔬 Physical Engineering Principles:
            </p>
            <p>
              When ambient temperatures exceed seasonal averages by &gt;4°C, transformer oil thermosiphon circulation slows down, reducing heat rejection by 18–22%. Elevated wind shear simultaneously increases mechanical stress on aged transmission spans, exacerbating acoustic partial discharge and flashover probability across ceramic insulators.
            </p>
          </div>

        </div>
      )}

    </div>
  )
}
