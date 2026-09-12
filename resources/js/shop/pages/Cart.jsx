import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useCart } from '../lib/cart'
import { useAuth } from '../lib/auth'
import { peso } from '../components/format'

export default function Cart() {
  const { user } = useAuth()
  const { items, setQty, remove, clear } = useCart()

  const { data } = useQuery({
    queryKey: ['cart-validate', items],
    queryFn: () => api.validateCart(
      items.map(i => ({ product_id: i.product_id, quantity: i.qty })),
      'retail',
    ),
    enabled: !!user && items.length > 0,
    refetchInterval: 15000,
  })

  const validated = Object.fromEntries((data?.items ?? []).map(i => [i.product_id, i]))
  const subtotal = data?.subtotal ?? items.reduce((n, i) => n + i.price * i.qty, 0)

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">🧺</div>
        <h1 className="text-lg font-semibold">Your basket is empty</h1>
        <p className="text-sm text-[#5C5C5C] mt-1">Fresh harvests are waiting at the market.</p>
        <Link to="/" className="inline-block mt-4 px-5 py-2.5 rounded-[12px] bg-[#2E5339] text-white text-sm font-semibold hover:brightness-110">Browse AniMarket</Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Your basket</h1>
        <button onClick={clear} className="text-xs text-[#B0413E] underline">Empty basket</button>
      </div>

      <div className="space-y-3">
        {items.map(item => {
          const v = validated[item.product_id]
          return (
            <div key={item.product_id} className="bg-white border border-[#E8E2D6] rounded-[16px] p-4 flex items-center gap-4">
              <div className="w-16 h-16 rounded-[12px] bg-[#F0EDE6] overflow-hidden shrink-0">
                {item.image
                  ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-2xl">🌾</div>}
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{item.name}</div>
                <div className="text-xs text-[#5C5C5C]">{peso(item.price)}/{item.unit_type}</div>
                {v && !v.available && (
                  <div className="text-xs text-[#B0413E] mt-1">Only {v.available_quantity} {item.unit_type} left</div>
                )}
                {v?.bulk_eligible && (
                  <div className="text-xs text-[#8A6A0A] mt-1">Bulk price applied — {peso(v.unit_price)}/{item.unit_type}</div>
                )}
              </div>

              <div className="flex items-center border border-[#E8E2D6] rounded-[10px] overflow-hidden shrink-0">
                <button onClick={() => setQty(item.product_id, item.qty - 1)} className="w-8 h-8 hover:bg-[#FAF8F3]">−</button>
                <span className="w-10 text-center text-sm">{item.qty}</span>
                <button onClick={() => setQty(item.product_id, item.qty + 1)} className="w-8 h-8 hover:bg-[#FAF8F3]">+</button>
              </div>

              <div className="text-sm font-bold text-[#2E5339] w-20 text-right shrink-0">{peso((v?.unit_price ?? item.price) * item.qty)}</div>

              <button onClick={() => remove(item.product_id)} className="text-[#8A8A8A] hover:text-[#B0413E] shrink-0" title="Remove">✕</button>
            </div>
          )
        })}
      </div>

      <div className="bg-white border border-[#E8E2D6] rounded-[16px] p-5 flex items-center justify-between">
        <div>
          <div className="text-xs text-[#8A8A8A]">Subtotal (validated by server every 15s)</div>
          <div className="text-xl font-bold text-[#2E5339]">{peso(subtotal)}</div>
        </div>
        <Link
          to={user ? '/checkout' : '/login'}
          className="px-6 py-3 rounded-[12px] bg-[#2E5339] text-white text-sm font-semibold hover:brightness-110"
        >
          {user ? 'Checkout' : 'Sign in to checkout'}
        </Link>
      </div>
    </div>
  )
}
