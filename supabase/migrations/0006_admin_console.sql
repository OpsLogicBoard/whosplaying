-- WhosPlaying — Phase D: admin console (platform-operator surface)
-- ============================================================================
-- Web-only, admin-gated. Single-tenant — NO subdomain routing. These tables and
-- functions are strictly gated by is_platform_admin() and never surface through
-- the normal consumer RLS. Covers: usage analytics, sales pipeline, maintenance,
-- and an audit log of every admin action (esp. impersonation / comps).
--
-- RLS + GRANTs in-migration; helper functions set search_path = public.
-- ============================================================================

create type public.admin_role as enum ('super_admin', 'sales', 'support', 'read_only');

create table public.admin_users (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  role public.admin_role not null default 'read_only',
  note text,
  created_at timestamptz not null default now()
);

-- Strict admin gate. SECURITY DEFINER so it can read admin_users regardless of
-- the caller's own RLS visibility; set search_path to prevent schema shadowing.
create or replace function public.is_platform_admin()
returns boolean language sql stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

create or replace function public.admin_role_of()
returns public.admin_role language sql stable
security definer
set search_path = public
as $$
  select role from public.admin_users where user_id = auth.uid();
$$;

-- ============================================================
-- Audit log — every admin action (impersonation, comps, moderation, flags).
-- ============================================================
create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target_type text,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index on public.audit_log (created_at desc);
create index on public.audit_log (actor_user_id, created_at desc);

create or replace function public.admin_log(
  _action text, _target_type text default null, _target_id uuid default null, _metadata jsonb default '{}'::jsonb
)
returns void language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_platform_admin() then
    raise exception 'not a platform admin';
  end if;
  insert into public.audit_log (actor_user_id, action, target_type, target_id, metadata)
  values (auth.uid(), _action, _target_type, _target_id, _metadata);
end;
$$;

-- ============================================================
-- Analytics — admin-only SECURITY DEFINER rollups. Each guards on
-- is_platform_admin() and returns JSON the console renders. Views aren't used
-- directly because they can't carry RLS; gated functions keep the data sealed.
-- ============================================================

-- Platform KPIs: users, venues, orgs, confirmed events, paying orgs, MRR.
create or replace function public.admin_platform_kpis()
returns jsonb language plpgsql stable
security definer
set search_path = public
as $$
declare _r jsonb;
begin
  if not public.is_platform_admin() then raise exception 'not a platform admin'; end if;
  select jsonb_build_object(
    'total_users', (select count(*) from public.profiles),
    'total_venues', (select count(*) from public.venues),
    'total_orgs', (select count(*) from public.organizations),
    'confirmed_events', (select count(*) from public.events where status = 'confirmed'),
    'paying_orgs', (select count(*) from public.subscriptions
                    where plan_key <> 'free' and status in ('trialing','active','past_due')),
    'founding_orgs', (select count(*) from public.organizations where is_founding),
    'mrr_cents', (select coalesce(sum(case
                      when s.plan_key = 'free' then 0
                      when o.is_founding then 1499
                      else 2499 end) + greatest(0, (s.venue_quantity - 1)) * 1200, 0)
                    from public.subscriptions s join public.organizations o on o.id = s.organization_id
                    where s.plan_key <> 'free' and s.status = 'active'),
    'ticket_taps_30d', (select count(*) from public.usage_events
                        where kind = 'ticket_tap' and created_at > now() - interval '30 days')
  ) into _r;
  return _r;
end;
$$;

-- Per-market density: venues + confirmed events by region/city (gates expansion).
create or replace function public.admin_market_density()
returns table (region text, city text, venues bigint, events bigint)
language plpgsql stable security definer
set search_path = public
as $$
begin
  if not public.is_platform_admin() then raise exception 'not a platform admin'; end if;
  return query
    select v.region, v.city, count(distinct v.id) as venues,
           count(distinct e.id) filter (where e.status = 'confirmed') as events
    from public.venues v
    left join public.events e on e.venue_id = v.id
    group by v.region, v.city
    order by venues desc;
end;
$$;

-- ============================================================
-- RLS — everything admin-gated. Even with GRANTs, only admins pass the policy.
-- ============================================================
alter table public.admin_users enable row level security;
create policy "admin_users_select_admin" on public.admin_users
  for select to authenticated using (public.is_platform_admin());
-- No client write policy: admin grants are managed out-of-band (service role).

alter table public.audit_log enable row level security;
create policy "audit_log_select_admin" on public.audit_log
  for select to authenticated using (public.is_platform_admin());
-- Inserts go through admin_log() (SECURITY DEFINER); no direct client insert policy.

-- ============================================================
-- GRANTs (explicit — CLAUDE.md rule). Read-only to authenticated; RLS seals it
-- to admins. No anon access at all.
-- ============================================================
grant select on public.admin_users, public.audit_log to authenticated;
revoke insert, update, delete on public.admin_users from authenticated;
revoke insert, update, delete on public.audit_log from authenticated;
