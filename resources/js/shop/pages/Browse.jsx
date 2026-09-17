import { useState } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { api } from '../lib/api'
import ProductCard from '../components/ProductCard'
import { Icon } from '../../shared/ui'

const sorts = [
  { value: 'fresh', label: 'Freshest Harvest' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'distance', label: 'Nearest to Me' },
]

export default function Browse() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [sort, setSort] = useState('fresh')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [near, setNear] = useState('')
  const [page, setPage] = useState(1)

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: api.categories })
  const { data: regions } = useQuery({ queryKey: ['regions'], queryFn: () => api.regions() })

  const { data, isLoading, isError } = useQuery({
    queryKey: ['products', { search, category, sort, verifiedOnly, near, page }],
    queryFn: () =>
      api.products({
        search: search || undefined,
        category: category || undefined,
        sort,
        verified_only: verifiedOnly ? 1 : undefined,
        near: near || undefined,
        page,
      }),
    placeholderData: keepPreviousData,
  })

  const products = data?.data ?? []
  const lastPage = data?.last_page ?? 1
  const hasActiveFilters = Boolean(search || category || near || verifiedOnly || sort !== 'fresh')

  const resetFilters = () => {
    setSearch('')
    setCategory('')
    setSort('fresh')
    setVerifiedOnly(false)
    setNear('')
    setPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1A1A]">Marketplace</h1>
          <p className="text-sm text-[#5C5C5C] mt-1">Farm-fresh produce direct from accredited smallholder farms.</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setVerifiedOnly(!verifiedOnly)
              setPage(1)
            }}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border transition ${
              verifiedOnly
                ? 'bg-[#E8F0E9] border-[#2E5339] text-[#2E5339]'
                : 'bg-white border-[#E8E2D6] text-[#5C5C5C] hover:border-[#2E5339]/40'
            }`}
          >
            <span>{verifiedOnly ? '✓' : ''}</span>
            <span>Verified Farms Only</span>
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs text-[#8A8A8A] hover:text-[#B0413E] underline px-2 py-1 transition"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Search & Dropdowns Bar */}
      <div className="bg-white border border-[#E8E2D6] rounded-2xl p-3 shadow-sm flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Icon name="search" className="w-4 h-4 text-[#8A8A8A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search crop, farm name, keyword…"
            className="w-full pl-9 pr-8 py-2 text-sm bg-transparent border-0 focus:outline-none placeholder:text-[#8A8A8A]"
          />
          {search && (
            <button
              onClick={() => {
                setSearch('')
                setPage(1)
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8A8A8A] hover:text-[#1A1A1A]"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-[#E8E2D6] pt-2 sm:pt-0 sm:pl-3">
          <select
            value={near}
            onChange={(e) => {
              setNear(e.target.value)
              setPage(1)
            }}
            className="bg-[#FAF8F3] border border-[#E8E2D6] rounded-xl px-3 py-1.5 text-xs font-medium text-[#1A1A1A] focus:outline-none focus:border-[#2E5339]"
            aria-label="Filter by region"
          >
            <option value="">All Regions</option>
            {(regions ?? []).map((r) => (
              <option key={r.id} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value)
              setPage(1)
            }}
            className="bg-[#FAF8F3] border border-[#E8E2D6] rounded-xl px-3 py-1.5 text-xs font-medium text-[#1A1A1A] focus:outline-none focus:border-[#2E5339]"
            aria-label="Sort harvests"
          >
            {sorts.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category Pills Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => {
            setCategory('')
            setPage(1)
          }}
          className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition ${
            category === ''
              ? 'bg-[#2E5339] text-white shadow-sm'
              : 'bg-white border border-[#E8E2D6] text-[#5C5C5C] hover:border-[#2E5339]/40'
          }`}
        >
          All Harvests
        </button>
        {(categories ?? []).map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => {
              setCategory(c.slug)
              setPage(1)
            }}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition ${
              category === c.slug
                ? 'bg-[#2E5339] text-white shadow-sm'
                : 'bg-white border border-[#E8E2D6] text-[#5C5C5C] hover:border-[#2E5339]/40'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Content Grid / States */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-[4/5] bg-white border border-[#E8E2D6] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-12 bg-white border border-red-200 rounded-2xl p-6 text-sm text-[#B0413E]">
          Could not load the marketplace listings. Please refresh the page.
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-white border border-[#E8E2D6] rounded-2xl p-8 max-w-md mx-auto">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#E8F0E9] text-[#2E5339] flex items-center justify-center mb-3">
            <Icon name="search" className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-base text-[#1A1A1A]">No harvests found</h3>
          <p className="text-xs text-[#5C5C5C] mt-1">Try adjusting your keyword, region, or category filter.</p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 px-4 py-2 rounded-xl bg-[#2E5339] text-white text-xs font-semibold hover:bg-[#24412D] transition shadow-sm"
            >
              Reset All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {lastPage > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-[#E8E2D6] disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#2E5339] transition"
          >
            ← Previous
          </button>
          <span className="text-xs text-[#5C5C5C] px-3 font-medium">
            Page {data?.current_page} of {lastPage}
          </span>
          <button
            type="button"
            disabled={page >= lastPage}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-[#E8E2D6] disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#2E5339] transition"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
