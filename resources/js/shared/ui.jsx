// Shared presentational primitives for the AniLink Admin + AniManage SPAs.
// Tokens mirror DESIGN.md: Forest Green #2E5339, Harvest Gold #D4A017, warm #FAF8F3.

const ICON_PATHS = {
  analytics: (
    <>
      <path d="M3 3v16a2 2 0 0 0 2 2h16" />
      <path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" />
    </>
  ),
  badge: (
    <>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  grid: (
    <>
      <rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  inventory: (
    <>
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
    </>
  ),
  orders: (
    <>
      <rect width="8" height="4" x="8" y="2" rx="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M12 11h4" /><path d="M12 16h4" /><path d="M8 11h.01" /><path d="M8 16h.01" />
    </>
  ),
  search: (<><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></>),
  cart: (
    <>
      <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </>
  ),
  bell: (<><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></>),
  refresh: (
    <>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" />
    </>
  ),
  alert: (<><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" /><path d="M12 9v4" /><path d="M12 17h.01" /></>),
  inbox: (<><path d="M22 12h-6l-2 3h-4l-2-3H2" /><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></>),
  sprout: (
    <>
      <path d="M7 20h10" /><path d="M10 20c5.5-2.5.8-6.4 3-10" />
      <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
      <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
    </>
  ),
  logout: (<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></>),
  star: (<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />),
  truck: (
    <>
      <rect width="16" height="11" x="1" y="6" rx="2" />
      <polygon points="17 9 20 9 23 12 23 17 17 17 17 9" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </>
  ),
  check: (<polyline points="20 6 9 17 4 12" />),
  trash: (
    <>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </>
  ),
  calendar: (
    <>
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </>
  ),
  mapPin: (
    <>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  bellOff: (
    <>
      <path d="M8.7 3A6 6 0 0 1 18 8a21.3 21.3 0 0 0 .6 5" />
      <path d="M17 17H3s3-2 3-9a4.67 4.67 0 0 1 .3-1.7" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </>
  ),
  menu: (
    <>
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </>
  ),
  close: (
    <>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </>
  ),
  plus: (
    <>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </>
  ),
  minus: (
    <path d="M5 12h14" />
  ),
  chevronRight: (
    <path d="m9 18 6-6-6-6" />
  ),
  chevronDown: (
    <path d="m6 9 6 6 6-6" />
  ),
  filter: (
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  ),
  eye: (
    <>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  arrowUpRight: (
    <>
      <path d="M7 7h10v10" />
      <path d="M7 17 17 7" />
    </>
  ),
  arrowDown: (
    <>
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </>
  ),
  arrowUp: (
    <>
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </>
  ),
  store: (
    <>
      <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
      <path d="M2 7h20" />
    </>
  ),
  shieldCheck: (
    <>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  leaf: (
    <>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </>
  ),
  undo: (
    <>
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
    </>
  ),
  alertTriangle: (
    <>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" x2="12" y1="9" y2="13" />
      <line x1="12" x2="12.01" y1="17" y2="17" />
    </>
  ),
  arrowLeft: (
    <>
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </>
  ),
}

export function Icon({ name, className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round" className={className} aria-hidden="true">
      {ICON_PATHS[name]}
    </svg>
  )
}

export function PageHeader({ title, desc, children }) {
  if (typeof document !== 'undefined') document.title = `${title} · AniLink`
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {desc && <p className="text-sm text-[#5C5C5C] mt-1 max-w-[64ch] leading-6">{desc}</p>}
      </div>
      {children && <div className="flex items-center gap-2 shrink-0">{children}</div>}
    </div>
  )
}

export function Skeleton({ className = '' }) {
  return <div className={`animate-shimmer rounded-xl bg-[#EBE5DA] ${className}`} />
}

export function CardSkeleton({ rows = 3, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl sm:rounded-3xl border-2 border-[#E8E2D6] p-5 sm:p-6 space-y-4 shadow-sm ${className}`} aria-busy="true" aria-live="polite">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3.5 pt-3.5 first:pt-0 border-t border-[#F0EDE6] first:border-0">
          <Skeleton className="w-11 h-11 rounded-2xl shrink-0" />
          <div className="flex-1 space-y-2 min-w-0">
            <Skeleton className="h-4 w-1/3 max-w-[180px]" />
            <Skeleton className="h-3 w-2/3 max-w-[280px]" />
          </div>
          <Skeleton className="h-9 w-24 rounded-full shrink-0 hidden sm:block" />
        </div>
      ))}
    </div>
  )
}

export function ProductCardSkeleton({ className = '' }) {
  return (
    <div
      className={`bg-white rounded-2xl sm:rounded-3xl border-2 border-[#E8E2D6] p-3.5 sm:p-4 flex flex-col justify-between h-full shadow-sm space-y-3.5 ${className}`}
      aria-busy="true"
      aria-live="polite"
    >
      <div className="space-y-3">
        <Skeleton className="aspect-square w-full rounded-2xl" />
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <div className="space-y-1.5 pt-0.5">
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-3.5 w-1/2" />
        </div>
        <div className="flex items-center gap-2 pt-1">
          <Skeleton className="w-4 h-4 rounded-full shrink-0" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
      <div className="pt-2 border-t border-[#F0EDE6] flex items-center justify-between gap-2">
        <div className="space-y-1">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-2.5 w-10" />
        </div>
        <Skeleton className="h-9 w-24 rounded-full shrink-0" />
      </div>
    </div>
  )
}

export function OrderCardSkeleton({ className = '' }) {
  return (
    <div
      className={`bg-white rounded-2xl sm:rounded-3xl border-2 border-[#E8E2D6] p-5 sm:p-6 flex flex-col gap-4 shadow-sm ${className}`}
      aria-busy="true"
      aria-live="polite"
    >
      <div className="flex items-center justify-between pb-3.5 border-b border-[#F0EDE6] gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-24 rounded-lg" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <div className="space-y-1 text-right">
          <Skeleton className="h-5 w-20 ml-auto" />
          <Skeleton className="h-3 w-28 ml-auto" />
        </div>
      </div>

      <div className="bg-[#FAF8F3] rounded-2xl p-4 border border-[#E8E2D6]">
        <div className="grid grid-cols-6 items-center gap-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex flex-col items-center space-y-2">
              <Skeleton className="w-8 h-8 rounded-full shrink-0" />
              <Skeleton className="h-3 w-10 sm:w-14" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start pt-1">
        <div className="lg:col-span-4 bg-[#FAF8F3] rounded-2xl p-4 border border-[#E8E2D6] space-y-2.5">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-4/5" />
        </div>

        <div className="lg:col-span-5 bg-[#FAF8F3] rounded-2xl p-4 border border-[#E8E2D6] space-y-2.5">
          <Skeleton className="h-3.5 w-32" />
          <div className="space-y-2 pt-1">
            <div className="flex justify-between items-center">
              <Skeleton className="h-3 w-36" />
              <Skeleton className="h-3 w-14" />
            </div>
            <div className="flex justify-between items-center">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-14" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-2 flex flex-col justify-center h-full">
          <Skeleton className="h-12 w-full rounded-2xl" />
          <Skeleton className="h-10 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  )
}

export function TelemetryCardSkeleton({ count = 4, className = '' }) {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 ${className}`} aria-busy="true" aria-live="polite">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-4 border-2 border-[#E8E2D6] space-y-2 shadow-sm">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-2.5 w-28 hidden sm:block" />
        </div>
      ))}
    </div>
  )
}

export function NotificationSkeleton({ count = 4, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`} aria-busy="true" aria-live="polite">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border-2 border-[#E8E2D6] p-4 flex items-center gap-3.5 shadow-sm">
          <Skeleton className="w-10 h-10 rounded-2xl shrink-0" />
          <div className="flex-1 space-y-2 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function TableSkeleton({ rows = 5, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl sm:rounded-3xl border-2 border-[#E8E2D6] overflow-hidden shadow-sm ${className}`} aria-busy="true" aria-live="polite">
      <div className="p-4 bg-[#FAF8F3] border-b border-[#E8E2D6] flex items-center justify-between gap-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-9 w-48 rounded-xl" />
      </div>
      <div className="divide-y divide-[#F0EDE6]">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <Skeleton className="h-4 w-1/3 max-w-[160px]" />
                <Skeleton className="h-3 w-1/4 max-w-[100px]" />
              </div>
            </div>
            <Skeleton className="h-4 w-20 hidden md:block" />
            <Skeleton className="h-4 w-16 hidden sm:block" />
            <Skeleton className="h-9 w-24 rounded-xl shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function ProductDetailSkeleton() {
  return (
    <div className="max-w-5xl mx-auto py-4 sm:py-6 space-y-6" aria-busy="true" aria-live="polite">
      <Skeleton className="h-8 w-36 rounded-full" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-3">
          <Skeleton className="aspect-[4/3] w-full rounded-3xl" />
          <div className="grid grid-cols-4 gap-2.5">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-2xl" />
            ))}
          </div>
        </div>
        <div className="lg:col-span-5 bg-white rounded-3xl border-2 border-[#E8E2D6] p-6 space-y-5 shadow-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#E8E2D6] flex items-center gap-3">
            <Skeleton className="w-11 h-11 rounded-2xl shrink-0" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
          <div className="space-y-2 pt-2">
            <Skeleton className="h-9 w-36" />
            <Skeleton className="h-3 w-28" />
          </div>
          <div className="space-y-3 pt-2">
            <Skeleton className="h-12 w-full rounded-2xl" />
            <Skeleton className="h-12 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function EmptyState({ icon = 'inbox', title, hint }) {
  return (
    <div className="bg-white rounded-[12px] border border-[#E8E2D6] p-10 text-center">
      <div className="w-12 h-12 mx-auto rounded-full bg-[#E8F0E9] text-[#2E5339] grid place-items-center">
        <Icon name={icon} />
      </div>
      <div className="mt-3 font-semibold">{title}</div>
      {hint && <div className="mt-1 text-sm text-[#8A8A8A]">{hint}</div>}
    </div>
  )
}

// Pill tones per DESIGN.md status colors (order states + verification + product status).
export const chipTone = {
  pending: 'bg-[#FFF4D6] border-[#F2D98A] text-[#8A6A0A]',
  unverified: 'bg-[#FFF4D6] border-[#F2D98A] text-[#8A6A0A]',
  confirmed: 'bg-[#E8F0E9] border-[#C5D9C7] text-[#4A7C59]',
  preparing: 'bg-[#E8F0E9] border-[#C5D9C7] text-[#4A7C59]',
  approved: 'bg-[#E8F0E9] border-[#C5D9C7] text-[#2E5339]',
  available: 'bg-[#E8F0E9] border-[#C5D9C7] text-[#2E5339]',
  verified: 'bg-[#E8F0E9] border-[#C5D9C7] text-[#2E5339]',
  ready: 'bg-[#2E5339] border-[#2E5339] text-white',
  delivered: 'bg-[#2E5339] border-[#2E5339] text-white',
  completed: 'bg-[#2E5339] border-[#2E5339] text-white',
  cancelled: 'bg-[#FDEDEC] border-[#E8C6C6] text-[#B0413E]',
  rejected: 'bg-[#FDEDEC] border-[#E8C6C6] text-[#B0413E]',
  archived: 'bg-[#FDEDEC] border-[#E8C6C6] text-[#B0413E]',
  sold_out: 'bg-[#FFF4D6] border-[#F2D98A] text-[#8A6A0A]',
}

export function Chip({ tone = 'pending', className = '', children }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-semibold capitalize ${chipTone[tone] || 'bg-white border-[#E8E2D6] text-[#5C5C5C]'} ${className}`}>
      {children}
    </span>
  )
}
