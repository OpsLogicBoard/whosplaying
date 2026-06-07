# WhosPlaying

Live local music — discover who's playing, where, when. Built for **artists**, **venues**, and **music-goers** to participate together.

## Stack

- **Mobile**: Expo (React Native) + Expo Router — iOS + Android
- **Web**: Next.js 15 (App Router) — marketing, signed-in mirror, shareable public pages
- **Backend**: Supabase (Postgres + Auth + Storage + Edge Functions + Realtime)
- **Shared**: pnpm workspaces + Turborepo, NativeWind / Tailwind, TypeScript, Zod
- **Hosting**: Vercel (web), EAS (mobile)

## Layout

```
apps/
  mobile/   Expo app (iOS + Android)
  web/      Next.js app
packages/
  ui/       Design system, brand mark, primitive components
  core/     Domain schemas + hooks (platform-agnostic)
  supabase/ Typed client + per-domain query helpers
  config/   Shared tsconfig / eslint / prettier
supabase/   Migrations, RLS, edge functions, seed
docs/       Architecture, brand, data model, roadmap
legacy-planning/   Earlier admin-pipeline planning docs (May 2026 — superseded)
```

## Getting started

```bash
pnpm install
pnpm dev                 # everything in parallel
pnpm --filter web dev    # web only — http://localhost:3000
pnpm --filter mobile start  # mobile only — Expo dev tools
```

## Verify

```bash
pnpm typecheck
pnpm lint
pnpm test
```

## Backend

```bash
supabase start         # local Supabase stack on Docker
supabase db reset      # apply migrations + seed
supabase functions serve
```

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and [`CLAUDE.md`](CLAUDE.md).
