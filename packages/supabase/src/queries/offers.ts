import type { WhosPlayingClient } from '../client'

/** Active offers for a venue (public — shown on event pages). */
export async function listActiveOffers(client: WhosPlayingClient, venueId: string) {
  return client
    .from('offers')
    .select('*')
    .eq('venue_id', venueId)
    .eq('active', true)
    .order('start_date', { ascending: true })
}

/** All offers for a venue (manager view: active, scheduled, paused, expired). */
export async function listVenueOffers(client: WhosPlayingClient, venueId: string) {
  return client
    .from('offers')
    .select('*')
    .eq('venue_id', venueId)
    .order('created_at', { ascending: false })
}

export type OfferInput = {
  venue_id: string
  created_by: string
  message: string
  recurrence?: 'one_time' | 'weekly'
  days_of_week?: number[]
  time_start?: string | null
  time_end?: string | null
  start_date?: string
  expiration_date?: string | null
  on_event_pages?: boolean
  /** Pro-only — RLS rejects a non-null radius without the gps_push entitlement. */
  gps_radius_m?: number | null
  active?: boolean
}

/**
 * Create an offer. RLS enforces entitlements: a free venue's 2nd active offer
 * and any GPS distribution are rejected (Postgres error), so surface a friendly
 * upgrade prompt on failure rather than treating it as a generic error.
 */
export async function createOffer(client: WhosPlayingClient, offer: OfferInput) {
  return client.from('offers').insert(offer).select().single()
}

export async function updateOffer(
  client: WhosPlayingClient,
  id: string,
  patch: Partial<OfferInput>,
) {
  return client.from('offers').update(patch).eq('id', id).select().single()
}

export async function deleteOffer(client: WhosPlayingClient, id: string) {
  return client.from('offers').delete().eq('id', id)
}
