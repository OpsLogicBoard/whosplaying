-- WhosPlaying — initial schema
-- All tables are public. RLS is enabled in 0002_rls.sql.

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- ============================================================
-- Profiles + roles
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  home_city text,
  bio text check (length(bio) <= 500),
  created_at timestamptz not null default now()
);

create type public.app_role as enum ('artist', 'venue_owner', 'venue_staff', 'goer');

create table public.user_roles (
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.app_role not null,
  granted_at timestamptz not null default now(),
  primary key (user_id, role)
);

-- ============================================================
-- Artists + Bands
-- ============================================================
create table public.artists (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  slug text not null unique,
  stage_name text not null,
  bio text check (length(bio) <= 800),
  genres text[] not null default '{}',
  home_city text,
  hero_image_url text,
  socials jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index on public.artists (owner_user_id);

create table public.bands (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  bio text check (length(bio) <= 800),
  genres text[] not null default '{}',
  home_city text,
  hero_image_url text,
  socials jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.band_members (
  band_id uuid not null references public.bands(id) on delete cascade,
  artist_id uuid not null references public.artists(id) on delete cascade,
  role text,
  is_admin boolean not null default false,
  joined_at timestamptz not null default now(),
  primary key (band_id, artist_id)
);
create index on public.band_members (artist_id);

-- ============================================================
-- Venues + staff
-- ============================================================
create table public.venues (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references public.profiles(id) on delete set null,
  slug text not null unique,
  name text not null,
  description text check (length(description) <= 800),
  address text not null,
  city text not null,
  region text not null,
  postal_code text,
  lat double precision not null check (lat between -90 and 90),
  lng double precision not null check (lng between -180 and 180),
  capacity int check (capacity > 0),
  hero_image_url text,
  socials jsonb not null default '{}'::jsonb,
  ics_feed_url text,
  is_verified boolean not null default false,
  created_at timestamptz not null default now()
);
create index on public.venues using gist (
  ll_to_earth(lat, lng) -- requires earthdistance, harmless if missing — drop if not installed
) where false; -- placeholder; switch to PostGIS in a later migration

create type public.venue_staff_role as enum ('manager', 'staff', 'booker');

create table public.venue_staff (
  venue_id uuid not null references public.venues(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.venue_staff_role not null,
  can_answer_questions boolean not null default true,
  primary key (venue_id, user_id)
);
create index on public.venue_staff (user_id);

-- ============================================================
-- Events + cross-confirmation
-- ============================================================
create type public.event_status as enum ('draft', 'proposed', 'confirmed', 'cancelled');
create type public.performer_type as enum ('artist', 'band');
create type public.performer_status as enum ('invited', 'confirmed', 'declined');

create table public.events (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  title text not null,
  description text check (length(description) <= 2000),
  starts_at timestamptz not null,
  ends_at timestamptz,
  cover_image_url text,
  ticket_url text,
  is_special boolean not null default false,
  status public.event_status not null default 'draft',
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  check (ends_at is null or ends_at >= starts_at)
);
create index on public.events (venue_id, starts_at);
create index on public.events (starts_at);

create table public.event_performers (
  event_id uuid not null references public.events(id) on delete cascade,
  performer_type public.performer_type not null,
  performer_id uuid not null,
  billing_order int not null default 0,
  status public.performer_status not null default 'invited',
  fee_cents int check (fee_cents >= 0),
  primary key (event_id, performer_type, performer_id)
);
create index on public.event_performers (performer_type, performer_id);

-- ============================================================
-- Gig board (open gigs venues post, artists bid on)
-- ============================================================
create type public.gig_status as enum ('open', 'filled', 'cancelled');
create type public.bid_status as enum ('pending', 'shortlisted', 'accepted', 'rejected', 'withdrawn');

create table public.gig_listings (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  title text not null,
  description text check (length(description) <= 2000),
  starts_at timestamptz not null,
  ends_at timestamptz,
  pay_low_cents int check (pay_low_cents >= 0),
  pay_high_cents int check (pay_high_cents >= 0),
  requirements text check (length(requirements) <= 1000),
  status public.gig_status not null default 'open',
  closes_at timestamptz,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  check (pay_high_cents is null or pay_low_cents is null or pay_high_cents >= pay_low_cents)
);
create index on public.gig_listings (status, starts_at);

create table public.gig_bids (
  id uuid primary key default gen_random_uuid(),
  gig_listing_id uuid not null references public.gig_listings(id) on delete cascade,
  bidder_type public.performer_type not null,
  bidder_id uuid not null,
  message text check (length(message) <= 800),
  proposed_fee_cents int check (proposed_fee_cents >= 0),
  status public.bid_status not null default 'pending',
  created_at timestamptz not null default now(),
  unique (gig_listing_id, bidder_type, bidder_id)
);
create index on public.gig_bids (gig_listing_id);

-- ============================================================
-- Follows + saves
-- ============================================================
create type public.follow_target as enum ('artist', 'band', 'venue');

create table public.follows (
  follower_user_id uuid not null references public.profiles(id) on delete cascade,
  target_type public.follow_target not null,
  target_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (follower_user_id, target_type, target_id)
);
create index on public.follows (target_type, target_id);

create table public.event_saves (
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, event_id)
);

-- ============================================================
-- Messaging
-- ============================================================
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete set null,
  gig_listing_id uuid references public.gig_listings(id) on delete set null,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);

create table public.conversation_participants (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role_at_join text not null,
  joined_at timestamptz not null default now(),
  last_read_at timestamptz,
  primary key (conversation_id, user_id)
);
create index on public.conversation_participants (user_id);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_user_id uuid not null references public.profiles(id),
  body text not null check (length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);
create index on public.messages (conversation_id, created_at);

-- ============================================================
-- Conflicts
-- ============================================================
create type public.conflict_kind as enum ('venue_double_book', 'performer_double_book');
create type public.conflict_subject as enum ('venue', 'artist', 'band');

create table public.conflict_flags (
  id uuid primary key default gen_random_uuid(),
  kind public.conflict_kind not null,
  event_a_id uuid not null references public.events(id) on delete cascade,
  event_b_id uuid not null references public.events(id) on delete cascade,
  subject_type public.conflict_subject not null,
  subject_id uuid not null,
  detected_at timestamptz not null default now(),
  resolved_at timestamptz,
  check (event_a_id < event_b_id),
  unique (kind, event_a_id, event_b_id, subject_type, subject_id)
);
create index on public.conflict_flags (subject_type, subject_id) where resolved_at is null;

-- ============================================================
-- Push device tokens
-- ============================================================
create type public.device_platform as enum ('ios', 'android', 'web');

create table public.device_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  platform public.device_platform not null,
  token text not null,
  created_at timestamptz not null default now(),
  unique (user_id, token)
);

-- ============================================================
-- Auto-create profile on auth signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  insert into public.user_roles (user_id, role) values (new.id, 'goer');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
