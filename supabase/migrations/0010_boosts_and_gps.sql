-- Event boosts + GPS push campaigns — entitlement-gated (Phase C).
-- Boosts: Pro includes them; free venues buy a one-off $5 boost (the webhook
-- inserts a 'purchase'-source boost via service-role). GPS push: Pro-only, with
-- a per-venue daily cap from the gps_push entitlement (the global per-goer cap
-- is enforced at delivery time, not campaign creation).

-- Reusable: does the venue's org hold a feature entitlement?
create or replace function public.venue_has_entitlement(_venue uuid, _feature text)
returns boolean language sql stable
security definer
set search_path = public
as $$
  select public.has_entitlement(
    (select organization_id from public.venues where id = _venue), _venue, _feature);
$$;

-- ── Event boosts ────────────────────────────────────────────────────────────
create type public.boost_source as enum ('pro', 'purchase');

create table public.event_boosts (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  venue_id uuid not null references public.venues(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  source public.boost_source not null default 'pro',
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);
create index on public.event_boosts (venue_id, ends_at);
create index on public.event_boosts (event_id);

alter table public.event_boosts enable row level security;
-- Boosted events surface to everyone.
create policy "event_boosts_select_all" on public.event_boosts for select using (true);
-- Client inserts require the Pro entitlement; free-venue purchase boosts are
-- created server-side (service role) by the Stripe webhook.
create policy "event_boosts_insert_pro" on public.event_boosts
  for insert to authenticated with check (
    public.is_venue_member(venue_id)
    and created_by = auth.uid()
    and public.venue_has_entitlement(venue_id, 'event_boosts')
  );
create policy "event_boosts_update_member" on public.event_boosts
  for update to authenticated using (public.is_venue_member(venue_id)) with check (public.is_venue_member(venue_id));
create policy "event_boosts_delete_member" on public.event_boosts
  for delete to authenticated using (public.is_venue_member(venue_id));

grant select on public.event_boosts to anon;
grant select, insert, update, delete on public.event_boosts to authenticated;

-- ── GPS push campaigns ──────────────────────────────────────────────────────
create type public.gps_push_status as enum ('scheduled', 'sent', 'canceled');

create table public.gps_push_campaigns (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  message text not null check (length(message) between 1 and 140),
  radius_m int not null check (radius_m between 100 and 8000),
  offer_id uuid references public.offers(id) on delete set null,
  event_id uuid references public.events(id) on delete set null,
  scheduled_at timestamptz,
  sent_at timestamptz,
  status public.gps_push_status not null default 'scheduled',
  created_at timestamptz not null default now()
);
create index on public.gps_push_campaigns (venue_id, created_at);

-- Pro gate + per-venue daily cap (from the gps_push entitlement's daily_cap).
create or replace function public.gps_push_cap_ok(_venue uuid)
returns boolean language plpgsql stable
security definer
set search_path = public
as $$
declare _org uuid; _cap int; _count int;
begin
  select organization_id into _org from public.venues where id = _venue;
  if _org is null then return false; end if;
  if not public.has_entitlement(_org, _venue, 'gps_push') then return false; end if;
  select (e.value->>'daily_cap')::int into _cap from public.entitlements e
    where e.organization_id = _org and e.feature = 'gps_push'
      and (e.venue_id = _venue or e.venue_id is null)
      and (e.expires_at is null or e.expires_at > now())
    order by e.venue_id nulls last limit 1;
  if _cap is null then return true; end if;
  select count(*) into _count from public.gps_push_campaigns
    where venue_id = _venue and created_at::date = now()::date and status <> 'canceled';
  return _count < _cap;
end;
$$;

alter table public.gps_push_campaigns enable row level security;
-- Campaigns are internal to the venue team.
create policy "gps_push_select_member" on public.gps_push_campaigns
  for select to authenticated using (public.is_venue_member(venue_id));
create policy "gps_push_insert_capped" on public.gps_push_campaigns
  for insert to authenticated with check (
    public.is_venue_member(venue_id)
    and created_by = auth.uid()
    and public.gps_push_cap_ok(venue_id)
  );
create policy "gps_push_update_member" on public.gps_push_campaigns
  for update to authenticated using (public.is_venue_member(venue_id)) with check (public.is_venue_member(venue_id));
create policy "gps_push_delete_member" on public.gps_push_campaigns
  for delete to authenticated using (public.is_venue_member(venue_id));

grant select, insert, update, delete on public.gps_push_campaigns to authenticated;
