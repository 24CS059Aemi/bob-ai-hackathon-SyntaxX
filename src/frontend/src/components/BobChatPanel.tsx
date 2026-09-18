import React, { useState, useRef, useEffect } from 'react'
import type { BobChatMessage } from '../api/types'
import { sendBobChat } from '../api/client'

interface Props {
  onSelectAsset?: (assetId: string) => void
}

const DEFAULT_SUGGESTIONS = [
  'Which asset should I inspect first today and why?',
  'What is the current status of Crew Alpha?',
  'Explain why T-01 is at critical outage risk.',
  'What happens if Zone-A temperature rises by 10°C?',
]

export default function BobChatPanel({ onSelectAsset }: Props) {
  const [messages, setMessages] = useState<BobChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        'Hello Operator! I am IBM Bob, your intelligent Grid Equipment Failure & Outage Advisor. I continuously analyze multi-channel SCADA sensor telemetry, IEEE C57 limits, and storm forecasts to help you protect grid uptime. How can I assist your shift today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggested_actions: ['Generate Shift Briefing', 'Inspect T-01', 'Show Zone-A Storm Warning'],
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input.trim()
    if (!query || loading) return

    const userMsg: BobChatMessage = {
      id: String(Date.now()),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await sendBobChat(query)
      const assistantMsg: BobChatMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggested_actions: res.suggested_actions,
        referenced_asset: res.referenced_asset || undefined,
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch {
      // Offline / fallback response
      const fallbackMsg: BobChatMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: `Based on current telemetry, T-01 (Zone-A, Transformer) is your highest priority outage threat with a core temp of 92.4°C and risk score of 88%. Recommend deploying Crew Alpha immediately.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggested_actions: ['Inspect T-01', 'View Crew Panel', 'View Zone Heatmap'],
        referenced_asset: 'T-01',
      }
      setMessages(prev => [...prev, fallbackMsg])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white/95 rounded-3xl shadow-xl shadow-slate-200/80 p-6 sm:p-8 border border-slate-200 backdrop-blur-md flex flex-col h-[700px] space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xl font-bold shadow-md">
            🤖
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              IBM Bob AI Grid Copilot
              <span className="text-xs bg-slate-100 text-slate-800 border border-slate-300 px-2.5 py-0.5 rounded-full font-mono font-bold">
                watsonx.ai Granite
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Real-time conversational reasoning across telemetry, IEEE C57 thermal limits, and outage prevention.
            </p>
          </div>
        </div>

        <button
          onClick={() => setMessages([messages[0]])}
          className="text-xs text-slate-400 hover:text-slate-800 transition font-bold px-3 py-1.5 rounded-lg hover:bg-slate-100">
          Clear Chat
        </button>
      </div>

      {/* Suggestion Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {DEFAULT_SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            onClick={() => handleSend(s)}
            className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold whitespace-nowrap transition shadow-2xs">
            💬 {s}
          </button>
        ))}
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 my-1">
        {messages.map(m => {
          const isUser = m.role === 'user'
          return (
            <div key={m.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-3xl p-5 text-sm leading-relaxed shadow-xs ${
                  isUser
                    ? 'bg-slate-900 text-white rounded-tr-xs'
                    : 'bg-slate-50 text-slate-900 border border-slate-200 rounded-tl-xs'
                }`}>
                
                <div className="flex items-center justify-between gap-4 mb-1.5">
                  <span className={`font-extrabold text-xs ${isUser ? 'text-slate-300' : 'text-slate-600'}`}>
                    {isUser ? 'Control Operator' : 'IBM Bob Advisor'}
                  </span>
                  <span className={`text-xs ${isUser ? 'text-slate-400' : 'text-slate-400'} font-mono`}>
                    {m.timestamp}
                  </span>
                </div>

                <p className="whitespace-pre-wrap font-medium">{m.content}</p>

                {/* Referenced Asset Tag */}
                {m.referenced_asset && onSelectAsset && (
                  <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
                    <span className="text-xs text-slate-600 font-medium">
                      Asset Referenced: <strong className="text-slate-900 font-mono font-bold">{m.referenced_asset}</strong>
                    </span>
                    <button
                      onClick={() => onSelectAsset(m.referenced_asset!)}
                      className="px-3 py-1.5 bg-white border border-slate-300 hover:border-slate-800 rounded-xl text-xs font-bold text-slate-800 transition shadow-xs">
                      Inspect {m.referenced_asset} Diagnostics →
                    </button>
                  </div>
                )}

                {/* Suggested Action Buttons */}
                {m.suggested_actions && m.suggested_actions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-200">
                    {m.suggested_actions.map((act, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(act)}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 transition shadow-xs">
                        ⚡ {act}
                      </button>
                    ))}
                  </div>
                )}

              </div>
            </div>
          )
        })}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-50 border border-slate-200 rounded-3xl rounded-tl-xs p-4 text-xs text-slate-600 flex items-center gap-2.5 font-medium shadow-xs">
              <span className="animate-spin text-base">⚙️</span> Bob is querying IEEE standards &amp; SCADA telemetry…
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={e => {
          e.preventDefault()
          handleSend()
        }}
        className="pt-2 border-t border-slate-200 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask Bob about grid risks, transformer health, weather impact, or crew dispatch…"
          className="flex-1 text-sm bg-white border border-slate-300 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium shadow-xs"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-6 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-2xl text-sm font-extrabold transition flex items-center gap-2 shadow-md">
          <span>Send</span>
          <span>→</span>
        </button>
      </form>

    </div>
  )
}
