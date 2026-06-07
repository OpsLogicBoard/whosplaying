# Task 1C — Capture Layer
**Phase:** 1 — Admin Pipeline (Step C)
**Status:** 🔲 Not Started
**Depends on:** 1A (schema), 1B (seed for canonicals to match against)

---

## Objective

Stand up four parallel capture inputs that all feed `social_captures`:
1. Chrome MV3 extension (admin tap-to-save)
2. Cowork Skill `whosplaying:sweep` (Claude in Chrome scheduled)
3. Cloudflare Worker venue scrapers (per-venue cron)
4. Cloudflare Worker Bandsintown poller (hourly)

Plus one shared edge function used by all of them: `parse-event-text`.

---

## Sub-tasks

### 1C.1 — `parse-event-text` edge function (the chokepoint)
Spec: `architecture/edge-functions.md` → "parse-event-text".
- File: `supabase/functions/parse-event-text/index.ts`
- Models: `claude-haiku-4-5-20251001` (text), `claude-sonnet-4-6` (vision)
- **Prompt caching** required — system prompt with the area boundary description, output schema, and "live music event" definition gets `cache_control: { type: "ephemeral" }`.
- Returns the strict schema in the spec.
- Bench: 100 sample posts → median latency <2s text, <5s vision.

### 1C.2 — Chrome MV3 extension
Use the previous design from `task-1-1-chrome-extension.md` (deleted), summarized:
- `manifest.json` with MV3 permissions for instagram.com + facebook.com + admin.whosplaying.live
- Content scripts inject "🎵 Save to Who's Playing" button on posts
- Auth handshake: extension reads JWT from admin app's localStorage when admin is logged in
- On click: capture caption + screenshot → POST to `/api/captures` (which calls `parse-event-text`, then INSERTs into `social_captures`)
- Popup confirmation form: parsed fields, edit, confirm
- Repo location: `/extension/` directory at project root

### 1C.3 — `/api/captures` route in admin app
- File: `apps/admin/app/api/captures/route.ts`
- Accepts JSON `{ source_platform, source_url, raw_text, screenshot_base64?, source_post_id? }`
- Auth: admin Supabase JWT
- Calls `parse-event-text` edge function
- INSERTs into `social_captures` (UNIQUE constraint on `(source_platform, source_post_id)` handles dedup)
- Returns the new capture id
- The INSERT fires the `match-capture` webhook (built in 1D)

### 1C.4 — `whosplaying:sweep` Cowork Skill
Spec: `architecture/cowork-skills.md` → "whosplaying:sweep".
- File: `.claude/skills/whosplaying/sweep/SKILL.md`
- Companion script: `.claude/skills/whosplaying/sweep/sweep.ts` for any heavy lifting
- Hygiene: randomized timing, max 30 navs/sweep, halt on suspicious-activity prompts

### 1C.5 — Schedule the Skill
Run once during install:
```
mcp__scheduled-tasks__create_scheduled_task name="whosplaying-sweep-morning" cron="0 8 * * *" tz="America/New_York" skill="whosplaying:sweep"
mcp__scheduled-tasks__create_scheduled_task name="whosplaying-sweep-afternoon" cron="0 15 * * *" tz="America/New_York" skill="whosplaying:sweep"
```
Verify with `mcp__scheduled-tasks__list_scheduled_tasks`.

### 1C.6 — Cloudflare Worker venue scraper (template + first 3 venues)
- Repo location: `/workers/venue-scrapers/`
- Per venue: one TypeScript file that fetches the calendar page, extracts events with `cheerio` or DOM parsing, computes a stable `source_post_id` (hash of URL + event title + date), POSTs to `venue-website-scraper-callback` edge function with HMAC.
- Scheduled with Cloudflare Cron Triggers (free tier, hourly).
- Pick top 3 venues with structured calendars (admin to identify; likely PV Concert Hall, Mezza Luna, Pusser's based on the example post).

### 1C.7 — `venue-website-scraper-callback` edge function
Spec: `architecture/edge-functions.md` → "venue-website-scraper-callback".
- File: `supabase/functions/venue-website-scraper-callback/index.ts`
- Verifies HMAC, batch INSERTs into `social_captures` with ON CONFLICT DO NOTHING.

### 1C.8 — Bandsintown poller Worker
- File: `/workers/bandsintown-poll/index.ts`
- Hourly cron, fetches events for tracked artists (sourced from `artist_canonical` rows where `is_active=true`).
- POSTs through the same callback as venue scrapers but with `source_platform='bandsintown'`.

---

## Validation Checklist

- [ ] `parse-event-text` deployed; sample IG caption returns valid schema
- [ ] Extension loads in Chrome without errors; auth handshake works
- [ ] Saving an IG post creates a `social_captures` row in <5s
- [ ] `whosplaying:sweep` Skill runs manually, creates ≥1 capture per active source
- [ ] Scheduled tasks registered and visible in `list_scheduled_tasks`
- [ ] First venue scraper deployed; cron-triggered run lands in DB
- [ ] Bandsintown poller deployed; manual trigger works

---

## Update Task Log

Mark 1.C1–1.C7 complete.
