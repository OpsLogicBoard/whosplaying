// Editorial chrome for the Phase 0 reference compositions.
// Minimal masthead — small wordmark left, thin underlined nav right.
// The chrome doesn't decorate; it gets out of the way so the page
// can read like a magazine.

import Link from 'next/link'
import { Wordmark } from '@whosplaying/ui'

const NAV = [
  { href: '/welcome', label: 'Welcome' },
  { href: '/discover', label: 'Discover' },
  { href: '/e/sample-event', label: 'Event' },
]

export default function ReferenceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper-warm font-body text-ink">
      <header className="border-b border-ink-line bg-paper-warm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-5">
          <Link href="/welcome" aria-label="Who's Playing home" className="opacity-90">
            <Wordmark width={120} />
          </Link>
          <nav className="flex items-center gap-7 text-sm">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="font-mono text-[11px] uppercase tracking-widest text-ink-soft hover:text-ink"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="mt-32 border-t border-ink-line">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-6 py-8 text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[11px] uppercase tracking-widest">Who&rsquo;s Playing · Jacksonville Beach</p>
          <p className="font-mono text-[11px] uppercase tracking-widest">Phase 0 · Reference compositions</p>
        </div>
      </footer>
    </div>
  )
}
