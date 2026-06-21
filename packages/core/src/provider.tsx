import { createContext, useContext } from 'react'
import type { WhosPlayingClient } from '@whosplaying/supabase'

/**
 * Carries the platform's Supabase client to the shared data hooks. Each app
 * constructs its own client (web: @supabase/ssr browser client; mobile:
 * @supabase/supabase-js with AsyncStorage) and provides it here, so the hooks
 * in packages/core stay platform-agnostic.
 */
const ClientCtx = createContext<WhosPlayingClient | null>(null)

export function WhosPlayingProvider({
  client,
  children,
}: {
  client: WhosPlayingClient
  children: React.ReactNode
}) {
  return <ClientCtx.Provider value={client}>{children}</ClientCtx.Provider>
}

/** The Supabase client provided by the nearest WhosPlayingProvider. */
export function useWhosPlayingClient(): WhosPlayingClient {
  const client = useContext(ClientCtx)
  if (!client) {
    throw new Error('useWhosPlayingClient must be used within a <WhosPlayingProvider>.')
  }
  return client
}
