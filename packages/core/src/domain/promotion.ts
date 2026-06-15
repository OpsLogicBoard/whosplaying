import { z } from 'zod'
import { Iso, Uuid } from './common'

// ── Event boosts (Pro, or a free venue's one-off $5 purchase) ───────────────
export const BoostSource = z.enum(['pro', 'purchase'])
export type BoostSource = z.infer<typeof BoostSource>

export const EventBoost = z.object({
  id: Uuid,
  event_id: Uuid,
  venue_id: Uuid,
  created_by: Uuid.nullable(),
  source: BoostSource.default('pro'),
  starts_at: Iso,
  ends_at: Iso,
  created_at: Iso,
})
export type EventBoost = z.infer<typeof EventBoost>

// ── GPS push campaigns (Pro-only, per-venue daily cap) ──────────────────────
export const GpsPushStatus = z.enum(['scheduled', 'sent', 'canceled'])
export type GpsPushStatus = z.infer<typeof GpsPushStatus>

export const GpsPushCampaign = z.object({
  id: Uuid,
  venue_id: Uuid,
  created_by: Uuid.nullable(),
  message: z.string().min(1).max(140),
  radius_m: z.number().int().min(100).max(8000),
  offer_id: Uuid.nullable(),
  event_id: Uuid.nullable(),
  scheduled_at: Iso.nullable(),
  sent_at: Iso.nullable(),
  status: GpsPushStatus.default('scheduled'),
  created_at: Iso,
})
export type GpsPushCampaign = z.infer<typeof GpsPushCampaign>
