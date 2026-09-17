import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export default function Login() {
  const { login, verifyTwoFactor, pendingToken } = useAuth()
  const navgo = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [code, setCode] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      if (pendingToken) {
        await verifyTwoFactor(code)
        navgo('/')
      } else {
        const res = await login(form.email, form.password)
        if (res?.two_factor_required) return
        navgo('/')
      }
    } catch (err) {
      setError(err.message || 'Sign in failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm bg-white border border-[#E8E2D6] rounded-2xl p-6 sm:p-7 shadow-sm">
        <div className="text-center mb-5">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-3 group hover:opacity-90 transition">
            <img src="/apple-touch-icon-180.png" alt="AniMarket" className="w-8 h-8 rounded-xl shadow-sm shrink-0" />
            <span className="font-bold text-xl text-[#1A1A1A] tracking-tight leading-none">AniMarket</span>
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-[#1A1A1A]">Sign In</h1>
          <p className="text-xs text-[#5C5C5C] mt-1">
            {pendingToken ? 'Enter the 6-digit code sent to your email.' : 'Sign in to access your orders and basket.'}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-3.5">
          {pendingToken ? (
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              inputMode="numeric"
              autoFocus
              className="w-full text-center text-2xl tracking-[0.4em] border border-[#E8E2D6] bg-[#FAF8F3] rounded-xl px-4 py-3 focus:outline-none focus:border-[#2E5339] focus:bg-white transition"
            />
          ) : (
            <>
              <input
                type="email"
                required
                placeholder="Email address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-[#E8E2D6] bg-[#FAF8F3] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2E5339] focus:bg-white transition"
              />
              <input
                type="password"
                required
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border border-[#E8E2D6] bg-[#FAF8F3] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2E5339] focus:bg-white transition"
              />
            </>
          )}

          {error && (
            <div className="text-xs text-[#B0413E] bg-[#F6E3E2] border border-[#E5B9B6] rounded-xl px-3.5 py-2.5">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 rounded-xl bg-[#2E5339] text-white text-sm font-semibold hover:bg-[#24412D] transition shadow-sm disabled:opacity-50"
          >
            {busy ? 'Please wait…' : pendingToken ? 'Verify Code' : 'Sign In'}
          </button>
        </form>

        {!pendingToken && (
          <div className="mt-5 pt-4 border-t border-[#E8E2D6]/80 text-center space-y-2">
            <p className="text-xs text-[#5C5C5C]">
              New to AniLink?{' '}
              <Link to="/register" className="text-[#2E5339] font-bold hover:underline">
                Create an account
              </Link>
            </p>
            <div>
              <Link to="/forgot-password" className="text-xs text-[#8A8A8A] hover:text-[#2E5339] transition">
                Forgot your password?
              </Link>
            </div>
          </div>
        )}
      </div>

      <Link to="/" className="text-xs text-[#8A8A8A] hover:text-[#2E5339] mt-5 transition">
        ← Return to Marketplace
      </Link>
    </div>
  )
}
