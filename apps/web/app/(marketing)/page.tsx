import Link from 'next/link'
import { Wordmark, Card, Chip } from '@whosplaying/ui'

export default function HomePage() {
  return (
    <div>
      {/* Hero — layered color blocks behind the wordmark */}
      <section className="relative overflow-hidden bg-teal-50">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-12 w-72 h-72 rounded-full bg-yellow opacity-60" />
          <div className="absolute bottom-10 left-16 w-80 h-80 rounded-full bg-coral opacity-50" />
          <div className="absolute top-40 left-1/3 w-48 h-48 rounded-full bg-orange opacity-40" />
        </div>
        <div className="relative mx-auto max-w-6xl px-6 py-24 text-center">
          <Wordmark width={520} />
          <p className="mt-8 text-2xl text-ink-soft max-w-2xl mx-auto">
            Live local music — for the artists making it, the venues hosting it, and the folks
            showing up.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/signup?as=goer"
              className="bg-coral text-white px-6 py-3 rounded-lg shadow-stack-yellow font-semibold text-lg"
            >
              Find shows near me
            </Link>
            <Link
              href="/for-artists"
              className="bg-paper text-ink border-2 border-ink px-6 py-3 rounded-lg font-semibold text-lg"
            >
              I&rsquo;m an artist
            </Link>
            <Link
              href="/for-venues"
              className="bg-paper text-ink border-2 border-ink px-6 py-3 rounded-lg font-semibold text-lg"
            >
              I run a venue
            </Link>
          </div>
        </div>
      </section>

      {/* Three pillars */}
      <section className="mx-auto max-w-6xl px-6 py-20 grid md:grid-cols-3 gap-6">
        <Card accent="teal">
          <Chip tone="teal">Master calendar</Chip>
          <h2 className="font-display text-3xl mt-3">One feed of every show</h2>
          <p className="mt-2 text-ink-soft">
            Every venue, every artist, in one place. Sync to your phone calendar in two taps.
          </p>
        </Card>
        <Card accent="yellow">
          <Chip tone="yellow">Cross-confirmed</Chip>
          <h2 className="font-display text-3xl mt-3">No more double-bookings</h2>
          <p className="mt-2 text-ink-soft">
            Venues invite. Artists confirm. Both sides see conflicts the moment they happen.
          </p>
        </Card>
        <Card accent="coral">
          <Chip tone="coral">Follow the music</Chip>
          <h2 className="font-display text-3xl mt-3">Hear about every gig</h2>
          <p className="mt-2 text-ink-soft">
            Follow your favorite artists and venues. Get alerts. Save shows. Share with friends.
          </p>
        </Card>
      </section>
    </div>
  )
}
