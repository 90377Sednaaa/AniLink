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
      <div className="max-w-md mx-auto text-center py-20 bg-white border border-[#E8E2D6] rounded-2xl p-8 my-8 shadow-sm">
        <div className="w-14 h-14 mx-auto rounded-full bg-[#E8F0E9] text-[#2E5339] flex items-center justify-center mb-4">
          <Icon name="cart" className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold text-[#1A1A1A]">Your shopping basket is empty</h1>
        <p className="text-sm text-[#5C5C5C] mt-1.5">
          Fresh harvests from accredited local farms are ready for harvest.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl bg-[#2E5339] text-white text-xs font-semibold hover:bg-[#24412D] transition shadow-sm"
        >
          <span>Browse Marketplace</span>
          <span>→</span>
        </Link>
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
            onClick={clear}
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
    </div>
  )
}
