'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button, Wordmark } from '@whosplaying/ui'
import { createBrowserSupabase } from '@/lib/supabase/browser'

type Mode = 'sign-in' | 'sign-up'

export default function LoginPage() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') ?? '/calendar'
  const initialError = params.get('error')

  const [mode, setMode] = useState<Mode>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(initialError)
  const [info, setInfo] = useState<string | null>(null)

  async function continueWithGoogle() {
    setError(null)
    const supabase = createBrowserSupabase()
    // Stash the post-auth destination in sessionStorage so the callback
    // route knows where to send the user. The Supabase redirect-allowlist
    // matches exact URLs (without query strings), so we can't pass `next`
    // via the redirect URL.
    if (next && next !== '/calendar') {
      sessionStorage.setItem('whosplaying:next', next)
    }
    const redirectTo = `${window.location.origin}/auth/callback`
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })
    if (err) setError(err.message)
  }

  async function submitEmail(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password || submitting) return
    setSubmitting(true)
    setError(null)
    setInfo(null)
    const supabase = createBrowserSupabase()
    if (mode === 'sign-in') {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      setSubmitting(false)
      if (err) {
        setError(err.message)
        return
      }
      router.replace(next)
      router.refresh()
    } else {
      const { data, error: err } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      setSubmitting(false)
      if (err) {
        setError(err.message)
        return
      }
      if (data.session) {
        router.replace(next)
        router.refresh()
      } else {
        setInfo("Check your inbox to confirm your email, then sign in.")
        setMode('sign-in')
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas p-6">
      <div className="absolute top-6 left-6">
        <Link href="/" aria-label="Home">
          <Wordmark width={180} />
        </Link>
      </div>
      <div className="w-full max-w-sm bg-surface rounded-xl shadow-card border border-ink-line p-8">
        <h1 className="font-display text-4xl text-ink">
          {mode === 'sign-in' ? 'Sign in' : 'Create account'}
        </h1>

        <button
          type="button"
          onClick={continueWithGoogle}
          className="mt-6 w-full flex items-center justify-center gap-3 border-2 border-ink-line bg-paper hover:bg-paper-cool rounded-lg py-3 font-semibold text-ink"
        >
          <GoogleGlyph />
          Continue with Google
        </button>

        <div className="my-6 flex items-center gap-3 text-xs text-ink-mute">
          <div className="flex-1 border-t border-ink-line" />
          or
          <div className="flex-1 border-t border-ink-line" />
        </div>

        <form onSubmit={submitEmail}>
          <label className="block text-sm font-medium text-ink" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-ink-line bg-paper px-3 py-2 text-ink focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral-soft"
            placeholder="you@example.com"
          />
          <label className="block mt-4 text-sm font-medium text-ink" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-ink-line bg-paper px-3 py-2 text-ink focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral-soft"
            placeholder={mode === 'sign-up' ? '8+ characters' : ''}
          />
          {error && <p className="mt-3 text-sm text-coral-600">{error}</p>}
          {info && <p className="mt-3 text-sm font-semibold text-green">{info}</p>}
          <Button
            type="submit"
            disabled={submitting || !email || !password}
            size="lg"
            className="mt-6 w-full"
          >
            {submitting ? '…' : mode === 'sign-in' ? 'Sign in' : 'Create account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-soft">
          {mode === 'sign-in' ? (
            <>
              No account yet?{' '}
              <button
                type="button"
                className="font-semibold text-coral underline hover:text-coral-strong"
                onClick={() => {
                  setMode('sign-up')
                  setError(null)
                  setInfo(null)
                }}
              >
                Create one
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                className="font-semibold text-coral underline hover:text-coral-strong"
                onClick={() => {
                  setMode('sign-in')
                  setError(null)
                  setInfo(null)
                }}
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}

function GoogleGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.3 0 10-2 13.5-5.3l-6.2-5.2C29.2 35.4 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.6 39.6 16.3 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.2 5.2C40.1 35.4 44 30.2 44 24c0-1.2-.1-2.3-.4-3.5z"
      />
    </svg>
  )
}
