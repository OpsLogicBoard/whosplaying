// Brand palette — pulled from the layered-typography reference imagery.
// All four core hues are equally weighted; pair freely with offsets for the
// signature "stacked color" look (see Wordmark).

export const colors = {
  // Primary surface — bright tropical teal
  teal: {
    50: '#E6FBFB',
    100: '#C6F4F4',
    200: '#8FE8E8',
    300: '#4FD5D5',
    400: '#1FBCBC',
    500: '#0AA3A3', // primary
    600: '#068585',
    700: '#066868',
    800: '#0A5252',
    900: '#0C3F3F',
  },
  // Sunshine accent
  yellow: {
    300: '#FFE872',
    400: '#FFDB3D',
    500: '#FFCB05', // primary accent
    600: '#E5B400',
  },
  // Warm pop
  orange: {
    400: '#FF9B3D',
    500: '#FF7A1A', // primary accent
    600: '#E55D00',
  },
  // Coral pink — used sparingly for love-marks (hearts, follow CTAs)
  coral: {
    400: '#FF7A8A',
    500: '#FF4D63',
    600: '#E62E45',
  },
  // Neutral
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
} as const

export type ColorScale = typeof colors
