import { z } from 'zod'

export const Uuid = z.string().uuid()
export const Slug = z
  .string()
  .min(2)
  .max(64)
  .regex(/^[a-z0-9-]+$/, 'lowercase letters, numbers, dashes only')
export const Url = z.string().url()
export const Iso = z.string().datetime({ offset: true })

export const Role = z.enum(['artist', 'venue_owner', 'venue_staff', 'goer'])
export type Role = z.infer<typeof Role>
