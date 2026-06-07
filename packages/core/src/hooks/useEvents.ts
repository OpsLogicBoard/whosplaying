import type { Event } from '../domain/event'

/** STUB — wire to @whosplaying/supabase events query + react-query */
export function useEvents(_filter?: { from?: Date; to?: Date; venueId?: string }) {
  return { data: [] as Event[], isLoading: false, error: null as Error | null }
}

export function useEvent(_id: string) {
  return { data: null as Event | null, isLoading: false, error: null as Error | null }
}
