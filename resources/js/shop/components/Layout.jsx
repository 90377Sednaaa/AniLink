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
    <div className="min-h-screen bg-[#FAF8F3] flex flex-col">
      <header className="bg-[#2E5339] text-white sticky top-0 z-20 shadow-[0_2px_12px_rgba(46,83,57,0.25)]">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <img src="/apple-touch-icon-180.png" alt="" className="w-9 h-9 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.25)]" />
            <span className="leading-none">
              <span className="block font-semibold">AniMarket</span>
              <span className="block text-[11px] opacity-70 mt-0.5">Farm-fresh, direct</span>
            </span>
          </Link>

          <nav className="flex-1 flex items-center justify-end gap-1 sm:gap-2">
            <NavLink to="/" end className={({ isActive }) => `px-3 py-2 rounded-[12px] text-sm transition ${isActive ? 'bg-white text-[#2E5339] font-semibold' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
              Browse
            </NavLink>

            {user ? (
              <>
                <NavLink to="/orders" className={({ isActive }) => `px-3 py-2 rounded-[12px] text-sm transition hidden sm:block ${isActive ? 'bg-white text-[#2E5339] font-semibold' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                  Orders
                </NavLink>
                <Link to="/notifications" className="relative w-10 h-10 rounded-full flex items-center justify-center text-white/80 hover:bg-white/10 hover:text-white" title="Notifications">
                  <Icon name="bell" />
                  {!!unread?.count && (
                    <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#D4A017] text-[#1A1A1A] text-[10px] font-bold flex items-center justify-center">
                      {unread.count > 9 ? '9+' : unread.count}
                    </span>
                  )}
                </Link>
                <Link to="/cart" className="relative w-10 h-10 rounded-full flex items-center justify-center text-white/80 hover:bg-white/10 hover:text-white" title="Cart">
                  <Icon name="cart" />
                  {count > 0 && (
                    <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#D4A017] text-[#1A1A1A] text-[10px] font-bold flex items-center justify-center">
                      {count > 9 ? '9+' : count}
                    </span>
                  )}
                </Link>
                <div className="hidden md:flex items-center gap-2 pl-3 ml-1 border-l border-white/15">
                  <div className="text-right leading-none">
                    <div className="text-sm font-medium">{user.name}</div>
                    <div className="text-[11px] opacity-70 mt-0.5">{user.role === 'buyer_business' ? 'Business buyer' : user.role === 'admin' ? 'Admin' : 'Buyer'}</div>
                  </div>
                  <button
                    onClick={() => { logout(); navgo('/') }}
                    className="text-xs px-3 py-2 rounded-[12px] bg-white/10 hover:bg-white/20 border border-white/10"
                  >
                    Log out
                  </button>
                </div>
              </>
            ) : (
              <Link to="/login" className="px-4 py-2 rounded-[12px] bg-[#D4A017] text-[#1A1A1A] text-sm font-semibold hover:brightness-105">
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">{children}</main>

      <footer className="border-t border-[#E8E2D6] py-6 text-center text-xs text-[#8A8A8A]">
        AniLink · AniMarket — fresh from Filipino farms · <Link to="/manage" className="underline hover:text-[#2E5339]">Farmer portal</Link> · <Link to="/admin" className="underline hover:text-[#2E5339]">Admin</Link>
      </footer>
    </div>
  )
}
