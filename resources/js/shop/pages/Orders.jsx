import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { peso, statusColor } from '../components/format'

const filters = ['all', 'pending', 'confirmed', 'preparing', 'ready', 'delivered', 'completed', 'cancelled']

export default function Orders() {
  const [params] = useSearchParams()
  const [status, setStatus] = useState('all')
  const [cancellingId, setCancellingId] = useState(null)
  const [ratingOpenId, setRatingOpenId] = useState(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [ratedIds, setRatedIds] = useState([])
  const [busy, setBusy] = useState(false)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['orders', status],
    queryFn: () => api.orders(status === 'all' ? {} : { status }),
    refetchInterval: 15000,
  })

  const orders = data?.data ?? []
  const justPlaced = params.get('placed')

  const cancel = async (id) => {
    setCancellingId(id)
    try {
      await api.updateOrderStatus(id, 'cancelled')
      qc.invalidateQueries({ queryKey: ['orders'] })
    } catch (err) {
      alert(err.message || 'Could not cancel order')
    } finally {
      setCancellingId(null)
    }
  }

  const submitReview = async (id) => {
    setBusy(true)
    try {
      await api.reviewOrder(id, { rating, comment: comment || null })
      setRatedIds(ids => [...ids, id])
      setRatingOpenId(null)
      setComment('')
      qc.invalidateQueries({ queryKey: ['orders'] })
    } catch (err) {
      alert(err.message || 'Could not submit review')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">My orders</h1>

      {justPlaced && (
        <div className="bg-[#E8F0E9] border border-[#C5D9C7] text-[#2E5339] text-sm rounded-[12px] px-4 py-3">
          🎉 Order placed! The farmer will confirm shortly — you'll get a notification at every step.
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map(f => (
          <button key={f} onClick={() => setStatus(f)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm border capitalize transition ${status === f ? 'bg-[#2E5339] border-[#2E5339] text-white font-semibold' : 'bg-white border-[#E8E2D6] text-[#5C5C5C] hover:border-[#C5D9C7]'}`}>
            {f}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-white border border-[#E8E2D6] rounded-[16px] animate-pulse" />)}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-[#8A8A8A]">
          <div className="text-4xl mb-3">📦</div>
          No orders in this view yet.
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(o => (
            <div key={o.id} className="bg-white border border-[#E8E2D6] rounded-[16px] p-5">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="font-semibold">Order #{o.id} <span className="text-xs font-normal text-[#8A8A8A]">· {new Date(o.created_at).toLocaleDateString('en-PH')}</span></div>
                  <div className="text-xs text-[#5C5C5C] mt-0.5">
                    From {o.farmer?.farm_name || o.farmer?.name || '—'} · {o.fulfillment_type === 'delivery' ? `Delivery → ${o.delivery_address}` : 'Farm pickup'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border capitalize ${statusColor(o.status)}`}>{o.status}</span>
                  <span className="text-[11px] px-2 py-1 rounded-full bg-[#F0EDE6] text-[#5C5C5C] capitalize">{o.order_type}</span>
                </div>
              </div>

              <div className="mt-3 space-y-1 border-t border-[#F0EDE6] pt-3">
                {o.items.map(i => (
                  <div key={i.id} className="flex justify-between text-sm text-[#5C5C5C]">
                    <span>{i.product_name} × {i.quantity} {i.unit_type}</span>
                    <span>{peso(i.subtotal)}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F0EDE6]">
                <div className="text-lg font-bold text-[#2E5339]">{peso(o.total_amount)}</div>
                <div className="flex items-center gap-2">
                  {o.status === 'completed' && !ratedIds.includes(o.id) && (
                    <button
                      onClick={() => setRatingOpenId(ratingOpenId === o.id ? null : o.id)}
                      className="text-xs font-semibold px-3 py-2 rounded-[10px] bg-[#FFF4D6] border border-[#F2D98A] text-[#8A6A0A] hover:brightness-105"
                    >
                      {ratingOpenId === o.id ? 'Close' : '★ Rate farmer'}
                    </button>
                  )}
                  {o.status === 'completed' && ratedIds.includes(o.id) && (
                    <span className="text-xs text-[#4A7C59] font-semibold">✓ Review submitted</span>
                  )}
                  {o.status === 'pending' && (
                    <button
                      onClick={() => cancel(o.id)}
                      disabled={cancellingId === o.id}
                      className="text-xs font-semibold px-3 py-2 rounded-[10px] border border-[#E5B9B6] text-[#B0413E] hover:bg-[#F6E3E2] disabled:opacity-50"
                    >
                      {cancellingId === o.id ? 'Cancelling…' : 'Cancel order'}
                    </button>
                  )}
                </div>
              </div>

              {ratingOpenId === o.id && (
                <form
                  onSubmit={(e) => { e.preventDefault(); submitReview(o.id) }}
                  className="mt-3 bg-[#FAF8F3] border border-[#F0EDE6] rounded-[12px] p-4 space-y-3"
                >
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} type="button" onClick={() => setRating(n)}
                        className={`text-2xl transition ${n <= rating ? 'text-[#D4A017]' : 'text-[#E8E2D6]'}`}
                        aria-label={`${n} star${n > 1 ? 's' : ''}`}>★</button>
                    ))}
                    <span className="text-xs text-[#8A8A8A] ml-2">{['Poor', 'Fair', 'Good', 'Very good', 'Excellent'][rating - 1]}</span>
                  </div>
                  <textarea
                    rows={2}
                    placeholder="How was the produce and the farmer? (optional)"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full border border-[#E8E2D6] bg-white rounded-[12px] px-3 py-2 text-sm focus:outline-none focus:border-[#2E5339]"
                  />
                  <button
                    disabled={busy}
                    className="w-full py-2.5 rounded-[12px] bg-[#2E5339] text-white text-sm font-semibold hover:brightness-110 disabled:opacity-50"
                  >
                    {busy ? 'Submitting…' : 'Submit review'}
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
