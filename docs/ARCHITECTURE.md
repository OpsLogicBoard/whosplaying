# Architecture

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

## Realtime

- Messaging uses Supabase Realtime channels on `messages` filtered by `conversation_id`.
- Conflict flags are subscribed-to per-user so a venue or artist sees a conflict the moment the detector writes it.

## Notifications

`packages/core/src/notifications/` defines a platform-neutral router. Mobile implements via `expo-notifications`; web via `web-push` for installed PWAs and email fallback for the rest.

## Maps

Custom MapLibre style at `packages/ui/src/brand/map-style.json` — teal water, warm paper land, coral pins for active shows. Token via `EXPO_PUBLIC_MAPBOX_TOKEN` / `NEXT_PUBLIC_MAPBOX_TOKEN`.

## Deployments

- **Web** → Vercel from `main`.
- **Mobile** → EAS preview on `main`, production builds promoted manually.
- **Supabase** → migrations applied with `supabase db push` per environment.
