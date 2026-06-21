import type { Entitlement, Organization, Subscription } from '@whosplaying/core'
import { hasEntitlement, entitlementLimit, Feature } from '@whosplaying/core'
import type { createServerSupabase } from './supabase/server'

type ServerClient = Awaited<ReturnType<typeof createServerSupabase>>

export type ActiveOrgContext = {
  org: Organization
  /** Active (non-canceled) subscription, or null for a free org. */
  subscription: Subscription | null
  /** All live entitlement rows for the org (org-wide + venue-scoped). */
  entitlements: Entitlement[]
  /** The user's role in this org. */
  role: 'owner' | 'manager' | 'staff'
  /** Number of venues the org owns. */
  venueCount: number
}

/**
 * Resolve the signed-in user's "active" org: their membership row → the org it
 * points at, plus that org's subscription + entitlements. Single-tenant app, so
 * a user usually has exactly one org (auto-created with their first venue). When
 * they belong to several, prefer the one they OWN, else the oldest.
 *
 * Returns null when the user has no org yet (no venue created) — callers should
 * prompt the user to add a venue first.
 */
export async function resolveActiveOrg(
  supabase: ServerClient,
  userId: string,
): Promise<ActiveOrgContext | null> {
  const { data: memberships } = await supabase
    .from('organization_members')
    .select('organization_id, role, organization:organizations(*)')
    .eq('user_id', userId)

  type MemberRow = { role: ActiveOrgContext['role']; organization: Organization | null }
  const rows = ((memberships ?? []) as unknown as MemberRow[]).filter(
    (m): m is MemberRow & { organization: Organization } => m.organization != null,
  )
  if (rows.length === 0) return null

  // Prefer an org the user owns; otherwise the oldest joined.
  const chosen =
    rows.find((m) => m.role === 'owner') ??
    [...rows].sort((a, b) =>
      a.organization.created_at < b.organization.created_at ? -1 : 1,
    )[0]
  if (!chosen) return null

  const org = chosen.organization
  const role = chosen.role

  const [{ data: subscription }, { data: entitlements }, { count: venueCount }] =
    await Promise.all([
      supabase
        .from('subscriptions')
        .select('*')
        .eq('organization_id', org.id)
        .neq('status', 'canceled')
        .maybeSingle(),
      supabase.from('entitlements').select('*').eq('organization_id', org.id),
      supabase
        .from('venues')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', org.id),
    ])

  return {
    org,
    subscription: (subscription as Subscription | null) ?? null,
    entitlements: (entitlements as Entitlement[] | null) ?? [],
    role,
    venueCount: venueCount ?? 0,
  }
}

/** Convenience: is the org on a paid (Pro) plan right now? */
export function isOrgPro(ctx: ActiveOrgContext): boolean {
  const key = ctx.subscription?.plan_key
  return key === 'venue_pro' || key === 'multi_venue'
}

/** A friendly, ordered summary of what the org's plan unlocks, for the UI. */
export function planFeatureSummary(ctx: ActiveOrgContext): { label: string; on: boolean }[] {
  const ents = ctx.entitlements
  const offerLimit = entitlementLimit(ents, Feature.OFFERS)
  return [
    { label: 'Post events & cross-confirmation', on: hasEntitlement(ents, Feature.CREATE_EVENTS) },
    { label: 'Free “Get Tickets” link-out', on: hasEntitlement(ents, Feature.TICKET_LINKOUT) },
    {
      label:
        offerLimit === null
          ? 'Unlimited redeemable offers'
          : `${offerLimit} active offer${offerLimit === 1 ? '' : 's'}`,
      on: hasEntitlement(ents, Feature.OFFERS),
    },
    { label: 'Event boosts', on: hasEntitlement(ents, Feature.EVENT_BOOSTS) },
    { label: 'GPS push to nearby fans', on: hasEntitlement(ents, Feature.GPS_PUSH) },
    { label: 'Full analytics', on: hasEntitlement(ents, Feature.FULL_ANALYTICS) },
    { label: 'Featured placement', on: hasEntitlement(ents, Feature.FEATURED_PLACEMENT) },
  ]
}
