import { z } from 'zod'
import { Uuid } from './common'
import { PerformerType } from './event'

export const GigStatus = z.enum(['open', 'filled', 'cancelled'])
export type GigStatus = z.infer<typeof GigStatus>

export const BidStatus = z.enum(['pending', 'shortlisted', 'accepted', 'rejected', 'withdrawn'])
export type BidStatus = z.infer<typeof BidStatus>

export const GigListing = z.object({
  id: Uuid,
  venue_id: Uuid,
  title: z.string().min(1).max(120),
  description: z.string().max(2000).nullable(),
  starts_at: z.string().datetime({ offset: true }),
  ends_at: z.string().datetime({ offset: true }).nullable(),
  pay_low_cents: z.number().int().min(0).nullable(),
  pay_high_cents: z.number().int().min(0).nullable(),
  requirements: z.string().max(1000).nullable(),
  status: GigStatus.default('open'),
  closes_at: z.string().datetime({ offset: true }).nullable(),
  created_by: Uuid,
  created_at: z.string().datetime({ offset: true }),
})
export type GigListing = z.infer<typeof GigListing>

export const GigBid = z.object({
  id: Uuid,
  gig_listing_id: Uuid,
  bidder_type: PerformerType,
  bidder_id: Uuid,
  message: z.string().max(800).nullable(),
  proposed_fee_cents: z.number().int().min(0).nullable(),
  status: BidStatus.default('pending'),
  created_at: z.string().datetime({ offset: true }),
})
export type GigBid = z.infer<typeof GigBid>
