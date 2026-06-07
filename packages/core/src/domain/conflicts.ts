import { z } from 'zod'
import { Uuid } from './common'

export const ConflictKind = z.enum(['venue_double_book', 'performer_double_book'])
export type ConflictKind = z.infer<typeof ConflictKind>

/**
 * Raised by the conflict-detector edge function. References the two
 * overlapping events. Both sides see it; either side can clear by editing
 * one of the events.
 */
export const ConflictFlag = z.object({
  id: Uuid,
  kind: ConflictKind,
  event_a_id: Uuid,
  event_b_id: Uuid,
  subject_type: z.enum(['venue', 'artist', 'band']),
  subject_id: Uuid,
  detected_at: z.string().datetime({ offset: true }),
  resolved_at: z.string().datetime({ offset: true }).nullable(),
})
export type ConflictFlag = z.infer<typeof ConflictFlag>
