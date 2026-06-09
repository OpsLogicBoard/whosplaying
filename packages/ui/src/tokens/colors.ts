// Brand palette — canonical source. Pulled from the layered-typography
// reference imagery and `docs/BRAND.md`. Every signature hue exposes the
// same five-tone shape so the Tailwind preset and NativeWind read predictable
// token paths.
//
// Tone shape per family:
//   tint-2 → tint-1 → base → shade-1 → shade-2
// The `base` is what reads as the brand value. Tints are for backgrounds
// and surfaces; shades are for hover, focus, and active states.

type Tone = 'tint-2' | 'tint-1' | 'base' | 'shade-1' | 'shade-2'
type ColorFamily = Record<Tone, string>

// Primary surface — bright tropical teal. Reads as ocean / pool, not
// corporate. Picked from `BRAND.md`; the existing `teal-500` (#0AA3A3)
// stays as the base.
const teal: ColorFamily = {
  'tint-2': '#E6FBFB',
  'tint-1': '#8FE8E8',
  base: '#0AA3A3',
  'shade-1': '#068585',
  'shade-2': '#0A5252',
}

// Sunshine accent. Warm sun, not safety vest. Existing `yellow-500`
// (#FFCB05) stays as base.
const yellow: ColorFamily = {
  'tint-2': '#FFF6CC',
  'tint-1': '#FFE872',
  base: '#FFCB05',
  'shade-1': '#E5B400',
  'shade-2': '#A37F00',
}

// Coral — alive and inviting. Used sparingly for love-marks and primary
// actions on the welcome surface.
const coral: ColorFamily = {
  'tint-2': '#FFE0E4',
  'tint-1': '#FF9CA9',
  base: '#FF4D63',
  'shade-1': '#E62E45',
  'shade-2': '#A6172A',
}

// Orange — deeper and warmer than coral. Hover and emphasis on coral
// surfaces; standalone accent for the gig board.
const orange: ColorFamily = {
  'tint-2': '#FFE2C7',
  'tint-1': '#FFB07A',
  base: '#FF7A1A',
  'shade-1': '#E55D00',
  'shade-2': '#9F4100',
}

// Warm off-white. Map land, content surfaces.
const paper: ColorFamily = {
  'tint-2': '#FFFFFF',
  'tint-1': '#FFFEF8',
  base: '#FFFCF2',
  'shade-1': '#F2FBFB',
  'shade-2': '#E8F4F4',
}

// Ink — near-black with a hint of teal warmth. Never pure #000.
const ink: ColorFamily = {
  'tint-2': '#3C4E4E',
  'tint-1': '#1F2C2C',
  base: '#0E1A1A',
  'shade-1': '#070E0E',
  'shade-2': '#000000',
}

// Supporting greys. Warm leans yellow-paper; cool leans teal.
const muteWarm: ColorFamily = {
  'tint-2': '#F4EFE3',
  'tint-1': '#D8CFB8',
  base: '#8E826A',
  'shade-1': '#5F5645',
  'shade-2': '#3A3324',
}

const muteCool: ColorFamily = {
  'tint-2': '#EDF4F4',
  'tint-1': '#C7D5D5',
  base: '#6A7C7C',
  'shade-1': '#445454',
  'shade-2': '#243030',
}

// Backwards-compat aliases — existing Tailwind preset and components
// (Button, Card, Chip, EventCard) reference numeric scales (`teal-50`,
// `yellow-300`, `ink-soft`, `paper-warm`, `paper-cool`). Keep those names
// stable so Phase 0 doesn't break what's already rendering, while adding
// the canonical `tint-2 / tint-1 / base / shade-1 / shade-2` paths.
export const colors = {
  teal: {
    50: teal['tint-2'],
    100: '#C6F4F4',
    200: teal['tint-1'],
    300: '#4FD5D5',
    400: '#1FBCBC',
    500: teal.base,
    600: teal['shade-1'],
    700: '#066868',
    800: teal['shade-2'],
    900: '#0C3F3F',
    DEFAULT: teal.base,
    'tint-2': teal['tint-2'],
    'tint-1': teal['tint-1'],
    base: teal.base,
    'shade-1': teal['shade-1'],
    'shade-2': teal['shade-2'],
  },
  yellow: {
    300: yellow['tint-1'],
    400: '#FFDB3D',
    500: yellow.base,
    600: yellow['shade-1'],
    DEFAULT: yellow.base,
    'tint-2': yellow['tint-2'],
    'tint-1': yellow['tint-1'],
    base: yellow.base,
    'shade-1': yellow['shade-1'],
    'shade-2': yellow['shade-2'],
  },
  coral: {
    400: coral['tint-1'],
    500: coral.base,
    600: coral['shade-1'],
    DEFAULT: coral.base,
    'tint-2': coral['tint-2'],
    'tint-1': coral['tint-1'],
    base: coral.base,
    'shade-1': coral['shade-1'],
    'shade-2': coral['shade-2'],
  },
  orange: {
    400: orange['tint-1'],
    500: orange.base,
    600: orange['shade-1'],
    DEFAULT: orange.base,
    'tint-2': orange['tint-2'],
    'tint-1': orange['tint-1'],
    base: orange.base,
    'shade-1': orange['shade-1'],
    'shade-2': orange['shade-2'],
  },
  ink: {
    DEFAULT: ink.base,
    soft: ink['tint-2'],
    mute: '#6A7C7C',
    line: '#D7E2E2',
    'tint-2': ink['tint-2'],
    'tint-1': ink['tint-1'],
    base: ink.base,
    'shade-1': ink['shade-1'],
    'shade-2': ink['shade-2'],
  },
  paper: {
    DEFAULT: paper['tint-2'],
    warm: paper.base,
    cool: paper['shade-1'],
    'tint-2': paper['tint-2'],
    'tint-1': paper['tint-1'],
    base: paper.base,
    'shade-1': paper['shade-1'],
    'shade-2': paper['shade-2'],
  },
  mute: {
    warm: muteWarm.base,
    cool: muteCool.base,
    'warm-tint-2': muteWarm['tint-2'],
    'warm-tint-1': muteWarm['tint-1'],
    'warm-base': muteWarm.base,
    'warm-shade-1': muteWarm['shade-1'],
    'warm-shade-2': muteWarm['shade-2'],
    'cool-tint-2': muteCool['tint-2'],
    'cool-tint-1': muteCool['tint-1'],
    'cool-base': muteCool.base,
    'cool-shade-1': muteCool['shade-1'],
    'cool-shade-2': muteCool['shade-2'],
  },
} as const

// Canonical token map — the Tailwind preset and NativeWind both consume
// this for the brand-direct token paths.
export const colorTokens = {
  teal,
  yellow,
  coral,
  orange,
  paper,
  ink,
  'mute-warm': muteWarm,
  'mute-cool': muteCool,
} as const

export type ColorScale = typeof colors
export type ColorTokens = typeof colorTokens
