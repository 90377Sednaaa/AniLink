import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useCart } from '../lib/cart'
import { useAuth } from '../lib/auth'
import { peso } from '../components/format'
import { Icon } from '../../shared/ui'

export default function Cart() {
  const { user } = useAuth()
  const { items, setQty, remove, clear } = useCart()
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const { data } = useQuery({
    queryKey: ['cart-validate', items],
    queryFn: () =>
      api.validateCart(
        items.map((i) => ({ product_id: i.product_id, quantity: i.qty })),
        'retail'
      ),
    enabled: !!user && items.length > 0,
    refetchInterval: 15000,
  })

  const validated = Object.fromEntries((data?.items ?? []).map((i) => [i.product_id, i]))
  const subtotal = data?.subtotal ?? items.reduce((n, i) => n + i.price * i.qty, 0)

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-6 space-y-8">
        {/* Main Empty Basket Card */}
        <div className="bg-white border border-[#E8E2D6] rounded-3xl p-8 sm:p-12 text-center shadow-sm relative overflow-hidden">
          <div className="relative w-20 h-20 mx-auto mb-5">
            <div className="w-20 h-20 rounded-3xl bg-[#E8F0E9] text-[#2E5339] flex items-center justify-center shadow-inner ring-8 ring-[#E8F0E9]/50">
              <Icon name="cart" className="w-9 h-9" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#2E5339] text-white flex items-center justify-center shadow-md">
              <Icon name="sprout" className="w-4 h-4" />
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#FAF8F3] border border-[#E8E2D6] text-[#8A8A8A] mb-3">
            Harvest Basket is Empty
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
            Your harvest basket is waiting
          </h1>

          <p className="text-xs sm:text-sm text-[#5C5C5C] max-w-md mx-auto mt-2.5 leading-relaxed">
            Fresh vegetables, fruits, and grains are being harvested today across Benguet, Laguna, Davao, and regional farms. Connect directly with Filipino growers.
          </p>

          <Link
            to="/"
            className="inline-flex items-center gap-2 mt-7 px-8 py-3.5 rounded-xl bg-[#2E5339] text-white text-xs sm:text-sm font-semibold hover:bg-[#24412D] transition shadow-md active:scale-98"
          >
            <span>Explore Fresh Harvests</span>
            <span>→</span>
          </Link>
        </div>

        {/* Quick Category Discoveries */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#8A8A8A]">
              Popular Harvest Categories
            </h2>
            <Link to="/" className="text-xs font-semibold text-[#2E5339] hover:underline">
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { title: 'Highland Greens', desc: 'Pechay, Romaine, Cabbage', slug: 'gulay', icon: 'sprout' },
              { title: 'Root Crops', desc: 'Potatoes, Carrots, Tubers', slug: 'gulay', icon: 'inventory' },
              { title: 'Tropical Fruits', desc: 'Mangoes, Papayas, Citrus', slug: 'prutas', icon: 'badge' },
              { title: 'Heirloom Grains', desc: 'Organic Red & Brown Rice', slug: 'bigas', icon: 'orders' },
            ].map((cat) => (
              <Link
                key={cat.title}
                to="/"
                className="p-4 bg-white border border-[#E8E2D6] rounded-2xl hover:border-[#2E5339]/50 hover:shadow-sm transition flex flex-col justify-between group text-left"
              >
                <div className="w-8 h-8 rounded-xl bg-[#FAF8F3] text-[#2E5339] flex items-center justify-center mb-2 group-hover:bg-[#E8F0E9] transition">
                  <Icon name={cat.icon} className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-[#1A1A1A] group-hover:text-[#2E5339] transition">
                    {cat.title}
                  </div>
                  <div className="text-[10px] text-[#8A8A8A] mt-0.5 line-clamp-1">{cat.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Farm Direct Commitments */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {[
            {
              title: '100% Direct from Farm',
              desc: 'No middlemen or consolidation markups. Maximum earnings flow straight to farmers.',
            },
            {
              title: 'Harvested to Order',
              desc: 'Crops are picked at peak maturity and packed carefully for freshness.',
            },
            {
              title: 'Verified Local Farms',
              desc: 'Every grower is verified by AniLink with strict agricultural standards.',
            },
          ].map((feat) => (
            <div key={feat.title} className="p-4 bg-[#FAF8F3] rounded-2xl border border-[#E8E2D6]/80 text-left">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#2E5339]">
                <Icon name="check" className="w-3.5 h-3.5 text-[#2E5339]" />
                <span>{feat.title}</span>
              </div>
              <p className="text-[11px] text-[#5C5C5C] mt-1.5 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-2">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">Shopping Basket</h1>
          <p className="text-xs text-[#5C5C5C] mt-0.5">
            {items.length} produce item{items.length === 1 ? '' : 's'} in your order
          </p>
        </div>
        <Link
          to="/"
          className="text-xs font-semibold text-[#2E5339] hover:text-[#24412D] transition inline-flex items-center gap-1"
        >
          <span>← Continue Shopping</span>
        </Link>
      </div>

      {/* Cart Items List */}
      <div className="space-y-3">
        {items.map((item) => {
          const v = validated[item.product_id]
          const maxAvail = v ? v.available_quantity : null
          const isOutOfStock = v && !v.available

          return (
            <div
              key={item.product_id}
              className="bg-white border border-[#E8E2D6] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 shadow-sm hover:border-[#C5D9C7] transition"
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <div className="w-16 h-16 rounded-xl bg-[#F4F1EA] overflow-hidden shrink-0 border border-[#E8E2D6]">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#4A7C59]/60">
                      <Icon name="sprout" className="w-6 h-6" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <Link
                    to={`/products/${item.product_id}`}
                    className="font-bold text-sm text-[#1A1A1A] hover:text-[#2E5339] transition truncate block"
                  >
                    {item.name}
                  </Link>
                  <div className="text-xs text-[#5C5C5C] mt-0.5">
                    {peso(item.price)} <span className="text-[#8A8A8A]">/ {item.unit_type}</span>
                  </div>
                  {isOutOfStock && (
                    <div className="text-xs text-[#B0413E] font-medium mt-1">
                      Only {v.available_quantity} {item.unit_type} left in farm stock
                    </div>
                  )}
                  {v?.bulk_eligible && (
                    <div className="text-xs text-[#8A6A0A] font-medium mt-1">
                      Bulk rate applied: {peso(v.unit_price)}/{item.unit_type}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E8E2D6]/60">
                {/* Stepper */}
                <div className="flex items-center border border-[#E8E2D6] rounded-xl overflow-hidden bg-[#FAF8F3]">
                  <button
                    type="button"
                    onClick={() => setQty(item.product_id, item.qty - 1)}
                    className="w-8 h-8 flex items-center justify-center text-sm font-semibold hover:bg-white text-[#5C5C5C] transition"
                    title={item.qty === 1 ? 'Remove item' : 'Decrease'}
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-xs font-bold text-[#1A1A1A]">{item.qty}</span>
                  <button
                    type="button"
                    disabled={maxAvail !== null && item.qty >= maxAvail}
                    onClick={() => setQty(item.product_id, item.qty + 1)}
                    className="w-8 h-8 flex items-center justify-center text-sm font-semibold hover:bg-white text-[#5C5C5C] disabled:opacity-30 disabled:cursor-not-allowed transition"
                    title="Increase"
                  >
                    +
                  </button>
                </div>

                {/* Subtotal */}
                <div className="text-sm sm:text-base font-extrabold text-[#2E5339] min-w-[75px] text-right">
                  {peso((v?.unit_price ?? item.price) * item.qty)}
                </div>

                {/* Remove item button */}
                <button
                  type="button"
                  onClick={() => remove(item.product_id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8A8A8A] hover:text-[#B0413E] hover:bg-red-50 transition"
                  title="Remove this produce"
                >
                  <Icon name="trash" className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Cart Summary Card */}
      <div className="bg-white border border-[#E8E2D6] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-[#8A8A8A]">Estimated Subtotal</div>
          <div className="text-2xl font-extrabold text-[#2E5339] tracking-tight">{peso(subtotal)}</div>
          <div className="text-[11px] text-[#5C5C5C] mt-0.5">
            Delivery and farmer fulfillment coordinated at checkout.
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="text-xs text-[#8A8A8A] hover:text-[#B0413E] px-3 py-2 transition"
          >
            Clear All
          </button>
          <Link
            to={user ? '/checkout' : '/login'}
            className="px-7 py-3 rounded-xl bg-[#2E5339] text-white text-sm font-semibold hover:bg-[#24412D] transition shadow-sm text-center"
          >
            {user ? 'Proceed to Checkout →' : 'Sign in to Checkout →'}
          </Link>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E8E2D6] max-w-sm w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-10 h-10 rounded-xl bg-[#F6E3E2] text-[#B0413E] flex items-center justify-center mx-auto">
              <Icon name="trash" className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-base text-[#1A1A1A]">Empty your shopping basket?</h3>
              <p className="text-xs text-[#5C5C5C] mt-1 leading-relaxed">
                This will remove all {items.length} produce item{items.length === 1 ? '' : 's'} from your basket.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#E8E2D6] text-xs font-semibold text-[#5C5C5C] hover:bg-[#FAF8F3] transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  clear()
                  setShowClearConfirm(false)
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#B0413E] text-white text-xs font-semibold hover:brightness-110 transition shadow-sm"
              >
                Empty Basket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
