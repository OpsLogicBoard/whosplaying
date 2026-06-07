import type { Follow } from '../domain/social'

/** STUB */
export function useFollows() {
  return { data: [] as Follow[], isLoading: false, error: null as Error | null }
}
