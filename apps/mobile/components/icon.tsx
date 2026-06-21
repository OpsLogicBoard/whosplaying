// Icon foundation for the mobile app. The v2 "Live Pin" prototype
// (docs/design/prototype.html) is drawn with Tabler icons, so screens use
// the matching @tabler/icons-react-native components for an exact match.
//
// This module also carries the two *custom* glyphs the prototype hand-rolls
// as inline SVG in its tab bar — the "Tonight" marquee/tent mark and the
// "Gigs" amp+mic mark — plus a small helper so shared components in ui.tsx
// can accept either a Tabler component or a legacy Feather name during the
// migration.

import { Feather } from '@expo/vector-icons'
import type { Icon as TablerIcon } from '@tabler/icons-react-native'
import Svg, { Ellipse, Path, Rect } from 'react-native-svg'

export type { Icon as TablerIcon } from '@tabler/icons-react-native'

/** A shared component's icon prop: a Tabler icon component or a Feather name. */
export type IconSpec = TablerIcon | keyof typeof Feather.glyphMap

/** Render an IconSpec — detects a Feather string name vs a Tabler component. */
export function renderIcon(icon: IconSpec, size: number, color: string, strokeWidth = 2) {
  if (typeof icon === 'string') return <Feather name={icon} size={size} color={color} />
  const Comp = icon
  return <Comp size={size} color={color} strokeWidth={strokeWidth} />
}

/**
 * "Tonight" tab mark — the prototype's bespoke marquee/tent glyph
 * (prototype.html nav-play, line 1624). Stroked like a Tabler icon.
 */
export function TonightMark({ size = 23, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <Rect x={4.8} y={4} width={14.4} height={3.2} rx={1.6} />
      <Path d="M8 7.2 5.6 20" />
      <Path d="M16 7.2 18.4 20" />
      <Path d="M6.7 14.3 H17.3" />
    </Svg>
  )
}

/**
 * "Gigs" tab mark — the prototype's bespoke amp + microphone glyph
 * (prototype.html nav-work, line 1632).
 */
export function GigsMark({ size = 26, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.55} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3.5 10 14 6 V18 L3.5 14 Z" />
      <Ellipse cx={14} cy={12} rx={1.4} ry={6} />
      <Path d="M3.5 10 V14" />
      <Path d="M6.2 14.7 C6.6 17.8 10 17.6 9.8 15.3" />
      <Path d="M18 8.5 A6 6 0 0 1 18 15.5" />
      <Path d="M20.6 6.6 A10 10 0 0 1 20.6 17.4" />
    </Svg>
  )
}
