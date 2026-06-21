import * as React from 'react'

type WordmarkProps = {
  /** Width in px. Height scales proportionally (aspect 430 × 84). */
  width?: number
  /** When true, both words render white for use on a coral/ink background. */
  mono?: boolean
  className?: string
}

/**
 * "who's playing" — the v2 "Live Pin" wordmark. Lowercase Inter Black with
 * tight tracking: "who's" in ink-deep, "playing" in coral. Mirrors the
 * canonical treatment in the design prototype and docs/RE_EVALUATION.md §4
 * (the earlier layered lockup is retired). Vector so it renders identically on
 * web and mobile (via react-native-svg).
 */
export function Wordmark({ width = 240, mono = false, className }: WordmarkProps) {
  const aspect = 430 / 84
  const height = width / aspect
  const whos = mono ? '#FFFFFF' : '#071020'
  const playing = mono ? '#FFFFFF' : '#FF5A5F'

  return (
    <svg
      viewBox="0 0 430 84"
      width={width}
      height={height}
      className={className}
      role="img"
      aria-label="Who's Playing"
    >
      <text
        x="2"
        y="62"
        fontFamily='Inter, -apple-system, "SF Pro Display", system-ui, sans-serif'
        fontWeight={800}
        fontSize="64"
        letterSpacing="-2"
      >
        <tspan fill={whos}>who&rsquo;s </tspan>
        <tspan fill={playing}>playing</tspan>
      </text>
    </svg>
  )
}
