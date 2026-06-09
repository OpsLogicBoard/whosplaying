// /discover — Editorial Magazine direction (Phase 0, Option A).
// Day-as-headline; each show is a long-form row, not a card. Tabs are
// underlined links, not pills. One muted accent. No layered headlines.

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { eventsInBucket, type SampleEvent } from '../_data/sample-events'
import { PhotoPlate } from '../_components/PhotoPlate'

const ACCENT = 'text-teal-shade-1'

const TABS: { key: SampleEvent['bucket']; label: string; date: string }[] = [
  { key: 'tonight', label: 'Tonight', date: 'Tuesday · June 9' },
  { key: 'tomorrow', label: 'Tomorrow', date: 'Wednesday · June 10' },
  { key: 'weekend', label: 'Weekend', date: 'June 12 – 14' },
]

function fmtTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function getInitial(name: string) {
  return name.replace(/^the\s+/i, '').charAt(0).toUpperCase()
}

export default function DiscoverPage() {
  const [active, setActive] = useState<SampleEvent['bucket']>('tonight')
  const events = eventsInBucket(active).slice(0, 8)
  const tab = TABS.find((t) => t.key === active)!

  return (
    <div className="mx-auto max-w-5xl px-6 pb-24 pt-12 sm:pt-16">
      <p className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">
        The Listings · Jacksonville Beach
      </p>

      {/* Tabs — underlined text, not chunky pills */}
      <nav
        className="mt-8 flex flex-wrap items-baseline gap-x-10 gap-y-3"
        role="tablist"
        aria-label="Browse by day"
      >
        {TABS.map((t) => {
          const isActive = active === t.key
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(t.key)}
              className={
                'pb-1.5 font-editorial text-3xl leading-none transition-colors ' +
                (isActive
                  ? 'border-b-2 border-ink text-ink'
                  : 'border-b-2 border-transparent text-ink-soft hover:text-ink')
              }
            >
              {t.label}
            </button>
          )
        })}
      </nav>

      <p className="mt-3 font-mono text-[11px] uppercase tracking-widest text-ink-soft">
        {tab.date}
      </p>

      <h1 className="mt-10 max-w-3xl font-editorial text-6xl font-medium leading-[1.05] tracking-tight text-ink">
        {events.length} shows, all within a 2-mile walk.
      </h1>

      <hr className="mt-12 border-ink-line" />

      <ul>
        {events.map((evt) => (
          <li key={evt.id}>
            <Link
              href="/e/sample-event"
              className="grid grid-cols-1 gap-6 border-b border-ink-line py-10 transition-colors hover:bg-paper sm:grid-cols-12"
            >
              <div className="sm:col-span-4">
                <div className="overflow-hidden">
                  <PhotoPlate initial={getInitial(evt.artist)} aspect="4/5" />
                </div>
              </div>
              <div className="sm:col-span-8 sm:pt-2">
                <p className={`font-mono text-[11px] uppercase tracking-widest ${ACCENT}`}>
                  {fmtTime(evt.startsAt)} · {evt.distanceMiles.toFixed(1)} mi
                </p>
                <h2 className="mt-2 font-editorial text-4xl font-medium leading-tight tracking-tight text-ink sm:text-5xl">
                  {evt.artist}
                </h2>
                <p className="mt-2 font-editorial text-xl italic text-ink-soft">
                  at {evt.venue}, {evt.neighborhood}
                </p>
                {evt.blurb && (
                  <p className="mt-4 max-w-xl leading-relaxed text-ink-soft">{evt.blurb}</p>
                )}
                <p
                  className={`mt-6 inline-block border-b-2 border-teal-shade-1 pb-1 font-mono text-[11px] uppercase tracking-widest ${ACCENT}`}
                >
                  Read the show →
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <section className="mt-20">
        <p className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">On the map</p>
        <h2 className="mt-2 font-editorial text-4xl font-medium tracking-tight text-ink">
          A 2-mile stretch of beach, mapped.
        </h2>
        <Link href="/reference/map" className="mt-6 block overflow-hidden border border-ink-line" aria-label="Open full map">
          <svg viewBox="0 0 800 280" className="block h-auto w-full" aria-hidden="true">
            <rect x="0" y="0" width="800" height="280" fill="#FFFCF2" />
            <path d="M 620 0 L 800 0 L 800 280 L 600 280 Q 590 200 615 140 Q 640 70 620 0 Z" fill="#E8E2D2" />
            <line x1="0" y1="140" x2="565" y2="140" stroke="#D7E2E2" strokeWidth="2" />
            <line x1="280" y1="0" x2="280" y2="280" stroke="#D7E2E2" strokeWidth="2" />
            <line x1="440" y1="40" x2="440" y2="280" stroke="#D7E2E2" strokeWidth="1.5" />
            {[
              { x: 240, y: 120 },
              { x: 380, y: 200 },
              { x: 160, y: 220 },
              { x: 500, y: 100 },
              { x: 320, y: 60 },
            ].map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="5" fill="#0E1A1A" />
            ))}
          </svg>
        </Link>
      </section>
    </div>
  )
}
