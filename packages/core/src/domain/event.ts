import { z } from 'zod'
import { Url, Uuid } from './common'

export const EventStatus = z.enum(['draft', 'proposed', 'confirmed', 'cancelled'])
export type EventStatus = z.infer<typeof EventStatus>

export const PerformerType = z.enum(['artist', 'band'])
export type PerformerType = z.infer<typeof PerformerType>

export const PerformerStatus = z.enum(['invited', 'confirmed', 'declined'])
export type PerformerStatus = z.infer<typeof PerformerStatus>

export const Event = z.object({
  id: Uuid,
  venue_id: Uuid,
  title: z.string().min(1).max(120),
  description: z.string().max(2000).nullable(),
  starts_at: z.string().datetime({ offset: true }),
  ends_at: z.string().datetime({ offset: true }).nullable(),
  cover_image_url: Url.nullable(),
  ticket_url: Url.nullable(),
  /** Special-event advertising flag — surfaces with coral accent + larger card */
  is_special: z.boolean().default(false),
  status: EventStatus.default('draft'),
  created_by: Uuid,
  created_at: z.string().datetime({ offset: true }),
})
export type Event = z.infer<typeof Event>

/**
 * Cross-confirmation join row. An event flips to status="confirmed" only when
 * both the venue and every named performer have status="confirmed". This is
 * the core invariant — see CLAUDE.md.
 */
export const EventPerformer = z.object({
  event_id: Uuid,
  performer_type: PerformerType,
  performer_id: Uuid,
  billing_order: z.number().int().min(0).default(0),
  status: PerformerStatus.default('invited'),
  fee_cents: z.number().int().min(0).nullable(),
})
export type EventPerformer = z.infer<typeof EventPerformer>
