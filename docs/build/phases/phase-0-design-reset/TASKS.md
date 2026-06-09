# Phase 0 — Tasks

This list is the execution checklist for Claude Code. Tasks are ordered.
Each task names the files it touches, what it produces, and how to verify
it. Do not move on until the previous task verifies.

---

## Task P0.0 — Read and orient

**Read, in order:**
1. `docs/build/BUILD_PLAN.md`
2. `docs/build/TASK_LOG.md`
3. `docs/build/phases/phase-0-design-reset/README.md`
4. `CLAUDE.md` (root)
5. `docs/ARCHITECTURE.md`

**Do not write anything yet.** Confirm understanding by appending a single
"phase started" entry to `TASK_LOG.md` under Active Issues with today's
date.

---

## Task P0.1 — Brand audit

**Output:** `docs/build/specs/BRAND_AUDIT.md`

Walk the current `packages/ui/` tree. For each existing file under
`tokens/`, `brand/`, and `components/`, document:

- What the file currently contains
- Whether it aligns with the brand vision in `CLAUDE.md`
- What should be kept, replaced, or extended

Also walk `apps/web/app/` and list every existing route. For each route,
note whether it carries any branded styling or runs on Tailwind defaults.

End the audit with a one-paragraph summary: *here is what currently exists,
here is the delta to the brand vision, here is the plan for Phase 0*.

**Verification:** James reads the file and accepts the gap report.

---

## Task P0.2 — Color tokens

**File:** `packages/ui/src/tokens/colors.ts`

Define the canonical palette. Names and hex values are your call as the
design-execution agent, but the families must be:

- `teal` — must read as ocean / pool, not corporate teal
- `yellow` — must read as warm sun, not safety yellow
- `coral` — must read as alive and inviting, not pink
- `orange` — must read as adjacent to coral, deeper and warmer
- `paper` — warm off-white, the map's land color
- `ink` — near-black with a hint of warmth, never pure `#000`
- `mute.warm` and `mute.cool` — two grey families for supporting type

Each named color exposes five tones: `tint-2`, `tint-1`, `base`, `shade-1`,
`shade-2`. Export both the raw object and a flat token map for the
Tailwind preset to consume.

**Verification:** Hex values render correctly when imported into a quick
demo route. No values that read as "Bootstrap default" or "Tailwind slate."

---

## Task P0.3 — Type tokens

**File:** `packages/ui/src/tokens/type.ts`

Define the type system:

- `families.display` — the signature face. Pick deliberately. Document the
  rationale in the file header. Acceptable categories: high-contrast
  geometric sans, condensed display sans, expressive serif. Not Inter, not
  system-ui, not the Tailwind default.
- `families.body` — pairs with display. Legible at 14–18px. Available on
  both Google Fonts and Expo Font.
- `families.mono` — for data, codes, time stamps. One choice, used
  sparingly.
- `scale` — at minimum: `display`, `h1`, `h2`, `h3`, `body`, `body-sm`,
  `caption`. Each entry carries `size`, `lineHeight`, `letterSpacing`,
  `weight`.

Wire the families into `apps/web/app/layout.tsx` via `next/font` and into
`apps/mobile` via `expo-font` (the mobile wiring can be stubbed if the
font files are not yet available; mobile parity is not a Phase 0 gate).

**Verification:** A test page renders all type scale entries and the body
text reads cleanly at three viewport sizes.

---

## Task P0.4 — `<LayeredHeadline>` primitive

**Files:**
- `packages/ui/src/components/LayeredHeadline.tsx` (web + mobile, one file
  if reasonable using platform-specific extensions or `Platform.select`)
- `packages/ui/src/components/LayeredHeadline.stories.tsx` or an equivalent
  demo route

**API:**
```tsx
<LayeredHeadline
  depth={3}                          // number of layered copies
  offset={{ x: 4, y: 4 }}            // px between layers
  palette={['teal', 'yellow', 'coral']}  // bottom-to-top color order
  size="display"                     // type scale key
>
  Tonight in JAX Beach
</LayeredHeadline>
```

**Behavior:**
- The top layer is rendered in `ink`.
- Lower layers are rendered in the palette colors, each offset from the
  top layer.
- The component is accessible — only the top text layer is exposed to
  screen readers; the color layers are `aria-hidden`.
- The component respects `prefers-reduced-motion` (no animated entrance
  unless explicitly enabled).
- Resizing the viewport scales the offset proportionally.

**Verification:** The demo page renders the primitive at sizes `display`,
`h1`, `h2`, `h3` and with three palette variants. Looks intentional, not
gimmicky. James approves visually before moving on.

---

## Task P0.5 — Tailwind preset and NativeWind wiring

**Files:**
- `packages/ui/tailwind-preset.js`
- Confirm imports in `apps/web/tailwind.config.ts` and
  `apps/mobile/tailwind.config.js`

The preset exposes:

- `theme.extend.colors` — the full color token tree (`teal.base`,
  `teal.tint-1`, etc.)
- `theme.extend.fontFamily` — display, body, mono
- `theme.extend.fontSize` — the type scale
- `theme.extend.boxShadow` — at least one branded shadow that uses the
  offset-color mechanic on a card

**Verification:** A quick test class like `<div class="bg-teal-base
text-paper">` renders the canonical values on the web dev server.

---

## Task P0.6 — Map style verification

**File:** `packages/ui/src/brand/map-style.json`

Open the existing style. Confirm it uses the canonical color tokens for
water (teal), land (paper), and active pins (coral). If the file
references hardcoded hex values that drift from the new tokens, update
them. Do not rewrite the style from scratch — this is reconciliation, not
authorship.

**Verification:** A quick MapLibre preview route at `/reference/map` shows
the JAX Beach area with the corrected colors. *Mobile preview is optional
in Phase 0.*

---

## Task P0.7 — Reference composition: Welcome

**Route:** `apps/web/app/(reference)/welcome/page.tsx`

Static page. No data fetches. Layout:

1. `<LayeredHeadline>` at `display` size — "Live music. Tonight. Walkable."
   *(or a stronger headline if the agent has a better one — log the
   decision in `TASK_LOG.md`).*
2. A single supporting paragraph in body type, two sentences maximum.
3. A horizontally scrollable strip of four event cards using realistic
   JAX Beach sample data (venue, artist, time, distance, one photo each).
4. A primary action button — "See more tonight" — linking to `/discover`.
5. Two small secondary links at the bottom — "I'm an artist" /
   "I'm a venue".
6. No credential field, no sign-in button above the fold.

The page renders cleanly at 375px, 768px, and 1280px viewport widths.

**Verification:** Page loads at `http://localhost:3000/welcome` and reads
as inviting, not as a marketing splash.

---

## Task P0.8 — Reference composition: Public Discovery

**Route:** `apps/web/app/(reference)/discover/page.tsx`

Static page. Three tabs: *Tonight*, *Tomorrow*, *Weekend*. Each tab shows
eight event cards using realistic JAX Beach sample data. Below the cards,
a static map preview using the corrected style file (Task P0.6).

Card anatomy:
- Photograph (3:4 or 4:5 aspect)
- Artist name (in body display weight, not headline-layered)
- Venue name + neighborhood
- Start time (mono family for the timestamp)
- Distance from a fixed point in JAX Beach

Cards are not interactive in Phase 0. Hover state lifts the card and
reveals a subtle teal/coral border. That's it.

**Verification:** Page loads at `/discover`, all three tabs switch
client-side, and the layout feels organized and walkable.

---

## Task P0.9 — Reference composition: Event Detail

**Route:** `apps/web/app/(reference)/e/sample-event/page.tsx`

The shareable, beautiful page. Layout:

1. Hero image (artist photograph) with a translucent ink overlay.
2. `<LayeredHeadline>` event title overlaid on the hero.
3. Performer block — name, primary band context, "Follow" CTA (disabled
   with a "Sign in to follow" tooltip).
4. Venue block — name, address, static map snippet, walking distance.
5. Start time and door time, mono family.
6. "Add to calendar" button — links to a static `.ics` file shipped in
   `apps/web/public/` for the sample event. No auth required.
7. Footer block — share buttons (Twitter / Instagram intent / copy link).

The page exposes a complete OpenGraph payload in its `<head>` using the
spec from Task P0.10. The actual image generation is stubbed — link to a
placeholder static PNG in `public/og/sample-event.png` for Phase 0.

**Verification:** Page loads at `/e/sample-event`. Pasting the URL into a
share preview tester (Twitter Card Validator, LinkedIn Post Inspector)
shows the static placeholder image and correct meta tags. Implementation
of the dynamic image happens in Phase 1.

---

## Task P0.10 — OpenGraph image spec

**File:** `docs/build/specs/OG_IMAGE.md`

Write the specification. Cover:

- Image dimensions (1200×630) and supported aspect ratios for other
  platforms (square for Instagram).
- Renderer choice — `@vercel/og` if hosting stays on Vercel, fallback
  options documented.
- Composition rules: where the `<LayeredHeadline>` sits, where the venue
  text sits, where the date sits, where the brand mark sits.
- Color rules: which palette variant is used and how it's chosen
  deterministically from event data (so the same event always produces
  the same image).
- Font loading inside the renderer (Satori requires explicit font fetches).
- Caching strategy: image is cacheable on the edge for at least 24 hours
  with a cache-busting key tied to event `updated_at`.

This file is a specification only. Implementation is Phase 1.

**Verification:** A second engineer (or the same agent in a separate
session) could implement the renderer from this spec without asking
follow-up questions.

---

## Task P0.11 — Welcome narrative draft

**File:** `docs/build/specs/WELCOME_NARRATIVE.md`

A short written walkthrough of the first 10 seconds of a brand-new
user's experience. Three sections:

1. **What they see.** The Welcome page from Task P0.7, described in plain
   words.
2. **What they feel.** One paragraph naming the emotional reaction the
   design is aiming for. The complaint to solve: *cold, unwelcoming,
   asks for credentials before showing value*.
3. **What they do.** The two paths forward — "See more tonight" (no
   credential) and "I'm an artist / I'm a venue" (which leads to a soft
   sign-in flow in Phase 1).

This document is the human-readable bridge from Phase 0 design output to
Phase 1 auth implementation. No code.

**Verification:** James reads the file and signs off in `TASK_LOG.md`.

---

## Task P0.12 — Update the task log

**File:** `docs/build/TASK_LOG.md`

For every task that closed, move the row from Active Issues to Completed
with the date and a one-line outcome. Add a "Phase 0 complete, awaiting
sign-off" entry under Decisions log.

**Verification:** The log accurately reflects Phase 0's state.

---

## Task P0.13 — Hand back to James

**Action:** Stop. Do not begin Phase 1.

Post a single message summarizing:
- Reference URLs for visual review
- Files added or modified
- Any decisions made that diverged from the brief (with rationale)
- A direct ask for sign-off

James will reply with sign-off, revisions, or both. Only after sign-off
does the Phase 1 brief get generated.

---

## Order and parallelism

Tasks **P0.1 through P0.6** are sequential — each builds on the previous.

Tasks **P0.7, P0.8, P0.9** can run in parallel once P0.6 is done. They
share the same primitive and tokens but are independent screens.

Tasks **P0.10 and P0.11** can run in parallel with the reference
compositions — they are documents, not code.

Task **P0.12** is last.

---

## Definition of done for the phase

- All criteria in `README.md → Acceptance criteria` pass.
- `TASK_LOG.md` is accurate.
- A Phase 1 brief has *not* been started.
