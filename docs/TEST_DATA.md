# Test Data — live Supabase project (`pakzhnwumihecyfcjfln`)

**This is throwaway development data, isolated and purgeable. It is NOT real
content and must be removed before launch / public representation.**

The public representation lives in the **static mockup** at
`whosplaying-mockup.vercel.app` (deploys `docs/design/`, no Supabase) — that
surface is untouched by anything here. This file tracks only the dev fixtures
seeded into the real app's database while wiring screens to live data.

## Why it exists
The real app's data hooks (`useEvents`, etc.) need rows to render. The DB was
empty, so a single self-contained fixture set was seeded under one test org so
it stays identifiable and removable in one shot.

## Inventory (all traceable to one test user / org)

| Entity | Identifier |
|---|---|
| Auth user | `wp-billingtest@example.com` / `TestVenue123!` — id `e3fd40a7-7d88-4150-8308-75e0d2919e69` |
| Organization | `b9c3bdad-716b-4957-81f0-dbcc89a90f75` (auto-created with the venue) |
| Venue | `The Test Tap Room` — slug `wp-test-venue`, id `98d0b1cf-7f32-42da-9279-9f8f863dec95` |
| Subscription / entitlements | free plan, 9 entitlements (auto-materialized) |
| Events | seeded (Firewater / Chloe Kimes / Low Tide) + app-created (e.g. "Acoustic Sunday Session") under the test venue |
| Artist | "The Tide Walkers" (created via the app, `owner_user_id` = test user) |
| Follows / gigs / profile | a follow, an open gig, and the profile (now "Jordan Vega") — all under the test user |

Everything above is owned by / FK-linked to the one test user, so the teardown
is a single cascade from that identity (events/gigs cascade from the venue;
artists/follows/profile cascade from the user). Created partly by `execute_sql`
seeding and partly by normal app use while verifying the build on the simulator.

## Teardown (run via Supabase MCP `execute_sql` or psql)

```sql
-- Delete in FK-safe order. Venue/org cascades handle events, members,
-- subscriptions, entitlements, etc. via ON DELETE CASCADE.
delete from public.venues        where owner_user_id = 'e3fd40a7-7d88-4150-8308-75e0d2919e69';
delete from public.organizations where owner_user_id = 'e3fd40a7-7d88-4150-8308-75e0d2919e69';
delete from auth.users           where id            = 'e3fd40a7-7d88-4150-8308-75e0d2919e69';
```

If you add more dev fixtures, attach them to this same test user so this
teardown stays the single source of truth.
