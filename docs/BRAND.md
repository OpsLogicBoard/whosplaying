# Brand — v2 "Live Pin" (Canonical)

**This is the law.** The approved design is the v2 prototype
(`docs/design/prototype.html`) as implemented in the Expo app. Every surface —
mobile, web, marketing — follows it to the letter. The earlier teal/yellow
stacked-shadow direction is **retired**; do not reintroduce it.

For exact tokens, components, and the rules that keep this from drifting, see
[`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md). For the screen inventory and navigation
model, see [`MOBILE_APP.md`](./MOBILE_APP.md).

## Voice

Warm, plain, in the know. We talk like a friend telling you who's playing
tonight, not a calendar app. Use contractions. Drop the corporate hedging.

## Visual language

**Apple clarity + Spotify energy + Airbnb friendliness.** Clean white / `#F7F8FA`
grounds, minimal chrome, large rounded artwork. **Color lives in the artwork and
in accents — never in the chrome.** Coral is reserved for primary actions and the
active state. The "poppy, not drab" energy lives in the **map** (custom style,
colorful Live-Pin markers) and in accent colors — never in the logo or homepage.

## Palette

| Token | Hex | Use |
|---|---|---|
| `canvas` | `#F7F8FA` | App / page ground |
| `surface` | `#FFFFFF` | Cards, inputs, sheets |
| `ink` | `#111318` | Primary text |
| `ink-deep` | `#071020` | Headlines, dark fills (banner, dark CTAs) |
| `ink-slate` | `#5C6470` | Secondary text |
| `ink-mute` | `#9AA1AC` | Tertiary text, placeholders |
| `ink-line` | `#E9EAED` | Borders, dividers |
| **`coral`** | **`#FF5A5F`** | **Primary CTA + active/selected state ONLY** |
| `blue` | `#2D7FF9` | Accent (soft `#E6F1FB`, ink `#185FA5`) |
| `lime` | `#B7F34A` | Accent / energy (ink `#3B6D11`) |
| `purple` | `#8B5CF6` | Accent (soft `#EEEDFE`, ink `#3C3489`) |
| `gold` | `#FFB020` | Accent / founding (soft `#FAEEDA`, ink `#854F0B`) |
| `pink` | `#FF3F73` | Accent |
| `teal` (semantic) | `#0F6E56` on `#E1F5EE` | **Confirmed / connected / linked / active status ONLY** |

Gradients:
- **Coral CTA gradient** — `135deg, #FF4F63 → #FF6B42 (48%) → #FF2F70`. Every primary button.
- **Play gradient** — `180deg, #FF8751 → #FF5A5F (52%) → #FF3F73`. The wordmark "playing".
- **Scrim** — `to top, rgba(7,16,32,.80) → rgba(7,16,32,.15) (52%) → transparent (78%)`. Over hero artwork.

Source of truth for what renders: `packages/ui/tailwind-preset.js`. The legacy
`packages/ui/src/tokens/colors.ts` is dead — do not import it.

## Type

- **Inter**, weights 400–900. Used everywhere — UI and headlines.
- Headlines are Inter 800–900 with tight tracking (`-0.02` to `-0.03em`). No
  Barlow Condensed, no Impact — those belonged to the retired direction.

## Icons

**Tabler Icons only** (`@tabler/icons-react-native` on mobile, `@tabler/icons-react`
on web). Two custom SVG marks for the tab bar live in
`apps/mobile/components/icon.tsx`: `TonightMark` (stool) and `GigsMark`
(guitar/mic). **No Ionicons, MaterialIcons, Feather, Lucide, FontAwesome, or
emoji** as UI icons.

## Logo

The **Live Pin Lockup** — location pin + play triangle + signal waves, with the
stacked `who's / playing` wordmark (coral "playing"). Components in
`packages/ui/src/brand/`. Exactly three variants, never mixed:

- `full` — mark + wordmark (+ tagline) — for brand boards & marketing hero only
- `compact` — small mark + wordmark — app/web headers
- `mark-only` — the mark alone — app icon, favicon, map pins

Never recreate it. Never recolor it outside the palette. Extend `Wordmark.tsx`;
don't reinvent.

## Map

Custom style in `packages/ui/src/brand/map-style.json` — clean white/warm-paper
land, light water, and **colorful Live-Pin markers** (coral pin + white play
triangle for active shows; accent colors per pin). Never the default grey muni
look. Real MapLibre rendering needs an EAS dev build; the app ships a styled
fallback until then.

## Hard boundary — no spec boards in production

Brand-review boards (`PRIMARY LOGO`, `COLOR PALETTE`, `TYPOGRAPHY` panels) are a
**design artifact only**. They must **never** render inside a production page or
app screen. This was the repeated past failure
(`docs/Whos_Playing_Corrected_Brand_Implementation_Package_v2/09_Codex_Failure_Review.md`).
Production surfaces get the compact header logo + real content only. Treat as a
hard QA gate.
