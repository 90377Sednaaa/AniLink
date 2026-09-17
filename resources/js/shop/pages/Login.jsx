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
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white border-2 border-[#E8E2D6] rounded-2xl p-7 sm:p-9 shadow-md">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-3 group hover:opacity-90 transition">
            <img src="/apple-touch-icon-180.png" alt="AniMarket" className="w-9 h-9 rounded-xl shadow-sm shrink-0" />
            <span className="font-bold text-2xl text-[#1A1A1A] tracking-tight leading-none">AniMarket</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1A1A1A]">Sign In</h1>
          <p className="text-sm sm:text-base text-[#374151] mt-2 font-medium">
            {pendingToken
              ? 'Enter the 6-digit verification code sent to your email.'
              : 'Sign in to access your farm produce orders and basket.'}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-5">
          {pendingToken ? (
            <div>
              <label htmlFor="login-code" className="block text-base font-bold text-[#1A1A1A] mb-2 text-center">
                6-Digit Security Code
              </label>
              <input
                id="login-code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                inputMode="numeric"
                autoFocus
                className="w-full h-14 text-center text-3xl font-bold tracking-[0.4em] border-2 border-[#CBD5E1] bg-white rounded-xl px-4 text-[#1A1A1A] focus:outline-none focus:border-[#2E5339] focus:ring-4 focus:ring-[#2E5339]/15 transition"
              />
              <p className="text-xs text-[#4B5563] text-center mt-2 font-medium">
                Check your email inbox or spam folder for your 6-digit code.
              </p>
            </div>
          ) : (
            <>
              <div>
                <label htmlFor="login-email" className="block text-sm sm:text-base font-bold text-[#1A1A1A] mb-1.5">
                  Email Address <span className="text-[#B0413E]">*</span>
                </label>
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="e.g. maria.santos@gmail.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full h-12 sm:h-13 border-2 border-[#CBD5E1] bg-white rounded-xl px-4 text-base text-[#1A1A1A] font-medium placeholder:text-[#64748B] focus:outline-none focus:border-[#2E5339] focus:ring-4 focus:ring-[#2E5339]/15 transition"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="login-password" className="block text-sm sm:text-base font-bold text-[#1A1A1A]">
                    Password <span className="text-[#B0413E]">*</span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm font-bold text-[#2E5339] hover:text-[#1B3322] underline transition"
                  >
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="login-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="Enter your account password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full h-12 sm:h-13 border-2 border-[#CBD5E1] bg-white rounded-xl px-4 text-base text-[#1A1A1A] font-medium placeholder:text-[#64748B] focus:outline-none focus:border-[#2E5339] focus:ring-4 focus:ring-[#2E5339]/15 transition"
                />
              </div>
            </>
          )}

          {error && (
            <div className="text-sm font-semibold text-[#991B1B] bg-[#FEE2E2] border-2 border-[#FCA5A5] rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full h-12 sm:h-13 py-3 rounded-xl bg-[#2E5339] text-white text-base font-bold hover:bg-[#24412D] transition shadow-md disabled:opacity-60 flex items-center justify-center tracking-wide"
          >
            {busy ? 'Please wait…' : pendingToken ? 'Verify Code' : 'Sign In to My Account'}
          </button>
        </form>

        {!pendingToken && (
          <div className="mt-6 pt-5 border-t border-[#E8E2D6] text-center">
            <p className="text-sm sm:text-base text-[#374151] font-medium">
              New to AniLink?{' '}
              <Link to="/register" className="text-[#2E5339] font-extrabold underline hover:text-[#1B3322] ml-1">
                Create an account
              </Link>
            </p>
          </div>
        )}
      </div>

      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm sm:text-base font-bold text-[#2E5339] hover:underline mt-6 transition"
      >
        <span>←</span>
        <span>Return to Marketplace</span>
      </Link>
    </div>
  )
}
