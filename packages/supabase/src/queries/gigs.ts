import type { WhosPlayingClient } from '../client'

export async function listOpenGigs(client: WhosPlayingClient) {
  return client
    .from('gig_listings')
    .select('*, venue:venues(name, city, slug)')
    .eq('status', 'open')
    .order('starts_at', { ascending: true })
}

export type NewGigInput = {
  venue_id: string
  title: string
  starts_at: string
  created_by: string
  pay_low_cents?: number | null
  pay_high_cents?: number | null
  requirements?: string | null
}

/** Post an open gig at the user's venue (RLS: is_venue_member). */
export async function createGig(client: WhosPlayingClient, input: NewGigInput) {
  return client
    .from('gig_listings')
    .insert({
      venue_id: input.venue_id,
      title: input.title,
      starts_at: input.starts_at,
      created_by: input.created_by,
      pay_low_cents: input.pay_low_cents ?? null,
      pay_high_cents: input.pay_high_cents ?? null,
      requirements: input.requirements ?? null,
      status: 'open',
    })
    .select('id')
    .single()
}

export async function createBid(
  client: WhosPlayingClient,
  input: {
    gig_listing_id: string
    bidder_type: 'artist' | 'band'
    bidder_id: string
    message?: string
    proposed_fee_cents?: number
  },
) {
  return client.from('gig_bids').insert(input).select().single()
}
