// Shared Tailwind preset — Web (Tailwind) and Mobile (NativeWind) both consume this.
//
// Source of truth: `packages/ui/src/tokens/colors.ts` and
// `packages/ui/src/tokens/typography.ts`. Tailwind's PostCSS pipeline
// can't import TS, so the values are mirrored here. If you change a hex
// or a font in the tokens module, update it here in the same commit.
// The token module's exported objects and this preset MUST stay in lock-step.

const teal = {
  'tint-2': '#E6FBFB',
  'tint-1': '#8FE8E8',
  base: '#0AA3A3',
  'shade-1': '#068585',
  'shade-2': '#0A5252',
}
const yellow = {
  'tint-2': '#FFF6CC',
  'tint-1': '#FFE872',
  base: '#FFCB05',
  'shade-1': '#E5B400',
  'shade-2': '#A37F00',
}
const coral = {
  'tint-2': '#FFE0E4',
  'tint-1': '#FF9CA9',
  base: '#FF4D63',
  'shade-1': '#E62E45',
  'shade-2': '#A6172A',
}
const orange = {
  'tint-2': '#FFE2C7',
  'tint-1': '#FFB07A',
  base: '#FF7A1A',
  'shade-1': '#E55D00',
  'shade-2': '#9F4100',
}
const paper = {
  'tint-2': '#FFFFFF',
  'tint-1': '#FFFEF8',
  base: '#FFFCF2',
  'shade-1': '#F2FBFB',
  'shade-2': '#E8F4F4',
}
const ink = {
  'tint-2': '#3C4E4E',
  'tint-1': '#1F2C2C',
  base: '#0E1A1A',
  'shade-1': '#070E0E',
  'shade-2': '#000000',
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
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
        'mute-warm': '#8E826A',
        'mute-cool': '#6A7C7C',
      },
      fontFamily: {
        display: ['var(--font-display)', '"Barlow Condensed"', 'Impact', 'system-ui', 'sans-serif'],
        editorial: ['var(--font-editorial)', '"Fraunces"', 'Georgia', 'Times New Roman', 'serif'],
        body: ['var(--font-body)', '"DM Sans"', '-apple-system', 'system-ui', 'sans-serif'],
        sans: ['var(--font-body)', '"DM Sans"', '-apple-system', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', '"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // Type scale — keys match `typeScale` in `tokens/typography.ts`.
        display: ['84px', { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '900' }],
        h1: ['64px', { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '900' }],
        h2: ['48px', { lineHeight: '1.1', letterSpacing: '-0.01em', fontWeight: '900' }],
        h3: ['36px', { lineHeight: '1.15', letterSpacing: '-0.01em', fontWeight: '900' }],
        h4: ['28px', { lineHeight: '1.2', fontWeight: '900' }],
        body: ['16px', { lineHeight: '1.55', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        caption: ['12px', { lineHeight: '1.45', letterSpacing: '0.02em', fontWeight: '500' }],
      },
      borderRadius: {
        sm: '6px',
        md: '12px',
        lg: '20px',
        xl: '28px',
        pill: '999px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(14, 26, 26, 0.04), 0 4px 12px rgba(14, 26, 26, 0.06)',
        lift: '0 4px 8px rgba(14, 26, 26, 0.06), 0 16px 32px rgba(14, 26, 26, 0.10)',
        // Brand "stacked color" — single-direction hard offsets, no blur.
        'stack-yellow': `6px 6px 0 0 ${yellow.base}`,
        'stack-orange': `6px 6px 0 0 ${orange.base}`,
        'stack-teal': `6px 6px 0 0 ${teal.base}`,
        'stack-coral': `6px 6px 0 0 ${coral.base}`,
        // Layered triple-stack — the card analog of <LayeredHeadline>.
        'stack-layered': `
          4px 4px 0 0 ${yellow.base},
          8px 8px 0 0 ${coral.base},
          12px 12px 0 0 ${teal.base}
        `,
      },
    },
  },
  plugins: [],
}
