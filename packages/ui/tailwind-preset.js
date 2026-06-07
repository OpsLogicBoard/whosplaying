// Shared Tailwind preset — Web (Tailwind) and Mobile (NativeWind) both consume this.
// Single source of truth for brand tokens.

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        teal: {
          50: '#E6FBFB',
          100: '#C6F4F4',
          200: '#8FE8E8',
          300: '#4FD5D5',
          400: '#1FBCBC',
          500: '#0AA3A3',
          600: '#068585',
          700: '#066868',
          800: '#0A5252',
          900: '#0C3F3F',
          DEFAULT: '#0AA3A3',
        },
        yellow: {
          300: '#FFE872',
          400: '#FFDB3D',
          500: '#FFCB05',
          600: '#E5B400',
          DEFAULT: '#FFCB05',
        },
        orange: {
          400: '#FF9B3D',
          500: '#FF7A1A',
          600: '#E55D00',
          DEFAULT: '#FF7A1A',
        },
        coral: {
          400: '#FF7A8A',
          500: '#FF4D63',
          600: '#E62E45',
          DEFAULT: '#FF4D63',
        },
        ink: {
          DEFAULT: '#0E1A1A',
          soft: '#3C4E4E',
          mute: '#6A7C7C',
          line: '#D7E2E2',
        },
        paper: {
          DEFAULT: '#FFFFFF',
          warm: '#FFFCF2',
          cool: '#F2FBFB',
        },
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'Impact', 'system-ui', 'sans-serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
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
        'stack-yellow': '6px 6px 0 0 #FFCB05',
        'stack-orange': '6px 6px 0 0 #FF7A1A',
        'stack-teal': '6px 6px 0 0 #0AA3A3',
        'stack-coral': '6px 6px 0 0 #FF4D63',
      },
    },
  },
  plugins: [],
}
