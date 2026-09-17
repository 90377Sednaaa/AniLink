import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader, CardSkeleton, TelemetryCardSkeleton, TableSkeleton, EmptyState, Chip, Icon } from '../../shared/ui'

const fmtPeso = (n) => Number(n || 0).toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })

function StockStepper({ value, unit, onDelta, loading }) {
  const num = Number(value || 0)
  return (
    <div className="flex items-center rounded-2xl border-2 border-[#E8E2D6] bg-white overflow-hidden h-12 shadow-sm">
      <button
        disabled={loading || num <= 0}
        onClick={() => onDelta(-1)}
        aria-label="Decrease stock by 1"
        className="w-12 h-full bg-[#FAF8F3] hover:bg-[#E8E2D6] active:bg-[#DCD5C5] disabled:opacity-30 text-[#1A1A1A] font-extrabold text-lg flex items-center justify-center transition active:scale-95"
      >
        <Icon name="minus" className="w-4 h-4" />
      </button>
      <div className="flex-1 px-2 text-center leading-none">
        <div className={`font-extrabold text-base ${num <= 5 ? 'text-[#B0413E]' : 'text-[#1A1A1A]'}`}>
          {num}
        </div>
        <div className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-wider mt-0.5">
          {unit}
        </div>
      </div>
      <button
        disabled={loading}
        onClick={() => onDelta(1)}
        aria-label="Increase stock by 1"
        className="w-12 h-full bg-[#2E5339] hover:bg-[#24412D] active:bg-[#1E3926] disabled:opacity-40 text-white font-extrabold text-lg flex items-center justify-center transition active:scale-95 shadow-sm"
      >
        <Icon name="plus" className="w-4 h-4 text-white" />
      </button>
    </div>
  )
}

export default function Inventory() {
  const qc = useQueryClient()
  const [updating, setUpdating] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [form, setForm] = useState({ name: '', category_id: '', unit_type: 'kg', price_per_unit: '', available_quantity: '', harvest_date: '', description: '', min_bulk_quantity: '', bulk_price: '' })
  const [imageFiles, setImageFiles] = useState([])
  const [formError, setFormError] = useState(null)

  const { data: prodRes, isLoading, error } = useQuery({ queryKey: ['farmer-products'], queryFn: () => api.farmerProducts() })
  // Real SQL aggregates from /farmer/dashboard
  const { data: dash } = useQuery({ queryKey: ['farmer-dashboard'], queryFn: () => api.dashboard() })
  const { data: predict } = useQuery({ queryKey: ['predict-insights'], queryFn: () => api.insights() })
  const { data: cats } = useQuery({ queryKey: ['categories'], queryFn: () => api.categories() })
  const categories = Array.isArray(cats) ? cats : (cats?.data ?? [])

  const products = prodRes?.data ?? prodRes ?? []

  const lowStock = dash?.low_stock ?? []
  const daily = dash?.sales?.today?.revenue ?? 0
  const weekly = dash?.sales?.week?.revenue ?? 0
  const itemsSold = dash?.sales?.week?.items_sold ?? 0
  const pending = dash?.pending_orders ?? 0

  const adjust = useMutation({
    mutationFn: ({ id, delta }) => api.adjustStock(id, delta, delta>0 ? 'restock' : 'adjustment'),
    onMutate: async ({ id, delta }) => {
      setUpdating(id)
      await qc.cancelQueries({ queryKey: ['farmer-products'] })
      const prev = qc.getQueryData(['farmer-products'])
      qc.setQueryData(['farmer-products'], old => {
        const list = old?.data ?? old ?? []
        const next = list.map(p => p.id===id ? { ...p, available_quantity: Math.max(0, Number(p.available_quantity)+delta), status: Math.max(0, Number(p.available_quantity)+delta)===0 ? 'sold_out' : p.status } : p)
        return old?.data ? { ...old, data: next } : next
      })
      return { prev }
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(['farmer-products'], ctx.prev) },
    onSettled: () => { setUpdating(null); qc.invalidateQueries({ queryKey: ['farmer-products'] }); qc.invalidateQueries({ queryKey: ['farmer-dashboard'] }) },
  })

  const toggleSoldOut = useMutation({
    mutationFn: ({ id, soldOut }) => soldOut ? api.updateProduct(id, { status: 'sold_out' }) : api.adjustStock(id, 10, 'restock'),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['farmer-products'] }); qc.invalidateQueries({ queryKey: ['farmer-dashboard'] }) },
  })

  const create = useMutation({
    mutationFn: () => {
      const base = {
        name: form.name.trim(),
        category_id: Number(form.category_id),
        unit_type: form.unit_type,
        price_per_unit: Number(form.price_per_unit),
        available_quantity: Number(form.available_quantity),
        harvest_date: form.harvest_date || undefined,
        description: form.description || undefined,
        min_bulk_quantity: form.min_bulk_quantity ? Number(form.min_bulk_quantity) : undefined,
        bulk_price: form.bulk_price ? Number(form.bulk_price) : undefined,
      }
      if (!base.name || !base.category_id || !base.price_per_unit || !base.available_quantity) throw new Error('Name, category, price and stock are required.')
      if (imageFiles.length > 0) {
        const fd = new FormData()
        Object.entries(base).forEach(([k,v]) => { if (v !== undefined) fd.append(k, String(v)) })
        imageFiles.forEach(f => fd.append('images[]', f))
        return api.createProduct(fd)
      }
      return api.createProduct(base)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['farmer-products'] })
      setForm({ name: '', category_id: '', unit_type: 'kg', price_per_unit: '', available_quantity: '', harvest_date: '', description: '', min_bulk_quantity: '', bulk_price: '' })
      setImageFiles([])
      setFormError(null)
      setShowAdd(false)
    },
    onError: (e) => setFormError(e.message),
  })

  // Filter products by search, category, and status
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const query = search.trim().toLowerCase()
      const matchesSearch =
        !query ||
        p.name?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)

      const matchesCat =
        selectedCategory === 'all' || String(p.category_id) === String(selectedCategory)

      const isSoldOut = p.status === 'sold_out' || Number(p.available_quantity) === 0
      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'available'
          ? !isSoldOut && p.status !== 'archived'
          : statusFilter === 'low_stock'
          ? !isSoldOut && Number(p.available_quantity) <= 5
          : statusFilter === 'sold_out'
          ? isSoldOut
          : statusFilter === 'archived'
          ? p.status === 'archived'
          : true

      return matchesSearch && matchesCat && matchesStatus
    })
  }, [products, search, selectedCategory, statusFilter])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Harvest Inventory" desc="Live stock control and one-tap restock for farm produce." />
        <TelemetryCardSkeleton count={3} />
        <TableSkeleton rows={5} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-[#FDF2F2] border border-[#F8B4B4] text-[#991B1B]">
        <div className="font-bold text-base">Failed to load inventory</div>
        <div className="text-sm mt-1">{error.message}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
            Harvest Inventory
          </h1>
          <p className="text-sm text-[#5C5C5C] mt-1 max-w-xl leading-relaxed">
            One-tap stock controls sync immediately with buyer storefronts and mobile apps.
          </p>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="shrink-0 inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-[#2E5339] text-white text-sm font-bold hover:bg-[#24412D] transition shadow-md hover:shadow-lg active:scale-95"
        >
          <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
            +
          </span>
          <span>List New Harvest</span>
        </button>
      </div>

      {/* Sales & Telemetry Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Daily Revenue */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border-2 border-[#E8E2D6] p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">Daily Sales</span>
            <div className="w-9 h-9 rounded-xl bg-[#E8F0E9] text-[#2E5339] flex items-center justify-center">
              <Icon name="analytics" className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#2E5339] tracking-tight">
              {fmtPeso(daily)}
            </div>
            <div className="text-xs text-[#5C5C5C] mt-1.5 flex items-center gap-1.5 font-medium">
              <Link to="/orders" className="text-[#2E5339] font-bold hover:underline">
                {pending} pending order{pending === 1 ? '' : 's'}
              </Link>
              <span>awaiting fulfillment</span>
            </div>
          </div>
        </div>

        {/* Weekly Revenue */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border-2 border-[#E8E2D6] p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">Weekly Totals</span>
            <div className="w-9 h-9 rounded-xl bg-[#E8F0E9] text-[#2E5339] flex items-center justify-center">
              <Icon name="orders" className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
              {fmtPeso(weekly)}
            </div>
            <div className="text-xs text-[#5C5C5C] mt-1.5 font-medium">
              <strong>{itemsSold}</strong> produce unit{itemsSold === 1 ? '' : 's'} dispatched in the last 7 days
            </div>
          </div>
        </div>

        {/* Stock Alerts */}
        <div className={`rounded-2xl sm:rounded-3xl border-2 p-5 sm:p-6 shadow-sm flex flex-col justify-between ${
          lowStock.length > 0 ? 'bg-[#FFF9EB] border-[#F2D98A]' : 'bg-white border-[#E8E2D6]'
        }`}>
          <div className="flex items-center justify-between gap-2">
            <span className={`text-xs font-bold uppercase tracking-wider ${
              lowStock.length > 0 ? 'text-[#8A6A0A]' : 'text-[#6B7280]'
            }`}>
              Stock Health
            </span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              lowStock.length > 0 ? 'bg-white/80 text-[#8A6A0A]' : 'bg-[#E8F0E9] text-[#2E5339]'
            }`}>
              <Icon name="alert" className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              lowStock.length > 0 ? 'text-[#8A6A0A]' : 'text-[#2E5339]'
            }`}>
              {lowStock.length > 0 ? `${lowStock.length} Low Stock` : 'All Stock Healthy'}
            </div>
            <div className="text-xs text-[#5C5C5C] mt-1.5 font-medium truncate">
              {lowStock.length > 0
                ? `Critically low: ${lowStock.map((p) => p.name).join(', ')}`
                : `${products.length} active harvest listings published`}
            </div>
          </div>
        </div>
      </div>

      {/* Critical Low Stock Quick Action Banner */}
      {lowStock.length > 0 && (
        <div className="bg-[#FFF4D6] rounded-2xl border-2 border-[#F2D98A] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white text-[#8A6A0A] flex items-center justify-center shrink-0">
              <Icon name="alert" className="w-4 h-4 text-[#8A6A0A]" />
            </div>
            <div>
              <div className="font-bold text-sm text-[#8A6A0A]">Urgent Harvest Restock Attention Needed</div>
              <div className="text-xs text-[#8A6A0A]/90 mt-0.5">
                These harvests have 5 or fewer units left. Tap +10 to fast-replenish:
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {lowStock.map((p) => (
              <div
                key={p.id}
                className="inline-flex items-center gap-2 bg-white rounded-full border border-[#F2D98A] pl-3 pr-1.5 py-1 text-xs font-semibold text-[#1A1A1A] shadow-sm"
              >
                <span>{p.name}</span>
                <span className="text-[#B0413E] font-bold">({p.available_quantity} {p.unit_type})</span>
                <button
                  onClick={() => adjust.mutate({ id: p.id, delta: 10 })}
                  className="h-6 px-2.5 rounded-full bg-[#2E5339] text-white text-[11px] font-bold hover:bg-[#24412D] transition"
                >
                  +10
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AniPredict Market Radar */}
      {predict?.category && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border-2 border-[#E8E2D6] p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3 flex-wrap border-b border-[#F0EDE6] pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#E8F0E9] text-[#2E5339] flex items-center justify-center shrink-0">
                <Icon name="sprout" className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#6B7280] block">
                  AniPredict Market Radar
                </span>
                <span className="font-extrabold text-base text-[#1A1A1A]">
                  {predict.category.name} Benchmarking
                </span>
              </div>
            </div>

            {predict.demand?.direction && (
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1.5 rounded-full border ${
                  predict.demand.direction === 'rising'
                    ? 'bg-[#E8F0E9] border-[#C5D9C7] text-[#2E5339]'
                    : predict.demand.direction === 'falling'
                    ? 'bg-[#FDF2F2] border-[#F8B4B4] text-[#991B1B]'
                    : 'bg-[#FFF4D6] border-[#F2D98A] text-[#8A6A0A]'
                }`}
              >
                {predict.demand.direction === 'rising' ? (
                  <Icon name="arrowUp" className="w-3.5 h-3.5 text-[#2E5339]" />
                ) : predict.demand.direction === 'falling' ? (
                  <Icon name="arrowDown" className="w-3.5 h-3.5 text-[#991B1B]" />
                ) : null}
                <span className="capitalize">{predict.demand.direction} Demand</span>
              </span>
            )}
          </div>

          <div className="mt-3.5 text-sm text-[#4B5563] leading-relaxed">
            {predict.best_time?.recommendation ||
              'Price history builds continuously as your harvests are booked and fulfilled.'}
          </div>

          {predict.regional_comparison?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {predict.regional_comparison.map((r) => (
                <span
                  key={r.region}
                  className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs ${
                    r.is_home
                      ? 'bg-[#E8F0E9] border-[#2E5339]/30 text-[#2E5339] font-bold shadow-sm'
                      : 'bg-[#FAF8F3] border-[#E8E2D6] text-[#4B5563]'
                  }`}
                >
                  <span>{r.region}{r.is_home ? ' (Your Region)' : ''}:</span>
                  <strong className="text-[#1A1A1A]">{fmtPeso(r.avg_price)}/unit</strong>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border-2 border-[#E8E2D6] p-4 shadow-sm flex flex-col lg:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full lg:w-80">
          <Icon name="search" className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search harvests by name…"
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#CBD5E1] text-sm text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#2E5339] focus:ring-2 focus:ring-[#E8F0E9] transition"
          />
        </div>

        {/* Category & Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Status Select/Tabs */}
          <div className="flex items-center bg-[#F4F1EA] p-1 rounded-xl border border-[#E8E2D6] text-xs font-bold">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusFilter === 'all' ? 'bg-white text-[#2E5339] shadow-sm' : 'text-[#5C5C5C] hover:text-[#1A1A1A]'
              }`}
            >
              All ({products.length})
            </button>
            <button
              onClick={() => setStatusFilter('available')}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusFilter === 'available' ? 'bg-white text-[#2E5339] shadow-sm' : 'text-[#5C5C5C] hover:text-[#1A1A1A]'
              }`}
            >
              Available
            </button>
            <button
              onClick={() => setStatusFilter('low_stock')}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusFilter === 'low_stock' ? 'bg-white text-[#8A6A0A] shadow-sm' : 'text-[#5C5C5C] hover:text-[#1A1A1A]'
              }`}
            >
              Low Stock ({lowStock.length})
            </button>
            <button
              onClick={() => setStatusFilter('sold_out')}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusFilter === 'sold_out' ? 'bg-white text-[#991B1B] shadow-sm' : 'text-[#5C5C5C] hover:text-[#1A1A1A]'
              }`}
            >
              Sold Out
            </button>
          </div>

          {/* Category Dropdown */}
          {categories.length > 0 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-11 rounded-xl border border-[#CBD5E1] px-3 bg-white text-xs font-bold text-[#1A1A1A] focus:outline-none focus:border-[#2E5339]"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Harvest Listings Table (Desktop) & Cards (Mobile) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border-2 border-[#E8E2D6] overflow-hidden shadow-sm">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#FAF8F3] text-xs font-bold tracking-wider uppercase text-[#6B7280] border-b border-[#E8E2D6]">
              <tr>
                <th className="px-6 py-4">Harvest & Produce</th>
                <th className="px-6 py-4">Pricing & Tier</th>
                <th className="px-6 py-4">Stock Level</th>
                <th className="px-6 py-4 text-center">One-Tap Stepper</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EDE6]">
              {filteredProducts.map((p) => {
                const isSoldOut = p.status === 'sold_out' || Number(p.available_quantity) === 0
                return (
                  <tr
                    key={p.id}
                    className={`hover:bg-[#FAF8F3]/70 transition ${
                      isSoldOut ? 'bg-[#FFFBFB]' : ''
                    }`}
                  >
                    {/* Harvest item & Photo */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {p.image ? (
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-12 h-12 rounded-xl object-cover border border-[#E8E2D6] shadow-sm shrink-0"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-[#E8F0E9] border border-[#2E5339]/20 flex items-center justify-center text-[#2E5339] shrink-0">
                            <Icon name="leaf" className="w-5 h-5 text-[#2E5339]" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-extrabold text-base text-[#1A1A1A] flex items-center gap-2 truncate">
                            <span>{p.name}</span>
                            {p.status === 'archived' && (
                              <Chip tone="archived" className="!py-0.5">Archived</Chip>
                            )}
                          </div>
                          <div className="text-xs text-[#6B7280] mt-0.5 flex items-center gap-2">
                            <span>Harvest: {p.harvest_date || 'Fresh Daily'}</span>
                            <span className="text-[#D1D5DB]">·</span>
                            <span className="capitalize">{p.category?.name || 'Produce'}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Pricing */}
                    <td className="px-6 py-4">
                      <div className="font-extrabold text-base text-[#2E5339]">
                        {fmtPeso(p.price_per_unit)} <span className="text-xs font-semibold text-[#5C5C5C]">/ {p.unit_type}</span>
                      </div>
                      {p.bulk_price ? (
                        <div className="text-xs font-semibold text-[#8A6A0A] mt-0.5">
                          Bulk: {fmtPeso(p.bulk_price)} @ {p.min_bulk_quantity}+ {p.unit_type}
                        </div>
                      ) : (
                        <div className="text-[11px] text-[#9CA3AF] mt-0.5">Retail single tier</div>
                      )}
                    </td>

                    {/* Stock Status Chip */}
                    <td className="px-6 py-4">
                      <Chip tone={isSoldOut ? 'cancelled' : Number(p.available_quantity) <= 5 ? 'pending' : 'available'}>
                        {isSoldOut ? 'Sold Out' : `${p.available_quantity} ${p.unit_type} left`}
                      </Chip>
                    </td>

                    {/* One-Tap Stepper */}
                    <td className="px-6 py-4">
                      <div className="w-48 mx-auto">
                        <StockStepper
                          value={p.available_quantity}
                          unit={p.unit_type}
                          loading={updating === p.id}
                          onDelta={(d) => adjust.mutate({ id: p.id, delta: d })}
                        />
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => toggleSoldOut.mutate({ id: p.id, soldOut: !isSoldOut })}
                        className={`h-9 px-4 rounded-full text-xs font-bold border transition active:scale-95 shadow-sm ${
                          isSoldOut
                            ? 'bg-[#2E5339] text-white border-[#2E5339] hover:bg-[#24412D]'
                            : 'bg-white border-[#F8B4B4] text-[#B0413E] hover:bg-[#FDF2F2]'
                        }`}
                      >
                        {isSoldOut ? 'Restock +10' : 'Mark Sold Out'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List */}
        <div className="md:hidden divide-y divide-[#E8E2D6]">
          {filteredProducts.map((p) => {
            const isSoldOut = p.status === 'sold_out' || Number(p.available_quantity) === 0
            return (
              <div key={p.id} className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-14 h-14 rounded-xl object-cover border border-[#E8E2D6] shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-[#E8F0E9] border border-[#2E5339]/20 flex items-center justify-center shrink-0">
                      <Icon name="leaf" className="w-6 h-6 text-[#2E5339]" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="font-extrabold text-base text-[#1A1A1A] truncate">{p.name}</div>
                    <div className="text-xs text-[#6B7280] mt-0.5">{p.category?.name || 'Produce'} · {p.harvest_date || 'Daily'}</div>
                    <div className="font-extrabold text-sm text-[#2E5339] mt-1">
                      {fmtPeso(p.price_per_unit)} / {p.unit_type}
                    </div>
                  </div>
                  <Chip tone={isSoldOut ? 'cancelled' : Number(p.available_quantity) <= 5 ? 'pending' : 'available'}>
                    {isSoldOut ? 'Sold Out' : `${p.available_quantity} left`}
                  </Chip>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <div className="flex-1">
                    <StockStepper
                      value={p.available_quantity}
                      unit={p.unit_type}
                      loading={updating === p.id}
                      onDelta={(d) => adjust.mutate({ id: p.id, delta: d })}
                    />
                  </div>
                  <button
                    onClick={() => toggleSoldOut.mutate({ id: p.id, soldOut: !isSoldOut })}
                    className={`h-12 px-4 rounded-2xl text-xs font-bold border transition active:scale-95 shrink-0 ${
                      isSoldOut
                        ? 'bg-[#2E5339] text-white border-[#2E5339]'
                        : 'bg-white border-[#F8B4B4] text-[#B0413E]'
                    }`}
                  >
                    {isSoldOut ? 'Restock +10' : 'Mark Sold'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="p-8 text-center">
            <EmptyState
              icon="sprout"
              title={search ? 'No matching harvests found' : 'No harvests listed yet'}
              hint={search ? 'Try clearing your search filters to view all products.' : 'Tap "List New Harvest" above to post your first farm produce.'}
            />
          </div>
        )}
      </div>

      {/* Add Harvest Listing Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#1A1A1A]/50 backdrop-blur-sm transition-opacity"
            onClick={() => setShowAdd(false)}
          />
          <div className="relative w-full max-w-xl bg-white rounded-3xl border-2 border-[#E8E2D6] shadow-2xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#F0EDE6] pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#1A1A1A] tracking-tight">
                  List New Harvest
                </h2>
                <p className="text-xs text-[#5C5C5C] mt-1">
                  Post produce directly to the AniMarket buyer catalog and mobile marketplace.
                </p>
              </div>
              <button
                onClick={() => setShowAdd(false)}
                aria-label="Close modal"
                className="w-9 h-9 rounded-full bg-[#FAF8F3] border border-[#E8E2D6] flex items-center justify-center text-[#5C5C5C] hover:text-[#1A1A1A] transition"
              >
                <Icon name="close" className="w-4 h-4" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold tracking-wider uppercase text-[#1A1A1A] mb-1.5">
                  Produce Name *
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                  placeholder="e.g. Organic Siling Labuyo"
                  className="w-full h-12 rounded-xl border border-[#CBD5E1] px-4 text-sm font-semibold text-[#1A1A1A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2E5339] focus:ring-2 focus:ring-[#E8F0E9] transition"
                />
              </div>

              {/* Category & Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold tracking-wider uppercase text-[#1A1A1A] mb-1.5">
                    Category *
                  </label>
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm((s) => ({ ...s, category_id: e.target.value }))}
                    className="w-full h-12 rounded-xl border border-[#CBD5E1] px-3 bg-white text-sm font-semibold text-[#1A1A1A] focus:outline-none focus:border-[#2E5339]"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold tracking-wider uppercase text-[#1A1A1A] mb-1.5">
                    Unit Measurement *
                  </label>
                  <select
                    value={form.unit_type}
                    onChange={(e) => setForm((s) => ({ ...s, unit_type: e.target.value }))}
                    className="w-full h-12 rounded-xl border border-[#CBD5E1] px-3 bg-white text-sm font-semibold text-[#1A1A1A] focus:outline-none focus:border-[#2E5339]"
                  >
                    <option value="kg">Kilogram (kg)</option>
                    <option value="sack">Sack (50kg)</option>
                    <option value="piece">Piece (pc)</option>
                    <option value="bundle">Bundle (tali)</option>
                    <option value="bag">Bag</option>
                    <option value="box">Box / Crate</option>
                  </select>
                </div>
              </div>

              {/* Price & Initial Stock */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold tracking-wider uppercase text-[#1A1A1A] mb-1.5">
                    Price per Unit (₱) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price_per_unit}
                    onChange={(e) => setForm((s) => ({ ...s, price_per_unit: e.target.value }))}
                    placeholder="120.00"
                    className="w-full h-12 rounded-xl border border-[#CBD5E1] px-4 text-sm font-semibold text-[#1A1A1A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2E5339]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold tracking-wider uppercase text-[#1A1A1A] mb-1.5">
                    Harvest Stock Qty *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={form.available_quantity}
                    onChange={(e) => setForm((s) => ({ ...s, available_quantity: e.target.value }))}
                    placeholder="50"
                    className="w-full h-12 rounded-xl border border-[#CBD5E1] px-4 text-sm font-semibold text-[#1A1A1A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2E5339]"
                  />
                </div>
              </div>

              {/* Harvest Date */}
              <div>
                <label className="block text-xs font-bold tracking-wider uppercase text-[#1A1A1A] mb-1.5">
                  Harvest Date (Optional)
                </label>
                <input
                  type="date"
                  value={form.harvest_date}
                  onChange={(e) => setForm((s) => ({ ...s, harvest_date: e.target.value }))}
                  className="w-full h-12 rounded-xl border border-[#CBD5E1] px-4 text-sm font-semibold text-[#1A1A1A] focus:outline-none focus:border-[#2E5339]"
                />
              </div>

              {/* Photos Upload Dropzone */}
              <div>
                <label className="block text-xs font-bold tracking-wider uppercase text-[#1A1A1A] mb-1.5">
                  Produce Photos (Up to 5 PNG/JPG)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/png, image/jpeg, .png, .jpg, .jpeg"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || [])
                      .filter(
                        (f) =>
                          ['image/png', 'image/jpeg', 'image/jpg'].includes(f.type) ||
                          /\.(png|jpe?g)$/i.test(f.name)
                      )
                      .slice(0, 5)
                    setImageFiles(files)
                  }}
                  className="block w-full text-xs text-[#5C5C5C] file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:bg-[#E8F0E9] file:text-[#2E5339] file:font-bold border border-[#CBD5E1] rounded-xl p-1 bg-[#FAF8F3]"
                />
                {imageFiles.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-2.5">
                    {imageFiles.map((f, i) => (
                      <div
                        key={i}
                        className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#E8E2D6] bg-white shadow-sm"
                      >
                        <img
                          src={URL.createObjectURL(f)}
                          alt={`preview ${i}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setImageFiles((prev) => prev.filter((_, idx) => idx !== i))}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bulk Tier Discount Options */}
              <div className="p-3.5 rounded-2xl bg-[#FAF8F3] border border-[#E8E2D6] space-y-2">
                <span className="text-xs font-bold text-[#2E5339] uppercase tracking-wider block">
                  Optional Commercial / B2B Tier:
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#5C5C5C] mb-1">
                      Min Bulk Qty
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={form.min_bulk_quantity}
                      onChange={(e) => setForm((s) => ({ ...s, min_bulk_quantity: e.target.value }))}
                      placeholder="e.g. 10"
                      className="w-full h-10 rounded-lg border border-[#CBD5E1] px-3 text-xs font-semibold bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#5C5C5C] mb-1">
                      Bulk Price / Unit (₱)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.bulk_price}
                      onChange={(e) => setForm((s) => ({ ...s, bulk_price: e.target.value }))}
                      placeholder="e.g. 95.00"
                      className="w-full h-10 rounded-lg border border-[#CBD5E1] px-3 text-xs font-semibold bg-white"
                    />
                  </div>
                </div>
              </div>

              {formError && (
                <div className="rounded-xl bg-[#FDF2F2] border border-[#F8B4B4] p-3 text-xs font-bold text-[#991B1B]">
                  {formError}
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAdd(false)}
                  className="flex-1 h-12 rounded-full border-2 border-[#E8E2D6] bg-white font-bold text-sm text-[#5C5C5C] hover:bg-[#FAF8F3] transition"
                >
                  Cancel
                </button>
                <button
                  disabled={create.isPending}
                  onClick={() => create.mutate()}
                  className="flex-1 h-12 rounded-full bg-[#2E5339] text-white font-bold text-sm hover:bg-[#24412D] disabled:opacity-60 transition shadow-md active:scale-95"
                >
                  {create.isPending ? 'Publishing…' : 'Publish Harvest'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
