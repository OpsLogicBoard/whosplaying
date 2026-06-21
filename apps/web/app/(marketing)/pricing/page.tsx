import Link from 'next/link'
import type { Metadata } from 'next'
import { Feature, FEATURE_MATRIX, type FeatureKey } from '@whosplaying/core'
import { createServerSupabase } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: "Pricing — Who's Playing",
  description:
    'Free forever for fans and artists. Venues list shows, message performers, and link out for tickets at no cost. Venue Pro unlocks boosts, GPS push, and full analytics — $14.99/mo founding rate for early venues.',
}

// Display order + copy for the comparison. The Free/Pro cells are derived from
// the canonical FEATURE_MATRIX in @whosplaying/core, so this page can never
// drift from what the entitlement system actually grants.
const ROWS: { key: FeatureKey; label: string; blurb: string }[] = [
  { key: Feature.CREATE_EVENTS, label: 'Post events & calendar', blurb: 'List your shows on the map, Tonight & search.' },
  { key: Feature.TICKET_LINKOUT, label: 'Get Tickets link-out', blurb: 'Send fans to your ticketer — always free.' },
  { key: Feature.MESSAGING, label: 'Messaging & cross-confirm', blurb: 'Book performers; both sides confirm.' },
  { key: Feature.OFFERS, label: 'Redeemable offers', blurb: 'Run venue deals on event pages.' },
  { key: Feature.STAFF_SEATS, label: 'Staff seats', blurb: 'Let your team answer & manage.' },
  { key: Feature.EVENT_BOOSTS, label: 'Event boosts', blurb: 'Top of Tonight & a highlighted map pin.' },
  { key: Feature.GPS_PUSH, label: 'GPS push to nearby fans', blurb: 'Alert goers in range — hard-capped.' },
  { key: Feature.FULL_ANALYTICS, label: 'Full analytics', blurb: 'Views → taps funnel & follower growth.' },
  { key: Feature.FEATURED_PLACEMENT, label: 'Featured placement', blurb: 'Stand out in discovery.' },
  { key: Feature.PUBLISHING_TOOLS, label: 'Publishing tools', blurb: 'Flyers to Canva & Instagram.' },
]

function cell(value: unknown): { text: string; on: boolean } {
  if (value === false || value === undefined) return { text: '—', on: false }
  if (value === true) return { text: '✓', on: true }
  const v = value as Record<string, unknown>
  if ('limit' in v) {
    return v.limit === null ? { text: 'Unlimited', on: true } : { text: String(v.limit), on: true }
  }
  if ('daily_cap' in v) return { text: 'Capped', on: true }
  return { text: '✓', on: true }
}

function Check({ text, on }: { text: string; on: boolean }) {
  if (text === '✓')
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-soft text-green text-sm">
        ✓
      </span>
    )
  if (!on) return <span className="text-ink-mute">—</span>
  return <span className="text-body-sm font-bold text-ink-deep">{text}</span>
}

export default async function PricingPage() {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  // Signed-in venues go straight to their billing dashboard; everyone else
  // signs in first (carry the destination so they land on billing after auth).
  const proHref = user ? '/me/billing' : '/login?next=/me/billing'
  const freeHref = user ? '/calendar' : '/login'

  return (
    <div className="mx-auto max-w-5xl px-5 py-14">
      {/* Hero */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-2 rounded-pill bg-coral-soft px-3.5 py-1.5 text-caption font-bold uppercase tracking-wide text-coral">
          Support local live music
        </span>
        <h1 className="mt-4 font-display text-[44px] leading-[1.04] tracking-tight text-ink-deep">
          Free for fans and artists.
          <br />
          <span className="text-coral">Always.</span>
        </h1>
        <p className="mt-4 text-lg text-ink-soft">
          We only charge venues — just enough to keep the lights on and support local music.
          Listing shows, messaging, and Get&nbsp;Tickets links are free for everyone.
        </p>
      </div>

      {/* Plan cards */}
      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {/* Free */}
        <div className="rounded-xl border border-ink-line bg-surface p-7 shadow-card">
          <h2 className="text-h2 text-ink-deep">Free</h2>
          <p className="mt-1 text-body-sm text-ink-soft">For fans, artists &amp; every venue</p>
          <div className="mt-5 flex items-baseline gap-1.5">
            <span className="font-display text-[40px] tracking-tight text-ink-deep">$0</span>
            <span className="text-body-sm font-semibold text-ink-soft">forever</span>
          </div>
          <Link
            href={freeHref}
            className="mt-6 block rounded-lg border border-ink-line bg-surface py-3 text-center text-body-sm font-bold text-ink hover:border-ink-mute transition-colors"
          >
            Get started
          </Link>
          <p className="mt-5 text-caption font-semibold uppercase tracking-wide text-ink-mute">
            Everything to get on the map
          </p>
          <ul className="mt-3 space-y-2.5 text-body-sm text-ink-soft">
            <li>Post events, calendar &amp; cross-confirmation</li>
            <li>Free Get&nbsp;Tickets link-out</li>
            <li>1 active offer · basic stats</li>
            <li>Map, Tonight &amp; search listing</li>
          </ul>
        </div>

        {/* Venue Pro */}
        <div className="relative rounded-xl border-2 border-coral bg-surface p-7 shadow-lift">
          <span className="absolute -top-3 left-7 inline-flex items-center gap-1.5 rounded-pill bg-gold px-3 py-1 text-caption font-extrabold uppercase tracking-wide text-ink-deep">
            ⚓ Founding rate
          </span>
          <h2 className="text-h2 text-ink-deep">Venue Pro</h2>
          <p className="mt-1 text-body-sm text-ink-soft">For venues ready to fill the room</p>
          <div className="mt-5 flex items-baseline gap-2">
            <span className="font-display text-[40px] tracking-tight text-ink-deep">$14.99</span>
            <span className="text-lg font-semibold text-ink-mute line-through">$24.99</span>
            <span className="text-body-sm font-semibold text-ink-soft">/venue/mo</span>
          </div>
          <p className="mt-1.5 text-caption font-bold text-green">
            Locked for life for our founding venues
          </p>
          <Link
            href={proHref}
            className="mt-6 block rounded-lg bg-coral py-3 text-center text-body-sm font-bold text-white shadow-card hover:bg-coral-600 transition-colors"
          >
            Start Venue Pro
          </Link>
          <p className="mt-5 text-caption font-semibold uppercase tracking-wide text-ink-mute">
            Everything in Free, plus
          </p>
          <ul className="mt-3 space-y-2.5 text-body-sm text-ink-soft">
            <li>Unlimited offers &amp; event boosts</li>
            <li>GPS push to nearby fans (capped)</li>
            <li>Full analytics &amp; featured placement</li>
            <li>Multiple staff seats &amp; publishing tools</li>
          </ul>
        </div>
      </div>

      {/* À la carte + multi-venue */}
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div className="flex items-center gap-4 rounded-xl border border-gold/40 bg-gold-soft px-5 py-4">
          <span className="text-2xl">🚀</span>
          <div>
            <p className="text-body-sm font-bold text-gold-ink">One big night? Boost for $5</p>
            <p className="text-caption font-semibold text-gold-ink/80">No subscription — single event boost.</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-ink-line bg-surface px-5 py-4">
          <span className="text-2xl">🏨</span>
          <div>
            <p className="text-body-sm font-bold text-ink-deep">Multiple venues?</p>
            <p className="text-caption font-semibold text-ink-soft">$24.99 first + $12 each additional — no cliff.</p>
          </div>
        </div>
      </div>

      {/* Comparison table */}
      <h2 className="mt-14 text-h2 text-ink-deep">Compare every feature</h2>
      <div className="mt-5 overflow-hidden rounded-xl border border-ink-line bg-surface shadow-card">
        <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-ink-line bg-canvas px-5 py-3 text-caption font-bold uppercase tracking-wide text-ink-mute">
          <span>Feature</span>
          <span className="w-20 text-center">Free</span>
          <span className="w-24 text-center text-coral">Venue Pro</span>
        </div>
        {ROWS.map((row, i) => {
          const free = cell(FEATURE_MATRIX.free[row.key])
          const pro = cell(FEATURE_MATRIX.venue_pro[row.key])
          return (
            <div
              key={row.key}
              className={`grid grid-cols-[1fr_auto_auto] items-center gap-4 px-5 py-3.5 ${
                i < ROWS.length - 1 ? 'border-b border-ink-line' : ''
              }`}
            >
              <div>
                <p className="text-body-sm font-semibold text-ink">{row.label}</p>
                <p className="text-caption text-ink-mute">{row.blurb}</p>
              </div>
              <span className="w-20 text-center">
                <Check {...free} />
              </span>
              <span className="w-24 text-center">
                <Check {...pro} />
              </span>
            </div>
          )
        })}
      </div>

      {/* Mission strip */}
      <div className="mt-12 rounded-xl bg-ink-deep px-7 py-9 text-center text-white">
        <p className="mx-auto max-w-2xl text-lg font-medium leading-relaxed">
          Who&rsquo;s Playing started as a community for local live music. The mission is supporting
          local artists and staying sustainable — surplus funds the music, not shareholders.
        </p>
        <Link
          href="/for-venues"
          className="mt-6 inline-block rounded-lg bg-coral px-6 py-3 text-body-sm font-bold text-white shadow-card hover:bg-coral-600 transition-colors"
        >
          See how it works for venues
        </Link>
      </div>
    </div>
  )
}
