import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'

export type WhosPlayingClient = SupabaseClient<Database>

export type SupabaseConfig = {
  url: string
  anonKey: string
}

export function createWhosPlayingClient({ url, anonKey }: SupabaseConfig): WhosPlayingClient {
  return createClient<Database>(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  })
}
