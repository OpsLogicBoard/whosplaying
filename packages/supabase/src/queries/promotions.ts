import type { WhosPlayingClient } from '../client'

// ── Event boosts ────────────────────────────────────────────────────────────
/** Currently-live boosts for a venue (drives top-of-Tonight + map highlight). */
export async function listActiveBoosts(client: WhosPlayingClient, venueId: string) {
  return client
    .from('event_boosts')
    .select('*')
    .eq('venue_id', venueId)
    .gt('ends_at', new Date().toISOString())
}

/**
 * Create a boost. RLS requires the Pro event_boosts entitlement — a free
 * venue's boost is created server-side by the Stripe webhook after the one-off
 * $5 purchase, so a client insert here failing means "upgrade or buy a boost".
 */
export async function createBoost(
  client: WhosPlayingClient,
  boost: { event_id: string; venue_id: string; created_by: string; ends_at: string; starts_at?: string },
) {
  return client.from('event_boosts').insert({ source: 'pro', ...boost }).select().single()
}

// ── GPS push campaigns ──────────────────────────────────────────────────────
export async function listGpsPushCampaigns(client: WhosPlayingClient, venueId: string) {
  return client
    .from('gps_push_campaigns')
    .select('*')
    .eq('venue_id', venueId)
    .order('created_at', { ascending: false })
}

/**
 * Create a GPS push. RLS enforces gps_push_cap_ok(): Pro-only and within the
 * per-venue daily cap — surface the cap/upgrade message on rejection.
 */
export async function createGpsPush(
  client: WhosPlayingClient,
  campaign: {
    venue_id: string
    created_by: string
    message: string
    radius_m: number
    offer_id?: string | null
    event_id?: string | null
    scheduled_at?: string | null
  },
) {
  return client.from('gps_push_campaigns').insert(campaign).select().single()
}
