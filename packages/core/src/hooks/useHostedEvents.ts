import { useQuery } from '@tanstack/react-query'
import type { EventWithRelations } from './useEvents'
import { useWhosPlayingClient } from '../provider'

export type HostedEvents = {
  /** Upcoming events at venues the user owns. */
  events: EventWithRelations[]
  /** True when the user owns at least one venue (vs. just having no shows). */
  ownsVenue: boolean
}

/**
 * The signed-in user's "Work" view: upcoming shows at the venues they own.
 * Venues are publicly readable and events are filtered by venue id, so this
 * needs no org-level access.
 */
export function useHostedEvents(userId: string | undefined) {
  const client = useWhosPlayingClient()
  const query = useQuery({
    queryKey: ['hosted-events', userId ?? null],
    enabled: !!userId,
    queryFn: async (): Promise<HostedEvents> => {
      const { data: venues, error: vErr } = await client
        .from('venues')
        .select('id')
        .eq('owner_user_id', userId as string)
      if (vErr) throw vErr

      const venueIds = (venues ?? []).map((v: { id: string }) => v.id)
      if (venueIds.length === 0) return { events: [], ownsVenue: false }

      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)

      const { data: events, error: eErr } = await client
        .from('events')
        .select('*, venue:venues(*), performers:event_performers(*)')
        .in('venue_id', venueIds)
        .gte('starts_at', todayStart.toISOString())
        .order('starts_at', { ascending: true })
      if (eErr) throw eErr

      return { events: (events ?? []) as unknown as EventWithRelations[], ownsVenue: true }
    },
  })

  return {
    events: query.data?.events ?? [],
    ownsVenue: query.data?.ownsVenue ?? false,
    isLoading: query.isLoading,
    error: (query.error as Error | null) ?? null,
  }
}
