import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useCart } from '../lib/cart'
import { useAuth } from '../lib/auth'
import { peso } from '../components/format'
import { Icon } from '../../shared/ui'

export default function Checkout() {
  const { user } = useAuth()
  const { items, clear } = useCart()
  const navgo = useNavigate()
  const [orderType, setOrderType] = useState('retail')
  const [fulfillment, setFulfillment] = useState('pickup')
  const [address, setAddress] = useState(user?.buyerProfile?.delivery_address || '')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const isBusiness = user?.role === 'buyer_business'

  const { data } = useQuery({
    queryKey: ['cart-validate', items, orderType],
    queryFn: () =>
      api.validateCart(
        items.map((i) => ({ product_id: i.product_id, quantity: i.qty })),
        orderType
      ),
    enabled: items.length > 0,
  })

  const subtotal = data?.subtotal ?? 0
  const deliveryFee = fulfillment === 'delivery' ? 45 : 0
  const estimatedTotal = subtotal + deliveryFee * new Set(items.map((i) => i.farmer_id ?? i.product_id)).size

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20 bg-white border border-[#E8E2D6] rounded-2xl p-8 my-8 shadow-sm">
        <div className="w-14 h-14 mx-auto rounded-full bg-[#E8F0E9] text-[#2E5339] flex items-center justify-center mb-4">
          <Icon name="cart" className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-[#1A1A1A]">Your basket is empty</h2>
        <p className="text-sm text-[#5C5C5C] mt-1.5">Add fresh produce before proceeding to checkout.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 mt-5 px-6 py-2.5 rounded-xl bg-[#2E5339] text-white text-xs font-semibold hover:bg-[#24412D] transition shadow-sm"
        >
          <span>Return to Marketplace</span>
        </Link>
      </div>
    )
  }

  const placeOrder = async () => {
    setBusy(true)
    setError(null)
    try {
      await api.createOrder({
        items: items.map((i) => ({ product_id: i.product_id, quantity: i.qty })),
        order_type: orderType,
        fulfillment_type: fulfillment,
        delivery_address: fulfillment === 'delivery' ? address : undefined,
      })
      clear()
      navgo('/orders?placed=1')
    } catch (err) {
      setError(err.message || 'Could not place order')
      setBusy(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">Checkout</h1>
          <p className="text-xs text-[#5C5C5C] mt-0.5">Confirm fulfillment details and place your harvest order.</p>
        </div>
        <Link
          to="/cart"
          className="text-xs font-semibold text-[#2E5339] hover:text-[#24412D] transition inline-flex items-center gap-1"
        >
          <span>← Back to Basket</span>
        </Link>
      </div>

      {/* Fulfillment Options */}
      <div className="bg-white border border-[#E8E2D6] rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm">
        {isBusiness && (
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#8A8A8A] mb-2.5">
              Account Order Mode
            </div>
            <div className="grid grid-cols-2 gap-3">
              {['retail', 'bulk'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setOrderType(t)}
                  className={`py-3 px-4 rounded-xl text-xs font-bold capitalize border transition text-left ${
                    orderType === t
                      ? 'bg-[#E8F0E9] border-[#2E5339] text-[#2E5339] shadow-sm'
                      : 'border-[#E8E2D6] text-[#5C5C5C] hover:border-[#2E5339]/40 bg-[#FAF8F3]'
                  }`}
                >
                  <div className="font-bold">{t} Order</div>
                  <div className="text-[11px] font-normal text-[#8A8A8A] mt-0.5">
                    {t === 'bulk' ? 'Commercial wholesale tier' : 'Standard marketplace price'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-[#8A8A8A] mb-2.5">
            Fulfillment Method
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                value: 'pickup',
                label: 'Direct Farm Pickup',
                desc: 'Free · Pick up freshly harvested items directly from the farm',
                icon: 'sprout',
              },
              {
                value: 'delivery',
                label: 'Local Courier Delivery',
                desc: '₱45 per participating grower · Arrives at your doorstep',
                icon: 'truck',
              },
            ].map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFulfillment(f.value)}
                className={`text-left p-4 rounded-xl border transition flex items-start gap-3 ${
                  fulfillment === f.value
                    ? 'bg-[#E8F0E9] border-[#2E5339] shadow-sm'
                    : 'border-[#E8E2D6] hover:border-[#2E5339]/40 bg-[#FAF8F3]'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    fulfillment === f.value ? 'bg-[#2E5339] text-white' : 'bg-white text-[#5C5C5C] border border-[#E8E2D6]'
                  }`}
                >
                  <Icon name={f.icon} className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`font-bold text-sm ${fulfillment === f.value ? 'text-[#2E5339]' : 'text-[#1A1A1A]'}`}>
                    {f.label}
                  </div>
                  <div className="text-xs text-[#5C5C5C] mt-0.5 leading-snug">{f.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {fulfillment === 'delivery' && (
          <div className="space-y-1.5 pt-2 border-t border-[#E8E2D6]">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#8A8A8A]">
              Delivery Address
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="House/Unit #, Street, Barangay, Municipality/City, Province"
              rows={2}
              className="w-full border border-[#E8E2D6] bg-[#FAF8F3] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2E5339] focus:bg-white transition"
            />
            <p className="text-[11px] text-[#8A8A8A]">Ensure your address and landmarks are accurate for couriers.</p>
          </div>
        )}
      </div>

      {/* Order Summary */}
      <div className="bg-white border border-[#E8E2D6] rounded-2xl p-5 sm:p-6 space-y-3.5 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#8A8A8A]">Order Summary</div>
        <div className="space-y-2">
          {(data?.items ?? []).map((i) => (
            <div key={i.product_id} className="flex justify-between text-sm text-[#5C5C5C]">
              <span>
                {i.name} <span className="text-xs text-[#8A8A8A]">× {i.quantity}</span>
              </span>
              <span className={i.available ? 'font-medium text-[#1A1A1A]' : 'text-[#B0413E] font-medium'}>
                {peso(i.subtotal)}
                {!i.available && ' (Out of stock)'}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-[#E8E2D6]/80 space-y-1.5 text-sm">
          <div className="flex justify-between text-[#5C5C5C]">
            <span>Produce Subtotal</span>
            <span className="font-semibold text-[#1A1A1A]">{peso(subtotal)}</span>
          </div>
          {deliveryFee > 0 && (
            <div className="flex justify-between text-[#5C5C5C]">
              <span>Courier Delivery</span>
              <span className="font-semibold text-[#1A1A1A]">
                {peso(deliveryFee * new Set(items.map((i) => i.farmer_id ?? i.product_id)).size)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-lg font-extrabold text-[#2E5339] pt-2 border-t border-[#E8E2D6]">
            <span>Estimated Total</span>
            <span>{peso(estimatedTotal)}</span>
          </div>
        </div>

        <div className="text-[11px] text-[#8A8A8A] bg-[#FAF8F3] p-3 rounded-xl border border-[#E8E2D6]/70 leading-relaxed">
          Orders are transmitted directly to each farmer. If your basket includes produce from multiple farms, each farmer confirms and packs independently.
        </div>
      </div>

      {error && (
        <div className="text-sm text-[#B0413E] bg-[#F6E3E2] border border-[#E5B9B6] rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Place Order CTA */}
      <button
        type="button"
        onClick={placeOrder}
        disabled={busy || (fulfillment === 'delivery' && !address.trim())}
        className="w-full py-4 rounded-xl bg-[#2E5339] text-white text-sm font-semibold hover:bg-[#24412D] transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {busy ? (
          <span>Placing Order…</span>
        ) : (
          <>
            <Icon name="check" className="w-4 h-4" />
            <span>Place Order · {peso(estimatedTotal)}</span>
          </>
        )}
      </button>
    </div>
  )
}
