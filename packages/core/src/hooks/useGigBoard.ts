import { useQuery } from '@tanstack/react-query'
import { gigsQ } from '@whosplaying/supabase'
import type { GigListing } from '../domain/gig'
import { useWhosPlayingClient } from '../provider'

/** Open gigs venues have posted (artists bid on these). */
export function useGigBoard() {
  const client = useWhosPlayingClient()
  const query = useQuery({
    queryKey: ['gig-board', 'open'],
    queryFn: async () => {
      const { data, error } = await gigsQ.listOpenGigs(client)
      if (error) throw error
      return (data ?? []) as unknown as GigListing[]
    },
  })
  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error: (query.error as Error | null) ?? null,
  }
}
