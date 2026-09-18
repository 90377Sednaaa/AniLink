import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useState } from 'react'
import { PageHeader, CardSkeleton, TableSkeleton, EmptyState, Chip, Icon } from '../../shared/ui'

export default function Listings() {
  const [filter, setFilter] = useState('available')
  const [search, setSearch] = useState('')
  const [showConfirm, setShowConfirm] = useState(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['listings', filter, search],
    queryFn: () => api.listings({ status: filter || undefined, search: search || undefined, per_page: 20 }),
  })

  const { mutate } = useMutation({
    mutationFn: ({ id, status }) => api.moderateListing(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['listings'] })
      setShowConfirm(null)
    },
  })

  const rows = data?.data || []

  return (
    <div className="space-y-4 relative">
      <PageHeader
        title="Listing moderation"
        desc="Archived listings disappear from the marketplace but stay on record for audit."
      />

      <div className="bg-white rounded-[12px] border border-[#E8E2D6] p-4 flex flex-wrap gap-3 items-center">
        <label className="relative min-w-[260px] flex-1">
          <Icon name="search" className="w-4 h-4 text-[#8A8A8A] absolute left-4 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search a listing or farmer — e.g. Pechay, Lito"
            className="w-full h-11 rounded-xl border border-[#E8E2D6] pl-10 pr-4 text-sm focus:outline-none focus:border-[#2E5339] focus:ring-2 focus:ring-[#E8F0E9]" />
        </label>
        {['available', 'sold_out', 'archived', ''].map(s => (
          <button key={s || 'all'} onClick={() => setFilter(s)}
            className={`h-11 px-5 rounded-xl border text-sm capitalize transition ${filter === s ? 'bg-[#2E5339] text-white border-[#2E5339] font-medium' : 'bg-white border-[#E8E2D6] hover:bg-[#FAF8F3]'}`}>
            {s ? s.replace('_', ' ') : 'All'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : rows.length === 0 ? (
        <EmptyState icon="grid" title="No listings found" hint="Try a different search or status filter." />
      ) : (
        <div className="bg-white rounded-[12px] border border-[#E8E2D6] overflow-hidden shadow-[0_4px_12px_rgba(46,83,57,0.06)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#FAF8F3] text-xs font-semibold tracking-[0.06em] uppercase text-[#8A8A8A]">
                <tr>
                  <th className="text-left px-4 py-3">Listing</th><th className="text-left px-4 py-3">Farmer</th>
                  <th className="text-left px-4 py-3">Price</th><th className="text-left px-4 py-3">Stock</th>
                  <th className="text-left px-4 py-3">Status</th><th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EDE6]">
                {rows.map(p => (
                  <tr key={p.id} className="hover:bg-[#FAF8F3] transition">
                    <td className="px-4 py-3">
                      <div className="font-medium flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-[#E8F0E9] text-[#2E5339] grid place-items-center shrink-0">
                          <Icon name="leaf" className="w-4 h-4" />
                        </span>
                        {p.name}
                      </div>
                      <div className="text-xs text-[#8A8A8A] mt-1">{p.category?.name} · Harvest {p.harvest_date || '—'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{p.farmer?.name}</div>
                      <div className="text-xs text-[#8A8A8A] flex items-center gap-1">{p.farmer?.email} {p.farmer?.verified && <span className="px-1.5 py-0.5 rounded-full bg-[#E8F0E9] text-[#2E5339] text-[10px] font-semibold">Verified</span>}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-[#2E5339]">₱{Number(p.price_per_unit).toLocaleString('en-PH')} / {p.unit_type}</td>
                    <td className="px-4 py-3">{p.available_quantity} {p.unit_type}</td>
                    <td className="px-4 py-3"><Chip tone={p.status}>{(p.status || '').replace('_', ' ') || '—'}</Chip></td>
                    <td className="px-4 py-3 text-right space-x-2">
                      {p.status !== 'archived' && (
                        <button onClick={() => setShowConfirm({ id: p.id, action: 'archived', name: p.name })}
                          className="h-9 px-4 rounded-xl border border-[#E8C6C6] text-[#B0413E] text-xs font-semibold hover:bg-[#FDEDEC] transition">Archive</button>
                      )}
                      {p.status === 'archived' && (
                        <button onClick={() => setShowConfirm({ id: p.id, action: 'available', name: p.name })}
                          className="h-9 px-4 rounded-xl bg-[#2E5339] text-white text-xs font-semibold hover:bg-[#24412D] transition">Restore</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-[#FAF8F3]">
              <Icon name={showConfirm.action === 'archived' ? 'trash' : 'refresh'} className="w-6 h-6 text-[#1A1A1A]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-1">
              {showConfirm.action === 'archived' ? 'Archive this listing?' : 'Restore this listing?'}
            </h3>
            <p className="text-sm text-[#5C5C5C] mb-6">
              You are about to {showConfirm.action === 'archived' ? 'archive' : 'restore'} <strong>{showConfirm.name}</strong>.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(null)}
                className="flex-1 h-11 rounded-xl border border-[#E8E2D6] font-semibold text-[#1A1A1A] hover:bg-[#FAF8F3] transition">
                Cancel
              </button>
              <button onClick={() => mutate({ id: showConfirm.id, status: showConfirm.action })}
                className={`flex-1 h-11 rounded-xl font-semibold text-white transition ${showConfirm.action === 'archived' ? 'bg-[#B0413E] hover:bg-[#903532]' : 'bg-[#2E5339] hover:bg-[#24412D]'}`}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
