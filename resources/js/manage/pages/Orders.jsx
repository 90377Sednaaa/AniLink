import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useState, useMemo } from 'react'
import { PageHeader, CardSkeleton, OrderCardSkeleton, TelemetryCardSkeleton, EmptyState, Chip, Icon } from '../../shared/ui'

const fmtPeso = (n) => Number(n || 0).toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })

const ORDER_STEPS = [
  { key: 'pending', label: 'Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'preparing', label: 'Packing' },
  { key: 'ready', label: 'Ready' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'completed', label: 'Completed' },
]

const next = {
  pending: 'confirmed',
  confirmed: 'preparing',
  preparing: 'ready',
  ready: 'delivered',
  delivered: 'completed',
}

const nextLabel = {
  pending: 'Confirm Order',
  confirmed: 'Start Packing',
  preparing: 'Mark as Ready',
  ready: 'Dispatch / Handover',
  delivered: 'Complete Order',
}

const prev = {
  confirmed: 'pending',
  preparing: 'confirmed',
  ready: 'preparing',
  delivered: 'ready',
}

const prevLabel = {
  confirmed: 'Placed',
  preparing: 'Confirmed',
  ready: 'Packing',
  delivered: 'Ready',
}

const FILTER_CONFIG = [
  { key: 'all', label: 'All Orders' },
  { key: 'pending', label: 'Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'preparing', label: 'Packing' },
  { key: 'ready', label: 'Ready' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
]

function FulfillmentPipeline({ currentStatus }) {
  if (currentStatus === 'cancelled') {
    return (
      <div className="flex items-center gap-2 py-2 px-3.5 rounded-2xl bg-[#FDF2F2] border border-[#F8B4B4] text-[#991B1B] text-xs font-bold">
        <Icon name="close" className="w-4 h-4 text-[#991B1B] shrink-0" />
        <span>Order Cancelled · Reserved inventory returned to farm stock</span>
      </div>
    )
  }

  const currentIndex = ORDER_STEPS.findIndex((s) => s.key === currentStatus)
  const safeIndex = currentIndex >= 0 ? currentIndex : 0
  const progressPercent = (safeIndex / (ORDER_STEPS.length - 1)) * 83.333

  return (
    <div className="w-full bg-[#FAF8F3] rounded-2xl p-3.5 sm:p-4 border border-[#E8E2D6]">
      {/* Unified 6-column grid: every circle and its label are in the exact same column */}
      <div className="relative grid grid-cols-6 items-start">
        {/* Background Track Line (centered through the middle of the 32px circles at top-4) */}
        <div className="absolute top-4 left-[8.333%] right-[8.333%] h-1 bg-[#E2DCD2] -translate-y-1/2 z-0 rounded-full" />

        {/* Active Progress Fill Line */}
        <div
          className="absolute top-4 left-[8.333%] h-1 bg-[#2E5339] -translate-y-1/2 z-0 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />

        {ORDER_STEPS.map((step, idx) => {
          const isDone = safeIndex > idx
          const isCurrent = safeIndex === idx
          return (
            <div key={step.key} className="flex flex-col items-center relative z-10 min-w-0">
              {/* Step Circle Node */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition shadow-sm shrink-0 ${
                  isDone
                    ? 'bg-[#2E5339] text-white border-2 border-[#2E5339]'
                    : isCurrent
                    ? 'bg-[#D4A017] text-[#1A1A1A] font-extrabold ring-4 ring-[#FAF8F3] border-2 border-white shadow-md'
                    : 'bg-white border-2 border-[#CBD5E1] text-[#94A3B8]'
                }`}
              >
                {isDone ? (
                  <Icon name="check" className="w-3.5 h-3.5 text-white" />
                ) : (
                  idx + 1
                )}
              </div>

              {/* Step Label (centered directly beneath the circle) */}
              <span
                className={`text-[10px] sm:text-xs font-bold mt-2 text-center block leading-tight px-0.5 truncate max-w-full ${
                  isCurrent
                    ? 'text-[#2E5339] font-extrabold'
                    : isDone
                    ? 'text-[#1A1A1A]'
                    : 'text-[#94A3B8]'
                }`}
              >
                {step.label}
              </span>

              {/* Active Badge Indicator */}
              {isCurrent && (
                <span className="inline-block mt-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-[#D4A017] text-[#1A1A1A] shadow-xs">
                  Active
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function QuotePanel() {
  const qc = useQueryClient()
  const [prices, setPrices] = useState({})
  const { data } = useQuery({ queryKey: ['farmer-quotes'], queryFn: () => api.farmerQuotes() })
  const respond = useMutation({
    mutationFn: ({ id, payload }) => api.respondQuote(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['farmer-quotes'] }),
  })
  const quotes = data?.quotes ?? []

  if (quotes.length === 0) return null

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border-2 border-[#F2D98A] p-5 sm:p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-[#FFF4D6] text-[#8A6A0A] flex items-center justify-center shrink-0">
          <Icon name="badge" className="w-4 h-4 text-[#8A6A0A]" />
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#8A6A0A] block">Commercial B2B</span>
          <h2 className="font-extrabold text-base text-[#1A1A1A]">Bulk Custom Quote Requests</h2>
        </div>
      </div>

      <div className="grid gap-3">
        {quotes.map((q) => (
          <div key={q.id} className="border border-[#E8E2D6] bg-[#FAF8F3] rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-[#1A1A1A]">
                  {q.quantity} {q.product?.unit_type} · {q.product?.name}
                </span>
                <Chip
                  tone={
                    q.status === 'quoted'
                      ? 'confirmed'
                      : q.status === 'pending'
                      ? 'pending'
                      : q.status === 'declined' || q.status === 'withdrawn'
                      ? 'cancelled'
                      : 'ready'
                  }
                >
                  {q.status}
                </Chip>
              </div>

              <div className="text-xs font-semibold text-[#5C5C5C]">
                Catalog Listing: {fmtPeso(q.product?.price_per_unit || 0)}/{q.product?.unit_type}
                {q.product?.bulk_price ? ` · Bulk Tier ${fmtPeso(q.product.bulk_price)}` : ''}
              </div>
            </div>

            <div className="text-xs text-[#5C5C5C] flex items-center gap-2">
              <Icon name="users" className="w-3.5 h-3.5 text-[#2E5339]" />
              <span>Buyer: <strong className="text-[#1A1A1A]">{q.buyer?.name}</strong></span>
            </div>

            {q.message && (
              <div className="text-xs text-[#4B5563] bg-white rounded-xl p-3 border border-[#E8E2D6] italic">
                “{q.message}”
              </div>
            )}

            {q.status === 'quoted' && (
              <div className="text-xs font-bold text-[#2E5339] bg-[#E8F0E9] rounded-xl p-3 border border-[#C5D9C7] flex items-center gap-2">
                <Icon name="check" className="w-4 h-4 text-[#2E5339]" />
                <span>Your Quote: {fmtPeso(q.quoted_unit_price)}/{q.product?.unit_type}</span>
                {q.response_note && <span className="text-[#5C5C5C] font-normal">({q.response_note})</span>}
              </div>
            )}

            {q.status === 'pending' && (
              <div className="pt-2 flex flex-wrap items-center gap-2.5">
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#5C5C5C]">₱</span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="Your Price / Unit"
                    value={prices[q.id] ?? ''}
                    onChange={(e) => setPrices((s) => ({ ...s, [q.id]: e.target.value }))}
                    className="h-11 w-44 rounded-xl border border-[#CBD5E1] pl-8 pr-3 text-sm font-bold bg-white focus:outline-none focus:border-[#2E5339]"
                  />
                </div>

                <button
                  disabled={respond.isPending || !prices[q.id]}
                  onClick={() =>
                    respond.mutate({
                      id: q.id,
                      payload: { action: 'quote', quoted_unit_price: Number(prices[q.id]) },
                    })
                  }
                  className="h-11 px-5 rounded-full bg-[#2E5339] text-white text-xs font-bold hover:bg-[#24412D] disabled:opacity-50 transition shadow-sm active:scale-95"
                >
                  Send Price Quote
                </button>

                <button
                  disabled={respond.isPending}
                  onClick={() => respond.mutate({ id: q.id, payload: { action: 'decline' } })}
                  className="h-11 px-5 rounded-full bg-white border border-[#F8B4B4] text-[#B0413E] text-xs font-bold hover:bg-[#FDF2F2] disabled:opacity-50 transition active:scale-95"
                >
                  Decline
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Orders() {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [confirmAction, setConfirmAction] = useState(null)
  const qc = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['manage-orders', filter],
    queryFn: () => api.orders({ status: filter === 'all' ? undefined : filter }),
  })

  const orders = data?.data ?? data ?? []
  const list = Array.isArray(orders) ? orders : []

  const { mutate, isPending } = useMutation({
    mutationFn: ({ id, status }) => api.updateOrderStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['manage-orders'] })
      setConfirmAction(null)
    },
  })

  // Filter orders by search
  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return list
    return list.filter((o) => {
      const idMatch = String(o.id).includes(q)
      const buyerMatch = o.buyer?.name?.toLowerCase().includes(q)
      const itemMatch = (o.items || []).some((it) => it.product_name?.toLowerCase().includes(q))
      return idMatch || buyerMatch || itemMatch
    })
  }, [list, search])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Order Fulfillment Queue" desc="Real-time order tracking and one-tap stage progression." />
        <TelemetryCardSkeleton count={4} />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <OrderCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-[#FDF2F2] border border-[#F8B4B4] text-[#991B1B]">
        <div className="font-bold text-base">Failed to load orders</div>
        <div className="text-sm mt-1">{error.message}</div>
      </div>
    )
  }

  const counts = FILTER_CONFIG.reduce((acc, f) => {
    acc[f.key] = f.key === 'all' ? list.length : list.filter((o) => o.status === f.key).length
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* Header with Live Sync badge (Zero dots) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
            Order Fulfillment Queue
          </h1>
          <p className="text-sm text-[#5C5C5C] mt-1 max-w-xl leading-relaxed">
            Move orders through each stage with one tap. Buyers receive automatic notifications as their produce progresses.
          </p>
        </div>

        <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-full bg-[#E8F0E9] border border-[#2E5339]/20 text-[#2E5339] shadow-sm">
          <Icon name="refresh" className="w-3.5 h-3.5 text-[#2E5339]" />
          <span>Active Queue</span>
        </span>
      </div>

      {/* Queue Telemetry Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => setFilter('pending')}
          className={`text-left rounded-2xl p-3.5 sm:p-4 border-2 transition active:scale-95 ${
            filter === 'pending'
              ? 'bg-[#FFF4D6] border-[#D4A017] shadow-sm'
              : 'bg-white border-[#E8E2D6] hover:border-[#D4A017]/60'
          }`}
        >
          <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#8A6A0A]">
            1. Needs Confirmation
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-[#1A1A1A] mt-1">
            {counts['pending'] || 0}
          </div>
          <div className="text-[11px] text-[#5C5C5C] mt-0.5 hidden sm:block">Awaiting approval</div>
        </button>

        <button
          type="button"
          onClick={() => setFilter('preparing')}
          className={`text-left rounded-2xl p-3.5 sm:p-4 border-2 transition active:scale-95 ${
            filter === 'preparing'
              ? 'bg-[#E8F0E9] border-[#2E5339] shadow-sm'
              : 'bg-white border-[#E8E2D6] hover:border-[#2E5339]/60'
          }`}
        >
          <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#2E5339]">
            2. Currently Packing
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-[#1A1A1A] mt-1">
            {counts['preparing'] || 0}
          </div>
          <div className="text-[11px] text-[#5C5C5C] mt-0.5 hidden sm:block">Being sorted & packed</div>
        </button>

        <button
          type="button"
          onClick={() => setFilter('ready')}
          className={`text-left rounded-2xl p-3.5 sm:p-4 border-2 transition active:scale-95 ${
            filter === 'ready'
              ? 'bg-[#E8F0E9] border-[#2E5339] shadow-sm'
              : 'bg-white border-[#E8E2D6] hover:border-[#2E5339]/60'
          }`}
        >
          <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#2E5339]">
            3. Ready for Handover
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-[#1A1A1A] mt-1">
            {counts['ready'] || 0}
          </div>
          <div className="text-[11px] text-[#5C5C5C] mt-0.5 hidden sm:block">Packed & staged</div>
        </button>

        <button
          type="button"
          onClick={() => setFilter('delivered')}
          className={`text-left rounded-2xl p-3.5 sm:p-4 border-2 transition active:scale-95 ${
            filter === 'delivered'
              ? 'bg-[#E8F0E9] border-[#2E5339] shadow-sm'
              : 'bg-white border-[#E8E2D6] hover:border-[#2E5339]/60'
          }`}
        >
          <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#2E5339]">
            4. Dispatched
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-[#1A1A1A] mt-1">
            {counts['delivered'] || 0}
          </div>
          <div className="text-[11px] text-[#5C5C5C] mt-0.5 hidden sm:block">En route or picked up</div>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border-2 border-[#E8E2D6] p-4 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full lg:w-80">
            <Icon name="search" className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Order #, Buyer, or Item…"
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#CBD5E1] text-sm text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#2E5339] focus:ring-2 focus:ring-[#E8F0E9] transition"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto">
            {FILTER_CONFIG.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`h-9 px-3.5 rounded-full border text-xs font-bold transition active:scale-95 ${
                  filter === f.key
                    ? 'bg-[#2E5339] text-white border-[#2E5339] shadow-sm'
                    : 'bg-white border-[#E8E2D6] text-[#5C5C5C] hover:bg-[#FAF8F3] hover:text-[#1A1A1A]'
                }`}
              >
                {f.label} {counts[f.key] ? `(${counts[f.key]})` : ''}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* B2B Quote Panel */}
      <QuotePanel />

      {/* Orders List */}
      <div className="grid gap-4">
        {filteredOrders.map((o) => (
          <div
            key={o.id}
            className="bg-white rounded-2xl sm:rounded-3xl border-2 border-[#E8E2D6] p-5 sm:p-6 flex flex-col gap-4 shadow-sm hover:border-[#2E5339]/30 transition"
          >
            {/* Top Bar: Order ID, Type, Date, Total */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F0EDE6] pb-3.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-extrabold text-base text-[#1A1A1A]">
                  Order #{o.id}
                </span>
                <Chip tone={o.status}>{o.status}</Chip>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FAF8F3] border border-[#E8E2D6] text-[#5C5C5C]">
                  {o.order_type === 'bulk' ? 'B2B Bulk' : 'Retail'}
                </span>
                <span className="text-xs font-semibold text-[#6B7280]">
                  Fulfillment: <strong className="capitalize text-[#1A1A1A]">{o.fulfillment_type || 'Delivery'}</strong>
                </span>
              </div>

              <div className="text-right">
                <div className="font-extrabold text-lg text-[#2E5339]">
                  {fmtPeso(o.total_amount)}
                </div>
                <div className="text-[11px] text-[#9CA3AF]">
                  {new Date(o.created_at).toLocaleString('en-PH')}
                </div>
              </div>
            </div>

            {/* Visual Stepper Pipeline */}
            <FulfillmentPipeline currentStatus={o.status} />

            {/* Buyer Details & Receipt Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* Buyer Information Block */}
              <div className="lg:col-span-4 bg-[#FAF8F3] rounded-2xl p-4 border border-[#E8E2D6] space-y-2">
                <div className="text-xs font-bold text-[#2E5339] uppercase tracking-wider flex items-center gap-1.5">
                  <Icon name="users" className="w-3.5 h-3.5" />
                  <span>Buyer Details</span>
                </div>
                <div className="font-extrabold text-sm text-[#1A1A1A]">
                  {o.buyer?.name || `Buyer #${o.buyer_id}`}
                </div>
                {o.delivery_address && (
                  <div className="text-xs text-[#5C5C5C] flex items-start gap-1.5 leading-relaxed">
                    <Icon name="mapPin" className="w-3.5 h-3.5 text-[#D4A017] shrink-0 mt-0.5" />
                    <span>{o.delivery_address}</span>
                  </div>
                )}
              </div>

              {/* Produce Receipt Items */}
              <div className="lg:col-span-5 bg-[#FAF8F3] rounded-2xl p-4 border border-[#E8E2D6] space-y-2">
                <div className="text-xs font-bold text-[#2E5339] uppercase tracking-wider flex items-center gap-1.5">
                  <Icon name="inventory" className="w-3.5 h-3.5" />
                  <span>Produce Manifest ({(o.items || []).length} items)</span>
                </div>
                <div className="divide-y divide-[#E8E2D6]">
                  {(o.items || []).map((it, i) => (
                    <div key={i} className="flex justify-between items-center text-xs py-1.5 gap-2">
                      <span className="font-semibold text-[#1A1A1A] truncate">
                        {it.product_name} <span className="text-[#6B7280] font-normal">({it.quantity} × {fmtPeso(it.unit_price)})</span>
                      </span>
                      <span className="font-bold text-[#2E5339] whitespace-nowrap">
                        {fmtPeso(it.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons Column */}
              <div className="lg:col-span-3 flex flex-col gap-2 justify-center h-full">
                {/* Advance Stage Button */}
                {next[o.status] && (
                  <button
                    disabled={isPending}
                    onClick={() => mutate({ id: o.id, status: next[o.status] })}
                    className="w-full h-12 rounded-2xl bg-[#2E5339] text-white text-xs font-extrabold hover:bg-[#24412D] transition shadow-md hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <span>{nextLabel[o.status]}</span>
                    <Icon name="chevronRight" className="w-4 h-4 text-white" />
                  </button>
                )}

                {/* Revert Stage Button (Mistake Recovery) */}
                {prev[o.status] && (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() =>
                      setConfirmAction({
                        type: 'revert',
                        order: o,
                        toStatus: prev[o.status],
                        toLabel: prevLabel[o.status],
                      })
                    }
                    className="w-full h-10 rounded-2xl border-2 border-[#CBD5E1] bg-white hover:bg-[#FAF8F3] text-[#4B5563] hover:text-[#1A1A1A] text-xs font-bold transition flex items-center justify-center gap-2 active:scale-95 shadow-xs disabled:opacity-50"
                    title={`Revert back to ${prevLabel[o.status]} if moved forward by mistake`}
                  >
                    <Icon name="undo" className="w-3.5 h-3.5 text-[#8A6A0A]" />
                    <span>Revert to {prevLabel[o.status]}</span>
                  </button>
                )}

                {/* Cancel Order Button */}
                {['pending', 'confirmed', 'preparing'].includes(o.status) && (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() =>
                      setConfirmAction({
                        type: 'cancel',
                        order: o,
                        toStatus: 'cancelled',
                        toLabel: 'Cancelled',
                      })
                    }
                    className="w-full h-9 rounded-xl border border-[#F8B4B4] text-[#B0413E] text-xs font-bold bg-white hover:bg-[#FDF2F2] transition disabled:opacity-60 active:scale-95"
                  >
                    Cancel Order
                  </button>
                )}

                {/* Terminal State Indicators */}
                {o.status === 'completed' && (
                  <div className="w-full py-2 px-3 rounded-2xl bg-[#E8F0E9] border border-[#2E5339]/20 text-[#2E5339] text-xs font-bold text-center flex items-center justify-center gap-1.5">
                    <Icon name="check" className="w-4 h-4 text-[#2E5339]" />
                    <span>Fulfillment Completed</span>
                  </div>
                )}

                {o.status === 'cancelled' && (
                  <div className="w-full py-2 px-3 rounded-2xl bg-[#FDF2F2] border border-[#F8B4B4] text-[#991B1B] text-xs font-bold text-center flex items-center justify-center gap-1.5">
                    <Icon name="close" className="w-4 h-4 text-[#991B1B]" />
                    <span>Order Cancelled</span>
                  </div>
                )}

                <div className="text-[11px] text-[#9CA3AF] text-center font-medium">
                  Instant sync with buyer app
                </div>
              </div>
            </div>
          </div>
        ))}

        {!isLoading && filteredOrders.length === 0 && (
          <div className="p-8 text-center bg-white rounded-3xl border-2 border-[#E8E2D6]">
            <EmptyState
              icon="orders"
              title={filter !== 'all' ? `No ${filter} orders found` : 'No orders in queue'}
              hint="New orders booked by buyers on the AniMarket store will appear here in real-time."
            />
          </div>
        )}
      </div>

      {/* Action Confirmation Modal (Revert or Cancel) */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#1A1A1A]/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setConfirmAction(null)}
          />

          <div className="relative bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border-2 border-[#E8E2D6] space-y-4 animate-in fade-in zoom-in-95 duration-150 z-10">
            <div className="flex flex-col items-center text-center">
              <div
                className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center mb-3 shadow-sm ${
                  confirmAction.type === 'revert'
                    ? 'bg-[#FFF4D6] border-[#F2D98A] text-[#8A6A0A]'
                    : 'bg-[#FDF2F2] border-[#F8B4B4] text-[#B0413E]'
                }`}
              >
                <Icon
                  name={confirmAction.type === 'revert' ? 'undo' : 'alertTriangle'}
                  className="w-6 h-6"
                />
              </div>

              <h3 className="text-lg font-extrabold text-[#1A1A1A]">
                {confirmAction.type === 'revert'
                  ? `Revert Order #${confirmAction.order.id}?`
                  : `Cancel Order #${confirmAction.order.id}?`}
              </h3>

              <p className="text-xs text-[#5C5C5C] mt-1.5 leading-relaxed">
                {confirmAction.type === 'revert' ? (
                  <>
                    Set fulfillment stage back to{' '}
                    <strong className="text-[#1A1A1A]">“{confirmAction.toLabel}”</strong>?
                    Use this if the order was advanced by mistake. The buyer will receive an updated status notification.
                  </>
                ) : (
                  <>
                    Are you sure you want to cancel this order? Reserved produce stock will be returned to your inventory immediately.
                  </>
                )}
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="flex-1 h-12 rounded-xl border border-[#CBD5E1] text-xs font-bold text-[#4B5563] hover:bg-[#FAF8F3] hover:text-[#1A1A1A] transition active:scale-95"
              >
                Nevermind
              </button>

              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  mutate({ id: confirmAction.order.id, status: confirmAction.toStatus })
                }}
                className={`flex-1 h-12 rounded-xl text-white text-xs font-bold shadow-md hover:shadow-lg transition active:scale-95 flex items-center justify-center gap-1.5 ${
                  confirmAction.type === 'revert'
                    ? 'bg-[#2E5339] hover:bg-[#24412D]'
                    : 'bg-[#B0413E] hover:bg-[#991B1B]'
                }`}
              >
                <Icon
                  name={confirmAction.type === 'revert' ? 'undo' : 'close'}
                  className="w-4 h-4 text-white"
                />
                <span>
                  {confirmAction.type === 'revert'
                    ? `Yes, Revert Stage`
                    : `Confirm Cancel`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
