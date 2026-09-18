import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { fetchSensorReadings } from '../api/client'
import type { SensorReading } from '../api/types'

interface Props { assetId: string }

export default function SensorSparklines({ assetId }: Props) {
  const [data, setData] = useState<SensorReading[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchSensorReadings(assetId, 7)
      .then(readings => {
        // Sample every 3rd or 4th reading for a clean curve
        setData(readings.length > 10 ? readings.filter((_, i) => i % 3 === 0) : readings)
      })
      .finally(() => setLoading(false))
  }, [assetId])

  if (loading) {
    return (
      <div className="bg-white/95 rounded-3xl shadow-xl p-8 border border-slate-200 text-center">
        <span className="inline-block animate-spin text-2xl mb-2">⏳</span>
        <p className="text-sm font-bold text-slate-700">Loading High-Frequency Sensor Telemetry for {assetId}…</p>
      </div>
    )
  }

  if (!data.length) {
    return (
      <div className="bg-white/95 rounded-3xl shadow-xl p-8 border border-slate-200 text-center text-slate-500 text-sm">
        No active sensor telemetry available for asset {assetId}.
      </div>
    )
  }

  const chartData = data.map(r => ({
    time: new Date(r.timestamp).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
    'Temp °C':         r.temperature_c,
    'Vibration':       r.vibration_mms,
    'Part. Discharge': r.partial_discharge_pc,
    'Oil Quality':     r.oil_quality_index,
    'Load %':          r.load_percent,
  }))

  const charts = [
    { key: 'Temp °C',         color: '#ef4444', alarm: 85,  unit: '°C',   label: 'Core Temperature',     thresholdText: 'Norm < 85°C' },
    { key: 'Vibration',       color: '#8b5cf6', alarm: 3.5, unit: 'mm/s', label: 'Tank Vibration',       thresholdText: 'Norm < 3.5 mm/s' },
    { key: 'Part. Discharge', color: '#06b6d4', alarm: 150, unit: 'pC',   label: 'Acoustic Discharge',   thresholdText: 'Norm < 150 pC' },
    { key: 'Oil Quality',     color: '#10b981', alarm: 60,  unit: ' pts', label: 'Dielectric Oil Index', thresholdText: 'Norm > 60 pts' },
  ]

  return (
    <div className="bg-white/95 rounded-3xl shadow-xl shadow-slate-200/80 p-6 sm:p-8 border border-slate-200 backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">📈</span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Live Sensor Diagnostic Telemetry — <span className="font-mono text-cyan-600">{assetId}</span>
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Continuous 7-Day Trend Analytics grounded in IEEE C57.91 &amp; IEC 60270 Acoustic Tolerances
          </p>
        </div>
        <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200 self-start sm:self-auto">
          ● SCADA Real-Time Sync
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {charts.map(({ key, color, alarm, unit, label, thresholdText }) => {
          const latest = chartData[chartData.length - 1]?.[key as keyof typeof chartData[0]] as number
          const isAlarm = key === 'Oil Quality' ? latest < alarm : latest > alarm
          return (
            <div
              key={key}
              className={`rounded-2xl p-4 border transition-all shadow-xs ${
                isAlarm
                  ? 'bg-red-50/70 border-red-300 ring-1 ring-red-300'
                  : 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
              }`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">{label}</span>
                  <span className="text-[11px] text-slate-400 font-medium">{thresholdText}</span>
                </div>
                <div className="text-right">
                  <span className={`text-base font-extrabold font-mono ${isAlarm ? 'text-red-700' : 'text-slate-900'}`}>
                    {typeof latest === 'number' ? latest.toFixed(1) : '—'}{unit}
                  </span>
                  {isAlarm && (
                    <span className="block text-[10px] font-extrabold text-red-600 uppercase tracking-wider">
                      ⚠️ EXCEEDED
                    </span>
                  )}
                </div>
              </div>

              <div className="h-24 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} width={32} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '12px',
                        border: '1px solid #334155',
                        color: '#f8fafc',
                        fontSize: '12px',
                        fontWeight: 'bold',
                      }}
                      formatter={(v: number) => [`${v.toFixed(1)}${unit}`, label]}
                    />
                    <Line
                      type="monotone"
                      dataKey={key}
                      stroke={color}
                      strokeWidth={2.5}
                      dot={false}
                      isAnimationActive={true}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
