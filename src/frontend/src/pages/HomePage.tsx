import { useNavigate } from 'react-router-dom'

const FEATURES = [
  {
    icon: '📡',
    title: 'Live Sensor Monitoring',
    desc: 'Real-time temperature, vibration, partial discharge, oil quality and load data from every transformer and substation — updated every 6 hours.',
  },
  {
    icon: '🧮',
    title: 'AI Risk Scoring',
    desc: 'IEEE/IEC-grounded composite risk formula ranks all grid assets 0–100 by outage likelihood, factoring age, weather, and incident history.',
  },
  {
    icon: '🌦️',
    title: 'Weather Risk Overlay',
    desc: 'Zone-level storm, wind and lightning forecasts are automatically fused into the equipment risk model to surface storm-amplified failures.',
  },
  {
    icon: '🔧',
    title: 'Maintenance Planning',
    desc: 'Auto-generated maintenance actions with deadlines (4 hrs for Critical → 30 days for Low), skill requirements and estimated durations.',
  },
  {
    icon: '🚑',
    title: 'Crew Pre-positioning',
    desc: 'Skill-matched crew dispatch algorithm assigns field teams to highest-priority assets minimising travel time and response delay.',
  },
  {
    icon: '🤖',
    title: 'IBM Bob AI Briefing',
    desc: 'One-click plain-English operational briefing and per-asset failure explanation powered by watsonx.ai Granite or built-in rule engine.',
  },
]

const STEPS = [
  { num: '01', title: 'Sensor Data Ingested', desc: 'Grid assets stream 5 sensor readings every 6 hours' },
  { num: '02', title: 'Risk Score Computed', desc: 'AI engine scores each asset 0–100 using IEEE/IEC thresholds' },
  { num: '03', title: 'Zones Ranked', desc: 'All 5 grid zones ranked Critical → Low by weighted risk' },
  { num: '04', title: 'Actions Generated', desc: 'Maintenance plan + crew assignments auto-created' },
  { num: '05', title: 'Bob Explains', desc: 'IBM Bob delivers plain-English briefing to operations team' },
]

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* ── Navbar ── */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span className="font-bold text-gray-800 text-lg">Grid Advisor</span>
            <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">SyntaxX</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="https://github.com/24CS059Aemi/bob-ai-hackathon-SyntaxX"
              target="_blank" rel="noreferrer"
              className="text-sm text-gray-500 hover:text-gray-800 font-medium hidden sm:block">
              GitHub
            </a>
            <button onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition">
              Open Dashboard →
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white py-20 px-6">
        <div className="max-w-screen-xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            🏆 IBM Bob AI Hackathon 2026 &nbsp;·&nbsp; Track: AI
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4">
            Power Outage Prediction &<br className="hidden sm:block" /> Grid Equipment Failure Advisor
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            AI-powered operational intelligence that fuses live sensor data, weather forecasts
            and incident history to predict grid failures before they happen — and automatically
            dispatches the right crew to the right asset.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate('/dashboard')}
              className="px-7 py-3 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition text-base shadow-lg">
              ⚡ Open Live Dashboard
            </button>
            <a href="https://github.com/24CS059Aemi/bob-ai-hackathon-SyntaxX"
              target="_blank" rel="noreferrer"
              className="px-7 py-3 border border-white/40 text-white font-semibold rounded-xl hover:bg-white/10 transition text-base">
              View on GitHub →
            </a>
          </div>
          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-14 max-w-2xl mx-auto">
            {[
              { v: '15', l: 'Grid Assets' },
              { v: '5', l: 'Risk Zones' },
              { v: '43', l: 'Tests Passing' },
              { v: '100%', l: 'Uptime' },
            ].map(s => (
              <div key={s.l} className="bg-white/10 rounded-xl py-3 px-2">
                <div className="text-2xl font-extrabold">{s.v}</div>
                <div className="text-blue-200 text-xs mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-screen-xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">⚙️ How It Works</h2>
          <p className="text-gray-500 text-center text-sm mb-10">5-step pipeline from raw sensor data to actionable field operations</p>
          <div className="flex flex-col sm:flex-row gap-0 items-stretch justify-center">
            {STEPS.map((s, i) => (
              <div key={s.num} className="flex flex-col items-center text-center flex-1 relative px-3">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-extrabold text-lg flex items-center justify-center shadow mb-3 z-10">
                  {s.num}
                </div>
                {i < STEPS.length - 1 && (
                  <div className="hidden sm:block absolute top-6 left-1/2 w-full h-0.5 bg-blue-200" style={{ left: '58%', width: '84%' }} />
                )}
                <p className="text-sm font-bold text-gray-800">{s.title}</p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-16 px-6 bg-slate-50">
        <div className="max-w-screen-xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">✨ Key Features</h2>
          <p className="text-gray-500 text-center text-sm mb-10">Built on IEEE C57.91 · IEC 60270 · ISO 10816 standards</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-gray-800 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tech Stack ── */}
      <section className="py-14 px-6 bg-white">
        <div className="max-w-screen-xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">🛠️ Tech Stack</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {['Python 3.11', 'FastAPI', 'TypeScript', 'React 18', 'Tailwind CSS',
              'IBM Bob', 'watsonx.ai', 'SQLite', 'Docker', 'Vite', 'Render'].map(t => (
              <span key={t} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm font-medium border border-slate-200">
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="py-14 px-6 bg-slate-50">
        <div className="max-w-screen-xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-8">👥 Team SyntaxX</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { name: 'Anshi Ladani', role: 'Team Lead', email: '24cs044@charusat.edu.in' },
              { name: 'Aemi Patel', role: 'Member', email: '24cs059@charusat.edu.in' },
              { name: 'Suyanshi Patel', role: 'Member', email: '24cs077@charusat.edu.in' },
              { name: 'Drashti Patel', role: 'Member', email: '24ce079@charusat.edu.in' },
            ].map(m => (
              <div key={m.name} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm w-52 text-center">
                <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-700 font-bold text-xl flex items-center justify-center mx-auto mb-3">
                  {m.name[0]}
                </div>
                <p className="font-bold text-gray-800 text-sm">{m.name}</p>
                <p className="text-xs text-blue-600 font-medium mt-0.5">{m.role}</p>
                <p className="text-xs text-gray-400 mt-1 break-all">{m.email}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 px-6 bg-blue-700 text-white text-center">
        <h2 className="text-3xl font-extrabold mb-3">Ready to explore?</h2>
        <p className="text-blue-200 mb-7 text-base">Live grid risk data, maintenance plans and crew assignments — all in one dashboard.</p>
        <button onClick={() => navigate('/dashboard')}
          className="px-8 py-3 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition text-base shadow-lg">
          ⚡ Open Dashboard
        </button>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-gray-400 py-6 px-6 text-center text-xs">
        <p>⚡ Grid Equipment Failure Advisor &nbsp;·&nbsp; SyntaxX &nbsp;·&nbsp; IBM Bob AI Hackathon 2026</p>
        <p className="mt-1">
          <a href="https://github.com/24CS059Aemi/bob-ai-hackathon-SyntaxX"
            target="_blank" rel="noreferrer" className="underline hover:text-white">GitHub</a>
          &nbsp;·&nbsp;
          <a href="https://grid-advisor-yipp.onrender.com" className="underline hover:text-white">Live Demo</a>
        </p>
      </footer>

    </div>
  )
}
