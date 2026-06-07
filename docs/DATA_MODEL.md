# Data model

Authoritative SQL lives in `supabase/migrations/0001_init_schema.sql`. This doc is the human-readable map.

## Core entities

```
auth.users ──1:1── profiles ──*:*── user_roles
                       │
              ┌────────┼─────────┐
              ▼        ▼         ▼
           artists   bands    venues
              │        │         │
        band_members  │         venue_staff
              │        │         │
              └────────┼─────────┘
                       ▼
                event_performers ────── events ◄── conflict_flags
                                          │
                                          ▼
                                  gig_listings ── gig_bids
```

## Roles

A user can hold any combination of:

- `artist` — owns one solo profile, may be a member of many bands
- `venue_owner` — owns one or more venues
- `venue_staff` — staff on a venue they don't own (e.g. answers customer questions)
- `goer` — implicit; default for everyone

## Cross-confirmation (the invariant)

An event is `confirmed` only when:
1. The venue has set `events.status = 'confirmed'`, **and**
2. Every row in `event_performers` for that event has `status = 'confirmed'`.

If any party declines, the venue is notified via `notify-followers` and the event drops to `cancelled` (or back to `draft` for editing).

This is enforced at the application layer; RLS guarantees only the right parties can flip their own side of the contract.

## Conflicts

`conflict-detector` runs nightly and on relevant inserts. For each new event it finds overlapping intervals on:
- the same venue → `kind = 'venue_double_book'`
- the same artist (via `event_performers.performer_type='artist'`) → `kind = 'performer_double_book'`
- the same band → likewise

Flags are deduped by `(kind, event_a_id, event_b_id, subject_type, subject_id)`. Either side can resolve by editing one of the events.

## Follows + alerts

`follows` is the join from a user to (artist|band|venue). When a new event lands and a follower exists, `notify-followers` fans out push + email.

## Gig board

`gig_listings` = open gigs venues post. `gig_bids` = artists' or bands' responses. A venue accepting a bid creates an `event` and an `event_performers` row in `invited` state — the bidder still needs to confirm to flip the event to confirmed (same invariant).
