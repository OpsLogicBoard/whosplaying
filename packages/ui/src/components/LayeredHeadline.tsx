// LayeredHeadline — the signature type primitive.
//
// Renders the same text in N layered copies, each offset down-right by a
// small delta, each copy painted in a palette color. The reader sees one
// headline; the eye registers the layered color underneath.
//
// This is the generalized form of the technique baked into `Wordmark.tsx`.
// Phase 0's job: make it reusable on arbitrary strings.
//
// Web: stacked absolutely-positioned spans behind the in-flow top layer.
// Mobile (Phase 1+): a React Native variant ships as `LayeredHeadline.native.tsx`
//   using stacked `<Text>` nodes with `transform: [{translateX}, {translateY}]`.
//   The web implementation lives in this file; the metro bundler picks up
//   the `.native.tsx` sibling automatically for the mobile build.
//
// A11y: only the top layer is exposed to screen readers; lower color
// layers are `aria-hidden`. The whole component is wrapped in a single
// element that carries the readable text, so AT users get one headline.
//
// Reduced motion: there is no entrance animation by default, so the
// component is reduced-motion-safe out of the box. If a future caller
// passes an `animate` prop (not in Phase 0), it must gate on
// `@media (prefers-reduced-motion: reduce)`.

import * as React from 'react'
import { typeScale, type TypeScaleKey } from '../tokens/typography'
import { colorTokens } from '../tokens/colors'

type PaletteKey = 'teal' | 'yellow' | 'coral' | 'orange'

export type LayeredHeadlineProps = {
  children: string
  /** Number of layered copies, including the top ink layer. */
  depth?: number
  /** Pixel offset between each layer (lower layers are further down-right). */
  offset?: { x: number; y: number }
  /**
   * Bottom-to-top color order. The top layer is always painted in `ink`
   * regardless of this list; these palette colors fill the layers
   * underneath, repeated if `depth > palette.length + 1`.
   */
  palette?: PaletteKey[]
  /** Type scale key — drives font size, line height, family, tracking, weight. */
  size?: TypeScaleKey
  /** Optional html tag override. Defaults to <h1>. */
  as?: keyof React.JSX.IntrinsicElements
  className?: string
  style?: React.CSSProperties
}

const familyVar: Record<'display' | 'body' | 'mono', string> = {
  display: 'var(--font-display, "Barlow Condensed"), Impact, system-ui, sans-serif',
  body: 'var(--font-body, "DM Sans"), -apple-system, system-ui, sans-serif',
  mono: 'var(--font-mono, "JetBrains Mono"), ui-monospace, monospace',
}

export function LayeredHeadline({
  children,
  depth = 3,
  offset = { x: 4, y: 4 },
  palette = ['teal', 'yellow', 'coral'],
  size = 'h1',
  as = 'h1',
  className,
  style,
}: LayeredHeadlineProps) {
  const scale = typeScale[size]
  const layerCount = Math.max(2, depth)
  // The top layer is in `ink`. There are `layerCount - 1` color layers underneath.
  const colorLayerCount = layerCount - 1

  const baseTextStyle: React.CSSProperties = {
    fontFamily: familyVar[scale.family],
    fontSize: `${scale.size}px`,
    lineHeight: scale.lineHeight,
    fontWeight: scale.weight,
    letterSpacing: scale.tracking,
    fontStyle: scale.family === 'display' ? 'italic' : 'normal',
    margin: 0,
    padding: 0,
    whiteSpace: 'pre-wrap',
  }

  // Lower layers fan out behind the top. Layer 0 is the furthest back
  // (largest offset); layer (colorLayerCount - 1) is the closest behind
  // the ink top.
  const colorLayers = Array.from({ length: colorLayerCount }, (_, i) => {
    const distance = colorLayerCount - i // 1..colorLayerCount, top-most is 1
    const paletteIndex = (colorLayerCount - 1 - i) % palette.length
    const colorKey = palette[paletteIndex]
    if (!colorKey) return null
    const color = colorTokens[colorKey].base
    return { distance, color, key: i }
  }).filter((v): v is { distance: number; color: string; key: number } => v !== null)

  const Tag = as as keyof React.JSX.IntrinsicElements
  const renderTag = React.createElement as typeof React.createElement

  return renderTag(
    Tag,
    {
      className,
      style: {
        position: 'relative',
        display: 'inline-block',
        ...style,
      },
    },
    <>
      {/* Color layers — behind the ink top. Aria-hidden so screen readers
          read the headline exactly once. */}
      {colorLayers.map(({ distance, color, key }) => (
        <span
          key={`layer-${key}`}
          aria-hidden="true"
          style={{
            ...baseTextStyle,
            position: 'absolute',
            inset: 0,
            color,
            transform: `translate(${distance * offset.x}px, ${distance * offset.y}px)`,
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          {children}
        </span>
      ))}
      {/* Top layer — the readable one. Sits in normal flow so the
          component's bounding box matches the rendered text. */}
      <span
        style={{
          ...baseTextStyle,
          position: 'relative',
          color: colorTokens.ink.base,
          display: 'inline-block',
        }}
      >
        {children}
      </span>
    </>,
  )
}
