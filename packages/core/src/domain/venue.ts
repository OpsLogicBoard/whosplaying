import { z } from 'zod'
import { Slug, Url, Uuid } from './common'
import { Socials } from './artist'

export const Venue = z.object({
  id: Uuid,
  owner_user_id: Uuid.nullable(),
  slug: Slug,
  name: z.string().min(1).max(120),
  description: z.string().max(800).nullable(),
  address: z.string(),
  city: z.string(),
  region: z.string(),
  postal_code: z.string().nullable(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  capacity: z.number().int().positive().nullable(),
  hero_image_url: Url.nullable(),
  socials: Socials.default({}),
  ics_feed_url: Url.nullable(),
  is_verified: z.boolean().default(false),
  created_at: z.string().datetime({ offset: true }),
})
export type Venue = z.infer<typeof Venue>

export const VenueStaff = z.object({
  venue_id: Uuid,
  user_id: Uuid,
  role: z.enum(['manager', 'staff', 'booker']),
  can_answer_questions: z.boolean().default(true),
})
export type VenueStaff = z.infer<typeof VenueStaff>
