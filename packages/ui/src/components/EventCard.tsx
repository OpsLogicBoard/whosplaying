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

const statusTone = {
  draft: 'ink',
  proposed: 'yellow',
  confirmed: 'teal',
  cancelled: 'coral',
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
  const accent = isSpecial ? 'coral' : status === 'confirmed' ? 'teal' : 'yellow'
  return (
    <Card accent={accent} onClick={onPress} role={onPress ? 'button' : undefined}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-2xl leading-tight text-ink truncate">{title}</h3>
          <p className="text-sm text-ink-soft mt-1">{venueName}</p>
          <p className="text-xs text-ink-mute mt-1">
            {when.toLocaleString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </p>
          {performers.length > 0 && (
            <p className="text-sm text-ink mt-2 truncate">{performers.join(' · ')}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          {isSpecial && <Chip tone="coral">Special</Chip>}
          <Chip tone={statusTone[status]}>{status}</Chip>
        </div>
      </div>
    </Card>
  )
}
