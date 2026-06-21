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
- All new tables also need explicit `GRANT` statements for the `anon` and `authenticated` roles in the same migration — RLS alone doesn't help if the role can't see the table. The default-privileges block in `0004_grant_table_access.sql` covers tables created *after* it ran, but if you write a fresh migration, double-check with `\dp <table>` in psql.

## Branding

**Canonical design = v2 "Live Pin", as built in `apps/mobile/` and frozen in `docs/design/prototype.html`.** The earlier teal/yellow stacked-shadow direction is **retired**. The governing docs — follow them to the letter:
- [`docs/BRAND.md`](docs/BRAND.md) — brand essence, palette, logo, voice.
- [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) — exact tokens, components, the color-discipline rules + per-screen QA gate.
- [`docs/MOBILE_APP.md`](docs/MOBILE_APP.md) — screen inventory, persona/Work-Play tab-swap model, screen→data map.

Non-negotiable design rules (the ones that have drifted before):
- **Coral `#FF5A5F` = primary CTA + active state only.** Primary buttons are the coral gradient (`<GradientButton>`); dark/heavy actions use `bg-ink-deep`.
- **Status pills use the semantic map, never grey-by-default or coral:** green `#0F6E56`/`#E1F5EE` = confirmed/active/linked/fan/connected; gold = waiting/pending/expiring; blue = open/scheduled; slate = muted/paused/expired. Use `<StatusBadge>`.
- **Tabler icons only** (+ `TonightMark`/`GigsMark`). No emoji/other icon sets.
- **Cover/photo tag bottom-left, camera top-right.** Top-level tabs have no back chevron (only pushed screens use `BackHeader`).
- **Work mode swaps the tab bar** (Calendar·Gigs·Create·Messages·You); never duplicate a Work tab as a dashboard card.
- Visual language: **Apple clarity + Spotify energy + Airbnb friendliness.** Clean white/`#F7F8FA` grounds, coral `#FF5A5F` primary CTA, blue/lime/purple/golden accents. NOT a poppy collage.
- Logo: the **Live Pin Lockup** (location pin + play triangle + signal waves) with stacked `who's / playing` wordmark. Three artifacts, never mixed: (1) **brand review board** = design route only; (2) **logo component** with exactly `full` / `compact` / `mark-only` variants in `packages/ui/src/brand/`; (3) **production pages** = compact header logo + real content only.
- **NEVER render brand-spec boards** (`PRIMARY LOGO`, `COLOR PALETTE`, `TYPOGRAPHY` panels) inside any production page. This was the repeated frontend failure (`docs/.../09_Codex_Failure_Review.md`). Treat as a hard QA gate.
- Wordmark: `packages/ui/src/brand/Wordmark.tsx`. Don't reinvent — extend.
- "Poppy not drab" lives in the **map** (custom `map-style.json`, colorful logo-mark pins) and accent color, NOT in the logo or homepage.
- Map style: custom JSON in `packages/ui/src/brand/map-style.json`. Not the default grey muni look.

## Roles model

| Role | Stored | Granted by |
|---|---|---|
| `artist` | `user_roles` | User self-attests during onboarding; profile becomes public when first event posted |
| `venue_owner` | `user_roles` | Self-attests; venue record requires manual claim verification (Phase 2) |
| `venue_staff` | `venue_staff` (per-venue join) | Invited by the venue owner |
| `goer` | implicit | Every signed-in user has this by default |

A user can hold multiple roles simultaneously. Don't model these as distinct accounts.

## Gotchas learned the hard way

These bit us during initial setup. Repeat at your peril.

### Supabase
- **Always keep "Automatically expose new tables" ENABLED** at project creation. Disabling it means new tables have no `GRANT` to `anon`/`authenticated`, and PostgREST returns 403 for every query — even when RLS policies look correct. Migration `0004_grant_table_access.sql` retroactively fixes this and sets default privileges so future tables auto-grant.
- **Auth → Redirect URLs is exact-match, no wildcards on query string.** If your app passes `redirectTo=...?next=/foo`, the entry `http://localhost:3000/auth/callback` will NOT match. Strip query params from `redirectTo`; carry state in `sessionStorage` instead.
- **Helper SQL functions need `set search_path = public`** or Supabase's security advisor flags them. Without it, a malicious schema can shadow public table names. See `0003_secure_function_search_path.sql`.
- **Email templates are locked behind custom SMTP.** Out of the box you get Supabase's defaults — fine for dev. To brand `Confirm your email`, set up Resend/SendGrid first.
- **OAuth consent screen shows the Supabase project URL** (e.g. `xyz.supabase.co`) until you set up a Supabase Custom Domain ($10/mo Pro feature). For pre-launch dev this is fine; before opening to real users, fix it.
- **Don't use `ll_to_earth` / GIST geo indexes** without `create extension earthdistance` first. We use a plain b-tree on `(lat, lng)` for bounding-box queries; switch to PostGIS later if real distance math is needed.

### Auth
- **Magic-link OTP is high-friction** for consumer mobile apps. The mobile-first stack is Google Sign-In + Apple Sign-In (App Store rule once any other social auth exists) + email/password fallback. Don't add magic-link unless asked.
- **Supabase's PKCE flow requires same-browser-session cookies.** A magic link clicked in a different browser will fail with "PKCE code verifier not found." Token-hash flow (`verifyOtp({token_hash, type})`) is cross-browser safe but needs a custom email template (custom SMTP).
- **For OAuth providers, the redirect URI registered with the IdP** (Google Cloud Console, Apple, etc.) goes to **Supabase's** `/auth/v1/callback`, NOT our `/auth/callback`. The Supabase URL is what Google etc. need.

### Next.js
- **A stray `package.json` higher up in the filesystem** (e.g. `~/package.json`) makes Next.js infer the wrong workspace root. Set `outputFileTracingRoot: path.join(__dirname, '../..')` in `next.config.ts` to pin it.
- **`themeColor` in `metadata` is deprecated** — move it to a `viewport` export. Currently noisy but not blocking.

### Monorepo
- **Every workspace package that uses the shared `tsconfig.base.json`** must list `@whosplaying/config` in its `devDependencies`. TypeScript's `extends` does node resolution, so the package must be installed locally even if it's a workspace package.
- **`require()` shared JS modules in TypeScript files** when they don't ship types (e.g. `tailwind-preset.js`). `import` errors with implicit-any.

### Dev server
- **Port 3000 sometimes leaves zombie node processes** after Ctrl-C, especially when running through chrome MCP. If `curl localhost:3000` hangs: `lsof -ti:3000 | xargs -r kill -9` then restart.

## Things not to do

- Do not add multi-tenant subdomain routing. This is a single-tenant consumer app.
- Do not model "Artist" and "Band" as the same entity — they are deliberately separate (a person can be in many bands).
- Do not bypass cross-confirmation in `event_performers`. The status flip to `confirmed` requires consensus.
- Do not write features for the admin-pipeline product described in `legacy-planning/` without explicit instruction — that scope was superseded.
