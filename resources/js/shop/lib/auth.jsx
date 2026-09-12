import { createContext, useContext, useEffect, useState } from 'react'
import { api } from './api'

const Ctx = createContext(null)

const BUYER_ROLES = ['buyer_individual', 'buyer_business']

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('anilink_shop_user') || 'null') } catch { return null }
  })
  const [token, setToken] = useState(() => localStorage.getItem('anilink_shop_token'))
  // Set while a login succeeded but 2FA is pending — Login page shows the OTP step
  const [pendingToken, setPendingToken] = useState(null)
  const [pendingEmail, setPendingEmail] = useState(null)

  const persist = (t, u) => {
    localStorage.setItem('anilink_shop_token', t)
    localStorage.setItem('anilink_shop_user', JSON.stringify(u))
    setToken(t)
    setUser(u)
  }

  const login = async (email, password) => {
    const res = await api.login(email, password)
    if (res.two_factor_required) {
      if (res.code_hint && res.pending_token) {
        // Local env convenience — the API exposes the code for testing
        const v = await api.verifyTwoFactor(res.code_hint, { pendingToken: res.pending_token })
        persist(v.token, v.user)
        return v
      }
      setPendingToken(res.pending_token || null)
      setPendingEmail(email)
      return res
    }
    persist(res.token, res.user)
    return res
  }

  const verifyTwoFactor = async (code) => {
    const v = await api.verifyTwoFactor(code, { pendingToken, email: pendingEmail })
    setPendingToken(null)
    setPendingEmail(null)
    persist(v.token, v.user)
    return v
  }

  const register = async (payload) => {
    const res = await api.register(payload)
    persist(res.token, res.user)
    return res
  }

  const logout = () => {
    api.logout().catch(() => {})
    localStorage.removeItem('anilink_shop_token')
    localStorage.removeItem('anilink_shop_user')
    setToken(null)
    setUser(null)
    setPendingToken(null)
    setPendingEmail(null)
  }

  useEffect(() => {
    if (token && !user) {
      api.me().then(d => setUser(d.user)).catch(() => logout())
    }
  }, [])

  return (
    <Ctx.Provider value={{
      user, token, pendingToken, pendingEmail,
      login, verifyTwoFactor, register, logout,
      isBuyer: user ? BUYER_ROLES.includes(user.role) || user.role === 'admin' : false,
    }}>
      {children}
    </Ctx.Provider>
  )
}

export const useAuth = () => useContext(Ctx)
