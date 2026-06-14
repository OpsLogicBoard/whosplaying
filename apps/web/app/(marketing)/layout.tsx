import Link from 'next/link'
import { Wordmark } from '@whosplaying/ui'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      <header className="sticky top-0 z-20 bg-surface/85 backdrop-blur border-b border-ink-line">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-5 py-3">
          <Link href="/" aria-label="Who's Playing home">
            <Wordmark width={150} />
          </Link>
          <nav className="flex items-center gap-7 text-body-sm font-semibold text-ink-soft">
            <Link href="/how-it-works" className="hidden sm:inline hover:text-ink">How it works</Link>
            <Link href="/for-artists" className="hidden sm:inline hover:text-ink">For artists</Link>
            <Link href="/for-venues" className="hidden sm:inline hover:text-ink">For venues</Link>
            <Link href="/pricing" className="hover:text-ink">Pricing</Link>
            <Link
              href="/login"
              className="rounded-pill bg-coral px-4 py-2 text-white shadow-card hover:bg-coral-600 transition-colors"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-ink-line bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-caption text-ink-mute">
          <span>© {new Date().getFullYear()} Who&rsquo;s Playing · whosplaying.live</span>
          <span className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-coral" />
            Free forever for fans &amp; artists
          </span>
        </div>
      </footer>
    </div>
  )
}
