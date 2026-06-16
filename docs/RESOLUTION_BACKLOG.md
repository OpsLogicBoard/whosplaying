# WhosPlaying — Resolution Backlog

> Generated 2026-06-15 from a full structural + security + store-readiness audit of the
> current build. Severity reflects launch risk. Work top-down within each tier.
> Check items off as resolved; keep this file as the running issue list.

---

## P0 — Access / tooling blockers (fix before further backend work)

- [ ] **Supabase MCP cannot reach the WhosPlaying project.**
      One account, two orgs — but the connector's OAuth grant was scoped to only "Ops Bord
      Org"; the "Who's Playing" org (project `pakzhnwumihecyfcjfln`) was left out, so it
      returns *permission denied*. **Action:** re-authorize the Supabase connector as the
      same account and grant **both** orgs (GUI, not terminal). Same identity → OpsBord
      unaffected. Blocks all MCP-driven migrations and advisor sweeps. See `WORKFLOW_AND_TOOLING.md` §3.
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
