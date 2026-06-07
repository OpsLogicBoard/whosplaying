# Who's Playing — Credentials & Environment Setup Guide
**Last Updated:** 2026-05-11
**Important:** Never commit real credentials to any repository. Use environment variables only.

> **Phase 1 redesign 2026-05-11:** n8n credentials removed.
> Added: Google Sheets (same service account, expanded scopes),
> Bandsintown, Cloudflare Workers, VAPID push, Cowork.

---

## 1. Supabase

**Action:** Create a new project at supabase.com

| Variable | Where to Find | Used In |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → API → URL | Admin Web, Mobile App |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API → anon/public key | Admin Web, Mobile App |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → service_role key | Admin Web (server only), Cloudflare Workers |

**Storage Buckets to Create:**
- `avatars` — Public
- `event-images` — Public
- `social-captures` — Private (admin only)
- `post-templates` — Private (admin only)

---

## 2. Google OAuth (for Supabase Auth)

**Action:** Create OAuth credentials at console.cloud.google.com

1. Create a new project: "Whos Playing"
2. Enable Google+ API and People API
3. Create OAuth 2.0 Client ID (Web application)
4. Add redirect URI: `https://[your-supabase-ref].supabase.co/auth/v1/callback`
5. Add to Supabase: Authentication → Providers → Google

| Variable | Used In |
|---|---|
| Google Client ID | Supabase Auth config |
| Google Client Secret | Supabase Auth config |

---

## 3. Apple Sign-In (for Supabase Auth)

**Action:** Requires Apple Developer account ($99/year)

1. Create App ID with Sign In with Apple capability
2. Create Service ID
3. Generate private key
4. Configure in Supabase: Authentication → Providers → Apple

---

## 4. Google Calendar API + Google Sheets API (single service account)

**Account:** whosplayingjaxbeach@gmail.com

1. Go to console.cloud.google.com (logged in as whosplayingjaxbeach@gmail.com)
2. Enable **both** APIs:
   - Google Calendar API
   - Google Sheets API
3. Create a Service Account (one for both)
4. Download service account JSON key file
5. Share the "Who's Playing — Events" calendar with the service account email ("Make changes to events" access)
6. Share **both Google Sheets** (Venues + Artists) with the service account email as **Editor**
7. Store JSON key securely — reference as environment variable

| Variable | Used In |
|---|---|
| `GOOGLE_CALENDAR_ID` | Admin Web, edge functions |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Admin Web + edge functions (stringified JSON) |
| `WHOSPLAYING_VENUES_SHEET_ID` | edge functions (sheets-sync) |
| `WHOSPLAYING_ARTISTS_SHEET_ID` | edge functions (sheets-sync) |

---

## 5. Anthropic (Claude API)

**Action:** Generate key at console.anthropic.com

| Variable | Used In |
|---|---|
| `ANTHROPIC_API_KEY` | Edge function `parse-event-text` (server only — NEVER expose to client) |

Configure prompt caching on the system prompt in `parse-event-text` (`cache_control: { type: "ephemeral" }`). This drops cost ~80% across the daily sweep volume.

---

## 6. Mapbox

**Action:** Sign up at mapbox.com, create a public token

| Variable | Used In |
|---|---|
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Admin Web |
| `EXPO_PUBLIC_MAPBOX_TOKEN` | Mobile App |

---

## 7. Expo EAS

**Action:** Run `eas init` in the Expo project directory

| Item | Value |
|---|---|
| Bundle ID (iOS) | `live.whosplaying.app` |
| Package Name (Android) | `live.whosplaying.app` |
| EAS Project ID | Generated on init — add to `app.json` |

---

## 8. Vercel (Admin Web)

**Action:** Connect GitHub repo at vercel.com, create new project

| Setting | Value |
|---|---|
| Framework | Next.js |
| Root Directory | `/admin` (or monorepo root depending on structure) |
| Custom Domain | `admin.whosplaying.live` |

**Environment Variables to add in Vercel dashboard:**
- All `NEXT_PUBLIC_*` variables (including `NEXT_PUBLIC_VAPID_PUBLIC_KEY`)
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_CALENDAR_ID`, `GOOGLE_SERVICE_ACCOUNT_JSON`
- `WHOSPLAYING_VENUES_SHEET_ID`, `WHOSPLAYING_ARTISTS_SHEET_ID`
- `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`
- `WORKER_HMAC_SECRET` (shared with Cloudflare Workers)
- `BANDSINTOWN_API_KEY`

---

## 9. Cowork (replaces n8n)

**Action:** Install Cowork and ensure Claude in Chrome is enabled.

1. Sign in to Cowork with the admin's Anthropic account.
2. Enable **Claude in Chrome** plugin.
3. Log into Instagram and Facebook in the Cowork-controlled Chrome profile (one-time, persists across sweeps).
4. Install the project Skills from `.claude/skills/whosplaying/`:
   ```
   /skill install whosplaying:sweep whosplaying:generate-post whosplaying:seed-from-ics
   ```
5. Register scheduled tasks (per `architecture/cowork-skills.md`):
   ```
   mcp__scheduled-tasks__create_scheduled_task name="whosplaying-sweep-morning" cron="0 8 * * *" tz="America/New_York" skill="whosplaying:sweep"
   mcp__scheduled-tasks__create_scheduled_task name="whosplaying-sweep-afternoon" cron="0 15 * * *" tz="America/New_York" skill="whosplaying:sweep"
   mcp__scheduled-tasks__create_scheduled_task name="whosplaying-daily-post" cron="0 16 * * *" tz="America/New_York" skill="whosplaying:generate-post"
   ```

No env vars required — credentials live in the admin's Cowork session.

---

## 10. Cloudflare Workers (venue scrapers + Bandsintown poller)

**Action:** Create a free Cloudflare account, install Wrangler.

1. `npm install -g wrangler && wrangler login`
2. Create one Worker per scraper under `/workers/venue-scrapers/<venue>/wrangler.toml`
3. Set secrets per worker:
   ```
   wrangler secret put WORKER_HMAC_SECRET
   wrangler secret put SUPABASE_FUNCTIONS_URL
   ```
4. Configure cron triggers in each `wrangler.toml`:
   ```toml
   [triggers]
   crons = ["0 * * * *"]
   ```

| Variable | Where |
|---|---|
| `WORKER_HMAC_SECRET` | Each Worker + Vercel env (validates incoming POSTs to `venue-website-scraper-callback`) |
| `BANDSINTOWN_API_KEY` | Bandsintown poller Worker only |

---

## 11. Web Push (VAPID)

**Action:** Generate VAPID key pair once.

```
npx web-push generate-vapid-keys
```

| Variable | Used In |
|---|---|
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Admin Web (client subscription) |
| `VAPID_PRIVATE_KEY` | Admin Web (server send) |
| `VAPID_SUBJECT` | Admin Web — set to `mailto:whosplayingjaxbeach@gmail.com` |

---

## 12. Bandsintown API (free tier)

**Action:** Sign up at artists.bandsintown.com → API access. Free tier covers reading public events for tracked artists.

| Variable | Used In |
|---|---|
| `BANDSINTOWN_API_KEY` | Bandsintown poller Worker |

---

## 13. Phase 4 Only — Stripe

**Action:** Create account at stripe.com

| Variable | Used In |
|---|---|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Admin Web |
| `STRIPE_SECRET_KEY` | Admin Web (server only) |
| `STRIPE_WEBHOOK_SECRET` | Admin Web (webhook handler) |

---

## 14. Phase 1.5 — Meta Graph API (DM bot + auto-post)

**Action:** Create Facebook Developer app at developers.facebook.com

Note: Meta API access for messaging + publishing requires Meta Business Verification + app review. Multi-week lead time. **Start the application during Phase 1 build** — track in TASK_LOG issue I-005.

| Variable | Used In |
|---|---|
| `META_APP_ID` | Admin Web |
| `META_APP_SECRET` | Admin Web (server only) |
| `META_PAGE_ACCESS_TOKEN` | Admin Web (per-page, long-lived) |
| `INSTAGRAM_BUSINESS_ACCOUNT_ID` | Admin Web |

---

## Local Development `.env.local` Template

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Google (single service account for Calendar + Sheets)
GOOGLE_CALENDAR_ID=
GOOGLE_SERVICE_ACCOUNT_JSON=
WHOSPLAYING_VENUES_SHEET_ID=
WHOSPLAYING_ARTISTS_SHEET_ID=

# Anthropic (only used in edge functions; keep here for local dev/testing)
ANTHROPIC_API_KEY=

# Web Push (VAPID)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:whosplayingjaxbeach@gmail.com

# Cloudflare Workers
WORKER_HMAC_SECRET=
BANDSINTOWN_API_KEY=

# Mapbox (Phase 3)
NEXT_PUBLIC_MAPBOX_TOKEN=

# Stripe (Phase 4)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Meta (Phase 1.5 / Phase 4)
META_APP_ID=
META_APP_SECRET=
META_PAGE_ACCESS_TOKEN=
INSTAGRAM_BUSINESS_ACCOUNT_ID=
```
