import type { WhosPlayingClient } from '../client'

export type EventFilter = {
  from?: Date
  to?: Date
  venueId?: string
  status?: 'draft' | 'proposed' | 'confirmed' | 'cancelled'
}

export async function listEvents(client: WhosPlayingClient, filter: EventFilter = {}) {
  let q = client.from('events').select('*, venue:venues(*), performers:event_performers(*)')
  if (filter.from) q = q.gte('starts_at', filter.from.toISOString())
  if (filter.to) q = q.lte('starts_at', filter.to.toISOString())
  if (filter.venueId) q = q.eq('venue_id', filter.venueId)
  if (filter.status) q = q.eq('status', filter.status)
  return q.order('starts_at', { ascending: true })
}

export async function getEvent(client: WhosPlayingClient, id: string) {
  return client
    .from('events')
    .select('*, venue:venues(*), performers:event_performers(*)')
    .eq('id', id)
    .single()
}

export type NewEventInput = {
  venue_id: string
  title: string
  starts_at: string
  created_by: string
  description?: string | null
  ticket_url?: string | null
}

/**
 * Create a venue event. Inserted as 'confirmed'; the cross-confirmation trigger
 * coerces it to 'proposed' if any named performer hasn't confirmed (a venue-only
 * event with no performers stays 'confirmed').
 */
export async function createEvent(client: WhosPlayingClient, input: NewEventInput) {
  return client
    .from('events')
    .insert({
      venue_id: input.venue_id,
      title: input.title,
      starts_at: input.starts_at,
      created_by: input.created_by,
      description: input.description ?? null,
      ticket_url: input.ticket_url ?? null,
      status: 'confirmed',
    })
    .select('id')
    .single()
}
