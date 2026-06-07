import { z } from 'zod'
import { Uuid } from './common'

export const Profile = z.object({
  id: Uuid,
  display_name: z.string().min(1).max(80),
  avatar_url: z.string().url().nullable(),
  home_city: z.string().nullable(),
  bio: z.string().max(500).nullable(),
  created_at: z.string().datetime({ offset: true }),
})
export type Profile = z.infer<typeof Profile>
