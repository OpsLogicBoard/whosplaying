import type { WhosPlayingClient } from '../client'

export async function getArtistBySlug(client: WhosPlayingClient, slug: string) {
  return client.from('artists').select('*').eq('slug', slug).single()
}

export async function getArtistById(client: WhosPlayingClient, id: string) {
  return client.from('artists').select('*').eq('id', id).single()
}

export async function getBandById(client: WhosPlayingClient, id: string) {
  return client
    .from('bands')
    .select('*, members:band_members(artist:artists(*))')
    .eq('id', id)
    .single()
}

export async function listBandsForArtist(client: WhosPlayingClient, artistId: string) {
  return client
    .from('band_members')
    .select('band:bands(*)')
    .eq('artist_id', artistId)
}

export type NewArtistInput = {
  owner_user_id: string
  stage_name: string
  slug: string
  bio?: string | null
  genres?: string[]
  home_city?: string | null
}

/** Create an artist profile owned by the current user (RLS: owner = auth.uid). */
export async function createArtist(client: WhosPlayingClient, input: NewArtistInput) {
  return client
    .from('artists')
    .insert({
      owner_user_id: input.owner_user_id,
      stage_name: input.stage_name,
      slug: input.slug,
      bio: input.bio ?? null,
      genres: input.genres ?? [],
      home_city: input.home_city ?? null,
    })
    .select('id')
    .single()
}

/** Does the current user already own an artist profile? */
export async function getMyArtist(client: WhosPlayingClient, userId: string) {
  return client
    .from('artists')
    .select('id, stage_name')
    .eq('owner_user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()
}
