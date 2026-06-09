# WhosPlaying — Task & Issues Log

**How to use this log:** Update at the start and end of every working session.
The agent (Claude Code or otherwise) reads this first, writes to it last.
Decisions are append-only — never delete, only supersede with a new entry.

---

## Active phase

**Phase 0 — Design Reset.** See `phases/phase-0-design-reset/`.

---

## Active issues

| ID | Title | Status | Owner | Phase | Notes |
|---|---|---|---|---|---|
| P0.9 | James sign-off on Phase 0 — required before Phase 1 brief is generated | Awaiting review | James | 0 | Visual review of `/welcome`, `/discover`, `/e/sample-event`, `/headline-demo`, `/reference/map` on the local Next dev server |

---

## Completed

| ID | Title | Closed | Outcome |
|---|---|---|---|
| P0.0 | Orient & sync planning docs into repo | 2026-06-09 | Planning docs copied into `docs/build/`; baseline `pnpm typecheck && pnpm lint` made clean (added root ESLint flat config + `typescript-eslint`, `@types/node` for mobile, ignored `tsconfig.tsbuildinfo`) |
| P0.1 | Brand audit | 2026-06-09 | `docs/build/specs/BRAND_AUDIT.md` written; gap report identifies missing `<LayeredHeadline>`, missing deliberate body face, missing flat token map, drifted per-family tone shape, missing active-pin map layer, missing first-impression composition |
| P0.2 | Color tokens | 2026-06-09 | `packages/ui/src/tokens/colors.ts` rewritten — every signature family exposes `tint-2 / tint-1 / base / shade-1 / shade-2`; flat `colorTokens` map exported for preset; numeric scale aliases preserved for back-compat |
| P0.3 | Type tokens | 2026-06-09 | `packages/ui/src/tokens/typography.ts` rewritten — Barlow Condensed Italic Black display kept, **Inter replaced with DM Sans** as body face (deliberate, documented in file header), JetBrains Mono for mono; canonical `typeScale` exported; `next/font` wired into `apps/web/app/layout.tsx` with `--font-display`, `--font-body`, `--font-mono` CSS variables |
| P0.4 | `<LayeredHeadline>` primitive | 2026-06-09 | `packages/ui/src/components/LayeredHeadline.tsx` — stacked-span web implementation, a11y-correct (`aria-hidden` color layers), no entrance animation by default (reduced-motion safe), exported from `@whosplaying/ui`; demo at `/headline-demo` shows four sizes × three palette variants |
| P0.5 | Tailwind preset + NativeWind wiring | 2026-06-09 | `packages/ui/tailwind-preset.js` rewritten to expose canonical `tint-2/tint-1/base/shade-1/shade-2` paths, new `fontSize` scale keyed to `typeScale`, `font-display`/`font-body`/`font-mono` using `var(--font-*)`; added `stack-layered` triple-stack box-shadow |
| P0.6 | Map style verification | 2026-06-09 | `packages/ui/src/brand/map-style.json` reconciled — palette annotated in metadata, `pin-active` (coral), `pin-confirmed` (teal), `pin-proposed` (yellow) circle layers added against a `wp-events` GeoJSON source; text-font swapped Inter Medium → DM Sans Medium; preview at `/reference/map` |
| P0.7 | Reference: Welcome | 2026-06-09 | `/welcome` renders headline "Live music tonight. Walk to it." with stacked layered-color shadows, four event cards using JAX Beach sample data, soft CTAs, no above-the-fold credential ask |
| P0.8 | Reference: Discovery | 2026-06-09 | `/discover` renders three client-side tabs (Tonight/Tomorrow/Weekend), eight cards per tab from `_data/sample-events.ts`, map teaser below |
| P0.9 (build) | Reference: Event Detail | 2026-06-09 | `/e/sample-event` renders hero, layered-headline title, performer block, venue block with map snippet, mono-typed timestamps, .ics download, OpenGraph payload with placeholder SVG image at `/og/sample-event.svg` |
| P0.10 | OG image spec | 2026-06-09 | `docs/build/specs/OG_IMAGE.md` — `@vercel/og` renderer, deterministic palette by id hash, font loading, 24h edge cache with `?v=<updated_at>` busting, fallback to Cloudflare Worker documented |
| P0.11 | Welcome narrative | 2026-06-09 | `docs/build/specs/WELCOME_NARRATIVE.md` — what they see / feel / do, plus a six-point Phase 1 implementation contract |
| P0.12 | Update task log | 2026-06-09 | This row. |

---

## Decisions log

**2026-06-09 — Restart sequencing with design first.**
The prior plan had design treated as token cleanup at the end. Re-evaluation
identified design execution as the root of the "bland / stale / unwelcoming"
complaint. New plan inverts the order: design tokens and reference
compositions ship before any new feature code.

**2026-06-09 — No paid AI API until revenue exists.**
Theo's AI-assisted event intake is deferred indefinitely. Any feature that
assumed an LLM call is either redesigned to be deterministic (OpenGraph image
generation, social post graphics) or pushed to a phase after monetization.

**2026-06-09 — Add `provisional` event status with audit-logged override.**
Cross-confirmation as an absolute invariant breaks Rick's last-minute fill
workflow. Resolution: a new `provisional` status plus an explicit override
path that writes to an audit log. The invariant survives. Implementation
deferred to Phase 3 when the schema is reopened.

**2026-06-09 — iOS + web first, Android later.**
Android is pushed to Phase 5 or later. iOS App Store rules also require
Apple Sign-In whenever any other social auth ships, which constrains the
Phase 1 auth design.

**2026-06-09 — Browse before signup.**
Music-goers see real local event content on web and mobile before any
credential ask. This is a Phase 0 / Phase 1 architecture decision, not a
later optimization. Identified by Priya, Mel, and Theo independently in the
Discovery Round.

**2026-06-09 — Body face is DM Sans, not Inter.**
The brand brief in `CLAUDE.md` explicitly excludes Inter and Tailwind
defaults for the body face. Picked DM Sans: warm low-contrast geometric
sans, six weights on Google Fonts, available on Expo Font, slight rounded
counters that echo the LogoMark. Rationale documented in the file header
of `packages/ui/src/tokens/typography.ts`. The display face (Barlow
Condensed Italic Black, already shipped in the Wordmark) stays.

**2026-06-09 — Reference compositions live under a `(reference)` route
group, not under `/dev/`.**
The three Phase 0 reference URLs (`/welcome`, `/discover`,
`/e/sample-event`) sit at the URLs they will occupy in production. The
group folder `apps/web/app/(reference)` carries a shared layout so the
demo navigation is one place. Phase 1 wires real data behind the same
URLs; reference pages get superseded by the production pages, not moved.

**2026-06-09 — Phase 0 complete, awaiting James's visual sign-off.**
All seven Phase 0 deliverables exist: color tokens, type tokens,
`<LayeredHeadline>` primitive, Tailwind preset reconciliation, map
style reconciliation, three reference compositions, three specs
(`BRAND_AUDIT.md`, `OG_IMAGE.md`, `WELCOME_NARRATIVE.md`).
`pnpm typecheck && pnpm lint` pass clean. Phase 1 brief is NOT to be
generated until James posts sign-off in this log under a follow-on entry.

**2026-06-09 — Design pivot: Editorial Magazine direction (Option A).**
James reviewed the initial reference compositions and rejected the
visual direction: saturated tropical palette + Barlow Condensed Italic
Black + the `<LayeredHeadline>` offset-shadow mechanic read as
"70's porn site" rather than as a music product. After presenting five
distinct visual options (Editorial Magazine / Concert Poster /
Brutalist Grid / Late-Night Marquee / Streaming Familiar), James chose
**A — Editorial Magazine**, modeled on the *Music for Everyone* NicePage
reference (light grounds, big quiet serif headlines, generous
whitespace, one muted accent, neutral plate photography stand-ins,
magazine-rhythm sections).

Scope of the pivot:
- The three reference compositions (`/welcome`, `/discover`,
  `/e/sample-event`) are rebuilt from scratch against the editorial
  language.
- `<LayeredHeadline>` is **retired** from the references but remains in
  `packages/ui` for now — it may still serve isolated brand moments
  (the Wordmark already uses it conceptually) and removing it from the
  package risks breaking the existing marketing splash. Decision on
  full retirement deferred to Phase 1.
- The saturated brand palette stays in tokens but the references use
  only off-white, ink, and **one** muted accent (`teal.shade-1`,
  `#068585`). Other brand colors are kept on file for future Phase 1
  decisions.
- Display face on the references switches from Barlow Condensed Italic
  Black to **Fraunces** (contemporary serif, variable weight, free on
  Google Fonts, italic stylistic-set support, paired with DM Sans body
  and JetBrains Mono for metadata). Fraunces is added as `font-editorial`
  in the Tailwind preset alongside the existing `font-display` (the
  display face is preserved for non-editorial surfaces).
- Photo stand-ins switch from saturated brand-palette gradient blobs to
  neutral warm-gray plates with a single quiet artist initial in
  serif italic. Reads as "the photograph goes here," not as decoration.
- The Wordmark in the masthead is unchanged in this pass — it still
  carries the layered tropical colors. Whether the Wordmark itself
  needs an editorial variant is a Phase 1 decision.

**2026-06-09 — Going forward, reference designs flow through chat
screenshots.**
James will paste reference screenshots directly into chat for the agent
to read. No design-specialist MCP installed at this time. The official
Figma MCP and shadcn/ui MCP were surfaced as longer-term options but
declined for the current scope.

---

## Notes on the database project

The Supabase project ref provided (`pakzhnwumihecyfcjfln`) is in an
organization the MCP connector cannot currently access. This is not a
blocker for Phase 0 — that phase produces design specs and reference UI
only. Database work resumes in Phase 3. If live DB introspection is needed
before then, either grant the connector access to that organization or
provide the relevant migration contents directly.

---

## Standing reminders

- Run `pnpm typecheck && pnpm lint` before every commit.
- Web and mobile ship together. Do not merge a feature on one client without
  the parity on the other.
- `legacy-planning/` is fenced. Do not pull from it without an explicit
  decision logged here.
