import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { Icon } from '../../shared/ui'

const nav = [
  { to: '/', label: 'Analytics', icon: 'analytics', desc: 'GMV · Farmers · Trends', mobileLabel: 'Stats' },
  { to: '/verifications', label: 'Verifications', icon: 'badge', desc: 'Review · Approve · Badge', mobileLabel: 'Verify' },
  { to: '/listings', label: 'Listings', icon: 'grid', desc: 'Products · Moderate', mobileLabel: 'Listings' },
  { to: '/users', label: 'Users', icon: 'users', desc: 'Roles · Access', mobileLabel: 'Users' },
  { to: '/reports', label: 'Reports', icon: 'alert', desc: 'Disputes · Resolve', mobileLabel: 'Reports' },
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navgo = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  
  const today = new Date().toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric' })
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'A'

  const handleLogout = () => {
    logout()
    navgo('/login')
  }

  // Sidebar content
  const renderSidebar = () => (
    <>
      <div className="px-6 py-6 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <img src="/apple-touch-icon-180.png" alt="" className="w-10 h-10 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.25)]" />
          <div>
            <div className="font-semibold text-xl leading-none">AniLink</div>
            <div className="text-[10px] tracking-widest text-[#D4A017] uppercase mt-1 font-bold">Admin Console</div>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-b border-white/10 shrink-0">
        <div className="bg-white/10 rounded-xl p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#D4A017] text-[#1A1A1A] flex items-center justify-center font-bold text-lg shrink-0">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold truncate text-white">{user?.name ?? 'Administrator'}</div>
            <div className="mt-1 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#D4A017] text-[#1A1A1A] uppercase tracking-wide">
              Admin
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {nav.map(n => (
          <NavLink key={n.to} to={n.to} end={n.to === '/'} onClick={() => setMobileOpen(false)}>
            {({ isActive }) => (
              <span className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition ${isActive ? 'bg-white shadow-[0_4px_12px_rgba(0,0,0,0.12)]' : 'hover:bg-white/10'}`}>
                <span className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center ${isActive ? 'bg-[#E8F0E9] text-[#2E5339]' : 'bg-white/10 text-white'}`}>
                  <Icon name={n.icon} className="w-5 h-5" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className={`block font-semibold ${isActive ? 'text-[#2E5339]' : 'text-white'}`}>{n.label}</span>
                  <span className={`block text-[11px] truncate mt-0.5 ${isActive ? 'text-[#4A7C59]' : 'text-white/60'}`}>{n.desc}</span>
                </span>
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10 shrink-0">
        <div className="space-y-2 mb-4">
          <a href="/manage" className="flex items-center justify-between text-[11px] text-white/70 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition">
            <span>Open AniManage</span>
            <span>→</span>
          </a>
          <a href="/shop" className="flex items-center justify-between text-[11px] text-white/70 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition">
            <span>View Shop</span>
            <span>→</span>
          </a>
        </div>
        <button onClick={() => { setMobileOpen(false); setShowLogoutConfirm(true) }}
          className="w-full h-10 rounded-full bg-transparent border border-white/20 text-white text-sm font-semibold hover:bg-white/10 transition inline-flex items-center justify-center gap-2">
          <Icon name="logout" className="w-[18px] h-[18px]" /> Sign out
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#1A1A1A] font-sans flex flex-col lg:flex-row pb-[60px] lg:pb-0">
      
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[260px] bg-gradient-to-b from-[#2E5339] to-[#1E3926] text-white flex-col fixed top-0 left-0 h-screen shadow-xl z-20">
        {renderSidebar()}
      </aside>

      {/* Mobile Top Header */}
      <header className="lg:hidden sticky top-0 z-20 bg-gradient-to-r from-[#2E5339] to-[#1E3926] text-white px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileOpen(true)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
            <Icon name="menu" className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <img src="/apple-touch-icon-180.png" alt="" className="w-8 h-8 rounded-lg shadow-sm" />
            <span className="font-semibold text-lg">AniLink</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-medium bg-black/20 px-2.5 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-[#4A7C59] animate-pulse" />
          Live
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative flex-1 w-full max-w-[280px] bg-gradient-to-b from-[#2E5339] to-[#1E3926] text-white flex flex-col shadow-2xl h-full animate-slide-in-left">
            {renderSidebar()}
          </div>
          <div className="w-14 shrink-0" aria-hidden="true"></div>
        </div>
      )}

      {/* Main Content Wrapper */}
      <div className="flex-1 min-w-0 flex flex-col lg:ml-[260px]">
        {/* Desktop Top Header Bar */}
        <header className="hidden lg:flex sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-[#E8E2D6] px-6 py-4 items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-sm font-semibold text-[#1A1A1A]">Admin Console</span>
            <span className="text-[#8A8A8A]">/</span>
            <span className="text-sm text-[#8A8A8A] truncate">{today}</span>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <a href="/manage" className="text-sm font-medium text-[#2E5339] hover:underline underline-offset-4">AniManage</a>
            <a href="/shop" className="text-sm font-medium text-[#2E5339] hover:underline underline-offset-4">Shop</a>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#2E5339] bg-[#E8F0E9] px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#4A7C59] animate-pulse" />
              Live Sync
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 max-w-[1280px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#E8E2D6] flex pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
        {nav.map(n => (
          <NavLink key={n.to} to={n.to} end={n.to === '/'} className="flex-1">
            {({ isActive }) => (
              <span className={`flex flex-col items-center justify-center py-2 h-14 gap-1 ${isActive ? 'text-[#2E5339]' : 'text-[#8A8A8A]'}`}>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isActive ? 'bg-[#E8F0E9]' : 'bg-transparent'}`}>
                  <Icon name={n.icon} className="w-5 h-5" />
                </span>
                <span className={`text-[10px] font-medium leading-none ${isActive ? 'font-semibold' : ''}`}>{n.mobileLabel}</span>
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowLogoutConfirm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in-up">
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-[#FEE2E2] text-[#B0413E] flex items-center justify-center mx-auto mb-4">
                <Icon name="logout" className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">Sign Out of Admin Console?</h3>
              <p className="text-sm text-[#555555] mb-6">
                You will need to sign back in to access the admin dashboard and manage the platform.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleLogout}
                  className="w-full h-12 rounded-xl bg-[#B0413E] text-white font-semibold text-base hover:bg-[#90302D] transition flex items-center justify-center"
                >
                  Yes, Sign Out
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="w-full h-12 rounded-xl bg-[#FAF8F3] text-[#1A1A1A] font-semibold text-base hover:bg-[#E8E2D6] transition flex items-center justify-center"
                >
                  Stay Signed In
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
