import { useSyncExternalStore } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

// ─────────────────────────────────────────────────────────────────────────
// App persona + mode — the role-adaptive profile model.
//
// The prototype (docs/design/prototype.html, renderYou/setPersona/pfSetMode)
// distinguishes TWO axes:
//
//   • persona: 'goer' | 'pro'
//       A fan-only account is a goer. A user who has at least one pro entity
//       (venue / solo artist / band / band manager) is a "pro". Goers can
//       upgrade in place (the "Set up a pro profile" card flips persona).
//
//   • mode: 'play' | 'work'   (persisted; legacy value 'manage' ⇒ 'work')
//       Pros toggle a Work/Play master switch. Goers are always 'play' and
//       never see the switch. 'work' swaps the tab set in
//       app/(tabs)/_layout.tsx to the Manage layout.
//
// Persona is derived from real data when available (e.g. ownsVenue) but a
// goer can opt into 'pro' locally via setPersona — keep that flag here so the
// You screen can present the work dashboard before any pro entity exists.
// ─────────────────────────────────────────────────────────────────────────

export type AppPersona = 'goer' | 'pro'
export type AppMode = 'play' | 'work'

export type AppRole = 'goer' | 'artist' | 'venue_owner' | 'venue_staff'

const MODE_KEY = 'wp.appMode'
const PERSONA_KEY = 'wp.appPersona'

function normalizeMode(raw: string | null): AppMode {
  // Migrate the legacy 'manage' value to 'work'.
  if (raw === 'work' || raw === 'manage') return 'work'
  return 'play'
}

// ─── Shared external store ───────────────────────────────────────────────
// A single module-level store so EVERY consumer (the You toggle AND the tab
// bar) reads one source of truth and re-renders together. Component-local
// useState here would let the bottom-nav desync from the Work/Play switch.

type AppModeState = { mode: AppMode; personaOverride: AppPersona | null }

let store: AppModeState = { mode: 'play', personaOverride: null }
let hydrated = false
const listeners = new Set<() => void>()

function emit() {
  for (const l of listeners) l()
}

function setStore(patch: Partial<AppModeState>) {
  store = { ...store, ...patch }
  emit()
}

function hydrateOnce() {
  if (hydrated) return
  hydrated = true
  ;(async () => {
    try {
      const [m, p] = await Promise.all([
        AsyncStorage.getItem(MODE_KEY),
        AsyncStorage.getItem(PERSONA_KEY),
      ])
      setStore({
        mode: normalizeMode(m),
        personaOverride: p === 'pro' || p === 'goer' ? p : null,
      })
    } catch {
      // Best-effort persistence; default to play/goer.
    }
  })()
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  hydrateOnce()
  return () => {
    listeners.delete(cb)
  }
}

function getSnapshot() {
  return store
}

export function setMode(m: AppMode) {
  setStore({ mode: m })
  void AsyncStorage.setItem(MODE_KEY, m)
}

export function setPersona(p: AppPersona) {
  // A goer reverting to fan-only can't be in Work mode.
  setStore(p === 'goer' ? { personaOverride: p, mode: 'play' } : { personaOverride: p })
  void AsyncStorage.setItem(PERSONA_KEY, p)
  if (p === 'goer') void AsyncStorage.setItem(MODE_KEY, 'play')
}

export function useAppMode() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  return { mode: state.mode, setMode, personaOverride: state.personaOverride, setPersona }
}

/**
 * Resolve the effective persona: a user is "pro" if they hold any pro entity
 * (derived, e.g. ownsVenue) OR they've explicitly opted in via setPersona.
 */
export function resolvePersona(
  personaOverride: AppPersona | null,
  derivedPro: boolean,
): AppPersona {
  if (personaOverride) return personaOverride
  return derivedPro ? 'pro' : 'goer'
}
