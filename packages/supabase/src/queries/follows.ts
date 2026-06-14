import type { WhosPlayingClient } from '../client'

export type FollowTarget = 'artist' | 'band' | 'venue'

export async function follow(
  client: WhosPlayingClient,
  follower_user_id: string,
  target_type: FollowTarget,
  target_id: string,
) {
  return client.from('follows').insert({ follower_user_id, target_type, target_id })
}

export async function unfollow(
  client: WhosPlayingClient,
  target_type: FollowTarget,
  target_id: string,
) {
  return client
    .from('follows')
    .delete()
    .eq('target_type', target_type)
    .eq('target_id', target_id)
}

export async function listFollows(client: WhosPlayingClient, userId: string) {
  return client.from('follows').select('*').eq('follower_user_id', userId)
}
