import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useCart } from '../lib/cart'
import { useAuth } from '../lib/auth'
import { peso } from '../components/format'

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
    queryFn: () => api.validateCart(
      items.map(i => ({ product_id: i.product_id, quantity: i.qty })),
      orderType,
    ),
    enabled: items.length > 0,
  })

  const subtotal = data?.subtotal ?? 0
  const deliveryFee = fulfillment === 'delivery' ? 45 : 0
  const estimatedTotal = subtotal + deliveryFee * new Set(items.map(i => i.farmer_id ?? i.product_id)).size

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">🧺</div>
        <p className="text-[#5C5C5C]">Nothing to check out — your basket is empty.</p>
      </div>
    )
  }

  const placeOrder = async () => {
    setBusy(true)
    setError(null)
    try {
      await api.createOrder({
        items: items.map(i => ({ product_id: i.product_id, quantity: i.qty })),
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
    <div className="max-w-3xl mx-auto space-y-5">
      <h1 className="text-2xl font-semibold tracking-tight">Checkout</h1>

      {!isBusiness && (
        <div className="bg-[#FFF4D6] border border-[#F2D98A] text-[#8A6A0A] text-sm rounded-[12px] px-4 py-3">
          Bulk pricing is available for business buyer accounts. Your order will be priced at retail.
        </div>
      )}

      <div className="bg-white border border-[#E8E2D6] rounded-[16px] p-5 space-y-4">
        <div>
          <div className="text-sm font-semibold mb-2">Order type</div>
          <div className="grid grid-cols-2 gap-2">
            {['retail', ...(isBusiness ? ['bulk'] : [])].map(t => (
              <button key={t} onClick={() => setOrderType(t)}
                className={`py-2.5 rounded-[12px] text-sm font-semibold border capitalize transition ${orderType === t ? 'bg-[#E8F0E9] border-[#2E5339] text-[#2E5339]' : 'border-[#E8E2D6] text-[#5C5C5C] hover:border-[#C5D9C7]'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold mb-2">Fulfillment</div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'pickup', label: 'Farm pickup', desc: 'Meet the farmer' },
              { value: 'delivery', label: 'Delivery', desc: '₱45 per farmer' },
            ].map(f => (
              <button key={f.value} onClick={() => setFulfillment(f.value)}
                className={`text-left py-2.5 px-4 rounded-[12px] text-sm border transition ${fulfillment === f.value ? 'bg-[#E8F0E9] border-[#2E5339]' : 'border-[#E8E2D6] hover:border-[#C5D9C7]'}`}>
                <div className={`font-semibold ${fulfillment === f.value ? 'text-[#2E5339]' : 'text-[#1A1A1A]'}`}>{f.label}</div>
                <div className="text-xs text-[#8A8A8A]">{f.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {fulfillment === 'delivery' && (
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Complete delivery address (street, barangay, municipality, province)"
            rows={2}
            className="w-full border border-[#E8E2D6] rounded-[12px] px-4 py-3 text-sm focus:outline-none focus:border-[#2E5339]"
          />
        )}
      </div>

      <div className="bg-white border border-[#E8E2D6] rounded-[16px] p-5 space-y-2">
        <div className="text-sm font-semibold mb-1">Order summary</div>
        {(data?.items ?? []).map(i => (
          <div key={i.product_id} className="flex justify-between text-sm text-[#5C5C5C]">
            <span>{i.name} × {i.quantity} {i.unit_price !== undefined ? `@ ${peso(i.unit_price)}` : ''}</span>
            <span className={i.available ? '' : 'text-[#B0413E]'}>{peso(i.subtotal)}{!i.available && ' — out of stock'}</span>
          </div>
        ))}
        <div className="flex justify-between text-sm text-[#5C5C5C] pt-2 border-t border-[#F0EDE6]">
          <span>Subtotal</span><span>{peso(subtotal)}</span>
        </div>
        {deliveryFee > 0 && (
          <div className="flex justify-between text-sm text-[#5C5C5C]">
            <span>Delivery (per farmer order)</span><span>{peso(deliveryFee)} × farmer</span>
          </div>
        )}
        <div className="flex justify-between text-base font-bold text-[#2E5339]">
          <span>Estimated total</span><span>{peso(estimatedTotal)}</span>
        </div>
        <div className="text-[11px] text-[#8A8A8A]">Multi-farmer baskets are split into one order per farmer — each may confirm separately.</div>
      </div>

      {error && <div className="text-sm text-[#B0413E] bg-[#F6E3E2] border border-[#E5B9B6] rounded-[12px] px-4 py-3">{error}</div>}

      <button
        onClick={placeOrder}
        disabled={busy || (fulfillment === 'delivery' && !address.trim())}
        className="w-full py-3.5 rounded-[12px] bg-[#2E5339] text-white text-sm font-semibold hover:brightness-110 disabled:opacity-50"
      >
        {busy ? 'Placing order…' : 'Place order'}
      </button>
    </div>
  )
}
