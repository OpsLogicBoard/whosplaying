-- Demo data so the screens have something to render in local dev.
-- Two venues, three solo artists, one band, two upcoming events, one open gig.

-- Note: profile rows depend on auth.users existing. For local dev, sign up
-- two test users first (e.g. via the Studio Auth tab), then re-run seed.

insert into public.venues (id, slug, name, description, address, city, region, lat, lng, capacity, is_verified)
values
  ('11111111-1111-1111-1111-111111111111', 'sandbar-jax-beach', 'The Sandbar', 'Open-air beachfront bar with weekly live music.', '100 Atlantic Blvd', 'Jacksonville Beach', 'FL', 30.2890, -81.3920, 220, true),
  ('22222222-2222-2222-2222-222222222222', 'riverside-listening-room', 'Riverside Listening Room', 'Intimate seated venue prioritizing singer-songwriters.', '450 Margaret St', 'Jacksonville', 'FL', 30.3220, -81.6810, 90, true)
on conflict (id) do nothing;

insert into public.bands (id, slug, name, bio, genres, home_city)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'palm-row', 'Palm Row', 'Coastal indie three-piece.', array['indie', 'surf-rock'], 'Jacksonville')
on conflict (id) do nothing;
