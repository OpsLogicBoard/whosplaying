// /welcome — Editorial Magazine direction (Phase 0, Option A).
// One quiet hero, one featured show in long-form treatment, a tight
// list of the rest. No layered headlines, no saturated palette.

import Link from 'next/link'
import { eventsInBucket } from '../_data/sample-events'
import { PhotoPlate } from '../_components/PhotoPlate'

const ACCENT = 'text-teal-shade-1'

function getInitial(name: string) {
  return name.replace(/^the\s+/i, '').charAt(0).toUpperCase()
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function fmtDay(iso: string) {
  return new Date(iso).toLocaleString('en-US', { weekday: 'short' })
}

export default function WelcomePage() {
  const tonight = eventsInBucket('tonight')
  const featured = tonight[0]!
  const rest = tonight.slice(1)

  return (
    <div className="mx-auto max-w-5xl px-6 pb-24 pt-12 sm:pt-16">
      <p className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">
        Issue No. 01 · Jacksonville Beach · Tuesday, June 9
      </p>

      <h1 className="mt-8 max-w-3xl font-editorial text-[clamp(48px,8vw,96px)] font-medium leading-[1.02] tracking-[-0.015em] text-ink">
        Tonight in <span className="italic">JAX Beach</span>
      </h1>

      <p className="mt-6 max-w-xl font-body text-lg leading-relaxed text-ink-soft">
        Sixteen shows up and down the beach this week. No login required —
        browse first, sign in when you want to follow an artist or save a
        venue.
      </p>

      <hr className="mt-16 border-ink-line" />

      {/* Featured — tonight's lead show */}
      <section className="mt-16 grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="overflow-hidden">
            <PhotoPlate initial={getInitial(featured.artist)} aspect="3/2" />
          </div>
        </div>
        <div className="lg:col-span-5 lg:pt-2">
          <p className={`font-mono text-[11px] uppercase tracking-widest ${ACCENT}`}>
            Featured tonight
          </p>
          <h2 className="mt-2 font-editorial text-5xl font-medium leading-tight tracking-tight text-ink">
            {featured.artist}
          </h2>
          <p className="mt-3 font-editorial text-xl italic text-ink-soft">
            at {featured.venue}, {featured.neighborhood}
          </p>
          <p className="mt-6 max-w-md leading-relaxed text-ink-soft">
            {featured.blurb} Doors at {fmtTime(featured.doorsAt)}; set begins
            at {fmtTime(featured.startsAt)}. About a {Math.round(featured.distanceMiles * 18)}-minute walk
            from the pier.
          </p>
          <Link
            href="/e/sample-event"
            className={`mt-8 inline-flex items-center gap-2 border-b-2 border-teal-shade-1 pb-1 font-mono text-[11px] uppercase tracking-widest ${ACCENT} hover:text-ink`}
          >
            Read the show
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <hr className="mt-20 border-ink-line" />

      {/* Also tonight — tight typeset list */}
      <section className="mt-12">
        <div className="flex items-baseline justify-between">
          <h2 className="font-editorial text-2xl font-medium text-ink">Also tonight</h2>
          <Link
            href="/discover"
            className={`font-mono text-[11px] uppercase tracking-widest ${ACCENT} hover:text-ink`}
          >
            All 16 →
          </Link>
        </div>

        <ul className="mt-8 divide-y divide-ink-line">
          {rest.map((evt) => (
            <li key={evt.id}>
              <Link
                href="/e/sample-event"
                className="grid grid-cols-[64px,1fr,auto] items-center gap-5 py-5 transition-colors hover:bg-paper sm:grid-cols-[80px,1fr,auto]"
              >
                <div className="aspect-square w-16 overflow-hidden sm:w-20">
                  <PhotoPlate initial={getInitial(evt.artist)} aspect="1/1" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-editorial text-2xl leading-tight text-ink">
                    {evt.artist}
                  </p>
                  <p className="mt-0.5 truncate text-sm text-ink-soft">
                    {evt.venue} · {evt.neighborhood}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm tabular-nums text-ink">{fmtTime(evt.startsAt)}</p>
                  <p className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">
                    {evt.distanceMiles.toFixed(1)} mi
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <hr className="mt-20 border-ink-line" />

      {/* Two small kickers for artists & venues, quiet */}
      <section className="mt-12 grid gap-10 sm:grid-cols-2">
        <div>
          <p className={`font-mono text-[11px] uppercase tracking-widest ${ACCENT}`}>For artists</p>
          <h3 className="mt-2 font-editorial text-2xl font-medium leading-tight text-ink">
            Post a gig. Get cross-confirmed by the venue.
          </h3>
          <Link
            href="/welcome"
            className="mt-3 inline-block border-b border-ink-line pb-0.5 text-sm text-ink-soft hover:border-ink hover:text-ink"
          >
            How it works for artists →
          </Link>
        </div>
        <div>
          <p className={`font-mono text-[11px] uppercase tracking-widest ${ACCENT}`}>For venues</p>
          <h3 className="mt-2 font-editorial text-2xl font-medium leading-tight text-ink">
            One feed. Every show. Every performer confirmed.
          </h3>
          <Link
            href="/welcome"
            className="mt-3 inline-block border-b border-ink-line pb-0.5 text-sm text-ink-soft hover:border-ink hover:text-ink"
          >
            How it works for venues →
          </Link>
        </div>
      </section>
    </div>
  )
}
