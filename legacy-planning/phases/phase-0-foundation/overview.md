# Phase 0 — Foundation
**Who's Playing | whosplaying.live**  
**Goal:** Both application shells deployed and connected to Supabase. Auth working. No features yet — just the plumbing.  
**Estimated Duration:** 1–2 sessions  
**Status:** 🔲 Not Started

---

## Deliverables

By the end of Phase 0:
- Supabase project live with full schema applied
- Next.js admin app deployed to `admin.whosplaying.live` on Vercel
- Expo app running on simulator with Supabase connected
- Auth flow working: admin can log in to web dashboard, patron can log in to app
- All environment variables configured

---

## Tasks in This Phase

| File | Task |
|---|---|
| `task-0-1-supabase-setup.md` | Create project, apply schema, configure auth and storage |
| `task-0-2-nextjs-admin-shell.md` | Initialize admin web app, deploy to Vercel |
| `task-0-3-expo-app-shell.md` | Initialize Expo app, configure EAS |
| `task-0-4-auth-validation.md` | Validate end-to-end auth across both apps |

---

## Dependencies

- Supabase account (supabase.com)
- Vercel account (vercel.com)
- Expo account (expo.dev)
- GitHub repository created and accessible

---

## Phase Gate

Do not begin Phase 1 until:
- [ ] Admin can log in to `admin.whosplaying.live`
- [ ] Patron can create account and log in to Expo app
- [ ] Database schema fully applied with no errors
- [ ] All Supabase storage buckets created
- [ ] TASK_LOG.md Phase 0 tasks marked ✅
