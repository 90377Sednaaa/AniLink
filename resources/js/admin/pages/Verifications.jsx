import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useState } from 'react'
import { PageHeader, CardSkeleton, EmptyState, Chip, Icon } from '../../shared/ui'

export default function Verifications() {
  const [filter, setFilter] = useState('pending')
  const [showConfirm, setShowConfirm] = useState(null)
  const qc = useQueryClient()
  const [note, setNote] = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['verifications', filter],
    queryFn: () => api.verifications({ status: filter, per_page: 20 }),
  })

  const { mutate, isPending } = useMutation({
    mutationFn: ({ id, status }) => api.decide(id, status, note),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['verifications'] })
      setNote('')
      setShowConfirm(null)
    },
  })

  // Streams the document from the private disk with the admin token and opens it
  // in a new tab — no public URL ever exists for verification documents.
  const viewDocument = async (id) => {
    try {
      const res = await fetch(`/api/admin/verifications/${id}/document`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('anilink_admin_token')}` },
      })
      if (!res.ok) throw new Error(`Could not load document (${res.status})`)
      const blob = await res.blob()
      window.open(URL.createObjectURL(blob), '_blank')
    } catch (err) {
      alert(err.message)
    }
  }

  const list = data?.data || []

  return (
    <div className="space-y-4 relative">
      <PageHeader
        title="Farmer verification"
        desc="Review farm documents and grant the verified badge — farmers are notified the moment you decide."
      >
        <div className="flex gap-2">
          {['pending', 'approved', 'rejected'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`h-11 px-5 rounded-xl border text-sm font-medium capitalize transition ${filter === s ? 'bg-[#2E5339] text-white border-[#2E5339]' : 'bg-white border-[#E8E2D6] hover:bg-[#FAF8F3]'}`}>
              {s}
            </button>
          ))}
        </div>
      </PageHeader>

      <div className="bg-white rounded-[16px] border border-[#E8E2D6] p-4 flex gap-3 items-center">
        <Icon name="badge" className="w-5 h-5 text-[#8A8A8A] shrink-0" />
        <input value={note} onChange={e => setNote(e.target.value)} placeholder="Optional note for the farmer — shown when you reject a request" className="flex-1 h-12 rounded-xl border border-[#E8E2D6] px-4 text-sm focus:outline-none focus:border-[#2E5339] focus:ring-2 focus:ring-[#E8F0E9]" />
        <span className="text-xs text-[#8A8A8A] hidden md:inline shrink-0">Applies to your next decision</span>
      </div>

      {isLoading && <CardSkeleton rows={3} />}
      {error && <div className="p-6 text-[#B0413E]">{error.message}</div>}

      <div className="grid gap-4">
        {list.map(p => (
          <div key={p.id} className="bg-white rounded-[16px] border border-[#E8E2D6] p-6 flex flex-col sm:flex-row gap-5 shadow-[0_4px_12px_rgba(46,83,57,0.06)] relative">
            <div className="absolute top-6 right-6">
              <Chip tone={p.verification_status}>{p.verification_status}</Chip>
            </div>
            <div className="w-16 h-16 rounded-full bg-[#E8F0E9] flex items-center justify-center text-xl font-bold text-[#2E5339] shrink-0">
              {p.user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-lg font-semibold">{p.user?.name}</span>
                <span className="text-sm text-[#8A8A8A]">· {p.user?.email}</span>
              </div>
              <div className="text-[15px] font-medium text-[#2E5339]">{p.farm_name} · {p.barangay}, {p.municipality}, {p.province}</div>
              <div className="text-sm text-[#5C5C5C] mt-1">
                {p.bio || 'No bio yet'} · {p.verification_doc_path ? 'Verification document uploaded' : 'No document uploaded yet'}
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                {p.verification_doc_path && (
                  <button onClick={() => viewDocument(p.id)}
                    className="h-11 px-5 rounded-xl bg-white border border-[#E8E2D6] text-[#1A1A1A] text-sm font-semibold hover:bg-[#FAF8F3] transition shadow-sm">
                    View document
                  </button>
                )}
                {p.verification_status !== 'approved' && (
                  <button disabled={isPending} onClick={() => setShowConfirm({ id: p.id, action: 'approved', name: p.user?.name })}
                    className="h-11 px-5 rounded-xl bg-[#2E5339] text-white text-sm font-semibold hover:bg-[#24412D] disabled:opacity-60 inline-flex items-center gap-2 transition shadow-sm">
                    <Icon name="badge" className="w-4 h-4" /> Approve — grant verified badge
                  </button>
                )}
                {p.verification_status !== 'rejected' && (
                  <button disabled={isPending} onClick={() => setShowConfirm({ id: p.id, action: 'rejected', name: p.user?.name })}
                    className="h-11 px-5 rounded-xl bg-white border border-[#E8C6C6] text-[#B0413E] text-sm font-semibold hover:bg-[#FDEDEC] disabled:opacity-60 transition shadow-sm">
                    Reject
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {!isLoading && list.length === 0 && (
          <EmptyState
            icon="badge"
            title={`No ${filter} verifications`}
            hint="New farmer sign-ups will appear here for review."
          />
        )}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${showConfirm.action === 'approved' ? 'bg-[#E8F0E9] text-[#2E5339]' : 'bg-[#FDEDEC] text-[#B0413E]'}`}>
              <Icon name="badge" className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-1">
              {showConfirm.action === 'approved' ? 'Approve this farmer?' : 'Reject this farmer?'}
            </h3>
            <p className="text-sm text-[#5C5C5C] mb-6">
              You are about to {showConfirm.action === 'approved' ? 'approve' : 'reject'} the verification for <strong>{showConfirm.name}</strong>.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(null)}
                className="flex-1 h-11 rounded-xl border border-[#E8E2D6] font-semibold text-[#1A1A1A] hover:bg-[#FAF8F3] transition">
                Cancel
              </button>
              <button onClick={() => mutate({ id: showConfirm.id, status: showConfirm.action })}
                className={`flex-1 h-11 rounded-xl font-semibold text-white transition ${showConfirm.action === 'approved' ? 'bg-[#2E5339] hover:bg-[#24412D]' : 'bg-[#B0413E] hover:bg-[#903532]'}`}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
