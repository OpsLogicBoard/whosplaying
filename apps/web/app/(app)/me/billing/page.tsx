import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Card } from '@whosplaying/ui'
import { createServerSupabase } from '@/lib/supabase/server'
import { resolveActiveOrg, isOrgPro, planFeatureSummary } from '@/lib/org'
import { BillingActions } from './BillingActions'

export const metadata = { title: 'Billing & plan · Who’s Playing' }

export default async function BillingPage() {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/me/billing')

  const ctx = await resolveActiveOrg(supabase, user.id)

  // No org yet → the user hasn't created a venue. Billing lives on the org that
  // is auto-created with the first venue, so send them there first.
  if (!ctx) {
    return (
      <section>
        <Breadcrumb />
        <h1 className="font-display text-4xl mt-1">Billing &amp; plan</h1>
        <Card className="mt-6">
          <p className="text-ink">You don’t manage a venue yet.</p>
          <p className="text-sm text-ink-soft mt-1">
            Billing applies to a venue. Add your venue to set up a plan.
          </p>
          <Link
            href="/me/venues/new"
            className="mt-4 inline-block rounded-lg bg-coral px-5 py-3 font-semibold text-white shadow-card hover:bg-coral-600 transition-colors"
          >
            + Add your venue
          </Link>
        </Card>
      </section>
    )
  }

  const pro = isOrgPro(ctx)
  const features = planFeatureSummary(ctx)
  const founding = ctx.org.is_founding
  const sub = ctx.subscription
  const periodEnd = sub?.current_period_end
    ? new Date(sub.current_period_end).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  const planLabel = pro
    ? founding
      ? 'Venue Pro · Founding'
      : 'Venue Pro'
    : 'Free'

  return (
    <section>
      <Breadcrumb />
      <div className="mt-1 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl">Billing &amp; plan</h1>
          <p className="text-ink-soft mt-1">
            {ctx.org.name} · {ctx.venueCount} venue{ctx.venueCount === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      {/* Current plan */}
      <Card accent={pro ? 'coral' : 'none'} className="mt-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-mute">
              Current plan
            </p>
            <p className="font-display text-3xl text-ink mt-0.5">{planLabel}</p>
            {pro ? (
              <p className="text-sm text-ink-soft mt-1">
                {sub?.status === 'past_due'
                  ? 'Payment past due — update your card to keep Pro features.'
                  : periodEnd
                    ? `Renews ${periodEnd}`
                    : 'Active'}
                {sub && sub.venue_quantity > 1 ? ` · ${sub.venue_quantity} venues` : ''}
              </p>
            ) : (
              <p className="text-sm text-ink-soft mt-1">
                Free forever. Upgrade to unlock promotion &amp; analytics.
              </p>
            )}
          </div>
          {founding && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-ink-deep">
              ⚓ Founding
            </span>
          )}
        </div>

        <ul className="mt-5 grid gap-2 sm:grid-cols-2">
          {features.map((f) => (
            <li key={f.label} className="flex items-center gap-2 text-sm">
              <span
                className={f.on ? 'text-green' : 'text-ink-line'}
                aria-hidden="true"
              >
                {f.on ? '✓' : '○'}
              </span>
              <span className={f.on ? 'text-ink' : 'text-ink-mute'}>{f.label}</span>
            </li>
          ))}
        </ul>
      </Card>

      <BillingActions
        orgId={ctx.org.id}
        isPro={pro}
        canManage={ctx.role === 'owner' || ctx.role === 'manager'}
        showFounding={!pro && founding}
      />

      {!pro && (
        <p className="mt-4 text-sm text-ink-soft">
          Compare everything on the{' '}
          <Link href="/pricing" className="text-green-700 hover:text-green-900 font-medium">
            pricing page
          </Link>
          .
        </p>
      )}
    </section>
  )
}

function Breadcrumb() {
  return (
    <p className="text-sm text-ink-mute">
      <Link href="/me" className="hover:text-ink">
        ← Me
      </Link>
    </p>
  )
}
