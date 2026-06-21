import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { followsQ } from '@whosplaying/supabase'
import type { Follow } from '../domain/social'
import { useWhosPlayingClient } from '../provider'

type FollowTarget = 'artist' | 'band' | 'venue'

/** The current user's follows, plus follow/unfollow mutations. */
export function useFollows(userId: string | undefined) {
  const client = useWhosPlayingClient()
  const qc = useQueryClient()
  const key = ['follows', userId ?? null]

  const query = useQuery({
    queryKey: key,
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await followsQ.listFollows(client, userId as string)
      if (error) throw error
      return (data ?? []) as unknown as Follow[]
    },
  })

  const followM = useMutation({
    mutationFn: async (t: { type: FollowTarget; id: string }) => {
      const { error } = await followsQ.follow(client, userId as string, t.type, t.id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })

  const unfollowM = useMutation({
    mutationFn: async (t: { type: FollowTarget; id: string }) => {
      const { error } = await followsQ.unfollow(client, t.type, t.id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })

  const follows = query.data ?? []
  return {
    data: follows,
    isLoading: query.isLoading,
    error: (query.error as Error | null) ?? null,
    isFollowing: (type: FollowTarget, id: string) =>
      follows.some((f) => f.target_type === type && f.target_id === id),
    follow: (type: FollowTarget, id: string) => followM.mutate({ type, id }),
    unfollow: (type: FollowTarget, id: string) => unfollowM.mutate({ type, id }),
  }
}
