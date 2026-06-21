import * as React from 'react'
import Svg, { Text as SvgText, TSpan } from 'react-native-svg'

type WordmarkProps = {
  /** Width in px. Height scales proportionally (aspect 430 × 84). */
  width?: number
  /** When true, both words render white for use on a coral/ink background. */
  mono?: boolean
  className?: string
}

/**
 * React Native variant of the "who's playing" wordmark. Metro resolves this
 * `.native` file; web uses Wordmark.tsx (DOM SVG). Same vector, same colors,
 * built from react-native-svg primitives so text renders on Hermes.
 */
export function Wordmark({ width = 240, mono = false }: WordmarkProps) {
  const aspect = 430 / 84
  const height = width / aspect
  const whos = mono ? '#FFFFFF' : '#071020'
  const playing = mono ? '#FFFFFF' : '#FF5A5F'

  return (
    <Svg viewBox="0 0 430 84" width={width} height={height} accessibilityLabel="Who’s Playing">
      <SvgText x={2} y={62} fontFamily="Inter" fontWeight="800" fontSize={64} letterSpacing={-2}>
        <TSpan fill={whos}>{'who’s '}</TSpan>
        <TSpan fill={playing}>playing</TSpan>
      </SvgText>
    </Svg>
  )
}
