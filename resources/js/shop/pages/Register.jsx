import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export default function Register() {
  const { register } = useAuth()
  const navgo = useNavigate()
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', password_confirmation: '',
    role: 'buyer_individual', delivery_address: '',
  })
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await register(form)
      navgo('/')
    } catch (err) {
      const errors = err.data?.errors
      setError(errors ? Object.values(errors).flat().join(' ') : (err.message || 'Registration failed'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white border border-[#E8E2D6] rounded-[16px] p-6">
        <h1 className="text-xl font-semibold">Create buyer account</h1>
        <p className="text-sm text-[#5C5C5C] mt-1">Shop fresh harvests directly from verified Filipino farms.</p>

        <form onSubmit={submit} className="mt-5 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'buyer_individual', label: 'Individual' },
              { value: 'buyer_business', label: 'Business' },
            ].map(r => (
              <button
                key={r.value}
                type="button"
                onClick={() => setForm({ ...form, role: r.value })}
                className={`py-2.5 rounded-[12px] text-sm font-semibold border transition ${form.role === r.value ? 'bg-[#E8F0E9] border-[#2E5339] text-[#2E5339]' : 'border-[#E8E2D6] text-[#5C5C5C] hover:border-[#C5D9C7]'}`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <input required placeholder="Full name" value={form.name} onChange={set('name')}
            className="w-full border border-[#E8E2D6] rounded-[12px] px-4 py-3 text-sm focus:outline-none focus:border-[#2E5339]" />
          <input required type="email" placeholder="Email" value={form.email} onChange={set('email')}
            className="w-full border border-[#E8E2D6] rounded-[12px] px-4 py-3 text-sm focus:outline-none focus:border-[#2E5339]" />
          <input placeholder="Mobile number (optional)" value={form.phone} onChange={set('phone')}
            className="w-full border border-[#E8E2D6] rounded-[12px] px-4 py-3 text-sm focus:outline-none focus:border-[#2E5339]" />
          {form.role === 'buyer_business' && (
            <input placeholder="Delivery address" value={form.delivery_address} onChange={set('delivery_address')}
              className="w-full border border-[#E8E2D6] rounded-[12px] px-4 py-3 text-sm focus:outline-none focus:border-[#2E5339]" />
          )}
          <div className="grid grid-cols-2 gap-3">
            <input required type="password" placeholder="Password" value={form.password} onChange={set('password')}
              className="w-full border border-[#E8E2D6] rounded-[12px] px-4 py-3 text-sm focus:outline-none focus:border-[#2E5339]" />
            <input required type="password" placeholder="Confirm" value={form.password_confirmation} onChange={set('password_confirmation')}
              className="w-full border border-[#E8E2D6] rounded-[12px] px-4 py-3 text-sm focus:outline-none focus:border-[#2E5339]" />
          </div>

          {error && <div className="text-sm text-[#B0413E] bg-[#F6E3E2] border border-[#E5B9B6] rounded-[10px] px-3 py-2">{error}</div>}

          <button
            disabled={busy}
            className="w-full py-3 rounded-[12px] bg-[#2E5339] text-white text-sm font-semibold hover:brightness-110 disabled:opacity-50"
          >
            {busy ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-xs text-[#5C5C5C] mt-4 text-center">
          Already have an account? <Link to="/login" className="text-[#2E5339] font-semibold underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
