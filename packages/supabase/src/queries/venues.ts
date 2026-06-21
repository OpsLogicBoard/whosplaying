import type { WhosPlayingClient } from '../client'

export async function getVenueBySlug(client: WhosPlayingClient, slug: string) {
  return client.from('venues').select('*').eq('slug', slug).single()
}

export async function getVenueById(client: WhosPlayingClient, id: string) {
  return client.from('venues').select('*').eq('id', id).single()
}

export type VenueMapBounds = {
  minLat: number
  maxLat: number
  minLng: number
  maxLng: number
}

export async function listVenuesInBounds(client: WhosPlayingClient, b: VenueMapBounds) {
  return client
    .from('venues')
    .select('id, slug, name, lat, lng, hero_image_url')
    .gte('lat', b.minLat)
    .lte('lat', b.maxLat)
    .gte('lng', b.minLng)
    .lte('lng', b.maxLng)
}
