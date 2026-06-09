# WhosPlaying — Build Plan

**Status:** Active. Supersedes anything in `legacy-planning/`.
**Last updated:** 2026-06-09
**Owner:** James Warner (TPM)

---

## Why this document exists

The repo had a strong technical foundation — monorepo, Expo + Next.js + Supabase,
cross-confirmation enforced at the database level — but the rendered product
did not match the brand vision in `CLAUDE.md` and the first-run experience did
not invite users in. This plan restarts the work as a sequence of phases, with
**design execution moved to the front** so every downstream phase inherits a
real visual identity instead of templated defaults.

The architecture in `docs/ARCHITECTURE.md` and the invariants in `CLAUDE.md`
remain authoritative. This document sets the order of work and the gates
between phases.

---

## The product, in one paragraph

WhosPlaying is a live local music app for three audiences: music-goers who
want to find shows tonight, artists who play solo and in multiple bands, and
venues that book live music. The launch market is Jacksonville Beach. The
patron-side product is a mobile app on iOS first, with a public web mirror
that carries SEO and shareable event pages. The product is free to end users
through launch; revenue model is intentionally deferred.

---

## Phase sequence

| Phase | Name | Primary outcome |
|---|---|---|
| **0** | Design Reset | Brand tokens, layered-type primitive, three reference compositions Claude Code can render |
| **1** | Auth & First-Run | Story-driven welcome, Apple + Google + email, browse-before-signup |
| **2** | Discovery, Map & Calendar | Tonight / weekend lists, custom map, save artist + venue, calendar import |
| **3** | Artist & Venue Participation | Multi-band identity, multi-venue operators, EPK mode, gig agreement layer, promoter attribution |
| **4** | Messaging, Open Gigs & Staff Tools | Private messaging, open-gig bidding, one-tap fill, staff PIN access, conflict detector |
| **5** | Launch — JAX Beach | Seeding playbook, anchor venues, content moderator program (Theo's role) |

Each phase produces a `phases/phase-N-<slug>/` directory containing three
documents: `README.md` (the phase brief), `TASKS.md` (granular task list),
and `AGENT_PROMPT.md` (ready-to-paste instruction for Claude Code).

---

## Sequencing rules

1. **No phase begins until the previous phase clears its acceptance criteria.**
   The criteria live at the bottom of each phase `README.md`.
2. **Database work is gated.** Schema and RLS changes are deferred until design
   and UI are settled. Phase 0 through Phase 2 work against the existing schema
   in `supabase/migrations/`. Phase 3 reopens schema work where new entities
   are required (multi-band, multi-venue, gig agreement, audit log).
3. **No AI API spend.** No feature in this plan depends on Anthropic, OpenAI,
   or any paid LLM API. This constraint stands until a revenue source is
   identified. Features that previously assumed AI (event intake from social
   media, generated social graphics) are either deferred to a future phase or
   redesigned to be deterministic.
4. **Cross-confirmation is preserved with a release valve.** An event becomes
   `confirmed` only when both the venue and every named performer agree. A new
   `provisional` status plus an audit-logged override path is added in Phase 3
   so last-minute fills (Rick's release valve) do not require bypassing the
   invariant.
5. **Web and mobile ship together.** A feature is not "done" until it is on
   both clients. This is the architecture decision in `docs/ARCHITECTURE.md`,
   restated here so it survives later pressure to cut corners.

---

## Document conventions

- **Where these live in the repo:** `docs/build/`.
- **The living issues log:** `docs/build/TASK_LOG.md`. Update at the start and
  end of every working session.
- **Per-phase docs:** `docs/build/phases/phase-N-<slug>/`.
- **Voice:** plain English, no corporate jargon, written so a coding agent and
  a non-coder can both follow them.
- **Decisions:** logged in `TASK_LOG.md` under "Decisions," with date and
  context. No silent reversals.

---

## What is explicitly out of scope until further notice

- Native Android build (Phase 5 or later — iOS + web first).
- Stripe, payments, paid tiers, monetization features.
- Meta Graph API integration.
- AI-assisted event intake (Theo's automated workflow).
- Multi-tenant subdomain routing.
- PWA install flow as a primary distribution channel.
- Magic-link OTP authentication.

These exclusions exist for a reason. Reopen them only with a documented
decision in `TASK_LOG.md`.

---

## Personas referenced throughout

The Discovery Round (see project chat history) produced eight personas whose
needs map to specific features. Phase docs cite these personas by name when a
feature traces to a specific need.

- **Marcus** — Promoter, books artists
- **Dana** — Promoter, venue-side and talent acquisition
- **Casey** — Musician (solo + three bands)
- **Priya** — Music-goer, 3–10 shows a week
- **Theo** — Non-profit social media promoter, manual event scrubber
- **Rick** — GM, beachside bar with live music six nights a week
- **Mel** — Venue hostess
- **Orchestrator (TPM)** — James, reconciling all of the above

---

## Key takeaways

- Architecture stays. Execution restarts.
- Design comes first because everything downstream inherits from it.
- No paid API spend until a revenue source exists.
- Each phase ships web and mobile together.
- The cross-confirmation invariant survives, with an audit-logged override
  path added in Phase 3 for last-minute fills.
