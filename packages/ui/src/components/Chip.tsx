import * as React from 'react'
import clsx from 'clsx'

/**
 * Status pill — uses the v2 semantic map (DESIGN_SYSTEM.md), never grey-by-default
 * or coral. Mirrors mobile's `StatusBadge` tones.
 */
type ChipProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: 'confirmed' | 'wait' | 'open' | 'muted' | 'coral' | 'ink'
}

const tones = {
  confirmed: 'bg-green-soft text-green', // #E1F5EE / #0F6E56
  wait: 'bg-gold-soft text-gold-ink', // #FAEEDA / #854F0B
  open: 'bg-blue-soft text-blue-ink', // #E6F1FB / #185FA5
  muted: 'bg-[#EEF0F4] text-ink-slate', // #EEF0F4 / #5C6470
  coral: 'bg-coral-soft text-coral',
  ink: 'bg-ink-deep text-white',
}

export function Chip({ tone = 'muted', className, ...rest }: ChipProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-pill px-2.5 py-1 text-[11px] font-extrabold',
        tones[tone],
        className,
      )}
      {...rest}
    />
  )
}
