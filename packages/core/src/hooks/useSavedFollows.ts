import { useQuery } from '@tanstack/react-query'
import { useWhosPlayingClient } from '../provider'

export type SavedFollow = {
  type: 'venue' | 'artist' | 'band'
  id: string
  name: string
}

/**
 * The current user's follows, resolved to display names. Follows are
 * polymorphic (venue/artist/band by id), so we batch-fetch the names per type
 * and merge — the Saved screen shows real names instead of raw ids.
 */
export function useSavedFollows(userId: string | undefined) {
  const client = useWhosPlayingClient()
  const query = useQuery({
    queryKey: ['saved-follows', userId ?? null],
    enabled: !!userId,
    queryFn: async (): Promise<SavedFollow[]> => {
      const { data: rows, error } = await client
        .from('follows')
        .select('target_type, target_id')
        .eq('follower_user_id', userId as string)
      if (error) throw error

      const follows = (rows ?? []) as { target_type: SavedFollow['type']; target_id: string }[]
      const idsByType = {
        venue: follows.filter((f) => f.target_type === 'venue').map((f) => f.target_id),
        artist: follows.filter((f) => f.target_type === 'artist').map((f) => f.target_id),
        band: follows.filter((f) => f.target_type === 'band').map((f) => f.target_id),
      }

      const [venues, artists, bands] = await Promise.all([
        idsByType.venue.length
          ? client.from('venues').select('id, name').in('id', idsByType.venue)
          : Promise.resolve({ data: [] }),
        idsByType.artist.length
          ? client.from('artists').select('id, stage_name').in('id', idsByType.artist)
          : Promise.resolve({ data: [] }),
        idsByType.band.length
          ? client.from('bands').select('id, name').in('id', idsByType.band)
          : Promise.resolve({ data: [] }),
      ])

      const nameOf = new Map<string, string>()
      for (const v of (venues.data ?? []) as { id: string; name: string }[]) nameOf.set(v.id, v.name)
      for (const a of (artists.data ?? []) as { id: string; stage_name: string }[])
        nameOf.set(a.id, a.stage_name)
      for (const b of (bands.data ?? []) as { id: string; name: string }[]) nameOf.set(b.id, b.name)

      return follows.map((f) => ({
        type: f.target_type,
        id: f.target_id,
        name: nameOf.get(f.target_id) ?? 'Unknown',
      }))
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
