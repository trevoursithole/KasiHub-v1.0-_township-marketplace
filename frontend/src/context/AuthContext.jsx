import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../api'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('kasihub_token')
    if (token) {
      authAPI.me().then(r => setUser(r.data)).catch(() => localStorage.removeItem('kasihub_token')).finally(() => setLoading(false))
    } else setLoading(false)
  }, [])

  const login = useCallback(async (phone, password) => {
    const r = await authAPI.login({ phone, password })
    localStorage.setItem('kasihub_token', r.data.token)
    setUser(r.data.user)
    return r.data.user
  }, [])

  const register = useCallback(async (data) => {
    const r = await authAPI.register(data)
    localStorage.setItem('kasihub_token', r.data.token)
    setUser(r.data.user)
    return r.data.user
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('kasihub_token')
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    const r = await authAPI.me()
    setUser(r.data)
  }, [])

  return <AuthCtx.Provider value={{ user, loading, login, register, logout, refreshUser }}>{children}</AuthCtx.Provider>
}

export const useAuth = () => useContext(AuthCtx)
