import React, { useState } from 'react'
import type { UserRole } from '../api/types'
import { useAuth } from '../context/AuthContext'

interface Props {
  currentRole?: UserRole
  onRoleChange?: (role: UserRole) => void
  onQuickSearchAsset: (assetId: string) => void
  unreadAlertsCount: number
  onOpenAlerts: () => void
}

export default function AuthRoleBar({
  onQuickSearchAsset,
  unreadAlertsCount,
  onOpenAlerts,
}: Props) {
  const { user, logout } = useAuth()
  const [query, setQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    onQuickSearchAsset(query.trim().toUpperCase())
    setQuery('')
  }

  return (
    <div className="bg-white/95 border-b border-gray-200 px-4 sm:px-8 py-3 mb-6 shadow-xs backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-sm">
        
        {/* Left: Quick Asset Jump Search */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 max-w-sm">
          <span className="text-gray-400 text-base">🔍</span>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Quick asset jump (e.g. T-01, S-01)…"
            className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 font-mono uppercase transition shadow-inner"
          />
        </form>

        {/* Right: Unread Alerts + User Profile + Logout */}
        <div className="flex items-center gap-3.5">
          
          {/* Notification Alert Bell */}
          <button
            onClick={onOpenAlerts}
            className="px-3.5 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl font-semibold text-gray-800 transition flex items-center gap-2 text-xs sm:text-sm shadow-xs">
            <span>🔔</span>
            <span className="hidden sm:inline">Active Alarms:</span>
            <span className={`px-2 py-0.5 rounded-full font-bold text-xs ${
              unreadAlertsCount > 0 ? 'bg-red-600 text-white animate-pulse shadow-xs' : 'bg-gray-200 text-gray-700'
            }`}>
              {unreadAlertsCount}
            </span>
          </button>

          {/* User Profile & Logout */}
          {user && (
            <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 rounded-lg bg-gray-900 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <span className="text-xs sm:text-sm font-bold text-gray-900 block leading-tight">{user.name}</span>
                <span className="text-[11px] text-gray-500 font-mono block">{user.email}</span>
              </div>
              <button
                onClick={logout}
                title="Sign out of Grid Advisor"
                className="px-3 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-red-600 hover:text-white text-gray-700 border border-gray-200 hover:border-red-600 rounded-lg transition flex items-center gap-1.5 shadow-xs">
                <span>Sign Out</span>
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  )
}
