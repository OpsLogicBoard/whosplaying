import type { Role } from '../domain/common'

export type UserPrincipal = {
  userId: string
  roles: Role[]
  /** venue_id => role within that venue */
  venueMemberships: Record<string, 'manager' | 'staff' | 'booker'>
  /** band_id => is_admin */
  bandMemberships: Record<string, boolean>
}

export function isArtist(p: UserPrincipal): boolean {
  return p.roles.includes('artist')
}

export function canEditVenue(p: UserPrincipal, venueId: string): boolean {
  return p.roles.includes('venue_owner') || p.venueMemberships[venueId] === 'manager'
}

export function canAnswerVenueQuestions(p: UserPrincipal, venueId: string): boolean {
  return canEditVenue(p, venueId) || p.venueMemberships[venueId] === 'staff'
}

export function canEditBand(p: UserPrincipal, bandId: string): boolean {
  return p.bandMemberships[bandId] === true
}

export function canPostGig(p: UserPrincipal, venueId: string): boolean {
  return canEditVenue(p, venueId) || p.venueMemberships[venueId] === 'booker'
}

export function canBidOnGig(p: UserPrincipal): boolean {
  return p.roles.includes('artist')
}
