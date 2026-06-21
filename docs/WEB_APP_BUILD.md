# Web App Build — Handoff

Kickoff context for the `apps/web` v2 visual build. Read alongside
[`BRAND.md`](BRAND.md), [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md), and
[`MOBILE_APP.md`](MOBILE_APP.md) (the mobile app is the approved reference).

## TL;DR

The web app is **not** a from-scratch build. It is **structurally complete and
already on the v2 Tailwind preset** (`@whosplaying/ui/tailwind-preset`): working
server-side Supabase auth, marketing + authed app layouts, the `Wordmark`, route
groups, and a calendar/ICS export. What remains is a **visual v2 pass** to bring
each page up to the locked "Live Pin" design, plus two reserved design
decisions (yellow accent + logo mark).

## What's already true (don't redo)

- **Preset wired**: `apps/web/tailwind.config` consumes the shared v2 preset.
  Brand classes (`coral`, `green`, `blue`, `lime`, `purple`, `gold`, `ink-*`,
  `canvas`/`surface`) all resolve. `globals.css` is clean (`@apply bg-paper`
  maps to the v2 canvas via the preset).
- **Retired teal/yellow direction purged** (this session): the `teal` token is
  renamed `green` (semantic confirmed, `#0F6E56`); the retired palette
  (`colors.ts`), `LayeredHeadline`, the stacked-color shadows, and the entire
  `(reference)` design-playground are deleted. See commit
  `refactor(ui): purge the retired teal/yellow direction`.
- **Auth works**: `(app)/layout.tsx` calls `createServerSupabase()` and
  `redirect('/login')` when signed out. `auth/callback/route.ts` handles the
  OAuth/code exchange. `SignOutButton` exists.
- **Data layer exists**: pages use `@whosplaying/supabase` query helpers and the
  generated `Database` types. Billing helpers (`billingQ.createCheckoutSession`/
  `createPortalSession`/`logTicketTap`), `offersQ`, `promotionsQ`, and
  `useEntitlements` are built, typed, and tested against the live DB.

## Reserved design decisions (resolve before/with the build)

1. **Yellow accent.** The retired `yellow` survives only as **stock Tailwind
   yellow** on legacy pages — decide its v2 fate per usage (map to `gold`, the
   waiting/pending semantic? `lime`? drop it?). Remaining files:
   - `apps/web/app/login/page.tsx`
   - `apps/web/app/(app)/me/ProfileForm.tsx`
   - `apps/web/app/(app)/me/venues/new/NewVenueForm.tsx`
   - `apps/web/app/(app)/me/venues/page.tsx`
   - shared legacy primitives (see below)
   - Also kill the dead `shadow-stack-yellow` / `shadow-stack-coral` classes
     (the stacked-shadow look is retired; the classes aren't even defined in the
     preset, so they're no-ops).
2. **Logo mark.** `packages/ui/src/brand/LogoMark.tsx` is still the **fully
   retired** mark (hardcoded teal `#0AA3A3` + yellow `#FFCB05` + old coral). It
   is exported but **rendered nowhere**. Needs the v2 **Live Pin** mark (location
   pin + play triangle + signal waves, coral) drawn as SVG with the
   `full` / `compact` / `mark-only` variants per [`BRAND.md`](BRAND.md). Brand
   artifact → get visual sign-off; don't improvise.

## Legacy shared primitives to rebuild

These `packages/ui/src/components` are the "not-yet-rebuilt web primitives." They
render but carry retired styling (`yellow` tone, dead `shadow-stack-*`). The
mobile app does **not** use them (it has its own `apps/mobile/components/ui.tsx`),
so they're effectively web-only. Rebuild to v2 or replace:
- `Button.tsx` — primary/secondary/coral variants still reference stacked shadows.
- `Card.tsx` — `accent` prop uses stacked shadows.
- `Chip.tsx` — `tone` includes `yellow`.
- `EventCard.tsx` — `proposed` status maps to `yellow`.

## Route inventory & status

| Area | Routes | State / notes |
|---|---|---|
| **Marketing** | `/`, `/pricing`, `/for-artists`, `/for-venues`, `/how-it-works` | On preset; landing + pricing redesigned in the 2026-06-14 session (driven by real `FEATURE_MATRIX`). Needs a v2 polish pass. **`/pricing` "Start Venue Pro" still routes to `/login`** — wire to `billingQ.createCheckoutSession` with auth+org context. |
| **App (authed)** | `/calendar`, `/feed`, `/map`, `/messages`, `/me`, `/me/billing`, `/me/venues`, `/me/venues/new` | Auth-gated, on real queries. Transitional styling (the bulk of the remaining `yellow`). `/map` is a placeholder. This is the **web-primary venue management surface** — highest-value to bring to v2. |
| **Public profiles** | `/artist/[slug]`, `/venue/[slug]`, `/event/[id]` | Public (open-access). Match the mobile profile/event fidelity. |
| **Auth** | `/login`, `auth/callback` | Works. Restyle `/login` to v2 (carries retired `yellow` + dead stack shadow). |
| **Admin** | `/admin`, `/admin/sales`, `/admin/maintenance` | **Intentionally utilitarian / off-brand** (internal tool). Leave as-is unless asked. |
| **API** | `api/ics/[type]/[id]` | Calendar export. No UI. |

## Run & verify

```
pnpm --filter @whosplaying/web dev      # next dev on :3000
pnpm --filter @whosplaying/web typecheck
pnpm --filter @whosplaying/web lint      # next lint --max-warnings=0
```

Prefer the `preview_*` tools (not raw curl/Chrome) to drive and screenshot the
dev server. Per project rule, show rendered UI for sign-off before finalizing
([[feedback_visual_approval]]).

## QA gate (per `DESIGN_SYSTEM.md` §6, applied to each web page)

1. Coral only on primary actions / active state.
2. Primary button = coral gradient; status pills use the semantic map
   (`green` confirmed, `gold` waiting, `blue` open, slate muted).
3. Tabler icons only; no emoji; **no retired colours**.
4. No brand-spec boards rendered in production pages (the repeated past failure).
5. Renders against the matching `prototype.html` / mobile screen with no drift.

## Gotchas

- **Stale `.next` after route deletion**: deleting the `(reference)` routes left
  a stale `.next/types/validator.ts` referencing them. `pnpm --filter
  @whosplaying/web clean` (or any fresh `dev`/`build`) clears it. Source
  typechecks clean.
- **Workspace root**: `next.config.ts` pins `outputFileTracingRoot` to the repo
  root — keep it, or a stray higher-up `package.json` mis-infers the root.
- **Port 3000 zombies**: `lsof -ti:3000 | xargs -r kill -9` if a dev server hangs.
- **Auth redirect URLs** are exact-match (no query-string wildcards) — see the
  Supabase gotchas in the root `CLAUDE.md`.
