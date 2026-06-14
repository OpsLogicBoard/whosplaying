# WhosPlaying — Monetization, Admin & Production Build Plan

**Status:** Approved 2026-06-14. This document is the single source of truth for the next build phase. It supersedes ad-hoc pricing notes.
**Companion memory:** `~/.claude/projects/-Users-JW-whosplaying/memory/project_next_session_monetization.md`, `project_origin_market.md`.
**Kickoff prompt for the next session:** `docs/NEXT_SESSION_KICKOFF_PROMPT.md`.

---

## 1. Mission & economic frame

WhosPlaying began as a **Jacksonville Beach, FL** live-music social account. The app launches in **the Beaches** (Jax Beach / Neptune / Atlantic Beach), then greater Jacksonville. The goal is **supporting local artists + sustainability, not profit** — but it must cover operating costs.

- All-in opex at launch: **~$95–115/mo** (maps free under 25k MAU).
- **Break-even ≈ 6 paying venues** at the Founding rate — reachable in one beach town (20–40 live-music venues).
- Pricing optimizes for **adoption + goodwill**; surplus funds the mission.

---

## 2. The pricing model (final)

| Tier | Price | Who | Includes |
|---|---|---|---|
| **Free** | $0 forever | Goers, artists/bands, **venues (baseline)** | Goers/artists: everything. Venues: create events, public page, messaging, calendar, cross-confirmation, **free "Get Tickets" link-out**, map/Tonight/search listing, 1 active offer, basic stats |
| **Venue Pro** | **$24.99/venue/mo** (Founding **$14.99** locked for first ~10–15 Beaches venues) | Venues | Unlimited offers, event boosts, GPS push (capped), full analytics, featured placement, multiple staff seats, flyer/publishing tools |
| **Multi-venue add-on** | $24.99 first **+ $12/additional venue** | Promoters / multi-room | Venue Pro across N venues, linear pricing, no cliff |
| **Per-use à la carte** | Boost **$5** one-off | Free-tier venues | Single event boost. GPS push is **Pro-only** (spam control) |
| **Community** | sponsor flat $/mo; tip jar 0% take | Sponsors / fans | "Tonight at the Beaches" feed sponsor; artist tip jar |

**Hard rules:**
- Ticket link-out is **never paywalled** — it is discovery and feeds attribution data.
- GPS push always carries **hard frequency caps** (~1–2 pushes/goer/day across all venues) + goer mute + radius limits.
- Goers and artists are **never billed**.

---

## 3. Surfaces — who uses what

This is now a **three-surface product**. The web app is not an afterthought.

| Surface | Stack | Primary users | Role |
|---|---|---|---|
| **Mobile** | Expo / Expo Router | Goers, on-the-go artists | Discovery, follow/save, alerts, quick gig management |
| **Web** | Next.js 15 App Router | Venues/promoters, goers (SEO) | **Venue/promoter management + analytics + billing** (desktop is the better surface for this), public event pages (indexable → discovery growth), marketing/pricing pages |
| **Admin console** | Next.js (gated route in web app, **not** a subdomain — single-tenant rule) | Platform operators (you) | Usage analytics, sales pipeline, maintenance |

**Design principle:** goers are mobile-first; **venue management and analytics are web-first** (data-dense, keyboard-driven). Build paid-feature management once in shared logic, surface it richest on web.

---

## 4. Backend / data model (Supabase)

All new tables ship with **RLS + explicit GRANTs in the same migration** (CLAUDE.md hard rule). Use `set search_path = public` on helper functions.

### 4.1 Orgs & seats (retire single-login venues)
- `organizations` — billing/entity owner (a venue or a promoter that owns venues). Decision in session: extend existing `venue_staff` vs introduce `organizations` + `organization_members`. Recommended: **organizations** with members (roles: owner, manager, staff), **owner-transferable** — fixes hospitality turnover.
- Each venue belongs to an organization; promoters own multiple venues under one org.

### 4.2 Plans, subscriptions, entitlements
- `plans` — `free | venue_pro | multi_venue` + feature matrix (config lives in `packages/core`, mirrored to a table for RLS checks).
- `subscriptions` — org → plan, status, `is_founding` flag, venue quantity, current period, Stripe IDs.
- `entitlements` — derived feature flags per org/venue; single `hasEntitlement(feature)` helper shared web + mobile.
- `usage_events` — boosts, pushes, offer redemptions, ticket-link taps (powers per-use billing **and** analytics).
- `feature_purchases` — one-off boosts (Stripe Checkout one-time).

### 4.3 Paid features (productionize from prototype)
- `offers` (schema already specced in profile-architecture memory), `event_boosts`, `gps_push_campaigns` (+ server-side cap enforcement), `venue_analytics` views.

### 4.4 Billing (Stripe)
- Edge function `stripe-webhook` (one folder per function). Customers, subscriptions, founding coupon/price, multi-venue quantity pricing, one-off boost Checkout, Customer Portal for self-serve.
- Store nothing sensitive client-side; reconcile via webhook → `subscriptions`/`entitlements`.

### 4.5 Admin & analytics
- `admin_users` (or a super-admin role) — strictly gated, never exposed via normal RLS.
- Materialized views / scheduled rollups for platform metrics (MAU/DAU, events, confirmations, taps, offers, pushes, revenue, per-market density, cost signals).
- `audit_log` — every admin action (esp. impersonation, comps, moderation).

---

## 5. The admin console (the untouched piece)

A platform-operator surface, **web-only**, gated by admin role behind a non-discoverable route (e.g. `apps/web/app/admin`). Single-tenant — **no subdomain routing**.

### 5.1 Analytics / usage
- Platform health: MAU/DAU, retention, events posted, **cross-confirmation completion rate**, ticket-link taps, offers published/redeemed, GPS pushes sent (+ cap breaches).
- Revenue: MRR, trial→paid conversion, churn, plan mix, founding-venue count.
- **Per-market density** (Beaches vs inland) — the metric that gates expansion.
- **Cost monitoring** — MAU vs the 25k maps cliff; email/storage trend; margin per venue.

### 5.2 Sales
- Venue pipeline: leads → trial → paid; trial-day countdowns; the conversion-driver feature per venue.
- Founding-venue roster (the locked $14.99 cohort).
- Manual comps / discounts; outreach notes.
- **Support impersonation** ("view as venue") — audit-logged, time-boxed.

### 5.3 Maintenance
- Feature flags / kill switches.
- Content moderation (events, offers, profiles).
- User/venue/org management; ownership transfer.
- Broadcast announcements; system health; audit log viewer.

---

## 6. Build sequence (phased)

Everything hangs off the entitlement foundation — build it first.

- **Phase A — Foundation.** Org + membership model, plans/entitlements schema (+ RLS + GRANTs), `hasEntitlement` helper in `packages/core`, migrate existing venues into orgs.
- **Phase B — Billing.** Stripe Checkout + Customer Portal, subscriptions, Founding rate, multi-venue quantity pricing, one-off boosts, `stripe-webhook` edge function reconciling entitlements.
- **Phase C — Paid features, gated.** Productionize offers, boosts, GPS push (with caps), venue analytics — wired to entitlements, on **web (rich) + mobile**. Ticket link-out free + UTM + tap tracking.
- **Phase D — Admin console (web).** Analytics, sales pipeline, maintenance, audit log.
- **Phase E — Go-to-market.** Marketing/pricing pages, public indexable event pages (SEO), Beaches launch prep + seed flow.

**Cross-cutting (every phase):** RLS+GRANT per migration; `pnpm typecheck && pnpm lint` before commit; **visual approval in local preview before finalizing UI** (per feedback memory); never bypass cross-confirmation — use the "Lineup confirming" grace state so flaky artists don't starve the feed.

---

## 7. Open design decisions to resolve at session start

These need a decision before coding the relevant phase:

1. **Org model** — extend `venue_staff` vs new `organizations` + `organization_members`? (Recommended: organizations.)
2. **Billing granularity** — per-venue subscription rows vs one org subscription with venue *quantity*? (Affects multi-venue pricing impl.)
3. **Web venue dashboard scope** — full parity with mobile, or web-primary for management/analytics with mobile doing quick actions?
4. **Stripe UI** — Checkout + Customer Portal (fast, hosted) vs custom billing UI? (Recommended: hosted first.)
5. **Admin analytics** — build in-app dashboards vs pipe events to a tool (PostHog/Metabase) and embed? (Recommended: lightweight in-app + raw event export.)
6. **Founding rate mechanism** — Stripe coupon vs dedicated price ID + `is_founding` flag?

---

## 8. Frontend design choices to engage

- Upgrade/paywall surfaces: Work-dashboard upgrade card, feature-locked empty states, billing screen — consistent, friendly, **never dark-pattern** (mission brand).
- In-app + web **pricing page** using the v2 Live Pin brand (coral CTA, clean grounds — no spec boards on production pages).
- Productionized **offer manager, boost flow, GPS push composer, venue analytics** — richest on web.
- **Admin console** visual language: data-dense, utilitarian, clearly separate from the consumer brand.
- Respect brand rules in `CLAUDE.md` (compact header logo only; custom map style; no design-spec collage).
