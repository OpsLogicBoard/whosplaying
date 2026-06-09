# Phase 0 — Design Reset

**Goal:** Take the brand vision documented in `CLAUDE.md` and turn it from
words into rendered reality. Produce design tokens, the signature type
primitive, and three reference compositions that demonstrate what the rest
of the product should feel like.

**Outcome by end of phase:** James can open three live URLs (Welcome,
Discovery, Event Detail) and recognize the brand. Every later phase
inherits the tokens, primitives, and visual grammar built here.

**Phase 0 produces no new business logic and no schema changes.** It
produces tokens, one reusable component, three reference screens, and a
specification for OpenGraph image generation.

---

## Why this phase exists

The verbal diagnosis from James was direct: *the design is bland, the
authentication is not user-friendly, and the production is stale*. The
re-evaluation traced this to three causes:

1. The brand vision in `CLAUDE.md` — *layered/overlapping type with offset
   color shadows in teal, yellow, coral, and orange* — was specified but
   never rendered as a reusable primitive. What ships looks like default
   Tailwind.
2. The auth flow is technically correct but presents a credential wall
   before any value is shown.
3. There is no first-impression composition that demonstrates what the
   product is for in the first three seconds.

Phase 0 fixes the first cause directly. It enables Phase 1 to fix the
second and third.

---

## Deliverables

### 1. Color tokens

File: `packages/ui/src/tokens/colors.ts` (or extend the existing file).

Define the four signature colors, neutrals, and semantic mappings:

- `teal` — primary ground, water on map, hero accents
- `yellow` — secondary accent, callouts
- `coral` — primary action, active map pins
- `orange` — tertiary accent, hover and emphasis states
- `paper` — warm off-white for map land and content backgrounds
- `ink` — near-black for body text and high-contrast type
- `mute` — supporting greys, one warm one cool

Each color exposes a base value plus at least two tints and two shades for
hover, focus, and disabled states. Tokens drive the Tailwind preset for web
and NativeWind for mobile — one source, two consumers.

### 2. Type tokens and the `<LayeredHeadline>` primitive

The brand's signature element. A headline composed of overlapping copies
of the same text, offset by a small distance, each copy a different color
from the palette. The reader sees one headline; the eye registers the
layered color underneath.

Deliverables:

- A type scale in `packages/ui/src/tokens/type.ts` (display / heading /
  body / caption / mono) with families, weights, line-heights, and
  tracking.
- A display face chosen deliberately — not Inter, not the Tailwind default.
  Recommended direction: a high-contrast geometric or condensed sans with
  strong character at large sizes. Document the choice in the file header.
- A body face that pairs cleanly and is legal for both Google Fonts (web)
  and Expo Font (mobile).
- A `<LayeredHeadline>` component in `packages/ui/src/components/` that
  accepts a string, a depth (`number`, default 3), an offset (`x, y` in
  px), and a palette key (defaulting to the canonical teal/yellow/coral
  sequence). Renders identically on web (CSS `text-shadow` or stacked
  absolutely-positioned spans) and mobile (React Native stacked `Text`
  nodes with `transform`).
- A Storybook-style demo route or page that shows the primitive at four
  sizes and three palette variants.

### 3. Map style verification

The custom MapLibre style at `packages/ui/src/brand/map-style.json` was
specified as teal water, warm paper land, coral pins for active shows.
Audit the current file against the new color tokens. If drift exists,
update the JSON to reference the canonical values.

### 4. Three reference compositions

Built as static Next.js routes under `apps/web/app/(reference)/`. Mobile
parity is *not* required in Phase 0 — these exist to validate the brand on
the web client first because iteration speed is faster there.

**Reference 1 — Welcome.**
The first thing a brand-new user sees. Lead with a `<LayeredHeadline>`
that states what the product is in plain language. Below it, a live
preview of "tonight in JAX Beach" — three or four real-feeling event cards
that the user can read and scroll without signing in. A single primary
action ("See more tonight") and a secondary text link ("I'm an artist" /
"I'm a venue"). No credential ask. The auth invitation appears further
down or on the next screen.

**Reference 2 — Public Discovery.**
The list view a music-goer hits after the welcome screen. Three tabs:
*Tonight*, *Tomorrow*, *Weekend*. Each event card carries venue, artist,
start time, distance, and one photograph. Below the list, a teaser of the
map. Card density tuned for phone-sized viewports first; web layout
expands to a two-column grid above tablet breakpoints. No login required.

**Reference 3 — Event Detail.**
A shareable, beautiful page. Lives at `whosplaying.live/e/<slug>`. Hero
image, layered-headline event title, performer(s) with their primary band
context, venue with map preview, start time, "Add to calendar" button (no
login), "Follow this artist" and "Save this venue" calls-to-action that
*do* require sign-in but degrade gracefully ("Sign in to save"). The page
must render server-side and expose a complete OpenGraph payload — see
Deliverable 5.

Each reference composition is hardcoded with realistic JAX Beach sample
data. No fetches, no auth context, no database dependency in Phase 0.

### 5. OpenGraph image generation specification

A written spec (not yet implemented in code — that is Phase 1) describing
the deterministic pipeline that produces a 1200×630 PNG for every event
and venue page. Constraints:

- No AI API. The renderer composes from event data and brand primitives.
- Server-side rendering via a Next.js Route Handler at `/og/event/[id]`
  and `/og/venue/[slug]`, using a Satori-style HTML-to-image renderer
  (likely `@vercel/og`, already free on Vercel) or a Cloudflare Worker
  equivalent if Vercel costs become a concern.
- The image uses the same `<LayeredHeadline>` mechanic — event title in
  layered type, venue + date below, brand mark in corner, optional
  performer photograph as background with a translucent overlay.
- The spec lives at `docs/build/specs/OG_IMAGE.md` and is the input to
  Phase 1.

### 6. Welcome screen narrative draft

A short written document — `docs/build/specs/WELCOME_NARRATIVE.md` —
describing what the user experiences in their first 10 seconds. Words and
flow, not code. This becomes the source for the Phase 1 first-run
implementation and is the explicit answer to "the authentication is not
user-friendly and welcoming."

### 7. Brand audit report

A written document — `docs/build/specs/BRAND_AUDIT.md` — produced by the
agent after reading the current `packages/ui/` tree and the rendered
state of the existing apps. Lists what currently exists, what conflicts
with the new tokens, and what must be replaced versus what can be kept.
This is the bridge document so Phase 1 starts with a clean inventory.

---

## Out of scope for Phase 0

- Any change to authentication code or Supabase auth configuration.
- Any new database tables or RLS policies.
- Mobile (Expo) parity of the three reference compositions.
- Real data fetching of any kind.
- Push notifications, calendar integration, map interactivity beyond
  static render.
- Any feature from the persona feature inventory not explicitly listed
  above.

---

## Acceptance criteria

Phase 0 is complete when **all** of the following are true:

1. `pnpm typecheck && pnpm lint` pass clean across the workspace.
2. Color and type tokens are defined and consumed by the Tailwind preset.
3. `<LayeredHeadline>` is implemented in `packages/ui` and demonstrated at
   four sizes and three palette variants on a single demo page.
4. The three reference compositions render at `/welcome`, `/discover`,
   and `/e/sample-event` on the Next.js dev server with the brand
   tokens applied throughout.
5. `docs/build/specs/OG_IMAGE.md`, `docs/build/specs/WELCOME_NARRATIVE.md`,
   and `docs/build/specs/BRAND_AUDIT.md` exist and are complete.
6. James has visually reviewed `/welcome`, `/discover`, and
   `/e/sample-event` and recorded sign-off in `TASK_LOG.md`.

Criteria 1 through 5 are work for Claude Code. Criterion 6 is a human gate.

---

## Handoff to Phase 1

When Phase 0 closes, the Phase 1 brief is generated against the same
template as this one. Phase 1 implements the real auth flow, wires the
three reference compositions to real data sources, and brings mobile to
parity with web on those three screens.

The signature primitive built in Phase 0 — `<LayeredHeadline>` — should
appear in every Phase 1 screen that needs identity. If a Phase 1 screen
is built without it and without a written reason, the design intent has
drifted.

---

## Key takeaways

- Phase 0 is design execution, not design discussion. Tokens, one
  component, three pages, three specs.
- No business logic, no schema, no auth changes.
- The signature element is the `<LayeredHeadline>` mechanic. Spend the
  design boldness there. Keep everything around it disciplined.
- Phase 0 ends with a human sign-off, not an automated test.
