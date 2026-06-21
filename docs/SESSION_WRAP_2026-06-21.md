# Session Wrap — 2026-06-21

Two themes today, both committed + pushed to `main` and verified live.

## 1. Migration 0017 applied (RLS recursion fix)
The staged `0017_fix_org_rls_recursion.sql` was applied to production
(`pakzhnwumihecyfcjfln`) after the org-side recursion stopped being dormant (a
live org + member now exists). All four membership predicates
(`is_org_member`/`is_org_manager`/`is_venue_member`/`is_venue_manager`) are now
`SECURITY DEFINER`; a simulated authenticated read of
organizations/organization_members/subscriptions returns rows with no `54001`.
**Unblocks** web billing, mobile `useEntitlements`, and venue-staff invites.

## 2. Mobile: reinstated the v2 prototype design across the app
The Expo app had been coded without many of the design treatments and whole
screens present in `docs/design/prototype.html`. Reinstated them page by page.
New shared module `apps/mobile/components/ui.tsx` (gradient CTA, scrim, status
pills, segmented control, toggle, lock-card, hat-card) on **expo-linear-gradient**.

**Goer screens — live data, higher fidelity:**
- Tonight: scrim + cover featured card, LIVE NOW pulse vs TONIGHT, rounded-22.
- Explore: coral-gradient active date cell.
- Map: faithful decorative ground + pins with real showtimes + styled sheet
  (real MapLibre still needs an EAS dev build).
- Saved: Following / Shows segmented control; Shows = upcoming confirmed events
  at followed venues, with date badges + mutable alert bells.
- Event detail: scrim hero w/ cover + share/heart nav, confirmation badge, info
  rows, Get tickets / Directions, real venue offer card w/ QR reveal, lineup
  avatars resolved from performers, About.

**You / profile deep-dive — live data:** gradient identity, Work/Play switch +
hint, fan view (find-people, Following/Saved stats, upgrade nudge), and a work
dashboard "acting as" the user's real owned venue with real Upcoming/Open-slot/
Bid counts, all hat cards, plan card, Preferences.

**New routes from the dashboard:**
- Live: `/messages` (+ thread — real conversations/messages/send), `/offers`
  (real venue offers + create), `/my-people` (real venue followers), `/billing`
  (bound to real entitlement state → Free today).
- Design-complete pending backend (as the prototype is, behind Work mode):
  `/plan`, `/analytics`, `/boost`, `/gps-push`, `/connections`, `/integrations`,
  `/suggested-follows`, `/invites`, `/promote`, `/public-profile`. Sample
  figures flagged; CTAs say "wiring in progress" rather than faking actions.

Intentionally mapped, not duplicated: the prototype's multi-entity "act as"
switcher and standalone public-profile *goer view* → the app already has real
per-entity detail pages (`/artist`, `/venue`, `/band`) and one entity per user.

typecheck + lint pass for `@whosplaying/mobile`; verified on the iOS simulator
(goer screens, event detail, You fan + work dashboard, navigation).

## Open / next
- Wire the Phase-B CTAs to real backends: Stripe checkout/portal (plan/billing),
  boost/GPS-push sends, analytics aggregation, social/calendar/publishing
  connections, suggested-follows import.
- Replace `useEntitlements` stub with the real query (now unblocked by 0017) so
  paywalls/lock-cards reflect true plan state.
- Native map (MapLibre, EAS dev build). Cross-confirmation accept/decline UI.
- Optional: swap the tab bar in Work mode (prototype behavior) — today Work is
  surfaced via the You dashboard.
