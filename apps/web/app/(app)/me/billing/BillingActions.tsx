'use client'

import { useState } from 'react'
import { createBrowserSupabase } from '@/lib/supabase/browser'

type Props = {
  orgId: string
  isPro: boolean
  /** Only owners/managers can change billing. */
  canManage: boolean
  /** Org is founding-eligible and still on free → offer the founding rate. */
  showFounding: boolean
}

export function BillingActions({ orgId, isPro, canManage, showFounding }: Props) {
  const [busy, setBusy] = useState<null | 'checkout' | 'portal'>(null)
  const [error, setError] = useState<string | null>(null)

  if (!canManage) {
    return (
      <p className="mt-6 text-sm text-ink-mute">
        Only an owner or manager can change this organization’s billing.
      </p>
    )
  }

  async function startCheckout() {
    setBusy('checkout')
    setError(null)
    try {
      const supabase = createBrowserSupabase()
      const origin = window.location.origin
      const { data, error: err } = await supabase.functions.invoke<{ url: string }>(
        'stripe-checkout',
        {
          body: {
            orgId,
            plan: showFounding ? 'founding' : 'venue_pro',
            successUrl: `${origin}/me/billing?upgraded=1`,
            cancelUrl: `${origin}/me/billing`,
          },
        },
      )
      if (err) throw err
      if (data?.url) window.location.href = data.url
      else throw new Error('No checkout URL returned.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start checkout.')
      setBusy(null)
    }
  }

  async function openPortal() {
    setBusy('portal')
    setError(null)
    try {
      const supabase = createBrowserSupabase()
      const origin = window.location.origin
      const { data, error: err } = await supabase.functions.invoke<{ url: string }>(
        'stripe-portal',
        { body: { orgId, returnUrl: `${origin}/me/billing` } },
      )
      if (err) throw err
      if (data?.url) window.location.href = data.url
      else throw new Error('No portal URL returned.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not open billing portal.')
      setBusy(null)
    }
  }

  return (
    <div className="mt-6">
      <div className="flex flex-wrap gap-3">
        {isPro ? (
          <button
            type="button"
            onClick={openPortal}
            disabled={busy !== null}
            className="rounded-lg border-2 border-ink-line bg-paper px-5 py-3 font-semibold text-ink hover:bg-paper-cool disabled:opacity-50"
          >
            {busy === 'portal' ? 'Opening…' : 'Manage billing'}
          </button>
        ) : (
          <button
            type="button"
            onClick={startCheckout}
            disabled={busy !== null}
            className="rounded-lg bg-coral px-6 py-3 font-bold text-white shadow-card hover:bg-coral-600 disabled:opacity-50 transition-colors"
          >
            {busy === 'checkout'
              ? 'Starting…'
              : showFounding
                ? 'Start Venue Pro · Founding $14.99'
                : 'Start Venue Pro · $24.99'}
          </button>
        )}
      </div>
      {error && <p className="mt-3 text-sm text-coral-600">{error}</p>}
    </div>
  )
}
