// Shared Tailwind preset — Web (Tailwind) and Mobile (NativeWind) both consume this.
//
// CANONICAL v2 "Live Pin" palette. The earlier teal/yellow stacked-shadow
// direction is retired (see docs/RE_EVALUATION.md §4). The legacy TS token
// objects in `src/tokens/colors.ts` remain only to feed the not-yet-rebuilt
// web primitives (LayeredHeadline/Card/Button) and will be removed when the
// web app is ported to v2. This preset is the source of truth for what renders.

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        // Grounds
        canvas: '#F7F8FA', // app background
        surface: '#FFFFFF', // cards / sheets
        night: { DEFAULT: '#23272F', soft: '#2E3440' }, // photo-style featured cards

        // Ink
        ink: {
          DEFAULT: '#111318',
          deep: '#071020',
          soft: '#5C6470',
          slate: '#5C6470',
          mute: '#9AA1AC',
          line: '#E9EAED',
        },

        // Legacy web @apply uses `bg-paper` for the page ground — map to the v2 canvas.
        paper: { DEFAULT: '#F7F8FA', cool: '#FFFFFF', warm: '#FFFFFF' },

        // Primary action
        coral: {
          DEFAULT: '#FF5A5F',
          soft: '#FFF1F1',
          500: '#FF5A5F',
          600: '#E62E45',
          strong: '#E62E45',
          // Live Pin / CTA gradient stops
          'grad-start': '#FF4F63',
          'grad-mid': '#FF6B42',
          'grad-end': '#FF2F70',
          wave: '#FF7A3F',
        },

        // Accents — artwork, tags, map pins
        blue: { DEFAULT: '#2D7FF9', soft: '#E6F1FB', ink: '#185FA5' },
        lime: { DEFAULT: '#B7F34A', soft: '#EAF3DE', ink: '#3B6D11' },
        purple: { DEFAULT: '#8B5CF6', soft: '#EEEDFE', ink: '#3C3489' },
        gold: { DEFAULT: '#FFB020', soft: '#FAEEDA', ink: '#854F0B' },
        teal: { DEFAULT: '#0F6E56', soft: '#E1F5EE' }, // semantic "confirmed" only
      },
      fontFamily: {
        // var(--font-sans) is wired to Inter via next/font on web; on mobile it
        // resolves to undefined and falls through to the literal Inter stack.
        display: ['var(--font-sans)', 'Inter', '-apple-system', '"SF Pro Display"', 'system-ui', 'sans-serif'],
        body: ['var(--font-sans)', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        display: ['33px', { lineHeight: '1.02', letterSpacing: '-0.03em', fontWeight: '800' }],
        h1: ['28px', { lineHeight: '1.05', letterSpacing: '-0.03em', fontWeight: '800' }],
        h2: ['22px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        h3: ['17px', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
        body: ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '1.45', fontWeight: '500' }],
        caption: ['12px', { lineHeight: '1.4', letterSpacing: '0.01em', fontWeight: '600' }],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '22px',
        pill: '999px',
      },
      boxShadow: {
        card: '0 8px 30px rgba(16, 24, 40, 0.08)',
        lift: '0 14px 40px rgba(16, 24, 40, 0.14)',
      },
    },
  },
  plugins: [],
}
