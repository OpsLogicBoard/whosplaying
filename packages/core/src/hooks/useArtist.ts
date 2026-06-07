import type { Artist } from '../domain/artist'

/** STUB */
export function useArtist(_slug: string) {
  return { data: null as Artist | null, isLoading: false, error: null as Error | null }
}
