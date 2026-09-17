import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useCart } from '../lib/cart'
import { peso } from '../components/format'
import { Icon, ProductDetailSkeleton } from '../../shared/ui'

export default function ProductDetail() {
  const { id } = useParams()
  const navgo = useNavigate()
  const { add } = useCart()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => api.product(id),
  })
  const p = data?.data

  if (isLoading) {
    return <ProductDetailSkeleton />
  }

  if (isError || !p) {
    return (
      <div className="max-w-md mx-auto text-center py-20 bg-white border border-[#E8E2D6] rounded-2xl p-8 my-8 shadow-sm">
        <div className="w-12 h-12 mx-auto rounded-full bg-[#E8F0E9] text-[#2E5339] flex items-center justify-center mb-3">
          <Icon name="inbox" className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-[#1A1A1A]">Produce not found</h2>
        <p className="text-sm text-[#5C5C5C] mt-1">This harvest listing is no longer available in the marketplace.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 mt-5 px-5 py-2.5 rounded-xl bg-[#2E5339] text-white text-xs font-semibold hover:bg-[#24412D] transition shadow-sm"
        >
          <span>← Back to Marketplace</span>
        </Link>
      </div>
    )
  }

  const isAvailable = p.status === 'available' && p.available_quantity > 0
  const maxQty = Math.max(1, p.available_quantity || 1)

  const handleQtyChange = (val) => {
    const parsed = Number(String(val).replace(/\D/g, '')) || 1
    setQty(Math.min(maxQty, Math.max(1, parsed)))
  }

  const addToCart = () => {
    if (!isAvailable) return
    if (added) {
      navgo('/cart')
      return
    }
    add(p, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 2400)
  }

  return (
    <div className="max-w-4xl mx-auto py-2">
      {/* Navigation Breadcrumb */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C5C5C] hover:text-[#2E5339] transition"
        >
          <span>←</span>
          <span>Back to Marketplace</span>
        </Link>
        {p.category && (
          <span className="text-xs font-medium text-[#8A8A8A] uppercase tracking-wider">
            {p.category.name}
          </span>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Media */}
        <div className="relative aspect-[4/3] bg-[#F4F1EA] rounded-2xl overflow-hidden border border-[#E8E2D6] shadow-sm">
          {p.image ? (
            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-[#5C5C5C]/60 gap-2">
              <Icon name="sprout" className="w-12 h-12 text-[#4A7C59]/60" />
              <span className="text-xs font-medium uppercase tracking-wider">Fresh Harvest</span>
            </div>
          )}

          {!isAvailable && (
            <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] flex items-center justify-center">
              <span className="px-4 py-1.5 rounded-full bg-white text-[#B0413E] text-xs font-bold shadow-md">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1A1A]">{p.name}</h1>
                {p.farmer?.verified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#E8F0E9] border border-[#C5D9C7] text-[#2E5339]">
                    <Icon name="check" className="w-3 h-3" />
                    Verified Farm
                  </span>
                )}
              </div>
              <p className="text-xs text-[#5C5C5C] mt-1">
                Grown by <span className="font-semibold text-[#1A1A1A]">{p.farmer?.farm_name || p.farmer?.name || 'Local Farm'}</span>
                {p.farmer?.municipality ? ` · ${p.farmer.municipality}, ${p.farmer.province || 'PH'}` : ''}
              </p>
            </div>

            <div className="flex items-baseline gap-2 pt-1 border-t border-[#E8E2D6]/60">
              <span className="text-3xl font-extrabold text-[#2E5339] tracking-tight">{peso(p.price_per_unit)}</span>
              <span className="text-sm font-medium text-[#8A8A8A]">/ {p.unit_type}</span>
            </div>

            {p.min_bulk_quantity && p.bulk_price && (
              <div className="flex items-center gap-3 p-3 bg-[#FFF4D6] border border-[#F2D98A] rounded-xl text-[#8A6A0A] text-xs">
                <Icon name="badge" className="w-4 h-4 shrink-0 text-[#D4A017]" />
                <div>
                  <strong className="font-semibold">Bulk Deal:</strong> {peso(p.bulk_price)}/{p.unit_type} for orders of {p.min_bulk_quantity}+ {p.unit_type}
                </div>
              </div>
            )}

            <p className="text-sm text-[#5C5C5C] leading-relaxed pt-1">
              {p.description || 'Direct harvest sourced straight from the farm with zero middleman markups.'}
            </p>

            {p.harvest_date && (
              <div className="inline-flex items-center gap-2 text-xs text-[#8A8A8A] bg-[#FAF8F3] border border-[#E8E2D6] px-3 py-1.5 rounded-lg">
                <Icon name="calendar" className="w-3.5 h-3.5 text-[#2E5339]" />
                <span>Harvested on <strong className="text-[#1A1A1A]">{p.harvest_date}</strong></span>
              </div>
            )}
          </div>

          {/* Action & Purchase Area */}
          <div className="pt-4 border-t border-[#E8E2D6] space-y-3">
            {isAvailable ? (
              <>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-[#5C5C5C] uppercase tracking-wider">Quantity</span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-[#E8E2D6] bg-white rounded-xl overflow-hidden shadow-sm">
                      <button
                        type="button"
                        disabled={qty <= 1}
                        onClick={() => setQty(Math.max(1, qty - 1))}
                        className="w-9 h-9 flex items-center justify-center text-sm font-semibold hover:bg-[#FAF8F3] disabled:opacity-30 disabled:cursor-not-allowed transition"
                      >
                        −
                      </button>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={qty}
                        onChange={(e) => handleQtyChange(e.target.value)}
                        className="w-12 text-center text-sm font-bold py-1.5 focus:outline-none bg-transparent"
                      />
                      <button
                        type="button"
                        disabled={qty >= maxQty}
                        onClick={() => setQty(Math.min(maxQty, qty + 1))}
                        className="w-9 h-9 flex items-center justify-center text-sm font-semibold hover:bg-[#FAF8F3] disabled:opacity-30 disabled:cursor-not-allowed transition"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-xs text-[#8A8A8A]">
                      {p.available_quantity} {p.unit_type} available
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={addToCart}
                    className={`w-full py-3.5 px-5 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 shadow-sm ${
                      added
                        ? 'bg-[#4A7C59] text-white hover:bg-[#3E684B]'
                        : 'bg-[#2E5339] text-white hover:bg-[#24412D] active:scale-[0.99]'
                    }`}
                  >
                    {added ? (
                      <>
                        <Icon name="check" className="w-4 h-4" />
                        <span>Added to Basket · Click to View Basket →</span>
                      </>
                    ) : (
                      <>
                        <Icon name="cart" className="w-4 h-4" />
                        <span>Add to Basket · {peso(p.price_per_unit * qty)}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      add(p, qty)
                      navgo('/cart')
                    }}
                    className="w-full py-2.5 px-4 rounded-xl border border-[#E8E2D6] text-xs font-semibold text-[#5C5C5C] hover:text-[#1A1A1A] hover:bg-[#FAF8F3] transition"
                  >
                    Instant Checkout
                  </button>
                </div>
              </>
            ) : (
              <div className="p-4 rounded-xl bg-[#FAF8F3] border border-[#E8E2D6] text-center">
                <p className="text-sm font-semibold text-[#B0413E]">Currently Sold Out</p>
                <p className="text-xs text-[#8A8A8A] mt-0.5">
                  This harvest has been completely booked. Explore other nearby farms in the market.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Farmer Profile Card */}
      {p.farmer && (
        <div className="mt-10 bg-white border border-[#E8E2D6] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
            <div className="w-12 h-12 rounded-xl bg-[#E8F0E9] text-[#2E5339] flex items-center justify-center font-bold text-lg shrink-0">
              {p.farmer.farm_name ? p.farmer.farm_name[0].toUpperCase() : 'F'}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-[#1A1A1A] truncate">{p.farmer.farm_name || p.farmer.name}</h2>
                {p.farmer.verified && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#E8F0E9] text-[#2E5339] border border-[#C5D9C7]">
                    Accredited
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-[#5C5C5C] mt-0.5">
                <Icon name="mapPin" className="w-3.5 h-3.5 text-[#8A8A8A] shrink-0" />
                <span className="truncate">
                  {[p.farmer.barangay, p.farmer.municipality, p.farmer.province].filter(Boolean).join(', ') || 'Philippines'}
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto">
              {p.farmer.rating_avg ? (
                <div>
                  <div className="inline-flex items-center gap-1 text-[#D4A017] font-bold text-sm">
                    <Icon name="star" className="w-4 h-4 fill-current" />
                    <span>{p.farmer.rating_avg.toFixed(1)}</span>
                  </div>
                  <div className="text-[11px] text-[#8A8A8A]">
                    {p.farmer.rating_count} review{p.farmer.rating_count === 1 ? '' : 's'}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-[#8A8A8A]">New farm to marketplace</div>
              )}
            </div>
          </div>

          {p.farmer.bio && (
            <p className="text-xs text-[#5C5C5C] mt-3 pt-3 border-t border-[#E8E2D6]/60 leading-relaxed">
              {p.farmer.bio}
            </p>
          )}

          {p.farmer.rating_count > 0 && <FarmerReviews farmerId={p.farmer.id} />}
        </div>
      )}
    </div>
  )
}

function FarmerReviews({ farmerId }) {
  const { data } = useQuery({
    queryKey: ['farmer-reviews', farmerId],
    queryFn: () => api.farmerReviews(farmerId),
  })
  const reviews = data?.reviews ?? []
  if (reviews.length === 0) return null

  return (
    <div className="mt-4 pt-4 border-t border-[#E8E2D6]">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8A8A8A] mb-3">Buyer Reviews</h3>
      <div className="space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className="p-3 bg-[#FAF8F3] rounded-xl border border-[#E8E2D6]/60">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="flex text-[#D4A017]">
                  {[...Array(5)].map((_, i) => (
                    <Icon
                      key={i}
                      name="star"
                      className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-current' : 'text-[#E8E2D6]'}`}
                    />
                  ))}
                </span>
                <span className="text-xs font-semibold text-[#1A1A1A] ml-1">{r.reviewer_name || 'Verified Buyer'}</span>
              </div>
              <span className="text-[10px] text-[#8A8A8A]">
                {r.created_at ? new Date(r.created_at).toLocaleDateString('en-PH') : ''}
              </span>
            </div>
            {r.comment && <p className="text-xs text-[#5C5C5C] mt-2 leading-relaxed">{r.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
