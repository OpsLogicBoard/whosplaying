// Editorial photo stand-in. A neutral warm-gray plate with a single
// quiet accent block — the "where the photograph goes" placeholder.
// No gradient, no saturated brand color. Phase 1 swaps in real
// uploaded photography.

type PhotoPlateProps = {
  initial: string
  /** Aspect ratio — '4/5' (portrait) for cards, '16/9' for hero, '1/1' for square. */
  aspect?: '4/5' | '16/9' | '1/1' | '3/2'
  className?: string
}

const ASPECT_BOX = {
  '4/5': { w: 400, h: 500 },
  '16/9': { w: 1600, h: 900 },
  '1/1': { w: 500, h: 500 },
  '3/2': { w: 900, h: 600 },
} as const

export function PhotoPlate({ initial, aspect = '4/5', className }: PhotoPlateProps) {
  const box = ASPECT_BOX[aspect]
  const cx = box.w / 2
  const cy = box.h / 2 - box.h * 0.04
  return (
    <svg
      viewBox={`0 0 ${box.w} ${box.h}`}
      className={`block h-full w-full ${className ?? ''}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <rect x="0" y="0" width={box.w} height={box.h} fill="#E8E2D2" />
      <rect x="0" y={box.h * 0.68} width={box.w} height={box.h * 0.32} fill="#D0C8B4" />
      <circle cx={cx} cy={cy} r={box.h * 0.22} fill="#A89F88" />
      <text
        x={cx}
        y={cy + box.h * 0.06}
        textAnchor="middle"
        fontFamily='"Fraunces", Georgia, serif'
        fontStyle="italic"
        fontWeight="600"
        fontSize={box.h * 0.18}
        fill="#FFFCF2"
      >
        {initial}
      </text>
    </svg>
  )
}
