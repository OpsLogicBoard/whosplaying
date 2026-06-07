import type { Event } from '../domain/event'

export type OverlapPair = { a: Event; b: Event }

/**
 * Naive O(n log n) sweep — sort by start, walk forward, emit pairs whose
 * intervals overlap. Replaced by the edge-function tile-and-query
 * implementation at scale, but this is fine for in-app validation
 * (e.g. an artist about to accept a gig that conflicts with another).
 */
export function detectConflicts(events: Event[]): OverlapPair[] {
  const sorted = [...events].sort(
    (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
  )
  const conflicts: OverlapPair[] = []
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const a = sorted[i]!
      const b = sorted[j]!
      const aEnd = new Date(a.ends_at ?? a.starts_at).getTime()
      const bStart = new Date(b.starts_at).getTime()
      if (bStart >= aEnd) break
      conflicts.push({ a, b })
    }
  }
  return conflicts
}
