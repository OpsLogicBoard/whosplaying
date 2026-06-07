// Two-family system:
//   display = condensed display face used in the wordmark + hero headers
//   ui      = Inter for everything functional
//
// Sizes match the soft/airy editorial feel: generous line-height, easy weights.

export const typography = {
  fonts: {
    display: ['"Barlow Condensed"', 'Impact', 'system-ui', 'sans-serif'],
    ui: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
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
} as const

export type Typography = typeof typography
