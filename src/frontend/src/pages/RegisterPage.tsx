import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, isAuthenticated } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all fields.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.')
      return
    }

    setSubmitting(true)
    try {
      await register(name.trim(), email.trim(), password, 'operator')
      navigate('/login', {
        state: {
          registeredEmail: email.trim(),
          successMessage: 'Account created successfully! Please sign in with your credentials.',
        },
      })
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between font-sans antialiased text-gray-900 relative overflow-hidden">
      
      {/* Background Ambient Power Grid Aesthetic */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none" />

      {/* Navbar */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-[60px] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-7 h-7 bg-gray-900 rounded-md flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="white" className="w-3.5 h-3.5">
                <path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z"/>
              </svg>
            </div>
            <span className="font-semibold text-gray-900 text-[15px]">GridAdvisor</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm text-gray-600 hover:text-gray-900 font-medium transition">
              Already have an account? <span className="font-semibold text-gray-900 underline underline-offset-4">Sign In</span>
            </Link>
            <Link
              to="/"
              className="px-3.5 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg border border-gray-200 transition">
              Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container - Split Screen Enterprise Layout */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 pt-24 pb-12 relative z-10">
        <div className="w-full max-w-4xl bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Column: Visual Substation Picture & Features Showcase */}
          <div className="lg:col-span-6 bg-gradient-to-br from-gray-900 via-slate-900 to-gray-950 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
            
            {/* SVG Smart Substation & High-Voltage Grid Illustration */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <svg viewBox="0 0 400 500" className="w-full h-full object-cover">
                <defs>
                  <linearGradient id="regGridGlow" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
                {/* Transmission Tower Silhouettes */}
                <path d="M60 480 L110 180 L130 180 L180 480 Z" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.6"/>
                <line x1="85" y1="330" x2="155" y2="330" stroke="currentColor" strokeWidth="2"/>
                <line x1="95" y1="260" x2="145" y2="260" stroke="currentColor" strokeWidth="2"/>
                <line x1="70" y1="220" x2="170" y2="220" stroke="currentColor" strokeWidth="2"/>
                {/* Energy Flow Wave */}
                <path d="M0 210 Q 120 250, 240 210 T 400 210" fill="none" stroke="url(#regGridGlow)" strokeWidth="2.5" opacity="0.8"/>
                <path d="M0 230 Q 120 270, 240 230 T 400 230" fill="none" stroke="url(#regGridGlow)" strokeWidth="2" opacity="0.6"/>
                {/* Transformer Bus */}
                <rect x="230" y="340" width="130" height="110" rx="8" fill="none" stroke="currentColor" strokeWidth="2"/>
                <circle cx="260" cy="320" r="10" fill="none" stroke="#a855f7" strokeWidth="2"/>
                <circle cx="295" cy="320" r="10" fill="none" stroke="#a855f7" strokeWidth="2"/>
                <circle cx="330" cy="320" r="10" fill="none" stroke="#a855f7" strokeWidth="2"/>
              </svg>
            </div>

            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-6 backdrop-blur-xs">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                Join the Utility Operations Platform
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-3">
                Stop Reacting to Grid Failures
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed">
                Create your operator account to monitor real-time substation health, storm risks, and automatic crew dispatch plans.
              </p>

              {/* Feature Highlights */}
              <div className="space-y-3.5 mt-8">
                <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm shrink-0">
                    🔍
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Continuous Asset Ingestion</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Temperature, vibration, partial discharge &amp; oil degradation tracked live.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0">
                    🤖
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Bob AI Operational Assistant</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Plain-English failure explanations and instant SCADA troubleshooting.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm shrink-0">
                    🚑
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Optimized Field Crew Routing</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Automated technician dispatch prioritizing assets with highest failure risk.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom System Status */}
            <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-400 font-mono">
              <span>5 Grid Zones Monitored</span>
              <span>100% Autonomous</span>
            </div>

          </div>

          {/* Right Column: Registration Form */}
          <div className="lg:col-span-6 p-8 sm:p-10 flex flex-col justify-center bg-white">
            
            <div className="mb-6">
              <div className="w-10 h-10 bg-gray-100 border border-gray-200 rounded-xl flex items-center justify-center mb-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-gray-900">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.765z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create an account</h1>
              <p className="text-sm text-gray-500 mt-1">
                Enter your details to register as a system operator
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2.5">
                <span className="text-sm">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Dr. Alex Mercer"
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2 text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Email or Username
                </label>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@organization.com or username"
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2 text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition shadow-xs"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs text-gray-500 hover:text-gray-900 font-medium">
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2 text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2 text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition shadow-xs"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-4 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition shadow-sm flex items-center justify-center gap-2">
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span>Creating Account…</span>
                    </>
                  ) : (
                    <span>Register Account →</span>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-5 pt-4 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-500">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-gray-900 hover:underline">
                  Sign In
                </Link>
              </p>
            </div>

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-5 px-6 text-xs text-gray-400 text-center">
        GridAdvisor · Real-time AI Power Outage Prediction &amp; Equipment Health System
      </footer>

    </div>
  )
}
