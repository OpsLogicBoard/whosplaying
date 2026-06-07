-- Lock down search_path on the RLS helper functions.
-- Without `set search_path`, a malicious schema can shadow `public.venue_staff` etc.
-- and the SECURITY DEFINER-style trust chain breaks. Supabase advisor flags this.

create or replace function public.is_venue_manager(_venue_id uuid)
returns boolean language sql stable
set search_path = public
as $$
  select exists (
    select 1 from public.venue_staff
    where venue_id = _venue_id and user_id = auth.uid() and role = 'manager'
  ) or exists (
    select 1 from public.venues
    where id = _venue_id and owner_user_id = auth.uid()
  );
$$;

create or replace function public.is_venue_member(_venue_id uuid)
returns boolean language sql stable
set search_path = public
as $$
  select exists (
    select 1 from public.venue_staff
    where venue_id = _venue_id and user_id = auth.uid()
  ) or exists (
    select 1 from public.venues
    where id = _venue_id and owner_user_id = auth.uid()
  );
$$;

create or replace function public.owns_artist(_artist_id uuid)
returns boolean language sql stable
set search_path = public
as $$
  select exists (
    select 1 from public.artists where id = _artist_id and owner_user_id = auth.uid()
  );
$$;

create or replace function public.is_band_admin(_band_id uuid)
returns boolean language sql stable
set search_path = public
as $$
  select exists (
    select 1 from public.band_members bm
    join public.artists a on a.id = bm.artist_id
    where bm.band_id = _band_id and bm.is_admin and a.owner_user_id = auth.uid()
  );
$$;

create or replace function public.is_conversation_participant(_conversation_id uuid)
returns boolean language sql stable
set search_path = public
as $$
  select exists (
    select 1 from public.conversation_participants
    where conversation_id = _conversation_id and user_id = auth.uid()
  );
$$;
