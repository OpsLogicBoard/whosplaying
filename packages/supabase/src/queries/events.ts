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
