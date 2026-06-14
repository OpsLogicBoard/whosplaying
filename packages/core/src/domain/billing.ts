import { z } from 'zod'
import { Iso, Uuid } from './common'

// ── Organizations & membership (billing/management layer above venues) ──────
export const OrgMemberRole = z.enum(['owner', 'manager', 'staff'])
export type OrgMemberRole = z.infer<typeof OrgMemberRole>

export const Organization = z.object({
  id: Uuid,
  slug: z.string(),
  name: z.string().min(1).max(120),
  owner_user_id: Uuid,
  billing_email: z.string().email().nullable(),
  is_founding: z.boolean().default(false),
  created_at: Iso,
})
export type Organization = z.infer<typeof Organization>

export const OrganizationMember = z.object({
  organization_id: Uuid,
  user_id: Uuid,
  role: OrgMemberRole.default('staff'),
  invited_by: Uuid.nullable(),
  joined_at: Iso,
})
export type OrganizationMember = z.infer<typeof OrganizationMember>

// ── Plans & feature matrix ──────────────────────────────────────────────────
export const PlanKey = z.enum(['free', 'venue_pro', 'multi_venue'])
export type PlanKey = z.infer<typeof PlanKey>

/** A feature is either a flat boolean or a config object (caps/limits). */
export const FeatureValue = z.union([z.boolean(), z.record(z.unknown())])
export type FeatureValue = z.infer<typeof FeatureValue>

export const Plan = z.object({
  key: PlanKey,
  display_name: z.string(),
  feature_matrix: z.record(FeatureValue),
  updated_at: Iso,
})
export type Plan = z.infer<typeof Plan>

// ── Subscriptions ───────────────────────────────────────────────────────────
export const SubscriptionStatus = z.enum([
  'trialing',
  'active',
  'past_due',
  'canceled',
  'incomplete',
])
export type SubscriptionStatus = z.infer<typeof SubscriptionStatus>

export const Subscription = z.object({
  id: Uuid,
  organization_id: Uuid,
  plan_key: PlanKey.default('free'),
  status: SubscriptionStatus.default('active'),
  venue_quantity: z.number().int().min(1).default(1),
  current_period_end: Iso.nullable(),
  stripe_customer_id: z.string().nullable(),
  stripe_subscription_id: z.string().nullable(),
  created_at: Iso,
  updated_at: Iso,
})
export type Subscription = z.infer<typeof Subscription>

// ── Entitlements (derived per-(org, venue) cache) ───────────────────────────
export const EntitlementSource = z.enum(['plan', 'purchase', 'comp'])
export type EntitlementSource = z.infer<typeof EntitlementSource>

export const Entitlement = z.object({
  id: Uuid,
  organization_id: Uuid,
  venue_id: Uuid.nullable(),
  feature: z.string(),
  value: z.record(z.unknown()).default({}),
  source: EntitlementSource.default('plan'),
  expires_at: Iso.nullable(),
  created_at: Iso,
})
export type Entitlement = z.infer<typeof Entitlement>

// ── Usage & purchases ───────────────────────────────────────────────────────
export const UsageKind = z.enum(['boost', 'gps_push', 'offer_redeemed', 'ticket_tap'])
export type UsageKind = z.infer<typeof UsageKind>

export const UsageEvent = z.object({
  id: Uuid,
  organization_id: Uuid.nullable(),
  venue_id: Uuid.nullable(),
  kind: UsageKind,
  actor_user_id: Uuid.nullable(),
  metadata: z.record(z.unknown()).default({}),
  created_at: Iso,
})
export type UsageEvent = z.infer<typeof UsageEvent>

export const PurchaseStatus = z.enum(['pending', 'paid', 'refunded', 'failed'])
export type PurchaseStatus = z.infer<typeof PurchaseStatus>

export const FeaturePurchase = z.object({
  id: Uuid,
  organization_id: Uuid,
  venue_id: Uuid.nullable(),
  kind: UsageKind.default('boost'),
  amount_cents: z.number().int().nonnegative(),
  status: PurchaseStatus.default('pending'),
  stripe_payment_intent_id: z.string().nullable(),
  created_at: Iso,
})
export type FeaturePurchase = z.infer<typeof FeaturePurchase>
