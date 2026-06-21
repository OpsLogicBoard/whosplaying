-- 0018_create_event_fields.sql
-- Persist the Create-event fields the approved v2 UI collects but the schema
-- didn't store yet (see docs/DATA_MODEL.md §Gaps, docs/MOBILE_APP.md).
-- Additive + RLS-complete. Public discovery stays open (visibility defaults to
-- 'public'); private gig details are participant-scoped only.

-- ── Public event attributes (safe on the publicly-readable events table) ──────
create type public.event_visibility as enum ('public', 'private');
create type public.event_setting    as enum ('indoor', 'outdoor', 'patio');

alter table public.events
  add column visibility      public.event_visibility not null default 'public',
  add column setting         public.event_setting    not null default 'indoor',
  add column family_friendly boolean                 not null default true,
  add column min_age         integer check (min_age is null or (min_age >= 0 and min_age <= 99)),
  add column price_cents     integer check (price_cents is null or price_cents >= 0);

-- ── Participant check: venue member OR owner of a performer on the event ──────
create or replace function public.is_event_participant(_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_venue_member((select venue_id from public.events where id = _event_id))
    or exists (
      select 1
      from public.event_performers ep
      join public.artists a
        on ep.performer_type = 'artist' and a.id = ep.performer_id
      where ep.event_id = _event_id and a.owner_user_id = auth.uid()
    )
    or exists (
      select 1
      from public.event_performers ep
      join public.band_members bm
        on ep.performer_type = 'band' and bm.band_id = ep.performer_id
      join public.artists a on a.id = bm.artist_id
      where ep.event_id = _event_id and a.owner_user_id = auth.uid()
    );
$$;
-- Internal helper: not a public RPC.
revoke execute on function public.is_event_participant(uuid) from anon, public;
grant  execute on function public.is_event_participant(uuid) to authenticated;

-- ── Keep discovery open, but hide 'private' events from non-participants ──────
-- Split by role so the ANON path never evaluates is_event_participant (anon has
-- no EXECUTE on it). Anon sees only public events; authenticated also sees
-- private events they participate in. Default 'public' keeps all existing rows
-- visible. Discovery / open access is preserved.
drop policy if exists "events_select_public" on public.events;
create policy "events_select_anon" on public.events
  for select to anon
  using (visibility = 'public');
create policy "events_select_auth" on public.events
  for select to authenticated
  using (visibility = 'public' or public.is_event_participant(id));

-- ── Private gig details (venue + invited performers only) ────────────────────
create table public.event_private_details (
  event_id      uuid primary key references public.events(id) on delete cascade,
  gig_rate      text check (gig_rate is null or length(gig_rate) <= 200),
  promoter_note text check (promoter_note is null or length(promoter_note) <= 500),
  load_in_at    timestamptz,
  soundcheck_at timestamptz,
  lineup_order  text check (lineup_order is null or length(lineup_order) <= 200),
  updated_by    uuid references public.profiles(id),
  updated_at    timestamptz not null default now()
);
alter table public.event_private_details enable row level security;

create policy "epd_select_participant" on public.event_private_details
  for select to authenticated
  using (public.is_event_participant(event_id));

create policy "epd_write_venue" on public.event_private_details
  for all to authenticated
  using      (public.is_venue_member((select venue_id from public.events where id = event_id)))
  with check (public.is_venue_member((select venue_id from public.events where id = event_id)));

grant select, insert, update, delete on public.event_private_details to authenticated;

-- ── Per-participant private notes (each user sees only their own) ─────────────
create table public.event_participant_notes (
  event_id   uuid not null references public.events(id) on delete cascade,
  user_id    uuid not null default auth.uid() references public.profiles(id),
  note       text check (note is null or length(note) <= 1000),
  updated_at timestamptz not null default now(),
  primary key (event_id, user_id)
);
alter table public.event_participant_notes enable row level security;

create policy "epn_all_self" on public.event_participant_notes
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant select, insert, update, delete on public.event_participant_notes to authenticated;
