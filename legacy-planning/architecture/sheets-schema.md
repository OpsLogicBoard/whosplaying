# Who's Playing — Google Sheets Schema (Canonical Lists)

**Last Updated:** 2026-05-11
**Owner:** Admin (whosplayingjaxbeach@gmail.com)
**Synced by:** `sheets-sync` edge function (nightly + on-demand)

---

## Why Google Sheets

The admin already lives in Google Workspace and is comfortable editing
spreadsheets on a phone. Building a CRUD UI for venues + artists in the
admin app would cost a session and offer nothing the Sheets app doesn't
already do. The DB tables `venue_canonical` / `artist_canonical` are a
**read-only mirror** that the system queries; the Sheet is the source
of truth.

This means: when admin spots an "unknown_venue" capture in the queue
and taps "Add to canonical," the PWA writes a new row to the Sheet via
the Sheets API, then triggers `sheets-sync` to refresh the cache.

---

## Sheet 1: Venues
**Sheet ID env var:** `WHOSPLAYING_VENUES_SHEET_ID`
**Tab name:** `venues`
**Header row:** row 1 (frozen)

| Column | Header | Required | Notes |
|---|---|---|---|
| A | `canonical_name` | yes | "Palm Valley Outdoors" — exact display name in posts/calendar |
| B | `short_name` | no | "PVO" — used in compact post format if main name is too long |
| C | `aliases` | no | Pipe-separated: `PVO\|Palm Valley Outdoor\|@palmvalleyoutdoors` |
| D | `ig_handle` | no | Without `@`. e.g. `palmvalleyoutdoors` |
| E | `fb_handle` | no | Page slug or numeric id |
| F | `website_url` | no | If they publish a calendar |
| G | `address` | no | Street address |
| H | `city` | no | Defaults to `Ponte Vedra Beach` if blank |
| I | `zip` | no | |
| J | `latitude` | no | For geo filter (decimal) |
| K | `longitude` | no | For geo filter (decimal) |
| L | `is_in_area` | yes | TRUE / FALSE — is venue inside Mayport→202 boundary |
| M | `is_active` | yes | TRUE / FALSE — soft-delete switch |
| N | `notes` | no | Free text for admin reference |

**Aliases column convention:** all lowercase, pipe-separated, no spaces around the pipes. The sync function lowercases on read regardless.

---

## Sheet 2: Artists
**Sheet ID env var:** `WHOSPLAYING_ARTISTS_SHEET_ID`
**Tab name:** `artists`
**Header row:** row 1 (frozen)

| Column | Header | Required | Notes |
|---|---|---|---|
| A | `canonical_name` | yes | "Scott Halls" — exact display name |
| B | `aliases` | no | `Scott Hall\|Scotty Halls\|@scotthallsmusic` |
| C | `ig_handle` | no | |
| D | `is_band` | yes | TRUE / FALSE |
| E | `members` | no | Pipe-separated names if band, blank if solo |
| F | `is_active` | yes | TRUE / FALSE |
| G | `notes` | no | |

---

## Editing rules (admin)

1. **Never delete rows.** Set `is_active = FALSE` instead. Sync function treats deletion as soft-delete on the DB side, so deleting + re-adding the same row would lose history.
2. **Aliases matter most.** The recurring-rule engine looks up captures via aliases first. A new spelling sighted in a capture → add it to the alias column, do not create a new row.
3. **Edits are picked up nightly** by the `sheets-sync` cron. To force an immediate sync, hit "Sync now" in the admin PWA `/settings`.
4. **The admin PWA can write back** when adding a venue from a capture. It appends a new row at the bottom and triggers an immediate sync. Admin can edit the row later for fields the PWA didn't fill (website, address, etc.).

---

## API access

Sheets API enabled on the same Google service account used for Calendar.
Scopes:
- `https://www.googleapis.com/auth/spreadsheets` (read + write — write needed for "Add to canonical" from PWA)

Service account email must be added as an **Editor** on both Sheets
(File → Share → paste the service account email).

---

## Initial seed

When the admin first runs `whosplaying:seed-from-ics`, the system will
auto-populate Sheet 2 (Artists) with every distinct artist name found
in the ICS export. Sheet 1 (Venues) is populated from the admin's
existing alias spreadsheet (one-time CSV import) plus any new venues
found in the ICS export (added with `is_in_area=TRUE` defaulted to
TRUE for admin to verify).
