import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

export default function Notifications() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: api.notifications,
    refetchInterval: 20000,
  })

  const notifications = data?.notifications ?? []

  const markRead = async (n) => {
    if (n.is_read) return
    await api.markNotificationRead(n.id)
    qc.invalidateQueries({ queryKey: ['notifications'] })
    qc.invalidateQueries({ queryKey: ['unread-count'] })
  }

  const icon = (type) => {
    if (type?.includes('order')) return '📦'
    if (type?.includes('verification')) return '🪪'
    if (type?.includes('listing')) return '🚫'
    return '🔔'
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>

      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-white border border-[#E8E2D6] rounded-[16px] animate-pulse" />)}</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 text-[#8A8A8A]">
          <div className="text-4xl mb-3">🔕</div>
          You're all caught up.
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <button
              key={n.id}
              onClick={() => markRead(n)}
              className={`w-full text-left bg-white border rounded-[16px] p-4 flex gap-3 transition ${n.is_read ? 'border-[#E8E2D6] opacity-70' : 'border-[#C5D9C7] shadow-[0_2px_10px_rgba(46,83,57,0.08)]'}`}
            >
              <div className="text-xl shrink-0">{icon(n.type)}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{n.title}</span>
                  {!n.is_read && <span className="w-2 h-2 rounded-full bg-[#D4A017] shrink-0" />}
                </div>
                <div className="text-sm text-[#5C5C5C] mt-0.5">{n.body}</div>
                <div className="text-[11px] text-[#8A8A8A] mt-1">{new Date(n.created_at).toLocaleString('en-PH')}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
