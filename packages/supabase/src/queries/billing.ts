import type { WhosPlayingClient } from '../client'
import type { Json } from '../types'

/** All entitlement rows for an org — the input to hasEntitlement() in core. */
export async function listOrgEntitlements(client: WhosPlayingClient, orgId: string) {
  return client.from('entitlements').select('*').eq('organization_id', orgId)
}

/** Resolve a venue's owning org (entitlements are keyed by org). */
export async function getVenueOrgId(client: WhosPlayingClient, venueId: string) {
  return client.from('venues').select('id, organization_id').eq('id', venueId).single()
}

/** The org's current (non-canceled) subscription, if any. */
export async function getOrgSubscription(client: WhosPlayingClient, orgId: string) {
  return client
    .from('subscriptions')
    .select('*')
    .eq('organization_id', orgId)
    .neq('status', 'canceled')
    .maybeSingle()
}

/** Orgs the current user manages/belongs to (RLS scopes to membership). */
export async function listMyOrganizations(client: WhosPlayingClient) {
  return client.from('organizations').select('*').order('created_at', { ascending: true })
}

export async function listOrgMembers(client: WhosPlayingClient, orgId: string) {
  return client
    .from('organization_members')
    .select('*, profile:profiles(id, display_name, avatar_url)')
    .eq('organization_id', orgId)
}

export type UsageEventInput = {
  organizationId: string | null
  venueId?: string | null
  kind: 'boost' | 'gps_push' | 'offer_redeemed' | 'ticket_tap'
  metadata?: Json
}

/** Log a usage event (ticket tap, redemption, …). Powers per-use billing + analytics. */
export async function logUsageEvent(client: WhosPlayingClient, e: UsageEventInput) {
  return client.from('usage_events').insert({
    organization_id: e.organizationId,
    venue_id: e.venueId ?? null,
    kind: e.kind,
    metadata: e.metadata ?? {},
  })
}

export async function listPlans(client: WhosPlayingClient) {
  return client.from('plans').select('*')
}

// ── Checkout / Portal (invoke the Stripe edge functions) ────────────────────
export type CheckoutParams = {
  orgId: string
  successUrl: string
  cancelUrl: string
  /** 'subscription' (default) or 'boost' (one-off $5). */
  kind?: 'subscription' | 'boost'
  /** For subscriptions: 'venue_pro' (default) or 'founding'. */
  plan?: 'venue_pro' | 'founding'
  /** Additional venues beyond the first (multi-venue +$12 each). */
  extraVenues?: number
  /** For boosts. */
  venueId?: string
  eventId?: string
}

/** Create a hosted Checkout session; returns { url } to redirect to. */
export async function createCheckoutSession(client: WhosPlayingClient, params: CheckoutParams) {
  return client.functions.invoke<{ url: string }>('stripe-checkout', { body: params })
}

/** Create a Customer Portal session; returns { url } for self-serve billing. */
export async function createPortalSession(
  client: WhosPlayingClient,
  params: { orgId: string; returnUrl: string },
) {
  return client.functions.invoke<{ url: string }>('stripe-portal', { body: params })
}
