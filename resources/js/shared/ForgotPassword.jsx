import { useState } from 'react'
import { Link } from 'react-router-dom'

// Two-step password reset: request a 6-digit code, then set a new password.
// Talks straight to /api with no auth so shop, manage, and admin can all mount it.
// loginPath points the "back to sign in" link at the mounting SPA's own login page.
export default function ForgotPassword({ loginPath = '/login' }) {
  const [step, setStep] = useState('email') // email | reset | done
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)
  const [busy, setBusy] = useState(false)

  const post = async (path, body) => {
    const res = await fetch(`/api${path}`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const json = await res.json().catch(() => null)
    if (!res.ok) throw new Error(json?.message || `Request failed (${res.status})`)
    return json
  }

  const requestCode = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      const res = await post('/password/forgot', { email })
      if (res.code_hint) setCode(res.code_hint) // local dev convenience, mirrors login auto-verify
      setStep('reset')
      setNotice(res.message)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const resetPassword = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      const res = await post('/password/reset', { email, code, password, password_confirmation: passwordConfirmation })
      setStep('done')
      setNotice(res.message)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white border-2 border-[#E8E2D6] rounded-2xl p-7 sm:p-9 shadow-md">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] tracking-tight">Reset Your Password</h1>
        <p className="text-sm sm:text-base text-[#374151] mt-2 font-medium leading-relaxed">
          {step === 'email' && 'Enter your account email address and we will send you a 6-digit password reset code.'}
          {step === 'reset' && `Enter the 6-digit code sent to ${email} and create your new password.`}
          {step === 'done' && 'Your password has been successfully reset. All active sessions have been safely signed out.'}
        </p>

        {step === 'email' && (
          <form onSubmit={requestCode} className="mt-6 space-y-5">
            <div>
              <label htmlFor="reset-email" className="block text-sm sm:text-base font-bold text-[#1A1A1A] mb-1.5">
                Email Address <span className="text-[#B0413E]">*</span>
              </label>
              <input
                id="reset-email"
                type="email"
                required
                autoComplete="email"
                placeholder="e.g. maria.santos@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 sm:h-13 border-2 border-[#CBD5E1] bg-white rounded-xl px-4 text-base text-[#1A1A1A] font-medium placeholder:text-[#64748B] focus:outline-none focus:border-[#2E5339] focus:ring-4 focus:ring-[#2E5339]/15 transition"
              />
            </div>
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
              {busy ? 'Sending code…' : 'Send 6-Digit Reset Code'}
            </button>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={resetPassword} className="mt-6 space-y-5">
            {notice && (
              <div className="text-sm font-semibold text-[#1B3322] bg-[#E8F0E9] border-2 border-[#A3C9A8] rounded-xl px-4 py-3">
                {notice}
              </div>
            )}
            <div>
              <label htmlFor="reset-code" className="block text-base font-bold text-[#1A1A1A] mb-2 text-center">
                6-Digit Reset Code
              </label>
              <input
                id="reset-code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                inputMode="numeric"
                required
                autoFocus
                className="w-full h-14 text-center text-3xl font-bold tracking-[0.4em] border-2 border-[#CBD5E1] bg-white rounded-xl px-4 text-[#1A1A1A] focus:outline-none focus:border-[#2E5339] focus:ring-4 focus:ring-[#2E5339]/15 transition"
              />
            </div>
            <div>
              <label htmlFor="reset-new-password" className="block text-sm sm:text-base font-bold text-[#1A1A1A] mb-1.5">
                New Password <span className="text-[#B0413E]">*</span>
              </label>
              <input
                id="reset-new-password"
                type="password"
                required
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 sm:h-13 border-2 border-[#CBD5E1] bg-white rounded-xl px-4 text-base text-[#1A1A1A] font-medium placeholder:text-[#64748B] focus:outline-none focus:border-[#2E5339] focus:ring-4 focus:ring-[#2E5339]/15 transition"
              />
            </div>
            <div>
              <label htmlFor="reset-confirm-password" className="block text-sm sm:text-base font-bold text-[#1A1A1A] mb-1.5">
                Confirm New Password <span className="text-[#B0413E]">*</span>
              </label>
              <input
                id="reset-confirm-password"
                type="password"
                required
                autoComplete="new-password"
                placeholder="Re-enter your new password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                className="w-full h-12 sm:h-13 border-2 border-[#CBD5E1] bg-white rounded-xl px-4 text-base text-[#1A1A1A] font-medium placeholder:text-[#64748B] focus:outline-none focus:border-[#2E5339] focus:ring-4 focus:ring-[#2E5339]/15 transition"
              />
            </div>
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
              {busy ? 'Saving new password…' : 'Set New Password'}
            </button>
          </form>
        )}

        {step === 'done' && (
          <div className="mt-6 space-y-4">
            {notice && (
              <div className="text-sm font-semibold text-[#1B3322] bg-[#E8F0E9] border-2 border-[#A3C9A8] rounded-xl px-4 py-3">
                {notice}
              </div>
            )}
            <Link
              to={loginPath}
              className="block w-full text-center h-12 sm:h-13 leading-[3rem] rounded-xl bg-[#2E5339] text-white text-base font-bold hover:bg-[#24412D] transition shadow-md"
            >
              Back to Sign In
            </Link>
          </div>
        )}

        <div className="mt-6 pt-5 border-t border-[#E8E2D6] text-center">
          <p className="text-sm sm:text-base text-[#374151] font-medium">
            Remembered your password?{' '}
            <Link to={loginPath} className="text-[#2E5339] font-extrabold underline hover:text-[#1B3322] ml-1">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
