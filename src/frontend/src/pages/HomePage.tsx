import { useNavigate } from 'react-router-dom'

const NAV_LINKS = ['Features', 'How It Works', 'Team']

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: 'Real-Time Asset Monitoring',
    desc: 'Continuous sensor streams from every transformer and substation — temperature, vibration, partial discharge, oil quality and load — processed every 6 hours.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.591 2.25l4.75 4.75m0 0a2.25 2.25 0 01-3.182 3.182l-4.75-4.75" />
      </svg>
    ),
    title: 'AI-Powered Risk Scoring',
    desc: 'IEEE C57.91 / IEC 60270 / ISO 10816 grounded composite scoring engine ranks all grid assets 0–100 by outage probability and operational impact.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
      </svg>
    ),
    title: 'Weather Risk Intelligence',
    desc: 'Zone-level storm, wind and lightning forecasts automatically fused into the equipment risk model — surfacing failures before severe weather arrives.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
      </svg>
    ),
    title: 'Automated Maintenance Planning',
    desc: 'Priority-ordered maintenance actions with deadlines (4 h Critical → 30 days Low), required skill sets and estimated durations — generated instantly.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
    title: 'Smart Crew Dispatch',
    desc: 'Skill-matched, travel-time-optimised crew pre-positioning assigns the right field team to the right asset — minimising response delay for critical failures.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
    ),
    title: 'Explainable AI Briefings',
    desc: 'IBM Bob + watsonx.ai Granite delivers plain-English operational briefings and per-asset failure explanations a manager can read and act on in 30 seconds.',
  },
]

const STEPS = [
  { num: '01', title: 'Ingest', desc: 'Sensor data collected from all grid assets every 6 hours' },
  { num: '02', title: 'Score', desc: 'AI engine computes composite risk score per asset' },
  { num: '03', title: 'Rank', desc: 'Assets and zones ranked Critical → Low by priority' },
  { num: '04', title: 'Plan', desc: 'Maintenance actions and crew assignments generated' },
  { num: '05', title: 'Explain', desc: 'IBM Bob delivers plain-English briefing to ops team' },
]

const STATS = [
  { value: '15', label: 'Grid Assets Monitored' },
  { value: '5', label: 'Risk Zones Tracked' },
  { value: '600K+', label: 'Customers Protected' },
  { value: '43', label: 'Automated Tests' },
]

const TEAM = [
  { name: 'Anshi Ladani', role: 'Team Lead', email: '24cs044@charusat.edu.in' },
  { name: 'Aemi Patel', role: 'Developer', email: '24cs059@charusat.edu.in' },
  { name: 'Suyanshi Patel', role: 'Developer', email: '24cs077@charusat.edu.in' },
  { name: 'Drashti Patel', role: 'Developer', email: '24ce079@charusat.edu.in' },
]

export default function HomePage() {
  const navigate = useNavigate()

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">

      {/* ── Navbar ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                <path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z"/>
              </svg>
            </div>
            <span className="font-semibold text-gray-900 text-[15px] tracking-tight">GridAdvisor</span>
          </div>
          <nav className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map(l => (
              <button key={l} onClick={() => scrollTo(l.toLowerCase().replace(' ', '-'))}
                className="text-sm text-gray-500 hover:text-gray-900 transition font-medium">
                {l}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <a href="https://github.com/24CS059Aemi/bob-ai-hackathon-SyntaxX"
              target="_blank" rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition font-medium">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              GitHub
            </a>
            <button onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-700 transition">
              Open Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="pt-36 pb-24 px-6 text-center bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 border border-gray-200 rounded-full px-4 py-1.5 text-xs font-medium text-gray-500 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
            IBM Bob AI Hackathon 2026 &nbsp;·&nbsp; Track: AI &nbsp;·&nbsp; Team SyntaxX
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-[1.1] tracking-tight mb-6">
            Predict grid failures<br />
            <span className="text-gray-400">before they happen.</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
            AI-powered operational intelligence that fuses live sensor data, weather forecasts
            and incident history to rank equipment risk and dispatch crews — automatically.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate('/dashboard')}
              className="px-7 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-700 transition text-[15px]">
              Open Dashboard →
            </button>
            <a href="https://github.com/24CS059Aemi/bob-ai-hackathon-SyntaxX"
              target="_blank" rel="noreferrer"
              className="px-7 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition text-[15px]">
              View Source
            </a>
          </div>
        </div>
        {/* Stats row */}
        <div className="max-w-3xl mx-auto mt-20 grid grid-cols-2 sm:grid-cols-4 gap-px bg-gray-100 rounded-2xl overflow-hidden border border-gray-100">
          {STATS.map(s => (
            <div key={s.label} className="bg-white py-7 px-4 text-center">
              <div className="text-3xl font-extrabold text-gray-900 tracking-tight">{s.value}</div>
              <div className="text-xs text-gray-400 mt-1 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Capabilities</p>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Everything ops teams need</h2>
            <p className="text-gray-500 mt-3 text-[15px] max-w-xl mx-auto">
              Built on IEEE C57.91, IEC 60270 and ISO 10816 standards — not guesswork.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-300 hover:shadow-sm transition">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-700 mb-4">
                  {f.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-[15px]">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Pipeline</p>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">From raw data to field action</h2>
            <p className="text-gray-500 mt-3 text-[15px]">Five automated steps, zero manual intervention.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {STEPS.map((s, i) => (
              <div key={s.num} className="relative flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-gray-900 text-white font-extrabold text-sm flex items-center justify-center mb-4 z-10">
                  {s.num}
                </div>
                {i < STEPS.length - 1 && (
                  <div className="hidden sm:block absolute top-6 left-1/2 w-full h-px bg-gray-200" style={{left:'60%', width:'80%'}}/>
                )}
                <p className="font-bold text-gray-900 text-sm">{s.title}</p>
                <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tech Stack ── */}
      <section className="py-16 px-6 bg-gray-50 border-y border-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6">Built with</p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {['Python 3.11', 'FastAPI', 'TypeScript', 'React 18',
              'Tailwind CSS', 'IBM Bob', 'watsonx.ai', 'SQLite',
              'Docker', 'Vite', 'Render', 'GitHub Actions'].map(t => (
              <span key={t} className="px-3.5 py-1.5 bg-white text-gray-600 rounded-full text-xs font-medium border border-gray-200">
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section id="team" className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Team</p>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-12">SyntaxX</h2>
          <div className="flex flex-wrap justify-center gap-5">
            {TEAM.map(m => (
              <div key={m.name} className="w-48 bg-white rounded-2xl border border-gray-100 p-5 text-center hover:border-gray-300 hover:shadow-sm transition">
                <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-600 font-bold text-lg flex items-center justify-center mx-auto mb-3">
                  {m.name[0]}
                </div>
                <p className="font-bold text-gray-900 text-sm">{m.name}</p>
                <p className="text-xs text-gray-400 font-medium mt-0.5">{m.role}</p>
                <p className="text-xs text-gray-400 mt-1 break-all leading-snug">{m.email}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 bg-gray-900 text-white text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-extrabold mb-3 tracking-tight">See it live.</h2>
          <p className="text-gray-400 mb-8 text-[15px]">
            Explore real-time risk rankings, maintenance plans, crew assignments and AI briefings.
          </p>
          <button onClick={() => navigate('/dashboard')}
            className="px-8 py-3.5 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition text-[15px]">
            Open Dashboard →
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-950 text-gray-500 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-white/10 rounded flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="white" className="w-3 h-3">
                <path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z"/>
              </svg>
            </div>
            <span>GridAdvisor · SyntaxX · IBM Bob AI Hackathon 2026</span>
          </div>
          <div className="flex items-center gap-5">
            <a href="https://github.com/24CS059Aemi/bob-ai-hackathon-SyntaxX"
              target="_blank" rel="noreferrer"
              className="hover:text-white transition">GitHub</a>
            <a href="https://grid-advisor-yipp.onrender.com"
              className="hover:text-white transition">Live Demo</a>
            <button onClick={() => navigate('/dashboard')}
              className="hover:text-white transition">Dashboard</button>
          </div>
        </div>
      </footer>

    </div>
  )
}
