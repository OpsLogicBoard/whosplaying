# Brand Audit — Phase 0 Inventory

**Date:** 2026-06-09
**Auditor:** Claude Code (Phase 0)
**Scope:** Everything under `packages/ui/` and every route under `apps/web/app/`.

---

## Summary

The repo already ships a recognizable brand starter — the four signature
colors are named, the Wordmark and LogoMark are layered SVGs, and the
existing `(marketing)` page uses the offset-shadow card mechanic. The
gap to the brand vision is not that the language is missing; it's that
the language stops at the marketing splash. Inside `(app)` routes, on
the auth and event pages, and across the UI primitives, the look reverts
to default Tailwind: white card on grey background, Inter at default
weights, no layered type, no offset-color shadows. Phase 0's job is to
codify the existing direction as **tokens**, build the missing
`<LayeredHeadline>` primitive so the layered-type mechanic is reusable
(not just baked into the Wordmark SVG), and prove the system works on
three reference compositions.

---

## `packages/ui/src/tokens/`

| File | What it is | Aligned with brand? | Verdict |
|---|---|---|---|
| `colors.ts` | Four signature hues (teal, yellow, orange, coral) + ink + paper, exposed as 50–900 scales on teal, narrower on the rest. Matches `docs/BRAND.md` exactly. | Yes — the named hues *are* the brand. | **Keep + extend.** Phase 0 will normalize every family to the same five-tone shape (`tint-2 / tint-1 / base / shade-1 / shade-2`) so the preset has predictable token paths, and add a flat token map export for the Tailwind preset to consume. Hex values are kept (they're already correct per `BRAND.md`). |
| `typography.ts` | Two families (Barlow Condensed display, Inter UI) + a size scale, weight scale, line-height scale. | Partially. The display face is a deliberate choice and matches the Wordmark. The UI face is Inter — the brand brief says *not Inter, not Tailwind default*. | **Replace UI face; keep display.** Phase 0 will swap Inter for a pairing that reads warmer and isn't the default — see `families.body` decision in P0.3. Display stays Barlow Condensed Italic Black. Mono is added (currently only on web, declared but no Expo wiring). |
| `radii.ts` | 4-pt rounded scale (`sm / md / lg / xl / pill`). | Yes. | **Keep as-is.** |
| `spacing.ts` | 4-pt grid extending to 32×4 = 128px. | Yes. | **Keep as-is.** |
| `shadows.ts` | Two soft drop-shadows (`card`, `lift`) and four `stack-*` hard-offset colored shadows — the brand signature in shadow form. | Yes — this is the *card* version of the layered mechanic. | **Keep.** The `<LayeredHeadline>` primitive (P0.4) is the *type* version of the same mechanic; the two compose. |
| `index.ts` | Re-exports the above. | Yes. | **Keep — extend to re-export new tokens.** |

## `packages/ui/src/brand/`

| File | What it is | Aligned? | Verdict |
|---|---|---|---|
| `Wordmark.tsx` | SVG. Three stacked text passes (teal shadow, yellow shadow, white face with ink stroke) of "Who's Playing" in Barlow Condensed Italic Black. The layered mechanic, applied to the brand lockup. | **Yes — exemplary.** This is the artifact that demonstrates the layered/overlapping vision in code today. | **Keep — do not edit.** Phase 0's `<LayeredHeadline>` generalizes this mechanic so any string can render the same way. |
| `LogoMark.tsx` | Square mark. Concentric rounded squares (teal → yellow → coral → white face) with `WP` in display italic. | Yes. | **Keep.** |
| `map-style.json` | Custom MapLibre style: `paper-warm` background, light-teal water (`#8FE8E8` — currently a teal `200`, not `teal.base`), light-teal-50 parks, white roads. No coral pin layer. | **Partial.** Water and land read correct; the active-pin style described in `BRAND.md` ("coral pins for active shows") is not yet defined. Roads at `#FFFFFF` are fine on `paper-warm`, but no contrast on `paper-cool` if that ground is used. | **Reconcile in P0.6.** Confirm the water hue against the canonical `teal` token tree, add a `pin-active` symbol layer that paints coral, and document which color tokens drive each layer. |

## `packages/ui/src/components/`

| File | What it is | Aligned? | Verdict |
|---|---|---|---|
| `Button.tsx` | Four variants (`primary`/`secondary`/`ghost`/`coral`). Primary already uses `shadow-stack-yellow` and a hover translate to expose the offset color — *exactly* the brand mechanic. | Yes — strong. | **Keep.** Phase 0 reference compositions use this as-is. |
| `Card.tsx` | Renders an accent stack shadow (`teal`/`yellow`/`orange`/`coral`/`none`) behind a paper card with an ink-line border. | Yes — this is the card version of the brand mechanic. | **Keep.** |
| `Chip.tsx` | Tonal chips in each palette family. | Yes. | **Keep.** |
| `EventCard.tsx` | Composes Card + Chip. Renders title in `font-display`, status as a chip. Uses `accent="coral"` for specials, `accent="teal"` for confirmed, `accent="yellow"` for proposed/draft. | Yes — semantic palette use. | **Keep as the production card.** Phase 0 reference Discovery composition will use a *visual* card variant with a hero photo (the Card primitive doesn't carry that today); decision is to build that visual variant inline in the reference route rather than expand the production primitive prematurely. |
| `index.ts` | Re-exports. | Yes. | **Keep.** |

**Missing primitive:** `<LayeredHeadline>` — the type-level version of the
offset-color mechanic. The Wordmark hand-implements it in SVG; nothing
else can reuse the technique on arbitrary text. Phase 0 adds it.

---

## `apps/web/app/` route inventory

| Route | Branded? | Notes |
|---|---|---|
| `(marketing)/page.tsx` (home) | **Yes** | Layered color blobs behind the Wordmark, three pillar cards each with a different `stack-*` shadow, three colored CTAs. The closest the existing app gets to the brand vision. |
| `(marketing)/layout.tsx` | Partially | Header uses `paper-cool` ground with Wordmark + colored sign-in button. Footer is `ink` ground — fine but flat. No layered-type mechanic in the chrome. |
| `(marketing)/for-artists/page.tsx` | Likely partial — uses Card/Button primitives but no `<LayeredHeadline>` (doesn't exist yet). |
| `(marketing)/for-venues/page.tsx` | Likely partial — same situation. |
| `(marketing)/how-it-works/page.tsx` | Likely partial — same. |
| `(app)/layout.tsx` | **Unbranded.** Default app shell. |
| `(app)/feed/page.tsx` | **Unbranded.** Tailwind defaults. |
| `(app)/calendar/page.tsx` | **Unbranded.** |
| `(app)/map/page.tsx` | **Unbranded** chrome; map itself loads the custom style if wired. |
| `(app)/me/page.tsx`, `(app)/me/venues/*` | **Unbranded** forms on default-Tailwind surfaces. |
| `(app)/messages/page.tsx` | **Unbranded.** |
| `(app)/SignOutButton.tsx` | Uses the Button primitive — branded. |
| `login/page.tsx` | **Unbranded.** First-impression auth page; this is the screen James named as "not user-friendly and welcoming." Phase 1 fixes it; Phase 0 produces the narrative spec (`WELCOME_NARRATIVE.md`). |
| `auth/callback/route.ts` | Server route, no UI. |
| `artist/[slug]/page.tsx` | Public profile page — **unaudited brand state**; assume unbranded by default. Phase 0 does not touch it. |
| `venue/[slug]/page.tsx` | Same — unbranded. Phase 0 does not touch it. |
| `event/[id]/page.tsx` | The real event detail page. **Unbranded today.** Phase 0 builds the *reference* version at `/e/sample-event`; Phase 1 wires it to real data. |
| `share/event/[id]/route.ts`, `api/ics/[type]/[id]/route.ts` | Server routes. |

**Pattern:** Branded surfaces stop at the marketing splash. Once a user
crosses into the app or into a real public profile, the design reverts
to Tailwind defaults. Phase 0 cannot fix that everywhere — the three
reference compositions are the proof that it *should* be fixed
everywhere, and Phase 1+ inherits the tokens and primitive to do so.

---

## Gap report — the delta to the brand vision

What exists and is right:
- Color tokens match `docs/BRAND.md` exactly.
- The Wordmark is the layered mechanic incarnate.
- Button, Card, Chip, EventCard already use the offset-color shadow language.
- The map style is more than 80% there.

What's missing:
- **A reusable type-level layered mechanic.** Today only the Wordmark
  does it. Headlines on every other page are flat. Phase 0 adds
  `<LayeredHeadline>`.
- **A deliberate body face.** Inter is the default. The brand brief
  explicitly excludes it. Phase 0 swaps in a paired body face.
- **A flat token map.** The preset hand-duplicates hex values from
  `colors.ts` (drift risk). Phase 0 makes the preset import the token
  module directly.
- **Per-family tone consistency.** `teal` has 50–900; `yellow` only has
  300–600; `orange` only 400–600; `coral` only 400–600. Phase 0
  normalizes the four signature families to a shared five-tone shape
  (`tint-2 / tint-1 / base / shade-1 / shade-2`).
- **An active-pin layer in the map style.** Coral pins on active shows
  are spec'd in `BRAND.md` but not in `map-style.json`. Phase 0
  reconciles.
- **A first-impression composition.** The marketing splash sells the
  product; the Welcome composition needs to *be* the product. Phase 0
  builds it at `/welcome` as a static reference.
- **A public discovery view that demonstrates card density at phone
  widths.** Phase 0 builds it at `/discover`.
- **A shareable event detail page that exposes a complete OpenGraph
  payload.** Phase 0 builds the reference at `/e/sample-event` and
  specs the OG image renderer in `OG_IMAGE.md`.

What can stay untouched in Phase 0:
- Every `(app)` route. Phase 1+ rebrands them once the tokens and
  primitive are in place.
- `legacy-planning/`. Fenced.
- Schema, RLS, edge functions. Out of scope.
- Auth code. Out of scope.

---

## Plan for Phase 0 (one paragraph)

Codify the existing color/type direction as canonical tokens (P0.2,
P0.3) so every consumer reads from one source. Build the missing
`<LayeredHeadline>` primitive (P0.4) — the *type* version of the
offset-color mechanic the Wordmark already proves works. Rewrite the
Tailwind preset to import the token module directly so web and mobile
share one source (P0.5). Reconcile `map-style.json` against the
canonical palette and add the missing active-pin layer (P0.6). Build
three reference compositions — `/welcome`, `/discover`,
`/e/sample-event` — that demonstrate the tokens and primitive working
together (P0.7–P0.9). Write the three handoff specs (`OG_IMAGE.md`,
`WELCOME_NARRATIVE.md`, this `BRAND_AUDIT.md`). Phase 1 inherits a
ready-to-consume design system and three rendered exemplars.
