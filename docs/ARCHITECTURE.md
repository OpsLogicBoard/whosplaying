# Architecture

> **Design is locked to v2 "Live Pin"** as built in `apps/mobile/`. See
> [`BRAND.md`](./BRAND.md), [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md),
> [`MOBILE_APP.md`](./MOBILE_APP.md), [`DATA_MODEL.md`](./DATA_MODEL.md). The
> backend exists to support that build — nothing in the schema or services should
> contradict the approved screens.

## Overview

WhosPlaying is a single-tenant consumer product. One Supabase project serves all users globally; data is publicly readable for discovery, with tight RLS on writes. Mobile and web are two clients sharing one design system, one type/schema source, and one query layer.

```
┌────────────┐      ┌────────────┐
│  Expo app  │      │  Next.js   │
└─────┬──────┘      └─────┬──────┘
      │                   │
      └───────┬───────────┘
              ▼
       @whosplaying/{ui, core, supabase}
              ▼
        Supabase (Postgres + Auth + Storage + Edge Functions + Realtime)
```

## Why this shape

- **One backend, two clients.** Web and mobile mirror each other deliberately — a feature lands in both at once. Web carries marketing + SEO public pages (event/artist/venue) so a venue can paste a share link anywhere; mobile carries native push, calendar sync, and the on-the-go map.
- **Shared design tokens.** `@whosplaying/ui/tailwind-preset` is consumed by both apps. Brand changes happen in one file.
- **Domain in `core`, not in apps.** Zod schemas + react-query hooks live in `@whosplaying/core` so business logic isn't duplicated. Apps render; core describes.
- **Cross-confirmation is database-level.** The `events.status` flip to `confirmed` only happens when both the venue and every named performer in `event_performers` show `confirmed`. RLS enforces who can write which side.

## Role-adaptive client (persona + mode)

The app adapts to who's using it via two axes held in a shared store
(`apps/mobile/lib/appMode.ts`): **persona** (`goer | pro`) and **mode**
(`play | work`). Pros toggle Work/Play on the You screen; the bottom tab bar
**swaps** between the goer set (Tonight·Explore·Map·Saved·You) and the pro set
(Calendar·Gigs·Create·Messages·You). Full model and the screen→data map:
[`MOBILE_APP.md`](./MOBILE_APP.md).

## Monetization

Free forever for goers and artists (incl. a venue Free tier). Venue Pro
$24.99/mo (Founding $14.99). Backed by `organizations` → `subscriptions` →
`plans`/`entitlements`, one-off `feature_purchases`, and `usage_events`. Stripe
for payments; Get-Tickets is always a free link-out. See
[`DATA_MODEL.md`](./DATA_MODEL.md) and `MONETIZATION_AND_BUILD_PLAN.md`.

## Realtime

- Messaging uses Supabase Realtime channels on `messages` filtered by `conversation_id`.
- Conflict flags are subscribed-to per-user so a venue or artist sees a conflict the moment the detector writes it.

## Notifications

`packages/core/src/notifications/` defines a platform-neutral router. Mobile implements via `expo-notifications`; web via `web-push` for installed PWAs and email fallback for the rest.

## Maps

Custom MapLibre style at `packages/ui/src/brand/map-style.json` — clean
white/warm-paper land, light water, and colorful Live-Pin markers (coral pin +
play triangle) for active shows. Token via `EXPO_PUBLIC_MAPBOX_TOKEN` /
`NEXT_PUBLIC_MAPBOX_TOKEN`. Real MapLibre rendering needs an EAS dev build; the
app ships a styled fallback until then.

## Deployments

- **Web** → Vercel from `main`.
- **Mobile** → EAS preview on `main`, production builds promoted manually.
- **Supabase** → migrations authored in `supabase/migrations/` and applied via the Supabase
  MCP `apply_migration` (project-scoped connector; approval-gated) — see
  `WORKFLOW_AND_TOOLING.md` §3. The `supabase db push` CLI path remains a fallback.
