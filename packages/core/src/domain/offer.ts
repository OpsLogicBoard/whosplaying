import { z } from 'zod'
import { Iso, Uuid } from './common'

export const OfferRecurrence = z.enum(['one_time', 'weekly'])
export type OfferRecurrence = z.infer<typeof OfferRecurrence>

export const Offer = z.object({
  id: Uuid,
  venue_id: Uuid,
  created_by: Uuid,
  message: z.string().min(1).max(280),
  recurrence: OfferRecurrence.default('one_time'),
  days_of_week: z.array(z.number().int().min(0).max(6)).default([]),
  time_start: z.string().nullable(), // 'HH:MM' / 'HH:MM:SS'
  time_end: z.string().nullable(), // null = "Close"
  start_date: z.string(), // 'YYYY-MM-DD'
  expiration_date: z.string().nullable(),
  on_event_pages: z.boolean().default(true),
  gps_radius_m: z.number().int().min(100).max(8000).nullable(), // null = no GPS distribution (Pro-only)
  active: z.boolean().default(true),
  created_at: Iso,
})
export type Offer = z.infer<typeof Offer>

/** Derived display status (not stored) — matches the prototype's chips. */
export type OfferStatus = 'Active' | 'Scheduled' | 'Expiring' | 'Paused' | 'Expired'

export function offerStatus(o: Pick<Offer, 'active' | 'start_date' | 'expiration_date'>, now = new Date()): OfferStatus {
  const today = now.toISOString().slice(0, 10)
  if (o.expiration_date && o.expiration_date < today) return 'Expired'
  if (!o.active) return 'Paused'
  if (o.start_date > today) return 'Scheduled'
  if (o.expiration_date) {
    const days = (Date.parse(o.expiration_date) - Date.parse(today)) / 86_400_000
    if (days <= 3) return 'Expiring'
  }
  return 'Active'
}
