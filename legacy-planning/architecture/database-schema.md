# Who's Playing — Database Schema
**Platform:** Supabase (PostgreSQL)  
**Last Updated:** 2026-05-11

> **Phase 1 redesign additions (2026-05-11):** new tables
> `recurring_rules`, `venue_canonical`, `artist_canonical`,
> `capture_sources`, `settings`, plus columns on `social_captures`
> (`flag`, `match_rule_id`, `vision_confidence`) and `events`
> (`auto_approved`, `recurring_rule_id`, `google_calendar_event_id`).

---

## Instructions for Coding Agent

Apply this schema in order. All SQL is ready to run in the Supabase SQL editor or via migration files. Enable the `pg_cron` and `pg_net` extensions before running.

---

## Extensions

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";
CREATE EXTENSION IF NOT EXISTS "pg_net";
```

---

## Enums

```sql
CREATE TYPE user_role AS ENUM ('admin', 'artist', 'venue', 'patron');
CREATE TYPE event_status AS ENUM ('draft', 'pending', 'approved', 'rejected', 'cancelled');
CREATE TYPE capture_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE capture_flag AS ENUM ('clean', 'unknown_venue', 'unknown_artist', 'low_confidence', 'duplicate', 'out_of_area');
CREATE TYPE capture_source_type AS ENUM ('instagram_account', 'facebook_page', 'venue_website', 'bandsintown_artist', 'extension', 'dm_bot');
CREATE TYPE conflict_status AS ENUM ('detected', 'acknowledged', 'resolved', 'collaboration');
CREATE TYPE promo_type AS ENUM ('drink_special', 'free_entry', 'giveaway', 'special_event');
```

---

## Core Tables

### profiles
Extends Supabase auth.users. Created automatically on user signup via trigger.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'patron',
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  website_url TEXT,
  instagram_handle TEXT,
  facebook_url TEXT,
  tiktok_handle TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### artists
```sql
CREATE TABLE artists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stage_name TEXT NOT NULL,
  genres TEXT[] DEFAULT '{}',
  band_members TEXT[],
  spotify_url TEXT,
  apple_music_url TEXT,
  youtube_url TEXT,
  soundcloud_url TEXT,
  booking_email TEXT,
  booking_phone TEXT,
  is_solo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### venues
```sql
CREATE TABLE venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  venue_name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'FL',
  zip TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  capacity INTEGER,
  venue_type TEXT,
  phone TEXT,
  website_url TEXT,
  cover_image_url TEXT,
  has_live_music BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Events

### events
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  is_free BOOLEAN DEFAULT FALSE,
  cover_charge DECIMAL(6,2),
  event_image_url TEXT,
  status event_status NOT NULL DEFAULT 'pending',
  is_public BOOLEAN DEFAULT FALSE,
  publish_at TIMESTAMPTZ,
  source TEXT DEFAULT 'manual',
  social_capture_id UUID,
  -- Phase 1 redesign columns
  auto_approved BOOLEAN DEFAULT FALSE,                 -- TRUE if matched a recurring_rule
  recurring_rule_id UUID,                              -- references recurring_rules(id) if auto-approved
  google_calendar_event_id TEXT,                       -- returned by Calendar API for idempotent updates/deletes
  created_by UUID REFERENCES profiles(id),
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### event_artists
Junction table linking events to one or more artists.

```sql
CREATE TABLE event_artists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  is_headliner BOOLEAN DEFAULT FALSE,
  set_time TIME,
  UNIQUE(event_id, artist_id)
);
```

### booking_conflicts
```sql
CREATE TABLE booking_conflicts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL REFERENCES artists(id),
  event_id_a UUID NOT NULL REFERENCES events(id),
  event_id_b UUID NOT NULL REFERENCES events(id),
  conflict_status conflict_status NOT NULL DEFAULT 'detected',
  collaboration_confirmed BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Admin Capture

### social_captures
Stores raw data captured by the Chrome extension before admin review.

```sql
CREATE TABLE social_captures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  captured_by UUID REFERENCES profiles(id),                -- nullable: scheduled sweep has no user
  capture_source_id UUID,                                   -- FK to capture_sources(id), added by ALTER below (forward reference)
  source_platform TEXT NOT NULL,
  source_url TEXT,
  source_post_id TEXT,                                      -- platform-native post id, used for dedup
  raw_text TEXT,
  screenshot_url TEXT,
  parsed_artist TEXT,
  parsed_venue TEXT,
  parsed_date DATE,
  parsed_start_time TIME,
  parsed_end_time TIME,
  parsed_confidence DECIMAL(3,2),
  vision_confidence DECIMAL(3,2),                           -- separate score for image-only parses
  flag capture_flag DEFAULT 'clean',                        -- routing hint for the queue UI
  match_rule_id UUID,                                       -- references recurring_rules(id) if matched
  capture_status capture_status NOT NULL DEFAULT 'pending',
  event_id UUID REFERENCES events(id),
  captured_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  UNIQUE (source_platform, source_post_id)                  -- prevents same post being captured twice
);
```

---

---

## Canonical Lists & Automation (Phase 1 redesign)

These tables back the recurring-event auto-approve and the deterministic
capture pipeline. The two `_canonical` tables are a **cached mirror** of
the admin's Google Sheets — refreshed nightly by the `sheets-sync` edge
function. The Sheets are the source of truth; the admin edits there.

### venue_canonical
```sql
CREATE TABLE venue_canonical (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sheet_row_id INTEGER NOT NULL UNIQUE,        -- row number in the venues Sheet
  canonical_name TEXT NOT NULL,                -- "Palm Valley Outdoors"
  short_name TEXT,                             -- "PVO" — used in compact post format
  aliases TEXT[] DEFAULT '{}',                 -- ["PVO", "Palm Valley Outdoor", "@palmvalleyoutdoors"]
  ig_handle TEXT,
  fb_handle TEXT,
  website_url TEXT,
  address TEXT,
  city TEXT DEFAULT 'Ponte Vedra Beach',
  zip TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  is_in_area BOOLEAN DEFAULT TRUE,             -- inside Mayport→202 boundary?
  is_active BOOLEAN DEFAULT TRUE,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_venue_canonical_aliases ON venue_canonical USING GIN(aliases);
CREATE INDEX idx_venue_canonical_handles ON venue_canonical(ig_handle, fb_handle);
```

### artist_canonical
```sql
CREATE TABLE artist_canonical (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sheet_row_id INTEGER NOT NULL UNIQUE,
  canonical_name TEXT NOT NULL,
  aliases TEXT[] DEFAULT '{}',
  ig_handle TEXT,
  is_band BOOLEAN DEFAULT FALSE,
  members TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_artist_canonical_aliases ON artist_canonical USING GIN(aliases);
```

### recurring_rules
The "approve once, auto-publish forever" engine. A rule matches a
capture when normalized artist + normalized venue + day-of-week align,
and the parsed start time falls inside `[start_window_min, start_window_max]`.

```sql
CREATE TABLE recurring_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_canonical_id UUID NOT NULL REFERENCES artist_canonical(id) ON DELETE CASCADE,
  venue_canonical_id UUID NOT NULL REFERENCES venue_canonical(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),  -- 0 = Sunday
  start_window_min TIME NOT NULL,              -- e.g. 11:30
  start_window_max TIME NOT NULL,              -- e.g. 12:30
  default_end_time TIME,                       -- inferred from past occurrences
  is_active BOOLEAN DEFAULT TRUE,
  paused_until DATE,                           -- one-tap "pause this rule for X days" kill switch
  occurrences_seen INTEGER DEFAULT 0,          -- rolling count, helps confidence
  last_matched_at TIMESTAMPTZ,
  created_from TEXT DEFAULT 'ics_seed',        -- 'ics_seed' | 'admin_promoted'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (artist_canonical_id, venue_canonical_id, day_of_week, start_window_min)
);
CREATE INDEX idx_recurring_rules_active ON recurring_rules(is_active, day_of_week);
```

### capture_sources
Drives the scheduled sweep. Each row is one IG account, FB page, venue
website, or Bandsintown artist to check.

```sql
CREATE TABLE capture_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_type capture_source_type NOT NULL,
  target TEXT NOT NULL,                        -- handle, URL, or artist id
  display_name TEXT,
  venue_canonical_id UUID REFERENCES venue_canonical(id),  -- if this source maps to a known venue
  is_active BOOLEAN DEFAULT TRUE,
  last_swept_at TIMESTAMPTZ,
  last_capture_count INTEGER DEFAULT 0,
  consecutive_empty_sweeps INTEGER DEFAULT 0,  -- auto-disable after N empties
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (source_type, target)
);
CREATE INDEX idx_capture_sources_active ON capture_sources(is_active, source_type);

-- Resolve forward references declared earlier
ALTER TABLE social_captures
  ADD CONSTRAINT social_captures_capture_source_fkey
  FOREIGN KEY (capture_source_id) REFERENCES capture_sources(id) ON DELETE SET NULL;

ALTER TABLE social_captures
  ADD CONSTRAINT social_captures_match_rule_fkey
  FOREIGN KEY (match_rule_id) REFERENCES recurring_rules(id) ON DELETE SET NULL;

ALTER TABLE events
  ADD CONSTRAINT events_recurring_rule_fkey
  FOREIGN KEY (recurring_rule_id) REFERENCES recurring_rules(id) ON DELETE SET NULL;
```

### settings
Single-row admin configuration (kill switches and tunables).

```sql
CREATE TABLE settings (
  id BOOLEAN PRIMARY KEY DEFAULT TRUE,         -- always TRUE; ensures single row
  auto_approve_enabled BOOLEAN DEFAULT TRUE,   -- master kill switch for recurring auto-publish
  scheduled_sweep_enabled BOOLEAN DEFAULT TRUE,
  sweep_morning_time TIME DEFAULT '08:00',
  sweep_afternoon_time TIME DEFAULT '15:00',
  post_generation_time TIME DEFAULT '16:00',
  digest_push_time TIME DEFAULT '16:15',
  min_vision_confidence DECIMAL(3,2) DEFAULT 0.70,
  push_subscription_json JSONB,                -- web-push subscription for admin's phone
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (id = TRUE)
);
INSERT INTO settings (id) VALUES (TRUE) ON CONFLICT DO NOTHING;
```

### auto_publish_log
Daily roll-up that backs the 4 PM digest push notification. Each row =
one event auto-pushed to Google Calendar without admin review.

```sql
CREATE TABLE auto_publish_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  recurring_rule_id UUID REFERENCES recurring_rules(id),
  social_capture_id UUID REFERENCES social_captures(id),
  google_calendar_event_id TEXT,
  digest_date DATE NOT NULL,                   -- groups events for the same daily digest
  undone_at TIMESTAMPTZ,                       -- set when admin one-tap-undoes
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_auto_publish_log_digest ON auto_publish_log(digest_date) WHERE undone_at IS NULL;
```

---

## Patron Interactions

### follows
```sql
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patron_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (
    (artist_id IS NOT NULL AND venue_id IS NULL) OR
    (artist_id IS NULL AND venue_id IS NOT NULL)
  )
);
```

### saved_events
```sql
CREATE TABLE saved_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patron_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(patron_id, event_id)
);
```

### checkins
```sql
CREATE TABLE checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patron_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  checked_in_at TIMESTAMPTZ DEFAULT NOW(),
  points_earned INTEGER DEFAULT 0,
  UNIQUE(patron_id, event_id)
);
```

---

## Monetization

### promotions
```sql
CREATE TABLE promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  promo_type promo_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  terms TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### patron_points
```sql
CREATE TABLE patron_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patron_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(patron_id, venue_id)
);
```

### giveaways
```sql
CREATE TABLE giveaways (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id),
  title TEXT NOT NULL,
  prize_description TEXT NOT NULL,
  max_entries INTEGER,
  ends_at TIMESTAMPTZ NOT NULL,
  winner_id UUID REFERENCES profiles(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE giveaway_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  giveaway_id UUID NOT NULL REFERENCES giveaways(id) ON DELETE CASCADE,
  patron_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  entered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(giveaway_id, patron_id)
);
```

---

## Notifications

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Automation

### post_templates
Stores generated daily post images for admin download/upload.

```sql
CREATE TABLE post_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_date DATE NOT NULL,
  image_urls TEXT[] DEFAULT '{}',
  event_count INTEGER DEFAULT 0,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  downloaded_at TIMESTAMPTZ,
  posted_at TIMESTAMPTZ
);
```

---

## Triggers & Functions

### Auto-create profile on signup
```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'patron')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### Auto-set publish_at on event create
```sql
CREATE OR REPLACE FUNCTION set_publish_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.publish_at IS NULL THEN
    NEW.publish_at := (NEW.event_date - INTERVAL '7 days');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_event_publish_at
  BEFORE INSERT ON events
  FOR EACH ROW EXECUTE FUNCTION set_publish_at();
```

### Auto-publish events at publish_at
```sql
SELECT cron.schedule(
  'auto-publish-events',
  '0 * * * *',
  $$
    UPDATE events
    SET is_public = TRUE
    WHERE is_public = FALSE
      AND status = 'approved'
      AND publish_at <= NOW();
  $$
);
```

---

## Row Level Security Policies

```sql
-- Profiles: viewable by all, editable by owner or admin
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_public_read" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_owner_write" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Events: public events readable by all
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events_public_read" ON events FOR SELECT USING (is_public = TRUE OR auth.uid() = created_by);
CREATE POLICY "events_artist_insert" ON events FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "events_admin_all" ON events FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Social captures: admin only
ALTER TABLE social_captures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "captures_admin_only" ON social_captures FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Canonical lists, recurring rules, sources, settings, audit log: admin only
ALTER TABLE venue_canonical ENABLE ROW LEVEL SECURITY;
CREATE POLICY "venue_canonical_admin_only" ON venue_canonical FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

ALTER TABLE artist_canonical ENABLE ROW LEVEL SECURITY;
CREATE POLICY "artist_canonical_admin_only" ON artist_canonical FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

ALTER TABLE recurring_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "recurring_rules_admin_only" ON recurring_rules FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

ALTER TABLE capture_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "capture_sources_admin_only" ON capture_sources FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings_admin_only" ON settings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

ALTER TABLE auto_publish_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auto_publish_log_admin_only" ON auto_publish_log FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Follows, saves, checkins: patron owns their own
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "follows_owner" ON follows FOR ALL USING (auth.uid() = patron_id);

ALTER TABLE saved_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "saved_events_owner" ON saved_events FOR ALL USING (auth.uid() = patron_id);

ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "checkins_owner_read" ON checkins FOR SELECT USING (auth.uid() = patron_id);
CREATE POLICY "checkins_owner_insert" ON checkins FOR INSERT WITH CHECK (auth.uid() = patron_id);
```

---

## Indexes

```sql
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_venue ON events(venue_id);
CREATE INDEX idx_events_status_public ON events(status, is_public);
CREATE INDEX idx_events_recurring_rule ON events(recurring_rule_id) WHERE recurring_rule_id IS NOT NULL;
CREATE INDEX idx_event_artists_event ON event_artists(event_id);
CREATE INDEX idx_event_artists_artist ON event_artists(artist_id);
CREATE INDEX idx_follows_patron ON follows(patron_id);
CREATE INDEX idx_social_captures_status ON social_captures(capture_status);
CREATE INDEX idx_social_captures_flag ON social_captures(flag) WHERE capture_status = 'pending';
CREATE INDEX idx_social_captures_source ON social_captures(capture_source_id, captured_at);
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, is_read);
```
