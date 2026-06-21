import { useQuery } from '@tanstack/react-query'
import { venuesQ } from '@whosplaying/supabase'
import type { Venue } from '../domain/venue'
import { useWhosPlayingClient } from '../provider'

/** A single venue by id. */
export function useVenue(id: string | undefined) {
  const client = useWhosPlayingClient()
  const query = useQuery({
    queryKey: ['venue', id ?? null],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await venuesQ.getVenueById(client, id as string)
      if (error) throw error
      return (data ?? null) as unknown as Venue | null
    },
  })
  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: (query.error as Error | null) ?? null,
  }
}
