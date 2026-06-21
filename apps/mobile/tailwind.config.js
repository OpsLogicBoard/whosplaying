const preset = require('@whosplaying/ui/tailwind-preset')

/** @type {import('tailwindcss').Config} */
module.exports = {
  // NativeWind v4 must see its own preset alongside our brand preset, or Metro
  // throws "Tailwind CSS has not been configured with the NativeWind preset".
  presets: [require('nativewind/preset'), preset],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
}
