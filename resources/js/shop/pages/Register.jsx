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
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg bg-white border-2 border-[#E8E2D6] rounded-2xl p-7 sm:p-9 shadow-md">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-3 group hover:opacity-90 transition">
            <img src="/apple-touch-icon-180.png" alt="AniMarket" className="w-9 h-9 rounded-xl shadow-sm shrink-0" />
            <span className="font-bold text-2xl text-[#1A1A1A] tracking-tight leading-none">AniMarket</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1A1A1A]">Create an Account</h1>
          <p className="text-sm sm:text-base text-[#374151] mt-2 font-medium">
            {form.role === 'farmer'
              ? 'Sell your fresh harvests directly to households and wholesale buyers.'
              : form.role === 'buyer_business'
              ? 'Source bulk fresh produce directly from local accredited farms.'
              : 'Farm-fresh harvests delivered directly to your household.'}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="block text-sm sm:text-base font-bold text-[#1A1A1A] mb-2">
              Select Account Type <span className="text-[#B0413E]">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { value: 'buyer_individual', label: 'Household', desc: 'Family / Personal' },
                { value: 'buyer_business', label: 'Business', desc: 'Wholesale B2B' },
                { value: 'farmer', label: 'Farmer', desc: 'Grower / Seller' },
              ].map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setForm({ ...form, role: r.value })}
                  className={`py-3 px-2 rounded-xl text-center border-2 transition ${
                    form.role === r.value
                      ? 'bg-[#E8F0E9] border-[#2E5339] text-[#2E5339] font-bold shadow-sm ring-1 ring-[#2E5339]'
                      : 'border-[#CBD5E1] bg-[#FAF8F3] text-[#4B5563] hover:border-[#2E5339]/50 font-medium'
                  }`}
                >
                  <span className="block text-sm sm:text-base font-bold">{r.label}</span>
                  <span className={`block text-xs mt-0.5 ${form.role === r.value ? 'text-[#2E5339] font-semibold' : 'text-[#64748B]'}`}>
                    {r.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="reg-name" className="block text-sm sm:text-base font-bold text-[#1A1A1A] mb-1.5">
              Full Name <span className="text-[#B0413E]">*</span>
            </label>
            <input
              id="reg-name"
              required
              autoComplete="name"
              placeholder="e.g. Juan Dela Cruz"
              value={form.name}
              onChange={set('name')}
              className="w-full h-12 sm:h-13 border-2 border-[#CBD5E1] bg-white rounded-xl px-4 text-base text-[#1A1A1A] font-medium placeholder:text-[#64748B] focus:outline-none focus:border-[#2E5339] focus:ring-4 focus:ring-[#2E5339]/15 transition"
            />
          </div>

          <div>
            <label htmlFor="reg-email" className="block text-sm sm:text-base font-bold text-[#1A1A1A] mb-1.5">
              Email Address <span className="text-[#B0413E]">*</span>
            </label>
            <input
              id="reg-email"
              required
              type="email"
              autoComplete="email"
              placeholder="e.g. juan.delacruz@gmail.com"
              value={form.email}
              onChange={set('email')}
              className="w-full h-12 sm:h-13 border-2 border-[#CBD5E1] bg-white rounded-xl px-4 text-base text-[#1A1A1A] font-medium placeholder:text-[#64748B] focus:outline-none focus:border-[#2E5339] focus:ring-4 focus:ring-[#2E5339]/15 transition"
            />
          </div>

          <div>
            <label htmlFor="reg-phone" className="block text-sm sm:text-base font-bold text-[#1A1A1A] mb-1.5">
              Mobile Phone Number <span className="text-xs sm:text-sm font-normal text-[#64748B]">(Optional)</span>
            </label>
            <input
              id="reg-phone"
              type="tel"
              autoComplete="tel"
              placeholder="e.g. 0917 123 4567"
              value={form.phone}
              onChange={set('phone')}
              className="w-full h-12 sm:h-13 border-2 border-[#CBD5E1] bg-white rounded-xl px-4 text-base text-[#1A1A1A] font-medium placeholder:text-[#64748B] focus:outline-none focus:border-[#2E5339] focus:ring-4 focus:ring-[#2E5339]/15 transition"
            />
          </div>

          {form.role === 'buyer_business' && (
            <div>
              <label htmlFor="reg-delivery" className="block text-sm sm:text-base font-bold text-[#1A1A1A] mb-1.5">
                Business Delivery Address <span className="text-[#B0413E]">*</span>
              </label>
              <input
                id="reg-delivery"
                required
                placeholder="Street address, building, or warehouse location"
                value={form.delivery_address}
                onChange={set('delivery_address')}
                className="w-full h-12 sm:h-13 border-2 border-[#CBD5E1] bg-white rounded-xl px-4 text-base text-[#1A1A1A] font-medium placeholder:text-[#64748B] focus:outline-none focus:border-[#2E5339] focus:ring-4 focus:ring-[#2E5339]/15 transition"
              />
            </div>
          )}

          {form.role === 'farmer' && (
            <>
              <div>
                <label htmlFor="reg-farm" className="block text-sm sm:text-base font-bold text-[#1A1A1A] mb-1.5">
                  Farm Name <span className="text-[#B0413E]">*</span>
                </label>
                <input
                  id="reg-farm"
                  required
                  placeholder="e.g. Santos Organic Valley Farm"
                  value={form.farm_name}
                  onChange={set('farm_name')}
                  className="w-full h-12 sm:h-13 border-2 border-[#CBD5E1] bg-white rounded-xl px-4 text-base text-[#1A1A1A] font-medium placeholder:text-[#64748B] focus:outline-none focus:border-[#2E5339] focus:ring-4 focus:ring-[#2E5339]/15 transition"
                />
              </div>

              <div>
                <label className="block text-sm sm:text-base font-bold text-[#1A1A1A] mb-1.5">
                  Farm Location <span className="text-[#B0413E]">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label htmlFor="reg-barangay" className="block text-xs font-semibold text-[#4B5563] mb-1">
                      Barangay
                    </label>
                    <input
                      id="reg-barangay"
                      placeholder="e.g. San Jose"
                      value={form.barangay}
                      onChange={set('barangay')}
                      className="w-full h-12 border-2 border-[#CBD5E1] bg-white rounded-xl px-3.5 text-sm sm:text-base text-[#1A1A1A] font-medium placeholder:text-[#64748B] focus:outline-none focus:border-[#2E5339] focus:ring-4 focus:ring-[#2E5339]/15 transition"
                    />
                  </div>
                  <div>
                    <label htmlFor="reg-municipality" className="block text-xs font-semibold text-[#4B5563] mb-1">
                      Municipality / City
                    </label>
                    <input
                      id="reg-municipality"
                      placeholder="e.g. La Trinidad"
                      value={form.municipality}
                      onChange={set('municipality')}
                      className="w-full h-12 border-2 border-[#CBD5E1] bg-white rounded-xl px-3.5 text-sm sm:text-base text-[#1A1A1A] font-medium placeholder:text-[#64748B] focus:outline-none focus:border-[#2E5339] focus:ring-4 focus:ring-[#2E5339]/15 transition"
                    />
                  </div>
                  <div>
                    <label htmlFor="reg-province" className="block text-xs font-semibold text-[#4B5563] mb-1">
                      Province
                    </label>
                    <input
                      id="reg-province"
                      placeholder="e.g. Benguet"
                      value={form.province}
                      onChange={set('province')}
                      className="w-full h-12 border-2 border-[#CBD5E1] bg-white rounded-xl px-3.5 text-sm sm:text-base text-[#1A1A1A] font-medium placeholder:text-[#64748B] focus:outline-none focus:border-[#2E5339] focus:ring-4 focus:ring-[#2E5339]/15 transition"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="reg-bio" className="block text-sm sm:text-base font-bold text-[#1A1A1A] mb-1.5">
                  About your farm & growing practices{' '}
                  <span className="text-xs sm:text-sm font-normal text-[#64748B]">(Optional)</span>
                </label>
                <textarea
                  id="reg-bio"
                  placeholder="Tell buyers about your produce, elevation, pesticide-free methods, or harvest calendar..."
                  rows={3}
                  value={form.bio}
                  onChange={set('bio')}
                  className="w-full border-2 border-[#CBD5E1] bg-white rounded-xl p-4 text-base text-[#1A1A1A] font-medium placeholder:text-[#64748B] focus:outline-none focus:border-[#2E5339] focus:ring-4 focus:ring-[#2E5339]/15 transition"
                />
              </div>

              <div className="p-4 sm:p-5 bg-[#FAF8F3] rounded-2xl border-2 border-[#CBD5E1] space-y-2">
                <label htmlFor="reg-doc" className="block text-sm sm:text-base font-bold text-[#1A1A1A]">
                  Farm Verification Document <span className="text-[#B0413E]">*</span>
                </label>
                <p className="text-xs sm:text-sm text-[#374151] font-medium leading-relaxed">
                  Upload a photo of your Government ID, RSBSA registration card, or Barangay certificate of farming (JPG, PNG, or PDF up to 5MB).
                </p>
                <input
                  id="reg-doc"
                  required
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => setDoc(e.target.files?.[0] ?? null)}
                  className="mt-2 w-full text-sm text-[#1A1A1A] file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:bg-[#2E5339] file:text-white file:text-sm file:font-bold file:cursor-pointer hover:file:bg-[#24412D] transition"
                />
              </div>
            </>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="reg-password" className="block text-sm sm:text-base font-bold text-[#1A1A1A] mb-1.5">
                Password <span className="text-[#B0413E]">*</span>
              </label>
              <input
                id="reg-password"
                required
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={form.password}
                onChange={set('password')}
                className="w-full h-12 sm:h-13 border-2 border-[#CBD5E1] bg-white rounded-xl px-4 text-base text-[#1A1A1A] font-medium placeholder:text-[#64748B] focus:outline-none focus:border-[#2E5339] focus:ring-4 focus:ring-[#2E5339]/15 transition"
              />
            </div>
            <div>
              <label htmlFor="reg-confirm" className="block text-sm sm:text-base font-bold text-[#1A1A1A] mb-1.5">
                Confirm Password <span className="text-[#B0413E]">*</span>
              </label>
              <input
                id="reg-confirm"
                required
                type="password"
                autoComplete="new-password"
                placeholder="Re-enter password"
                value={form.password_confirmation}
                onChange={set('password_confirmation')}
                className="w-full h-12 sm:h-13 border-2 border-[#CBD5E1] bg-white rounded-xl px-4 text-base text-[#1A1A1A] font-medium placeholder:text-[#64748B] focus:outline-none focus:border-[#2E5339] focus:ring-4 focus:ring-[#2E5339]/15 transition"
              />
            </div>
          </div>

          {error && (
            <div className="text-sm font-semibold text-[#991B1B] bg-[#FEE2E2] border-2 border-[#FCA5A5] rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full h-12 sm:h-13 py-3.5 rounded-xl bg-[#2E5339] text-white text-base font-bold hover:bg-[#24412D] transition shadow-md disabled:opacity-60 flex items-center justify-center tracking-wide"
          >
            {busy ? 'Creating Your Account…' : 'Create My Account'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-[#E8E2D6] text-center">
          <p className="text-sm sm:text-base text-[#374151] font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-[#2E5339] font-extrabold underline hover:text-[#1B3322] ml-1">
              Sign In
            </Link>
          </p>
        </div>
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

