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

## Launch-prep checklist (do before any real-user marketing)

- **Supabase Custom Domain** ($10/mo Pro feature). Switches the OAuth
  consent screen, email From:, and password-reset links from
  `pakzhnwumihecyfcjfln.supabase.co` → `auth.whosplaying.live`. Right
  now Google's consent dialog shows the raw Supabase host which leaks
  backend infrastructure to end users.
- **Google OAuth App Verification.** Submit Privacy Policy + Terms +
  homepage URLs (all on `whosplaying.live`) to Google for review. After
  approval, "Sign in to Who's Playing" displays prominently instead of
  the Supabase URL.
- **Custom SMTP.** Required to edit Supabase email templates (magic
  link recovery, email confirmation). Resend / SendGrid / Postmark.
- **Apple Sign-In.** Required by App Store rules once Google sign-in
  exists. Land alongside iOS submission when Apple Developer account is
  active.
- **Tighten the 3 `RLS Policy Always True` warnings** flagged by
  Supabase Security Advisor (gig_bids, conflict_flags, bands update
  policies use `with check (true)` — a bidder could mark their own bid
  accepted).

See `CLAUDE.md` for project conventions.
