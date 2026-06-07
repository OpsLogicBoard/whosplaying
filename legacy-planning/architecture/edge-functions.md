# Who's Playing — Supabase Edge Functions
**Last Updated:** 2026-05-11

> **Phase 1 redesign (2026-05-11):** added `match-capture`, `calendar-push`,
> `generate-daily-post`, `parse-event-text`, `sheets-sync`,
> `seed-from-ics`. These replace the n8n workflows from the prior plan.
> Existing Phase 2+ functions (`check-double-booking`, `dispatch-notifications`,
> `award-checkin-points`, `select-giveaway-winner`) are unchanged.

---

## check-double-booking

**Trigger:** Called from mobile app when artist saves a new event  
**Runtime:** Deno  
**Location:** `supabase/functions/check-double-booking/index.ts`

**Logic:**
1. Receive `artist_id`, `event_date`, `start_time`, `end_time`
2. Query `event_artists` JOIN `events` for same artist on same date
3. Check for time overlap: existing `start_time` < new `end_time` AND existing `end_time` > new `start_time`
4. If conflict found:
   - Insert row into `booking_conflicts`
   - Return conflict details to client
   - Trigger in-app notification to artist
5. If no conflict: return `{ conflict: false }`

```typescript
// Input
{ artist_id: string, event_date: string, start_time: string, end_time: string, new_event_id: string }

// Output (conflict)
{ conflict: true, conflicting_event: { id, title, venue_name, start_time } }

// Output (clear)
{ conflict: false }
```

---

## dispatch-notifications

**Trigger:** Supabase database webhook on `events.is_public` changing to `TRUE`  
**Runtime:** Deno

**Logic:**
1. Receive event ID
2. Fetch full event with artists and venue
3. Query `follows` table for all patrons following any of the event's artists or the venue
4. Deduplicate recipient list
5. Insert notification rows into `notifications` table
6. Call Expo Push API with recipient push tokens

```typescript
// Expo push payload per recipient
{
  to: expoToken,
  title: "New Show Alert 🎵",
  body: `${artistName} @ ${venueName} — ${formattedDate}`,
  data: { event_id: eventId }
}
```

---

## award-checkin-points

**Trigger:** INSERT on `checkins` table  
**Runtime:** Deno

**Logic:**
1. Receive `patron_id`, `venue_id`, `event_id`
2. Award base points (10 per event — configurable)
3. UPSERT into `patron_points` (add to existing total)
4. Insert notification: "You earned 10 points at [Venue Name]!"

---

## select-giveaway-winner

**Trigger:** pg_cron — runs every 15 minutes  
**Runtime:** Deno

**Logic:**
1. Find giveaways where `ends_at <= NOW()` and `is_active = TRUE` and `winner_id IS NULL`
2. For each: select random entry from `giveaway_entries`
3. Update `giveaways.winner_id` and set `is_active = FALSE`
4. Dispatch winner notification to patron
5. Dispatch admin notification: "Giveaway winner selected for [title]"

---

---

# Phase 1 redesign — capture pipeline functions

The order below matches the runtime flow: a capture lands → match it → if matched, push to calendar; otherwise queue. Generators and seed are independent.

---

## parse-event-text

**Trigger:** Called from the Chrome extension, Cowork sweep skill, Cloudflare Worker scrapers, and admin dashboard's "re-parse" button.
**Runtime:** Deno

**Purpose:** Single chokepoint for Anthropic API calls. Keeps the API key server-side, applies prompt caching, normalizes the parser output schema across every capture path.

**Input:**
```typescript
{
  raw_text?: string,         // captured caption / scraped HTML excerpt
  image_base64?: string,     // story flyer, chalkboard photo
  source_platform: string,   // 'instagram' | 'facebook' | 'website' | 'extension'
  source_url?: string,
  context_date?: string      // ISO date — disambiguates "Friday" → which Friday
}
```

**Output:**
```typescript
{
  artist: string | null,
  venue: string | null,
  date: string | null,            // ISO YYYY-MM-DD
  start_time: string | null,      // HH:MM 24h
  end_time: string | null,
  is_event: boolean,              // false → not a music event, ignore
  text_confidence: number,        // 0..1
  vision_confidence: number | null,
  reasoning: string               // short note for debugging
}
```

**Implementation notes:**
- System prompt is constant → mark `cache_control: { type: "ephemeral" }` on the system block. Cuts cost ~80% for the bulk of captures that share a system prompt.
- Use `claude-haiku-4-5-20251001` for text-only captures, `claude-sonnet-4-6` for image captures. Vision quality matters more than speed.
- Always pass `context_date` so "tonight" / "Saturday" resolves correctly.

---

## match-capture

**Trigger:** Database webhook on `social_captures` INSERT.
**Runtime:** Deno

**Purpose:** The brain of the system. Decides whether a capture auto-publishes (recurring rule match), needs review, or gets flagged.

**Logic:**
1. Load capture row + `venue_canonical` + `artist_canonical` + active `recurring_rules`.
2. **Normalize** parsed artist + venue: lowercase, strip punctuation/possessives, collapse whitespace.
3. **Resolve canonicals** by checking aliases array first, then fuzzy match (Levenshtein ≤ 2 against canonical_name and aliases).
4. **Out-of-area check:** if venue resolves to `is_in_area = false`, set `flag = 'out_of_area'`, stop.
5. **Unknown venue:** if no canonical match, set `flag = 'unknown_venue'`, stop. Card lands in queue with "Add venue" CTA.
6. **Low-confidence check:** if `text_confidence < min_vision_confidence` from settings, set `flag = 'low_confidence'`, stop (no auto-publish even if rule matches).
7. **Duplicate check:** look for existing event same artist+venue+date+time within ±30 min. If found: set `flag = 'duplicate'`, link to existing event, stop.
8. **Recurring rule lookup:** find any active rule where artist_canonical_id + venue_canonical_id + day_of_week match AND parsed start_time ∈ [start_window_min, start_window_max] AND `paused_until IS NULL OR paused_until < today`.
9. **If matched AND `settings.auto_approve_enabled = true`:**
   - Insert `events` row (`status='approved'`, `auto_approved=true`, `recurring_rule_id=<rule>`, `is_public=true`)
   - Insert `event_artists` row
   - Update `social_captures` (`capture_status='approved'`, `event_id=<event>`, `match_rule_id=<rule>`)
   - Bump `recurring_rules.occurrences_seen`, set `last_matched_at`
   - Insert `auto_publish_log` row for today's digest
   - Invoke `calendar-push` with the new event id
10. **Otherwise:** leave `social_captures.capture_status='pending'`, no event created.

**Output:** `{ outcome: 'auto_approved' | 'queued' | 'duplicate' | 'rejected', event_id?, rule_id? }`

---

## calendar-push

**Trigger:** Called by `match-capture` (auto-approve path) and by the admin PWA on manual approval/edit/delete.
**Runtime:** Deno

**Purpose:** Idempotent Google Calendar writer. Never creates duplicates; updates by `google_calendar_event_id`.

**Logic:**
1. Receive `{ event_id, action: 'create' | 'update' | 'delete' }`.
2. Build `summary = "{artist_canonical_name} @ {venue_canonical_name}"`.
3. `start.dateTime = event_date + start_time` in `America/New_York`.
4. `end.dateTime = event_date + (end_time || start_time + 3h)`. If end < start, add a day (1 AM next morning).
5. `extendedProperties.private.whosplaying_event_id = event.id` for round-trip lookups.
6. **Create:** if `google_calendar_event_id IS NULL`, `events.insert`, store returned id back on the event row.
   **Update:** `events.patch` by stored id.
   **Delete:** `events.delete` by stored id, null out the column.
7. Returns `{ google_calendar_event_id }`.

**Auth:** Service account JSON in `GOOGLE_SERVICE_ACCOUNT_JSON` env. Calendar must be shared with the service account email with "Make changes to events" permission (one-time admin step).

---

## generate-daily-post

**Trigger:** pg_cron at `settings.post_generation_time` daily (default 16:00 ET); or manual button in `/post`.
**Runtime:** Deno

**Purpose:** Render the day's calendar as a branded PNG image, store in Storage, link to `post_templates`.

**Logic:**
1. Compute target date (default today). Optionally include "Brunch tomorrow" section per user's example format.
2. Query `events` where `event_date = target_date AND status='approved' AND is_public=true`, joined to `venue_canonical.short_name` + `artist_canonical.canonical_name`.
3. Sort by `start_time`. Group "Late Night" (start ≥ 21:00) under a sub-header for readability.
4. Build a single React/JSX template with:
   - Background: branded design (loaded from Storage `post-templates/template-{weekday}.png` if available, else solid).
   - Header overlay: weekday + date (e.g. "THURSDAY · MAY 15").
   - Body: text list per row formatted exactly like user's example: `• 5:30 – 8:30 PM · Dustin Bradley @ ABBQ`.
   - Footer: `@whosplayingjaxbeach · whosplaying.live`.
5. Render with `satori` (HTML→SVG) + `@resvg/resvg-js` (SVG→PNG). Output 1080×1350 (IG portrait).
6. If text overflows one image, paginate (page 1, page 2) — Satori reports overflow.
7. Upload PNG(s) to Supabase Storage `post-templates/{date}.png`.
8. Upsert `post_templates` row (`template_date`, `image_urls[]`, `event_count`).
9. Trigger PWA push notification at `settings.digest_push_time` with `auto_publish_log` summary + deep link to `/queue`.

---

## sheets-sync

**Trigger:** pg_cron nightly (e.g. 03:00 ET); or manual button in `/settings`.
**Runtime:** Deno

**Purpose:** Mirror the admin's two Google Sheets (venues + artists) into `venue_canonical` and `artist_canonical`. Sheets are source of truth; DB is read-replica + queryable cache.

**Logic:**
1. Auth as Google service account (Sheets read scope).
2. For each sheet (venues, artists):
   - Read all rows.
   - For each row:
     - If `sheet_row_id` exists in DB → UPSERT (update aliases, handles, address, etc.).
     - If new → INSERT.
   - For DB rows whose `sheet_row_id` no longer appears in the sheet → set `is_active=false` (soft delete; never hard-delete, in case of accidental row removal).
3. Bump `synced_at`.
4. Returns `{ venues_added, venues_updated, venues_deactivated, artists_added, … }`.

**Concurrency:** runs serially under an advisory lock (`pg_try_advisory_lock`) to avoid overlapping nightly + manual triggers.

---

## seed-from-ics

**Trigger:** One-time call from admin during initial setup, or rerun on demand.
**Runtime:** Deno

**Purpose:** Bootstrap `recurring_rules` + `artist_canonical` from the admin's existing Google Calendar export.

**Input:** ICS file uploaded via admin dashboard (or URL).

**Logic:**
1. Parse ICS with `ical.js` Deno port.
2. For each VEVENT, extract `summary` and parse "Artist @ Venue" using a strict regex; fallback to `parse-event-text` if non-conforming.
3. Build canonical artist list: distinct artist names → INSERT into `artist_canonical` with empty aliases.
4. Build (artist, venue, day_of_week, start_time) tuples across all VEVENTs.
5. Bucket each tuple's start_time into 30-min windows.
6. For any (artist, venue, day_of_week, time_bucket) appearing ≥3 times across the file → propose a `recurring_rules` row.
7. Return proposals to admin UI for one-tap activation. Admin reviews list, taps "Activate all" or individual checkboxes.
8. Store activated rows with `created_from='ics_seed'`, `is_active=true`.

---

## venue-website-scraper-callback

**Trigger:** HTTP POST from Cloudflare Worker scrapers.
**Runtime:** Deno

**Purpose:** Single endpoint for the per-venue scrapers to dump found events. Worker does the HTML parsing; this function normalizes and inserts into `social_captures`.

**Input:**
```typescript
{
  worker_secret: string,                     // shared secret in HMAC header
  capture_source_id: string,
  events: Array<{
    raw_text: string,
    parsed_artist?: string,
    parsed_venue?: string,
    parsed_date: string,
    parsed_start_time: string,
    parsed_end_time?: string,
    source_url: string,
    source_post_id: string                   // worker computes a stable hash for dedup
  }>
}
```

**Logic:**
1. Verify HMAC header against env secret.
2. For each event: INSERT into `social_captures` (ON CONFLICT (source_platform, source_post_id) DO NOTHING).
3. Each successful insert fires the `match-capture` webhook automatically.


