# Phase 1 — Admin Pipeline (REDESIGNED 2026-05-11)
**Who's Playing | whosplaying.live**
**Goal:** End-to-end automated event capture, recurring auto-approval, mobile review, Google Calendar push, daily post image — admin in control via phone.
**Estimated Duration:** 5–7 sessions
**Status:** 🔲 Not Started
**Depends on:** Phase 0 complete

---

## What changed in the redesign

The original Phase 1 (5 task files, n8n, desktop dashboard, per-event Canva) has been replaced with a tighter loop that targets 95% automation:

| Original | Redesign |
|---|---|
| n8n on Hetzner | Cowork Skills + Supabase Edge Functions (free) |
| Desktop dashboard for review | Mobile-first PWA, swipe-deck queue |
| Every capture reviewed identically | Recurring rules auto-publish; only novel events queue |
| Canonical venues/artists in DB CRUD | Google Sheets (admin maintains, system mirrors) |
| Per-event Canva templates | Single Satori-rendered template w/ overlay |
| Capture only via extension | Extension **and** Cowork Claude-in-Chrome scheduled sweeps |
| Sources: IG/FB only | IG/FB + venue websites + Bandsintown + DM-bot (Phase 1.5) |

Full rationale: `/Users/JW/.claude/plans/interview-me-about-building-lexical-wall.md`

---

## Task files

| File | Step | What it covers |
|---|---|---|
| `task-1A-schema-additions.md` | A | New tables + columns in `database-schema.md` |
| `task-1B-seed.md` | B | ICS parse + Sheets sync + recurring-rule activation |
| `task-1C-capture.md` | C | Chrome extension + Cowork sweep Skill + Cloudflare Workers |
| `task-1D-match-and-calendar.md` | D | `match-capture` + `calendar-push` edge functions |
| `task-1E-pwa-queue.md` | E | PWA shell + `/queue` swipe deck + `/settings` + push notifications |
| `task-1F-daily-post.md` | F | Satori template + `generate-daily-post` + `whosplaying:generate-post` Skill |

---

## Phase Gate

Do not proceed to Phase 1.5 (Meta API) or Phase 2 until all 8 verification tests pass:

1. **Seed test** — ICS import generates ≥10 recurring rule proposals; admin activates; `venue_canonical` populated.
2. **Capture (extension)** — Tap-to-save on IG creates a `social_captures` row in <5s.
3. **Capture (Claude in Chrome)** — Manual sweep creates non-duplicate captures across followed accounts.
4. **Recurring auto-approve** — Forced sweep on a known recurring slot creates an `events` row + Calendar entry, no queue blocking.
5. **Approval** — Unknown-venue capture lands flagged; "Add venue" writes to Sheet within 3s.
6. **Mobile** — Phone PWA receives 4 PM push; deep-link → swipe right → Calendar within 5s.
7. **Daily post** — `/post` shows generated PNG; download works on mobile Safari.
8. **Kill-switch** — Toggle `auto_approve_enabled = false`; recurring matches land in queue, no Calendar push.

---

## Cost target

≤$10/mo all-in (Supabase free + Vercel free + Cloudflare free + ~$5–8 Anthropic API w/ caching).
