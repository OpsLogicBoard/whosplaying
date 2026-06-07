# Who's Playing — Master Project Reference
**Domain:** whosplaying.live  
**Admin Email:** whosplayingjaxbeach@gmail.com  
**Last Updated:** 2026-05-11  
**Status:** Planning Complete — Phase 1 redesigned (see plan file) — Ready for Phase 0

> **Phase 1 redesign 2026-05-11:** workflow now uses Cowork Skills +
> Claude in Chrome (replacing n8n) and Google Sheets as the source of
> truth for canonical venues/artists. Recurring-event auto-publish to
> Calendar (review-once-then-forever) and a mobile PWA approval queue
> are the headline behavioral changes. Full rationale + decisions in
> `/Users/JW/.claude/plans/interview-me-about-building-lexical-wall.md`.

---

## Project Summary

Who's Playing is a community-focused live music discovery platform serving the Jacksonville Beach area and designed to scale regionally. It exists to solve a real problem: one admin spends hours weekly manually scraping Instagram and Facebook for live music events, formatting them, and posting a daily calendar.

The solution is a two-part system:
1. **Mobile App (iOS + Android)** — Patron, Artist, and Venue facing. Downloadable from App Store and Play Store. This is the primary user product.
2. **Admin Web Dashboard** — Browser-based. Streamlines the admin workflow, connects social media capture, n8n automation, and Google Calendar pipeline.

Both share a single Supabase backend.

---

## Architecture Overview

| Layer | Tool | Notes |
|---|---|---|
| Mobile App (patrons/artists/venues) | React Native via Expo | iOS + Android, single codebase. Phase 2+. |
| Admin PWA | Next.js 14 | App Router, deployed to Vercel free tier. Mobile-first; admin approves on phone. |
| Backend | Supabase | Auth, DB, Storage, Edge Functions, Realtime, pg_cron |
| Automation | Cowork Skills + `mcp__scheduled-tasks` | Replaces n8n. Daily sweep + post generator run on Anthropic infra (free w/ Cowork). |
| Browser capture (scheduled) | Cowork Claude in Chrome | Drives admin's logged-in IG/FB session twice daily |
| Browser capture (ad-hoc) | Chrome MV3 extension | Admin tap-to-save on individual posts |
| Structured scrapers | Cloudflare Workers (free tier) | Per-venue website calendar scrapers + Bandsintown poller |
| Canonical lists | Google Sheets | Admin maintains venues + artists in two Sheets; system reads via Sheets API |
| Maps | Mapbox GL JS | Interactive venue/event map. Phase 3. |
| AI | Anthropic Claude API | Event parsing (text + vision), with prompt caching. Haiku for text, Sonnet for images. |
| Calendar | Google Calendar API | Service account, scoped to whosplayingjaxbeach@gmail.com |
| Push Notifications (admin) | web-push (VAPID) | PWA push for daily 4 PM digest |
| Push Notifications (patrons) | Expo Push Notifications | Phase 3 |
| Cross-Posting | Manual (Phase 1) → Meta Graph API (Phase 1.5) | Admin downloads PNG and uploads to IG until Meta approval lands |
| Mobile Build | Expo EAS | Phase 2+ |
| Admin Deploy | Vercel free tier | `admin.whosplaying.live` |

---

## Phase Overview

| Phase | Name | Goal |
|---|---|---|
| **0** | Foundation | Supabase schema (with new Phase 1 tables), auth, both app shells deployed |
| **1** | Admin Pipeline | ICS seed, Sheets canonicals, Chrome ext + Claude-in-Chrome sweeps, recurring auto-approve, mobile PWA queue, daily post (Satori), Google Calendar push |
| **1.5** | Meta API | IG DM bot for venue/artist submissions + auto-post the daily image. Gated on Meta Business approval. |
| **2** | Artist & Venue | Profiles, event management, OCR capture, share sheet, double-booking |
| **3** | Patron Experience | Feed, map, follow/save, push notifications |
| **4** | Monetization | Venue promos, points, giveaways |
| **5** | App Store | iOS + Android polish, submission, store assets |

---

## Repository Structure

```
whosplaying/
├── README.md                        ← This file
├── TASK_LOG.md                      ← Master task and issues tracker
├── STACK.md                         ← Full stack and dependency reference
├── architecture/
│   ├── database-schema.md           ← Full Supabase schema with SQL
│   ├── api-routes.md                ← All API endpoints
│   ├── edge-functions.md            ← Supabase edge function specs
│   ├── cowork-skills.md             ← Skill specs + scheduling (replaces n8n)
│   └── sheets-schema.md             ← Google Sheets canonical-list layout
├── credentials/
│   └── setup-guide.md               ← What keys/credentials are needed and where
├── phases/
│   ├── phase-0-foundation/
│   ├── phase-1-admin-pipeline/
│   ├── phase-2-artist-venue/
│   ├── phase-3-patron-experience/
│   ├── phase-4-monetization/
│   └── phase-5-app-store/
└── prompts/
    ├── phase-0-prompts.md
    ├── phase-1-prompts.md
    ├── phase-2-prompts.md
    ├── phase-3-prompts.md
    ├── phase-4-prompts.md
    └── phase-5-prompts.md
```

---

## Key Constraints

- Admin is a single non-technical operator
- Social media capture must be user-initiated (TOS compliant)
- App must be downloadable (PWA failed to grow user base previously)
- Cross-posting via native share sheet first, API integration later
- Self-funding model required — monetization built in from Phase 4
- All events must be live music focused (no karaoke)
- 7-day auto-publish rule: all private events go public 7 days before event date

---

## Handoff Note for Coding Agent

This file set is the complete source of truth. Do not rely on inference or training memory for project decisions. Every architectural choice is documented here. Begin with `TASK_LOG.md`, then proceed to the Phase 0 folder. Complete and update the task log at the start and end of every session.
