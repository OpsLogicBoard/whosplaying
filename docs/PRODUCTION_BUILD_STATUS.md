# WhosPlaying — Production Build Status

**As of:** 2026-06-15 · **Branch:** `main` (through commit `ed77b7c`) · **DB:** live `whosplaying` project (`pakzhnwumihecyfcjfln`), test mode.

This is the durable record of what shipped in the production build phase (executing `docs/MONETIZATION_AND_BUILD_PLAN.md`). Companion: `docs/NEXT_SESSION_TODO.md` (what's next), `docs/SECURE_CREDENTIALS_ARCHITECTURE.md` (key vault).

---

## Status at a glance

| Phase | Area | State |
|---|---|---|
| A | Entitlement foundation (orgs, plans, subscriptions, entitlements) | ✅ Built · live · typed |
| B | Stripe billing (webhook, checkout, portal) | ✅ Built · deployed · **verified e2e** (test mode) |
| C (UI) | Pricing/billing/boost/GPS/analytics surfaces (mobile proto + web) | ✅ Designed + signed off (prototype + web pricing/landing) |
| C (backend) | Offers, boosts, GPS push — entitlement-gated RLS | ✅ Built · live · **each gate tested** |
| D | Admin console (analytics, sales, maintenance, audit) | ✅ Built (placeholder data until org/seed data exists) |
| — | Cross-confirmation invariant (DB-enforced) | ✅ Built · **verified** |
| — | Ticket-tap analytics + UTM | ✅ Built · verified |
| C→prod | Wire real app CTAs to the billing/offers/promotions helpers | ⏳ Not started (needs auth + org context; visual sign-off) |
| B | Go-live on the **live** Stripe key | ⏳ Pending user |
| E | GTM / SEO / Beaches seed | ⏳ Not started |

---

## Database — migrations applied to the live project

`0001`–`0004` predate this phase (base schema; were already applied). This phase added:

- **`0005_orgs_and_entitlements`** — `organizations` + `organization_members` (owner-transferable), `venues.organization_id` (auto-org trigger + backfill), `plans`, `subscriptions`, `entitlements`, `usage_events`, `feature_purchases`. Gates: `has_entitlement()`, `entitlement_limit()`, `recompute_entitlements()`.
- **`0006_admin_console`** — `admin_users`, `audit_log`, `is_platform_admin()`, `admin_log()`, `admin_platform_kpis()`, `admin_market_density()`.
- **`0007_grant_service_role`** — restore standard `service_role` grants (this project had auto-expose disabled; webhook writes were failing).
- **`0008_recompute_entitlements_on_venue`** — AFTER-INSERT trigger so free venues materialize entitlements.
- **`0009_offers`** — offers table + `offer_quota_ok()` (free=1 active, Pro unlimited) + `offer_gps_ok()` (GPS Pro-only).
- **`0010_boosts_and_gps`** — `event_boosts`, `gps_push_campaigns`; `venue_has_entitlement()`, `gps_push_cap_ok()` (per-venue daily cap).
- **`0011_cross_confirmation`** — `events_enforce_confirmation` + `performers_sync_event` triggers (bypass-proof consensus; "Lineup confirming" = `proposed`).
- **`0012_ticket_tap_tracking`** — `log_ticket_tap()` SECURITY DEFINER RPC.

Types regenerated from the live schema each time → `packages/supabase/src/types.ts` (real, not `any`).

---

## Verified behavior (run live against the test DB)

- **Billing:** Founding subscription → webhook reconciles → `plan_key=venue_pro`, `is_founding=true`, +5 Pro entitlements unlocked.
- **Offers:** free venue blocks the 2nd active offer + GPS distribution; Pro unlocks both.
- **Boosts/GPS:** free blocks both; Pro unlocks; 3rd GPS push/day blocked at cap 2.
- **Cross-confirmation:** publish → `proposed`; direct `confirmed` coerced to `proposed`; all performers confirmed → `confirmed`; new unconfirmed performer → back to `proposed`.
- **Ticket tap:** anon-callable RPC logs a `ticket_tap` usage_event with `event_id`.

Three latent bugs were caught by this live testing: missing `service_role` grants, free venues with zero entitlements, and Stripe relocating `current_period_end` to the line item.

---

## Edge functions (deployed to `pakzhnwumihecyfcjfln`)

- `stripe-webhook` (verify_jwt=false; reconciles subscriptions/entitlements, records boosts)
- `stripe-checkout` (Venue Pro / Founding / multi-venue / one-off boost)
- `stripe-portal` (self-serve billing)

Secrets set via `supabase secrets set` from `supabase/functions/.env` (gitignored). Test webhook endpoint registered. **Catalog (test mode):** created by `scripts/stripe-setup.mjs`; price IDs in `supabase/functions/.env.example`.

---

## Code map (what the next session calls)

- Entitlements: `@whosplaying/core` → `Feature`, `FEATURE_MATRIX`, `hasEntitlement`/`entitlementLimit`/`withinLimit`, `useEntitlements`.
- Billing: `@whosplaying/supabase` → `billingQ.createCheckoutSession` / `createPortalSession` / `logTicketTap` / `withTicketUtm`.
- Offers/promotions: `offersQ.*`, `promotionsQ.*`.
- Admin: `adminQ.*`.

---

## Known gaps / risks

- **UI is not wired to the backend** — web pricing "Start Venue Pro" → `/login`; mobile prototype CTAs are `alert()` stubs. All the helpers they need exist.
- **No authenticated web venue dashboard** (the web-primary management surface).
- **Admin console runs on placeholder data** until real org/seed data exists; swap to `adminQ` RPCs then.
- **Stripe is test-mode only.** Go-live needs the live key + re-running catalog/webhook setup.
- **Secrets hygiene** — see `docs/SECURE_CREDENTIALS_ARCHITECTURE.md`; some keys were exposed in a chat transcript and must be rotated.
