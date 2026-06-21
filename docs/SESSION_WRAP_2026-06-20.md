# Session Wrap — 2026-06-20

Theme: **got the Expo mobile app actually running, then built the core
goer + venue-owner experience on live Supabase data.** Mobile-first per the
user's priority. Everything below is committed + pushed to `main` and verified
on the iOS simulator (Expo Go, iPhone 17).

## 1. Toolchain repair — the app had never bundled
A chain of Expo + pnpm issues, each fixed and verified by re-bundling:
NativeWind preset missing from the tailwind config; `nativewind` pinned to
`4.1.23` (+ `react-native-css-interop@0.1.22`) for Reanimated 3; metro
`disableHierarchicalLookup` dropped and `emptyModulePath` pinned (stray
`~/node_modules` — the CLAUDE.md gotcha is real); **`.npmrc` `node-linker=hoisted`**;
`react`/`react-dom` pinned `18.2.0` + `@types/react` `18.3.31`; direct deps
`@expo/vector-icons`/`@babel/runtime`/`react-native-css-interop` added;
`Wordmark.native.tsx` (react-native-svg) so the brand mark renders on Hermes.

## 2. Real data layer (replaced every stub hook)
`WhosPlayingProvider`/`useWhosPlayingClient` in `packages/core` feed the
platform client to the shared hooks. Implemented: `useEvents`/`useEvent`,
`useVenue`/`useArtist`/`useBand`, `useFollows`, `useSavedFollows`, `useGigBoard`,
`useMessages`, `useHostedEvents`. (`useEntitlements` stays stubbed — needs 0017.)

## 3. Screens + flows wired to live data (all simulator-verified)
- **Goer:** Tonight, Explore (date strip + search), Event detail (+ free
  ticket-tap), Venue/Artist/Band detail, Saved (follow loop, names resolved),
  You (real profile), Map (real event in the sheet; canvas still a MapLibre
  placeholder). Pull-to-refresh on the list screens.
- **Follow loop:** heart on venue/artist → Saved → You follow count.
- **Venue owner (Work mode):** Bookings (hosted shows + cross-confirm status),
  **create-event** (post a show → Bookings/Tonight), Gig Board + **post-a-gig**.
- **Onboarding:** **edit-profile**, **create-artist** (→ artist profile).

## 4. RLS recursion — found a second instance
While building, confirmed the org-RLS infinite recursion (the reason the billing
dashboard / any authenticated org read fails) has a **twin on the venue side**:
`is_venue_member`/`is_venue_manager` recurse via `venue_staff`'s own SELECT
policy — dormant only because `venue_staff` is empty. Both fixes are now in the
**staged `0017_fix_org_rls_recursion.sql`** (SECURITY DEFINER). **Still NOT
applied** — held for review. Apply it before: connecting the web billing
dashboard, reading org entitlements on mobile, or inviting venue staff.

## Open / next
- **Apply migration 0017** (after review) → unblocks billing + entitlements.
- Native map (MapLibre → needs a dev build, not Expo Go); messaging UI;
  notifications; band creation + linking performers to events (cross-confirm
  demo); artist bidding on gigs.
- Google OAuth isn't configured (the mobile "Continue with Google" dead-ends);
  email/password works. Set up the Google provider before relying on it.
- Test data is isolated under one test user — see `docs/TEST_DATA.md` and the
  memory `project_mockup_and_test_data`. Purge before launch.

Commits: see `main` from `2c3b350` (web billing) through `ce75134` (post-a-gig).
