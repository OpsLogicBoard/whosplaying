// Placeholder operator data for the build/visibility phase. In production these
// come from the admin-gated RPCs in @whosplaying/supabase (adminQ.getPlatformKpis,
// getMarketDensity, listAuditLog) — swapped in once a WhosPlaying Supabase
// project is connected. Numbers reflect a realistic early Beaches launch.

export const KPIS = {
  mau: 4280,
  dau: 612,
  total_venues: 22,
  paying_venues: 7,
  founding_venues: 7,
  mrr_cents: 7 * 1499, // all 7 on Founding $14.99
  trial_venues: 4,
  confirmed_events: 138,
  cross_confirm_rate: 0.84,
  ticket_taps_30d: 2130,
  churn_30d: 0.0,
}

export const MARKETS = [
  { region: 'FL', city: 'Jacksonville Beach', venues: 12, events: 86, paying: 5 },
  { region: 'FL', city: 'Neptune Beach', venues: 5, events: 28, paying: 1 },
  { region: 'FL', city: 'Atlantic Beach', venues: 4, events: 19, paying: 1 },
  { region: 'FL', city: 'Jacksonville (inland)', venues: 1, events: 5, paying: 0 },
]

// Maps free under 25k MAU. This is the cost cliff the console watches.
export const MAPS_CLIFF = { mau: 4280, limit: 25000 }

export const MAU_TREND = [2100, 2480, 2890, 3120, 3460, 3820, 4280]

export const PIPELINE = [
  { venue: 'Surfer the Bar', city: 'Jax Beach', stage: 'Founding', since: 'Mar 2026', driver: 'GPS push', plan: 'Venue Pro' },
  { venue: 'Lemon Bar', city: 'Neptune Beach', stage: 'Founding', since: 'Apr 2026', driver: 'Boosts', plan: 'Venue Pro' },
  { venue: 'Engine 15', city: 'Jax Beach', stage: 'Trial', since: '12 days left', driver: 'Analytics', plan: '—' },
  { venue: 'Whisky Jax', city: 'Jax Beach', stage: 'Trial', since: '5 days left', driver: 'Offers', plan: '—' },
  { venue: 'North Beach', city: 'Atlantic Beach', stage: 'Lead', since: 'Demo booked', driver: '—', plan: '—' },
  { venue: 'Pete’s Bar', city: 'Neptune Beach', stage: 'Lead', since: 'Reached out', driver: '—', plan: '—' },
]

export const FLAGS = [
  { key: 'gps_push', label: 'GPS proximity push', on: true, note: 'Hard-capped 2/goer/day' },
  { key: 'event_boosts', label: 'Event boosts', on: true, note: 'Pro + $5 à-la-carte' },
  { key: 'open_signups', label: 'Open venue self-signup', on: false, note: 'Beaches invite-only for now' },
  { key: 'tip_jar', label: 'Artist tip jar', on: false, note: 'Phase 2' },
]

export const MODERATION = [
  { type: 'Event', name: 'Late Night Reggae — The Pier', reason: 'Reported: wrong venue', age: '2h' },
  { type: 'Offer', name: '$1 shots til close', reason: 'Auto-flag: pricing', age: '6h' },
]

export const AUDIT = [
  { actor: 'james@', action: 'Comp granted', target: 'Engine 15 → 1 mo Pro', at: '10:42a' },
  { actor: 'james@', action: 'Impersonation start', target: 'Surfer the Bar', at: 'Yesterday' },
  { actor: 'james@', action: 'Flag toggled', target: 'open_signups → off', at: 'Jun 10' },
]
