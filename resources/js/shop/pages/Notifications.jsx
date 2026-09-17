import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Icon, NotificationSkeleton } from '../../shared/ui'

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

  const iconName = (type) => {
    if (type?.includes('order')) return 'orders'
    if (type?.includes('verification')) return 'badge'
    if (type?.includes('listing')) return 'alert'
    return 'bell'
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">Notifications</h1>
          <p className="text-xs text-[#5C5C5C] mt-0.5">Order updates, farm verifications, and marketplace alerts.</p>
        </div>
        <Link
          to="/"
          className="text-xs font-semibold text-[#2E5339] hover:text-[#24412D] transition inline-flex items-center gap-1"
        >
          <span>← Marketplace</span>
        </Link>
      </div>

      {isLoading ? (
        <NotificationSkeleton count={4} />
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 bg-white border border-[#E8E2D6] rounded-2xl p-8 shadow-sm">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#E8F0E9] text-[#2E5339] flex items-center justify-center mb-3">
            <Icon name="bellOff" className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-base text-[#1A1A1A]">All caught up</h3>
          <p className="text-xs text-[#5C5C5C] mt-1">You have no new notifications from AniLink.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {notifications.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => markRead(n)}
              className={`w-full text-left bg-white border rounded-2xl p-4 sm:p-5 flex gap-3.5 transition shadow-sm ${
                n.is_read
                  ? 'border-[#E8E2D6] opacity-75 hover:opacity-100'
                  : 'border-[#C5D9C7] ring-1 ring-[#C5D9C7]/50'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  n.is_read ? 'bg-[#FAF8F3] text-[#8A8A8A]' : 'bg-[#E8F0E9] text-[#2E5339]'
                }`}
              >
                <Icon name={iconName(n.type)} className="w-5 h-5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-sm text-[#1A1A1A]">{n.title}</span>
                  {!n.is_read && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#2E5339] bg-[#E8F0E9] px-2 py-0.5 rounded-md border border-[#C5D9C7]/60 shrink-0">
                      New
                    </span>
                  )}
                </div>
                <div className="text-xs text-[#5C5C5C] mt-1 leading-relaxed">{n.body}</div>
                <div className="text-[10px] text-[#8A8A8A] mt-2">
                  {new Date(n.created_at).toLocaleString('en-PH')}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
