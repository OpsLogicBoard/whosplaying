import * as React from 'react'
import clsx from 'clsx'

type ChipProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: 'teal' | 'yellow' | 'orange' | 'coral' | 'ink'
}

const tones = {
  teal: 'bg-teal-100 text-teal-800',
  yellow: 'bg-yellow-300 text-ink',
  orange: 'bg-orange-400 text-white',
  coral: 'bg-coral-400 text-white',
  ink: 'bg-ink text-white',
}

export function Chip({ tone = 'teal', className, ...rest }: ChipProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-medium',
        tones[tone],
        className,
      )}
      {...rest}
    />
  )
}
