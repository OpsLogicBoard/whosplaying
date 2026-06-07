# Who's Playing — Coding Agent Prompts
**Last Updated:** 2026-05-09  
**For use with:** Claude Code, Codex, or equivalent AI coding agent

---

## How to Use These Prompts

Each prompt below is designed to be pasted as the opening message to a coding agent at the start of a work session. Always attach or reference the relevant phase task file(s) alongside the prompt.

---

## MASTER CONTEXT PROMPT
*(Include this at the start of every session)*

```
You are the coding agent for Who's Playing (whosplaying.live), a live music discovery platform with two components:
1. A React Native (Expo) mobile app for iOS and Android
2. A Next.js admin web app deployed to admin.whosplaying.live on Vercel
Both share a Supabase backend (fresh project).

Before writing any code:
1. Read README.md for full project context
2. Read TASK_LOG.md and note current phase and status
3. Read STACK.md for the approved tech stack — do not introduce unlisted dependencies without flagging it
4. Read the relevant phase task file(s) for today's work

At the end of every session:
- Update TASK_LOG.md with completed tasks and any new issues discovered
- Note any blockers with their issue ID

Do not make architectural decisions not covered in the documentation. Flag ambiguities before proceeding.
```

---

## PHASE 0 PROMPT

```
Today's work: Phase 0 — Foundation
Reference files: phases/phase-0-foundation/

Task sequence:
1. Read task-0-1-supabase-setup.md — apply the full database schema from architecture/database-schema.md to a new Supabase project. Confirm all tables, triggers, RLS policies, and storage buckets are created.
2. Read task-0-2-nextjs-admin-shell.md — initialize the Next.js admin app with the specified file structure, Supabase auth, and deploy to Vercel.
3. Read task-0-3-expo-app-shell.md — initialize the Expo mobile app with the specified structure, Supabase client, EAS configuration, and role-based navigation.
4. Validate auth end-to-end: admin logs into web dashboard, patron creates account in mobile app.

Environment variables are documented in credentials/setup-guide.md. Ask for values you don't have before proceeding.

Update TASK_LOG.md when complete.
```

---

## PHASE 1 PROMPT

```
Today's work: Phase 1 — Admin Pipeline
Reference files: phases/phase-1-admin-pipeline/
Prerequisite: Phase 0 must be complete and all tasks marked ✅ in TASK_LOG.md

Task sequence:
1. Read task-1-1-chrome-extension.md — build the Chrome MV3 browser extension for Instagram and Facebook event capture. Include auth handshake with admin web app.
2. Read task-1-2-thru-5-dashboard-calendar-n8n-posts.md — build in this order:
   a. Admin capture review queue (/dashboard/captures)
   b. Google Calendar API integration (/api/calendar/push)
   c. Request the n8n workflow export JSON from admin before proceeding with n8n work
   d. Daily post generator (/dashboard/posts)

Note: The admin will need to provide:
- Their existing n8n workflow JSON export
- Their current Instagram post template design (for matching the daily post image)

Flag both as blockers if not provided before starting those sub-tasks.

Update TASK_LOG.md when complete.
```

---

## PHASE 2 PROMPT

```
Today's work: Phase 2 — Artist & Venue Features
Reference files: phases/phase-2-artist-venue/overview-and-tasks.md
Prerequisite: Phase 1 complete

Build in this order to match dependencies:
1. Artist profile onboarding (app screens)
2. Artist event creation + calendar view
3. Double-booking detection (wire up check-double-booking edge function)
4. Conflict resolution UI
5. Venue profile onboarding + calendar
6. OCR calendar capture (camera → Claude Vision → confirmation)
7. Native share sheet with branded event card

For OCR, the Claude API key is in Supabase Edge Function environment variables — do not call Claude API directly from the mobile app client. Route through the Supabase edge function.

Mapbox token is required for Task 3-4 (Phase 3) — request admin to obtain this during Phase 2 work.

Update TASK_LOG.md when complete.
```

---

## PHASE 3 PROMPT

```
Today's work: Phase 3 — Patron Experience
Reference files: phases/phase-3-patron-experience/overview-and-tasks.md
Prerequisite: Phase 2 complete. Live events and profiles must exist in database for testing.

Build in this order:
1. Patron onboarding screens
2. Discovery feed with real event data
3. Weekly calendar view
4. Interactive Mapbox map with venue pins and tonight indicators
5. Follow artist / Follow venue functionality
6. Save event functionality
7. Push notification setup (Expo Push) — wire to dispatch-notifications edge function
8. Event detail screen (complete)

Design note: The patron experience must feel energetic and app-like, not calendar-like. Reference the brand colors in constants/colors.ts. Dark backgrounds, bold typography, pulsing indicators for tonight's events.

Mapbox token must be in environment before starting Task 3-4.

Update TASK_LOG.md when complete.
```

---

## PHASE 4 PROMPT

```
Today's work: Phase 4 — Monetization
Reference files: phases/phase-4-monetization/overview-and-tasks.md
Prerequisite: Phase 3 complete with real users and events

Build in this order:
1. Venue promotion creation + patron display
2. Points system: QR code check-in + points awarding edge function
3. Giveaway system: creation, entry, winner selection edge function
4. Stripe subscription integration for venue marketing tier
5. Meta Graph API cross-posting (only if Meta app approval has been received)

For Stripe: Use Stripe Checkout (hosted) — do not build custom card forms. Server-side only Stripe secret key. Never expose to client.

For Meta API: This requires app review approval that should have been applied for during Phase 2. If not yet approved, skip Task 4-5 and mark as blocked in TASK_LOG.md.

Update TASK_LOG.md when complete.
```

---

## PHASE 5 PROMPT

```
Today's work: Phase 5 — App Store Submission
Reference files: phases/phase-4-monetization/overview-and-tasks.md (Phase 5 section)
Prerequisite: All features complete, tested on real devices

Steps:
1. Run final checklist from Task 5-1. Flag anything missing to admin.
2. Ensure privacy policy and terms of service pages exist at whosplaying.live/privacy and /terms
3. Generate production iOS build: eas build --platform ios --profile production
4. Generate production Android build: eas build --platform android --profile production
5. Submit both via eas submit

Admin must handle:
- Apple Developer Program enrollment (if not done)
- Google Play Console account (if not done)
- App Store Connect: create app record, upload screenshots, write description
- Google Play Console: create app listing, upload screenshots, complete content rating

Provide the admin with a checklist of exactly what they need to do in each store dashboard.

Update TASK_LOG.md when complete and mark project status as ✅ Complete.
```

---

## SINGLE-TASK PROMPT TEMPLATE

For targeted sessions on one specific task:

```
Who's Playing (whosplaying.live) — Single Task Session

Project context: README.md
Stack: STACK.md
Current task log: TASK_LOG.md

Today's specific task: [PASTE TASK NAME AND FILE CONTENTS HERE]

Complete only this task. Do not proceed to the next task without confirmation.
Update TASK_LOG.md on completion.
```
