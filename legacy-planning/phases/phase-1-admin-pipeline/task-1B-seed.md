# Task 1B — Seed (ICS + Sheets + Recurring Rules)
**Phase:** 1 — Admin Pipeline (Step B)
**Status:** 🔲 Not Started
**Depends on:** 1A (schema), Phase 0 admin app shell

---

## Objective

Bootstrap the system from the admin's existing data so that on day one of capture, recurring events auto-publish instead of every event hitting the queue.

---

## Sub-tasks

### 1B.1 — Admin assets (Admin)
- Export Google Calendar (whosplayingjaxbeach@gmail.com → "Who's Playing — Events" calendar) as ICS, past 6–12 months. Drop in `/Users/JW/Downloads/whosplaying-events.ics`.
- Create the two Google Sheets per `architecture/sheets-schema.md`:
  - "WhosPlaying Venues" (sheet id → `WHOSPLAYING_VENUES_SHEET_ID`)
  - "WhosPlaying Artists" (sheet id → `WHOSPLAYING_ARTISTS_SHEET_ID`)
- Share both with the Google service account email as **Editor**.
- Pre-populate Venues sheet from any existing alias spreadsheet the admin has.

### 1B.2 — Implement `sheets-sync` edge function (Agent)
Spec: `architecture/edge-functions.md` → "sheets-sync".
- File: `supabase/functions/sheets-sync/index.ts`
- Auth: `GOOGLE_SERVICE_ACCOUNT_JSON` env (Sheets read scope).
- Schedule: pg_cron nightly at 03:00 ET (in same migration).
- Smoke test: paste a row into Venues sheet, hit the function manually, confirm row appears in `venue_canonical`.

### 1B.3 — Implement `seed-from-ics` edge function (Agent)
Spec: `architecture/edge-functions.md` → "seed-from-ics".
- File: `supabase/functions/seed-from-ics/index.ts`
- Returns proposed `recurring_rules` (does NOT auto-activate).
- Stub UI route `/setup/recurring-rules` that:
  - Accepts ICS file upload
  - Calls function
  - Shows checkbox list of proposed rules with frequency count
  - "Activate selected" button writes activated rules with `is_active=true`

### 1B.4 — Run the seed (Admin + Agent together)
1. Admin uploads ICS at `/setup/recurring-rules`.
2. System proposes ~10–30 rules.
3. Admin reviews, deselects any wrong ones, activates the rest.
4. Verify in DB: `SELECT count(*) FROM recurring_rules WHERE is_active=true;`

---

## Validation Checklist

- [ ] Both Google Sheets created and shared with service account
- [ ] `sheets-sync` deployed and pg_cron scheduled
- [ ] Manual sync from Sheets writes to `venue_canonical` / `artist_canonical`
- [ ] `seed-from-ics` deployed
- [ ] `/setup/recurring-rules` page works on desktop (one-time use, doesn't need mobile polish)
- [ ] Admin has activated initial recurring rules
- [ ] `SELECT count(*) FROM recurring_rules WHERE is_active=true;` ≥ 5

---

## Update Task Log

Mark 1.B1–1.B6 complete.
