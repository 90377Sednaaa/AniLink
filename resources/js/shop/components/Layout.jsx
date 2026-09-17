import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../lib/auth'
import { useCart } from '../lib/cart'
import { api } from '../lib/api'
import { peso } from './format'
import { Icon } from '../../shared/ui'

function CartNotificationToast() {
  const { lastAdded, dismissNotification, subtotal, count } = useCart()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!lastAdded) {
      setVisible(false)
      return
    }
    setVisible(true)
    const timer = setTimeout(() => {
      setVisible(false)
      dismissNotification()
    }, 4500)
    return () => clearTimeout(timer)
  }, [lastAdded?.id])

  if (!visible || !lastAdded) return null

  const { product, qty } = lastAdded

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-sm w-[calc(100vw-2rem)] sm:w-96 bg-white border border-[#2E5339]/20 rounded-2xl shadow-[0_16px_40px_rgba(46,83,57,0.18)] p-4 transition-all duration-300">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[#2E5339]">
          <span className="w-5 h-5 rounded-full bg-[#E8F0E9] flex items-center justify-center text-[#2E5339]">
            <Icon name="check" className="w-3.5 h-3.5" />
          </span>
          <span>Added to Shopping Basket</span>
        </div>
        <button
          type="button"
          onClick={() => {
            setVisible(false)
            dismissNotification()
          }}
          className="text-[#8A8A8A] hover:text-[#1A1A1A] p-1 text-xs"
          title="Dismiss"
        >
          ✕
        </button>
      </div>

      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#E8E2D6]/70">
        <div className="w-12 h-12 rounded-xl bg-[#F4F1EA] overflow-hidden shrink-0 border border-[#E8E2D6]">
          {product.image ? (
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#4A7C59]/60">
              <Icon name="sprout" className="w-5 h-5" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-xs text-[#1A1A1A] truncate">{product.name}</div>
          <div className="text-[11px] text-[#5C5C5C] mt-0.5">
            {qty} × {peso(product.price_per_unit)}/{product.unit_type}
          </div>
          <div className="text-[10px] text-[#8A8A8A] mt-0.5 font-medium">
            Basket: {peso(subtotal)} ({count} {count === 1 ? 'item' : 'items'})
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3 pt-2">
        <Link
          to="/cart"
          onClick={() => {
            setVisible(false)
            dismissNotification()
          }}
          className="flex-1 py-2 px-3 rounded-xl bg-[#2E5339] text-white text-xs font-semibold hover:bg-[#24412D] text-center transition shadow-sm"
        >
          View Basket
        </Link>
        <Link
          to="/checkout"
          onClick={() => {
            setVisible(false)
            dismissNotification()
          }}
          className="py-2 px-3 rounded-xl border border-[#E8E2D6] text-[#5C5C5C] hover:text-[#1A1A1A] hover:bg-[#FAF8F3] text-xs font-semibold text-center transition"
        >
          Checkout →
        </Link>
      </div>
    </div>
  )
}

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
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-[#E8E2D6]/80 transition-all duration-300 shadow-[0_4px_20px_rgba(46,83,57,0.03)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-3 sm:gap-4">
          {/* Brand Logo - Far Left */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 shrink-0 group hover:opacity-95 transition">
            <div className="w-10 h-10 rounded-2xl bg-[#E8F0E9] border border-[#2E5339]/15 flex items-center justify-center shadow-sm group-hover:scale-105 transition duration-200 overflow-hidden relative">
              <img
                src="/apple-touch-icon-180.png"
                alt="AniMarket"
                className="w-8 h-8 object-contain -translate-y-0.5 select-none"
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-extrabold text-lg sm:text-xl text-[#1A1A1A] tracking-tight leading-none group-hover:text-[#2E5339] transition">
                AniMarket
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-[#2E5339] tracking-wider uppercase leading-none mt-1 sm:mt-1.5">
                Farm-Direct
              </span>
            </div>
          </Link>

          {/* Right Navigation */}
          <nav className="flex items-center gap-2 sm:gap-3">
            {/* Segmented Floating Pill Nav */}
            <div className="flex items-center bg-[#F4F1EA] p-1 rounded-full border border-[#E8E2D6] shadow-inner">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `px-3.5 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#2E5339] text-white shadow-sm'
                      : 'text-[#4B5563] hover:text-[#1A1A1A] hover:bg-white/60'
                  }`
                }
              >
                <Icon name="sprout" className="w-3.5 h-3.5" />
                <span>Market</span>
              </NavLink>

              {user && (
                <NavLink
                  to="/orders"
                  className={({ isActive }) =>
                    `px-3.5 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-[#2E5339] text-white shadow-sm'
                        : 'text-[#4B5563] hover:text-[#1A1A1A] hover:bg-white/60'
                    }`
                  }
                >
                  <Icon name="orders" className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">My Orders</span>
                  <span className="sm:hidden">Orders</span>
                </NavLink>
              )}
            </div>

            {/* Notifications Bell (for authenticated users) */}
            {user && (
              <Link
                to="/notifications"
                className="relative w-10 h-10 rounded-full flex items-center justify-center border border-[#E8E2D6] bg-white text-[#4B5563] hover:text-[#2E5339] hover:border-[#2E5339]/40 hover:bg-[#FAF8F3] transition shadow-sm active:scale-95"
                title="Notifications"
              >
                <Icon name="bell" className="w-4 h-4" />
                {!!unread?.count && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#D4A017] text-[#1A1A1A] text-[10px] font-black flex items-center justify-center shadow-sm ring-2 ring-white">
                    {unread.count > 9 ? '9+' : unread.count}
                  </span>
                )}
              </Link>
            )}

            {/* Shopping Basket Button */}
            <Link
              to="/cart"
              className="relative flex items-center gap-2 h-10 px-3.5 sm:px-4 rounded-full border border-[#E8E2D6] bg-white hover:border-[#2E5339]/40 hover:bg-[#FAF8F3] text-[#1A1A1A] text-xs sm:text-sm font-bold transition shadow-sm active:scale-95 group"
              title="View shopping basket"
            >
              <span className="text-[#2E5339] group-hover:scale-110 transition">
                <Icon name="cart" className="w-4 h-4" />
              </span>
              <span className="hidden md:inline">Basket</span>
              {count > 0 ? (
                <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-[#D4A017] text-[#1A1A1A] text-[11px] font-black flex items-center justify-center shadow-sm">
                  {count > 9 ? '9+' : count}
                </span>
              ) : (
                <span className="hidden sm:inline text-xs font-semibold text-[#8A8A8A]">0</span>
              )}
            </Link>

            {/* User Profile / Auth State */}
            {user ? (
              <div className="hidden lg:flex items-center gap-2.5 pl-2.5 ml-1 border-l border-[#E8E2D6]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#E8F0E9] border border-[#2E5339]/20 text-[#2E5339] font-extrabold text-xs flex items-center justify-center shadow-sm">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="text-left leading-none">
                    <div className="text-xs font-bold text-[#1A1A1A] truncate max-w-[110px]">{user.name}</div>
                    <div className="text-[10px] font-semibold text-[#2E5339] mt-0.5 uppercase tracking-wide">
                      {user.role === 'buyer_business' ? 'B2B Buyer' : user.role === 'admin' ? 'Admin' : 'Buyer'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout()
                    navgo('/')
                  }}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full border border-[#E8E2D6] text-[#4B5563] hover:text-[#B0413E] hover:border-[#B0413E]/40 hover:bg-[#FDF2F2] transition"
                  title="Sign out of your account"
                >
                  Log out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="h-10 px-4 sm:px-5 rounded-full bg-[#2E5339] text-white text-xs sm:text-sm font-bold hover:bg-[#24412D] transition shadow-sm hover:shadow-md flex items-center justify-center active:scale-95"
              >
                Sign In
              </Link>
            )}

            {/* Return to AniLink Home */}
            <a
              href="/"
              className="inline-flex items-center gap-1.5 h-10 px-3 sm:px-3.5 rounded-full border border-[#E8E2D6] bg-[#FAF8F3] hover:bg-white hover:border-[#2E5339]/40 text-xs sm:text-sm font-semibold text-[#4B5563] hover:text-[#2E5339] transition shadow-sm ml-0.5 sm:ml-1 shrink-0"
              title="Return to AniLink Home"
            >
              <span>←</span>
              <span className="hidden sm:inline">AniLink Home</span>
              <span className="sm:hidden">Home</span>
            </a>
          </nav>
        </div>
      </header>

      {/* Global Shopping Basket Popup Notification */}
      <CartNotificationToast />

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
