import Link from 'next/link'
import { Wordmark } from '@whosplaying/ui'

type SP = { email?: string }

export default async function CheckEmailPage({ searchParams }: { searchParams: Promise<SP> }) {
  const { email } = await searchParams
  return (
    <div className="min-h-screen flex items-center justify-center bg-teal-50 p-6">
      <div className="absolute top-6 left-6">
        <Link href="/" aria-label="Home">
          <Wordmark width={180} />
        </Link>
      </div>
      <div className="w-full max-w-sm bg-paper rounded-lg shadow-stack-teal border border-ink-line p-8 text-center">
        <h1 className="font-display text-4xl text-ink">Check your inbox</h1>
        <p className="text-ink-soft mt-3">
          We sent a magic link to <strong>{email ?? 'your email'}</strong>. Tap it on this device to
          sign in.
        </p>
        <p className="text-xs text-ink-mute mt-6">
          Wrong address?{' '}
          <Link href="/login" className="text-teal underline">
            Try again
          </Link>
        </p>
      </div>
    </div>
  )
}
