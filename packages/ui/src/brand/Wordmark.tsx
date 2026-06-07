import * as React from 'react'

type WordmarkProps = {
  /** Width in px. Height scales proportionally (aspect 320 × 96). */
  width?: number
  /** When true, the layered color blocks are removed (white-on-color usage). */
  mono?: boolean
  className?: string
}

/**
 * "Who's Playing" — the layered lockup. Three stacked passes of the wordmark:
 *   1. Teal block, offset down-right (the "shadow")
 *   2. Yellow block, offset slightly less
 *   3. White face on top
 * This mirrors the layered/overlapping reference imagery. Vector so it
 * renders identically in web and mobile (via react-native-svg).
 */
export function Wordmark({ width = 320, mono = false, className }: WordmarkProps) {
  // Viewbox sized to the rendered glyph metrics: the italic Black face at 64px
  // for "Who's Playing" needs about 410px of horizontal room including the
  // layered offset shadows.
  const aspect = 420 / 96
  const height = width / aspect

  return (
    <svg
      viewBox="0 0 420 96"
      width={width}
      height={height}
      className={className}
      role="img"
      aria-label="Who's Playing"
    >
      {!mono && (
        <>
          {/* Layer 1 — teal block */}
          <text
            x="10"
            y="72"
            fontFamily='"Barlow Condensed", Impact, sans-serif'
            fontWeight={900}
            fontSize="64"
            fontStyle="italic"
            fill="#0AA3A3"
          >
            Who&rsquo;s Playing
          </text>
          {/* Layer 2 — yellow block */}
          <text
            x="6"
            y="68"
            fontFamily='"Barlow Condensed", Impact, sans-serif'
            fontWeight={900}
            fontSize="64"
            fontStyle="italic"
            fill="#FFCB05"
          >
            Who&rsquo;s Playing
          </text>
        </>
      )}
      {/* Layer 3 — white face with ink outline */}
      <text
        x="2"
        y="64"
        fontFamily='"Barlow Condensed", Impact, sans-serif'
        fontWeight={900}
        fontSize="64"
        fontStyle="italic"
        fill="#FFFFFF"
        stroke="#0E1A1A"
        strokeWidth={2}
        paintOrder="stroke"
      >
        Who&rsquo;s Playing
      </text>
    </svg>
  )
}
