# Design System — v2 "Live Pin" (Enforcement Spec)

This document is **prescriptive**. It encodes the approved design so it cannot
drift. When building or reviewing any screen, it must satisfy every rule here.
The reference is `docs/design/prototype.html` (the approved mockup) and its
faithful Expo implementation in `apps/mobile/`.

> Brand essence & palette rationale: [`BRAND.md`](./BRAND.md).
> Screens & navigation: [`MOBILE_APP.md`](./MOBILE_APP.md).

---

## 1. Tokens (NativeWind / Tailwind preset)

All colors come from `packages/ui/tailwind-preset.js`. Never hard-code a hex that
isn't in the palette below; never import `packages/ui/src/tokens/colors.ts`
(retired teal/yellow set).

| Class | Hex | |
|---|---|---|
| `bg-canvas` | `#F7F8FA` | screen ground |
| `bg-surface` / `bg-white` | `#FFFFFF` | cards, inputs, sheets |
| `text-ink` | `#111318` | body |
| `text-ink-deep` / `bg-ink-deep` | `#071020` | headlines, dark fills |
| `text-ink-slate` | `#5C6470` | secondary |
| `text-ink-mute` | `#9AA1AC` | tertiary / placeholder |
| `border-ink-line` | `#E9EAED` | borders |
| `coral` | `#FF5A5F` | primary CTA + active state |
| `blue` `lime` `purple` `gold` `pink` | see BRAND | accents (each has `-soft`/`-ink`) |
| `teal` / `bg-teal-soft` | `#0F6E56` / `#E1F5EE` | semantic success/confirmed |

Type: Inter only, weights 400–900. Headlines `font-extrabold` + tight tracking.

---

## 2. Color discipline (the rules that get broken)

1. **Coral = primary action + active/selected only.** A primary button, the
   active tab, the active segment, a selected chip, a "love" heart. Nothing
   decorative is coral.
2. **Primary buttons are the coral gradient**, via `<GradientButton>` — never a
   flat `bg-coral` rectangle. Secondary buttons are white with `border-ink-line`.
   A dark/heavy action (e.g. "Manage billing", the Plan card) uses `bg-ink-deep`
   with white text.
3. **Status pills use the semantic color map — never coral, never grey-by-default:**

   | Meaning | Text / BG | Examples |
   |---|---|---|
   | confirmed · active · linked · fan · connected · synced · included | `#0F6E56` / `#E1F5EE` (green) | "Confirmed", "Active", "FAN", "LINKED", "Included" |
   | waiting · pending · expiring | `#854F0B` / `#FAEEDA` (gold) | "Awaiting artist", "Pending", "Expiring" |
   | open · scheduled | `#185FA5` / `#E6F1FB` (blue) | "Open", "Scheduled", "3 bids" |
   | muted · paused · expired | `#5C6470` / `#EEF0F4` (slate) | "Paused", "Expired" |

   Use `<StatusBadge kind="confirmed|wait|open|muted" />`. A status that means
   "good/done/connected" is **green**, not grey and not coral.
4. **Accent tints carry meaning, not decoration.** Hat-card icon tiles use the
   accent's `-soft` background with the accent foreground (e.g. blue icon on
   `blue-soft`). Keep the mockup's pairing.
5. **Color lives in artwork.** Event/feature cards are dark artwork with the
   scrim; thumbnails are accent color-blocks (placeholders for real imagery).
   Chrome stays white/canvas.

---

## 3. Components (use these — don't re-roll)

Defined in `apps/mobile/components/ui.tsx`:

| Component | Mockup analog | Notes |
|---|---|---|
| `GradientButton` | `.cta-create` / `.plcta` | the ONLY primary button; coral gradient |
| `Scrim` | `--scrim` | hero artwork overlay |
| `StatusBadge` | `.statc` | semantic pill (see §2.3) |
| `Segmented` | `.seg` | tab/segment control; active = white pill |
| `Toggle` | `.toggle` | coral when on |
| `HatCard` | `.hat` | dashboard row: tinted icon tile + title/sub + chevron/badge |
| `LockCard` | `.lockcard` | Pro upsell gate |
| `BackHeader` | `.pmtop` | back chevron + title for **pushed** screens only |

Custom marks in `apps/mobile/components/icon.tsx`: `TonightMark`, `GigsMark`.

A reusable tap-to-pick pattern (`PickerField`, in `create-event.tsx`) backs
mockup `.finput` fields that open a value picker (date, time) — use it instead of
inline carousels/chip-grids so screens read like the mockup.

---

## 4. Recurring layout rules

- **Cover/photo tiles:** the caption tag sits **bottom-left**, the camera/edit
  button **top-right** (mockup `.cover`). Never invert them.
- **Top-level tabs have no back chevron.** Only pushed (stack) screens use
  `BackHeader`. A screen that is reachable as a Work/Play tab must render a plain
  title, not a back button.
- **Hero detail screens** (event, public profile) use the dark scrim hero with
  back + share + (heart/message) circular buttons, the genre/role chip, big
  title, then a white body.
- **Avatars** are circles (`rounded-full`) for people/entities in lists; the
  "acting as" entity tile in the Work dashboard is a rounded square.
- **Founding / money** accents use gold; the Plan card and dark CTAs use
  `bg-ink-deep`.

---

## 5. Monetization surfaces (locked copy + numbers)

- Free forever for goers **and** artists, including a venue **Free** tier.
- **Venue Pro $24.99/mo**, **Founding $14.99/mo** (locked for life for early
  Beaches venues). Single event boost **$5** without a subscription. Multi-venue
  **+$12/mo** each. **Get Tickets links are always free** (link-out only).
- Pro-gated features show a `LockCard` with the coral "Unlock · $14.99/mo" CTA;
  Free shows the basic tier above it.

---

## 6. QA gate (every screen, before "done")

1. Coral only on primary actions / active state. ✅
2. Primary button is the gradient; status pills use the semantic map (green for
   confirmed/connected). ✅
3. Tabler icons only; no emoji/other icon sets; no retired teal/yellow. ✅
4. Cover tag bottom-left; tabs have no back chevron. ✅
5. No brand-spec boards rendered in the screen. ✅
6. Renders against the matching `prototype.html` screen with no visible drift. ✅
