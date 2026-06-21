// React Query hooks — thin wrappers around the matching query helpers in
// @whosplaying/supabase, reading the client from <WhosPlayingProvider>.

export { useEvents, useEvent, type EventWithRelations } from './useEvents'
export { useArtist, useBand } from './useArtist'
export { useVenue } from './useVenue'
export { useFollows } from './useFollows'
export { useSavedFollows, type SavedFollow } from './useSavedFollows'
export { useConflicts } from './useConflicts'
export { useMessages } from './useMessages'
export { useGigBoard } from './useGigBoard'
export { useEntitlements } from './useEntitlements'
