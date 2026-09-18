import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { Icon } from '../../shared/ui'

export default function Login() {
  const { login, verifyTwoFactor, pendingToken, user } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [err, setErr] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user?.role === 'admin') nav('/', { replace: true })
  }, [user, nav])

  const submit = async (e) => {
    e.preventDefault()
    setErr(null); setLoading(true)
    try {
      if (pendingToken) {
        const res = await verifyTwoFactor(code)
        if (res.user?.role !== 'admin') setErr(`Signed in as ${res.user?.role} — admin required. Use admin@anilink.test`)
        else nav('/')
        return
      }
      const res = await login(email, password)
      if (res?.two_factor_required) return
      if (res.user?.role !== 'admin') setErr(`Signed in as ${res.user?.role} — admin required. Use admin@anilink.test`)
      else nav('/')
    } catch (e2) {
      setErr(e2.message)
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#FAF8F3] flex items-center justify-center p-6 relative overflow-hidden">
      {/* soft brand accents */}
      <div className="absolute -top-16 -left-16 w-64 h-64 rounded-[32px] bg-[#E8F0E9] -z-10" aria-hidden="true" />
      <div className="absolute -bottom-20 -right-10 w-72 h-72 rounded-full bg-[#FFF4D6] -z-10" aria-hidden="true" />

      <div className="w-full max-w-[440px] bg-white rounded-[24px] border border-[#E8E2D6] p-8 shadow-[0_12px_32px_rgba(46,83,57,0.08)]">
        <div className="flex flex-col items-center text-center mb-8">
          <img src="/apple-touch-icon-180.png" alt="AniLink logo" className="w-16 h-16 rounded-2xl shadow-[0_4px_12px_rgba(46,83,57,0.12)] mb-4" />
          <h1 className="text-2xl font-bold text-[#1A1A1A]">{pendingToken ? 'Enter 2FA code' : 'AniLink Admin'}</h1>
          <p className="text-[15px] text-[#5C5C5C] mt-2 max-w-sm">
            {pendingToken ? 'Enter the 6-digit code we sent you.' : 'Verify farmers, review listings, and keep the marketplace fair.'}
          </p>
        </div>
        
        <form onSubmit={submit} className="space-y-5">
          {pendingToken ? (
            <label className="block">
              <span className="text-sm font-semibold text-[#1A1A1A] mb-2 block">6-digit code</span>
              <input value={code} onChange={e=>setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="123456" inputMode="numeric" autoFocus className="w-full h-14 rounded-2xl border border-[#E8E2D6] px-4 text-center tracking-[0.4em] text-lg focus:outline-none focus:border-[#2E5339] focus:ring-2 focus:ring-[#E8F0E9]" />
            </label>
          ) : (
          <>
            <label className="block">
              <span className="text-sm font-semibold text-[#1A1A1A] mb-2 block">Email address</span>
              <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@anilink.test" className="w-full h-12 rounded-2xl border border-[#E8E2D6] px-4 text-[15px] focus:outline-none focus:border-[#2E5339] focus:ring-2 focus:ring-[#E8F0E9]" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-[#1A1A1A] mb-2 block">Password</span>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" className="w-full h-12 rounded-2xl border border-[#E8E2D6] px-4 text-[15px] focus:outline-none focus:border-[#2E5339] focus:ring-2 focus:ring-[#E8F0E9]" />
            </label>

            {!email && !password && (
              <button 
                type="button" 
                onClick={() => { setEmail('admin@anilink.test'); setPassword('password123'); }}
                className="w-full mt-4 p-4 rounded-xl border border-[#E8E2D6] hover:bg-[#FAF8F3] hover:border-[#D4A017] transition text-left flex items-center justify-between group"
              >
                <div>
                  <div className="text-sm font-semibold text-[#1A1A1A] group-hover:text-[#D4A017]">Use demo admin account</div>
                  <div className="text-xs text-[#8A8A8A] mt-0.5">admin@anilink.test</div>
                </div>
                <Icon name="chevronRight" className="w-5 h-5 text-[#8A8A8A] group-hover:text-[#D4A017] transition-transform group-hover:translate-x-1" />
              </button>
            )}
          </>
          )}
          
          {err && <div className="rounded-xl bg-[#FDEDEC] border border-[#E8C6C6] p-4 text-sm text-[#B0413E]">{err}</div>}
          
          <button disabled={loading} className="w-full h-14 mt-2 rounded-2xl bg-[#2E5339] text-white text-[15px] font-semibold hover:bg-[#24412D] disabled:opacity-60 transition shadow-sm">
            {loading ? 'Signing in…' : pendingToken ? 'Verify code' : 'Sign in'}
          </button>
          
          {!pendingToken && (
            <div className="text-sm text-center pt-2">
              <Link to="/forgot-password" className="text-[#2E5339] font-semibold hover:underline">Forgot password?</Link>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
