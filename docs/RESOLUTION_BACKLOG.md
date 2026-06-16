# WhosPlaying — Resolution Backlog

> Generated 2026-06-15 from a full structural + security + store-readiness audit of the
> current build. Severity reflects launch risk. Work top-down within each tier.
> Check items off as resolved; keep this file as the running issue list.

---

## P0 — Access / tooling blockers (fix before further backend work)

- [x] **Supabase MCP reaches the WhosPlaying project.** RESOLVED 2026-06-16 via a **second,
      project-scoped hosted connector** (`https://mcp.supabase.com/mcp?project_ref=pakzhnwumihecyfcjfln`),
      kept side-by-side with the Ops Bord Org connector. The hosted connector is OAuth-scoped
      to one org per connection and doesn't read the vault, so a PAT there had no effect — the
      second project-scoped connector is the fix. `list_projects`/`list_organizations` are
      disabled on it by project scoping (expected). See `WORKFLOW_AND_TOOLING.md` §3.
- [x] **Move Supabase owner identity off `admin@opsbord.com` to a 95 South address.**
      DONE 2026-06-15 → now `admin@ninety5south.com` (Zoho alias). Required fixing an
      orphaned DNSSEC DS record on `ninety5south.com` at Name.com (DS published but zone
      unsigned → SERVFAIL on validating resolvers → external mail undeliverable, incl.
      Supabase's confirmation email). Removing the DS at Name.com → DNSSEC Management fixed
      it. Supabase account email change is a dual-confirmation flow (old + new address).
      See memory `project_supabase_mcp_access_gap`.
- [ ] **Harden the new owner account:** enable 2FA on `admin@ninety5south.com` and add a
      backup Owner to both orgs so the parent company isn't single-point-of-failure.
- [ ] **Disable auto-renew is OFF + transfer-lock review on `ninety5south.com`** — Name.com
      showed Automatic Renewal OFF (expires 23 Jul 2027). Turn auto-renew ON so the parent
      domain can't lapse.
- [ ] **Confirm Stripe MCP account is the intended one.** Connected account is
      `acct_1TiMKIL6x6uykN3e` ("95 South"). Verify this is the production/test WhosPlaying
      Stripe account before any catalog or refund writes.

## P1 — Security (resolve before production deploy)

- [ ] **Secrets in `.claude/settings.local.json`.** Stripe secret key and Supabase
      service-role JWT are embedded in `Bash()` permission entries in plaintext. File is
      gitignored (good) but credentials should not sit in it. **Action:** remove the
      credential-bearing permission entries; rely on `scripts/set-secret.py` + Supabase
      secrets. Rotate the exposed test keys if there is any doubt about machine integrity.
- [ ] **Plaintext keys in `supabase/functions/.env`** (`STRIPE_SECRET_KEY`,
      `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`). Gitignored, but on-disk and unencrypted.
      **Action:** treat as dev-only; ensure the source of truth is Supabase project secrets;
      confirm the file is never bundled or deployed.
- [ ] **`type as any` in auth callback** — `apps/web/app/auth/callback/route.ts:23`.
      Weakens OTP type safety. **Action:** narrow `type` to the Supabase `EmailOtpType`
      union instead of casting to `any`.

## P2 — App Store / Play Store readiness (before first store submission)

- [ ] **No iOS privacy manifest** (`PrivacyInfo.xcprivacy`) — `apps/mobile/app.json`.
      Add and align with the data inventory in `COMPLIANCE_AND_STORE_READINESS.md` §1.
- [ ] **No permission usage descriptions** in `app.json` `ios.infoPlist` /
      Android manifest. Add the moment any screen requests location/camera/etc. — same change.
- [ ] **No Privacy Policy / Terms pages.** Create `apps/web/app/(marketing)/privacy/` and
      `/terms/` and link in footer + store listings. Required by Apple, Google, and web.
- [ ] **No in-app account-deletion path.** Required by Apple (5.1.1(v)) and Google.
      Add to profile/settings + a web URL.
- [ ] **ATT not configured.** Only needed if cross-app tracking is ever added; document the
      decision either way. Currently: no tracking → no ATT required.

## P3 — Code quality / hygiene

- [ ] **TODO in `apps/mobile/lib/appMode.ts`** — replace `appMode` with roles from the
      authenticated session. Verify the Work/Play mode actually reads real roles, not a stub.
- [ ] **End-of-phase `/code-review` + `/simplify`** sweep on the accumulated diff — no
      dedicated automated test suite exists yet; the interactive `prototype.html` is the only
      "test" surface. Consider a minimal smoke-test layer for the cross-confirmation invariant.

## P1.5 — Database advisor findings (first live sweep, 2026-06-16)

First sweep run via the project-scoped Supabase MCP against `pakzhnwumihecyfcjfln`.
Re-run `get_advisors` (security + performance) after each migration.

**Security:**
- [ ] **Enable leaked-password protection** (HaveIBeenPwned) in Auth. One toggle; do before launch.
- [ ] **`SECURITY DEFINER` functions RPC-callable by `anon`/`authenticated`** (~21). Split:
      - Trigger-only (`handle_new_user`, `performers_sync_event`, `venue_after_insert_entitlements`,
        `rls_auto_enable`, `ensure_venue_org`, `recompute_entitlements`) → `REVOKE EXECUTE` from
        anon/authenticated/public (safe — not used in RLS, not meant for RPC).
      - `admin_log`, `admin_platform_kpis`, `admin_market_density` → **review bodies first**; if they
        don't self-gate on `is_platform_admin()`, anon can write audit rows / read platform stats.
      - RLS-helper predicates (`venue_has_entitlement`, `offer_quota_ok`, `is_platform_admin`, etc.) →
        DO NOT blanket-revoke (RLS evaluates them as the querying role; revoking breaks policies).
- [ ] **RLS policies with `WITH CHECK (true)`** — `bands_insert_authenticated` (unrestricted INSERT),
      `conflict_flags_update_involved`, `gig_bids_update_visible` (open WITH CHECK on UPDATE). Tighten.
- [ ] **`pg_trgm` extension in `public` schema** — relocate to a dedicated schema (minor).

**Performance (scale prep for Beaches launch):**
- [ ] **~22 RLS policies re-evaluate `auth.<fn>()` per row** → wrap as `(select auth.uid())`. High-leverage.
- [ ] **~20 unindexed foreign keys** → add covering indexes (events, conversations, gig_listings, venues…).
- [ ] **4 tables with overlapping permissive SELECT policies** (`band_members`, `gig_listings`,
      `organization_members`, `venue_staff`) → consolidate.
- [ ] **Unused indexes** — re-evaluate AFTER real traffic; do not drop prematurely (likely just no usage yet).

> Note: Supabase docs advise against pointing MCP at production. The connector is project-scoped
> (`?project_ref=pakzhnwumihecyfcjfln`) but write-capable — apply DDL only with explicit approval.

### Status after migrations 0015 + 0016 (applied 2026-06-16)
- [x] Tightened the 2 `WITH CHECK(true)` UPDATE policies (gig_bids, conflict_flags) — **0015**.
- [x] Revoked RPC EXECUTE on 6 trigger/internal SECURITY DEFINER fns — **0015**.
- [x] Added 19 FK covering indexes (all unindexed-FK warnings cleared) — **0015**.
- [x] Closed the `admin_*` anon surface (revoke from PUBLIC + grant authenticated) — **0016**.
      (0015's revoke was incomplete; anon inherited EXECUTE via the PUBLIC grant.)

**Still open / accepted:**
- [ ] **Enable leaked-password protection** — Auth dashboard toggle (no SQL/MCP path); do before launch.
- [ ] **`auth_rls_initplan` (~22 policies)** + **multiple-permissive consolidation (4 tables)** → migration **0017** (performance).
- [ ] **`bands_insert_authenticated` WITH CHECK(true)** → needs schema change (`bands.created_by` + creator-as-admin trigger).
- [ ] **`pg_trgm` in `public`** → relocate (minor).
- _Accepted by design (no action):_ `log_ticket_tap` is intentionally anon-callable (anonymous tap
  logging); RLS-helper predicates (`venue_has_entitlement`, `offer_quota_ok`, `is_platform_admin`,
  `offer_gps_ok`, `gps_push_cap_ok`) stay EXECUTE-able since RLS evaluates them as the querying role;
  `admin_*` remain callable by `authenticated` (admin console, self-gated). New FK indexes show as
  "unused" only because there's no traffic yet — do not drop.

## Verified healthy (no action — recorded so we don't re-litigate)

- ✅ All migrations `0005`–`0014` include RLS policies **and** explicit GRANTs.
- ✅ Cross-confirmation enforced at the DB layer (`0011_cross_confirmation.sql`).
- ✅ Edge-function CORS is dynamic allowlist, never `*` (`_shared/cors.ts`).
- ✅ Stripe webhook verifies signatures (`constructEventAsync`).
- ✅ Service-role key used only server-side in edge functions.
- ✅ `next.config.ts` sets `outputFileTracingRoot` correctly.
- ✅ `themeColor` already moved to the `viewport` export (deprecation resolved).
- ✅ Domain types centralized in `packages/core`; not duplicated in apps.
- ✅ `pnpm typecheck` passes across all packages; no stray `@ts-ignore` (except the one
      `any` flagged in P1) and no production `console.log`.
