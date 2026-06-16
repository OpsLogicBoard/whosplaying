-- 0015_advisor_remediation.sql
-- First-sweep remediation of Supabase security + performance advisors (2026-06-16).
-- Scope is deliberately limited to changes verified safe against the live schema.
--
-- INCLUDED (safe, contained):
--   1. Revoke RPC EXECUTE on internal SECURITY DEFINER functions (trigger/event-trigger
--      bodies + the entitlements recompute) from public/anon/authenticated. These run in
--      definer context from triggers, so revoking does NOT break the trigger paths, and
--      they were never meant to be callable via /rest/v1/rpc.
--   2. Drop the anon RPC surface on the admin_* functions. They already self-gate on
--      public.is_platform_admin() (verified), so this is defense-in-depth; authenticated
--      is retained because the admin console calls them as a signed-in platform admin.
--   3. Add covering indexes for foreign keys flagged as unindexed.
--   4. Tighten the two UPDATE policies whose WITH CHECK was `true`, by matching WITH CHECK
--      to their existing USING predicate (prevents editing a visible row into a state the
--      caller doesn't own, e.g. reassigning bidder_id / subject_id).
--
-- DEFERRED (need their own reviewed migration / design decision — tracked in
-- docs/RESOLUTION_BACKLOG.md §P1.5):
--   * bands_insert_authenticated WITH CHECK(true): `bands` has no created_by column and no
--     creator-as-admin trigger, so it can't be tightened without a schema change. Needs a
--     `created_by` column + trigger to add the creator to band_members as admin.
--   * auth_rls_initplan (~22 policies): wrap auth.<fn>() in (select auth.<fn>()) — 0016.
--   * multiple_permissive_policies consolidation (band_members, gig_listings,
--     organization_members, venue_staff) — 0016.
--   * pg_trgm relocation out of public schema — separate, low priority.
--   * Auth "leaked password protection" — dashboard Auth setting, not SQL.

-- 1 + 2. Lock down SECURITY DEFINER functions ------------------------------------------

-- Internal trigger / event-trigger bodies — not RPC, run in definer context from triggers.
revoke execute on function public.handle_new_user()                 from public, anon, authenticated;
revoke execute on function public.ensure_venue_org()                from public, anon, authenticated;
revoke execute on function public.performers_sync_event()           from public, anon, authenticated;
revoke execute on function public.venue_after_insert_entitlements() from public, anon, authenticated;
revoke execute on function public.rls_auto_enable()                 from public, anon, authenticated;

-- Entitlements recompute: invoked by the venue trigger (definer context) and by
-- service_role from edge functions. service_role grants are untouched; only public/anon/
-- authenticated lose the direct RPC. (If any client calls this directly, revisit.)
revoke execute on function public.recompute_entitlements(uuid)      from public, anon, authenticated;

-- Admin RPCs already self-gate on is_platform_admin(); remove the anon surface only.
revoke execute on function public.admin_log(text, text, uuid, jsonb) from anon;
revoke execute on function public.admin_platform_kpis()              from anon;
revoke execute on function public.admin_market_density()             from anon;
revoke execute on function public.admin_role_of()                    from anon;

-- 3. Covering indexes for unindexed foreign keys ---------------------------------------

create index if not exists conflict_flags_event_a_id_idx        on public.conflict_flags     (event_a_id);
create index if not exists conflict_flags_event_b_id_idx        on public.conflict_flags     (event_b_id);
create index if not exists conversations_created_by_idx         on public.conversations      (created_by);
create index if not exists conversations_event_id_idx           on public.conversations      (event_id);
create index if not exists conversations_gig_listing_id_idx     on public.conversations      (gig_listing_id);
create index if not exists event_boosts_created_by_idx          on public.event_boosts       (created_by);
create index if not exists event_saves_event_id_idx             on public.event_saves        (event_id);
create index if not exists events_created_by_idx                on public.events             (created_by);
create index if not exists feature_purchases_venue_id_idx       on public.feature_purchases  (venue_id);
create index if not exists gig_listings_created_by_idx          on public.gig_listings       (created_by);
create index if not exists gig_listings_venue_id_idx            on public.gig_listings       (venue_id);
create index if not exists gps_push_campaigns_created_by_idx    on public.gps_push_campaigns (created_by);
create index if not exists gps_push_campaigns_event_id_idx      on public.gps_push_campaigns (event_id);
create index if not exists gps_push_campaigns_offer_id_idx      on public.gps_push_campaigns (offer_id);
create index if not exists messages_sender_user_id_idx          on public.messages          (sender_user_id);
create index if not exists offers_created_by_idx                on public.offers             (created_by);
create index if not exists organization_members_invited_by_idx  on public.organization_members (invited_by);
create index if not exists usage_events_actor_user_id_idx       on public.usage_events       (actor_user_id);
create index if not exists venues_owner_user_id_idx             on public.venues             (owner_user_id);

-- 4. Close the open WITH CHECK on UPDATE policies (match WITH CHECK to USING) ------------

alter policy gig_bids_update_visible on public.gig_bids
  with check (
    public.is_venue_member((select gl.venue_id from public.gig_listings gl where gl.id = gig_bids.gig_listing_id))
    or (bidder_type = 'artist'::public.performer_type and public.owns_artist(bidder_id))
    or (bidder_type = 'band'::public.performer_type   and public.is_band_admin(bidder_id))
  );

alter policy conflict_flags_update_involved on public.conflict_flags
  with check (
    (subject_type = 'venue'::public.conflict_subject  and public.is_venue_member(subject_id))
    or (subject_type = 'artist'::public.conflict_subject and public.owns_artist(subject_id))
    or (subject_type = 'band'::public.conflict_subject   and public.is_band_admin(subject_id))
  );
