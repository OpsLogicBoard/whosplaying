-- 0019_advisor_remediation_2.sql
-- Second-sweep security-advisor remediation (2026-06-21). Continues 0015.
-- Goal: close the remaining anon-facing exposures WITHOUT breaking public read
-- (open-access discovery must keep working for signed-out users).
--
-- INCLUDED (safe, contained):
--   1. Split offers SELECT by role so the ANON path never evaluates
--      is_venue_member() (mirrors the events policy split in 0018). Anon sees
--      only active offers; authenticated also sees offers for venues they manage.
--   2. Drop the anon/PUBLIC RPC surface on internal SECURITY DEFINER helpers that
--      are only ever called inside authenticated RLS policies. Authenticated keeps
--      EXECUTE (the policies need it); postgres/service_role are untouched. This
--      clears advisor 0028 (anon_security_definer_function_executable) for them.
--   3. Tighten bands_insert_authenticated: WITH CHECK(true) -> attribute the row
--      to its creator (adds bands.created_by). Clears advisor 0024. `bands` is
--      empty, so the additive column needs no backfill.
--
-- DEFERRED (own reviewed migration / out-of-band — unchanged from 0015 backlog):
--   * log_ticket_tap(uuid) stays anon-executable: it is a deliberate public
--     endpoint (granted in 0012, called from billing.ts on ticket tap). The
--     advisor 0028 hit for it is expected and accepted.
--   * advisor 0029 (authenticated_security_definer_function_executable) for the
--     internal helpers: removing the authenticated RPC surface would require
--     relocating them to a non-exposed schema and re-qualifying every policy
--     reference — a large, separately-reviewed refactor. The helpers only return
--     booleans about the caller's own access, so the residual risk is low.
--   * pg_trgm relocation out of public — low priority / risk of breaking search
--     indexes; tracked since 0015.
--   * Auth "leaked password protection" — a dashboard Auth setting, not SQL.

-- Each migration runs in its own transaction (supabase db push / apply_migration),
-- so no explicit begin/commit here.

-- 1. Split offers SELECT so anon never calls is_venue_member -------------------
drop policy if exists "offers_select_visible" on public.offers;

create policy "offers_select_anon" on public.offers
  for select to anon
  using (active);

create policy "offers_select_auth" on public.offers
  for select to authenticated
  using (active or public.is_venue_member(venue_id));

-- 2. Lock internal helpers down to authenticated (off anon/PUBLIC) -------------
-- is_org_member/is_org_manager are already authenticated-only (verified) and are
-- intentionally omitted.
revoke execute on function public.is_venue_member(uuid)            from public, anon;
grant  execute on function public.is_venue_member(uuid)            to authenticated;

revoke execute on function public.is_venue_manager(uuid)          from public, anon;
grant  execute on function public.is_venue_manager(uuid)          to authenticated;

revoke execute on function public.venue_has_entitlement(uuid, text) from public, anon;
grant  execute on function public.venue_has_entitlement(uuid, text) to authenticated;

revoke execute on function public.offer_quota_ok(uuid, uuid, boolean) from public, anon;
grant  execute on function public.offer_quota_ok(uuid, uuid, boolean) to authenticated;

revoke execute on function public.offer_gps_ok(uuid, integer)     from public, anon;
grant  execute on function public.offer_gps_ok(uuid, integer)     to authenticated;

revoke execute on function public.gps_push_cap_ok(uuid)           from public, anon;
grant  execute on function public.gps_push_cap_ok(uuid)           to authenticated;

revoke execute on function public.is_platform_admin()             from public, anon;
grant  execute on function public.is_platform_admin()             to authenticated;

-- 3. Tighten bands INSERT: attribute the row to its creator -------------------
alter table public.bands
  add column if not exists created_by uuid references public.profiles(id) default auth.uid();

drop policy if exists "bands_insert_authenticated" on public.bands;
create policy "bands_insert_creator" on public.bands
  for insert to authenticated
  with check (created_by = auth.uid());
