import type { Entitlement, PlanKey, FeatureValue } from '../domain/billing'

/**
 * The entitlement system — code-side source of truth.
 *
 * `packages/core` AUTHORS the feature catalog and plan matrix; the `plans` DB
 * table mirrors it so Postgres `recompute_entitlements()` / `has_entitlement()`
 * can gate writes in RLS. Keep FEATURE_MATRIX below in sync with the seed in
 * supabase/migrations/0005_orgs_and_entitlements.sql — same keys, same shape.
 *
 * Pricing is DECIDED (docs/MONETIZATION_AND_BUILD_PLAN.md). Never gate the free
 * side: goers and artists are never billed; ticket link-out is never paywalled.
 */

/** Canonical feature keys. Use these constants, never string literals. */
export const Feature = {
  CREATE_EVENTS: 'create_events',
  PUBLIC_PAGE: 'public_page',
  MESSAGING: 'messaging',
  CALENDAR: 'calendar',
  /** "Get Tickets" link-out — ALWAYS free, every tier. */
  TICKET_LINKOUT: 'ticket_linkout',
  DISCOVERY_LISTING: 'discovery_listing',
  BASIC_STATS: 'basic_stats',
  /** Metered: free venues get { limit: 1 }, Pro unlimited. */
  OFFERS: 'offers',
  /** Metered: staff seats per venue. */
  STAFF_SEATS: 'staff_seats',
  /** Pro, or a free venue's one-off $5 purchase. */
  EVENT_BOOSTS: 'event_boosts',
  /** Pro-only. Carries { daily_cap } — server enforces per-goer caps too. */
  GPS_PUSH: 'gps_push',
  FULL_ANALYTICS: 'full_analytics',
  FEATURED_PLACEMENT: 'featured_placement',
  PUBLISHING_TOOLS: 'publishing_tools',
} as const

export type FeatureKey = (typeof Feature)[keyof typeof Feature]

/** Plan → feature matrix. Mirror of the `plans` table seed. */
export const FEATURE_MATRIX: Record<PlanKey, Record<string, FeatureValue>> = {
  free: {
    create_events: true,
    public_page: true,
    messaging: true,
    calendar: true,
    ticket_linkout: true,
    discovery_listing: true,
    basic_stats: true,
    offers: { limit: 1 },
    staff_seats: { limit: 2 },
    event_boosts: false,
    gps_push: false,
    full_analytics: false,
    featured_placement: false,
    publishing_tools: false,
  },
  venue_pro: {
    create_events: true,
    public_page: true,
    messaging: true,
    calendar: true,
    ticket_linkout: true,
    discovery_listing: true,
    basic_stats: true,
    offers: { limit: null },
    staff_seats: { limit: null },
    event_boosts: true,
    gps_push: { daily_cap: 2 },
    full_analytics: true,
    featured_placement: true,
    publishing_tools: true,
  },
  multi_venue: {
    create_events: true,
    public_page: true,
    messaging: true,
    calendar: true,
    ticket_linkout: true,
    discovery_listing: true,
    basic_stats: true,
    offers: { limit: null },
    staff_seats: { limit: null },
    event_boosts: true,
    gps_push: { daily_cap: 2 },
    full_analytics: true,
    featured_placement: true,
    publishing_tools: true,
  },
}

function isLive(e: Entitlement): boolean {
  return e.expires_at === null || new Date(e.expires_at).getTime() > Date.now()
}

/** A venue-scoped row matches its venue; an org-wide (venue_id null) row matches any venue. */
function matchesScope(e: Entitlement, venueId: string | null): boolean {
  return e.venue_id === null || e.venue_id === venueId
}

/**
 * The single client-side entitlement gate — mirrors SQL `has_entitlement()`.
 * Pass the entitlement rows already loaded for the org (see useEntitlements).
 */
export function hasEntitlement(
  entitlements: Entitlement[],
  feature: FeatureKey,
  venueId: string | null = null,
): boolean {
  return entitlements.some(
    (e) => e.feature === feature && matchesScope(e, venueId) && isLive(e),
  )
}

/**
 * Numeric limit for a metered feature (e.g. offers). `null` = unlimited;
 * `0` = no entitlement at all. Mirrors SQL `entitlement_limit()`.
 */
export function entitlementLimit(
  entitlements: Entitlement[],
  feature: FeatureKey,
  venueId: string | null = null,
): number | null {
  const matches = entitlements.filter(
    (e) => e.feature === feature && matchesScope(e, venueId) && isLive(e),
  )
  // Prefer a venue-scoped row over an org-wide one.
  const chosen = matches.find((e) => e.venue_id === venueId) ?? matches[0]
  if (chosen === undefined) return 0
  const limit = (chosen.value as Record<string, unknown>)?.limit
  return typeof limit === 'number' ? limit : null
}

/** True when a metered feature still has room (count < limit). Unlimited => always true. */
export function withinLimit(
  entitlements: Entitlement[],
  feature: FeatureKey,
  currentCount: number,
  venueId: string | null = null,
): boolean {
  const limit = entitlementLimit(entitlements, feature, venueId)
  if (limit === null) return hasEntitlement(entitlements, feature, venueId)
  return currentCount < limit
}
