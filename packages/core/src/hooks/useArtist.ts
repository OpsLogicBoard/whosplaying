import { useQuery } from '@tanstack/react-query'
import { artistsQ } from '@whosplaying/supabase'
import type { Artist } from '../domain/artist'
import { useWhosPlayingClient } from '../provider'

/** A single artist by id. */
export function useArtist(id: string | undefined) {
  const client = useWhosPlayingClient()
  const query = useQuery({
    queryKey: ['artist', id ?? null],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await artistsQ.getArtistById(client, id as string)
      if (error) throw error
      return (data ?? null) as unknown as Artist | null
    },
  })
  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: (query.error as Error | null) ?? null,
  }
}

/** A single band by id, with its member artists joined. */
export function useBand(id: string | undefined) {
  const client = useWhosPlayingClient()
  const query = useQuery({
    queryKey: ['band', id ?? null],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await artistsQ.getBandById(client, id as string)
      if (error) throw error
      return data as unknown
    },
  })
  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: (query.error as Error | null) ?? null,
  }
}
