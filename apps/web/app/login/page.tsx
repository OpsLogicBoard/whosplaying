'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Wordmark } from '@whosplaying/ui'
import { createBrowserSupabase } from '@/lib/supabase/browser'

type Stage = 'request' | 'verify'

export default function LoginPage() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') ?? '/calendar'
  const initialError = params.get('error')

  const [stage, setStage] = useState<Stage>('request')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(initialError)

  async function requestLink(e: React.FormEvent) {
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
    setSubmitting(false)
    if (err) {
      setError(err.message)
      return
    }
    setStage('verify')
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault()
    if (!code || submitting) return
    setSubmitting(true)
    setError(null)
    const supabase = createBrowserSupabase()
    const { error: err } = await supabase.auth.verifyOtp({
      email,
      token: code.trim(),
      type: 'email',
    })
    setSubmitting(false)
    if (err) {
      setError(err.message)
      return
    }
    router.replace(next)
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-teal-50 p-6">
      <div className="absolute top-6 left-6">
        <Link href="/" aria-label="Home">
          <Wordmark width={180} />
        </Link>
      </div>
      <div className="w-full max-w-sm bg-paper rounded-lg shadow-stack-yellow border border-ink-line p-8">
        <h1 className="font-display text-4xl text-ink">Sign in</h1>

        {stage === 'request' && (
          <form onSubmit={requestLink}>
            <p className="text-ink-soft mt-2">We&rsquo;ll email you a link and a 6-digit code.</p>
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
              {submitting ? 'Sending…' : 'Send code'}
            </button>
          </form>
        )}

        {stage === 'verify' && (
          <form onSubmit={verifyCode}>
            <p className="text-ink-soft mt-2">
              We sent it to <strong>{email}</strong>. Enter the 6-digit code or tap the link from
              the same browser.
            </p>
            <label className="block mt-6 text-sm font-medium text-ink" htmlFor="code">
              6-digit code
            </label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="mt-1 w-full rounded-md border border-ink-line bg-paper px-3 py-2 text-2xl tracking-[0.5em] text-center text-ink focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal-200"
              placeholder="••••••"
            />
            {error && <p className="mt-3 text-sm text-coral-600">{error}</p>}
            <button
              type="submit"
              disabled={submitting || code.length < 6}
              className="mt-6 w-full bg-coral text-white py-3 rounded-lg font-semibold shadow-stack-yellow disabled:opacity-50 disabled:shadow-none"
            >
              {submitting ? 'Verifying…' : 'Sign in'}
            </button>
            <button
              type="button"
              onClick={() => {
                setStage('request')
                setCode('')
                setError(null)
              }}
              className="mt-3 w-full text-sm text-ink-mute hover:text-ink"
            >
              Use a different email
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
