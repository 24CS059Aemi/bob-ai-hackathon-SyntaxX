import { useState } from 'react'
import { fetchBobBriefing, fetchBobExplain } from '../api/client'
import type { BobBriefingResponse } from '../api/types'

interface Props { topAsset?: string }

export default function BobAdvisorPanel({ topAsset }: Props) {
  const [briefing, setBriefing] = useState<BobBriefingResponse | null>(null)
  const [explanation, setExplanation] = useState<{ asset_id: string; explanation: string; source: string; recommended_action: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [explainAsset, setExplainAsset] = useState(topAsset || '')

  const loadBriefing = async () => {
    setLoading(true)
    try { setBriefing(await fetchBobBriefing(5)) }
    finally { setLoading(false) }
  }

  const loadExplanation = async () => {
    if (!explainAsset) return
    setLoading(true)
    try { setExplanation(await fetchBobExplain(explainAsset)) }
    finally { setLoading(false) }
  }

  return (
    <div className="bg-white rounded-2xl shadow p-4 border border-black/10">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">🤖</span>
        <h2 className="text-lg font-bold text-black">IBM Bob AI Advisor</h2>
        <span className="text-xs bg-black text-white px-2 py-0.5 rounded-full">
          Powered by watsonx.ai
        </span>
      </div>

      {/* Briefing section */}
      <div className="mb-4">
        <button
          onClick={loadBriefing}
          disabled={loading}
          className="px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-zinc-800 disabled:opacity-50 transition"
        >
          {loading ? '⏳ Generating…' : '📋 Generate Operational Briefing'}
        </button>

        {briefing && (
          <div className="mt-3 p-4 bg-zinc-50 rounded-xl border border-black/10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-black uppercase tracking-wide">
                Briefing • {briefing.source === 'watsonx' ? '⚙️ watsonx.ai Granite' : '⚙️ Rule-based'}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(briefing.generated_at).toLocaleTimeString()}
              </span>
            </div>
            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{briefing.briefing}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {briefing.top_assets.map(id => (
                <span key={id} className="text-xs bg-white border border-black text-black px-2 py-0.5 rounded-full">
                  {id}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Explain asset section */}
      <div className="border-t border-black/10 pt-4">
        <p className="text-sm font-semibold text-gray-800 mb-2">🔍 Explain Asset Risk</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={explainAsset}
            onChange={e => setExplainAsset(e.target.value.toUpperCase())}
            placeholder="e.g. T-01"
            className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-black"
          />
          <button
            onClick={loadExplanation}
            disabled={loading || !explainAsset}
            className="px-4 py-1.5 bg-black text-white text-sm rounded-lg hover:bg-zinc-800 disabled:opacity-50 transition"
          >
            Explain
          </button>
        </div>

        {explanation && (
          <div className="mt-3 p-4 bg-zinc-50 rounded-xl border border-black/10">
            <div className="text-xs font-semibold text-black mb-1 uppercase tracking-wide">
              {explanation.asset_id} • {explanation.source === 'watsonx' ? '⚙️ watsonx.ai' : '⚙️ Rule-based'}
            </div>
            <p className="text-sm text-gray-800 leading-relaxed mb-2">{explanation.explanation}</p>
            <div className="flex items-start gap-2 bg-white rounded-lg p-2 border border-black/10">
              <span className="text-black mt-0.5">⚡</span>
              <p className="text-sm font-semibold text-gray-800">{explanation.recommended_action}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
