import * as React from 'react'

const C = {
  ink: '#111318',
  deepInk: '#071020',
  coral: '#FF5A5F',
  coralStart: '#FF4F63',
  orange: '#FF6B42',
  waveOrange: '#FF7A3F',
  hotPink: '#FF2F70',
  playingTop: '#FF8751',
  playingMid: '#FF5A5F',
  playingBottom: '#FF3F73',
  boardBg: '#F8F9FB',
} as const

export type WhosPlayingLogoVariant = 'compact' | 'full' | 'mark' | 'reviewBoard'

export type WhosPlayingLogoProps = {
  variant?: WhosPlayingLogoVariant
  width?: number
  size?: number
  mono?: boolean
  className?: string
}

function useGradientId(prefix: string) {
  return `${prefix}-${React.useId().replace(/:/g, '')}`
}

type MarkProps = {
  width: number
  mono?: boolean
  decorative?: boolean
  className?: string
}

export function LivePinMark({ width, mono = false, decorative = false, className }: MarkProps) {
  const gradientId = useGradientId('wp-pin-gradient')
  const fillStart = mono ? '#FFFFFF' : C.coralStart
  const fillMid = mono ? '#FFFFFF' : C.orange
  const fillEnd = mono ? '#FFFFFF' : C.hotPink
  const circleFill = mono ? C.ink : '#FFFFFF'
  const playFill = mono ? C.ink : `url(#${gradientId})`
  const leftOuter = mono ? '#FFFFFF' : C.coral
  const leftInner = mono ? '#FFFFFF' : C.waveOrange

  return (
    <svg
      viewBox="0 0 250 270"
      width={width}
      height={(width * 270) / 250}
      className={className}
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : "Who's Playing location pin with play button"}
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="40"
          y1="20"
          x2="215"
          y2="250"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={fillStart} />
          <stop offset="48%" stopColor={fillMid} />
          <stop offset="100%" stopColor={fillEnd} />
        </linearGradient>
      </defs>

      <path
        d="M31 100 C8 125 8 165 31 190"
        fill="none"
        stroke={leftOuter}
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M48 118 C34 135 34 155 48 172"
        fill="none"
        stroke={leftInner}
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M126 18 C178 18 219 59 219 111 C219 173 154 233 126 258 C98 233 33 173 33 111 C33 59 74 18 126 18Z"
        fill={`url(#${gradientId})`}
      />
      <circle cx="126" cy="111" r="67" fill={circleFill} />
      <path
        d="M108 78 C108 72 115 69 120 73 L159 101 C166 106 166 116 159 121 L120 149 C115 153 108 150 108 144Z"
        fill={playFill}
      />
      <path
        d="M221 166 C240 181 240 209 221 225"
        fill="none"
        stroke={leftInner}
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M204 178 C216 188 216 201 204 211"
        fill="none"
        stroke={leftOuter}
        strokeWidth="7"
        strokeLinecap="round"
      />
    </svg>
  )
}

function CompactPinMark({ width, mono = false, decorative = false, className }: MarkProps) {
  const gradientId = useGradientId('wp-compact-pin-gradient')
  const fillStart = mono ? '#FFFFFF' : C.coralStart
  const fillMid = mono ? '#FFFFFF' : C.orange
  const fillEnd = mono ? '#FFFFFF' : C.hotPink
  const circleFill = mono ? C.ink : '#FFFFFF'
  const playFill = mono ? C.ink : `url(#${gradientId})`
  const waveOuter = mono ? '#FFFFFF' : C.coral
  const waveInner = mono ? '#FFFFFF' : C.waveOrange

  return (
    <svg
      viewBox="0 0 250 270"
      width={width}
      height={(width * 270) / 250}
      className={className}
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : "Who's Playing location pin with play button"}
      focusable="false"
      style={{ display: 'block', overflow: 'visible' }}
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="40"
          y1="20"
          x2="215"
          y2="250"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={fillStart} />
          <stop offset="48%" stopColor={fillMid} />
          <stop offset="100%" stopColor={fillEnd} />
        </linearGradient>
      </defs>
      <path
        d="M31 100 C8 125 8 165 31 190"
        fill="none"
        stroke={waveOuter}
        strokeWidth="9"
        strokeLinecap="round"
      />
      <path
        d="M48 118 C34 135 34 155 48 172"
        fill="none"
        stroke={waveInner}
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M126 18 C178 18 219 59 219 111 C219 173 154 233 126 258 C98 233 33 173 33 111 C33 59 74 18 126 18Z"
        fill={`url(#${gradientId})`}
      />
      <circle cx="126" cy="111" r="67" fill={circleFill} />
      <path
        d="M108 78 C108 72 115 69 120 73 L159 101 C166 106 166 116 159 121 L120 149 C115 153 108 150 108 144Z"
        fill={playFill}
      />
      <path
        d="M221 166 C240 181 240 209 221 225"
        fill="none"
        stroke={waveInner}
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M204 178 C216 188 216 201 204 211"
        fill="none"
        stroke={waveOuter}
        strokeWidth="8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function WordmarkText({
  scale,
  mono = false,
  compact = false,
}: {
  scale: number
  mono?: boolean
  compact?: boolean
}) {
  const whosSize = compact ? 20 : 74
  const playingSize = compact ? 21 : 77
  const whosLine = compact ? 0.86 : 0.92
  const playingLine = compact ? 0.86 : 0.9
  const gap = compact ? 1 : 14
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        transform: `scale(${scale})`,
        transformOrigin: 'left top',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
        fontWeight: compact ? 700 : 900,
        letterSpacing: compact ? '-0.035em' : '-0.055em',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          color: mono ? '#FFFFFF' : C.deepInk,
          fontSize: whosSize,
          lineHeight: whosLine,
        }}
      >
        who&apos;s
      </span>
      <span
        style={{
          marginTop: gap,
          fontSize: playingSize,
          lineHeight: playingLine,
          background: mono
            ? undefined
            : `linear-gradient(180deg, ${C.playingTop} 0%, ${C.playingMid} 52%, ${C.playingBottom} 100%)`,
          WebkitBackgroundClip: mono ? undefined : 'text',
          backgroundClip: mono ? undefined : 'text',
          color: mono ? '#FFFFFF' : 'transparent',
        }}
      >
        playing
      </span>
    </span>
  )
}

function CompactLogo({ width = 154, mono = false, className }: WhosPlayingLogoProps) {
  const markWidth = 28
  const naturalWidth = 154
  const scale = width / naturalWidth
  return (
    <span
      className={className}
      role="img"
      aria-label="Who's Playing"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6 * scale,
        width,
        height: 30 * scale,
        overflow: 'hidden',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
        fontSize: 18 * scale,
        lineHeight: `${30 * scale}px`,
        fontWeight: 700,
        letterSpacing: '-0.035em',
        whiteSpace: 'nowrap',
      }}
    >
      <CompactPinMark width={markWidth * scale} mono={mono} decorative />
      <span
        aria-hidden="true"
        style={{
          display: 'inline-flex',
          alignItems: 'baseline',
          gap: 4 * scale,
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        <span style={{ color: mono ? '#FFFFFF' : C.deepInk }}>who&apos;s</span>
        <span
          style={{
            background: mono
              ? undefined
              : `linear-gradient(180deg, ${C.playingTop} 0%, ${C.playingMid} 52%, ${C.playingBottom} 100%)`,
            WebkitBackgroundClip: mono ? undefined : 'text',
            backgroundClip: mono ? undefined : 'text',
            color: mono ? '#FFFFFF' : 'transparent',
          }}
        >
          playing
        </span>
      </span>
    </span>
  )
}

function FullLogo({ width = 622, mono = false, className }: WhosPlayingLogoProps) {
  const scale = width / 622
  return (
    <span
      className={className}
      role="img"
      aria-label="Who's Playing. Live music. Local people. Real connection."
      style={{
        display: 'inline-block',
        position: 'relative',
        width,
        height: 322 * scale,
        overflow: 'visible',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
      }}
    >
      <LivePinMark width={250 * scale} mono={mono} decorative className="wp-logo-mark" />
      <span
        style={{
          position: 'absolute',
          left: 277 * scale,
          top: 27 * scale,
          width: 350 * scale,
          height: 166 * scale,
        }}
      >
        <WordmarkText scale={scale} mono={mono} />
      </span>
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: 26 * scale,
          top: 296 * scale,
          width: 496 * scale,
          color: mono ? '#FFFFFF' : C.ink,
          fontSize: 16 * scale,
          lineHeight: 1,
          fontWeight: 800,
          letterSpacing: `${0.105 * 16 * scale}px`,
          whiteSpace: 'nowrap',
          textAlign: 'center',
        }}
      >
        LIVE MUSIC. &nbsp; LOCAL PEOPLE. &nbsp; REAL CONNECTION.
      </span>
    </span>
  )
}

function ReviewBoardLogo({ width = 754, className }: WhosPlayingLogoProps) {
  const scale = width / 754
  return (
    <section
      className={className}
      aria-label="Who's Playing primary logo"
      style={{
        position: 'relative',
        width,
        height: 428 * scale,
        background: C.boardBg,
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 43 * scale,
          left: 44 * scale,
          fontSize: 15 * scale,
          lineHeight: 1,
          fontWeight: 800,
          letterSpacing: '0.02em',
          color: C.ink,
        }}
      >
        PRIMARY LOGO
      </div>
      <div style={{ position: 'absolute', top: 72 * scale, left: 48 * scale }}>
        <FullLogo width={622 * scale} />
      </div>
    </section>
  )
}

export function WhosPlayingLogo({
  variant = 'compact',
  width,
  size,
  mono = false,
  className,
}: WhosPlayingLogoProps) {
  const resolvedWidth =
    width ??
    (variant === 'mark'
      ? size ?? 64
      : variant === 'compact'
        ? size ?? 154
        : variant === 'reviewBoard'
          ? size ?? 754
          : size ?? 622)

  if (variant === 'mark') {
    return <CompactPinMark width={resolvedWidth} mono={mono} className={className} />
  }
  if (variant === 'full') {
    return <FullLogo width={resolvedWidth} mono={mono} className={className} />
  }
  if (variant === 'reviewBoard') {
    return <ReviewBoardLogo width={resolvedWidth} className={className} />
  }
  return <CompactLogo width={resolvedWidth} mono={mono} className={className} />
}
