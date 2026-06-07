import type { WhosPlayingClient } from '../client'

export async function listOpenGigs(client: WhosPlayingClient) {
  return client
    .from('gig_listings')
    .select('*, venue:venues(name, city, slug)')
    .eq('status', 'open')
    .order('starts_at', { ascending: true })
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
