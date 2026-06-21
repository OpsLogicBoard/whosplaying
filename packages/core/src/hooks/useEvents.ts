import { useQuery } from '@tanstack/react-query'
import { eventsQ } from '@whosplaying/supabase'
import type { Event, EventPerformer } from '../domain/event'
import type { Venue } from '../domain/venue'
import { useWhosPlayingClient } from '../provider'

/** An event row with its venue and performer rows joined (see eventsQ select). */
export type EventWithRelations = Event & {
  venue: Venue | null
  performers: EventPerformer[]
}

type EventsFilter = {
  from?: Date
  to?: Date
  venueId?: string
  status?: Event['status']
}

/** List events (optionally filtered by date range / venue / status). */
export function useEvents(filter: EventsFilter = {}) {
  const client = useWhosPlayingClient()
  const key = [
    'events',
    filter.from?.toISOString() ?? null,
    filter.to?.toISOString() ?? null,
    filter.venueId ?? null,
    filter.status ?? null,
  ]
  const query = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await eventsQ.listEvents(client, filter)
      if (error) throw error
      return (data ?? []) as unknown as EventWithRelations[]
    },
  })
  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error: (query.error as Error | null) ?? null,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
  }
}

/** A single event by id, with venue + performers joined. */
export function useEvent(id: string | undefined) {
  const client = useWhosPlayingClient()
  const query = useQuery({
    queryKey: ['event', id ?? null],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await eventsQ.getEvent(client, id as string)
      if (error) throw error
      return (data ?? null) as unknown as EventWithRelations | null
    },
  })
  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: (query.error as Error | null) ?? null,
  }
}
