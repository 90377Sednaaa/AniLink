import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../lib/auth'
import { useCart } from '../lib/cart'
import { api } from '../lib/api'
import { Icon } from '../../shared/ui'

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const { count } = useCart()
  const navgo = useNavigate()

  const { data: unread } = useQuery({
    queryKey: ['unread-count'],
    queryFn: api.unreadCount,
    enabled: !!user,
    refetchInterval: 30000,
  })

  return (
    <div className="min-h-screen bg-[#FAF8F3] flex flex-col text-[#1A1A1A]">
      <header className="bg-[#2E5339] text-white sticky top-0 z-30 shadow-[0_2px_14px_rgba(46,83,57,0.22)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-white/80 hover:text-white transition px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 shrink-0"
              title="Return to AniLink Home"
            >
              <span>←</span>
              <span className="hidden sm:inline">AniLink Home</span>
            </a>

            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <img src="/apple-touch-icon-180.png" alt="AniMarket" className="w-8 h-8 rounded-xl shadow-sm" />
              <span className="leading-tight">
                <span className="block font-semibold text-base text-white">AniMarket</span>
                <span className="block text-[10px] text-white/70 tracking-wide uppercase">Farm-Direct</span>
              </span>
            </Link>
          </div>

          <nav className="flex items-center gap-1.5 sm:gap-2">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition ${
                  isActive ? 'bg-white text-[#2E5339] font-semibold shadow-sm' : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              Market
            </NavLink>

            {user ? (
              <>
                <NavLink
                  to="/orders"
                  className={({ isActive }) =>
                    `px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition hidden sm:inline-block ${
                      isActive ? 'bg-white text-[#2E5339] font-semibold shadow-sm' : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  My Orders
                </NavLink>

                <Link
                  to="/notifications"
                  className="relative w-9 h-9 rounded-full flex items-center justify-center text-white/80 hover:bg-white/15 hover:text-white transition"
                  title="Notifications"
                >
                  <Icon name="bell" className="w-4 h-4" />
                  {!!unread?.count && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[#D4A017] text-[#1A1A1A] text-[10px] font-bold flex items-center justify-center shadow-sm">
                      {unread.count > 9 ? '9+' : unread.count}
                    </span>
                  )}
                </Link>

                <Link
                  to="/cart"
                  className="relative flex items-center gap-1.5 h-9 px-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition"
                  title="View shopping basket"
                >
                  <Icon name="cart" className="w-4 h-4" />
                  <span className="hidden sm:inline">Basket</span>
                  {count > 0 && (
                    <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#D4A017] text-[#1A1A1A] text-[10px] font-bold flex items-center justify-center shadow-sm">
                      {count > 9 ? '9+' : count}
                    </span>
                  )}
                </Link>

                <div className="hidden md:flex items-center gap-2.5 pl-3 ml-1 border-l border-white/20">
                  <div className="text-right leading-none">
                    <div className="text-xs font-semibold text-white truncate max-w-[120px]">{user.name}</div>
                    <div className="text-[10px] text-white/70 mt-0.5">
                      {user.role === 'buyer_business' ? 'B2B Buyer' : user.role === 'admin' ? 'Admin' : 'Buyer'}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout()
                      navgo('/')
                    }}
                    className="text-xs px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 hover:text-white transition border border-white/15"
                  >
                    Log out
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/cart"
                  className="relative flex items-center gap-1.5 h-9 px-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition"
                  title="View shopping basket"
                >
                  <Icon name="cart" className="w-4 h-4" />
                  {count > 0 && (
                    <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#D4A017] text-[#1A1A1A] text-[10px] font-bold flex items-center justify-center shadow-sm">
                      {count > 9 ? '9+' : count}
                    </span>
                  )}
                </Link>

                <Link
                  to="/login"
                  className="px-4 py-1.5 rounded-full bg-[#D4A017] text-[#1A1A1A] text-xs sm:text-sm font-semibold hover:brightness-105 transition shadow-sm"
                >
                  Sign In
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">{children}</main>

      <footer className="border-t border-[#E8E2D6] bg-white py-6 text-center text-xs text-[#8A8A8A]">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} AniLink · AniMarket — Farm-fresh harvests from accredited Filipino growers.</p>
          <div className="flex items-center gap-4 text-[#5C5C5C]">
            <a href="/" className="hover:text-[#2E5339] transition">Home</a>
            <a href="/manage" className="hover:text-[#2E5339] transition">Farmer Portal</a>
            <a href="/admin" className="hover:text-[#2E5339] transition">Staff Admin</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
