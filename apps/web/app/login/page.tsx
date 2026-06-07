'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Wordmark } from '@whosplaying/ui'
import { createBrowserSupabase } from '@/lib/supabase/browser'

export default function LoginPage() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') ?? '/calendar'

  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || submitting) return
    setSubmitting(true)
    setError(null)
    const supabase = createBrowserSupabase()
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo, shouldCreateUser: true },
    })
    if (err) {
      setError(err.message)
      setSubmitting(false)
      return
    }
    router.push(`/check-email?email=${encodeURIComponent(email)}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-teal-50 p-6">
      <div className="absolute top-6 left-6">
        <Link href="/" aria-label="Home">
          <Wordmark width={180} />
        </Link>
      </div>
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-paper rounded-lg shadow-stack-yellow border border-ink-line p-8">
        <h1 className="font-display text-4xl text-ink">Sign in</h1>
        <p className="text-ink-soft mt-2">
          We&rsquo;ll email you a magic link. No password.
        </p>
        <label className="block mt-6 text-sm font-medium text-ink" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-md border border-ink-line bg-paper px-3 py-2 text-ink focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal-200"
          placeholder="you@example.com"
        />
        {error && <p className="mt-3 text-sm text-coral-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting || !email}
          className="mt-6 w-full bg-teal text-white py-3 rounded-lg font-semibold shadow-stack-coral disabled:opacity-50 disabled:shadow-none"
        >
          {submitting ? 'Sending…' : 'Send magic link'}
        </button>
      </form>
    </div>
  )
}
