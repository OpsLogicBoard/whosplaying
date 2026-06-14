import type { WhosPlayingClient } from '../client'

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
  metadata?: Record<string, unknown>
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
