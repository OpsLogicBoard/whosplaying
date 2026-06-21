import * as React from 'react'
import clsx from 'clsx'

type ChipProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: 'green' | 'yellow' | 'orange' | 'coral' | 'ink'
}

const tones = {
  green: 'bg-green-100 text-green-800',
  yellow: 'bg-yellow-300 text-ink',
  orange: 'bg-orange-400 text-white',
  coral: 'bg-coral-400 text-white',
  ink: 'bg-ink text-white',
}

export function Chip({ tone = 'green', className, ...rest }: ChipProps) {
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
