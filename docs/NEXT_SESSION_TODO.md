# WhosPlaying — Next Session To-Do

**Context:** the entire backend/data layer is built, deployed (test mode), typed, and verified — see `docs/PRODUCTION_BUILD_STATUS.md`. What remains is mostly **UI wiring** (needs visual sign-off), **go-live**, and **secrets hygiene**. Ordered by priority.

---

## 0. Secrets hygiene (do first — security)

- [ ] **Rotate the `sk_live_…` Stripe key** that was pasted in a prior chat transcript (Dashboard → Developers → API keys → roll).
- [ ] Optionally rotate the **test `sk_test_…`** key and the Supabase **`service_role`** JWT (also appeared in transcript; low-risk but clean).
- [ ] Stand up the **Security Vault** (`docs/SECURE_CREDENTIALS_ARCHITECTURE.md`) and move all keys into it.

## 1. Wire the UI to the billing backend  *(visual sign-off required)*

- [ ] **Auth + org context** in the app: resolve the signed-in user → their `organization_members` → active org. (Web has `auth/callback` + `login`; mobile has `(auth)`.)
- [ ] **Web venue dashboard** (the web-primary management surface): authenticated route with the org's plan, "Manage billing", offers manager, boost, GPS composer, analytics — productionizing the prototype screens.
- [ ] **"Start Venue Pro" / "Upgrade" CTAs** → `billingQ.createCheckoutSession({ orgId, plan, successUrl, cancelUrl })` → redirect to `url`. (Currently web pricing → `/login`; prototype → `alert()`.)
- [ ] **"Manage billing"** → `billingQ.createPortalSession({ orgId, returnUrl })`.
- [ ] **"Get Tickets"** buttons → `billingQ.logTicketTap(eventId)` then open `withTicketUtm(ticketUrl, eventId)`.
- [ ] **Offers manager** → `offersQ.*`; surface a friendly upgrade prompt when an insert is rejected by the RLS entitlement gate (free 2nd-offer / GPS).
- [ ] **Boost + GPS composers** → `promotionsQ.createBoost` / `createGpsPush`; show the daily-cap state.

## 2. Verify the full paid loop end-to-end in the app

- [ ] From a real signed-in venue: upgrade → Stripe test Checkout (card `4242…`) → return → confirm Pro features unlock in the UI (entitlements refresh).
- [ ] Free venue hits the offer/GPS gate → upgrade nudge → upgrade → gate clears.
- [ ] One-off $5 boost (free venue) → Checkout → webhook records purchase + boost.

## 3. Admin console — real data

- [ ] Replace `apps/web/app/admin/_data.ts` placeholders with `adminQ.getPlatformKpis` / `getMarketDensity` / `listAuditLog`.
- [ ] Server-side gate the `/admin` route with `adminQ.isPlatformAdmin()` (notFound for non-admins). Add at least one `admin_users` row.

## 4. Go-live on Stripe (when ready to take real payments)

- [ ] Re-run `scripts/stripe-setup.mjs` with the **live** key → live price IDs.
- [ ] Register the **live** webhook endpoint; set live `STRIPE_*` secrets on the project.
- [ ] Flip the app's price IDs / keys to live (env).
- [ ] Stripe Tax registration + business/bank details in the dashboard.

## 5. Seed + GTM (Phase E)

- [ ] Seed flow for the launch market (venues + artists + events) so the map isn't empty.
- [ ] Public indexable event pages (SEO) — `metadataBase` is already `whosplaying.live`.
- [ ] Marketing pages polish (how-it-works / for-artists / for-venues are still thin).

---

## Cross-cutting rules (unchanged)

`pnpm typecheck && pnpm lint` before commit · RLS + GRANT (incl. `service_role`) in every migration · **show rendered UI in local preview for sign-off before finalizing** · never bypass cross-confirmation (now DB-enforced) · commit + push to `main`.

---

## Copy-paste kickoff prompt for the new session

```
Continue the WhosPlaying production build. Read first, in order:
1. docs/PRODUCTION_BUILD_STATUS.md (what's built + verified)
2. docs/NEXT_SESSION_TODO.md (this list)
3. CLAUDE.md + memory (project_production_build_status, reference_domain)

The backend is done, deployed to the live test DB, typed, and verified:
entitlements, Stripe billing (webhook/checkout/portal), offers/boosts/GPS
(entitlement-gated RLS), cross-confirmation enforcement, ticket-tap analytics.
Do NOT rebuild it. The work now is UI wiring + go-live.

Start with section 1: auth + org context, then the web venue dashboard, then
wire the upgrade/manage/boost/GPS/get-tickets CTAs to the existing helpers
(billingQ / offersQ / promotionsQ). Show every UI change in local preview for my
sign-off before committing (visual-approval rule). Stripe stays in TEST mode —
do not touch live. Commit + push to main per the workflow.
```
