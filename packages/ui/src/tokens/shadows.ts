// "Stacked color" shadows — the signature look. Layered offset color blocks
// behind type and cards instead of soft drop-shadow blur. Use sparingly.

export const shadows = {
  // Standard depth
  card: '0 1px 2px rgba(14, 26, 26, 0.04), 0 4px 12px rgba(14, 26, 26, 0.06)',
  lift: '0 4px 8px rgba(14, 26, 26, 0.06), 0 16px 32px rgba(14, 26, 26, 0.10)',
  // Brand "stacked color" — single-direction hard offsets, no blur.
  stackYellow: '6px 6px 0 0 #FFCB05',
  stackOrange: '6px 6px 0 0 #FF7A1A',
  stackTeal: '6px 6px 0 0 #0AA3A3',
  stackCoral: '6px 6px 0 0 #FF4D63',
} as const

export type Shadows = typeof shadows
