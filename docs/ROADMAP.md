# Roadmap

This scaffold is **Phase 0**. Folders, types, screens, and RLS are in place — nothing is wired to live data yet.

## Phase 1 — Walking skeleton

- Magic-link auth (mobile + web)
- Real `events` rendering from Supabase
- Profile setup wizard (pick your hats)
- Venue + artist + band creation forms
- Event creation form with performer invites
- Notifications stub firing on event creation

## Phase 2 — Cross-confirmation works

- `event_performers` UI on both sides (venue invites, performer confirms/declines)
- Status flip enforced
- Conflict detector deployed + surfaced
- DMs (Supabase Realtime channels)

## Phase 3 — Discovery + alerts

- Master calendar with filters (city, genre, date range)
- Map view (MapLibre with brand style)
- Follow + save + alerts (expo-notifications + web-push)
- Public share pages with OG images (`/share/event/[id]`)
- ICS export feeds for artists & venues

## Phase 4 — Gig board

- Open gigs + bidding
- Venue shortlist + accept → creates event invitation
- Pay-range filters

## Phase 5 — Native calendar sync, special events, store launch

- expo-calendar bridge + Google Calendar OAuth on web
- Special-event advertising surface
- iOS App Store + Play Store submission

See `CLAUDE.md` for project conventions.
