import { useState } from 'react'

// ─────────────────────────────────────────────────────────────────────────
// App mode — the extension point for the artist/venue/promoter experience.
//
// The default goer layout (Tonight / Explore / Map / Saved / You) is "play".
// Users who hold an artist / venue / promoter role can flip to "manage",
// which will swap the tab set in app/(tabs)/_layout.tsx to the Manage layout:
//   Calendar (my gigs) · Create event + invites · Open gigs / bids · Messages
//
// The Work/Play selector on the You screen drives this. Today it is a local
// stub (every user is a goer); when auth is wired, source `roles` from the
// Supabase session (user_roles) and lift this into a shared store/context so
// the tab layout can react. Logged-out users never see "manage".
// ─────────────────────────────────────────────────────────────────────────

export type AppMode = 'play' | 'manage'

export type AppRole = 'goer' | 'artist' | 'venue_owner' | 'venue_staff'

export function useAppMode() {
  const [mode, setMode] = useState<AppMode>('play')

  // TODO(manage): replace with roles from the authenticated session.
  const roles: AppRole[] = ['goer']
  const canManage = roles.some((r) => r === 'artist' || r === 'venue_owner' || r === 'venue_staff')

  return { mode, setMode, roles, canManage }
}
