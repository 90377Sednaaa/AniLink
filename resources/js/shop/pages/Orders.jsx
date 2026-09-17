import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import { peso, statusColor } from '../components/format'
import { Icon } from '../../shared/ui'

const filters = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'ready', label: 'Ready' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

// Business buyers: one-round bulk quote negotiation (request from a product page)
function QuotePanel() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [busy, setBusy] = useState(false)
  const { data } = useQuery({
    queryKey: ['quotes'],
    queryFn: () => api.quotes(),
    enabled: user?.role === 'buyer_business',
  })

  if (user?.role !== 'buyer_business') return null
  const quotes = data?.quotes ?? []
  if (quotes.length === 0) return null

  const act = async (fn) => {
    setBusy(true)
    try {
      await fn()
      qc.invalidateQueries({ queryKey: ['quotes'] })
    } catch (err) {
      alert(err.message || 'Quote action failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="bg-[#FFF4D6] border border-[#F2D98A] rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8A6A0A] mb-3">
        <Icon name="badge" className="w-4 h-4 text-[#D4A017]" />
        <span>Wholesale Bulk Quotes (B2B)</span>
      </div>
      <div className="space-y-3">
        {quotes.map((q) => (
          <div key={q.id} className="bg-white border border-[#F2D98A] rounded-xl p-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="font-bold text-sm text-[#1A1A1A]">
                {q.quantity} {q.product?.unit_type} · {q.product?.name}
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border capitalize bg-[#FAF8F3] text-[#5C5C5C]">
                {q.status}
              </span>
            </div>
            <div className="text-xs text-[#8A8A8A] mt-0.5">
              From {q.farmer?.farm_name || q.farmer?.name || 'Local Farm'}
            </div>
            {q.status === 'quoted' && (
              <div className="text-sm mt-1.5 pt-1.5 border-t border-[#FAF8F3]">
                <span className="font-bold text-[#2E5339]">
                  Quoted {peso(q.quoted_unit_price)}/{q.product?.unit_type}
                </span>
                <span className="text-xs text-[#8A8A8A]">
                  {' '}— Total ≈ {peso(q.quoted_unit_price * q.quantity)}
                  {q.response_note ? ` · Note: ${q.response_note}` : ''}
                </span>
              </div>
            )}
            {q.message && q.status === 'pending' && (
              <div className="text-xs text-[#5C5C5C] mt-1 italic">"{q.message}"</div>
            )}
            <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-gray-100">
              {q.status === 'quoted' && (
                <>
                  <button
                    disabled={busy}
                    onClick={() => act(() => api.acceptQuote(q.id, 'pickup'))}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#2E5339] text-white hover:bg-[#24412D] disabled:opacity-50 transition"
                  >
                    Accept (Pickup)
                  </button>
                  <button
                    disabled={busy}
                    onClick={() => act(() => api.acceptQuote(q.id, 'delivery'))}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#C5D9C7] text-[#2E5339] hover:bg-[#FAF8F3] disabled:opacity-50 transition"
                  >
                    Accept (Delivery +{peso(45)})
                  </button>
                </>
              )}
              {(q.status === 'pending' || q.status === 'quoted') && (
                <button
                  disabled={busy}
                  onClick={() => act(() => api.withdrawQuote(q.id))}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#E5B9B6] text-[#B0413E] hover:bg-[#F6E3E2] disabled:opacity-50 transition"
                >
                  Withdraw
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Orders() {
  const [params] = useSearchParams()
  const [status, setStatus] = useState('all')
  const [cancellingId, setCancellingId] = useState(null)
  const [ratingOpenId, setRatingOpenId] = useState(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [ratedIds, setRatedIds] = useState([])
  const [reportingId, setReportingId] = useState(null)
  const [reportForm, setReportForm] = useState({ category: 'order_issue', description: '' })
  const [reportedIds, setReportedIds] = useState([])
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

  const submitReport = async (id) => {
    setBusy(true)
    try {
      await api.fileReport({ order_id: id, category: reportForm.category, description: reportForm.description })
      setReportedIds((ids) => [...ids, id])
      setReportingId(null)
      setReportForm({ category: 'order_issue', description: '' })
    } catch (err) {
      alert(err.message || 'Could not file report')
    } finally {
      setBusy(false)
    }
  }

  const submitReview = async (id) => {
    setBusy(true)
    try {
      await api.reviewOrder(id, { rating, comment: comment || null })
      setRatedIds((ids) => [...ids, id])
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
    <div className="max-w-3xl mx-auto space-y-6 py-2">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">My Orders</h1>
          <p className="text-xs text-[#5C5C5C] mt-0.5">Track your farm orders and communicate with growers.</p>
        </div>
        <Link
          to="/"
          className="text-xs font-semibold text-[#2E5339] hover:text-[#24412D] transition inline-flex items-center gap-1"
        >
          <span>← Marketplace</span>
        </Link>
      </div>

      {justPlaced && (
        <div className="bg-[#E8F0E9] border border-[#C5D9C7] text-[#2E5339] text-xs font-semibold rounded-xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-7 h-7 rounded-full bg-[#2E5339] text-white flex items-center justify-center shrink-0">
            <Icon name="check" className="w-4 h-4" />
          </div>
          <div>
            <div>Order successfully placed!</div>
            <div className="font-normal text-[11px] text-[#4A7C59] mt-0.5">
              The farm has received your order and will confirm harvest packing shortly.
            </div>
          </div>
        </div>
      )}

      <QuotePanel />

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {filters.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setStatus(f.value)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition ${
              status === f.value
                ? 'bg-[#2E5339] text-white shadow-sm'
                : 'bg-white border border-[#E8E2D6] text-[#5C5C5C] hover:border-[#2E5339]/40'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Order Cards List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-36 bg-white border border-[#E8E2D6] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white border border-[#E8E2D6] rounded-2xl p-8 shadow-sm max-w-md mx-auto">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#E8F0E9] text-[#2E5339] flex items-center justify-center mb-3">
            <Icon name="orders" className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-base text-[#1A1A1A]">No orders found</h3>
          <p className="text-xs text-[#5C5C5C] mt-1">There are no orders matching this filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="bg-white border border-[#E8E2D6] rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="font-bold text-sm text-[#1A1A1A]">
                    Order #{o.id}
                    <span className="text-xs font-normal text-[#8A8A8A] ml-2">
                      · {new Date(o.created_at).toLocaleDateString('en-PH')}
                    </span>
                  </div>
                  <div className="text-xs text-[#5C5C5C] mt-0.5 flex items-center gap-1.5">
                    <span>Farm: <strong className="text-[#1A1A1A]">{o.farmer?.farm_name || o.farmer?.name || 'Local Farm'}</strong></span>
                    <span>·</span>
                    <span>{o.fulfillment_type === 'delivery' ? `Courier Delivery → ${o.delivery_address || 'Address'}` : 'Direct Farm Pickup'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border capitalize ${statusColor(o.status)}`}>
                    {o.status}
                  </span>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#FAF8F3] border border-[#E8E2D6] text-[#5C5C5C] capitalize">
                    {o.order_type}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-1.5 border-t border-[#E8E2D6]/60 pt-3">
                {o.items.map((i) => (
                  <div key={i.id} className="flex justify-between text-xs text-[#5C5C5C]">
                    <span>
                      {i.product_name} <span className="text-[#8A8A8A]">× {i.quantity} {i.unit_type}</span>
                    </span>
                    <span className="font-medium text-[#1A1A1A]">{peso(i.subtotal)}</span>
                  </div>
                ))}
              </div>

              {/* Bottom Total & Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-[#E8E2D6]/60 flex-wrap gap-2">
                <div className="text-base font-extrabold text-[#2E5339]">
                  {peso(o.total_amount)}
                </div>

                <div className="flex items-center gap-2">
                  {o.status === 'completed' && !ratedIds.includes(o.id) && (
                    <button
                      type="button"
                      onClick={() => setRatingOpenId(ratingOpenId === o.id ? null : o.id)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#FFF4D6] border border-[#F2D98A] text-[#8A6A0A] hover:brightness-105 transition flex items-center gap-1"
                    >
                      <Icon name="star" className="w-3.5 h-3.5 fill-current" />
                      <span>{ratingOpenId === o.id ? 'Close' : 'Rate Farmer'}</span>
                    </button>
                  )}

                  {o.status === 'completed' && ratedIds.includes(o.id) && (
                    <span className="text-xs text-[#4A7C59] font-semibold flex items-center gap-1">
                      <Icon name="check" className="w-3.5 h-3.5" />
                      <span>Reviewed</span>
                    </span>
                  )}

                  {!reportedIds.includes(o.id) && (
                    <button
                      type="button"
                      onClick={() => setReportingId(reportingId === o.id ? null : o.id)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#E8E2D6] text-[#5C5C5C] hover:bg-[#FAF8F3] transition"
                    >
                      {reportingId === o.id ? 'Close' : 'Report Issue'}
                    </button>
                  )}

                  {o.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => cancel(o.id)}
                      disabled={cancellingId === o.id}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#E5B9B6] text-[#B0413E] hover:bg-[#F6E3E2] disabled:opacity-50 transition"
                    >
                      {cancellingId === o.id ? 'Cancelling…' : 'Cancel Order'}
                    </button>
                  )}
                </div>
              </div>

              {/* Report Issue Form */}
              {reportingId === o.id && !reportedIds.includes(o.id) && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    submitReport(o.id)
                  }}
                  className="mt-3 bg-[#FAF8F3] border border-[#E8E2D6] rounded-xl p-4 space-y-3"
                >
                  <div className="text-xs font-bold uppercase tracking-wider text-[#8A8A8A]">
                    Report an issue with Order #{o.id}
                  </div>
                  <select
                    value={reportForm.category}
                    onChange={(e) => setReportForm({ ...reportForm, category: e.target.value })}
                    className="w-full border border-[#E8E2D6] bg-white rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#2E5339]"
                  >
                    <option value="order_issue">Order fulfillment issue (delivery, delay, quality)</option>
                    <option value="payment">Payment discrepancy</option>
                    <option value="product_issue">Product not as listed</option>
                    <option value="user_misconduct">Farmer conduct or communication</option>
                    <option value="other">Other issue</option>
                  </select>
                  <textarea
                    rows={2}
                    required
                    minLength={10}
                    placeholder="Describe what happened with this order (minimum 10 characters)"
                    value={reportForm.description}
                    onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                    className="w-full border border-[#E8E2D6] bg-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2E5339]"
                  />
                  <button
                    disabled={busy}
                    className="w-full py-2 rounded-xl bg-[#B0413E] text-white text-xs font-semibold hover:brightness-105 disabled:opacity-50 transition"
                  >
                    {busy ? 'Submitting Report…' : 'Submit Problem Report'}
                  </button>
                </form>
              )}

              {reportedIds.includes(o.id) && (
                <div className="mt-2 text-xs text-[#4A7C59] flex items-center gap-1.5 font-medium">
                  <Icon name="check" className="w-3.5 h-3.5" />
                  <span>Report submitted to AniLink moderation team.</span>
                </div>
              )}

              {/* Review Farmer Form */}
              {ratingOpenId === o.id && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    submitReview(o.id)
                  }}
                  className="mt-3 bg-[#FAF8F3] border border-[#E8E2D6] rounded-xl p-4 space-y-3"
                >
                  <div className="text-xs font-bold uppercase tracking-wider text-[#8A8A8A]">
                    Review Farmer & Produce
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setRating(n)}
                        className="p-0.5 text-[#D4A017] transition hover:scale-110"
                        aria-label={`${n} star${n > 1 ? 's' : ''}`}
                      >
                        <Icon
                          name="star"
                          className={`w-5 h-5 ${n <= rating ? 'fill-current text-[#D4A017]' : 'text-[#E8E2D6]'}`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-medium text-[#8A8A8A] ml-2">
                      {['Poor', 'Fair', 'Good', 'Very good', 'Excellent'][rating - 1]}
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Share feedback on produce freshness and farmer service (optional)"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full border border-[#E8E2D6] bg-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2E5339]"
                  />
                  <button
                    disabled={busy}
                    className="w-full py-2 rounded-xl bg-[#2E5339] text-white text-xs font-semibold hover:bg-[#24412D] disabled:opacity-50 transition"
                  >
                    {busy ? 'Submitting…' : 'Submit Review'}
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
