// ShowCard — editorial event card used across the Phase 0 reference
// compositions. Neutral grayscale photo stand-in; brand color appears
// only as a thin accent rule and on the status pill. The brand still
// reads — through the type, the page rhythm, and the occasional
// accent — but the card itself isn't shouting.

import type { SampleEvent } from '../_data/sample-events'

const ACCENT = {
  teal: 'border-l-teal',
  yellow: 'border-l-yellow',
  coral: 'border-l-coral',
  orange: 'border-l-orange',
} as const

const STATUS_LABEL = {
  active: 'Live now',
  confirmed: 'Confirmed',
  proposed: 'Proposed',
} as const

const STATUS_DOT = {
  active: 'bg-coral',
  confirmed: 'bg-teal',
  proposed: 'bg-yellow',
} as const

function formatTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function ShowCard({ event, layout = 'card' }: { event: SampleEvent; layout?: 'card' | 'row' }) {
  if (layout === 'row') {
    return (
      <article className="group flex items-stretch gap-5 border-t border-ink-line py-6">
        <div className="aspect-[4/5] w-32 flex-shrink-0 overflow-hidden bg-paper-warm sm:w-40">
          <PhotoStandIn artist={event.artist} />
        </div>
        <div className="flex flex-1 flex-col">
          <p className="font-mono text-[11px] uppercase tracking-wider text-ink-mute">
            {formatTime(event.startsAt)} · {event.distanceMiles.toFixed(1)} mi
          </p>
          <h3 className="mt-1 font-display text-3xl italic text-ink sm:text-4xl">
            {event.artist}
          </h3>
          <p className="mt-1 font-body text-base text-ink-soft">
            {event.venue} · {event.neighborhood}
          </p>
          {event.blurb && (
            <p className="mt-2 max-w-prose text-sm text-ink-soft">{event.blurb}</p>
          )}
          <div className="mt-auto flex items-center gap-1.5 pt-3">
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${STATUS_DOT[event.status]}`} />
            <span className="font-mono text-[11px] uppercase tracking-wider text-ink-mute">
              {STATUS_LABEL[event.status]}
            </span>
          </div>
        </div>
      </article>
    )
  }
  return (
    <article className={`group flex flex-col gap-3 border-l-2 pl-4 transition-colors ${ACCENT[event.palette]} hover:bg-paper-warm`}>
      <div className="aspect-[4/5] w-full overflow-hidden bg-paper-warm">
        <PhotoStandIn artist={event.artist} />
      </div>
      <div>
        <p className="font-mono text-[11px] uppercase tracking-wider text-ink-mute">
          {formatTime(event.startsAt)} · {event.distanceMiles.toFixed(1)} mi
        </p>
        <h3 className="mt-1 font-display text-2xl italic leading-tight text-ink">
          {event.artist}
        </h3>
        <p className="mt-1 font-body text-sm text-ink-soft">
          {event.venue} · {event.neighborhood}
        </p>
        <div className="mt-2 flex items-center gap-1.5">
          <span className={`inline-block h-1.5 w-1.5 rounded-full ${STATUS_DOT[event.status]}`} />
          <span className="font-mono text-[11px] uppercase tracking-wider text-ink-mute">
            {STATUS_LABEL[event.status]}
          </span>
        </div>
      </div>
    </article>
  )
}

// Editorial photo stand-in — neutral grayscale composition. No saturated
// gradient blocks. The artist initial sits quietly, like a printed
// program. Phase 1 replaces this with real uploaded photography.
function PhotoStandIn({ artist }: { artist: string }) {
  const initial = artist.replace(/^the\s+/i, '').charAt(0).toUpperCase()
  return (
    <svg viewBox="0 0 200 250" className="block h-full w-full" aria-hidden="true">
      <rect x="0" y="0" width="200" height="250" fill="#EDEAE0" />
      <rect x="0" y="170" width="200" height="80" fill="#D8D2C0" />
      <circle cx="100" cy="115" r="44" fill="#B8B0A0" />
      <text
        x="100"
        y="128"
        textAnchor="middle"
        fontFamily='"Barlow Condensed", Impact, sans-serif'
        fontStyle="italic"
        fontWeight="900"
        fontSize="48"
        fill="#FFFCF2"
      >
        {initial}
      </text>
    </svg>
  )
}
