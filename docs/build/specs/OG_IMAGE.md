# OpenGraph image generation — specification

**Status:** Specification (Phase 0). Implementation: Phase 1.
**Owner:** Claude Code at first implementation; James reviews.

This document describes the deterministic, AI-free pipeline that produces
the shareable preview image for every event and venue page. It is the
input to Phase 1's implementation work. A second engineer (or the same
agent in a separate session) should be able to implement the renderer
from this document alone.

---

## Goals

1. Every event detail page (`/e/<slug>`) exposes a 1200×630 PNG via
   `og:image`. The image renders deterministically — same event, same
   bytes, until the event's `updated_at` changes.
2. Every venue page (`/venue/<slug>`) does the same.
3. The image carries the brand's signature `<LayeredHeadline>` mechanic
   so the share preview reads as "Who's Playing" at a glance, even
   without the wordmark visible.
4. No paid API call. No third-party AI. The renderer composes from event
   data and brand primitives only.

---

## Endpoints

| Path | Returns | Cacheable for |
|---|---|---|
| `/og/event/[id].png` | 1200×630 PNG for event `id` | 24h public, busted by `?v=<updated_at>` |
| `/og/event/[id]/square.png` | 1080×1080 PNG variant for Instagram | same |
| `/og/venue/[slug].png` | 1200×630 PNG for venue `slug` | same |
| `/og/venue/[slug]/square.png` | 1080×1080 PNG variant | same |

The route handlers live at `apps/web/app/og/event/[id]/route.tsx`,
`apps/web/app/og/event/[id]/square/route.tsx`, and the venue equivalents.
Each handler exports `runtime = 'edge'` so the cost stays inside
Vercel's free tier.

The `<link rel="canonical">` event page references the image as
`https://whosplaying.live/og/event/<id>.png?v=<updated_at_iso>`. The
query string is part of the cache key; Vercel's edge cache treats two
distinct query strings as distinct entries, so changing the event title
busts the cache automatically.

---

## Renderer

**Primary choice: `@vercel/og`.**

- Already free on Vercel through unlimited edge function invocations.
- Uses Satori under the hood — composes images from JSX + a subset of
  CSS. Exact subset: see https://github.com/vercel/satori#documentation.
- Returns an `ImageResponse` that Next.js serves with the right
  `content-type`.

**Fallback (if Vercel costs become a concern):** a Cloudflare Worker
running the same Satori instance and reading event data from Supabase
directly. Move is mechanical — the JSX composition is portable; the data
fetch swaps from the Next.js server-side Supabase client to a Worker
fetch.

**Not under consideration:** Puppeteer / Playwright (cold-start cost,
chromium binary size); third-party services like Bannerbear (paid).

---

## Composition

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  ┌──────────────┐    PERFORMER NAME — LayeredHeadline (display)      │
│  │  performer   │    ↳ depth=3, palette derived from event           │
│  │  photo or    │                                                    │
│  │  brand block │    Venue Name · Neighborhood                       │
│  └──────────────┘    Tue · Jun 9 · 8:30 PM                           │
│                                                                      │
│                                                       Who's Playing │
└──────────────────────────────────────────────────────────────────────┘
```

Layout grid (1200×630):

- **Margin:** 60px on all sides.
- **Hero block** (left 40%): a square 480×480 that holds either the
  performer's primary photo (if one is uploaded and approved) or a
  brand-palette generative block (the gradient stand-in used in the
  Phase 0 reference cards). Always rounded `20px`.
- **Headline block** (right 60%): the performer name rendered with
  `<LayeredHeadline>` at size `display`, palette and offset chosen by
  the deterministic palette rule below.
- **Sub-headline:** venue and neighborhood, font-display italic 36px.
- **Timestamp:** the show time in `JetBrains Mono Medium` 28px, in
  `ink.tint-2`. Always lowercase day name + month abbreviation.
- **Brand mark:** "WHO'S PLAYING" in display italic, 22px, in a small
  rounded pill in `paper.tint-2` with `teal.base` fill text. Bottom-right
  corner.

For the square variant (1080×1080), the hero block sits on top, the
headline block fills the bottom half. Same content, restacked.

---

## Deterministic palette selection

Same event must always yield the same palette. Hash the event's `id`
(UUID) to one of four canonical palette sequences:

```ts
const PALETTES = [
  ['teal', 'yellow', 'coral'],     // canonical
  ['orange', 'yellow', 'coral'],   // sunset
  ['coral', 'teal', 'yellow'],     // ocean
  ['yellow', 'coral', 'teal'],     // sunrise
] as const

function paletteFor(id: string) {
  const sum = [...id].reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  return PALETTES[sum % PALETTES.length]
}
```

This stays stable across deploys: the palette for event `abc-123` will
be the same in dev, staging, and prod.

---

## Font loading

Satori requires explicit font fetches — it does not read system fonts.
At edge runtime, each cold start fetches:

1. **Barlow Condensed Black Italic** — `weight: 900, style: italic`.
   From Google Fonts via a pre-fetched static asset committed at
   `apps/web/public/og/fonts/BarlowCondensed-BlackItalic.ttf`.
2. **DM Sans Bold** — `weight: 700`. Static asset at
   `public/og/fonts/DMSans-Bold.ttf`.
3. **JetBrains Mono Medium** — `weight: 500`. Static asset at
   `public/og/fonts/JetBrainsMono-Medium.ttf`.

Committing the .ttf binaries (~80KB each) into `public/og/fonts/` is the
recommended approach because (a) it removes the Google Fonts cold-start
fetch from the critical path, (b) it lets the edge function run with
zero outbound network besides the Supabase data fetch.

The renderer loads them once per cold start with `await fetch(new
URL('./fonts/...', import.meta.url))` and passes the result to the
`ImageResponse` fonts array.

---

## Data fetch

The route handler fetches the event by id from Supabase using the
service-role-less anon client and selects only what the image renders:

```ts
const { data, error } = await supabase
  .from('events')
  .select('id, updated_at, starts_at, title, slug, venue:venues(name, neighborhood), performers:event_performers(artist:artists(name))')
  .eq('id', params.id)
  .single()
```

If the event is not found or RLS denies the read, return a 404 PNG —
1200×630 with `LayeredHeadline` reading "Show not found" in the
canonical palette. Don't return a 404 status code; the share preview
should still show something the recipient can identify.

If the fetch succeeds but `updated_at` doesn't match the `?v=` query
parameter, redirect 302 to the canonical query string. This shields the
cache from stale images when the event is edited between page render
and image fetch.

---

## Caching

```
Cache-Control: public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800
```

24 hours of fresh, 7 days of stale-while-revalidate. Vercel's edge cache
keys on the full URL including query string, so `?v=2026-06-09T...`
naturally invalidates when the event is updated.

The page handler that builds the event detail HTML emits the OG image
URL with the current `updated_at` baked in. Old shares (where someone
posted the image URL with a stale `?v=`) still resolve — they get the
image rendered against whatever the event looked like at that snapshot,
because the renderer fetches by `id` and ignores `?v=` for the actual
data. The `?v=` only exists to bust the edge cache.

---

## Testing

A `/og/preview/event/[id]` *route* (not under `/og/event/`) returns the
same composition wrapped in HTML so the rendered output can be inspected
in a normal browser without dealing with the PNG binary. This route is
gated by `process.env.NODE_ENV !== 'production'` and is the workflow
for iterating on the design.

Visual-regression sanity: in Phase 1, snapshot a curated set of seed
events to `apps/web/public/og/__snapshots__/` and run a CI job that
diffs new renders against the stored snapshots. Pixel-perfect equality
is the goal because rendering is deterministic.

---

## What this spec does NOT cover

- The mobile share sheet. Mobile uses the same image URLs; no
  mobile-specific renderer.
- The artist profile OG image. Add `/og/artist/[slug].png` in a later
  phase using the same renderer; the composition mirrors event with
  artist name as the headline and "Playing at <next venue> on <date>"
  as the sub-headline.
- Localization. Phase 1 ships English only. The renderer uses the
  user-agnostic event data (which is already english-only in the
  database).
- A11y. The image is decorative inside the OG context; the
  `og:image:alt` carries the readable text.

---

## Open questions for Phase 1

1. Is the performer photo guaranteed to be in Supabase Storage, and is
   the bucket public-readable from edge runtime? If not, we need a
   signed-URL flow inside the renderer.
2. Do we want a "live now" badge variant for events that are currently
   in progress? The deterministic-palette rule still holds, but a
   `live-now` overlay would be useful for share-while-playing.
3. Should venue OG images include the *current* event the venue is
   hosting tonight, or just the venue name + map snippet? Phase 1
   decision.
