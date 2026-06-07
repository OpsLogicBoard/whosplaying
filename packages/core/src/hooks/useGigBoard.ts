import type { GigListing } from '../domain/gig'

/** STUB */
export function useGigBoard(_filter?: { city?: string; genres?: string[] }) {
  return { data: [] as GigListing[], isLoading: false, error: null as Error | null }
}
