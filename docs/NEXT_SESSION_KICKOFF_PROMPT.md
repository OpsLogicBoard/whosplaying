# Next Session — Kickoff Prompt

Copy everything in the box below into a new Claude Code session to begin the production build of monetization, the admin console, and the web app.

---

```
We're starting the production build phase for WhosPlaying. Read these first, in order:

1. CLAUDE.md (workflow rules, branding, roles model, gotchas)
2. docs/MONETIZATION_AND_BUILD_PLAN.md (the approved plan — pricing, surfaces, data model, admin console, phasing)
3. Memory: project_next_session_monetization.md, project_origin_market.md,
   project_profile_architecture.md, project_mvp_goals.md, feedback_visual_approval.md

The pricing model and mission are DECIDED — do not re-litigate them. Free forever for
goers + artists + a venue baseline tier; Venue Pro $24.99 (Founding $14.99 for the first
~10–15 Beaches venues); multi-venue +$12/venue; $5 one-off boosts; ticket link-out is
ALWAYS free; GPS push is Pro-only and hard-capped. Mission = support local artists +
sustainability (break-even ≈ 6 venues), launching in the Jax Beach "Beaches" market.

This session has three jobs. Engage them as decisions first, then build:

A. BACKEND / PRICING MODELS — design and implement the entitlement foundation
   (Phase A in the plan): organizations + members (owner-transferable, multi-staff),
   plans/subscriptions/entitlements, usage_events, with RLS + GRANTs in every migration
   and a shared hasEntitlement() helper in packages/core. Resolve the open decisions in
   plan §7 before writing schema. Then scope Stripe billing (Phase B).

B. FRONTEND DESIGN CHOICES — decide how paywalls/upgrade surfaces, the pricing page,
   and the productionized paid features (offers, boosts, GPS push composer, venue
   analytics) look and where they live across MOBILE and WEB. Web is the primary surface
   for venue/promoter management + analytics + billing; mobile is goer-first. Use the v2
   Live Pin brand; no spec boards on production pages. Show rendered UI in local preview
   for sign-off before finalizing (visual-approval rule).

C. ADMIN CONSOLE (new, untouched) — design the platform-operator surface: a web-only,
   admin-gated route (NO subdomain — single-tenant) covering usage analytics
   (MAU/DAU, conversions, churn, per-market density, cost/maps-cliff monitoring), SALES
   (venue pipeline, trial tracking, founding roster, comps, audit-logged impersonation),
   and MAINTENANCE (feature flags, moderation, user/org management, audit log).

Also explicitly account for the WEB APP throughout — it is a first-class surface here,
not just mobile.

Start by confirming the open design decisions in plan §7, propose the Phase A schema
(orgs + entitlements) for my approval, then build. Follow the workflow rules in CLAUDE.md
(typecheck + lint before commit; RLS + GRANT per migration; cross-confirmation invariant
with the "Lineup confirming" grace state; commit + push to main per repo workflow).
```

---

**Why this prompt:** it locks the settled decisions so the new session doesn't re-debate pricing, points at all the context files, and forces the three deliverables you asked for — backend pricing models, frontend design choices, and the admin console — while keeping the web app first-class and the build pointed at production.
