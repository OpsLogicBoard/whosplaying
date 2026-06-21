# Data model

Authoritative SQL lives in `supabase/migrations/`. This doc is the human-readable
map and the contract the **backend must satisfy to support the approved build**
(see [`MOBILE_APP.md`](./MOBILE_APP.md) for the screen→table mapping). All tables
have RLS enabled.

## Entity overview

```
auth.users ─1:1─ profiles ─*:*─ user_roles
                    │
        ┌───────────┼───────────────┐
        ▼           ▼               ▼
     artists      bands           venues ──*── venue_staff
        │      band_members          │
        └───────────┬────────────────┘     organizations ─*─ organization_members
                    ▼                            │
            event_performers ── events           ├── subscriptions ── plans
              (cross-confirm)     │  ├ event_saves│   └── entitlements / usage_events / feature_purchases
                                  │  ├ event_boosts│
            gig_listings ─ gig_bids│  ├ conflict_flags
                                  │  └ conversations ─ conversation_participants ─ messages
            offers ─ gps_push_campaigns        follows        device_tokens
```

## Roles

A user can hold any combination (`user_roles`):
- `artist` — owns one solo `artists` profile; may be in many `bands` via `band_members`
- `venue_owner` — owns one or more `venues` (under an `organization`)
- `venue_staff` — staff on a venue they don't own (`venue_staff`)
- `goer` — implicit default for everyone

Pro entities (artist/band/venue) drive the **pro persona** and the "Act as"
switcher. See [`MOBILE_APP.md`](./MOBILE_APP.md#persona--mode-model).

## Cross-confirmation (the invariant — never bypass)

An event is `confirmed` only when **both**:
1. The venue set `events.status = 'confirmed'`, **and**
2. Every `event_performers` row for that event has `status = 'confirmed'`.

`event_performers.status ∈ {invited, confirmed, declined}`;
`events.status ∈ {draft, proposed, confirmed, cancelled}`. If any party declines,
the event drops to `cancelled` (or back to `draft`). Enforced at the app layer;
RLS guarantees each party can only flip their own side. The UI must not show
"Confirmed · venue + artist" unless this holds.

## Discovery & social

- `events` (venue-hosted), `event_performers` (lineup + confirm state),
  `event_saves` (a goer's saved shows), `follows` (user → artist|band|venue).
- `venues.lat/lng` power the Map. b-tree on `(lat,lng)` for bounding-box queries
  (no PostGIS yet — switch later if real distance math is needed).

## Booking & gigs

- `gig_listings` = open gigs venues post; `gig_bids` = artist/band responses
  (`status ∈ pending|shortlisted|accepted|rejected|withdrawn`). Accepting a bid
  creates an `event` + an `invited` `event_performers` row — the bidder still
  confirms (same invariant).
- `conversations` (scoped to an `event` or `gig_listing`),
  `conversation_participants`, `messages` back the Messages tab. Realtime on
  `messages` filtered by `conversation_id`.
- `conflict_flags` — `venue_double_book` / `performer_double_book`, deduped by
  `(kind, event_a, event_b, subject_type, subject_id)`.

## Monetization (Venue Pro)

- `organizations` (one per venue owner; `is_founding` locks the rate) →
  `subscriptions` (`plan_key ∈ free|venue_pro|multi_venue`, Stripe ids,
  `venue_quantity`) → `plans` (feature matrix) → `entitlements`
  (per-org/per-venue feature grants, `source ∈ plan|purchase|comp`).
- `feature_purchases` — one-off boosts ($5) etc.; `usage_events`
  (`boost|gps_push|offer_redeemed|ticket_tap`) feed Billing usage + Analytics.
- Pro features: `offers` (redeemable deals — message, recurrence, days, time
  window, `on_event_pages`, `gps_radius_m`, `active`), `event_boosts`,
  `gps_push_campaigns` (capped: `message ≤140`, `radius_m 100–8000`).

## Notifications

`device_tokens` (ios/android/web) for push; `follows` drives fan-out when a new
event lands (`notify-followers` edge function). `audit_log` / `admin_users` back
the admin console.

## Create-event fields — shipped in `0018`

Migration `0018_create_event_fields.sql` (applied) closed the create-event
persistence gap, keeping discovery open:

1. **`events` columns:** `visibility` (`public|private`, default `public`),
   `setting` (`indoor|outdoor|patio`), `family_friendly`, `min_age`,
   `price_cents`. The events SELECT policy is split by role —
   `events_select_anon` (`visibility='public'`) and `events_select_auth`
   (`public` OR `is_event_participant(id)`) — so anon discovery stays open while
   private events are hidden from non-participants.
2. **`event_private_details`** (gig_rate, promoter_note, load_in_at,
   soundcheck_at, lineup_order) and **`event_participant_notes`** (per-user
   private notes), both RLS-scoped via `is_event_participant()` /
   `auth.uid()`. `createEvent` now persists visibility/setting/family/price.

**Remaining UI wiring:** the private gig-details inputs and per-participant notes
are static placeholders in `create-event.tsx` — bind them to the new tables.

## Standing security hardening (advisor WARNINGs — not blocking)

Tracked, **must preserve open public read**: tighten
`bands_insert_authenticated` (currently `WITH CHECK (true)`); review `anon`
EXECUTE on internal `SECURITY DEFINER` helpers (note: any helper used inside an
anon-applicable RLS policy must keep anon EXECUTE or the read breaks — see how
`0018` split the events policy so `is_event_participant` stays authenticated-only);
enable leaked-password protection; move `pg_trgm` out of `public`. No
ERROR-level advisories outstanding.

Everything else the approved screens need is present and live.
