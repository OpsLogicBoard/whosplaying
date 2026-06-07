import { z } from 'zod'
import { Uuid } from './common'

export const FollowTarget = z.enum(['artist', 'band', 'venue'])
export type FollowTarget = z.infer<typeof FollowTarget>

export const Follow = z.object({
  follower_user_id: Uuid,
  target_type: FollowTarget,
  target_id: Uuid,
  created_at: z.string().datetime({ offset: true }),
})
export type Follow = z.infer<typeof Follow>

export const EventSave = z.object({
  user_id: Uuid,
  event_id: Uuid,
  created_at: z.string().datetime({ offset: true }),
})
export type EventSave = z.infer<typeof EventSave>
