# Session Wrap — 2026-06-15 → 06-16

Theme: **fix the workflow, restore terminal-free tooling, and run the first real DB
compliance sweep.** This session was triggered by the prior one diverging into terminal
fallback; the goal was to make the process explicit, document it, and unblock the build.

## What shipped

### Procedures & guidelines (new docs)
- **[WORKFLOW_AND_TOOLING.md](WORKFLOW_AND_TOOLING.md)** — terminal-last / tool-first rule,
  verified tool inventory, standard build loop, the Supabase connection setup (§3), recurring
  compliance-sweep cadence (§4), and a "never do" list.
- **[COMPLIANCE_AND_STORE_READINESS.md](COMPLIANCE_AND_STORE_READINESS.md)** — privacy-by-design
  + live data-collection inventory, App Store / Play / web checklists, security baseline,
  scalability watch-list.
- **[RESOLUTION_BACKLOG.md](RESOLUTION_BACKLOG.md)** — prioritized findings from the build
  review + the live DB advisor sweep.

### Identity / DNS
- Supabase owner login moved **`admin@opsbord.com` → `admin@ninety5south.com`** (Zoho alias).
- Root blocker was **broken DNSSEC** on `ninety5south.com`: an orphaned DS record at the
  registry (DNSSEC on, zone served unsigned) → `SERVFAIL` on validating resolvers → no
  external mail could be delivered, so confirmation emails never arrived. Internal Zoho-to-Zoho
  test mail masked it. Fixed by deleting the DS record at Name.com (DNSSEC Management).
- Supabase account email change is a **dual-confirmation** flow (old + new address).
- Follow-ups: enable 2FA + add a backup org owner; turn ON auto-renew for `ninety5south.com`
  (was OFF, expires 2027-07-23).

### Supabase MCP — the build unblocker
- Diagnosis: ONE account, TWO orgs (Ops Bord Org + Who's Playing). The hosted connector is
  **OAuth-scoped to one org per connection** and does **not** read the credentials vault, so a
  PAT in the vault had no effect.
- Solution: a **second, side-by-side hosted connector** scoped to the project via
  `https://mcp.supabase.com/mcp?project_ref=pakzhnwumihecyfcjfln`. Ops Bord connector untouched.
  `list_projects`/`list_organizations` are disabled under project scoping (expected).
- Verified by reading the project URL + migrations `0001`–`0016` through the MCP.

### First live database advisor sweep + remediation
- **0015_advisor_remediation** — revoked RPC EXECUTE on 6 trigger/internal SECURITY DEFINER
  functions, added 19 FK covering indexes, tightened 2 `WITH CHECK(true)` UPDATE policies.
- **0016_lock_admin_rpc** — closed the `admin_*` anon execution surface (0015's revoke was
  incomplete: anon inherited EXECUTE via the PUBLIC grant). Verified cleared via re-sweep.
- Remaining items triaged in RESOLUTION_BACKLOG.md §P1.5 (leaked-password toggle, RLS perf
  rewrites → 0017, `bands` schema change, `pg_trgm`, accepted-by-design exposures).

## Tool/connection state at session end
| Tool | Status |
|---|---|
| Supabase MCP — WhosPlaying (project-scoped) | ✅ connected, write-capable, approval-gated |
| Supabase MCP — Ops Bord Org | ✅ connected (side-by-side) |
| Vercel MCP · Stripe MCP (95 South) · Claude Preview · claude-in-chrome · computer-use | ✅ |

## Open / next
- Enable Supabase **leaked-password protection** (Auth dashboard — no SQL/MCP path).
- Draft **0017** (RLS `auth_rls_initplan` rewrites + permissive-policy consolidation).
- Harden the new owner account (2FA, backup owner, domain auto-renew).
- Resume feature work — the queued **Profile deep-dive** ([[project_profile_architecture]]).

Commits this session: `5d2f19e`, `ff83e61`, `d7c6e18`, `1535eaf`, `73d8c31`, `1c5b59f`
(+ the migration files). All pushed to `main`.
