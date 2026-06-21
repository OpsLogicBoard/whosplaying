-- 0017_fix_org_rls_recursion.sql
--
-- BUG: infinite RLS recursion on every org-scoped read.
--
-- `is_org_member()` / `is_org_manager()` (0005) are the predicates used by the
-- RLS policies ON `organization_members` and `organizations` — and they read
-- from those same tables. Defined SECURITY INVOKER, each internal lookup
-- re-applies the table's policies, which call the predicate again… until
-- Postgres aborts with `54001: stack depth limit exceeded`. The result: the
-- moment a real membership row exists, ANY authenticated query touching an org
-- (membership, organizations, subscriptions, entitlements, usage_events,
-- feature_purchases) fails. It stayed dormant only because the DB had zero orgs.
--
-- FIX: mark both predicates SECURITY DEFINER so their internal membership
-- lookups bypass RLS and the recursion is broken. This is the standard Supabase
-- pattern for a membership check invoked inside its own table's policies.
-- auth.uid() still resolves from the request JWT under SECURITY DEFINER.
--
-- Bodies are unchanged from 0005 except for the `security definer` marker.

create or replace function public.is_org_member(_org uuid)
returns boolean language sql stable security definer
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
returns boolean language sql stable security definer
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

-- Keep the execution surface tight (advisor posture from 0015/0016): these are
-- internal RLS predicates, not a public RPC. Every policy that calls them is
-- scoped to `authenticated`, so anon/PUBLIC never need EXECUTE.
revoke execute on function public.is_org_member(uuid) from public, anon;
revoke execute on function public.is_org_manager(uuid) from public, anon;
grant execute on function public.is_org_member(uuid) to authenticated, service_role;
grant execute on function public.is_org_manager(uuid) to authenticated, service_role;
