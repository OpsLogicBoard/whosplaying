import Link from 'next/link'

// Admin console shell — web-only, single-tenant (NO subdomain). In production
// this is gated server-side: check adminQ.isPlatformAdmin() and notFound() for
// non-admins before rendering. Deliberately utilitarian and separate from the
// consumer Live Pin brand.
const NAV = [
  { href: '/admin', label: 'Overview', icon: '▦' },
  { href: '/admin/sales', label: 'Sales', icon: '◷' },
  { href: '/admin/maintenance', label: 'Maintenance', icon: '⚙' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas text-ink flex">
      <aside className="w-56 shrink-0 bg-ink-deep text-white flex flex-col">
        <div className="px-5 py-4 border-b border-white/10">
          <div className="text-sm font-bold tracking-tight">who&rsquo;s playing</div>
          <div className="text-[11px] font-semibold uppercase tracking-widest text-coral mt-0.5">
            Operator
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            >
              <span className="w-4 text-center opacity-80">{n.icon}</span>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10 text-[11px] text-white/40 leading-relaxed">
          Single-tenant · admin-gated route. Every action is audit-logged.
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-12 border-b border-ink-line bg-surface flex items-center justify-between px-6">
          <span className="text-xs font-semibold uppercase tracking-widest text-ink-mute">
            Platform Operations
          </span>
          <span className="flex items-center gap-2 text-xs font-medium text-ink-soft">
            <span className="h-2 w-2 rounded-full bg-teal" />
            super_admin · james@
          </span>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
