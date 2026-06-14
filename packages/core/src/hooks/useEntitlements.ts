import type { Entitlement } from '../domain/billing'
import {
  hasEntitlement,
  entitlementLimit,
  withinLimit,
  type FeatureKey,
} from '../entitlements'

/**
 * STUB — wire to @whosplaying/supabase `listOrgEntitlements` + react-query.
 * Returns the loaded rows plus the gate bound to them, so consumers call
 * `hasFeature(Feature.GPS_PUSH, venueId)` without re-importing helpers.
 */
export function useEntitlements(_orgId?: string) {
  const entitlements: Entitlement[] = []
  return {
    entitlements,
    isLoading: false,
    error: null as Error | null,
    hasFeature: (feature: FeatureKey, venueId: string | null = null) =>
      hasEntitlement(entitlements, feature, venueId),
    limitFor: (feature: FeatureKey, venueId: string | null = null) =>
      entitlementLimit(entitlements, feature, venueId),
    withinLimit: (feature: FeatureKey, count: number, venueId: string | null = null) =>
      withinLimit(entitlements, feature, count, venueId),
  }
}
