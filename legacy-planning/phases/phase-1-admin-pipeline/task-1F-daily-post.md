# Task 1F — Daily Post Generator
**Phase:** 1 — Admin Pipeline (Step F)
**Status:** 🔲 Not Started
**Depends on:** 1A (schema), 1D (events being created/approved), 1E (push notifications)

---

## Objective

Render the daily Instagram post image automatically each afternoon. New approach: one branded background per weekday + Satori-overlaid event list. No more per-event Canva slides.

---

## Sub-tasks

### 1F.1 — Admin provides template assets (Admin)
- 7 background images (one per weekday) at 1080×1350 (Instagram portrait)
- Brand colors (hex)
- Header font + body font (web-safe or Google Fonts)
- Reference images of current Canva posts so the look is preserved
- Drop in `/Users/JW/whosplaying/assets/post-templates/`

### 1F.2 — Build Satori template
- File: `apps/admin/lib/post-template.tsx`
- Exports a function `renderPostJSX({ date, events, page })` returning React/JSX (not DOM-rendered — Satori wants raw nodes)
- Layout:
  - Background image (loaded from Storage URL)
  - Top overlay: "THURSDAY · MAY 15" — large weekday + date
  - Body: vertical list, each row formatted exactly like the example post:
    ```
    • 5 – 8 PM · Robby @ Palm Valley Outdoors
    ```
  - Late-night sub-header (events ≥ 21:00) styled distinctly
  - Footer: "@whosplayingjaxbeach · whosplaying.live"
- Pagination: if Satori reports overflow, render page 2/3 with "(continued)" subheader

### 1F.3 — `generate-daily-post` edge function
Spec: `architecture/edge-functions.md` → "generate-daily-post".
- File: `supabase/functions/generate-daily-post/index.ts`
- Pipeline: SQL query → render JSX → satori → resvg-js → PNG → Storage upload → upsert `post_templates`
- Smoke test: invoke for a date with known events, download PNG, eyeball it

### 1F.4 — `/post` preview page
- File: `apps/admin/app/post/page.tsx`
- Shows today's generated PNG(s) (or "Not generated yet — Generate now" button)
- Download All button (works on mobile Safari — uses anchor `download` attribute)
- "Mark as posted" toggle → writes `post_templates.posted_at = now()`
- History: past 7 days of generated posts

### 1F.5 — `whosplaying:generate-post` Cowork Skill
Spec: `architecture/cowork-skills.md` → "whosplaying:generate-post".
- File: `.claude/skills/whosplaying/generate-post/SKILL.md`
- Calls `generate-daily-post`, then sends digest push with `auto_publish_log` summary

### 1F.6 — Schedule the Skill
```
mcp__scheduled-tasks__create_scheduled_task name="whosplaying-daily-post" cron="0 16 * * *" tz="America/New_York" skill="whosplaying:generate-post"
```

---

## Validation Checklist

- [ ] Background images uploaded to Storage `post-templates/template-{weekday}.png`
- [ ] `generate-daily-post` deployed; manual run produces a PNG that visually matches Canva reference
- [ ] PNG dimensions correct (1080×1350)
- [ ] Pagination triggers correctly at >12 events (test with synthetic data)
- [ ] `/post` page shows preview + download works on iPhone Safari
- [ ] Skill scheduled and visible in `list_scheduled_tasks`
- [ ] Daily 4 PM push notification arrives with correct counts and deep-link

---

## Update Task Log

Mark 1.F1–1.F6 complete.
