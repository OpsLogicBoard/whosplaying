'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { EventCard, Card } from '@whosplaying/ui'
import { eventsQ } from '@whosplaying/supabase'
import { createBrowserSupabase } from '@/lib/supabase/browser'

type EventRow = {
  id: string
  title: string
  starts_at: string
  status: 'draft' | 'proposed' | 'confirmed' | 'cancelled'
  is_special: boolean
  venue: { name: string } | null
  performers: Array<{ performer_type: string; performer_id: string }>
}

export default function CalendarPage() {
  const supabase = useMemo(() => createBrowserSupabase(), [])

  const { data, isLoading, error } = useQuery({
    queryKey: ['events', 'upcoming'],
    queryFn: async () => {
      const from = new Date()
      from.setHours(0, 0, 0, 0)
      const { data, error } = await eventsQ.listEvents(supabase, { from })
      if (error) throw error
      return (data ?? []) as EventRow[]
    },
  })

  return (
    <section>
      <h1 className="font-display text-4xl">Who&rsquo;s playing</h1>
      <p className="text-ink-soft mt-1">All upcoming shows in your area.</p>

      {isLoading && (
        <p className="mt-6 text-ink-mute">Loading…</p>
      )}

      {error && (
        <Card accent="coral" className="mt-6">
          <p className="text-coral-600 font-medium">Couldn&rsquo;t load events</p>
          <p className="text-sm text-ink-soft mt-1">{(error as Error).message}</p>
        </Card>
      )}

      {!isLoading && !error && (data?.length ?? 0) === 0 && (
        <div className="mt-6 rounded-lg border border-dashed border-ink-line p-12 text-center text-ink-mute">
          <p className="font-medium text-ink">No shows yet.</p>
          <p className="text-sm mt-1">As venues post events, they&rsquo;ll appear here.</p>
        </div>
      )}

      {data && data.length > 0 && (
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((e) => (
            <EventCard
              key={e.id}
              title={e.title}
              venueName={e.venue?.name ?? 'Unknown venue'}
              startsAt={e.starts_at}
              performers={e.performers.map((p) => `${p.performer_type}:${p.performer_id.slice(0, 6)}`)}
              status={e.status}
              isSpecial={e.is_special}
            />
          ))}
        </div>
      )}
    </section>
  )
}
