import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useState } from 'react'
import { PageHeader, CardSkeleton, TableSkeleton, EmptyState, Chip, Icon } from '../../shared/ui'

const ROLE_LABEL = { farmer: 'Farmer', buyer_individual: 'Buyer · Individual', buyer_business: 'Buyer · Business', admin: 'Admin' }

export default function Users() {
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')
  const [showConfirm, setShowConfirm] = useState(null)
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['users', filter, search], queryFn: () => api.users({ role: filter || undefined, search: search || undefined, per_page: 20 }) })

  const { mutate } = useMutation({ 
    mutationFn: ({ id, payload }) => api.moderateUser(id, payload), 
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      setShowConfirm(null)
    } 
  })

  const rows = data?.data || []

  return (
    <div className="space-y-4 relative">
      <PageHeader
        title="User moderation"
        desc="Everyone on AniLink — farmers, households, and business buyers — with verification at a glance."
      />

      <div className="bg-white rounded-[12px] border border-[#E8E2D6] p-4 flex flex-wrap gap-3 items-center">
        <label className="relative min-w-[260px] flex-1">
          <Icon name="search" className="w-4 h-4 text-[#8A8A8A] absolute left-4 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or email"
            className="w-full h-11 rounded-xl border border-[#E8E2D6] pl-10 pr-4 text-sm focus:outline-none focus:border-[#2E5339] focus:ring-2 focus:ring-[#E8F0E9]" />
        </label>
        {['', 'farmer', 'buyer_individual', 'buyer_business', 'admin'].map(r => (
          <button key={r || 'all'} onClick={() => setFilter(r)}
            className={`h-11 px-4 rounded-xl border text-sm transition ${filter === r ? 'bg-[#2E5339] text-white border-[#2E5339] font-medium' : 'bg-white border-[#E8E2D6] hover:bg-[#FAF8F3]'}`}>
            {r ? ROLE_LABEL[r] : 'All'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : rows.length === 0 ? (
        <EmptyState icon="users" title="No users found" hint="Try a different search or role filter." />
      ) : (
        <div className="bg-white rounded-[12px] border border-[#E8E2D6] overflow-hidden shadow-[0_4px_12px_rgba(46,83,57,0.06)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#FAF8F3] text-xs font-semibold tracking-[0.06em] uppercase text-[#8A8A8A]">
                <tr>
                  <th className="text-left px-4 py-3">User</th><th className="text-left px-4 py-3">Role</th>
                  <th className="text-left px-4 py-3">Location / Farm</th><th className="text-left px-4 py-3">Verified</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EDE6]">
                {rows.map(u => (
                  <tr key={u.id} className="hover:bg-[#FAF8F3] transition">
                    <td className="px-4 py-3">
                      <div className="font-medium flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${u.role === 'admin' ? 'bg-[#FFF4D6] text-[#D4A017]' : u.role === 'farmer' ? 'bg-[#E8F0E9] text-[#2E5339]' : 'bg-[#F3F4F6] text-[#8A8A8A]'}`}>
                          {u.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div>{u.name}</div>
                          <div className="text-xs text-[#8A8A8A] mt-0.5">{u.email} · {u.phone || 'no phone'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Chip tone={u.role === 'farmer' ? 'available' : u.role === 'admin' ? 'pending' : 'default'}>{ROLE_LABEL[u.role] || u.role}</Chip>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#5C5C5C]">
                      {u.farmerProfile ? `${u.farmerProfile.farm_name} · ${u.farmerProfile.barangay}, ${u.farmerProfile.municipality}` : u.buyerProfile ? (u.buyerProfile.buyer_type || '—') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Chip tone={u.is_verified ? 'verified' : 'unverified'}>{u.is_verified ? 'Verified' : 'Unverified'}</Chip>
                      {u.farmerProfile && <div className="text-[11px] text-[#8A8A8A] mt-1">Verification: {u.farmerProfile.verification_status}</div>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setShowConfirm({ id: u.id, action: u.is_verified ? 'unverify' : 'verify', name: u.name })}
                        className="h-9 px-4 rounded-xl border border-[#E8E2D6] text-xs font-semibold hover:bg-[#FAF8F3] transition">
                        {u.is_verified ? 'Unverify' : 'Verify'}
                      </button>
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
              <Icon name="badge" className="w-6 h-6 text-[#1A1A1A]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-1">
              {showConfirm.action === 'verify' ? 'Verify this user?' : 'Remove verification?'}
            </h3>
            <p className="text-sm text-[#5C5C5C] mb-6">
              You are about to {showConfirm.action === 'verify' ? 'verify' : 'unverify'} <strong>{showConfirm.name}</strong>.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(null)}
                className="flex-1 h-11 rounded-xl border border-[#E8E2D6] font-semibold text-[#1A1A1A] hover:bg-[#FAF8F3] transition">
                Cancel
              </button>
              <button onClick={() => mutate({ id: showConfirm.id, payload: { is_verified: showConfirm.action === 'verify' } })}
                className={`flex-1 h-11 rounded-xl font-semibold text-white transition bg-[#2E5339] hover:bg-[#24412D]`}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
