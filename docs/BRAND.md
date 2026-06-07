# Brand

## Voice

Warm, plain, in the know. We talk like a friend telling you who's playing tonight, not a calendar app. Use contractions. Drop the corporate hedging.

## Visual language

Layered, overlapping color blocks. Bright, tropical, summery. Inspired by the script + 3D type reference imagery — letters with offset color shadows (teal + yellow + coral + orange) on white or teal grounds.

## Palette

| Token | Hex | Use |
|---|---|---|
| `teal-500` | `#0AA3A3` | Primary surface, confirmed-state, brand |
| `yellow-500` | `#FFCB05` | Accent block, proposed-state, sunshine pops |
| `orange-500` | `#FF7A1A` | Warm pop, secondary accents, gig board |
| `coral-500` | `#FF4D63` | Love-marks (follow, save), special events |
| `ink` | `#0E1A1A` | Body text |
| `paper-cool` | `#F2FBFB` | Section backgrounds with teal tint |
| `paper-warm` | `#FFFCF2` | Section backgrounds with yellow tint |

## Type

- **Display** — Barlow Condensed Black Italic. Used in the wordmark and big headers. Falls back to Impact then system-ui.
- **UI** — Inter. Body, controls, anything functional.

## Logo

- `packages/ui/src/brand/Wordmark.tsx` — the "Who's Playing" lockup. Three stacked layers (teal shadow, yellow shadow, white face with ink stroke). Use this anywhere the brand needs to read.
- `packages/ui/src/brand/LogoMark.tsx` — square mark for app icons, avatars, favicons. Stacked rounded squares forming a layered "WP".
- Never recreate. Never recolor outside the palette. If you need a mono variant, pass `mono` to `Wordmark`.

## Map

Custom map style — not the default grey muni look. Teal water, warm paper land, coral pins for active shows. JSON in `packages/ui/src/brand/map-style.json`.
