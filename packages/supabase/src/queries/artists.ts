import type { WhosPlayingClient } from '../client'

export async function getArtistBySlug(client: WhosPlayingClient, slug: string) {
  return client.from('artists').select('*').eq('slug', slug).single()
}

export async function listBandsForArtist(client: WhosPlayingClient, artistId: string) {
  return client
    .from('band_members')
    .select('band:bands(*)')
    .eq('artist_id', artistId)
}
