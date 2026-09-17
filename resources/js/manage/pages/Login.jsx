import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { Icon } from '../../shared/ui'

export default function Login() {
  const { login, verifyTwoFactor, pendingToken } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('lito@anilink.test')
  const [password, setPassword] = useState('password123')
  const [code, setCode] = useState('')
  const [err, setErr] = useState(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setErr(null)
    setLoading(true)
    try {
      if (pendingToken) {
        const res = await verifyTwoFactor(code)
        if (res.user?.role !== 'farmer' && res.user?.role !== 'admin') {
          setErr(`Signed in as ${res.user?.role}. A registered farmer account is required for AniManage.`)
        } else {
          nav('/')
        }
        return
      }
      const res = await login(email, password)
      if (res?.two_factor_required) return
      if (res.user?.role !== 'farmer' && res.user?.role !== 'admin') {
        setErr(`Signed in as ${res.user?.role}. A registered farmer account is required for AniManage.`)
      } else {
        nav('/')
      }
    } catch (e2) {
      setErr(e2.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (demoEmail) => {
    setEmail(demoEmail)
    setPassword('password123')
    setErr(null)
  }

  return (
    <div className="min-h-screen bg-[#FAF8F3] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Subtle organic background glows */}
      <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#E8F0E9] blur-2xl opacity-60 -z-10" aria-hidden="true" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-[#FFF4D6] blur-2xl opacity-60 -z-10" aria-hidden="true" />

      <div className="w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl border-2 border-[#E8E2D6] p-6 sm:p-9 shadow-[0_12px_32px_rgba(46,83,57,0.08)]">
        {/* Brand Lockup */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-3 mb-3 group hover:opacity-95 transition">
            <div className="w-11 h-11 rounded-2xl bg-[#E8F0E9] border border-[#2E5339]/20 flex items-center justify-center shadow-sm overflow-hidden">
              <img src="/apple-touch-icon-180.png" alt="AniManage" className="w-8 h-8 object-contain -translate-y-0.5 select-none" />
            </div>
            <div className="text-left">
              <span className="block font-extrabold text-2xl text-[#1A1A1A] tracking-tight leading-none group-hover:text-[#2E5339] transition">
                AniManage
              </span>
              <span className="block text-[11px] font-bold text-[#2E5339] tracking-wider uppercase leading-none mt-1">
                Farmer & Co-op Portal
              </span>
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] tracking-tight mt-3">
            {pendingToken ? 'Two-Factor Verification' : 'Farmer Sign In'}
          </h1>
          <p className="text-sm sm:text-base text-[#4B5563] mt-2 font-medium">
            {pendingToken
              ? 'Enter the 6-digit security code sent to your registered device.'
              : 'Direct control of your harvest inventory, pricing, and live orders.'}
          </p>
        </div>

        {/* Demo Farm Quick-Select */}
        {!pendingToken && (
          <div className="mb-6 p-3.5 rounded-2xl bg-[#FAF8F3] border border-[#E8E2D6] space-y-2">
            <span className="text-xs font-bold text-[#2E5339] uppercase tracking-wider block">
              Quick Demo Farm Access:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemo('lito@anilink.test')}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                  email === 'lito@anilink.test'
                    ? 'bg-white border-[#2E5339] shadow-sm ring-1 ring-[#2E5339]'
                    : 'bg-white/60 border-[#E8E2D6] hover:bg-white'
                }`}
              >
                <div className="font-bold text-xs text-[#1A1A1A] truncate">Mang Lito's Farm</div>
                <div className="text-[11px] text-[#2E5339] font-medium mt-0.5">Bulacan · Rice & Veg</div>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('nena@anilink.test')}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                  email === 'nena@anilink.test'
                    ? 'bg-white border-[#2E5339] shadow-sm ring-1 ring-[#2E5339]'
                    : 'bg-white/60 border-[#E8E2D6] hover:bg-white'
                }`}
              >
                <div className="font-bold text-xs text-[#1A1A1A] truncate">Aling Nena's Organic</div>
                <div className="text-[11px] text-[#2E5339] font-medium mt-0.5">Benguet · Highland</div>
              </button>
            </div>
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          {pendingToken ? (
            <div>
              <label htmlFor="auth-code" className="block text-sm font-bold text-[#1A1A1A] mb-1.5 text-center">
                6-Digit Security Code
              </label>
              <input
                id="auth-code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                inputMode="numeric"
                autoFocus
                className="w-full h-13 rounded-2xl border-2 border-[#CBD5E1] px-4 text-center tracking-[0.4em] text-xl font-bold text-[#1A1A1A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2E5339] focus:ring-4 focus:ring-[#E8F0E9] transition"
              />
            </div>
          ) : (
            <>
              <div>
                <label htmlFor="farmer-email" className="block text-sm font-bold text-[#1A1A1A] mb-1.5">
                  Email Address
                </label>
                <input
                  id="farmer-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="farmer@anilink.test"
                  required
                  className="w-full h-12 rounded-2xl border-2 border-[#CBD5E1] px-4 text-base font-medium text-[#1A1A1A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2E5339] focus:ring-4 focus:ring-[#E8F0E9] transition shadow-sm"
                />
              </div>

              <div>
                <label htmlFor="farmer-password" className="block text-sm font-bold text-[#1A1A1A] mb-1.5">
                  Password
                </label>
                <input
                  id="farmer-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-12 rounded-2xl border-2 border-[#CBD5E1] px-4 text-base font-medium text-[#1A1A1A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2E5339] focus:ring-4 focus:ring-[#E8F0E9] transition shadow-sm"
                />
              </div>
            </>
          )}

          {err && (
            <div className="rounded-2xl bg-[#FDF2F2] border border-[#F8B4B4] p-3.5 text-sm font-semibold text-[#991B1B]">
              {err}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 sm:h-13 rounded-full bg-[#2E5339] text-white text-base font-bold hover:bg-[#24412D] transition shadow-md hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-2 active:scale-98"
          >
            {loading ? 'Authenticating…' : pendingToken ? 'Verify & Enter AniManage' : 'Sign in to AniManage'}
          </button>

          <div className="pt-2 text-center">
            <Link to="/forgot-password" className="text-sm text-[#2E5339] font-bold hover:underline">
              Forgot your password?
            </Link>
          </div>
        </form>
      </div>

      <div className="mt-6 text-xs text-[#8A8A8A] text-center">
        AniLink Agricultural Marketplace · Cultivating Connection, Harvesting Fair Trades.
      </div>
    </div>
  )
}
