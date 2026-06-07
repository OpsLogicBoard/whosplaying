import { EventCard } from '@whosplaying/ui'

export default function CalendarPage() {
  // STUB — wire to eventsQ.listEvents
  const demo = [
    {
      id: '1',
      title: 'Palm Row + The Tides',
      venueName: 'The Sandbar',
      startsAt: new Date(Date.now() + 86_400_000 * 2).toISOString(),
      performers: ['Palm Row', 'The Tides'],
      status: 'confirmed' as const,
    },
    {
      id: '2',
      title: 'Songwriter Round',
      venueName: 'Riverside Listening Room',
      startsAt: new Date(Date.now() + 86_400_000 * 5).toISOString(),
      performers: ['Maya Hart', 'Jonas Lin', 'Ash Reed'],
      status: 'proposed' as const,
      isSpecial: true,
    },
  ]
  return (
    <section>
      <h1 className="font-display text-4xl">Who&rsquo;s playing</h1>
      <p className="text-ink-soft mt-1">All upcoming shows in your area.</p>
      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {demo.map((e) => (
          <EventCard key={e.id} {...e} />
        ))}
      </div>
    </section>
  )
}
