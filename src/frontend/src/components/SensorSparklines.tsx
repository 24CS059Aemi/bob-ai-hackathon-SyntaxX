import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
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
        // Sample every 4th reading for readability (one per day roughly)
        setData(readings.filter((_, i) => i % 4 === 0))
      })
      .finally(() => setLoading(false))
  }, [assetId])

  if (loading) return <div className="p-4 text-gray-400 text-sm">Loading sensor data…</div>
  if (!data.length) return <div className="p-4 text-gray-400 text-sm">No sensor data available.</div>

  const chartData = data.map(r => ({
    time: new Date(r.timestamp).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
    'Temp °C':      r.temperature_c,
    'Vibration':    r.vibration_mms,
    'Part. Discharge': r.partial_discharge_pc,
    'Oil Quality':  r.oil_quality_index,
    'Load %':       r.load_percent,
  }))

  const charts: Array<{ key: string; color: string; alarm: number; unit: string }> = [
    { key: 'Temp °C',         color: '#ef4444', alarm: 85,  unit: '°C' },
    { key: 'Vibration',       color: '#f97316', alarm: 3.5, unit: 'mm/s' },
    { key: 'Part. Discharge', color: '#8b5cf6', alarm: 150, unit: 'pC' },
    { key: 'Oil Quality',     color: '#10b981', alarm: 60,  unit: '' },
  ]

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h2 className="text-lg font-bold text-gray-800 mb-1">📈 Sensor Trends — {assetId} (7 days)</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {charts.map(({ key, color, alarm, unit }) => {
          const latest = chartData[chartData.length - 1]?.[key as keyof typeof chartData[0]] as number
          const isAlarm = key === 'Oil Quality' ? latest < alarm : latest > alarm
          return (
            <div key={key} className={`rounded-xl p-3 ${isAlarm ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-gray-600">{key}</span>
                <span className={`text-xs font-mono font-bold ${isAlarm ? 'text-red-600' : 'text-gray-700'}`}>
                  {typeof latest === 'number' ? latest.toFixed(1) : '—'}{unit}
                  {isAlarm && ' ⚠️'}
                </span>
              </div>
              <ResponsiveContainer width="100%" height={80}>
                <LineChart data={chartData}>
                  <XAxis dataKey="time" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} width={30} />
                  <Tooltip
                    contentStyle={{ fontSize: '11px' }}
                    formatter={(v: number) => [`${v.toFixed(2)}${unit}`, key]}
                  />
                  <Line
                    type="monotone" dataKey={key}
                    stroke={color} strokeWidth={2} dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )
        })}
      </div>
    </div>
  )
}
