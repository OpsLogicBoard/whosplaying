import * as React from 'react'
import clsx from 'clsx'

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  accent?: 'teal' | 'yellow' | 'orange' | 'coral' | 'none'
}

const accents = {
  teal: 'shadow-stack-teal',
  yellow: 'shadow-stack-yellow',
  orange: 'shadow-stack-orange',
  coral: 'shadow-stack-coral',
  none: 'shadow-card',
}

export function Card({ accent = 'none', className, ...rest }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-paper rounded-lg border border-ink-line p-4',
        accents[accent],
        className,
      )}
      {...rest}
    />
  )
}
