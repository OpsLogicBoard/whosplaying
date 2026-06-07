import { z } from 'zod'
import { Slug, Url, Uuid } from './common'

export const Socials = z.object({
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  tiktok: z.string().optional(),
  spotify: z.string().optional(),
  bandcamp: z.string().optional(),
  website: Url.optional(),
})
export type Socials = z.infer<typeof Socials>

export const Artist = z.object({
  id: Uuid,
  owner_user_id: Uuid,
  slug: Slug,
  stage_name: z.string().min(1).max(80),
  bio: z.string().max(800).nullable(),
  genres: z.array(z.string()).default([]),
  home_city: z.string().nullable(),
  hero_image_url: Url.nullable(),
  socials: Socials.default({}),
  created_at: z.string().datetime({ offset: true }),
})
export type Artist = z.infer<typeof Artist>

export const Band = z.object({
  id: Uuid,
  slug: Slug,
  name: z.string().min(1).max(80),
  bio: z.string().max(800).nullable(),
  genres: z.array(z.string()).default([]),
  home_city: z.string().nullable(),
  hero_image_url: Url.nullable(),
  socials: Socials.default({}),
  created_at: z.string().datetime({ offset: true }),
})
export type Band = z.infer<typeof Band>

export const BandMember = z.object({
  band_id: Uuid,
  artist_id: Uuid,
  role: z.string().nullable(), // "lead vocals", "drums", etc.
  is_admin: z.boolean().default(false),
})
export type BandMember = z.infer<typeof BandMember>
