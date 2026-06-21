# Mobile App — Screens, Navigation & Data Map

The Expo app (`apps/mobile/`) is the reference implementation of the approved v2
design. This doc locks **what screens exist, how navigation works, and what
backend each screen uses** so structure and data stay aligned.

> Visual rules: [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) · Schema: [`DATA_MODEL.md`](./DATA_MODEL.md)

---

## Access model — open to all, login optional

**The app is not behind a login wall.** A logged-out guest opens straight to the
home/discovery experience (Tonight, Explore, Map, event pages, public profiles)
on public `anon`-readable data. `AuthGate` (`app/_layout.tsx`) never redirects a
guest to login — it only bounces a signed-in user off the auth screens.

Login is **optional** and unlocks personalization: saving shows, following,
"your taste", the You profile, and the full pro/Work suite. The You tab presents
a "Sign in or create account" invite for guests; personalize actions (save,
follow) prompt login at the point of use rather than gating the browse.

Backend: discovery tables are public SELECT for `anon`; writes/personal data are
RLS-restricted to the owner. Security hardening must never close public read.

## Persona + mode model

Two independent axes (`apps/mobile/lib/appMode.ts`, a **shared external store** —
all consumers, including the tab bar, read one source of truth):

- **persona**: `goer | pro`. A user is `pro` if they own a pro entity
  (venue/artist/band — derived from data) **or** opted in via the "Set up a pro
  profile" card. Goers never see Work mode.
- **mode**: `play | work` (persisted). Only pros toggle it, on the You screen.

A user holds many roles at once (`user_roles`): `artist`, `venue_owner`,
`venue_staff`, `goer`. Never model these as separate accounts.

## Navigation — the tab swap

The bottom tab bar **swaps with mode** (`apps/mobile/app/(tabs)/_layout.tsx`,
custom `WorkPlayTabBar`):

| Mode | Tabs |
|---|---|
| **Play** | Tonight · Explore · Map · Saved · You |
| **Work** | Calendar · Gigs · Create · Messages · You |

`You` is shared. All nine screens live in the `(tabs)` group; the custom tab bar
renders the set for the current mode.

**Redundancy rule:** a destination that is a Work tab (Calendar, Gigs, Create,
Messages) must **not** also appear as a card on the You/Work dashboard. The
dashboard holds only non-tab tools. Don't reintroduce duplicate entry points.

Pushed (stack) screens sit outside the tab group and use `BackHeader`.

---

## Screen inventory & data map

### Play (goer) tabs
| Screen | File | Reads / writes |
|---|---|---|
| Tonight | `(tabs)/tonight.tsx` | `events` (+ `venues`); save → `event_saves` |
| Explore | `(tabs)/explore.tsx` | `events` by date |
| Map | `(tabs)/map.tsx` | `events` + `venues.lat/lng` (Live-Pin markers) |
| Saved | `(tabs)/saved.tsx` | `follows`, `event_saves` |
| You | `(tabs)/you.tsx` | `profiles`, `user_roles`, derived `ownsVenue`; persona/mode |

### Work (pro) tabs
| Screen | File | Reads / writes |
|---|---|---|
| Calendar | `(tabs)/calendar.tsx` → `bookings/` | `events` + `event_performers` (status) |
| Gigs | `(tabs)/gigs.tsx` → `gig-board/` | `gig_listings`, `gig_bids` |
| Create | `(tabs)/create.tsx` → `create-event.tsx` | `events`, `event_performers` |
| Messages | `(tabs)/messages.tsx` | `conversations`, `conversation_participants`, `messages` |

### Pushed management screens (You/Work dashboard → cards)
| Screen | File | Reads / writes |
|---|---|---|
| Invites to play | `invites.tsx` | `event_performers` (invited) |
| Public profile (editor) | `public-profile.tsx` | `artists` / `bands` / `venues` |
| My people | `my-people.tsx` | `follows`, `band_members` |
| Offers & promos | `offers/` | `offers` |
| Promote a gig | `promote.tsx` | (flyer export — Phase B) |
| Analytics | `analytics.tsx` | `usage_events` (views, ticket taps) |
| Boost a show | `boost.tsx` | `event_boosts` |
| Push to nearby fans | `gps-push.tsx` | `gps_push_campaigns` |
| Plan / Venue Pro | `plan.tsx` | `plans`, `entitlements` |
| Billing | `billing.tsx` | `subscriptions`, `feature_purchases`, `usage_events` |
| Profiles (Act As) | `profiles.tsx` | `artists`/`bands`/`venues` via `proProfiles` |
| Connections / Integrations | `connections.tsx`, `integrations.tsx` | `device_tokens`, socials (Phase B) |
| Suggested follows | `suggested-follows.tsx` | social match → `follows` |
| Create gig / Create artist | `create-gig.tsx`, `create-artist.tsx` | `gig_listings`, `artists` |

### Shared / goer-facing
| Screen | File | Reads |
|---|---|---|
| Event detail | `event/[id].tsx` | `events`, `event_performers`, `offers` |
| Public profile (view) | `artist/[id]`, `band/[id]`, `venue/[id]` | entity + upcoming `events` |
| Auth | `(auth)/login.tsx`, `signup.tsx` | Supabase Auth (Google/Apple/email) |

---

## Cross-confirmation in the UI

Create event invites performers (`event_performers` `invited`). The event shows
**"Confirmed · venue + artist"** only when the venue set `events.status =
confirmed` **and** every `event_performers` row is `confirmed`. The UI must never
present an event as confirmed otherwise. See [`DATA_MODEL.md`](./DATA_MODEL.md).

## Known UI→backend gaps (Create event)

These fields render in `create-event.tsx` but are **not yet persisted**; wiring
them is the next backend pass (see [`DATA_MODEL.md`](./DATA_MODEL.md) §Gaps):
visibility (public/private), setting (indoor/outdoor/patio), family-friendly,
ticket price, and the private gig-details block (gig rate beyond
`event_performers.fee_cents`, load-in, sound check, lineup order, private notes).
