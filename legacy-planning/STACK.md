# Who's Playing — Stack & Dependency Reference
**Last Updated:** 2026-05-11

> **Phase 1 redesign (2026-05-11):** n8n dropped in favor of Cowork
> Skills + Supabase Edge Functions. Canonical venue/artist lists moved
> to Google Sheets. Daily-post template simplified. PWA replaces desktop
> dashboard for admin approval. See
> `/Users/JW/.claude/plans/interview-me-about-building-lexical-wall.md`
> for the full rationale.

---

## Mobile App (Expo / React Native)

| Package | Version | Purpose |
|---|---|---|
| expo | SDK 51+ | Base framework |
| expo-router | v3 | File-based navigation |
| react-native | latest stable | UI rendering |
| @supabase/supabase-js | v2 | Backend client |
| expo-camera | latest | OCR capture |
| expo-image-picker | latest | Gallery access |
| expo-notifications | latest | Push notifications |
| expo-location | latest | Geolocation for map |
| @mapbox/mapbox-gl-react-native | latest | Interactive map |
| expo-sharing | latest | Native share sheet |
| expo-file-system | latest | File handling |
| react-native-calendar-kit | latest | In-app artist calendar |
| zustand | latest | State management |
| react-query (TanStack) | v5 | Data fetching/caching |
| nativewind | v4 | Tailwind for React Native |
| expo-secure-store | latest | Token storage |

---

## Admin Web (Next.js — also functions as PWA)

| Package | Version | Purpose |
|---|---|---|
| next | 14 (App Router) | Framework |
| typescript | v5 | Type safety |
| tailwindcss | v3 | Styling |
| @supabase/supabase-js | v2 | Backend client |
| @supabase/auth-helpers-nextjs | latest | Auth middleware |
| @anthropic-ai/sdk | latest | Claude API for parsing (with prompt caching) |
| googleapis | latest | Google Calendar API + Google Sheets API |
| satori | latest | Server-side HTML→SVG for daily post images |
| @resvg/resvg-js | latest | SVG→PNG rasterization (no headless browser needed) |
| @radix-ui/react-* | latest | UI primitives |
| lucide-react | latest | Icons |
| @tanstack/react-query | v5 | Data fetching |
| zod | latest | Schema validation |
| react-hook-form | latest | Form handling |
| framer-motion | latest | Swipe-deck gestures for mobile approval queue |
| ical.js | latest | Parse Google Calendar ICS export at seed time |
| next-pwa | latest | PWA service worker + manifest |
| web-push | latest | Server-side push notification dispatch |

---

## Browser Extension (Chrome MV3)

| Item | Detail |
|---|---|
| Manifest Version | 3 |
| Framework | Vanilla JS (no bundler complexity) |
| Auth | Token from admin web app (localStorage handshake) |
| Permissions | activeTab, scripting, storage, identity |
| Target Sites | instagram.com, facebook.com |
| AI Call | Supabase Edge Function (proxies Claude API, keeps key server-side) |

---

## Backend (Supabase)

| Feature | Usage |
|---|---|
| Auth | Email/password, Google OAuth, Apple Sign-In |
| Database | PostgreSQL — all tables defined in architecture/database-schema.md |
| Storage | Buckets: avatars, event-images, social-captures, post-templates |
| Edge Functions | `match-capture` (recurring detection + canonical lookup), `calendar-push` (Google Calendar write), `generate-daily-post` (Satori render), `sheets-sync` (mirror canonical Sheets nightly), `parse-event-text` (Claude API proxy), `dispatch-notifications` (Phase 3) |
| Realtime | Admin queue updates (capture status changes) |
| pg_cron | 7-day auto-publish job, nightly sheets-sync, hourly Bandsintown poll |

## Automation (replaces n8n)

| Component | Tool | Purpose |
|---|---|---|
| Scheduled sweeps | Cowork `schedule` skill / `mcp__scheduled-tasks__create_scheduled_task` | Fires Claude-in-Chrome at 8 AM and 3 PM daily |
| Browser capture | Cowork **Claude in Chrome** | Logged-in IG/FB feed + story walk on admin's session |
| Skill definitions | `whosplaying:sweep`, `whosplaying:generate-post`, `whosplaying:seed-from-ics` | Reusable Claude Code skills (shipped in repo, installed via Cowork) |
| Venue website scrapers | Cloudflare Workers (free tier) | Per-venue cron scrapers that POST into `/api/captures` |
| Bandsintown poller | Cloudflare Workers (free tier) | Hourly check on tracked artists, dedupe against existing captures |

---

## External Services

| Service | Purpose | When Needed |
|---|---|---|
| Google Calendar API | Push approved events to calendar | Phase 1 |
| Google Sheets API | Read/write canonical venues + artists | Phase 1 |
| Anthropic Claude API | Event parsing (text + vision), with prompt caching | Phase 1 |
| Bandsintown API (free tier) | Tour-act event source | Phase 1 |
| Cloudflare Workers (free tier) | Venue website scrapers + Bandsintown poller | Phase 1 |
| Cowork (Anthropic) | Claude-in-Chrome browser sweeps + scheduled tasks | Phase 1 |
| Vercel (free tier) | Next.js admin PWA hosting | Phase 1 |
| Mapbox | Interactive map | Phase 3 |
| Expo EAS | Mobile app builds | Phase 2 (artist/venue), Phase 5 production |
| Stripe | Venue billing subscriptions | Phase 4 |
| Meta Graph API | IG DM bot for submissions + IG/FB direct posting | Phase 1.5 (DM bot) + Phase 4 (auto-post). Application starts during Phase 1 build. |
| TikTok API | TikTok cross-posting | Phase 4 stretch |
| Apple Developer Program | App Store submission | Phase 5 |
| Google Play Console | Play Store submission | Phase 5 |

---

## Credentials Required (see credentials/setup-guide.md)

- Supabase project URL + anon key + service role key
- Google OAuth client ID + secret (for Supabase Auth)
- Apple Sign-In configuration (for Supabase Auth + EAS) — Phase 2+
- Google service account JSON (Calendar **and** Sheets scopes)
- `WHOSPLAYING_VENUES_SHEET_ID` + `WHOSPLAYING_ARTISTS_SHEET_ID`
- Anthropic API key
- Bandsintown API key (free tier)
- Cloudflare Workers account
- VAPID public + private keys (for `web-push`)
- Vercel project + custom domain (`admin.whosplaying.live`)
- Mapbox public token (Phase 3)
- Expo EAS project ID (Phase 2+)
- Stripe publishable + secret key (Phase 4)
- Meta App ID + secret (Phase 1.5 / Phase 4)
