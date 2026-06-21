# Continuation Handoff — WhosPlaying (as of 2026-06-21)

Read this first if you're a new session picking up the build. It's self-contained:
everything you need to continue without the prior conversation.

Also read, in order: `CLAUDE.md`, `docs/SESSION_WRAP_2026-06-20.md`,
`docs/TEST_DATA.md`, and memory `project_mobile_app_functional`.

---

## TL;DR state

The **Expo mobile app now builds and runs** (it never bundled before) and the
**core goer + venue-owner experience is wired to live Supabase data**. 14 commits
shipped to `main` on 2026-06-20, each verified on the iOS simulator. The mobile
app is the priority (per the user).

**Do not touch** `docs/design/` or the `whosplaying-mockup.vercel.app` Vercel
project — that static mockup is the user's representation surface, kept separate
from the real app.

---

## How to run + verify (no terminal asks to the user — you run it)

- **Launch the app:** `pnpm --filter @whosplaying/mobile exec expo start --ios`
  (background it). It boots Expo Go on an iPhone simulator. Metro Fast Refresh is
  on; `Cmd+R` in the simulator reloads after edits.
- **Verify visually** via the `computer-use` MCP (request access to "Simulator").
  Typing into iOS fields is flaky — **paste via clipboard** (`write_clipboard` +
  `cmd+a` + `cmd+v`); a single `cmd+v` is enough (don't double-paste).
- **Test login (email/password):** `wp-billingtest@example.com` / `TestVenue123!`
  This user owns the test venue **"The Test Tap Room"** and is a venue owner, so
  Work-mode surfaces (Bookings, create-event, gig board) show real data.
- **Google OAuth is NOT configured** — "Continue with Google" dead-ends. Use
  email/password. (Setting up Google = Google Cloud OAuth client + Supabase Auth
  dashboard; can't be done from code.)
- Gate before commit: `pnpm typecheck && pnpm lint` (all 5 workspaces must pass).
  Commit + push to `main` per `CLAUDE.md`.

## Supabase

- Project ref `pakzhnwumihecyfcjfln`. Reach it via the project-scoped MCP
  connector (`apply_migration` / `execute_sql` / `get_advisors`). Production
  writes (seeding, schema) are approval-gated — ask the user first.

---

## ⚠️ Blocking item: migration 0017 is staged, NOT applied

`supabase/migrations/0017_fix_org_rls_recursion.sql` fixes **infinite RLS
recursion** in the org predicates (`is_org_member`/`is_org_manager`) AND the
venue predicates (`is_venue_member`/`is_venue_manager`) — both recurse via their
own table's SELECT policy once a membership/staff row exists (the venue one is
dormant only because `venue_staff` is empty). The user is **reviewing it; do not
apply without explicit OK.**

Until applied, these stay blocked: the **web billing dashboard** (`/me/billing`
recurses), **`useEntitlements`** on mobile, and **inviting venue staff**. Apply
0017 before doing any of those.

---

## What's done (mobile, verified)

- **Data layer:** `WhosPlayingProvider` + real hooks in `packages/core/src/hooks`
  (`useEvents`, `useVenue`/`useArtist`/`useBand`, `useFollows`,
  `useSavedFollows`, `useGigBoard`, `useMessages`, `useHostedEvents`).
  `useEntitlements` is still a stub (needs 0017).
- **Goer:** Tonight, Explore (date strip + search), Event detail (+ free
  ticket-tap), Venue/Artist/Band detail, Saved (follow loop, names resolved),
  You (real profile), Map (real event in the sheet only). Pull-to-refresh on lists.
- **Follow loop:** heart on venue/artist → Saved → You follow count.
- **Venue owner (Work mode):** Bookings (hosted shows + cross-confirm status),
  create-event, Gig Board + post-a-gig.
- **Onboarding:** edit-profile, create-artist (→ artist profile).
- **Web:** `/me/billing` dashboard + auth/org context (`apps/web/lib/org.ts`)
  exist but are **0017-blocked**. Pricing CTAs are auth-aware.

## What's NOT done / next steps (rough priority)

1. **After user OK: apply 0017**, regenerate types, then wire the **web venue
   dashboard + billing** (`createCheckoutSession`/`createPortalSession` are built
   and deployed in test mode; CTAs need connecting) and **`useEntitlements`** so
   mobile paywalls work.
2. **Native map** — `apps/mobile/app/(tabs)/map.tsx` is a placeholder. A real map
   needs MapLibre/Mapbox, which is **not Expo Go compatible** → requires an EAS
   dev build. Decide on that before building it.
3. **Cross-confirmation demo** — link performers to events (`event_performers`)
   so an event can sit in the "Lineup confirming" state; build the performer's
   accept/decline. Backend trigger already enforces the invariant.
4. **Artist bidding** on gigs (`gigsQ.createBid` exists), **band creation +
   member linking**, **messaging UI** (`useMessages` is wired; no screen yet),
   **notifications** (needs a data model).
5. **Google OAuth setup** (dashboard/console work — guide the user).
6. **Seed/GTM** and purge test data before launch (`docs/TEST_DATA.md`).

## Gotchas a new session will hit

- Expo + pnpm required several fixes (see `SESSION_WRAP_2026-06-20.md` §1): the
  `.npmrc node-linker=hoisted`, React pinned `18.2.0`, `@types/react` `18.3.31`,
  metro `emptyModulePath` pinned around a stale `~/node_modules`. Don't undo these.
- Shared brand components that use SVG need a `.native.tsx` variant
  (react-native-svg) — see `packages/ui/src/brand/Wordmark.native.tsx`. `LogoMark`
  is still DOM-only (not yet used on mobile).
- `expo-router` typed routes reject fully-dynamic `router.push(\`/\${a}/\${b}\`)` —
  branch on the literal route segment instead.

---

## Copy-paste kickoff prompt

```
Continue the WhosPlaying build (mobile is the priority). Read first:
docs/CONTINUATION_2026-06-21.md, then CLAUDE.md and memory
project_mobile_app_functional + project_mockup_and_test_data.

The Expo app builds and runs; the core goer + venue-owner flows are wired to
live Supabase and verified on the simulator. Migration 0017 (RLS recursion fix)
is STAGED, NOT APPLIED — do not apply without my OK. Never touch docs/design or
the whosplaying-mockup Vercel project. Run the app yourself
(pnpm --filter @whosplaying/mobile exec expo start --ios), verify changes on the
simulator (sign in wp-billingtest@example.com / TestVenue123!, paste into fields
via clipboard), typecheck+lint before each commit, push to main.

Start by telling me the top 2-3 next steps from the handoff and which you'd do
first.
```
