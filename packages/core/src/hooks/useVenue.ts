import type { Venue } from '../domain/venue'

/** STUB */
export function useVenue(_slug: string) {
  return { data: null as Venue | null, isLoading: false, error: null as Error | null }
}
