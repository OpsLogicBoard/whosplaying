import * as React from 'react'
import { Card } from './Card'
import { Chip } from './Chip'

type EventCardProps = {
  title: string
  venueName: string
  startsAt: Date | string
  performers: string[]
  status: 'draft' | 'proposed' | 'confirmed' | 'cancelled'
  isSpecial?: boolean
  onPress?: () => void
}

// Map domain status → v2 semantic pill tone (DESIGN_SYSTEM.md status map).
const statusTone = {
  draft: 'muted',
  proposed: 'wait',
  confirmed: 'confirmed',
  cancelled: 'coral',
} as const

const statusLabel = {
  draft: 'Draft',
  proposed: 'Pending',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
} as const

export function EventCard({
  title,
  venueName,
  startsAt,
  performers,
  status,
  isSpecial,
  onPress,
}: EventCardProps) {
  const when = typeof startsAt === 'string' ? new Date(startsAt) : startsAt
  const accent = isSpecial ? 'coral' : status === 'confirmed' ? 'confirmed' : status === 'proposed' ? 'wait' : 'none'
  return (
    <Card accent={accent} onClick={onPress} role={onPress ? 'button' : undefined} className={onPress ? 'cursor-pointer transition-shadow hover:shadow-lift' : undefined}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-h3 text-ink">{title}</h3>
          <p className="mt-1 text-body-sm text-ink-soft">{venueName}</p>
          <p className="mt-1 text-caption text-ink-mute">
            {when.toLocaleString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </p>
          {performers.length > 0 && (
            <p className="mt-2 truncate text-body-sm text-ink">{performers.join(' · ')}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          {isSpecial && <Chip tone="coral">Special</Chip>}
          <Chip tone={statusTone[status]}>{statusLabel[status]}</Chip>
        </div>
      </div>
    </Card>
  )
}
