-- Offers & promos — productionized + entitlement-gated (Phase C).
-- Per-venue redeemable deals (profile-architecture spec): message, schedule
-- (one-time or weekly day-picker), time window (null end = "Close"), start +
-- expiration dates, distribution (event pages / GPS radius), active toggle.
--
-- Entitlement enforcement lives in RLS (approved decision): a free venue gets
-- 1 active offer (FEATURE_MATRIX offers.limit), Pro is unlimited; GPS
-- distribution requires the Pro gps_push entitlement. A crafted client cannot
-- bypass these — the INSERT/UPDATE policies call the gate functions.

create type public.offer_recurrence as enum ('one_time', 'weekly');

create table public.offers (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  created_by uuid not null references public.profiles(id),
  message text not null check (length(message) between 1 and 280),
  recurrence public.offer_recurrence not null default 'one_time',
  days_of_week int[] not null default '{}', -- 0=Sun..6=Sat (weekly)
  time_start time,
  time_end time, -- null = "Close"
  start_date date not null default current_date,
  expiration_date date,
  on_event_pages boolean not null default true,
  gps_radius_m int check (gps_radius_m is null or gps_radius_m between 100 and 8000),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  check (expiration_date is null or expiration_date >= start_date)
);
create index on public.offers (venue_id) where active;
create index on public.offers (venue_id, start_date);

-- ── Entitlement gates ───────────────────────────────────────────────────────
-- Active-offer quota. _id is excluded from the count so editing the single
-- active offer (free tier) isn't blocked by counting itself. Inactive/scheduled
-- drafts don't count against the active limit.
create or replace function public.offer_quota_ok(_id uuid, _venue uuid, _active boolean)
returns boolean language plpgsql stable
security definer
set search_path = public
as $$
declare _org uuid; _limit int; _count int;
begin
  if not _active then return true; end if;
  select organization_id into _org from public.venues where id = _venue;
  if _org is null then return false; end if;
  _limit := public.entitlement_limit(_org, _venue, 'offers');
  if _limit is null then return true; end if; -- unlimited (Pro)
  if _limit = 0 then return false; end if;
  select count(*) into _count from public.offers
    where venue_id = _venue and active and id <> _id;
  return _count < _limit;
end;
$$;

-- GPS distribution requires the gps_push entitlement (Pro-only).
create or replace function public.offer_gps_ok(_venue uuid, _radius int)
returns boolean language sql stable
security definer
set search_path = public
as $$
  select _radius is null or public.has_entitlement(
    (select organization_id from public.venues where id = _venue), _venue, 'gps_push');
$$;

-- ── RLS ─────────────────────────────────────────────────────────────────────
alter table public.offers enable row level security;

-- Active offers are public (shown on event pages); members see all theirs.
create policy "offers_select_visible" on public.offers
  for select using (active or public.is_venue_member(venue_id));

create policy "offers_insert_member" on public.offers
  for insert to authenticated with check (
    public.is_venue_member(venue_id)
    and created_by = auth.uid()
    and public.offer_quota_ok(id, venue_id, active)
    and public.offer_gps_ok(venue_id, gps_radius_m)
  );

create policy "offers_update_member" on public.offers
  for update to authenticated
  using (public.is_venue_member(venue_id))
  with check (
    public.is_venue_member(venue_id)
    and public.offer_quota_ok(id, venue_id, active)
    and public.offer_gps_ok(venue_id, gps_radius_m)
  );

create policy "offers_delete_member" on public.offers
  for delete to authenticated using (public.is_venue_member(venue_id));

-- ── GRANTs (CLAUDE.md rule; 0007 default-privs also cover service_role) ──────
grant select on public.offers to anon;
grant select, insert, update, delete on public.offers to authenticated;
