# WhosPlaying — Workflow & Tooling Procedures

> **Status:** Canonical. Written 2026-06-15 after a session that diverged from the
> established tool-first workflow. These rules exist so that never happens again.
> If a future session starts reaching for the terminal or asking the user to run
> commands, **stop and re-read this file.**

---

## 0. The prime directive: tool-first, never make the user the runtime

The user does not operate the terminal on Claude's behalf. Ever, except as a true
last resort. Claude has a rich tool surface (MCP servers, CLIs, skills, GUI
automation). The job is to **pick the best available tool and use it** — and when
the best tool is *not* wired up, to **say so, present the fix, and put it in place**
rather than silently degrading to "please paste this into your terminal."

Order of preference for any action:

1. **Dedicated MCP tool** for the system (Supabase, Vercel, Stripe, Apple Notes, preview).
2. **Project skill / CLI already approved** (`gh`, `pnpm` via Bash where non-interactive and safe).
3. **GUI automation** (computer-use for native dialogs; claude-in-chrome for web UIs).
4. **Bash tool, run by Claude** (never handed to the user) — for non-interactive, idempotent commands.
5. **Ask the user to do something in the terminal** — LAST RESORT ONLY, and only after
   explaining why every higher tier failed.

See memory: `feedback_no_terminal_interaction`, `feedback_tool_first_workflow`.

---

## 1. Connected tool inventory (verified 2026-06-15)

| Capability | Tool | Status | Notes |
|---|---|---|---|
| **Supabase DB / migrations / advisors / edge fns** | Supabase MCP (`mcp__…__*`) | ⚠️ **WRONG ACCOUNT** | Token sees org `canvmbeehpufktigxxby` (ComNet, Termin8t). **Does NOT have WhosPlaying project `pakzhnwumihecyfcjfln`.** See §3. |
| **Web deploys / runtime logs / domains** | Vercel MCP | ✅ Connected | Use for deploy, build logs, runtime logs, domain checks. |
| **Billing / products / prices / refunds** | Stripe MCP | ✅ Connected | Account `acct_1TiMKIL6x6uykN3e` ("95 South"). Verify this is the intended WhosPlaying Stripe account before any write. |
| **Local UI preview + verification** | Claude Preview MCP (`preview_*`) | ✅ Available | Use for the visual-approval gate. Never ask the user to "check the browser." |
| **Web UI automation** | claude-in-chrome MCP | ✅ Available | For web dashboards with no dedicated MCP. |
| **Native macOS dialogs / desktop apps** | computer-use MCP | ✅ Available (per-app grant) | For native dialogs (e.g. secret entry), Finder, System Settings. |
| **Notes** | Apple Notes MCP | ✅ Available | |
| **GitHub** | `gh` CLI via Bash | ✅ Available | PRs, issues, releases. |
| **Secrets entry** | `scripts/set-secret.py` (native dialog) | ✅ Canonical | NEVER hand-enter secrets in terminal. See `SECURE_CREDENTIALS_ARCHITECTURE.md`. |
| **UI component scaffolding** | magic + shadcn-ui MCP | ✅ Available | Optional; must conform to v2 brand system. |

**Rule:** At the start of a build session, if a task will touch Supabase, Vercel, or
Stripe, **verify the relevant MCP can actually reach the WhosPlaying resources first**
(a cheap read call), before planning work that assumes it. A blocked tool discovered
mid-task is the failure mode that derailed the prior session.

---

## 2. Standard build loop

For every change:

1. **Plan** against the canonical docs (`ARCHITECTURE.md`, the v2 brand package, this file).
2. **Implement** in the right package (domain types → `packages/core`; UI → `packages/ui`; never duplicate).
3. **Verify locally** — `pnpm typecheck` + `pnpm lint` (Claude runs these via Bash, non-interactive).
4. **Visual sign-off** — for any UI change, render it in Claude Preview and show the user
   before finalizing (memory: `feedback_visual_approval`).
5. **Commit & push to `main`** — `git add` → `git commit` → push. Vercel + EAS deploy from `main`.
6. **Compliance check** — if the change touched DB schema, auth, permissions, edge
   functions, or any data collection, run the relevant sweep from §4.

Migrations specifically: author the SQL in `supabase/migrations/`, apply via the
**Supabase MCP `apply_migration`** (once §3 is resolved), then run `get_advisors`
(security + performance) — never via the user's terminal.

---

## 3. The one open access gap — Supabase MCP (resolve before DB work)

- **WhosPlaying project ref:** `pakzhnwumihecyfcjfln` (from `apps/*/.env.local`, `supabase/config.toml` id `whosplaying`).
- **Connected MCP can see:** org `canvmbeehpufktigxxby` → `nwayqcczlecjszgvvohi` (ComNet), `aesyxxwlqjayzmopklef` (Termin8t).
- **Result:** `get_project pakzhnwumihecyfcjfln` → *permission denied*. All MCP-driven DB
  work for WhosPlaying is blocked until this is fixed.

**Fix (user action, one-time, GUI — not terminal):** Re-authorize the Supabase MCP
connector so it includes the Supabase account/organization that owns
`pakzhnwumihecyfcjfln`. This is done in the Claude MCP/connector settings, not the
shell. Until then, DB changes are authored as migration files and applied either after
reconnection or via the Supabase dashboard SQL editor (GUI) — **never by asking the user
to run `supabase db push` in a terminal.**

See memory: `project_supabase_mcp_access_gap`.

---

## 4. Recurring compliance sweeps (cadence)

These run on a schedule, not just when something breaks. See
`COMPLIANCE_AND_STORE_READINESS.md` for the full checklists.

| Sweep | When | Tool |
|---|---|---|
| **Supabase security advisors** | After every migration / DDL change, and weekly | Supabase MCP `get_advisors type=security` |
| **Supabase performance advisors** | After schema changes touching queries/indexes, and weekly | Supabase MCP `get_advisors type=performance` |
| **RLS + GRANT audit** | Every new table (same migration) | Manual review + advisors |
| **Secret-leak scan** | Before every commit that touches config/env | grep for `sk_live`/`sk_test`/`service_role` in tracked files |
| **Code-quality sweep** | End of each build phase | `/code-review` or `/simplify` on the diff |
| **App-store readiness** | Before any TestFlight / Play internal build | Checklist in compliance doc |
| **Privacy-data inventory** | Whenever a new field/permission/SDK collects user data | Update data-collection table in compliance doc |

---

## 5. Things that are NOT allowed

- ❌ Asking the user to paste commands into a terminal because an MCP "isn't set up" —
  set it up or present the GUI path first.
- ❌ Hand-entering secrets in the terminal — use `scripts/set-secret.py`.
- ❌ Applying DB changes to the wrong Supabase project (verify ref `pakzhnwumihecyfcjfln`).
- ❌ Shipping a migration that creates a table without RLS + GRANTs in the same file.
- ❌ Finalizing a UI change without the local-preview visual sign-off.
- ❌ Rendering brand-spec boards inside production pages (`09_Codex_Failure_Review.md`).
