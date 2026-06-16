# WhosPlaying — Secure Credentials Vault Architecture

Mirrors the OpsBord approach (`~/Documents/Opsbord Security Vault.xlsx`): a single
**encrypted spreadsheet**, stored **outside** the git repo, that is the source of
truth for every API key, secret, and connection. This doc is the *architecture +
inventory* — **it contains no secret values** and is safe to commit. The vault
itself is created and populated in a dedicated session (prompt at the bottom).

---

## 0. Canonical implementation (supersedes the manual-paste framing below)

The vault is **built and encrypted by a script, never hand-edited in Excel** — matching
how the OpsBord vault (`~/update_vault.py`) actually works.

- **Updater script:** `~/update_whosplaying_vault.py` (lives outside the repo; holds a
  hardcoded `PASSWORD` constant — never commit it). Run it in Terminal:
  `python3 -m pip install msoffcrypto-tool openpyxl` then `python3 ~/update_whosplaying_vault.py`.
  It builds the encrypted workbook on first run, then collects each value via
  `getpass` (hidden input — no echo, no shell history), writes it to the right row,
  stamps the rotation date, and re-encrypts. **Claude never runs it and never sees a value.**
- **Vault file:** `~/Documents/Whos Playing Security Vault.xlsx`, AES-encrypted via
  `msoffcrypto` (not a readable zip). **7 functional sheets:** 🔗 Access Points ·
  🌐 Frontend Keys · 🔴 Server Secrets · 🏗️ Infrastructure IDs · 📅 Rotation Schedule ·
  🔐 Supabase Vault · 📖 Quick Reference.
- **Three runtime layers** (where values are consumed):
  1. **Frontend (public):** `NEXT_PUBLIC_*` (web) / `EXPO_PUBLIC_*` (mobile) — URL, anon
     key, Mapbox token. Never a service-role or secret key here.
  2. **Server secrets:** Supabase **Edge Function Secrets** (`supabase secrets set …`) —
     service_role, Stripe secret/webhook, Resend, push keys.
  3. **Supabase Vault:** encrypted Postgres, read by edge functions via the
     `get_vault_secret(secret_name)` RPC (migration `0013_vault_secret_helper.sql`,
     `service_role`-only) for rotate-without-redeploy secrets.

The provider-oriented inventory in §3 below is still the authoritative *list of what to
collect*; the script seeds those same credentials into the 7 sheets.

### Setting / rotating a runtime secret — the ONE canonical process (NO terminal)

**Claude runs this for you — you do not touch a terminal:**

```
python3 scripts/set-secret.py STRIPE_SECRET_KEY
```

Claude invokes it via its tool shell. That shell has **no TTY** (a `getpass`/`read -s`
prompt there raises `Inappropriate ioctl for device` — that was the bug behind the earlier
broken attempts), so the script detects the missing TTY and instead pops a **native macOS
dialog with a masked field** on your screen. You type the value into that dialog and click
OK. The value flows straight into `supabase/functions/.env` and the Supabase Edge Function
Secrets store — it never appears in chat, shell history, or a command argument. (If you
ever run the script in a real terminal yourself, it falls back to a `getpass` prompt.)

Claude then does everything around it: validate the value against the provider, hash-compare
`.env` ↔ deployed (Supabase secret digests are plain SHA-256), redeploy any function that
builds a client at startup (e.g. `stripe-checkout`/`stripe-portal`), and smoke-test. Record
the new value in the vault with `~/update_whosplaying_vault.py`.

Don't hand-roll one-off `supabase secrets set KEY=…` lines — they leak into shell history
and drift from `.env`. One script, every time.

---

## 1. Principles

1. **One source of truth.** All secrets live in the vault; runtime stores
   (Supabase secrets, Vercel/EAS env, `.env.local`) are *derived* from it.
2. **Never in git.** No secret value is ever committed. `.gitignore` already
   covers `.env*`; the vault lives in `~/Documents/`, never in the repo.
3. **Encrypted at rest.** The workbook is password-protected (Excel AES) and/or
   kept in an encrypted/synced secure folder — same as the OpsBord vault.
4. **Metadata in the repo, values in the vault.** The repo holds names + "where
   to get it" (`supabase/functions/.env.example`, this doc). Values do not.
5. **Rotation is tracked.** Every credential has a "last rotated" date and a
   status; exposed keys are rotated immediately.

---

## 2. Storage & format

- **File:** `~/Documents/WhosPlaying Security Vault.xlsx` (alongside the OpsBord one).
- **Format:** `.xlsx`, password-protected. Human-browsable, portable, matches OpsBord.
- **Backup:** whatever secure/synced location the OpsBord vault uses.
- **Access:** owner only. Never attach to chats, never paste values into prompts,
  never upload to web services.

### Sheet layout

One sheet per provider, plus a rotation log. Columns (consistent across sheets):

| Column | Meaning |
|---|---|
| **Service** | e.g. Supabase, Stripe |
| **Credential** | the key/secret name |
| **Env** | `test` / `live` / `n/a` |
| **Value** | the secret (vault only) |
| **Where used** | which app/function/store consumes it |
| **Source** | exactly where to obtain/regenerate it |
| **Last rotated** | date |
| **Status** | active / rotate / retired |
| **Notes** | constraints, e.g. "service-side only" |

---

## 3. Credential inventory (values blank — fill in the vault)

### Sheet: Supabase  (project `pakzhnwumihecyfcjfln`, org `pnozibuffukdfmawqyde`, name "whosplaying")
| Credential | Env | Where used | Source |
|---|---|---|---|
| `SUPABASE_URL` (`https://pakzhnwumihecyfcjfln.supabase.co`) | n/a | web, mobile, functions | Dashboard → Settings → API |
| anon / publishable key | n/a | web, mobile (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) | Settings → API |
| **service_role** key | n/a | server only (functions auto-inject) | Settings → API — **rotate (exposed this session)** |
| DB password | n/a | CLI / direct psql | Settings → Database |
| JWT secret | n/a | token verification | Settings → API |
| Access token (CLI) | n/a | `supabase` CLI login | account tokens |

### Sheet: Stripe  (account "95 South", `acct_1TiMKIL6x6uykN3e`)
| Credential | Env | Where used | Source |
|---|---|---|---|
| Secret key `sk_test_…` | test | `stripe-setup.mjs`, functions | Dashboard (Test) → Developers → API keys — **rotate (exposed)** |
| Secret key `sk_live_…` | live | go-live only | Dashboard (Live) → API keys — **ROTATE NOW (pasted in chat)** |
| Publishable key | test/live | client (if used) | API keys |
| Webhook signing secret `whsec_…` | test | `stripe-webhook` | webhook endpoint (created at setup) — rotate with key |
| Price: Venue Pro / Founding / Multi-venue / Boost | test | functions, web pricing | created by `scripts/stripe-setup.mjs` (IDs in `functions/.env.example`) |
| MCP connector session | test | Stripe MCP | **was stuck in LIVE** — connect a test session if used |

### Sheet: Auth / OAuth
| Credential | Where used | Source |
|---|---|---|
| Google OAuth Client ID + Secret | Supabase Auth (Google provider) | console.cloud.google.com → redirect to Supabase `/auth/v1/callback` |
| Apple Service ID + Key (+ Team/Key IDs) | Supabase Auth (Apple provider) | Apple Developer (requires paid account) |
| Google Calendar service-account JSON | calendar sync | console.cloud.google.com (acct whosplayingjaxbeach@gmail.com) |

### Sheet: Domain / DNS
| Item | Notes |
|---|---|
| `whosplaying.live` registrar login | domain owner |
| DNS records (Vercel, Supabase custom domain, email) | per-provider |

### Sheet: Deploy
| Credential | Where used | Source |
|---|---|---|
| Vercel token + project IDs | web deploy / env | Vercel account |
| EAS / Expo token | mobile builds | expo.dev |
| Apple App Store Connect / Google Play keys | app submission | respective consoles |

### Sheet: Source
| Credential | Where used |
|---|---|
| GitHub repo (`OpsLogicBoard/whosplaying`) + PAT/deploy keys | CI, pushes |

### Sheet: Rotation Log
`Date · Credential · Action (created/rotated/retired) · Reason · By`

---

## 4. Sync to runtime (vault → stores)

- **Supabase function secrets:** keep a gitignored `supabase/functions/.env` (values from the vault) → `supabase secrets set --env-file supabase/functions/.env`.
- **Web (Vercel):** set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, Stripe publishable + price IDs in Vercel env.
- **Mobile (EAS):** EAS secrets for the same public values.
- **Names are documented** in `supabase/functions/.env.example`; values never are.

---

## 5. Immediate rotation list (from this build session)

1. `sk_live_…` Stripe secret key — **pasted in chat → rotate now.**
2. `sk_test_…` Stripe test key — appeared in transcript → rotate (low-risk).
3. Supabase `service_role` JWT — appeared in transcript → rotate (server-only).
4. Stripe `whsec_…` test webhook secret — re-roll with the test key; re-set the function secret.

---

## 6. Build prompt (run in a new session to create + populate the vault)

```
Create the WhosPlaying Security Vault, mirroring ~/Documents/Opsbord Security
Vault.xlsx. Use docs/SECURE_CREDENTIALS_ARCHITECTURE.md as the spec.

1. Build a password-protected workbook at ~/Documents/WhosPlaying Security
   Vault.xlsx with one sheet per provider (Supabase, Stripe, Auth/OAuth,
   Domain/DNS, Deploy, Source) + a Rotation Log, using the columns and the
   credential inventory in the architecture doc. Leave Value cells blank.
2. Walk me through populating values ONE service at a time — I paste each value
   into the spreadsheet myself; do not ask me to paste secrets into chat.
3. First rotate the keys in the "Immediate rotation list", then record the new
   values + rotation dates in the vault and re-set the Supabase function secrets.
4. Verify the runtime still works (stripe-webhook smoke test) after re-keying.

Never commit the vault or any secret value. The repo keeps names only.
```
