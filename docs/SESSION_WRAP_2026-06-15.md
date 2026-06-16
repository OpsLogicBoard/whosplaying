# Session Wrap — 2026-06-15 · Secure credentials + email/auth wiring

Handoff for the next session. Goal of this session was the **secure credentials vault**;
it expanded into rotating exposed keys, hardening, and standing up the **Resend email**
+ **auth URL** configuration.

---

## ✅ Accomplished

### Credentials vault + secret-entry process
- **`~/update_whosplaying_vault.py`** — builds a password-protected 7-sheet xlsx vault
  (`~/Documents/Whos Playing Security Vault.xlsx`) via `msoffcrypto` + `getpass`. Mirrors
  the OpsBord vault. **The vault itself is NOT yet populated** — user runs the script to
  enter values. (PASSWORD constant must be set first.)
- **`scripts/set-secret.py`** — canonical secret setter. Claude runs it; it detects the
  headless tool shell (no TTY) and pops a **native macOS dialog** (masked) for the value,
  then writes `.env` + pushes to Supabase. **No terminal required.**
- `docs/SECURE_CREDENTIALS_ARCHITECTURE.md` updated (§0) with the real implementation.

### Stripe (rotated + verified)
- `STRIPE_SECRET_KEY` rotated → deployed digest `09b3ac0b…`, `.env` in sync, validated
  against Stripe. `STRIPE_WEBHOOK_SECRET` = `4ce4daa4…` (had been accidentally set equal to
  the API key; fixed). `stripe-checkout`/`stripe-portal` redeployed. Webhook smoke test 200.

### Hardening
- **CORS**: `_shared/cors.ts` → dynamic origin allowlist (whosplaying.live + www, localhost,
  `*.vercel.app`, no `*`). All 8 functions migrated, **deployed + verified live**.
- **Layer-3 vault RPC**: `0013_vault_secret_helper.sql` (`get_vault_secret`, service-role-only).

### Resend email + auth URLs
- `RESEND_API_KEY` stored + validated; domain **whosplaying.live verified**.
- Senders: **accounts@** (auth) + **notifications@** (notify-followers); Reply-To admin@.
- **Custom SMTP wired** via Management API (surgical PATCH; `config push` would have
  clobbered prod). **Send test → delivered.**
- **`site_url` = https://whosplaying.live** + redirect allow-list for web (apex+www+localhost)
  and mobile (`whosplaying://auth/callback`). Were pointing at localhost before.

### notify-followers
- Implemented (was a stub): `0014_event_follower_emails.sql` (SECURITY DEFINER RPC) +
  rewritten function — confirmed-events-only, service-role-guarded, batched Resend send from
  notifications@. **Deployed; guard verified (anon→403). Not auto-triggered yet.**

### Commits (all on `main`)
- `10cb32f` CORS + vault RPC + doc
- `026e421` set-secret.py + process doc
- `6f6537b` native-dialog secret entry
- `5141304` notify-followers + migration 0014

---

## 🔲 Open items (next session, priority order)

1. **Populate the vault** — user runs `~/update_whosplaying_vault.py` (set PASSWORD first)
   to record everything collected this session (Stripe key, Resend key, etc.) + rotation dates.
2. **Auto-trigger notify-followers** — enable `pg_net`, add a DB trigger (or extend the
   cross-confirmation trigger 0011) to call the function when an event flips to `confirmed`.
   Currently it only fires if called manually with the service key.
3. **Full notify-followers send test** — needs a confirmed event *with followers* + the
   service-role key value (not stored locally). Guard/deploy verified; send path not yet
   exercised live.
4. **Push keys** — collect `APNS` (.p8) / `FCM` service account / `EXPO_PUSH` token via the
   dialog flow; then wire push into notify-followers.
5. **Apple Sign-In** — `external_apple_enabled=false`; needs the paid Apple Developer setup
   (Service ID + key). Google is already enabled.
6. **Branded email templates** — auth emails currently use Supabase defaults
   ("Confirm your email address"). Customize in Auth → Email Templates.
7. **Remaining credential inventory** to collect into the vault: Mapbox token (web+mobile),
   Google OAuth client secret, Google Calendar SA JSON, Vercel/EAS/GitHub tokens, Supabase
   DB password + JWT secret.
8. **Cleanup** — `admin@whosplaying.live` is now a registered auth user (created by the send
   test). Delete from Auth → Users if unwanted.

---

## 📌 Standing rules / context (carry into next session)

- **NEVER route the user to the terminal.** They don't use it. Secret entry = `scripts/set-secret.py`
  → native macOS dialog. Terminal is an absolute last resort. (Memory: `feedback-no-terminal-interaction`.)
- **Production actions need explicit per-action authorization** — `supabase db push`,
  `functions deploy`, `secrets set`, Management API writes are all classifier-gated. Ask before each.
- **Supabase: use the CLI, not MCP** (MCP token is read-only for this project). **`config push`
  is UNSAFE** — config.toml has localhost `site_url` and no OAuth providers, so it would clobber prod.
  > ⚠️ SUPERSEDED 2026-06-16: MCP now reaches WhosPlaying via a project-scoped connector and is
  > the preferred path for migrations/advisors — see `SESSION_WRAP_2026-06-16.md` and
  > `WORKFLOW_AND_TOOLING.md` §3. The `config push` warning still stands.
- **Auth config changes** = Management API `PATCH /v1/projects/<ref>/config/auth` with a user-supplied
  access token captured via dialog (the CLI's keychain token is off-limits). Patch only the fields you mean to.
- Supabase secret digests are **plain SHA-256** → hash-compare `.env` vs deployed to check sync
  without exposing values.

## Key state
- Supabase project `pakzhnwumihecyfcjfln`; `site_url=https://whosplaying.live`.
- Stripe `95 South` / `acct_1TiMKIL6x6uykN3e` (test mode); key `09b3ac0b…`, webhook `4ce4daa4…`.
- Resend domain verified; SMTP live via accounts@whosplaying.live.
- Full detail in memory: `project-credentials-vault`, `feedback-secret-entry-process`,
  `feedback-no-terminal-interaction`.
