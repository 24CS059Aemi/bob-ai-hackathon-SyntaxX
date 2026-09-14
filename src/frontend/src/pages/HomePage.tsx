import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/></svg>
    ),
    title: 'Real-Time Asset Monitoring',
    desc: 'Live sensor streams from every transformer and substation. Temperature, vibration, partial discharge, oil quality and load — updated continuously.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/></svg>
    ),
    title: 'Predictive Risk Scoring',
    desc: 'Composite AI scoring engine ranks every grid asset by failure probability. Age, load, weather exposure and incident history — all factored in.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z"/></svg>
    ),
    title: 'Weather Risk Fusion',
    desc: 'Storm, wind and lightning forecasts automatically merged with equipment health data. Know which assets are vulnerable before severe weather hits.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/></svg>
    ),
    title: 'Automated Maintenance Scheduling',
    desc: 'Priority-ordered work orders generated instantly — with deadlines, skill requirements and estimated durations. No manual planning required.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg>
    ),
    title: 'Intelligent Crew Dispatch',
    desc: 'Field crews matched to assets by skill set and proximity. The right technician reaches the right location in the shortest possible time.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"/></svg>
    ),
    title: 'AI-Powered Operational Briefings',
    desc: 'Plain-English risk summaries and per-asset failure explanations delivered on demand. Complex sensor data translated into clear actions for operations managers.',
  },
]

const METRICS = [
  { value: '15', label: 'Assets Monitored', sub: 'Transformers, substations & feeders' },
  { value: '5', label: 'Grid Zones', sub: 'Geographic risk coverage' },
  { value: '600K+', label: 'Customers Protected', sub: 'Across all monitored zones' },
  { value: '<4h', label: 'Critical Response', sub: 'From detection to dispatch' },
]

const WORKFLOW = [
  { step: '01', title: 'Collect', body: 'Sensor readings ingested from all grid assets every 6 hours across 5 sensor types.' },
  { step: '02', title: 'Analyse', body: 'AI engine scores each asset using composite risk formula grounded in IEEE and IEC standards.' },
  { step: '03', title: 'Prioritise', body: 'Assets and zones ranked Critical → Low. Operations teams see exactly where to act first.' },
  { step: '04', title: 'Dispatch', body: 'Maintenance work orders and crew assignments generated automatically with zero manual input.' },
]

const TEAM = [
  { name: 'Anshi Ladani', role: 'Team Lead' },
  { name: 'Aemi Patel', role: 'Engineer' },
  { name: 'Suyanshi Patel', role: 'Engineer' },
  { name: 'Drashti Patel', role: 'Engineer' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">

      {/* ── Navbar ── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-[60px] flex items-center justify-between">

          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-7 h-7 bg-gray-900 rounded-md flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="white" className="w-3.5 h-3.5">
                <path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z"/>
              </svg>
            </div>
            <span className="font-semibold text-gray-900 text-[15px]">GridAdvisor</span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {['Product', 'How It Works', 'Team'].map(l => (
              <button key={l}
                onClick={() => document.getElementById(l.toLowerCase().replace(/ /g,'-'))?.scrollIntoView({behavior:'smooth'})}
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium bg-transparent border-none cursor-pointer">
                {l}
              </button>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a href="https://github.com/24CS059Aemi/bob-ai-hackathon-SyntaxX"
              target="_blank" rel="noreferrer"
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 flex-shrink-0">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              GitHub
            </a>
            <button onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-700 transition-colors">
              Open Dashboard
            </button>
          </div>

          {/* Mobile burger */}
          <button className="md:hidden p-1" onClick={() => setMenuOpen(!menuOpen)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                : <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"/>}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 flex flex-col gap-4">
            {['Product','How It Works','Team'].map(l => (
              <button key={l} onClick={() => { setMenuOpen(false); document.getElementById(l.toLowerCase().replace(/ /g,'-'))?.scrollIntoView({behavior:'smooth'}) }}
                className="text-sm text-gray-600 font-medium text-left bg-transparent border-none cursor-pointer">
                {l}
              </button>
            ))}
            <button onClick={() => navigate('/dashboard')}
              className="w-full py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg">
              Open Dashboard
            </button>
          </div>
        )}
      </header>

      {/* ── Hero ── */}
      <section className="pt-32 pb-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3.5 py-1 text-xs font-medium text-gray-500 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>
            Live — Real-time grid intelligence platform
          </div>

          {/* Headline */}
          <h1 className="text-[52px] sm:text-[64px] font-extrabold text-gray-900 leading-[1.05] tracking-[-2px] mb-6">
            Stop reacting to<br/>
            <span className="text-gray-300">grid failures.</span>
          </h1>

          {/* Sub */}
          <p className="text-lg text-gray-500 max-w-lg mx-auto leading-relaxed mb-10">
            GridAdvisor predicts equipment failures before they happen — fusing live sensor data, weather forecasts and incident history into one prioritised action plan.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto px-7 py-3 bg-gray-900 text-white font-semibold rounded-xl text-[15px] hover:bg-gray-700 transition-colors shadow-sm">
              View Live Dashboard
            </button>
            <a href="https://github.com/24CS059Aemi/bob-ai-hackathon-SyntaxX"
              target="_blank" rel="noreferrer"
              className="w-full sm:w-auto px-7 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl text-[15px] hover:bg-gray-50 transition-colors text-center">
              View on GitHub →
            </a>
          </div>

          {/* Dashboard preview card */}
          <div className="mt-16 rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden shadow-xl">
            <div className="bg-gray-100 border-b border-gray-200 px-4 py-3 flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400"/>
              <div className="w-3 h-3 rounded-full bg-yellow-400"/>
              <div className="w-3 h-3 rounded-full bg-green-400"/>
              <span className="ml-3 text-xs text-gray-400 font-mono">grid-advisor-yipp.onrender.com/dashboard</span>
            </div>
            <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              {[
                {label:'Critical',val:'6',color:'text-red-600 bg-red-50 border-red-100'},
                {label:'High',val:'2',color:'text-orange-600 bg-orange-50 border-orange-100'},
                {label:'Medium',val:'3',color:'text-yellow-600 bg-yellow-50 border-yellow-100'},
                {label:'Low',val:'4',color:'text-green-600 bg-green-50 border-green-100'},
              ].map(c => (
                <div key={c.label} className={`rounded-xl border p-3 ${c.color}`}>
                  <div className="text-2xl font-extrabold">{c.val}</div>
                  <div className="text-xs font-semibold mt-0.5">{c.label}</div>
                </div>
              ))}
            </div>
            <div className="px-6 pb-5 grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { label:'Top Risk Zone', val:'Zone-A  —  96%', urgent:true },
                { label:'Customers At Risk', val:'598,000', urgent:false },
                { label:'Top Asset', val:'S-01 · Critical', urgent:true },
              ].map(r => (
                <div key={r.label} className="bg-white rounded-xl border border-gray-200 px-4 py-3">
                  <div className="text-xs text-gray-400 font-medium mb-0.5">{r.label}</div>
                  <div className={`text-sm font-bold ${r.urgent ? 'text-red-600' : 'text-gray-800'}`}>{r.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Metrics ── */}
      <section className="py-16 px-6 border-y border-gray-100 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {METRICS.map(m => (
            <div key={m.label}>
              <div className="text-3xl font-extrabold text-gray-900 tracking-tight">{m.value}</div>
              <div className="text-sm font-semibold text-gray-700 mt-1">{m.label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{m.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Product / Features ── */}
      <section id="product" className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-xl mb-14">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Product</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight">
              Everything a grid<br/>operations team needs.
            </h2>
            <p className="text-gray-500 mt-4 leading-relaxed">
              One platform. From raw sensor data to field crew dispatch — fully automated.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(f => (
              <div key={f.title}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-300 hover:shadow-sm transition-all group">
                <div className="w-9 h-9 rounded-lg bg-gray-100 group-hover:bg-gray-900 group-hover:text-white text-gray-600 flex items-center justify-center mb-5 transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-bold text-gray-900 text-[15px] mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-xl mb-16">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">How It Works</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight">
              From sensor to action<br/>in four steps.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WORKFLOW.map(w => (
              <div key={w.step} className="relative">
                <div className="text-[11px] font-bold text-gray-300 tracking-widest mb-3">{w.step}</div>
                <h3 className="text-lg font-extrabold text-gray-900 mb-2">{w.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{w.body}</p>
                <div className="mt-5 w-8 h-[2px] bg-gray-900 rounded-full"/>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tech ── */}
      <section className="py-14 px-6 bg-gray-50 border-y border-gray-100">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center mb-7">Technology</p>
          <div className="flex flex-wrap justify-center gap-2">
            {['Python 3.11','FastAPI','TypeScript','React 18','Tailwind CSS',
              'IBM watsonx.ai','SQLite','Docker','Vite','GitHub Actions','Render'].map(t => (
              <span key={t} className="px-3.5 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-full text-xs font-medium">
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section id="team" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="mb-14">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Team</p>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Built by SyntaxX</h2>
            <p className="text-gray-500 mt-3 text-[15px]">Charotar University of Science & Technology</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {TEAM.map(m => (
              <div key={m.name} className="border border-gray-100 rounded-2xl p-5 hover:border-gray-300 hover:shadow-sm transition-all">
                <div className="w-10 h-10 rounded-full bg-gray-900 text-white font-bold text-sm flex items-center justify-center mb-4">
                  {m.name.split(' ').map(n=>n[0]).join('')}
                </div>
                <p className="font-bold text-gray-900 text-sm">{m.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{m.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 bg-gray-950 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-[-1.5px] leading-tight mb-5">
            Ready to prevent<br/>the next outage?
          </h2>
          <p className="text-gray-400 text-lg mb-10 leading-relaxed">
            Open the live dashboard and see your grid's real-time risk profile right now.
          </p>
          <button onClick={() => navigate('/dashboard')}
            className="px-8 py-4 bg-white text-gray-900 font-bold rounded-xl text-[15px] hover:bg-gray-100 transition-colors">
            Open Dashboard →
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-950 border-t border-white/5 text-gray-500 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-white/10 rounded flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="white" className="w-3 h-3">
                <path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z"/>
              </svg>
            </div>
            <span className="text-gray-500">GridAdvisor · Power Outage Prediction & Equipment Failure Platform</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="https://github.com/24CS059Aemi/bob-ai-hackathon-SyntaxX"
              target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a>
            <button onClick={() => navigate('/dashboard')} className="hover:text-white transition-colors cursor-pointer bg-transparent border-none text-gray-500 text-xs">
              Dashboard
            </button>
            <a href="https://grid-advisor-yipp.onrender.com" className="hover:text-white transition-colors">Live Demo</a>
          </div>
        </div>
      </footer>

    </div>
  )
}
