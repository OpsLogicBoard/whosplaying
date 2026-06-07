# Who's Playing — Cowork Skills

**Last Updated:** 2026-05-11
**Status:** Replaces `n8n-workflow.md`. n8n removed from the stack.

---

## Why Cowork Skills replaced n8n

The original Phase 1 design ran n8n self-hosted on Hetzner to handle:
- Scheduled "fetch today's events from Supabase, format with Claude, store post"
- Webhook on event approval → Google Calendar push

Two problems:
1. **Capture itself can't run there.** n8n can't drive a logged-in
   Instagram/Facebook session — it's just an HTTP/cron platform. The
   capture step would still need a human in front of a browser, which
   defeats most of the automation goal.
2. **Cost + ops burden.** ~€4/mo Hetzner box + 30-min/month maintenance,
   for a scheduler we now get free from Cowork.

Cowork ships with **Claude in Chrome**: a Claude session that drives the
admin's already-logged-in browser. That single capability collapses the
hard part of capture (logged-in IG/FB session) into the same primitive
that runs the schedule. No bot account, no proxy, no scraping detection
to fight — Claude is just looking at posts the admin already follows.

---

## Skills shipped in this repo

All three skills live under `.claude/skills/whosplaying/` so they're
versioned with the project and installable via Cowork plugin export.

### `whosplaying:sweep`
**Schedule:** twice daily — 08:00 ET (overnight catch-up) and 15:00 ET (main sweep). Configurable via `settings.sweep_morning_time` / `settings.sweep_afternoon_time`.

**Inputs:** none (reads `capture_sources` from Supabase MCP).

**Steps:**
1. Query Supabase: `SELECT * FROM capture_sources WHERE is_active=true ORDER BY last_swept_at NULLS FIRST`.
2. For each source, branch by `source_type`:
   - **`instagram_account`** — Open Claude in Chrome at `instagram.com/{target}`. Scroll the past 24h of posts. For each post: capture caption text + take a viewport screenshot. Then navigate to stories, walk through them, screenshot each. (Stories expire in 24h — this is the only way to catch them.)
   - **`facebook_page`** — Same pattern at `facebook.com/{target}/upcoming_hosted_events` and the page's recent posts.
   - **`venue_website`** — Skip; handled by Cloudflare Worker scrapers.
   - **`bandsintown_artist`** — Skip; handled by Cloudflare Worker poller.
3. For each captured post/story, call the `parse-event-text` edge function with raw text + screenshot base64.
4. POST the parser response to `/api/captures` (which inserts into `social_captures`, which fires the `match-capture` webhook).
5. Update `capture_sources.last_swept_at` and `last_capture_count`. If two consecutive sweeps return zero captures, increment `consecutive_empty_sweeps`; at 14 (one week of empties) auto-set `is_active=false` and notify admin.
6. **Anti-detection hygiene:** randomize scroll speed (300–800ms between scroll events), randomize dwell time on each post (1.5–4s), never trigger more than ~30 page nav events in a single sweep.

**Failure modes:**
- IG triggers "unusual activity" prompt → log it, halt sweep, push admin alert "Sweep paused, please re-verify your IG session." Skill auto-resumes on next scheduled run after admin acknowledges.
- Account shows login wall → halt, alert admin to re-authenticate.

---

### `whosplaying:generate-post`
**Schedule:** daily at 16:00 ET (configurable via `settings.post_generation_time`). Also callable manually from the admin PWA.

**Inputs:** `{ date?: string }` (defaults to today).

**Steps:**
1. Call `generate-daily-post` edge function with `{ date }`. It does the SQL query, Satori render, and PNG upload — see `edge-functions.md`.
2. Read `auto_publish_log` for `digest_date = date` to compose digest body: "12 events pre-approved · 3 need review."
3. Send web-push notification to `settings.push_subscription_json` with deep link `https://admin.whosplaying.live/queue?date={date}`.

---

### `whosplaying:seed-from-ics`
**Schedule:** none — invoked once during initial setup, or rerun on demand when admin imports a fresh ICS.

**Inputs:** `{ ics_url: string }` or attached `.ics` file path.

**Steps:**
1. Call `seed-from-ics` edge function — it parses the ICS and proposes recurring rules.
2. Open the admin PWA `/setup/recurring-rules` page (Claude in Chrome) so the admin can review and activate proposals on a desktop one time. Subsequent edits happen on phone.

---

## Scheduling (replaces n8n cron nodes)

Two options, in priority order:

### Option A — `mcp__scheduled-tasks` (recommended)
The MCP server `mcp__scheduled-tasks__create_scheduled_task` registers
a cron-style schedule that fires a Skill on Anthropic infrastructure.
Runs whether or not the admin's machine is on. **Free with the Cowork
subscription.** Use this for the daily sweep + post generator.

Setup commands (run once during installation):
```
mcp__scheduled-tasks__create_scheduled_task name="whosplaying-sweep-morning" cron="0 8 * * *" tz="America/New_York" skill="whosplaying:sweep"
mcp__scheduled-tasks__create_scheduled_task name="whosplaying-sweep-afternoon" cron="0 15 * * *" tz="America/New_York" skill="whosplaying:sweep"
mcp__scheduled-tasks__create_scheduled_task name="whosplaying-daily-post" cron="0 16 * * *" tz="America/New_York" skill="whosplaying:generate-post"
```

### Option B — Supabase pg_cron + edge function trigger
Backup if the scheduled-tasks MCP is unavailable. pg_cron fires an HTTP
POST to a webhook on the admin's machine that triggers the local Skill.
Less reliable (admin's machine must be online); use only as fallback.

---

## What runs where (full picture)

| Layer | Tool | Examples |
|---|---|---|
| Cron / scheduling | `mcp__scheduled-tasks` (Anthropic infra) | sweep, post generator |
| Browser-driven capture | Claude in Chrome (Cowork) | IG feed + stories, FB pages |
| Tap-to-save capture | Chrome MV3 extension | ad-hoc admin captures |
| Structured scraping | Cloudflare Workers (free tier) | venue sites with calendar pages |
| Tour-act polling | Cloudflare Workers + Bandsintown API | hourly artist event check |
| HTTP webhooks | Supabase Edge Functions | `match-capture`, `calendar-push`, etc. |
| User UI | Next.js PWA on Vercel | `/queue`, `/post`, `/settings` |

---

## Migration: existing n8n workflow

If a partial n8n workflow JSON was previously exported, **discard it**.
None of the nodes map cleanly to the new architecture (the only useful
piece — Google Calendar OAuth — is reimplemented as service account
auth in the `calendar-push` edge function).

Decommission steps:
1. Stop the n8n container on Hetzner.
2. Cancel the Hetzner box.
3. Delete `N8N_WEBHOOK_SECRET` and `N8N_BASE_URL` env vars from Vercel.
4. Mark TASK_LOG issue I-001 as resolved with note "n8n removed by Phase 1 redesign 2026-05-11."
