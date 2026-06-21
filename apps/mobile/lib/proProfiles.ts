import { useCallback, useSyncExternalStore } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

// ─────────────────────────────────────────────────────────────────────────
// Pro profiles ("Acting as") — the entities a pro user can act as.
//
// Mirrors the prototype's PF_ENTS list + actAs() behavior (prototype.html
// ~line 1691-1737). A pro can hold a venue, a solo-artist act, a band, and a
// band-manager seat simultaneously; the active one drives the Work dashboard's
// "Acting as" card and the public page / calendar / offers context.
//
// Backend wiring for real entities lives elsewhere; until then this is static
// placeholder data matching the prototype, with the active index persisted so
// the You screen and the profiles manager stay in sync.
// ─────────────────────────────────────────────────────────────────────────

export type ProKind = 'Venue' | 'Solo artist' | 'Band' | 'Band manager'

export type ProEntity = {
  initials: string
  color: string
  kind: ProKind
  name: string
  sub: string
}

// PF_ENTS placeholder, faithful to the prototype.
export const PRO_ENTITIES: ProEntity[] = [
  { initials: 'SB', color: '#2D7FF9', kind: 'Venue', name: 'Surfer the Bar', sub: 'Jacksonville Beach · you + 3 staff' },
  { initials: 'JW', color: '#FF5A5F', kind: 'Solo artist', name: 'James Warner', sub: 'Singer-songwriter · your solo act' },
  { initials: 'TT', color: '#8B5CF6', kind: 'Band', name: 'The Tide', sub: 'Indie · you perform' },
  { initials: 'TT', color: '#1D9E75', kind: 'Band manager', name: 'The Tide', sub: 'Bookings & business for the band' },
]

const ACTIVE_KEY = 'wp.activeProEntity'

let activeIndex = 0
const listeners = new Set<() => void>()

function emit() {
  for (const l of listeners) l()
}

// Hydrate persisted active index once at module load.
void AsyncStorage.getItem(ACTIVE_KEY).then((raw) => {
  const i = raw == null ? NaN : Number(raw)
  if (Number.isInteger(i) && i >= 0 && i < PRO_ENTITIES.length) {
    activeIndex = i
    emit()
  }
})

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

function getSnapshot() {
  return activeIndex
}

export function setActiveProEntity(i: number) {
  if (i < 0 || i >= PRO_ENTITIES.length || i === activeIndex) return
  activeIndex = i
  void AsyncStorage.setItem(ACTIVE_KEY, String(i))
  emit()
}

/** The active "Acting as" entity + its index, reactive across screens. */
export function useActiveProEntity() {
  const index = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  const setActive = useCallback((i: number) => setActiveProEntity(i), [])
  return { index, entity: PRO_ENTITIES[index] ?? null, entities: PRO_ENTITIES, setActive }
}
