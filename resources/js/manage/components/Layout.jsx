import { useState } from 'react'
import { NavLink, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { Icon } from '../../shared/ui'

const nav = [
  { to: '/', label: 'Inventory & Harvests', icon: 'inventory', desc: 'Stock • Price • Restock' },
  { to: '/orders', label: 'Order Queue', icon: 'orders', desc: 'Pending → Completed' },
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navgo = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const farm = user?.farmerProfile?.farm_name || user?.name || 'My Farm'
  const location = [user?.farmerProfile?.barangay, user?.farmerProfile?.municipality].filter(Boolean).join(', ')
  const verified = user?.farmerProfile?.verification_status === 'approved'

  const handleSignOut = () => {
    logout()
    navgo('/login')
  }

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#1A1A1A] flex flex-col lg:flex-row">
      {/* Mobile Top Header (lg:hidden) */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E8E2D6] px-4 py-3 flex items-center justify-between lg:hidden shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="w-10 h-10 rounded-xl bg-[#FAF8F3] border border-[#E8E2D6] flex items-center justify-center text-[#1A1A1A] active:scale-95 transition"
            aria-label="Open menu"
          >
            <Icon name="menu" className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#E8F0E9] border border-[#2E5339]/15 flex items-center justify-center overflow-hidden">
              <img src="/apple-touch-icon-180.png" alt="" className="w-6 h-6 object-contain -translate-y-0.5" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-[#1A1A1A] leading-none">AniManage</div>
              <div className="text-[10px] font-semibold text-[#2E5339] mt-0.5 truncate max-w-[130px]">{farm}</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/shop"
            className="h-8 px-3 rounded-full bg-[#FAF8F3] border border-[#E8E2D6] text-xs font-semibold text-[#2E5339] hover:bg-[#E8F0E9] flex items-center gap-1.5 transition shadow-sm"
            title="View Public Marketplace"
          >
            <Icon name="store" className="w-3.5 h-3.5" />
            <span>Shop</span>
          </a>
        </div>
      </header>

      {/* Mobile Drawer Backdrop & Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-[#1A1A1A]/40 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[300px] max-w-[85vw] bg-[#2E5339] text-white flex flex-col shadow-2xl p-6">
            <div className="flex items-center justify-between pb-5 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#E8F0E9] flex items-center justify-center overflow-hidden">
                  <img src="/apple-touch-icon-180.png" alt="" className="w-7 h-7 object-contain -translate-y-0.5" />
                </div>
                <div>
                  <div className="font-bold text-base leading-none">AniManage</div>
                  <div className="text-xs text-white/70 mt-1">Farmer Portal</div>
                </div>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
                aria-label="Close menu"
              >
                <Icon name="close" className="w-4 h-4 text-white" />
              </button>
            </div>

            <div className="py-4 border-b border-white/10 space-y-2">
              <div className="text-xs font-bold text-[#D4A017] uppercase tracking-wider">Farm Account</div>
              <div className="font-semibold text-sm text-white truncate">{farm}</div>
              {location && (
                <div className="text-xs text-white/70 flex items-center gap-1">
                  <Icon name="mapPin" className="w-3.5 h-3.5 text-[#D4A017] shrink-0" />
                  <span className="truncate">{location}</span>
                </div>
              )}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                  verified ? 'bg-[#E8F0E9] border-[#C5D9C7] text-[#2E5339]' : 'bg-[#FFF4D6] border-[#F2D98A] text-[#8A6A0A]'
                }`}>
                  <Icon name="shieldCheck" className="w-3 h-3" />
                  {verified ? 'Verified Farm' : 'Pending Verification'}
                </span>
              </div>
            </div>

            <nav className="flex-1 py-4 space-y-2 overflow-y-auto">
              {nav.map(n => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.to === '/'}
                  onClick={() => setMobileOpen(false)}
                >
                  {({ isActive }) => (
                    <span className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition ${
                      isActive
                        ? 'bg-white text-[#2E5339] font-bold shadow-md'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}>
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isActive ? 'bg-[#D4A017] text-[#1A1A1A]' : 'bg-white/10 text-white'
                      }`}>
                        <Icon name={n.icon} className="w-4 h-4" />
                      </span>
                      <span className="leading-tight">
                        <span className="block text-sm font-semibold">{n.label}</span>
                        <span className="block text-[11px] opacity-70 mt-0.5">{n.desc}</span>
                      </span>
                    </span>
                  )}
                </NavLink>
              ))}

              <div className="pt-4">
                <a
                  href="/shop"
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition text-xs font-semibold"
                >
                  <Icon name="store" className="w-4 h-4 text-[#D4A017]" />
                  <span>View Public Shop</span>
                </a>
              </div>
            </nav>

            <div className="pt-4 border-t border-white/10 space-y-3">
              <div className="bg-white/10 rounded-2xl p-3.5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#D4A017] text-[#1A1A1A] font-extrabold flex items-center justify-center shrink-0 shadow-sm text-sm">
                  {user?.name?.[0]?.toUpperCase() || 'F'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-white truncate">{user?.name}</div>
                  <div className="text-xs text-white/70 truncate">{user?.email}</div>
                </div>
              </div>

              <button
                onClick={() => {
                  setMobileOpen(false)
                  setShowLogoutConfirm(true)
                }}
                className="w-full h-11 rounded-xl bg-white/10 hover:bg-[#B0413E] text-white text-xs font-bold transition flex items-center justify-center gap-2 border border-white/15 active:scale-95 shadow-sm"
              >
                <Icon name="logout" className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar (lg:flex) */}
      <aside className="hidden lg:flex w-72 bg-gradient-to-b from-[#2E5339] to-[#1E3926] text-white flex-col fixed top-0 left-0 h-screen shadow-xl z-20">
        {/* Brand Header */}
        <div className="px-6 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E8F0E9] border border-[#2E5339]/20 flex items-center justify-center shadow-sm overflow-hidden shrink-0">
              <img src="/apple-touch-icon-180.png" alt="AniManage" className="w-8 h-8 object-contain -translate-y-0.5 select-none" />
            </div>
            <div>
              <div className="font-extrabold text-lg text-white leading-none tracking-tight">AniManage</div>
              <div className="text-[11px] font-semibold text-[#D4A017] uppercase tracking-wider mt-1">Farmer Portal</div>
            </div>
          </div>

          {/* Farm ID Badge */}
          <div className="mt-4 p-3 rounded-xl bg-white/10 border border-white/10 backdrop-blur-sm space-y-2">
            <div className="flex items-center justify-between gap-1">
              <span className="font-bold text-sm text-white truncate">{farm}</span>
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                verified ? 'bg-[#E8F0E9] text-[#2E5339]' : 'bg-[#FFF4D6] text-[#8A6A0A]'
              }`}>
                <Icon name="shieldCheck" className="w-3 h-3" />
                {verified ? 'Verified' : 'Pending'}
              </span>
            </div>
            {location && (
              <div className="text-xs text-white/75 flex items-center gap-1.5 truncate">
                <Icon name="mapPin" className="w-3.5 h-3.5 text-[#D4A017] shrink-0" />
                <span className="truncate">{location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
          {nav.map(n => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'}>
              {({ isActive }) => (
                <span className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition group ${
                  isActive
                    ? 'bg-white text-[#2E5339] font-bold shadow-md'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}>
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition ${
                    isActive ? 'bg-[#D4A017] text-[#1A1A1A] shadow-sm' : 'bg-white/10 text-white group-hover:bg-white/20'
                  }`}>
                    <Icon name={n.icon} className="w-4 h-4" />
                  </span>
                  <span className="leading-tight">
                    <span className="block text-sm font-semibold">{n.label}</span>
                    <span className="block text-[11px] opacity-70 mt-0.5">{n.desc}</span>
                  </span>
                </span>
              )}
            </NavLink>
          ))}

          {/* Farmer Tip Card */}
          <div className="mt-6 rounded-2xl bg-white/10 p-4 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#D4A017]">
              <Icon name="sprout" className="w-4 h-4 text-[#D4A017]" />
              <span>Real-Time Sync</span>
            </div>
            <p className="text-xs leading-5 text-white/80 mt-1.5">
              Updates to stock quantities and order statuses reflect immediately across the AniLink mobile app and web marketplace.
            </p>
          </div>
        </nav>

        {/* Farmer Profile / Footer */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="bg-white/10 rounded-2xl p-3.5 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#D4A017] text-[#1A1A1A] font-extrabold flex items-center justify-center shrink-0 shadow-sm text-sm">
                {user?.name?.[0]?.toUpperCase() || 'F'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-white truncate leading-tight">{user?.name}</div>
                <div className="text-[11px] text-white/60 truncate mt-0.5">{user?.email}</div>
              </div>
            </div>

            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full mt-3 h-9 rounded-xl bg-white/10 hover:bg-[#B0413E] text-white/90 hover:text-white text-xs font-bold transition flex items-center justify-center gap-2 border border-white/10 hover:border-transparent active:scale-95 shadow-sm"
            >
              <Icon name="logout" className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
          <div className="text-[10px] text-white/50 text-center tracking-wide">
            AniLink · Fair Harvest Direct
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col bg-[#FAF8F3] lg:ml-72">
        {/* Desktop Top Header Bar */}
        <header className="hidden lg:flex sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-[#E8E2D6] px-8 py-3.5 items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-base text-[#1A1A1A]">AniManage</span>
            <span className="text-[#E8E2D6]">/</span>
            <span className="text-xs font-semibold text-[#5C5C5C]">{farm}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Sync Status (Zero dots) */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F0E9] border border-[#2E5339]/20 text-[#2E5339] text-xs font-bold shadow-sm">
              <Icon name="refresh" className="w-3.5 h-3.5 text-[#2E5339]" />
              <span>Live Synchronized</span>
            </span>

            {/* View Shop CTA */}
            <a
              href="/shop"
              className="inline-flex items-center gap-2 h-9 px-4 rounded-full border border-[#E8E2D6] bg-white hover:bg-[#FAF8F3] hover:border-[#2E5339]/30 text-xs font-bold text-[#2E5339] transition shadow-sm active:scale-95"
              title="Open buyer marketplace in a new window"
            >
              <Icon name="store" className="w-3.5 h-3.5" />
              <span>View Public Shop</span>
              <Icon name="arrowUpRight" className="w-3 h-3 text-[#2E5339]/60" />
            </a>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1360px] w-full mx-auto pb-24 lg:pb-10">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Quick Navigation Bar (lg:hidden) */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#E8E2D6] px-6 py-2 flex items-center justify-around shadow-[0_-4px_16px_rgba(0,0,0,0.06)] lg:hidden">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition ${
              isActive ? 'text-[#2E5339] font-bold' : 'text-[#8A8A8A] hover:text-[#1A1A1A]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
                isActive ? 'bg-[#E8F0E9] text-[#2E5339]' : 'text-[#8A8A8A]'
              }`}>
                <Icon name="inventory" className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-semibold">Inventory</span>
            </>
          )}
        </NavLink>

        <NavLink
          to="/orders"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition ${
              isActive ? 'text-[#2E5339] font-bold' : 'text-[#8A8A8A] hover:text-[#1A1A1A]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
                isActive ? 'bg-[#E8F0E9] text-[#2E5339]' : 'text-[#8A8A8A]'
              }`}>
                <Icon name="orders" className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-semibold">Orders</span>
            </>
          )}
        </NavLink>
      </nav>

      {/* Sign Out Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#1A1A1A]/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setShowLogoutConfirm(false)}
          />

          <div className="relative bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border-2 border-[#E8E2D6] space-y-4 animate-in fade-in zoom-in-95 duration-150 z-10">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#FDF2F2] border-2 border-[#F8B4B4] text-[#B0413E] flex items-center justify-center mb-3 shadow-sm">
                <Icon name="logout" className="w-6 h-6 text-[#B0413E]" />
              </div>
              <h3 className="text-lg font-extrabold text-[#1A1A1A]">Sign Out of AniManage?</h3>
              <p className="text-xs text-[#5C5C5C] mt-1.5 leading-relaxed">
                Are you sure you want to end your farm portal session for <strong className="text-[#1A1A1A]">{user?.name}</strong>? You will need to enter your password to sign back in.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 h-12 rounded-xl border border-[#CBD5E1] text-xs font-bold text-[#4B5563] hover:bg-[#FAF8F3] hover:text-[#1A1A1A] transition active:scale-95"
              >
                Stay Signed In
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false)
                  handleSignOut()
                }}
                className="flex-1 h-12 rounded-xl bg-[#B0413E] hover:bg-[#991B1B] text-white text-xs font-bold shadow-md hover:shadow-lg transition active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Icon name="logout" className="w-4 h-4" />
                <span>Yes, Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
