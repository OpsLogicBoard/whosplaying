import type { ConflictFlag } from '../domain/conflicts'

/** STUB — surfaces unresolved conflicts for the signed-in user's venues/profiles */
export function useConflicts() {
  return { data: [] as ConflictFlag[], isLoading: false, error: null as Error | null }
}
