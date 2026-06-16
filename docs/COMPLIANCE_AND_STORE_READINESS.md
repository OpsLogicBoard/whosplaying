# WhosPlaying — Compliance & Store Readiness

> Build with App Store, Google Play, and web deployment approval in mind from day one.
> Apple treats user privacy as a hard gate; a late-stage privacy miss can block launch.
> This file is the standing checklist. Re-run the relevant section on the cadence in
> `WORKFLOW_AND_TOOLING.md` §4 — not just before submission.

---

## 1. Privacy-by-design (applies to all three platforms)

The cross-cutting rule: **collect the minimum, declare everything you collect, and never
collect silently.**

- **Data inventory must stay current.** Every field, permission, and third-party SDK that
  touches user data goes in the table below. If you add data collection without updating
  this table, the App Store privacy "nutrition label" and the Play Data Safety form will be
  wrong — both are attestations and both can get the app pulled.
- **Purpose limitation.** Location is collected only to surface nearby live music, not for
  advertising or sale. Document the purpose for each item.
- **No tracking without ATT.** If any SDK links user data to third-party data for ads
  (IDFA, Meta SDK, AppsFlyer, etc.), iOS requires an App Tracking Transparency prompt.
  Today WhosPlaying does not do this — keep it that way unless explicitly decided.
- **Account deletion path is mandatory.** Apple (Guideline 5.1.1(v)) and Google both
  require an in-app way to delete the account and associated data. This must exist before
  submission. Web should expose the same.
- **Children.** This is a 17+/general-audience nightlife app. Set the age rating
  accordingly and do not knowingly collect data from under-13s (COPPA).

### Data-collection inventory (keep current)

| Data | Where collected | Purpose | Linked to identity | Shared w/ third party |
|---|---|---|---|---|
| Email | Auth (signup) | Account, notifications | Yes | Resend (transactional email only) |
| Name / handle | Profile | Public artist/venue identity | Yes | No |
| Coarse/precise location | Discover, GPS push (venue Pro) | Surface nearby events | Yes (while feature in use) | No |
| Payment info | Stripe checkout | Venue Pro billing | Via Stripe | Stripe (processor) |
| Usage events (ticket taps, etc.) | App telemetry | Product analytics, billing meters | Pseudonymous | No |

> ⚠️ **Open item:** location and ATT declarations are not yet in `apps/mobile/app.json`.
> The app does not request these permissions *yet*; the moment any screen does, add the
> usage-description strings and update this table **in the same change**.

---

## 2. Apple App Store readiness checklist

Run before any TestFlight build intended for review.

- [ ] **Bundle ID** set (`live.whosplaying.app`) and matches App Store Connect.
- [ ] **`Info.plist` usage descriptions** for every permission actually requested
      (`NSLocationWhenInUseUsageDescription`, `NSCameraUsageDescription`, etc.). Strings must
      be specific and honest — generic strings get rejected.
- [ ] **Privacy manifest (`PrivacyInfo.xcprivacy`)** declaring data types + required-reason
      APIs. EAS can generate, but verify it reflects the §1 inventory.
- [ ] **App Privacy "nutrition label"** in App Store Connect matches §1 inventory exactly.
- [ ] **Account deletion** reachable in-app.
- [ ] **Sign in with Apple** offered if any other social login (Google) is offered — App
      Store rule. (Already noted in CLAUDE.md.)
- [ ] **Privacy Policy URL + Terms URL** live and reachable (`whosplaying.live/privacy`, `/terms`).
- [ ] **Sign-in not required to browse** core value (Apple dislikes hard login walls for
      content that can be shown logged-out) — Discover should work for goers without forcing auth.
- [ ] **No placeholder / brand-spec boards** in shipped screens (`09_Codex_Failure_Review.md`).
- [ ] **External payments:** Venue Pro is a B2B SaaS subscription billed via Stripe (not
      digital goods consumed in-app by the purchasing user), which is permitted outside IAP —
      but confirm the reader-app / external-purchase rules still hold at submission time, as
      Apple's policy here shifts. Consumer ticketing is a link-out (free), not IAP.

## 3. Google Play readiness checklist

- [ ] **Package name** (`live.whosplaying.app`) matches Play Console.
- [ ] **Data Safety form** matches §1 inventory.
- [ ] **Permissions** declared in the Android manifest are all justified; remove any unused.
      Background/precise location needs a separate Play declaration + justification video.
- [ ] **Privacy Policy URL** set in Play Console.
- [ ] **Account deletion** reachable in-app AND via a web URL (Play requires the web path too).
- [ ] **Target API level** meets current Play minimum (Expo SDK default usually compliant — verify).
- [ ] **Content rating** questionnaire completed (nightlife/alcohol context → rate honestly).

## 4. Web deployment readiness

- [ ] **Privacy Policy + Terms pages** exist and are linked in the footer.
- [ ] **Cookie/consent** posture documented (currently first-party auth cookies only — no
      ad cookies; if that changes, add a consent banner for GDPR/CCPA regions).
- [ ] **Security headers** (CSP, HSTS, X-Frame-Options) reviewed in Next.js config / Vercel.
- [ ] **CORS** on edge functions stays dynamic-allowlist, never `*` (already enforced in `_shared/cors.ts`).
- [ ] **No secrets in client bundles** — only `NEXT_PUBLIC_*` / Expo public env vars reach the client.

---

## 5. Security baseline (all platforms)

- **RLS on every table, GRANTs in the same migration.** No exceptions.
- **Edge functions:** validate the caller's JWT; use the service-role key only server-side,
  never shipped to a client; verify Stripe webhook signatures.
- **Secrets live in Supabase project secrets**, entered via `scripts/set-secret.py`. The
  on-disk `supabase/functions/.env` is a dev convenience only — treat the machine as the
  trust boundary and keep that file gitignored.
- **Run Supabase security advisors after every DDL change** and act on findings.
- **`set search_path = public`** on all SECURITY DEFINER / helper functions.

---

## 6. Scalability watch-list

- **Geo queries** currently use a b-tree on `(lat, lng)` bounding box. Fine for the Beaches
  launch; migrate to PostGIS before multi-metro scale (don't enable `earthdistance`/GIST
  casually — see CLAUDE.md gotcha).
- **Entitlement checks** run in RLS helper functions; watch query plans as `events`/`offers`
  grow (performance advisors will flag missing indexes).
- **Email fan-out** (`notify-followers`) is synchronous per request today; move to a queue
  if follower counts get large.
- **Image/OG generation** (`og-image`) is on-demand; add caching headers / CDN before heavy traffic.
