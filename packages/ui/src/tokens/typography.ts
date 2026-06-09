// Type system — three deliberate families, one canonical scale.
//
// DISPLAY — Barlow Condensed Black Italic.
//   The Wordmark already uses this; keeping it as the brand voice in
//   type form. Reads as poster-bold, marquee, "tonight." The brief
//   recommended a high-contrast geometric or condensed display sans —
//   Barlow Condensed Black Italic is the condensed-display answer and
//   already in the codebase via the Wordmark. Not reinvented.
//
// BODY — DM Sans.
//   The brand brief explicitly excludes Inter and Tailwind defaults.
//   DM Sans is the deliberate replacement: warm low-contrast geometric
//   sans, six weights on Google Fonts, available on Expo Font, slight
//   rounded counters that echo the LogoMark's rounded squares. Reads
//   warmer than Inter without giving up legibility at 14–18px. Picked
//   over alternatives (Manrope — too neutral; Plus Jakarta Sans —
//   too business; Outfit — too thin for the brand's bold-color blocks).
//
// MONO — JetBrains Mono.
//   Used sparingly for timestamps, codes, ticker-style data. Picked
//   for its clear digit shapes and broad weight coverage.

export const typography = {
  fonts: {
    display: ['"Barlow Condensed"', 'Impact', 'system-ui', 'sans-serif'],
    body: ['"DM Sans"', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
    // Legacy alias — old code references `fonts.ui`; map it to `body` so we
    // don't break consumers in a single rename.
    ui: ['"DM Sans"', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
    mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
  },
  size: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 22,
    '2xl': 28,
    '3xl': 36,
    '4xl': 48,
    '5xl': 64,
    '6xl': 84,
  },
  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 900,
  },
  line: {
    tight: 1.05,
    snug: 1.2,
    normal: 1.45,
    relaxed: 1.65,
  },
  tracking: {
    tight: '-0.02em',
    normal: '0',
    wide: '0.02em',
    wider: '0.06em',
  },
} as const

// Canonical type scale — keyed name → size / lineHeight / weight / tracking.
// Consumed by the Tailwind preset and by `<LayeredHeadline>` via `size`.
export const typeScale = {
  display: {
    family: 'display' as const,
    size: 84,
    lineHeight: 1.05,
    weight: 900,
    tracking: '-0.02em',
  },
  h1: {
    family: 'display' as const,
    size: 64,
    lineHeight: 1.05,
    weight: 900,
    tracking: '-0.02em',
  },
  h2: {
    family: 'display' as const,
    size: 48,
    lineHeight: 1.1,
    weight: 900,
    tracking: '-0.01em',
  },
  h3: {
    family: 'display' as const,
    size: 36,
    lineHeight: 1.15,
    weight: 900,
    tracking: '-0.01em',
  },
  h4: {
    family: 'display' as const,
    size: 28,
    lineHeight: 1.2,
    weight: 900,
    tracking: '0',
  },
  body: {
    family: 'body' as const,
    size: 16,
    lineHeight: 1.55,
    weight: 400,
    tracking: '0',
  },
  'body-sm': {
    family: 'body' as const,
    size: 14,
    lineHeight: 1.5,
    weight: 400,
    tracking: '0',
  },
  caption: {
    family: 'body' as const,
    size: 12,
    lineHeight: 1.45,
    weight: 500,
    tracking: '0.02em',
  },
  mono: {
    family: 'mono' as const,
    size: 14,
    lineHeight: 1.4,
    weight: 500,
    tracking: '0',
  },
} as const

export type Typography = typeof typography
export type TypeScale = typeof typeScale
export type TypeScaleKey = keyof typeof typeScale
