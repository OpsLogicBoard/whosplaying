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
pnpm --filter @whosplaying/web dev      # web only — http://localhost:3000
pnpm --filter @whosplaying/mobile start # mobile only — Expo dev tools
```

## Setup for a fresh Supabase project

If you ever stand up a *new* Supabase project (e.g. a staging clone), do these
six things in order — any one missed makes the next harder to diagnose.

1. **Create the project**
   - "Automatically expose new tables": **leave ENABLED.** (We learned this the hard way — see CLAUDE.md gotchas.)
   - "Enable automatic RLS": **enable.**
2. **Link the CLI**: `supabase link --project-ref <new-ref>`
3. **Push migrations**: `supabase db push --linked --yes`
4. **Auth → URL Configuration**
   - Site URL: `http://localhost:3000` (dev) / `https://whosplaying.live` (prod)
   - Redirect URLs (exact-match — no query strings):
     - `http://localhost:3000/auth/callback`
     - `https://whosplaying.live/auth/callback`
     - `whosplaying://auth/callback`
5. **Auth → Sign In / Providers → Google**
   - Toggle Enabled
   - Paste Client ID + Secret from Google Cloud Console
   - Google Cloud Console redirect URI for the OAuth client must be:
     `https://<new-ref>.supabase.co/auth/v1/callback`
6. **Wire env files** (not committed):
   - `apps/web/.env.local` — `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `apps/mobile/.env.local` — `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Run `pnpm typecheck && pnpm lint` to confirm the workspace is wired before
booting the dev server.

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
