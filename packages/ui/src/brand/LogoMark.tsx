import * as React from 'react'

type LogoMarkProps = {
  size?: number
  className?: string
}

/**
 * Square logo mark — used in app icons, avatars, favicons.
 * Stacked color blocks form a stylized "WP" lockup.
 */
export function LogoMark({ size = 64, className }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="Who's Playing"
    >
      {/* Background — rounded teal square */}
      <rect x="0" y="0" width="64" height="64" rx="14" fill="#0AA3A3" />
      {/* Yellow offset block */}
      <rect x="8" y="8" width="48" height="48" rx="10" fill="#FFCB05" />
      {/* Coral offset block */}
      <rect x="12" y="12" width="40" height="40" rx="8" fill="#FF4D63" />
      {/* White face with WP monogram */}
      <rect x="16" y="16" width="32" height="32" rx="6" fill="#FFFFFF" />
      <text
        x="32"
        y="42"
        textAnchor="middle"
        fontFamily='"Barlow Condensed", Impact, sans-serif'
        fontWeight={900}
        fontSize="28"
        fontStyle="italic"
        fill="#0E1A1A"
      >
        WP
      </text>
    </svg>
  )
}
