-- Grant PostgREST role access to the public tables.
-- I disabled "Automatically expose new tables" at project creation, which
-- means new tables get no GRANTs to anon/authenticated by default — RLS
-- can't filter rows for a role that can't see the table at all.
--
-- RLS policies (in 0002_rls.sql) still enforce row-level access. These
-- GRANTs just allow the roles to attempt access; RLS decides which rows
-- they actually get.

-- Anonymous users (signed out) — read-only on the discovery surface.
grant select on
  public.profiles,
  public.artists,
  public.bands,
  public.band_members,
  public.venues,
  public.events,
  public.event_performers,
  public.gig_listings
to anon;

-- Authenticated users — read everything the discovery surface exposes,
-- write where RLS allows.
grant select on
  public.profiles,
  public.user_roles,
  public.artists,
  public.bands,
  public.band_members,
  public.venues,
  public.venue_staff,
  public.events,
  public.event_performers,
  public.gig_listings,
  public.gig_bids,
  public.follows,
  public.event_saves,
  public.conversations,
  public.conversation_participants,
  public.messages,
  public.conflict_flags,
  public.device_tokens
to authenticated;

grant insert, update, delete on
  public.profiles,
  public.artists,
  public.bands,
  public.band_members,
  public.venues,
  public.venue_staff,
  public.events,
  public.event_performers,
  public.gig_listings,
  public.gig_bids,
  public.follows,
  public.event_saves,
  public.conversations,
  public.conversation_participants,
  public.messages,
  public.conflict_flags,
  public.device_tokens
to authenticated;

-- Sequences used by serial/default uuid columns.
grant usage on all sequences in schema public to anon, authenticated;

-- Make future tables auto-grant too (catches anything we forget).
alter default privileges in schema public grant select on tables to anon;
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public grant usage on sequences to anon, authenticated;
