# Who's Playing — Re-Evaluation & Re-Planning

> Status: living strategy doc. Written 2026-06-13 to re-center the product after
> the frontend/logo thrash made the underlying plan feel lost. The plan was never
> lost — the *execution layer* churned. This document re-establishes the spine.
>
> Source resources reconciled here: this repo (`apps/`, `packages/`, `supabase/`),
> the Supabase project, `CLAUDE.md`, `docs/ROADMAP.md`, `docs/DATA_MODEL.md`, the
> v2 brand package (`docs/Whos_Playing_Corrected_Brand_Implementation_Package_v2/`),
> `design-qa.md`, and the original product brief.

---

## 0. The one idea everything hangs on

**Who's Playing has a chicken-and-egg problem, and the build must be sequenced to
solve it — not to tick off screens.**

- A music-goer opening an empty app leaves and never returns.
- Goers only get value when **artists and venues have already put real events in.**
- Artists and venues only show up if the app is **less work than the calendar/
  social tools they already use** — and if being on it gets them in front of fans.

So the product is really a **two-sided marketplace with a third audience side**.
The build order is therefore:

1. **Make the app radically useful with ZERO of the user's own data** (open, no
   login, real local listings) → this is the demand magnet *and* the proof to
   supply-side that fans are watching.
2. **Make supply-side entry frictionless and migratory** (import, don't author;
   validate, don't recreate) → so artists/venues move their calendar here.
3. **Only then** layer the participatory/social/bidding features that assume a
   populated graph.

Every feature below is tagged with which side it serves and what cold-start job
it does. If a feature doesn't help cold-start, it waits.

---

## 1. The team (seven voices, reconciled by the orchestrator)

Each persona below states their **#1 wish**, their **non-negotiable**, and **what
they'd cut** to keep the app cheap and shippable. The orchestrator's reconciliation
follows in §2.

### Promoter A — books musicians
- **Wish:** see, in one place, every artist's real availability and a way to pitch
  them a date without a 12-text thread.
- **Non-negotiable:** cross-confirmation. A "booked" slot that the artist didn't
  actually accept is worse than no app.
- **Would cut:** public-facing fan social features in v1. "Get the booking loop
  tight first; fans come for the calendar regardless of likes."

### Promoter B — venue management & talent acquisition
- **Wish:** post an open slot and have qualified artists come to *me* (the gig
  board / bidding flow), instead of cold-outreach.
- **Non-negotiable:** venue identity is verified/real (Google Maps validation) so
  bids aren't going to a fake room.
- **Would cut:** native-calendar two-way sync in v1 — "an ICS export feed I can
  subscribe to covers 90% of it for a fraction of the work."

### The Musician — 10+ yrs, solo + 3 bands
- **Wish:** **one profile, many hats.** I am one person who plays solo, sits in
  with two bands, and fronts a third. Do **not** make me maintain four accounts.
- **Non-negotiable:** when a band I'm in posts a gig, it shows on *my* calendar and
  *my* followers see it — without me re-entering it. Tag-and-confirm, not re-author.
- **Would cut:** in-app DMs early — "promoters will text me anyway; give me the
  confirm button and a notification, not a chat client to maintain."

### The Super-Fan — 3–10 shows/week
- **Wish:** "what's on **tonight near me**, right now, in three taps, before I even
  think about an account." Date-range scrubbing like Apple Music's Concerts.
- **Non-negotiable:** it must be open and instant. A login wall on discovery kills it.
- **Would cut:** profile vanity features. "I'll make an account the moment Follow +
  Alert me saves me from missing a show. Not before."

### The Social-Scrubber — non-profit, manual gig-listing today
- **Wish:** stop hand-copying flyers. Let me (or the artist) **import a post / paste
  a flyer / connect an IG** and have a draft event pop out for review.
- **Non-negotiable:** a human-review step before anything goes public — accuracy is
  the whole reputation of the listing.
- **Would cut:** auto-generated social-share graphics in v1 — nice, not load-bearing.

### Venue GM — books independently + via promoters
- **Wish:** my venue's lineup lives in one place that *also* feeds my website and
  the door staff, so I stop maintaining three calendars.
- **Non-negotiable:** I control my venue's public page; staff get scoped access, not
  my owner login.
- **Would cut:** special-event advertising / paid promotion in v1. Revenue later;
  adoption first.

### Venue Hostess — fields "who's playing this week?" calls all day
- **Wish:** a dead-simple, always-current **"this week at our venue" view** I can
  read off to a caller in two seconds, on my phone, without edit rights.
- **Non-negotiable:** it's never stale. If the GM changed it, I see it instantly.
- **Would cut:** literally everything else. "I need a read-only weekly list. That's
  the feature that gets *me* to open the app."

---

## 2. Orchestrator's reconciliation — the unified feature set

Reconciling the seven, three themes dominate and resolve most tensions:

1. **Import / validate / confirm — never author from scratch.** The musician,
   scrubber, and GM all independently asked for this. It's the supply-side unlock
   *and* the data-quality guarantee. This is the product's real moat.
2. **Open, instant, no-login discovery is the demand magnet** and the thing that
   convinces supply-side to participate. Don't gate it.
3. **Profiles and social features are pull, not push** — they earn the signup, they
   don't precede the value.

### Feature ledger

| Feature | Serves | Cold-start job | Verdict |
|---|---|---|---|
| **Tonight / This Week feed, open, geo-aware** | Goers, Hostess | Demand magnet; works empty-ish via seeded listings | **v1 core** |
| **Event detail (open, shareable)** | All | Share target; SEO/OG for inbound | **v1 core** |
| **One artist profile, many band memberships** | Musician | Models reality; avoids account sprawl | **v1 core** (schema already supports — keep Artist ≠ Band) |
| **Event = venue + tagged performers, each confirms** | Promoters, Musician, GM | The trust invariant | **v1 core** (cross-confirmation — never bypass) |
| **Venue page + Google Maps address validation** | GM, Promoter B | Real venues = real bids/trust | **v1 core** |
| **Scoped venue-staff read access (Hostess view)** | Hostess, GM | The single feature that converts a whole venue's staff to daily users | **v1 core** — cheap, high-leverage |
| **Import: paste flyer / connect IG-FB-TikTok → draft event for human review** | Scrubber, Musician, GM | The supply-side unlock | **v1 differentiator** — biggest ROI |
| **Map discovery (poppy, logo-mark pins w/ showtime)** | Goers | Demand magnet, brand moment | **v2** (custom `map-style.json`) |
| **Follow artist/venue + Save + Alerts** | Super-fan | The signup earner | **v2** |
| **ICS export feed (artist + venue calendars)** | GM, Promoter B | 90% of "calendar replacement" at 10% of cost | **v2** — do this *before* native sync |
| **Conflict / double-booking detector** | Promoters, Musician, GM | Trust at scale | **v2** (schema + edge fn exist) |
| **Open gigs + bidding** | Promoter B, Musician | Liquidity once supply exists | **v3** (needs populated graph) |
| **Private messaging (venue↔artist)** | Promoters | Confirm loop — but only if confirm-button + notif isn't enough | **v3** (musician & promoter both said cut early) |
| **Native two-way calendar sync** | GM | Convenience after ICS proves demand | **v3** |
| **Auto social-share graphics, QR sharing** | Scrubber, GM | Growth, not core | **v3** |
| **Special-event advertising / paid promo** | GM | Revenue | **v4** |
| **GPS check-in, Band of the Week, ratings** | Goers | Engagement/retention polish | **v4** |
| **Admin moderation pipeline** | — | superseded scope (`legacy-planning/`) | **excluded** unless asked |

### Tensions resolved
- **DMs vs. confirm-button:** musician and promoter both want the *confirm loop*
  tight, not a chat app. → Ship **invite → notification → one-tap confirm/decline**
  in v1; defer free-text DMs to v3. This is cheaper and matches how they already work.
- **Native calendar sync vs. ICS:** → **ICS export first** (v2). It's a static feed,
  near-zero ongoing cost, and satisfies "replace my calendar" for the GM and promoter.
  Native two-way sync (expo-calendar / Google OAuth) is v3 polish.
- **Author vs. import:** → **import-and-confirm is the default authoring path**, not a
  secondary feature. Manual "Add Event" form stays as the fallback.

---

## 3. Revised roadmap (replaces the screen-checklist framing)

The old `docs/ROADMAP.md` sequenced by *layer* (auth, then rendering, then features).
This re-sequences by *cold-start job*. Keep the old roadmap's launch-prep checklist —
it's still valid.

### Phase 1 — **The empty-app-is-still-useful release** (demand magnet)
Goal: a stranger with no account finds real local music tonight and shares it.
- Open Tonight + This Week feed, geo-aware, no login.
- Open Event Detail with share/OG.
- Read-only Artist & Venue pages.
- **Seed real local events** (this is the scrubber's manual data + a small import
  tool) so the app is never empty on day one.
- Hostess view: scoped read-only "this week at our venue."

### Phase 2 — **The supply-side migration release** (frictionless entry)
Goal: an artist or venue moves their calendar here in under 10 minutes.
- Auth (Google + Apple + email/pw — *not* magic link, per gotchas).
- One-profile-many-bands artist model + venue claim w/ Google Maps validation.
- **Import flow:** paste flyer / connect social → draft event → human review → publish.
- Event = venue + tagged performers; invite → notify → confirm/decline.
- ICS export feeds.

### Phase 3 — **The participatory release** (assumes populated graph)
- Map discovery (poppy brand pins).
- Follow + Save + Alerts (the signup earner for fans).
- Conflict detector surfaced on both sides.
- Open gigs + bidding.
- Free-text DMs.

### Phase 4 — **Growth & revenue**
- Special-event promo, auto share graphics, QR, native calendar sync, check-in,
  Band of the Week, ratings.

---

## 4. Brand reconciliation (DECIDED)

The repo carried **two contradictory brand directions** — this was a root cause of
the logo churn. As of this re-eval, **the v2 "Live Pin" system is canonical** and the
original teal/yellow stacked-shadow language is retired.

| | Original (`CLAUDE.md`, retired) | **v2 — canonical** |
|---|---|---|
| Logo | layered/overlapping type, offset shadows | **Live Pin Lockup** (pin + play + signal waves), stacked `who's/playing` |
| Palette | teal + yellow + coral + orange | Coral `#FF5A5F` primary, Blue, Lime, Purple, Golden on `#F7F8FA`/white |
| Feel | poppy, energetic collage | Apple clarity + Spotify energy + Airbnb friendliness |

**The hard rule that caused the failures** (`09_Codex_Failure_Review.md`): brand-spec
boards (`PRIMARY LOGO`, `COLOR PALETTE`, `TYPOGRAPHY` panels) are **documentation
artifacts** and must **never render inside a production page**. Three artifacts, kept
separate forever:
1. **Brand review board** — design route only.
2. **Logo component** — `full` / `compact` / `mark-only` variants.
3. **Production page** — compact header logo, real content, nothing else.

"Poppy not drab" survives — but it lives in the **map** (custom `map-style.json`,
colorful logo-mark pins) and in **accent color usage**, *not* in a busy logo or a
collage homepage. That reconciles the super-fan's energy ask with the GM/Apple-clarity ask.

`CLAUDE.md` Branding section updated to point here.

---

## 5. Frontend: current state & the detailed changes still needed

`design-qa.md` reports the web homepage + logo lockup now pass (boards removed, logo
compact, hero clean). Treat that as the **floor**, not done. Remaining work:

- **Mobile Tonight screen never got a simulator visual pass** — only typecheck/lint.
  Verify it against the v2 mockup before trusting it.
- Audit **every web page** for stray brand-board artifacts (the failure recurred
  multiple times — make it a lint/QA checklist item, not a one-time fix).
- Build the missing v1 screens (Event Detail, Artist/Venue read pages) **wired to
  Supabase**, never as placeholders (per `CLAUDE.md`).
- Lock the logo component's three variants in `packages/ui/src/brand/` so no future
  pass reinvents it — extend, don't recreate.

---

## 6. Immediate next actions (in order)

1. **Reconcile the brand in code** — confirm `CLAUDE.md` + `docs/BRAND.md` both name
   v2 canonical; ensure the logo component exposes exactly `full`/`compact`/`mark-only`.
2. **Simulator pass on mobile Tonight** — get a real screenshot, fix spacing to mockup.
3. **Build Phase-1 open discovery**: Event Detail + read-only Artist/Venue pages wired
   to live `events`, open to logged-out users.
4. **Seed real local listings** so the app is never empty (scrubber's data + a thin
   import helper) — this is what makes the demo land.
5. *Then* start Phase 2 supply-side (import flow is the headline feature).

---

## Appendix — what did NOT change
- Cross-confirmation invariant. Untouched, sacred.
- Artist ≠ Band entity separation. Untouched.
- Single-tenant (no subdomain routing), Supabase, Expo + Next, pnpm/Turbo stack.
- The Supabase gotchas in `CLAUDE.md` (grants, redirect URLs, search_path, PKCE).
- Excluded admin-pipeline scope (`legacy-planning/`).
