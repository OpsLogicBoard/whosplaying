# Welcome narrative — first 10 seconds

**Status:** Specification (Phase 0). Implementation: Phase 1.
**Owner:** Claude Code at first implementation; James reviews.

This document describes what a brand-new user experiences in the first
ten seconds of opening Who's Playing — what they see, what they feel,
what they do next. It is the human-readable bridge from Phase 0's
design output (the `/welcome` reference composition) to Phase 1's
first-run auth implementation.

The complaint to solve, in James's words: *the design is bland, the
authentication is not user-friendly, and the production is stale*. This
document answers the second half of that complaint.

---

## What they see

The user lands on a clean warm-paper surface. At the top of the screen,
the layered Who's Playing wordmark sits quietly in the header — they
register it without having to read it.

The page opens with a two-line **layered headline** in display type:

> **Live music tonight.**
> **Walk to it.**

The headline carries the brand mechanic — the same words rendered three
times, offset by a small distance, each layer painted in a different
brand color (coral, yellow, teal). The user sees one headline. The eye
registers the layered color underneath. This is the moment the brand
identity lands.

Below the headline, a small mono-typed eyebrow reads **JAX BEACH ·
TUESDAY, JUN 9** — the city and the date, so the user knows
immediately that this is local and current.

Then a single short paragraph in warm body type:

> Sixteen shows up and down the beach this week. Browse before you sign
> in — we'll show you who's playing and where, no account needed.

Below the paragraph, a horizontal strip of **four event cards** for
tonight. Each card carries a brand-palette gradient stand-in for a
photograph, the artist name in display italic, the venue and
neighborhood, the start time in mono, and the distance from a fixed
point in JAX Beach. Each card has a small status pill at the top-left
("Live now" in coral, "Confirmed" in teal).

Below the cards, a single **primary action button** — **See more
tonight** — in coral with the brand offset-yellow shadow. To the right
of that button, two small secondary text links — **I'm an artist** and
**I'm a venue**.

There is no credential field. There is no sign-in button above the
fold. There is no "create your account" call to action. The user has
not been asked for anything except their attention.

---

## What they feel

The product is for them. It already knows where they are (JAX Beach,
tonight). The headline is in plain English — not "Discover local
events" but "Live music tonight. Walk to it." The cards show real-feeling
shows at real-feeling venues. The supporting paragraph is the friend
voice from `docs/BRAND.md`: warm, plain, in the know.

The emotional shift the design is aiming for: relief, then curiosity.
*Oh, I don't have to sign in to see anything? Let me see what's
on tonight.*

The thing the design is explicitly **not** going for: corporate
greeting, value proposition, marketing splash. The Welcome screen is
not selling Who's Playing. The Welcome screen *is* Who's Playing —
"here is what's playing tonight" is the entire pitch, demonstrated
rather than described.

---

## What they do

Three paths forward, only one of which is a sign-in:

**Path 1 — Browse more (no credential).**
The user taps **See more tonight** → lands on `/discover`, the public
discovery view. They see tabs for Tonight, Tomorrow, Weekend; eight
cards per tab; a map preview at the bottom. Still no credential ask.
If they go deeper — tap an event card — they land on the public event
detail page, which renders the shareable composition. Still no
credential ask. The "Follow this artist" and "Save this venue" buttons
on the event page are visible but disabled with a "Sign in to save"
hover label. Soft invitation, no wall.

**Path 2 — I'm an artist / I'm a venue.**
The user taps **I'm an artist** or **I'm a venue** → lands on a role
explainer page (Phase 1 builds this) that describes what artists and
venues do on Who's Playing and ends with a single CTA — **Set up your
profile**. Tapping that CTA opens the auth flow. The auth flow at this
point feels earned: the user has already decided they want to
participate; signing in is the next step, not the gate.

**Path 3 — Save something they saw.**
The user, while browsing, taps **Sign in to save** on a card or event.
The auth flow opens. Apple Sign-In is the first choice on iOS (App
Store rule); Google Sign-In is the first on web and Android; email/
password is the third choice. No magic-link OTP (see CLAUDE.md
gotchas). On success, the user is dropped back exactly where they were
— not into a generic dashboard — with the action they wanted to take
already performed (the artist followed, the venue saved).

---

## Things the Welcome screen explicitly does not do

- It does not display the wordmark at hero size. The layered headline
  *is* the brand moment; the wordmark is small in the header.
- It does not show a hero image or stock photo. The brand-palette
  generative blocks on the event cards carry the visual weight.
- It does not include a "Get the app" banner. The web mirror is a
  first-class surface, not a funnel to the app.
- It does not include marketing copy for venues or artists at the top.
  Those audiences land via the two secondary links and get their own
  page that speaks to them specifically (Phase 1).
- It does not include push notification permission prompts, location
  prompts, or any browser-API prompt until the user has done at least
  one action that justifies it.
- It does not mention the company, the founders, the mission, the
  non-profit status. The product is the pitch.

---

## Phase 1 implementation contract

When Phase 1 wires the real auth flow, the following invariants must
survive:

1. A brand-new user arriving at `/` (or the mobile app's launch screen)
   sees the layered headline + four real tonight cards within the
   first viewport. No credential ask above the fold.
2. **Browse** is reachable without sign-in. `/discover` and
   `/e/<slug>` remain public.
3. The two "secondary" links (artist / venue role explainer) exist and
   end with a soft auth CTA rather than a hard wall.
4. Disabled-but-visible save/follow buttons display a "Sign in to save"
   tooltip rather than auto-opening the auth flow. The user decides
   when to sign in.
5. The auth flow itself uses Apple + Google + email/password. No
   magic-link OTP. Apple is first on iOS; Google is first elsewhere.
6. Post-auth: drop the user back where they were, mid-action, with
   the action completed.

If any of those six points is violated in Phase 1 and there is no
documented reason in `TASK_LOG.md`, the implementation has drifted from
this narrative.
