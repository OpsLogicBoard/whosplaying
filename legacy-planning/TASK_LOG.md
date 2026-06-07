# Who's Playing — Master Task & Issues Log
**Project:** whosplaying.live  
**Updated:** 2026-05-11  
**Current Phase:** 0 — Foundation  
**Overall Status:** 🟡 In Planning (Phase 1 redesigned 2026-05-11)

---

## Instructions for Coding Agent

- Update this file at the **start** of every session (pull current status)
- Update this file at the **end** of every session (record completions, blockers, new issues)
- Use status codes: 🔲 Not Started | 🔄 In Progress | ✅ Complete | ❌ Blocked | ⚠️ Needs Review

---

## Phase 0 — Foundation

| ID | Task | Status | Owner | Notes |
|---|---|---|---|---|
| 0.1 | Create Supabase project | 🔲 | Agent | Fresh project, region: US East |
| 0.2 | Apply full database schema | 🔲 | Agent | See architecture/database-schema.md |
| 0.3 | Configure Supabase Auth (email + OAuth) | 🔲 | Agent | Google + Apple Sign-In required |
| 0.4 | Configure Supabase Storage buckets | 🔲 | Agent | avatars, event-images, social-captures |
| 0.5 | Set up Row Level Security policies | 🔲 | Agent | See architecture/database-schema.md |
| 0.6 | Initialize Next.js admin app | 🔲 | Agent | App Router, TypeScript, Tailwind |
| 0.7 | Deploy admin app to Vercel (fresh project) | 🔲 | Agent | Domain: admin.whosplaying.live |
| 0.8 | Initialize Expo app | 🔲 | Agent | Expo SDK 51+, TypeScript |
| 0.9 | Configure Expo EAS project | 🔲 | Agent | Bundle ID: live.whosplaying.app |
| 0.10 | Connect both apps to Supabase | 🔲 | Agent | Env vars documented in credentials/setup-guide.md |
| 0.11 | Validate auth flow end to end | 🔲 | Agent | Admin login, app login, role assignment |

---

## Phase 1 — Admin Pipeline (REDESIGNED 2026-05-11)

> Replaces all prior 1.x tasks. New tasks grouped by build step from
> `/Users/JW/.claude/plans/interview-me-about-building-lexical-wall.md`.

### Step A — Schema additions (extends Phase 0)
| ID | Task | Status | Owner | Notes |
|---|---|---|---|---|
| 1.A1 | Add new tables: `recurring_rules`, `venue_canonical`, `artist_canonical`, `capture_sources`, `settings`, `auto_publish_log` | 🔲 | Agent | SQL in `architecture/database-schema.md` Phase 1 redesign section |
| 1.A2 | Add new columns to `events` (`auto_approved`, `recurring_rule_id`, `google_calendar_event_id`) and `social_captures` (`flag`, `match_rule_id`, `vision_confidence`, `parsed_end_time`, `source_post_id`, `capture_source_id`) | 🔲 | Agent | Same migration |
| 1.A3 | RLS policies for new tables (admin-only) | 🔲 | Agent | |

### Step B — Seed
| ID | Task | Status | Owner | Notes |
|---|---|---|---|---|
| 1.B1 | Admin uploads existing Google Calendar ICS export | 🔲 | Admin | Past 6–12 months |
| 1.B2 | Admin populates venue alias Google Sheet | 🔲 | Admin | Per `architecture/sheets-schema.md` |
| 1.B3 | Admin populates artist Google Sheet (or accept ICS-derived seed) | 🔲 | Admin | |
| 1.B4 | Implement + deploy `seed-from-ics` edge function | 🔲 | Agent | Spec in `architecture/edge-functions.md` |
| 1.B5 | Implement + deploy `sheets-sync` edge function | 🔲 | Agent | |
| 1.B6 | Admin reviews + activates proposed recurring rules in `/setup/recurring-rules` | 🔲 | Admin | One-time setup |

### Step C — Capture layer
| ID | Task | Status | Owner | Notes |
|---|---|---|---|---|
| 1.C1 | Build Chrome MV3 extension (per existing `task-1-1-chrome-extension.md`) | 🔲 | Agent | Tap-to-save individual posts |
| 1.C2 | Implement `parse-event-text` edge function | 🔲 | Agent | Single chokepoint for Claude API; prompt caching enabled |
| 1.C3 | Build `whosplaying:sweep` Cowork Skill | 🔲 | Agent | Per `architecture/cowork-skills.md` |
| 1.C4 | Register `mcp__scheduled-tasks` cron entries (sweep × 2/day, post × 1/day) | 🔲 | Agent | Setup commands in cowork-skills.md |
| 1.C5 | Build Cloudflare Worker template for venue website scrapers | 🔲 | Agent | Free tier; HMAC POST to `venue-website-scraper-callback` |
| 1.C6 | Deploy first venue scraper (highest-volume venue with structured site) | 🔲 | Agent | Pick top 3 from venue list |
| 1.C7 | Build Bandsintown poller Worker | 🔲 | Agent | Hourly cron, dedupes via `source_post_id` |

### Step D — Match + filter (the brain)
| ID | Task | Status | Owner | Notes |
|---|---|---|---|---|
| 1.D1 | Implement `match-capture` edge function | 🔲 | Agent | Recurring rule lookup, dedup, geo, confidence checks |
| 1.D2 | Wire Supabase webhook: `social_captures` INSERT → `match-capture` | 🔲 | Agent | |
| 1.D3 | Implement `calendar-push` edge function | 🔲 | Agent | Idempotent create/update/delete |
| 1.D4 | Connect calendar service account; share calendar with it | 🔲 | Admin | One-time |

### Step E — Mobile PWA admin
| ID | Task | Status | Owner | Notes |
|---|---|---|---|---|
| 1.E1 | Add `next-pwa` config + manifest + icons + service worker | 🔲 | Agent | Mobile-installable |
| 1.E2 | Build `/queue` swipe-deck (framer-motion) for pending captures | 🔲 | Agent | Mobile-first |
| 1.E3 | Build "auto-published today" undo list at bottom of `/queue` | 🔲 | Agent | One-tap undo cascades to Calendar delete |
| 1.E4 | "Add venue" CTA on unknown_venue cards → writes to Sheet, triggers sync | 🔲 | Agent | |
| 1.E5 | `/setup/recurring-rules` page for one-time rule activation | 🔲 | Agent | Desktop-friendly (one-time) |
| 1.E6 | `/settings` page (kill switches, sweep toggles, push subscription) | 🔲 | Agent | |
| 1.E7 | VAPID setup + web-push subscribe flow | 🔲 | Agent | |

### Step F — Daily post generator
| ID | Task | Status | Owner | Notes |
|---|---|---|---|---|
| 1.F1 | Admin provides current Canva template files (PDF/PNG) | 🔲 | Admin | For Satori HTML/CSS recreation |
| 1.F2 | Build Satori template (weekday + date overlay + event list) | 🔲 | Agent | One template, paginated if list overflows |
| 1.F3 | Implement `generate-daily-post` edge function | 🔲 | Agent | Sat ori + resvg-js |
| 1.F4 | Build `/post` preview + download page | 🔲 | Agent | Mobile-friendly download |
| 1.F5 | Build `whosplaying:generate-post` Skill | 🔲 | Agent | Triggers daily, sends digest push |
| 1.F6 | Schedule daily digest push at `settings.digest_push_time` | 🔲 | Agent | |

### Step G — End-to-end verification
| ID | Task | Status | Owner | Notes |
|---|---|---|---|---|
| 1.G1 | Run all 8 verification tests in plan file | 🔲 | Agent + Admin | Phase 1 gate |
| 1.G2 | Begin Meta Business Verification application (Phase 1.5 prereq) | 🔲 | Admin | Multi-week lead time |

---

## Phase 2 — Artist & Venue

| ID | Task | Status | Owner | Notes |
|---|---|---|---|---|
| 2.1 | Artist onboarding flow (app) | 🔲 | Agent | Profile creation, genre, bio, links |
| 2.2 | Artist event creation (app) | 🔲 | Agent | Date, time, venue, privacy toggle |
| 2.3 | Artist calendar view (app) | 🔲 | Agent | In-app calendar, public/private events |
| 2.4 | Double booking detection | 🔲 | Agent | Edge function on event save |
| 2.5 | Collaboration conflict resolution UI | 🔲 | Agent | Notify both artists, shared billing option |
| 2.6 | 7-day auto-publish rule | 🔲 | Agent | pg_cron job, publish_at field |
| 2.7 | OCR calendar capture (app) | 🔲 | Agent | Camera → Claude Vision → confirmation UI |
| 2.8 | Native share sheet for cross-posting | 🔲 | Agent | Share formatted image + caption |
| 2.9 | Venue onboarding flow (app) | 🔲 | Agent | Profile, address, capacity, map pin |
| 2.10 | Venue calendar view (app) | 🔲 | Agent | Cross-references artist events |
| 2.11 | Artist-Venue cross-reference display | 🔲 | Agent | Artist @ Venue combined calendar |
| 2.12 | Music upload / streaming link (app) | 🔲 | Agent | Link to Spotify/Apple Music or direct upload |

---

## Phase 3 — Patron Experience

| ID | Task | Status | Owner | Notes |
|---|---|---|---|---|
| 3.1 | Patron onboarding flow (app) | 🔲 | Agent | Minimal: name, location, interests |
| 3.2 | Discovery feed (app) | 🔲 | Agent | Upcoming events, personalized by follows |
| 3.3 | Weekly calendar view (app) | 🔲 | Agent | Scrollable week view of all public events |
| 3.4 | Interactive map (app) | 🔲 | Agent | Mapbox, venue pins, live event indicators |
| 3.5 | Follow artist (app) | 🔲 | Agent | Patron follows artist profile |
| 3.6 | Follow venue (app) | 🔲 | Agent | Patron follows venue profile |
| 3.7 | Save event (app) | 🔲 | Agent | Patron saves event to personal list |
| 3.8 | Push notifications — new event | 🔲 | Agent | Alert when followed artist/venue adds event |
| 3.9 | Push notifications — show starting | 🔲 | Agent | Alert 30/15 min before saved show |
| 3.10 | Event detail page (app) | 🔲 | Agent | Artist, venue, time, map, share button |

---

## Phase 4 — Monetization

| ID | Task | Status | Owner | Notes |
|---|---|---|---|---|
| 4.1 | Venue promotion creation (admin/venue) | 🔲 | Agent | Drink specials, free entry, special events |
| 4.2 | Promotion display in patron feed | 🔲 | Agent | Tagged to event cards |
| 4.3 | Giveaway/contest system | 🔲 | Agent | Free drinks, tickets, entry contests |
| 4.4 | Patron points system | 🔲 | Agent | Earn points at events, redeem at venue |
| 4.5 | Check-in mechanism for points | 🔲 | Agent | QR code or geofence check-in |
| 4.6 | Meta Graph API cross-posting | 🔲 | Agent | Instagram + Facebook direct post from app |
| 4.7 | TikTok API cross-posting | 🔲 | Agent | Phase 4 stretch goal |
| 4.8 | Venue billing / subscription model | 🔲 | Agent | Stripe integration for venue marketing tier |

---

## Phase 5 — App Store

| ID | Task | Status | Owner | Notes |
|---|---|---|---|---|
| 5.1 | iOS build via EAS | 🔲 | Agent | Production build, signing certs |
| 5.2 | App Store Connect submission | 🔲 | Admin | Requires Apple Developer account |
| 5.3 | Android build via EAS | 🔲 | Agent | Production build, keystore |
| 5.4 | Google Play submission | 🔲 | Admin | Requires Google Play Developer account |
| 5.5 | App Store assets | 🔲 | Admin/Agent | Screenshots, descriptions, keywords |
| 5.6 | Privacy policy + Terms of Service pages | 🔲 | Agent | Required for App Store approval |

---

## Open Issues

| ID | Issue | Priority | Status | Notes |
|---|---|---|---|---|
| I-001 | ~~n8n workflow files not yet reviewed~~ | — | ✅ | Resolved 2026-05-11: n8n removed by Phase 1 redesign |
| I-002 | Apple Developer account status unknown | Medium | 🔲 | Required for Phase 5 — confirm early |
| I-003 | Google Play Developer account status unknown | Medium | 🔲 | Required for Phase 5 |
| I-004 | Mapbox API key not yet obtained | Medium | 🔲 | Required for Phase 3 |
| I-005 | Meta API app approval (now Phase 1.5) | High | 🔲 | Multi-week lead — start application during Phase 1 build (task 1.G2) |
| I-006 | Stripe account for venue billing | Low | 🔲 | Required for Phase 4 |
| I-007 | Cowork access + Claude in Chrome enabled on admin's machine | High | 🔲 | Required for `whosplaying:sweep` Skill |
| I-008 | Cloudflare account + Workers free tier | Medium | 🔲 | Required for venue scrapers + Bandsintown poller |
| I-009 | Bandsintown API key (free tier) | Low | 🔲 | Tour-act source |
| I-010 | VAPID key pair generated for web-push | Medium | 🔲 | One-time `npx web-push generate-vapid-keys` |

---

## Session Log

| Date | Agent | Phase | Summary | Next Step |
|---|---|---|---|---|
| 2026-05-09 | Planning (Claude) | All | Full project scoped, file set generated | Begin Phase 0 with coding agent |
| 2026-05-11 | Planning (Claude) | 1 | Phase 1 redesigned via interview. n8n dropped → Cowork Skills + Edge Functions. Sheets-as-source-of-truth for canonicals. Recurring auto-approve + mobile PWA queue + Satori daily post. Plan file at `/Users/JW/.claude/plans/interview-me-about-building-lexical-wall.md`. Architecture docs (STACK, README, schema, edge-functions, cowork-skills, sheets-schema, TASK_LOG) updated to match. | Coding agent: start Phase 0 (Supabase setup) → Step A (schema additions) per new task list |
