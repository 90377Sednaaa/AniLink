import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export default function Register() {
  const { register } = useAuth()
  const navgo = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    role: 'buyer_individual',
    delivery_address: '',
    farm_name: '',
    barangay: '',
    municipality: '',
    province: '',
    bio: '',
  })
  const [doc, setDoc] = useState(null)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      if (form.role === 'farmer') {
        const data = new FormData()
        Object.entries(form).forEach(([k, v]) => {
          if (k !== 'delivery_address') data.append(k, v)
        })
        data.append('verification_doc', doc)
        await register(data)
      } else {
        await register(form)
      }
      navgo('/')
    } catch (err) {
      const errors = err.data?.errors
      setError(errors ? Object.values(errors).flat().join(' ') : err.message || 'Registration failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white border border-[#E8E2D6] rounded-2xl p-6 sm:p-7 shadow-sm">
        <div className="text-center mb-5">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <img src="/apple-touch-icon-180.png" alt="AniMarket" className="w-9 h-9 rounded-xl shadow-sm" />
            <span className="font-bold text-lg text-[#1A1A1A]">AniMarket</span>
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-[#1A1A1A]">Create an Account</h1>
          <p className="text-xs text-[#5C5C5C] mt-1">
            {form.role === 'farmer'
              ? 'Sell your fresh harvests directly to households and wholesale buyers.'
              : 'Direct-from-farm produce delivered to your doorstep.'}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-3.5">
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'buyer_individual', label: 'Individual' },
              { value: 'buyer_business', label: 'Business' },
              { value: 'farmer', label: 'Farmer' },
            ].map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setForm({ ...form, role: r.value })}
                className={`py-2 rounded-xl text-xs font-semibold border transition ${
                  form.role === r.value
                    ? 'bg-[#E8F0E9] border-[#2E5339] text-[#2E5339] shadow-sm'
                    : 'border-[#E8E2D6] bg-[#FAF8F3] text-[#5C5C5C] hover:border-[#2E5339]/40'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <input
            required
            placeholder="Full name"
            value={form.name}
            onChange={set('name')}
            className="w-full border border-[#E8E2D6] bg-[#FAF8F3] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2E5339] focus:bg-white transition"
          />
          <input
            required
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={set('email')}
            className="w-full border border-[#E8E2D6] bg-[#FAF8F3] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2E5339] focus:bg-white transition"
          />
          <input
            placeholder="Mobile number (optional)"
            value={form.phone}
            onChange={set('phone')}
            className="w-full border border-[#E8E2D6] bg-[#FAF8F3] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2E5339] focus:bg-white transition"
          />

          {form.role === 'buyer_business' && (
            <input
              placeholder="Business delivery address"
              value={form.delivery_address}
              onChange={set('delivery_address')}
              className="w-full border border-[#E8E2D6] bg-[#FAF8F3] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2E5339] focus:bg-white transition"
            />
          )}

          {form.role === 'farmer' && (
            <>
              <input
                required
                placeholder="Farm name"
                value={form.farm_name}
                onChange={set('farm_name')}
                className="w-full border border-[#E8E2D6] bg-[#FAF8F3] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2E5339] focus:bg-white transition"
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  placeholder="Barangay"
                  value={form.barangay}
                  onChange={set('barangay')}
                  className="w-full border border-[#E8E2D6] bg-[#FAF8F3] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2E5339] focus:bg-white transition"
                />
                <input
                  placeholder="Municipality"
                  value={form.municipality}
                  onChange={set('municipality')}
                  className="w-full border border-[#E8E2D6] bg-[#FAF8F3] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2E5339] focus:bg-white transition"
                />
                <input
                  placeholder="Province"
                  value={form.province}
                  onChange={set('province')}
                  className="w-full border border-[#E8E2D6] bg-[#FAF8F3] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2E5339] focus:bg-white transition"
                />
              </div>
              <textarea
                placeholder="Tell buyers about your farm and harvesting practices (optional)"
                rows={2}
                value={form.bio}
                onChange={set('bio')}
                className="w-full border border-[#E8E2D6] bg-[#FAF8F3] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#2E5339] focus:bg-white transition"
              />
              <div className="p-3 bg-[#FAF8F3] rounded-xl border border-[#E8E2D6]">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#8A8A8A] block">
                  Farm Verification Document
                </label>
                <input
                  required
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => setDoc(e.target.files?.[0] ?? null)}
                  className="mt-1 w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#E8F0E9] file:text-[#2E5339] file:text-xs file:font-semibold"
                />
                <p className="text-[10px] text-[#8A8A8A] mt-1">
                  Valid government ID, RSBSA registration, or barangay farm certification (max 5MB).
                </p>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-2">
            <input
              required
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={set('password')}
              className="w-full border border-[#E8E2D6] bg-[#FAF8F3] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2E5339] focus:bg-white transition"
            />
            <input
              required
              type="password"
              placeholder="Confirm"
              value={form.password_confirmation}
              onChange={set('password_confirmation')}
              className="w-full border border-[#E8E2D6] bg-[#FAF8F3] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2E5339] focus:bg-white transition"
            />
          </div>

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
            {busy ? 'Creating Account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-xs text-[#5C5C5C] mt-5 pt-4 border-t border-[#E8E2D6]/80 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-[#2E5339] font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </div>

      <Link to="/" className="text-xs text-[#8A8A8A] hover:text-[#2E5339] mt-5 transition">
        ← Return to Marketplace
      </Link>
    </div>
  )
}
