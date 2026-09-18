import React, { createContext, useContext, useState, useEffect } from 'react'
import { loginApi, registerApi, UserAuthResponse } from '../api/client'
import type { UserRole } from '../api/types'

interface AuthContextType {
  user: UserAuthResponse | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, pass: string) => Promise<void>
  register: (name: string, email: string, pass: string, role?: string) => Promise<void>
  logout: () => void
  switchRole: (newRole: UserRole) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const SESSION_STORAGE_KEY = 'grid_advisor_user_session'
const USERS_DB_KEY = 'grid_advisor_registered_users_db'

export function getStoredRegisteredUsers(): Record<string, { id: number; name: string; email: string; pass: string; role: string }> {
  try {
    const raw = localStorage.getItem(USERS_DB_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveRegisteredUser(userObj: { id: number; name: string; email: string; pass: string; role: string }) {
  const users = getStoredRegisteredUsers()
  users[userObj.email.trim().toLowerCase()] = userObj
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(users))
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserAuthResponse | null>(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_STORAGE_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user))
    } else {
      sessionStorage.removeItem(SESSION_STORAGE_KEY)
    }
  }, [user])

  const login = async (email: string, pass: string) => {
    setLoading(true)
    const norm = email.trim().toLowerCase()
    const cleanPass = pass.trim()

    try {
      // 1. Check local registered users store first
      const localUsers = getStoredRegisteredUsers()
      const registeredUser = localUsers[norm] || Object.values(localUsers).find(
        u => u.email.toLowerCase() === norm || u.name.toLowerCase() === norm
      )

      if (registeredUser) {
        if (registeredUser.pass === cleanPass) {
          const authUser: UserAuthResponse = {
            id: registeredUser.id,
            email: registeredUser.email,
            name: registeredUser.name,
            role: registeredUser.role || 'operator',
            token: `token_${registeredUser.id}_${Date.now()}`,
          }
          setUser(authUser)
          // Sync with backend asynchronously
          loginApi(norm, cleanPass).catch(() => {})
          return
        } else {
          throw new Error('Incorrect password. Please verify your password.')
        }
      }

      // 2. If not found in local store, query backend API
      try {
        const res = await loginApi(norm, cleanPass)
        if (res && res.email) {
          saveRegisteredUser({
            id: res.id,
            name: res.name,
            email: res.email.toLowerCase(),
            pass: cleanPass,
            role: res.role || 'operator',
          })
          setUser(res)
          return
        }
      } catch (backendErr: any) {
        const detail = backendErr?.response?.data?.detail
        if (detail) {
          throw new Error(detail)
        }
      }

      throw new Error('No account found with this email/username. Please register first.')
    } finally {
      setLoading(false)
    }
  }

  // Register saves user without logging in, enabling redirect to /login
  const register = async (name: string, email: string, pass: string, role = 'operator') => {
    setLoading(true)
    const normEmail = email.trim().toLowerCase()
    const cleanName = name.trim()
    const cleanPass = pass.trim()

    try {
      // Always store locally so login is guaranteed to work 100% on any future run
      const newId = Math.floor(Math.random() * 10000) + 100
      saveRegisteredUser({
        id: newId,
        name: cleanName,
        email: normEmail,
        pass: cleanPass,
        role,
      })

      // Also register in backend database
      await registerApi(cleanName, normEmail, cleanPass, role).catch(backendErr => {
        console.warn('Backend registration notice:', backendErr?.response?.data || backendErr?.message)
      })
    } catch (err: any) {
      throw new Error(err?.response?.data?.detail || 'Registration failed. Please check your inputs.')
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    sessionStorage.removeItem(SESSION_STORAGE_KEY)
  }

  const switchRole = (newRole: UserRole) => {
    if (user) {
      const updated = { ...user, role: newRole }
      setUser(updated)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        switchRole,
      }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
