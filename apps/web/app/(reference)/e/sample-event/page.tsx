// /e/sample-event — Editorial Magazine direction (Phase 0, Option A).
// Feature-article rhythm. Full-bleed photo, kicker, big serif headline,
// long-form bio, side-by-side venue/when panels, quiet share row.

import type { Metadata } from 'next'
import Link from 'next/link'
import { SAMPLE_EVENTS } from '../../_data/sample-events'
import { PhotoPlate } from '../../_components/PhotoPlate'

const EVENT = SAMPLE_EVENTS[0]!

const SITE = 'https://whosplaying.live'
const URL = `${SITE}/e/sample-event`
const OG_IMAGE = `${SITE}/og/sample-event.svg`

const TITLE = `${EVENT.artist} at ${EVENT.venue} — Who's Playing`
const DESCRIPTION = `${EVENT.artist} live at ${EVENT.venue}, ${EVENT.neighborhood}. ${EVENT.blurb}`

const ACCENT = 'text-teal-shade-1'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    siteName: "Who's Playing",
    type: 'website',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: TITLE }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
  alternates: { canonical: URL },
}

function fmtFull(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function getInitial(name: string) {
  return name.replace(/^the\s+/i, '').charAt(0).toUpperCase()
}

export default function SampleEventPage() {
  return (
    <article className="pb-24">
      {/* Full-bleed hero plate. No text overlay — the headline sits
          below, where editorial features always put it. */}
      <div className="mt-2 aspect-[16/9] w-full overflow-hidden">
        <PhotoPlate initial={getInitial(EVENT.artist)} aspect="16/9" />
      </div>

      <div className="mx-auto max-w-3xl px-6 pt-12 sm:pt-16">
        <p className={`font-mono text-[11px] uppercase tracking-widest ${ACCENT}`}>
          Tonight · Jacksonville Beach · Featured show
        </p>

        <h1 className="mt-4 font-editorial text-[clamp(40px,6vw,72px)] font-medium leading-[1.05] tracking-tight text-ink">
          {EVENT.artist} <span className="italic text-ink-soft">at</span>{' '}
          {EVENT.venue}
        </h1>

        <p className="mt-6 font-editorial text-2xl italic leading-snug text-ink-soft">
          {EVENT.blurb}
        </p>

        {/* Long-form bio / setting paragraph */}
        <div className="mt-12 max-w-prose space-y-5 text-lg leading-relaxed text-ink">
          <p>
            {EVENT.artist} returns to {EVENT.venue} for a two-set evening
            on the beach. The {EVENT.neighborhood} listening room — a
            century-old porch turned stage — sits roughly{' '}
            {EVENT.distanceMiles.toFixed(1)} miles from the pier, well
            within walking distance for anyone already out tonight.
          </p>
          <p>
            Doors at <span className="font-mono text-base">{fmtTime(EVENT.doorsAt)}</span>;
            the first set begins at{' '}
            <span className="font-mono text-base">{fmtTime(EVENT.startsAt)}</span>.
            No cover. Standing room and a small bar. The band will play covers
            first, originals second.
          </p>
        </div>

        <hr className="mt-16 border-ink-line" />

        {/* When + Where, magazine-style side panels */}
        <section className="mt-12 grid gap-12 sm:grid-cols-2">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">When</p>
            <p className="mt-3 font-editorial text-2xl leading-snug text-ink">
              {fmtFull(EVENT.startsAt)}
            </p>
            <p className="mt-2 font-mono text-sm text-ink-soft">
              Doors {fmtTime(EVENT.doorsAt)} · Set {fmtTime(EVENT.startsAt)}
            </p>
            <a
              href="/sample-event.ics"
              download
              className={`mt-6 inline-block border-b-2 border-teal-shade-1 pb-1 font-mono text-[11px] uppercase tracking-widest ${ACCENT} hover:text-ink`}
            >
              Add to your calendar →
            </a>
            <p className="mt-2 text-xs text-ink-soft">No sign-in needed.</p>
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">Where</p>
            <p className="mt-3 font-editorial text-2xl leading-snug text-ink">{EVENT.venue}</p>
            <p className="mt-1 text-ink-soft">{EVENT.neighborhood}</p>
            <p className="mt-3 font-mono text-sm text-ink-soft">
              {EVENT.distanceMiles.toFixed(1)} mi · ~{Math.round(EVENT.distanceMiles * 18)} min walk
            </p>
            <div className="mt-5 overflow-hidden border border-ink-line">
              <svg viewBox="0 0 800 280" className="block h-auto w-full" aria-hidden="true">
                <rect x="0" y="0" width="800" height="280" fill="#FFFCF2" />
                <path d="M 620 0 L 800 0 L 800 280 L 600 280 Q 590 200 615 140 Q 640 70 620 0 Z" fill="#E8E2D2" />
                <line x1="0" y1="140" x2="565" y2="140" stroke="#D7E2E2" strokeWidth="2" />
                <line x1="280" y1="0" x2="280" y2="280" stroke="#D7E2E2" strokeWidth="2" />
                <circle cx="320" cy="150" r="6" fill="#0E1A1A" />
              </svg>
            </div>
          </div>
        </section>

        <hr className="mt-16 border-ink-line" />

        {/* Quiet performer block */}
        <section className="mt-12 grid gap-6 sm:grid-cols-[120px,1fr] sm:items-start">
          <div className="aspect-square w-28 overflow-hidden sm:w-full">
            <PhotoPlate initial={getInitial(EVENT.artist)} aspect="1/1" />
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">The act</p>
            <p className="mt-2 font-editorial text-3xl leading-tight text-ink">{EVENT.artist}</p>
            <p className="mt-1 italic text-ink-soft">Three-piece beach folk · Jacksonville Beach</p>
            <button
              type="button"
              disabled
              title="Sign in to follow"
              className="mt-4 border-b border-ink-line pb-0.5 font-mono text-[11px] uppercase tracking-widest text-ink-soft"
            >
              Sign in to follow this artist
            </button>
          </div>
        </section>

        <hr className="mt-16 border-ink-line" />

        {/* Share — quiet text row */}
        <section className="mt-12">
          <p className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">Share</p>
          <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3 text-sm">
            <Link
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${EVENT.artist} at ${EVENT.venue} tonight — `)}&url=${encodeURIComponent(URL)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="border-b border-ink-line pb-0.5 text-ink hover:border-ink"
            >
              Twitter
            </Link>
            <Link
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="border-b border-ink-line pb-0.5 text-ink hover:border-ink"
            >
              Instagram
            </Link>
            <button
              type="button"
              className="border-b border-ink-line pb-0.5 text-ink hover:border-ink"
            >
              Copy link
            </button>
          </div>
        </section>
      </div>
    </article>
  )
}
