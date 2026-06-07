import Link from 'next/link'
import { Wordmark } from '@whosplaying/ui'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-paper-cool border-b border-ink-line">
        <div className="mx-auto max-w-6xl flex items-center justify-between p-4">
          <Link href="/" aria-label="Who's Playing home">
            <Wordmark width={200} />
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link href="/how-it-works" className="hover:text-teal">How it works</Link>
            <Link href="/for-artists" className="hover:text-teal">For artists</Link>
            <Link href="/for-venues" className="hover:text-teal">For venues</Link>
            <Link
              href="/login"
              className="bg-teal text-white px-4 py-2 rounded-lg shadow-stack-yellow font-semibold"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="bg-ink text-paper-cool p-6 text-center text-sm">
        © {new Date().getFullYear()} Who&rsquo;s Playing
      </footer>
    </div>
  )
}
