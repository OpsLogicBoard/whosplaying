-- Row-Level Security for WhosPlaying.
-- Read: most data is public (it's a discovery app). Write: tightly scoped.

-- =========================================================
-- Helper predicates
-- =========================================================
create or replace function public.is_venue_manager(_venue_id uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from public.venue_staff
    where venue_id = _venue_id and user_id = auth.uid() and role = 'manager'
  ) or exists (
    select 1 from public.venues
    where id = _venue_id and owner_user_id = auth.uid()
  );
$$;

create or replace function public.is_venue_member(_venue_id uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from public.venue_staff
    where venue_id = _venue_id and user_id = auth.uid()
  ) or exists (
    select 1 from public.venues
    where id = _venue_id and owner_user_id = auth.uid()
  );
$$;

create or replace function public.owns_artist(_artist_id uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from public.artists where id = _artist_id and owner_user_id = auth.uid()
  );
$$;

create or replace function public.is_band_admin(_band_id uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from public.band_members bm
    join public.artists a on a.id = bm.artist_id
    where bm.band_id = _band_id and bm.is_admin and a.owner_user_id = auth.uid()
  );
$$;

create or replace function public.is_conversation_participant(_conversation_id uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from public.conversation_participants
    where conversation_id = _conversation_id and user_id = auth.uid()
  );
$$;

-- =========================================================
-- profiles — readable to all signed-in users; self-edit
-- =========================================================
alter table public.profiles enable row level security;

create policy "profiles_select_all" on public.profiles
  for select to authenticated using (true);

create policy "profiles_update_self" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- =========================================================
-- user_roles — self read, never write directly (handled by triggers/functions)
-- =========================================================
alter table public.user_roles enable row level security;

create policy "user_roles_select_self" on public.user_roles
  for select to authenticated using (user_id = auth.uid());

-- =========================================================
-- artists / bands / band_members — public read; owner write
-- =========================================================
alter table public.artists enable row level security;
create policy "artists_select_all" on public.artists for select using (true);
create policy "artists_insert_self" on public.artists
  for insert to authenticated with check (owner_user_id = auth.uid());
create policy "artists_update_owner" on public.artists
  for update to authenticated using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
create policy "artists_delete_owner" on public.artists
  for delete to authenticated using (owner_user_id = auth.uid());

alter table public.bands enable row level security;
create policy "bands_select_all" on public.bands for select using (true);
create policy "bands_insert_authenticated" on public.bands
  for insert to authenticated with check (true);
create policy "bands_update_admin" on public.bands
  for update to authenticated using (public.is_band_admin(id)) with check (public.is_band_admin(id));
create policy "bands_delete_admin" on public.bands
  for delete to authenticated using (public.is_band_admin(id));

alter table public.band_members enable row level security;
create policy "band_members_select_all" on public.band_members for select using (true);
create policy "band_members_write_band_admin" on public.band_members
  for all to authenticated using (public.is_band_admin(band_id)) with check (public.is_band_admin(band_id));

-- =========================================================
-- venues / venue_staff
-- =========================================================
alter table public.venues enable row level security;
create policy "venues_select_all" on public.venues for select using (true);
create policy "venues_insert_authenticated" on public.venues
  for insert to authenticated with check (owner_user_id = auth.uid());
create policy "venues_update_manager" on public.venues
  for update to authenticated using (public.is_venue_manager(id)) with check (public.is_venue_manager(id));
create policy "venues_delete_owner" on public.venues
  for delete to authenticated using (owner_user_id = auth.uid());

alter table public.venue_staff enable row level security;
create policy "venue_staff_select_member" on public.venue_staff
  for select to authenticated using (public.is_venue_member(venue_id));
create policy "venue_staff_write_manager" on public.venue_staff
  for all to authenticated using (public.is_venue_manager(venue_id)) with check (public.is_venue_manager(venue_id));

-- =========================================================
-- events + cross-confirmation
-- =========================================================
alter table public.events enable row level security;
create policy "events_select_public" on public.events
  for select using (status in ('confirmed', 'proposed') or public.is_venue_member(venue_id));
create policy "events_insert_venue_member" on public.events
  for insert to authenticated with check (public.is_venue_member(venue_id) and created_by = auth.uid());
create policy "events_update_venue_member" on public.events
  for update to authenticated using (public.is_venue_member(venue_id)) with check (public.is_venue_member(venue_id));
create policy "events_delete_venue_manager" on public.events
  for delete to authenticated using (public.is_venue_manager(venue_id));

alter table public.event_performers enable row level security;
create policy "event_performers_select_all" on public.event_performers for select using (true);
-- Venue side can invite. Performer side can confirm/decline their own row.
create policy "event_performers_insert_venue" on public.event_performers
  for insert to authenticated
  with check (public.is_venue_member((select venue_id from public.events where id = event_id)));
create policy "event_performers_update_self" on public.event_performers
  for update to authenticated
  using (
    public.is_venue_member((select venue_id from public.events where id = event_id))
    or (performer_type = 'artist' and public.owns_artist(performer_id))
    or (performer_type = 'band' and public.is_band_admin(performer_id))
  )
  with check (
    public.is_venue_member((select venue_id from public.events where id = event_id))
    or (performer_type = 'artist' and public.owns_artist(performer_id))
    or (performer_type = 'band' and public.is_band_admin(performer_id))
  );
create policy "event_performers_delete_venue" on public.event_performers
  for delete to authenticated
  using (public.is_venue_member((select venue_id from public.events where id = event_id)));

-- =========================================================
-- gig_listings + gig_bids
-- =========================================================
alter table public.gig_listings enable row level security;
create policy "gig_listings_select_all" on public.gig_listings for select using (true);
create policy "gig_listings_write_venue_member" on public.gig_listings
  for all to authenticated
  using (public.is_venue_member(venue_id))
  with check (public.is_venue_member(venue_id) and created_by = auth.uid());

alter table public.gig_bids enable row level security;
-- Bidders see their own bid; venue staff see all bids on their gig.
create policy "gig_bids_select_visible" on public.gig_bids
  for select to authenticated using (
    public.is_venue_member((select venue_id from public.gig_listings where id = gig_listing_id))
    or (bidder_type = 'artist' and public.owns_artist(bidder_id))
    or (bidder_type = 'band' and public.is_band_admin(bidder_id))
  );
create policy "gig_bids_insert_bidder" on public.gig_bids
  for insert to authenticated with check (
    (bidder_type = 'artist' and public.owns_artist(bidder_id))
    or (bidder_type = 'band' and public.is_band_admin(bidder_id))
  );
create policy "gig_bids_update_visible" on public.gig_bids
  for update to authenticated using (
    public.is_venue_member((select venue_id from public.gig_listings where id = gig_listing_id))
    or (bidder_type = 'artist' and public.owns_artist(bidder_id))
    or (bidder_type = 'band' and public.is_band_admin(bidder_id))
  ) with check (true);

-- =========================================================
-- follows + event_saves — self-only
-- =========================================================
alter table public.follows enable row level security;
create policy "follows_select_self" on public.follows
  for select to authenticated using (follower_user_id = auth.uid());
create policy "follows_insert_self" on public.follows
  for insert to authenticated with check (follower_user_id = auth.uid());
create policy "follows_delete_self" on public.follows
  for delete to authenticated using (follower_user_id = auth.uid());

alter table public.event_saves enable row level security;
create policy "event_saves_all_self" on public.event_saves
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- =========================================================
-- conversations + messages — participants only
-- =========================================================
alter table public.conversations enable row level security;
create policy "conversations_select_participant" on public.conversations
  for select to authenticated using (public.is_conversation_participant(id));
create policy "conversations_insert_self" on public.conversations
  for insert to authenticated with check (created_by = auth.uid());

alter table public.conversation_participants enable row level security;
create policy "conv_parts_select_participant" on public.conversation_participants
  for select to authenticated using (public.is_conversation_participant(conversation_id));
create policy "conv_parts_insert_creator" on public.conversation_participants
  for insert to authenticated with check (
    exists (select 1 from public.conversations where id = conversation_id and created_by = auth.uid())
    or user_id = auth.uid()
  );

alter table public.messages enable row level security;
create policy "messages_select_participant" on public.messages
  for select to authenticated using (public.is_conversation_participant(conversation_id));
create policy "messages_insert_participant" on public.messages
  for insert to authenticated with check (
    public.is_conversation_participant(conversation_id) and sender_user_id = auth.uid()
  );

-- =========================================================
-- conflict_flags — readable to involved subjects only
-- =========================================================
alter table public.conflict_flags enable row level security;
create policy "conflict_flags_select_involved" on public.conflict_flags
  for select to authenticated using (
    (subject_type = 'venue' and public.is_venue_member(subject_id))
    or (subject_type = 'artist' and public.owns_artist(subject_id))
    or (subject_type = 'band' and public.is_band_admin(subject_id))
  );
create policy "conflict_flags_update_involved" on public.conflict_flags
  for update to authenticated using (
    (subject_type = 'venue' and public.is_venue_member(subject_id))
    or (subject_type = 'artist' and public.owns_artist(subject_id))
    or (subject_type = 'band' and public.is_band_admin(subject_id))
  ) with check (true);

-- =========================================================
-- device_tokens — self-only
-- =========================================================
alter table public.device_tokens enable row level security;
create policy "device_tokens_all_self" on public.device_tokens
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
