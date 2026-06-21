import Link from 'next/link'

// Sample "Tonight" lineup — mirrors the mobile app's discovery feed. Artwork is
// gradient placeholder (real event imagery in production), matching the v2
// "Live Pin" prototype: color lives in the artwork, coral is for actions.
const TONIGHT = [
  { artist: 'Chloe Kimes & The Tide', venue: 'Surfer the Bar', time: '8:30 PM', grad: 'from-coral-grad-start to-coral-grad-end', live: true },
  { artist: 'The Firewater Tent Revival', venue: 'Lemon Bar', time: '9:00 PM', grad: 'from-blue to-purple', live: false },
  { artist: 'Blue Jay', venue: 'Engine 15', time: '7:00 PM', grad: 'from-gold to-coral', live: false },
]

const PILLARS = [
  {
    chip: 'Discover',
    tone: 'bg-coral-soft text-coral',
    title: 'Every show, one feed',
    body: 'Tonight, this week, on the map. Follow artists & venues and get pinged when they post.',
    icon: '📍',
  },
  {
    chip: 'Cross-confirmed',
    tone: 'bg-green-soft text-green',
    title: 'No more double-bookings',
    body: 'Venues invite, performers confirm. A show is “Confirmed” only when both sides agree.',
    icon: '✓',
  },
  {
    chip: 'For the music',
    tone: 'bg-blue-soft text-blue-ink',
    title: 'Free for fans & artists',
    body: 'Always. Get Tickets links are free too. We only charge venues — just enough to keep going.',
    icon: '♫',
  },
]

function PhoneFeed() {
  const featured = TONIGHT[0]
  if (!featured) return null
  return (
    <div className="relative mx-auto w-[270px] rounded-[2.4rem] bg-ink-deep p-2.5 shadow-lift">
      <div className="overflow-hidden rounded-[2rem] bg-canvas">
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <span className="text-sm font-black tracking-tight">
            <span className="text-ink-deep">who&rsquo;s </span>
            <span className="text-coral">playing</span>
          </span>
          <span className="text-[10px] font-bold text-ink-soft">Jax Beach ▾</span>
        </div>
        <div className="px-3 pb-4">
          <p className="px-1 pb-2 text-[15px] font-extrabold tracking-tight text-ink-deep">Tonight</p>
          {/* Featured */}
          <div className={`relative h-28 rounded-2xl bg-gradient-to-br ${featured.grad} p-3 flex flex-col justify-end`}>
            <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-white/25 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur">
              ● LIVE NOW
            </span>
            <p className="text-sm font-extrabold leading-tight text-white">{featured.artist}</p>
            <p className="text-[11px] font-semibold text-white/90">{featured.venue} · {featured.time}</p>
          </div>
          {/* Rows */}
          {TONIGHT.slice(1).map((t) => (
            <div key={t.artist} className="mt-2.5 flex items-center gap-2.5">
              <div className={`h-11 w-11 shrink-0 rounded-xl bg-gradient-to-br ${t.grad}`} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-semibold text-ink">{t.artist}</p>
                <p className="truncate text-[11px] font-medium text-ink-soft">{t.venue}</p>
              </div>
              <span className="text-[11px] font-bold text-ink-deep">{t.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="bg-canvas">
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 pt-14 pb-10 md:pt-20 md:pb-16 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-pill bg-coral-soft px-3.5 py-1.5 text-caption font-bold uppercase tracking-wide text-coral">
            <span className="h-1.5 w-1.5 rounded-full bg-coral" /> Live music near you
          </span>
          <h1 className="mt-5 font-display text-[clamp(40px,6vw,60px)] leading-[1.02] tracking-tight text-ink-deep">
            Find who&rsquo;s playing
            <br />
            <span className="text-coral">tonight.</span>
          </h1>
          <p className="mt-5 max-w-md text-lg text-ink-soft">
            Discover live local music as it happens — follow your favorite artists and venues, save
            shows, and never miss a set.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg bg-coral px-6 py-3 text-body-sm font-bold text-white shadow-card hover:bg-coral-600 transition-colors"
            >
              Find shows near me
            </Link>
            <Link
              href="/for-venues"
              className="rounded-lg border border-ink-line bg-surface px-6 py-3 text-body-sm font-bold text-ink hover:border-ink-mute transition-colors"
            >
              List your venue
            </Link>
          </div>
          <p className="mt-5 flex items-center gap-2 text-caption font-semibold text-ink-soft">
            <span className="text-green">✓</span> Free forever for fans &amp; artists
          </p>
        </div>
        <div className="md:justify-self-end">
          <PhoneFeed />
        </div>
      </section>

      {/* Tonight strip */}
      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex items-end justify-between">
          <h2 className="text-h2 text-ink-deep">Tonight near you</h2>
          <Link href="/login" className="text-body-sm font-bold text-coral hover:underline">
            See all →
          </Link>
        </div>
        <div className="mt-5 grid sm:grid-cols-3 gap-4">
          {TONIGHT.map((t) => (
            <div key={t.artist} className="overflow-hidden rounded-xl border border-ink-line bg-surface shadow-card">
              <div className={`relative h-40 bg-gradient-to-br ${t.grad} p-3 flex flex-col justify-end`}>
                {t.live && (
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/25 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">
                    ● LIVE NOW
                  </span>
                )}
                <p className="text-lg font-extrabold leading-tight text-white">{t.artist}</p>
              </div>
              <div className="px-4 py-3">
                <p className="text-body-sm font-semibold text-ink">{t.venue}</p>
                <p className="text-caption font-medium text-ink-soft">Today · {t.time}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pillars */}
      <section className="mx-auto max-w-6xl px-5 py-12 grid md:grid-cols-3 gap-5">
        {PILLARS.map((p) => (
          <div key={p.title} className="rounded-xl border border-ink-line bg-surface p-6 shadow-card">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-canvas text-lg">{p.icon}</span>
              <span className={`rounded-pill px-2.5 py-1 text-caption font-bold ${p.tone}`}>{p.chip}</span>
            </div>
            <h3 className="mt-4 text-h3 text-ink-deep">{p.title}</h3>
            <p className="mt-2 text-body-sm text-ink-soft">{p.body}</p>
          </div>
        ))}
      </section>

      {/* Audience split */}
      <section className="mx-auto max-w-6xl px-5 py-8 grid sm:grid-cols-2 gap-5">
        <Link href="/for-artists" className="group rounded-xl border border-ink-line bg-surface p-7 shadow-card hover:border-coral transition-colors">
          <h3 className="text-h3 text-ink-deep">I&rsquo;m an artist or band</h3>
          <p className="mt-2 text-body-sm text-ink-soft">Manage gigs, accept invites, bid on open slots, and grow your following — free.</p>
          <span className="mt-4 inline-block text-body-sm font-bold text-coral group-hover:underline">For artists →</span>
        </Link>
        <Link href="/pricing" className="group rounded-xl border border-ink-line bg-surface p-7 shadow-card hover:border-coral transition-colors">
          <h3 className="text-h3 text-ink-deep">I run a venue</h3>
          <p className="mt-2 text-body-sm text-ink-soft">Post your calendar, fill open nights, and reach nearby fans. Free to start; Pro when you&rsquo;re ready.</p>
          <span className="mt-4 inline-block text-body-sm font-bold text-coral group-hover:underline">See pricing →</span>
        </Link>
      </section>

      {/* Mission */}
      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="rounded-xl bg-ink-deep px-7 py-10 text-center text-white">
          <p className="mx-auto max-w-2xl text-xl font-medium leading-relaxed">
            Who&rsquo;s Playing is built for local live music — the artists making it, the venues
            hosting it, and the people showing up. The mission is supporting the scene and staying
            sustainable, not chasing profit.
          </p>
          <Link
            href="/login"
            className="mt-7 inline-block rounded-lg bg-coral px-6 py-3 text-body-sm font-bold text-white shadow-card hover:bg-coral-600 transition-colors"
          >
            Find shows near me
          </Link>
        </div>
      </section>
    </div>
  )
}
