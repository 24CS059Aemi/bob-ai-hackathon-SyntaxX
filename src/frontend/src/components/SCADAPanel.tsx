import React, { useState, useEffect } from 'react'
import type { RiskResult } from '../api/types'

interface Props {
  assets: RiskResult[]
  onSelectAsset: (assetId: string) => void
}

interface CircuitBreaker {
  id: string
  name: string
  substation: string
  associatedAsset: string
  voltageKv: number
  currentAmps: number
  status: 'CLOSED' | 'OPEN' | 'TRIPPED'
  lastOperated: string
  interlockSafe: boolean
}

interface TelemetryStreamItem {
  id: string
  timestamp: string
  rtuId: string
  tag: string
  assetId: string
  value: string
  unit: string
  quality: 'GOOD' | 'WARNING' | 'ALARM'
}

export default function SCADAPanel({ assets, onSelectAsset }: Props) {
  // Grid Frequency Simulation
  const [frequency, setFrequency] = useState(50.02)
  const [totalMw, setTotalMw] = useState(482.4)
  const [totalMvar, setTotalMvar] = useState(94.2)
  const [powerFactor, setPowerFactor] = useState(0.981)
  const [tapPosition, setTapPosition] = useState(3) // LTC Step: -16 to +16
  const [autoSheddingArmed, setAutoSheddingArmed] = useState(true)
  const [streamActive, setStreamActive] = useState(true)

  // Circuit Breakers Matrix
  const [breakers, setBreakers] = useState<CircuitBreaker[]>([
    {
      id: 'CB-101',
      name: 'Substation S-01 Incomer Breaker',
      substation: 'Zone-A Substation S-01',
      associatedAsset: 'S-01',
      voltageKv: 132.0,
      currentAmps: 840,
      status: 'CLOSED',
      lastOperated: '2 hours ago',
      interlockSafe: true,
    },
    {
      id: 'CB-102',
      name: 'Transformer T-01 Primary HV Breaker',
      substation: 'Zone-A Substation S-01',
      associatedAsset: 'T-01',
      voltageKv: 132.0,
      currentAmps: 1120,
      status: 'CLOSED',
      lastOperated: '4 days ago',
      interlockSafe: true,
    },
    {
      id: 'CB-103',
      name: 'Zone-B Feeder F-01 Intertie Breaker',
      substation: 'Zone-B Substation S-02',
      associatedAsset: 'F-01',
      voltageKv: 66.0,
      currentAmps: 620,
      status: 'CLOSED',
      lastOperated: '12 hours ago',
      interlockSafe: true,
    },
    {
      id: 'CB-104',
      name: 'Substation S-03 Solar Interconnect',
      substation: 'Zone-C Substation S-03',
      associatedAsset: 'S-03',
      voltageKv: 66.0,
      currentAmps: 450,
      status: 'CLOSED',
      lastOperated: '1 day ago',
      interlockSafe: true,
    },
    {
      id: 'CB-105',
      name: 'Zone-D Auxiliary Bus Tie Breaker',
      substation: 'Zone-D Substation S-04',
      associatedAsset: 'S-04',
      voltageKv: 33.0,
      currentAmps: 0,
      status: 'OPEN',
      lastOperated: '6 days ago',
      interlockSafe: true,
    },
    {
      id: 'CB-106',
      name: 'Substation S-05 Emergency Ring Main Tie',
      substation: 'Zone-E Substation S-05',
      associatedAsset: 'S-05',
      voltageKv: 33.0,
      currentAmps: 0,
      status: 'OPEN',
      lastOperated: '2 weeks ago',
      interlockSafe: true,
    },
  ])

  // Live Telemetry Event Stream
  const [streamLogs, setStreamLogs] = useState<TelemetryStreamItem[]>([
    { id: '1', timestamp: '22:08:44', rtuId: 'RTU-A1', tag: 'S-01.BUS1.VOLT_A', assetId: 'S-01', value: '132.42', unit: 'kV', quality: 'GOOD' },
    { id: '2', timestamp: '22:08:42', rtuId: 'RTU-A1', tag: 'T-01.WIND_TEMP.TOP', assetId: 'T-01', value: '88.50', unit: '°C', quality: 'ALARM' },
    { id: '3', timestamp: '22:08:40', rtuId: 'RTU-B2', tag: 'F-01.ACTIVE_PWR.P', assetId: 'F-01', value: '42.10', unit: 'MW', quality: 'WARNING' },
    { id: '4', timestamp: '22:08:38', rtuId: 'RTU-A1', tag: 'T-01.PARTIAL_DISCH', assetId: 'T-01', value: '184.2', unit: 'pC', quality: 'ALARM' },
    { id: '5', timestamp: '22:08:35', rtuId: 'RTU-C3', tag: 'S-03.GRID_FREQ.HZ', assetId: 'S-03', value: '50.02', unit: 'Hz', quality: 'GOOD' },
    { id: '6', timestamp: '22:08:31', rtuId: 'RTU-D4', tag: 'T-07.OIL_LVL.PCT', assetId: 'T-07', value: '94.20', unit: '%', quality: 'GOOD' },
  ])

  // Confirmation modal state
  const [pendingBreakerAction, setPendingBreakerAction] = useState<{ breaker: CircuitBreaker; targetStatus: 'CLOSED' | 'OPEN' } | null>(null)

  // Fixed Period Telemetry Timer (6-minute operational cycle)
  const CYCLE_SECONDS = 360 // 6 minutes
  const [countdown, setCountdown] = useState<number>(CYCLE_SECONDS)

  // Countdown for the fixed measurement period
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => (prev <= 1 ? CYCLE_SECONDS : prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Format countdown mm:ss
  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Stream telemetry based on actual physical assets in the current cycle
  useEffect(() => {
    if (!streamActive || assets.length === 0) return

    const timer = setInterval(() => {
      // Pick an actual asset from the database
      const asset = assets[Math.floor(Math.random() * assets.length)]
      if (!asset) return

      const telemetryPoints = [
        { tag: 'WIND_TEMP.TOP', val: `${asset.latest_temperature_c}`, unit: '°C', qual: asset.latest_temperature_c > 85 ? 'ALARM' : 'GOOD' },
        { tag: 'PARTIAL_DISCH', val: `${asset.latest_partial_discharge_pc}`, unit: 'pC', qual: asset.latest_partial_discharge_pc > 150 ? 'ALARM' : 'GOOD' },
        { tag: 'BUS_VOLT', val: `${asset.voltage_kv}.0`, unit: 'kV', qual: 'GOOD' },
        { tag: 'LOAD_PERCENT', val: `${asset.latest_load_percent}`, unit: '%', qual: asset.latest_load_percent > 85 ? 'WARNING' : 'GOOD' },
        { tag: 'OIL_QUALITY', val: `${asset.latest_oil_quality_index}`, unit: 'idx', qual: asset.latest_oil_quality_index < 45 ? 'ALARM' : 'GOOD' },
      ]
      const pt = telemetryPoints[Math.floor(Math.random() * telemetryPoints.length)]
      const now = new Date().toTimeString().slice(0, 8)

      setStreamLogs(prev => [
        {
          id: Math.random().toString(),
          timestamp: now,
          rtuId: `RTU-${asset.zone.replace('Zone-', '')}1`,
          tag: `${asset.asset_id}.${pt.tag}`,
          assetId: asset.asset_id,
          value: pt.val,
          unit: pt.unit,
          quality: pt.qual as any,
        },
        ...prev.slice(0, 19),
      ])
    }, 4000)

    return () => clearInterval(timer)
  }, [streamActive, assets])

  const executeBreakerAction = () => {
    if (!pendingBreakerAction) return
    const { breaker, targetStatus } = pendingBreakerAction

    setBreakers(prev =>
      prev.map(b =>
        b.id === breaker.id
          ? {
              ...b,
              status: targetStatus,
              currentAmps: targetStatus === 'OPEN' ? 0 : b.currentAmps || 750,
              lastOperated: 'Just now (Operator Manual)',
            }
          : b
      )
    )

    // Add log
    setStreamLogs(prev => [
      {
        id: Math.random().toString(),
        timestamp: new Date().toTimeString().slice(0, 8),
        rtuId: 'SCADA-CMD',
        tag: `${breaker.id}.BREAKER_CMD`,
        assetId: breaker.associatedAsset,
        value: targetStatus,
        unit: 'STATE',
        quality: targetStatus === 'OPEN' ? 'WARNING' : 'GOOD',
      },
      ...prev,
    ])

    setPendingBreakerAction(null)
  }

  return (
    <div className="space-y-6">
      
      {/* SCADA System Telemetry Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5 mb-5">
          <div>
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                ⚡ SCADA Supervisory Control &amp; Telemetry Matrix
              </h2>
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-gray-900 text-white">
                IEC 61850 / DNP3
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Remote Terminal Unit (RTU) data acquisition, substation bus switching, and automated load control
            </p>
          </div>

          {/* Protocol Link Status & Fixed Period Indicator */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 font-mono">
              <span>⏱️ Next Live Ingestion:</span>
              <strong className="text-blue-950 font-bold">{formatCountdown(countdown)}</strong>
              <span className="text-[10px] text-blue-600 font-sans">(Fixed 6-min cycle)</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>RTU Telemetry Bridge: <strong>ONLINE (14ms)</strong></span>
            </div>
          </div>
        </div>

        {/* 4 SCADA Primary Gauges */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Grid Frequency */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Grid Frequency
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-gray-900">
                {frequency}
              </span>
              <span className="text-xs font-bold text-gray-500 font-mono">Hz</span>
              <span className="ml-auto text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                STABLE
              </span>
            </div>
            <div className="text-[11px] text-gray-400 mt-2 flex items-center justify-between">
              <span>Nominal: 50.00 Hz</span>
              <span>Tolerance: ±0.2 Hz</span>
            </div>
          </div>

          {/* Active Power Load */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Active Power (MW)
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-gray-900">
                {totalMw}
              </span>
              <span className="text-xs font-bold text-gray-500 font-mono">MW</span>
              <span className="ml-auto text-[11px] font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md">
                72% Cap
              </span>
            </div>
            <div className="text-[11px] text-gray-400 mt-2 flex items-center justify-between">
              <span>Grid Peak: 670 MW</span>
              <span>Reserve: 187.6 MW</span>
            </div>
          </div>

          {/* Reactive Power & PF */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Reactive Power &amp; PF
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-gray-900">
                {totalMvar}
              </span>
              <span className="text-xs font-bold text-gray-500 font-mono">MVAR</span>
              <span className="ml-auto text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                PF {powerFactor}
              </span>
            </div>
            <div className="text-[11px] text-gray-400 mt-2 flex items-center justify-between">
              <span>Capacitor Banks: ONLINE</span>
              <span>Lagging: 0.98</span>
            </div>
          </div>

          {/* Load Tap Changer (LTC) Step */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              On-Load Tap Changer (LTC)
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl sm:text-3xl font-bold font-mono text-gray-900">
                  {tapPosition > 0 ? `+${tapPosition}` : tapPosition}
                </span>
                <span className="text-xs text-gray-500 font-semibold ml-1.5">Step (132 kV)</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setTapPosition(p => Math.max(-16, p - 1))}
                  className="w-8 h-8 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 text-gray-900 font-bold text-sm shadow-xs transition">
                  -
                </button>
                <button
                  onClick={() => setTapPosition(p => Math.min(16, p + 1))}
                  className="w-8 h-8 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 text-gray-900 font-bold text-sm shadow-xs transition">
                  +
                </button>
              </div>
            </div>
            <div className="text-[11px] text-gray-400 mt-2 flex items-center justify-between">
              <span>Range: -16 to +16</span>
              <span>Target: 1.00 p.u.</span>
            </div>
          </div>

        </div>
      </div>

      {/* 2-Column Section: Breaker Supervisory Control + Live Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left 7 Cols: Circuit Breaker & Disconnect Switch Matrix */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <span>🎛️</span> Substation Circuit Breakers &amp; Bus Isolators
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Supervisory trip/close commands with double-confirmation safety interlocking
              </p>
            </div>
            
            {/* Automatic Load Shedding Arm Toggle */}
            <button
              onClick={() => setAutoSheddingArmed(!autoSheddingArmed)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border flex items-center gap-1.5 ${
                autoSheddingArmed
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}>
              <span>{autoSheddingArmed ? '🛡️ Auto-Shedding: ARMED' : '⚠️ Auto-Shedding: DISARMED'}</span>
            </button>
          </div>

          {/* Breaker Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {breakers.map(b => {
              const isClosed = b.status === 'CLOSED'

              return (
                <div
                  key={b.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isClosed
                      ? 'bg-white border-gray-200 shadow-xs'
                      : 'bg-red-50/40 border-red-200 shadow-xs'
                  }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-gray-900">{b.id}</span>
                      <button
                        onClick={() => onSelectAsset(b.associatedAsset)}
                        className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700">
                        {b.associatedAsset} ↗
                      </button>
                    </div>
                    
                    {/* Status Badge */}
                    <span className={`px-2 py-0.5 rounded-md text-xs font-extrabold flex items-center gap-1 ${
                      isClosed
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isClosed ? 'bg-emerald-600' : 'bg-red-600'}`} />
                      {b.status}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-gray-700 leading-tight mb-2.5 line-clamp-1">
                    {b.name}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-500 mb-3 bg-gray-50 p-2 rounded-lg font-mono">
                    <div>
                      <span>Voltage: </span>
                      <strong className="text-gray-900">{b.voltageKv} kV</strong>
                    </div>
                    <div>
                      <span>Current: </span>
                      <strong className="text-gray-900">{b.currentAmps} A</strong>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-100">
                    <span className="text-[10px] text-gray-400">
                      {b.lastOperated}
                    </span>
                    {isClosed ? (
                      <button
                        onClick={() => setPendingBreakerAction({ breaker: b, targetStatus: 'OPEN' })}
                        className="px-3 py-1 bg-red-50 hover:bg-red-600 hover:text-white text-red-700 border border-red-200 hover:border-red-600 rounded-lg text-xs font-bold transition shadow-xs">
                        Trip / Open Breaker
                      </button>
                    ) : (
                      <button
                        onClick={() => setPendingBreakerAction({ breaker: b, targetStatus: 'CLOSED' })}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs">
                        Close &amp; Energize
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right 5 Cols: Live SCADA Telemetry Log Stream */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <span>📡</span> Live RTU Sensor Ingestion
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Continuous high-frequency digital telemetry stream
              </p>
            </div>
            <button
              onClick={() => setStreamActive(!streamActive)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border transition ${
                streamActive
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-300'
              }`}>
              {streamActive ? '● Streaming' : '❚❚ Paused'}
            </button>
          </div>

          {/* Stream Table */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-100 text-xs font-mono">
              {streamLogs.map(log => {
                const isAlarm = log.quality === 'ALARM'
                const isWarn = log.quality === 'WARNING'

                return (
                  <div
                    key={log.id}
                    className={`p-2.5 flex items-center justify-between gap-2 hover:bg-gray-50 transition-colors ${
                      isAlarm ? 'bg-red-50/60' : isWarn ? 'bg-amber-50/50' : 'bg-white'
                    }`}>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-gray-400 text-[11px] shrink-0">{log.timestamp}</span>
                      <span className="font-bold text-gray-900 truncate">{log.tag}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`font-bold ${isAlarm ? 'text-red-700' : isWarn ? 'text-amber-800' : 'text-gray-800'}`}>
                        {log.value} {log.unit}
                      </span>
                      <button
                        onClick={() => onSelectAsset(log.assetId)}
                        className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold">
                        {log.assetId}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="text-[11px] text-gray-400 flex items-center justify-between px-1">
            <span>Protocol: DNP3 Substation Over IP</span>
            <span>Packet Integrity: 99.98%</span>
          </div>
        </div>

      </div>

      {/* Supervisory Confirmation Modal */}
      {pendingBreakerAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-md w-full p-6">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center text-2xl mx-auto mb-4">
              ⚠️
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-1">
              Confirm Supervisory SCADA Operation
            </h3>
            <p className="text-xs text-gray-500 text-center mb-5">
              You are about to issue a remote command to <strong>{pendingBreakerAction.breaker.id}</strong> (
              {pendingBreakerAction.breaker.name}).
            </p>

            <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 text-xs mb-5 space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-gray-500">Breaker ID:</span>
                <span className="font-bold text-gray-900">{pendingBreakerAction.breaker.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Target State:</span>
                <span className={`font-bold ${pendingBreakerAction.targetStatus === 'OPEN' ? 'text-red-600' : 'text-emerald-600'}`}>
                  {pendingBreakerAction.targetStatus} (
                  {pendingBreakerAction.targetStatus === 'OPEN' ? 'TRIP / ISOLATE' : 'CLOSE / ENERGIZE'})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Substation:</span>
                <span className="font-bold text-gray-900">{pendingBreakerAction.breaker.substation}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPendingBreakerAction(null)}
                className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs transition">
                Cancel
              </button>
              <button
                onClick={executeBreakerAction}
                className={`py-2.5 px-4 text-white font-bold rounded-xl text-xs transition shadow-sm ${
                  pendingBreakerAction.targetStatus === 'OPEN'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}>
                Confirm {pendingBreakerAction.targetStatus === 'OPEN' ? 'Trip' : 'Energize'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
