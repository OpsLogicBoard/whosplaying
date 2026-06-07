# WhosPlaying — Claude Code Project Instructions

## What this is

A participatory app for **live local music**. Three sides:

- **Artists** (solo + bands) — manage gigs, accept invites, message venues, bid on open gigs.
- **Venues** — post events, invite performers, manage staff who answer customer questions, list open gigs.
- **Music-goers** — discover, follow, save, get alerted.

Cross-confirmation is the core invariant: an event is `confirmed` only when **both the venue AND every named performer** have confirmed. Never bypass this.

## Stack

- Monorepo: pnpm workspaces + Turborepo
- Mobile: Expo + Expo Router (file-based routes under `apps/mobile/app/`)
- Web: Next.js 15 App Router (`apps/web/app/`)
- Backend: Supabase (single tenant — one project serves all users; not multi-tenant like opsbord)
- Styling: Tailwind (web) + NativeWind (mobile), driven by the same preset in `packages/ui/tailwind-preset.js`
- Domain types: Zod schemas in `packages/core/src/domain/`

## Where things live

| Need | Path |
|---|---|
| Brand tokens (colors, type, radii) | `packages/ui/src/tokens/` |
| Logo / wordmark SVG | `packages/ui/src/brand/` |
| Cross-platform UI primitives | `packages/ui/src/components/` |
| Domain entity schemas | `packages/core/src/domain/` |
| React Query hooks | `packages/core/src/hooks/` |
| Supabase client + queries | `packages/supabase/src/` |
| DB schema | `supabase/migrations/0001_init_schema.sql` |
| RLS policies | `supabase/migrations/0002_rls.sql` |
| Edge function (one per folder) | `supabase/functions/<name>/index.ts` |
| Mobile screens | `apps/mobile/app/` (Expo Router) |
| Web pages | `apps/web/app/` (Next App Router) |

## Workflow rules

- After every change: `git add` → `git commit` → push to `main`. Vercel + EAS deploy from `main`.
- Run `pnpm typecheck` and `pnpm lint` before commit.
- Never edit a placeholder screen without also wiring its data source — keep the screen and its query helper changing together.
- Domain types live in `packages/core` — never duplicate them in apps. If you need a new field, change the Zod schema there first, regenerate Supabase types, then update consumers.
- All new tables get RLS in the **same migration**. Never ship a migration that adds a table without policies.

## Branding

- Visual language: **layered/overlapping type** with offset color shadows (teal + yellow + coral + orange) on white or teal grounds. Reference imagery in `docs/BRAND.md`.
- Wordmark: `packages/ui/src/brand/Wordmark.tsx`. Don't reinvent — extend.
- Map style: custom JSON in `packages/ui/src/brand/map-style.json`. Not the default grey muni look.

## Roles model

| Role | Stored | Granted by |
|---|---|---|
| `artist` | `user_roles` | User self-attests during onboarding; profile becomes public when first event posted |
| `venue_owner` | `user_roles` | Self-attests; venue record requires manual claim verification (Phase 2) |
| `venue_staff` | `venue_staff` (per-venue join) | Invited by the venue owner |
| `goer` | implicit | Every signed-in user has this by default |

A user can hold multiple roles simultaneously. Don't model these as distinct accounts.

## Things not to do

- Do not add multi-tenant subdomain routing. This is a single-tenant consumer app.
- Do not model "Artist" and "Band" as the same entity — they are deliberately separate (a person can be in many bands).
- Do not bypass cross-confirmation in `event_performers`. The status flip to `confirmed` requires consensus.
- Do not write features for the admin-pipeline product described in `legacy-planning/` without explicit instruction — that scope was superseded.
