# Phase 0 — Agent Prompt

**Paste this into Claude Code as the kickoff message for Phase 0.**
The agent has full repo access. James is available for visual review and
sign-off but is not a coder — do not ask him to write or debug code, and
do not ask him to make framework-level decisions you can resolve from the
existing documentation.

---

## You are the design-execution lead for WhosPlaying

WhosPlaying is a live local music app launching in Jacksonville Beach. The
repo has a solid technical foundation — pnpm monorepo, Expo mobile,
Next.js 15 web, Supabase backend — but the product currently looks like
default Tailwind. The brand vision in `CLAUDE.md` describes layered,
overlapping type with offset color shadows in teal, yellow, coral, and
orange. None of that is rendered yet. Your job is to render it.

You will not write business logic, schema migrations, or auth code in this
phase. You will produce design tokens, one signature component, three
reference web pages, and three written specifications.

---

## Read these first, in this order

1. `docs/build/BUILD_PLAN.md` — the master plan and why Phase 0 comes first
2. `docs/build/TASK_LOG.md` — the living issues log; you'll write to this
3. `docs/build/phases/phase-0-design-reset/README.md` — the phase brief
4. `docs/build/phases/phase-0-design-reset/TASKS.md` — your execution list
5. `CLAUDE.md` — invariants, gotchas, brand direction
6. `docs/ARCHITECTURE.md` — the system shape

Do not skim. The `TASKS.md` file is the authoritative checklist. If
anything in this prompt conflicts with that file, the task file wins.

---

## Your mission for Phase 0

Execute tasks P0.0 through P0.13 in `TASKS.md`, in the order specified.
Each task names its output files and its verification criteria. Do not
move to the next task until the current task verifies.

The phase ends when:
- All seven Phase 0 deliverables described in the phase `README.md` exist.
- `pnpm typecheck && pnpm lint` pass clean.
- The three reference compositions render at `/welcome`, `/discover`, and
  `/e/sample-event` on the local Next.js dev server.
- `TASK_LOG.md` is updated.

Then you stop. Do not start Phase 1.

---

## Constraints that bind every task

1. **No paid AI API calls.** If a task seems to require one, redesign it
   to be deterministic or stop and ask. This includes image generation,
   text generation, and any kind of LLM-assisted content.
2. **No database changes.** Phase 0 does not touch `supabase/migrations/`,
   RLS policies, or any seeded data. If you find yourself wanting to add
   a table, stop and document the desire in `TASK_LOG.md` for Phase 3.
3. **No auth changes.** Do not modify Supabase Auth configuration, OAuth
   providers, or sign-in flows. Phase 1 handles all of that.
4. **No mobile parity required.** The three reference compositions are
   web-only in Phase 0. Mobile reaches parity in Phase 1. The shared
   primitive in `packages/ui` does need to be safe to consume from both
   clients, but the mobile-side renders happen later.
5. **Web and mobile share the design system.** Tokens, the
   `<LayeredHeadline>` primitive, and the Tailwind preset must work for
   both consumers. Don't fork.
6. **`pnpm typecheck && pnpm lint` pass before every commit.** The
   workflow rule from `CLAUDE.md` stands.
7. **Commit and push to `main` after each completed task.** Vercel will
   build automatically; that's expected and welcome.

---

## What you choose vs. what you ask about

**Choose, and document the choice in code comments or in the relevant
spec file:**
- Specific hex values for the four signature colors
- The display and body typefaces (pick *deliberately*, see the
  frontend-design guidance below)
- The exact offset distance for the layered headline
- Sample data for the reference compositions (use realistic JAX Beach
  venue names and plausible artist names; do not use real venues without
  permission)
- The headline copy on the Welcome screen
- Whether the demo route for the primitive is a Storybook file or a
  Next.js route

**Ask James about** (write a single consolidated message at the end of
Phase 0, not a stream of questions):
- Any place where you diverged from the brief and want confirmation
- Any place where you found a constraint in the repo that contradicts
  the brief
- Anything that requires an account, secret, or paid service

---

## Design guidance — please internalize before you start

You are not building a generic music app. You are building *this one*,
and the brief is specific. Re-read these passages from `CLAUDE.md`:

> Visual language: layered/overlapping type with offset color shadows
> (teal + yellow + coral + orange) on white or teal grounds.

> Map style: custom JSON in `packages/ui/src/brand/map-style.json`. Not
> the default grey muni look.

The current AI-design defaults — warm cream with terracotta, near-black
with acid green, broadsheet hairline rules — are *not* what this brief
asks for. Don't drift toward them. The signature element is the layered
headline. Spend the boldness there. Keep everything else disciplined.

Match complexity to vision. Layered headlines are an expressive choice.
The supporting type, spacing, and card design should be quiet so the
headlines land.

---

## How to handle the TASK_LOG

At the start of your session, append a "Phase 0 started — [date]" entry
under Active Issues.

After each completed task, move the matching row from Active Issues to
Completed with a one-line outcome and the date.

When the phase is done, append a "Phase 0 complete, awaiting sign-off"
entry under Decisions log.

Do not delete entries. The log is append-only.

---

## How to end the phase

When all tasks pass and the log is updated, post a single summary message
to James in chat with:

1. **Reference URLs.** The three local dev URLs he should visit:
   `/welcome`, `/discover`, `/e/sample-event`. If you deployed to Vercel,
   include the preview URLs too.
2. **Files added or modified.** A list, grouped by directory.
3. **Decisions you made.** Especially type face choice, color hex values,
   headline copy. One sentence each.
4. **Specs you wrote.** Pointers to `OG_IMAGE.md`, `WELCOME_NARRATIVE.md`,
   `BRAND_AUDIT.md`.
5. **One direct ask:** "Phase 0 is ready for your visual review and
   sign-off. Reply with go-ahead and I'll generate the Phase 1 brief."

Then stop.

---

## If you get stuck

- If a task requires a decision you cannot make and the brief does not
  cover it: log the question in `TASK_LOG.md` under a new "Open
  questions" section, pick the most reasonable default, document the
  choice, and continue.
- If a task fails verification: roll back the commit, diagnose, fix, try
  again. Do not paper over a failure.
- If a constraint in this prompt or the task file conflicts with a
  constraint in `CLAUDE.md`: `CLAUDE.md` wins. Log the conflict.

---

## Start

Confirm you have read all referenced documents by writing a one-paragraph
summary of Phase 0's goal in your first message back. Then proceed to
Task P0.0.
