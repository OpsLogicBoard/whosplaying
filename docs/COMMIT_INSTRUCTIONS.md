# Commit Instructions — v2 frontend approval + open access + backend 0018

Handoff for committing the uncommitted work sitting on `main` as of 2026-06-21:
the approved v2 mobile frontend + parity fixes, the Work/Play tab swap,
open-access auth, the docs rewrite, and backend migration `0018`. **Nothing has
been committed yet.** Commit it to a **branch** — never straight to `main`
(`main` auto-deploys to Vercel + EAS).

> There is a mix of this session's work **and** some pre-existing uncommitted
> changes already on `main`. The steps below commit it all on one branch.

## Critical caveats

- **Migration `0018_create_event_fields.sql` is ALREADY APPLIED** to the live
  Supabase project (`pakzhnwumihecyfcjfln`). The file is committed only for repo
  history / fresh deploys. **Do not re-apply it** — it will error on duplicate
  types/tables.
- **Do not commit `.claude/projects/`** — local session/memory state. Gitignore
  it (step 1).
- Run the typecheck/lint gate (step 3) before committing. Mobile + supabase were
  verified clean at end of session; the **web app was not touched** and may have
  pre-existing lint/type issues — scope checks to the touched workspaces.
- End every commit message with the co-author footer (per root `CLAUDE.md`).

## Steps

```bash
cd /Users/JW/whosplaying

# 1. Keep local session state out of git
grep -qxF '.claude/projects/' .gitignore || echo '.claude/projects/' >> .gitignore

# 2. Branch off main
git checkout -b feat/v2-frontend-approved-open-access

# 3. Verify the touched workspaces are clean
pnpm --filter @whosplaying/mobile typecheck && pnpm --filter @whosplaying/mobile lint
pnpm --filter @whosplaying/supabase typecheck && pnpm --filter @whosplaying/supabase lint

# 4a. Mobile frontend: v2 parity, Work/Play tab swap, open access, guest state
git add apps/mobile .claude/launch.json
git commit -m "$(cat <<'EOF'
feat(mobile): approved v2 frontend — parity fixes, Work/Play tab swap, open access

- Auth login/signup → v2 (coral gradient CTA, clean canvas)
- Work-mode tab swap (Calendar·Gigs·Create·Messages·You) via shared appMode store
- Create-event: green auto chips, cover tag bottom-left, tap-to-pick date/time
- Parity fixes: billing/gps-push/my-people/public-profile/profiles status pills,
  slider, cover tag; removed redundant dashboard cards duplicating Work tabs
- Open access: AuthGate no longer walls the home; You tab guest sign-in CTA

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"

# 4b. Backend: persist create-event fields (migration already applied to prod)
git add packages/supabase supabase/migrations/0018_create_event_fields.sql pnpm-lock.yaml
git commit -m "$(cat <<'EOF'
feat(db): 0018 create-event fields + private details (applied to prod)

- events: visibility/setting/family_friendly/min_age/price_cents
- event_private_details + event_participant_notes with participant-scoped RLS
- is_event_participant() helper; events SELECT split by role to keep anon
  discovery open while hiding private events
- createEvent persists the new fields; types regenerated

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"

# 4c. Docs + governance
git add docs CLAUDE.md
git commit -m "$(cat <<'EOF'
docs: lock v2 design + open-access model

- Rewrite BRAND.md; add DESIGN_SYSTEM.md (tokens/components/rules/QA gate)
- Add MOBILE_APP.md (screens, persona/tab-swap, screen→data map)
- Rewrite DATA_MODEL.md (full schema + 0018); update ARCHITECTURE.md, CLAUDE.md
- Add COMMIT_INSTRUCTIONS.md (this file)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"

# 5. Catch any stragglers (pre-existing modified files not grouped above)
git status --short          # review what's left
# git add -A && git commit -m "chore: misc config + screen updates  (Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>)"

# 6. Push the branch and open a PR (do NOT merge to main without review)
git push -u origin feat/v2-frontend-approved-open-access
gh pr create --fill --base main
```

## After committing — still open

- Bind the **private gig-details inputs** in `apps/mobile/app/create-event.tsx`
  (currently static) to `event_private_details` / `event_participant_notes`.
- **Security hardening** (advisor WARNINGs: `bands_insert_authenticated`,
  leaked-password protection, `pg_trgm` in `public`) — must preserve public read.
- **Web-app v2 overhaul** (`apps/web` is still on the retired teal/yellow
  direction) — see `docs/DESIGN_SYSTEM.md` for the target.

## Reference

- Design law: `docs/BRAND.md`, `docs/DESIGN_SYSTEM.md`, `docs/MOBILE_APP.md`
- Schema: `docs/DATA_MODEL.md`
- What shipped this session: memory `project_frontend_approved_design_locked.md`
