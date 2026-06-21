import * as React from 'react'
import clsx from 'clsx'

/**
 * v2 surface card — flat white on canvas with a soft lift shadow (mirrors mobile's
 * `rounded-[17px] border border-ink-line bg-surface`). The retired stacked-shadow
 * look is gone. `accent` adds a restrained semantic left border; never a coloured fill.
 */
type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  accent?: 'confirmed' | 'wait' | 'open' | 'coral' | 'none'
}

const accents = {
  confirmed: 'border-l-4 border-l-green',
  wait: 'border-l-4 border-l-gold',
  open: 'border-l-4 border-l-blue',
  coral: 'border-l-4 border-l-coral',
  none: '',
}

export function Card({ accent = 'none', className, ...rest }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-xl border border-ink-line bg-surface p-4 shadow-card',
        accents[accent],
        className,
      )}
      {...rest}
    />
  )
}
