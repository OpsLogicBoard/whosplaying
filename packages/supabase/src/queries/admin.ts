import type { WhosPlayingClient } from '../client'
import type { Json } from '../types'

/** True if the signed-in user is a platform admin (gates the /admin route). */
export async function isPlatformAdmin(client: WhosPlayingClient) {
  return client.rpc('is_platform_admin')
}

/** Platform KPIs (users, venues, paying orgs, MRR, ticket taps). Admin-gated. */
export async function getPlatformKpis(client: WhosPlayingClient) {
  return client.rpc('admin_platform_kpis')
}

/** Per-market density — venues + confirmed events by region/city. Admin-gated. */
export async function getMarketDensity(client: WhosPlayingClient) {
  return client.rpc('admin_market_density')
}

export async function listAuditLog(client: WhosPlayingClient, limit = 100) {
  return client
    .from('audit_log')
    .select('*, actor:profiles(display_name)')
    .order('created_at', { ascending: false })
    .limit(limit)
}

/** Record an admin action (impersonation, comp, moderation). Admin-gated RPC. */
export async function adminLog(
  client: WhosPlayingClient,
  action: string,
  targetType?: string,
  targetId?: string,
  metadata: Json = {},
) {
  return client.rpc('admin_log', {
    _action: action,
    _target_type: targetType,
    _target_id: targetId,
    _metadata: metadata,
  })
}
