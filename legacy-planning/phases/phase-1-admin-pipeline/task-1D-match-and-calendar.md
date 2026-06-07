# Task 1D — Match + Calendar Push
**Phase:** 1 — Admin Pipeline (Step D)
**Status:** 🔲 Not Started
**Depends on:** 1A (schema), 1B (canonicals + recurring rules), 1C (`/api/captures` writing rows)

---

## Objective

Wire the brain. Every new `social_captures` row triggers `match-capture`, which decides: auto-publish (recurring rule match) → call `calendar-push` → log to `auto_publish_log`; or queue for review with the right flag.

---

## Sub-tasks

### 1D.1 — `calendar-push` edge function
Spec: `architecture/edge-functions.md` → "calendar-push".
- File: `supabase/functions/calendar-push/index.ts`
- Idempotent via `events.google_calendar_event_id`
- Action enum: `create | update | delete`
- Late-night handling: if `end_time < start_time`, end is next-day 1 AM
- Smoke test: insert a known event row, call function, verify Google Calendar entry; call again with action=update; call with action=delete.

### 1D.2 — `match-capture` edge function
Spec: `architecture/edge-functions.md` → "match-capture".
- File: `supabase/functions/match-capture/index.ts`
- Implementation order:
  1. Pure normalization helpers (`normalize_name`, `levenshtein`)
  2. Canonical resolver (alias array first, fuzzy fallback)
  3. Out-of-area / unknown / low-confidence / duplicate guards
  4. Recurring rule matcher
  5. Auto-approve writer (events + event_artists + auto_publish_log)
  6. `calendar-push` invocation
- Test cases (write SQL fixtures, run function manually):
  - Capture matching active rule → auto-approved, calendar entry created
  - Capture with unknown venue → flagged `unknown_venue`, capture_status stays `pending`
  - Capture with `text_confidence=0.5` → flagged `low_confidence`, no auto-publish even if rule matches
  - Capture matching rule but `settings.auto_approve_enabled=false` → queued, no publish
  - Duplicate capture → flagged `duplicate`, links to existing event

### 1D.3 — Wire the database webhook
- In Supabase Dashboard → Database → Webhooks (or via SQL `pg_net`):
  - Trigger: `social_captures` INSERT
  - Target: `match-capture` edge function URL
  - Auth: service role bearer
- Verify by inserting a row manually and watching function logs.

### 1D.4 — Calendar setup (Admin)
- Create new Google Calendar named "Who's Playing — Events" under whosplayingjaxbeach@gmail.com
- Share with the service account email (from credentials/setup-guide.md) with "Make changes to events" permission
- Copy the calendar ID into `GOOGLE_CALENDAR_ID` env in Vercel + Supabase

---

## Validation Checklist

- [ ] `calendar-push` deployed; create/update/delete cycle verified against real Calendar
- [ ] `match-capture` deployed; all 5 test cases pass
- [ ] Webhook fires on `social_captures` INSERT (logs show invocation)
- [ ] End-to-end: extension capture of a recurring-rule-matching post → Calendar entry within 10s, no manual review needed
- [ ] `auto_publish_log` populated for today

---

## Update Task Log

Mark 1.D1–1.D4 complete.
