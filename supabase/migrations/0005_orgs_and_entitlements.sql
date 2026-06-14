-- WhosPlaying — Phase A: organizations, membership, plans & entitlements
-- ============================================================================
-- The billing/entitlement foundation. Pricing is DECIDED (see
-- docs/MONETIZATION_AND_BUILD_PLAN.md): free forever for goers + artists +
-- a venue baseline tier; Venue Pro $24.99/venue (Founding $14.99); multi-venue
-- +$12/venue; $5 one-off boosts; ticket link-out always free; GPS push Pro-only.
--
-- Design (approved 2026-06-14):
--   * `organizations` is the BILLING entity that sits above venues.
--   * A venue is a STABLE single entity. Its management/ownership (the org
--     wrapper) can change hands via owner transfer WITHOUT orphaning the
--     venue's events, followers, or history. `venue_staff` (operational,
--     per-venue) is untouched; `organization_members` governs billing/mgmt.
--   * Entitlements are a derived per-venue cache, rebuilt from subscription
--     state. `has_entitlement()` is the single gate, mirrored in packages/core.
--   * Gated writes (Phase C) enforce in RLS via has_entitlement() — secure by
--     default, can't be bypassed by a crafted client.
--
-- Every table ships RLS + explicit GRANTs in THIS migration (CLAUDE.md rule).
-- Helper functions set search_path = public (0003 rule).
-- ============================================================================

-- ============================================================
-- Organizations + membership (billing/management layer)
-- ============================================================
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  owner_user_id uuid not null references public.profiles(id) on delete restrict,
  billing_email text,
  -- Durable founding-cohort flag: the org locked the $14.99 rate for life
  -- during the first-~10-15-Beaches-venues window. Outlives any one subscription.
  is_founding boolean not null default false,
  created_at timestamptz not null default now()
);
create index on public.organizations (owner_user_id);

create type public.org_member_role as enum ('owner', 'manager', 'staff');

create table public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.org_member_role not null default 'staff',
  invited_by uuid references public.profiles(id) on delete set null,
  joined_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);
create index on public.organization_members (user_id);

-- A venue belongs to exactly one org. Nullable for the migration window;
-- the auto-org trigger + backfill below ensure every venue ends up linked.
alter table public.venues
  add column organization_id uuid references public.organizations(id) on delete set null;
create index on public.venues (organization_id);

-- ============================================================
-- Plans — canonical feature matrix mirrored from packages/core.
-- Code (packages/core/src/entitlements) is the AUTHORING source of truth;
-- this table is the DB-readable mirror that recompute_entitlements() expands.
-- ============================================================
create type public.plan_key as enum ('free', 'venue_pro', 'multi_venue');

create table public.plans (
  key public.plan_key primary key,
  display_name text not null,
  -- { feature: true | false | { limit?: int|null, ...config } }
  feature_matrix jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.plans (key, display_name, feature_matrix) values
  ('free', 'Free', jsonb_build_object(
    'create_events', true,
    'public_page', true,
    'messaging', true,
    'calendar', true,
    'ticket_linkout', true,
    'discovery_listing', true,
    'basic_stats', true,
    'offers', jsonb_build_object('limit', 1),
    'staff_seats', jsonb_build_object('limit', 2),
    'event_boosts', false,
    'gps_push', false,
    'full_analytics', false,
    'featured_placement', false,
    'publishing_tools', false
  )),
  ('venue_pro', 'Venue Pro', jsonb_build_object(
    'create_events', true,
    'public_page', true,
    'messaging', true,
    'calendar', true,
    'ticket_linkout', true,
    'discovery_listing', true,
    'basic_stats', true,
    'offers', jsonb_build_object('limit', null),
    'staff_seats', jsonb_build_object('limit', null),
    'event_boosts', true,
    'gps_push', jsonb_build_object('daily_cap', 2),
    'full_analytics', true,
    'featured_placement', true,
    'publishing_tools', true
  )),
  ('multi_venue', 'Venue Pro (Multi-venue)', jsonb_build_object(
    'create_events', true,
    'public_page', true,
    'messaging', true,
    'calendar', true,
    'ticket_linkout', true,
    'discovery_listing', true,
    'basic_stats', true,
    'offers', jsonb_build_object('limit', null),
    'staff_seats', jsonb_build_object('limit', null),
    'event_boosts', true,
    'gps_push', jsonb_build_object('daily_cap', 2),
    'full_analytics', true,
    'featured_placement', true,
    'publishing_tools', true
  ));

-- ============================================================
-- Subscriptions — one active row per org. Reconciled by the Stripe webhook
-- (Phase B); never written from the client.
-- ============================================================
create type public.subscription_status as enum
  ('trialing', 'active', 'past_due', 'canceled', 'incomplete');

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  plan_key public.plan_key not null default 'free',
  status public.subscription_status not null default 'active',
  -- Quantity for multi-venue linear pricing ($24.99 first + $12/additional).
  venue_quantity int not null default 1 check (venue_quantity >= 1),
  current_period_end timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- At most one non-canceled subscription per org.
create unique index subscriptions_one_active_per_org
  on public.subscriptions (organization_id)
  where status <> 'canceled';

-- ============================================================
-- Entitlements — derived per-(org, venue) feature cache. Absence of a row =
-- not entitled. Rebuilt by recompute_entitlements(); never client-written.
-- ============================================================
create type public.entitlement_source as enum ('plan', 'purchase', 'comp');

create table public.entitlements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  -- null = org-wide entitlement; set = scoped to one venue.
  venue_id uuid references public.venues(id) on delete cascade,
  feature text not null,
  -- caps/config, e.g. { "limit": 1 } or { "daily_cap": 2 }; true booleans store {}.
  value jsonb not null default '{}'::jsonb,
  source public.entitlement_source not null default 'plan',
  expires_at timestamptz,
  created_at timestamptz not null default now()
);
create unique index entitlements_unique_scope
  on public.entitlements (organization_id, coalesce(venue_id, '00000000-0000-0000-0000-000000000000'::uuid), feature, source);
create index on public.entitlements (venue_id, feature);
create index on public.entitlements (organization_id, feature);

-- ============================================================
-- Usage events — powers per-use billing AND admin analytics.
-- ============================================================
create type public.usage_kind as enum ('boost', 'gps_push', 'offer_redeemed', 'ticket_tap');

create table public.usage_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete set null,
  venue_id uuid references public.venues(id) on delete set null,
  kind public.usage_kind not null,
  actor_user_id uuid references public.profiles(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index on public.usage_events (organization_id, kind, created_at);
create index on public.usage_events (venue_id, kind, created_at);
create index on public.usage_events (kind, created_at);

-- ============================================================
-- Feature purchases — one-off $5 boosts (Stripe Checkout one-time).
-- Reconciled by webhook; never client-written.
-- ============================================================
create type public.purchase_status as enum ('pending', 'paid', 'refunded', 'failed');

create table public.feature_purchases (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  venue_id uuid references public.venues(id) on delete set null,
  kind public.usage_kind not null default 'boost',
  amount_cents int not null check (amount_cents >= 0),
  status public.purchase_status not null default 'pending',
  stripe_payment_intent_id text,
  created_at timestamptz not null default now()
);
create index on public.feature_purchases (organization_id, created_at);

-- ============================================================
-- Helper predicates (set search_path = public — 0003 rule)
-- ============================================================
create or replace function public.is_org_member(_org uuid)
returns boolean language sql stable
set search_path = public
as $$
  select exists (
    select 1 from public.organization_members
    where organization_id = _org and user_id = auth.uid()
  ) or exists (
    select 1 from public.organizations
    where id = _org and owner_user_id = auth.uid()
  );
$$;

create or replace function public.is_org_manager(_org uuid)
returns boolean language sql stable
set search_path = public
as $$
  select exists (
    select 1 from public.organization_members
    where organization_id = _org and user_id = auth.uid() and role in ('owner', 'manager')
  ) or exists (
    select 1 from public.organizations
    where id = _org and owner_user_id = auth.uid()
  );
$$;

-- The single entitlement gate. Used by RLS (Phase C gated writes) and mirrored
-- by hasEntitlement() in packages/core. A venue feature falls back to an
-- org-wide (venue_id is null) entitlement if no venue-scoped row exists.
create or replace function public.has_entitlement(_org uuid, _venue uuid, _feature text)
returns boolean language sql stable
set search_path = public
as $$
  select exists (
    select 1 from public.entitlements e
    where e.organization_id = _org
      and e.feature = _feature
      and (e.venue_id = _venue or e.venue_id is null)
      and (e.expires_at is null or e.expires_at > now())
  );
$$;

-- Numeric limit for a metered feature (e.g. offers.limit). NULL = unlimited
-- (returned when the granting row carries no "limit" or limit is json null);
-- returns 0 when no entitlement row exists at all.
create or replace function public.entitlement_limit(_org uuid, _venue uuid, _feature text)
returns int language sql stable
set search_path = public
as $$
  select case
    when not public.has_entitlement(_org, _venue, _feature) then 0
    else (
      select (e.value->>'limit')::int
      from public.entitlements e
      where e.organization_id = _org
        and e.feature = _feature
        and (e.venue_id = _venue or e.venue_id is null)
        and (e.expires_at is null or e.expires_at > now())
      order by e.venue_id nulls last
      limit 1
    )
  end;
$$;

-- ============================================================
-- recompute_entitlements — rebuild the plan-sourced entitlement rows for an org
-- from its active subscription (defaulting to 'free'). Purchase/comp rows are
-- left intact. Called by the auto-org trigger now and the Stripe webhook later.
-- ============================================================
create or replace function public.recompute_entitlements(_org uuid)
returns void language plpgsql
security definer
set search_path = public
as $$
declare
  _plan public.plan_key;
  _matrix jsonb;
  _venue record;
  _feat record;
begin
  select coalesce(
    (select plan_key from public.subscriptions
     where organization_id = _org and status in ('trialing', 'active', 'past_due')
     order by created_at desc limit 1),
    'free'
  ) into _plan;

  select feature_matrix into _matrix from public.plans where key = _plan;

  -- Clear existing plan-sourced rows for this org (keep purchase/comp).
  delete from public.entitlements where organization_id = _org and source = 'plan';

  -- Expand the matrix across every venue in the org. Skip features whose value
  -- is boolean false; store object values (caps/limits) verbatim, true => {}.
  for _venue in select id from public.venues where organization_id = _org loop
    for _feat in select * from jsonb_each(_matrix) loop
      if jsonb_typeof(_feat.value) = 'boolean' then
        if (_feat.value)::boolean then
          insert into public.entitlements (organization_id, venue_id, feature, value, source)
          values (_org, _venue.id, _feat.key, '{}'::jsonb, 'plan');
        end if;
      else
        -- object config (limit/cap) — always granted, carries its config
        insert into public.entitlements (organization_id, venue_id, feature, value, source)
        values (_org, _venue.id, _feat.key, _feat.value, 'plan');
      end if;
    end loop;
  end loop;
end;
$$;

-- ============================================================
-- Auto-org trigger — every venue must belong to an org. A venue inserted
-- without organization_id (existing create-venue flow) gets a solo org:
-- owner = the venue owner, a free subscription, and entitlements. Keeps the
-- invariant without rewriting the web venue form yet (Phase C wires it richly).
-- ============================================================
create or replace function public.ensure_venue_org()
returns trigger language plpgsql
security definer
set search_path = public
as $$
declare
  _org uuid;
  _owner uuid;
begin
  if new.organization_id is not null then
    return new;
  end if;

  _owner := coalesce(new.owner_user_id, auth.uid());
  if _owner is null then
    return new; -- can't form an org without an owner; leave unlinked
  end if;

  insert into public.organizations (slug, name, owner_user_id)
  values (new.slug || '-org', new.name, _owner)
  returning id into _org;

  insert into public.organization_members (organization_id, user_id, role)
  values (_org, _owner, 'owner');

  insert into public.subscriptions (organization_id, plan_key, status)
  values (_org, 'free', 'active');

  new.organization_id := _org;
  return new;
end;
$$;

drop trigger if exists on_venue_ensure_org on public.venues;
create trigger on_venue_ensure_org
  before insert on public.venues
  for each row execute procedure public.ensure_venue_org();

-- ============================================================
-- Backfill — one solo org per existing owned venue, then entitlements.
-- ============================================================
do $$
declare
  v record;
  _org uuid;
begin
  for v in
    select id, owner_user_id, name, slug
    from public.venues
    where owner_user_id is not null and organization_id is null
  loop
    insert into public.organizations (slug, name, owner_user_id)
    values (v.slug || '-org', v.name, v.owner_user_id)
    returning id into _org;

    insert into public.organization_members (organization_id, user_id, role)
    values (_org, v.owner_user_id, 'owner');

    insert into public.subscriptions (organization_id, plan_key, status)
    values (_org, 'free', 'active');

    update public.venues set organization_id = _org where id = v.id;

    perform public.recompute_entitlements(_org);
  end loop;
end $$;

-- ============================================================
-- RLS
-- ============================================================
alter table public.organizations enable row level security;
create policy "orgs_select_member" on public.organizations
  for select to authenticated using (public.is_org_member(id));
create policy "orgs_insert_self" on public.organizations
  for insert to authenticated with check (owner_user_id = auth.uid());
create policy "orgs_update_manager" on public.organizations
  for update to authenticated using (public.is_org_manager(id)) with check (public.is_org_manager(id));
create policy "orgs_delete_owner" on public.organizations
  for delete to authenticated using (owner_user_id = auth.uid());

alter table public.organization_members enable row level security;
create policy "org_members_select_member" on public.organization_members
  for select to authenticated using (public.is_org_member(organization_id));
create policy "org_members_write_manager" on public.organization_members
  for all to authenticated
  using (public.is_org_manager(organization_id))
  with check (public.is_org_manager(organization_id));

alter table public.plans enable row level security;
create policy "plans_select_all" on public.plans for select using (true);

alter table public.subscriptions enable row level security;
-- Read-only to org members; writes happen via the Stripe webhook (service role).
create policy "subscriptions_select_member" on public.subscriptions
  for select to authenticated using (public.is_org_member(organization_id));

alter table public.entitlements enable row level security;
create policy "entitlements_select_member" on public.entitlements
  for select to authenticated using (public.is_org_member(organization_id));

alter table public.usage_events enable row level security;
-- Members can read their org's usage and log events (e.g. ticket taps, redemptions).
create policy "usage_events_select_member" on public.usage_events
  for select to authenticated using (
    organization_id is null or public.is_org_member(organization_id)
  );
create policy "usage_events_insert_member" on public.usage_events
  for insert to authenticated with check (
    organization_id is null or public.is_org_member(organization_id)
  );

alter table public.feature_purchases enable row level security;
create policy "feature_purchases_select_member" on public.feature_purchases
  for select to authenticated using (public.is_org_member(organization_id));

-- ============================================================
-- GRANTs (explicit — CLAUDE.md rule; 0004 default-privileges also apply)
-- ============================================================
grant select on public.organizations, public.plans to anon;

grant select on
  public.organizations,
  public.organization_members,
  public.plans,
  public.subscriptions,
  public.entitlements,
  public.usage_events,
  public.feature_purchases
to authenticated;

grant insert, update, delete on
  public.organizations,
  public.organization_members
to authenticated;

-- Members may log usage events but never mutate billing-derived state.
grant insert on public.usage_events to authenticated;

-- Billing-derived tables: read-only to clients. Revoke the default-privilege
-- writes (0004 granted insert/update/delete on future tables); RLS already has
-- no write policy, this is belt-and-suspenders least-privilege.
revoke insert, update, delete on public.plans from authenticated;
revoke insert, update, delete on public.subscriptions from authenticated;
revoke insert, update, delete on public.entitlements from authenticated;
revoke insert, update, delete on public.feature_purchases from authenticated;
revoke update, delete on public.usage_events from authenticated;
