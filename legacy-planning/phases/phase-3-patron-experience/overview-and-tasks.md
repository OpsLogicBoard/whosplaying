# Phase 3 — Patron Experience
**Who's Playing | whosplaying.live**  
**Goal:** Build the consumer-facing app experience that drives engagement and repeat visits. This is the product patrons download, use daily, and share with friends.  
**Estimated Duration:** 3–4 sessions  
**Status:** 🔲 Not Started  
**Depends on:** Phase 2 complete (need live events and profiles to display)

---

## Design Principle

The patron experience must feel alive, energetic, and fun. Think "concert poster meets social app." Dark backgrounds, bold colors, music energy. Not a calendar app — an experience app.

Reference mood: bold typography, venue map with glowing pins, pulsing "LIVE NOW" indicators, swipeable cards.

---

# Task 3-1: Patron Onboarding
**Status:** 🔲 Not Started

## Screens

### Welcome Screen
- Who's Playing logo animation
- "Find Live Music Near You" tagline
- "Get Started" → Sign Up
- "I already have an account" → Log In

### Sign Up
- Name
- Email + Password OR "Continue with Google" OR "Continue with Apple"
- Location permission request (used for local events default)

### Interest Setup (optional, skippable)
- "What music do you love?" — multi-select genre chips
- "Follow your favorites" — suggested artists and venues based on location
- Skip → discovery feed shows all

### Role assignment
- New patrons auto-assigned `role = 'patron'` in profiles table
- Artist and venue roles available only via separate onboarding flow (accessed from settings)

---

# Task 3-2: Discovery Feed
**Status:** 🔲 Not Started

## Design
- Card-based vertical scroll feed
- Cards show: artist photo, event date/time, venue name, distance from user, follow button
- "Today" events appear first with "🔴 TONIGHT" badge
- Followed artists/venues appear at top of feed with priority
- Filter bar: All | Tonight | This Week | Near Me | Followed

## Event Card Component
```
┌─────────────────────────────────┐
│  [Artist Photo]   TONIGHT 8PM   │
│  Dustin Bradley                 │
│  @ Slider's — Neptune Beach     │
│  0.4 mi away    🎸 Country      │
│  [♡ Save]  [➡ Share]  [+ Follow]│
└─────────────────────────────────┘
```

## Data Query
```typescript
// Personalized feed
const { data: events } = await supabase
  .from('events')
  .select(`
    *,
    venues(*),
    event_artists(*, artists(*))
  `)
  .eq('is_public', true)
  .eq('status', 'approved')
  .gte('event_date', today)
  .order('event_date', { ascending: true })
  .limit(50)
```

---

# Task 3-3: Weekly Calendar View
**Status:** 🔲 Not Started

## Design
- Horizontal week strip at top (swipe left/right to advance week)
- Selected day shows event list below
- Each event: Time | Artist @ Venue
- Saved events highlighted with accent color
- Tap event → Event Detail Screen

## Implementation
Use `react-native-calendar-strip` or build custom horizontal date strip.

---

# Task 3-4: Interactive Map
**Status:** 🔲 Not Started

## Design Goals
- Dark Mapbox style (`mapbox://styles/mapbox/dark-v11`)
- Custom venue pins: pulsing orange dot when event is tonight, grey dot otherwise
- Tap pin → venue card slides up from bottom
- Venue card shows: venue name, tonight's events (if any), follow button, get directions
- Filter toggle: "Tonight Only" highlights active venues

## Implementation (Expo + Mapbox)
```typescript
import MapboxGL from '@rnmapbox/maps'

MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN)

// Custom marker for venues with tonight events
const VenueMarker = ({ venue, hasEventTonight }) => (
  <MapboxGL.PointAnnotation
    key={venue.id}
    id={venue.id}
    coordinate={[venue.longitude, venue.latitude]}
    onSelected={() => setSelectedVenue(venue)}
  >
    <PulsingDot active={hasEventTonight} />
  </MapboxGL.PointAnnotation>
)
```

## Note
Mapbox token required (see credentials/setup-guide.md). Request from mapbox.com before starting this task.

---

# Task 3-5 & 3-6: Follow Artist / Follow Venue
**Status:** 🔲 Not Started

## Behavior
- Follow button on artist profile, venue profile, and event cards
- Tapping follow: INSERT into follows table
- Button state toggles to "Following" (filled heart)
- Following triggers future push notifications for new events

## Follow Count Display
- Artist profile shows follower count
- Venue profile shows follower count
- Count updates in real-time via Supabase Realtime subscription

---

# Task 3-7: Save Event
**Status:** 🔲 Not Started

## Behavior
- Save button (bookmark icon) on every event card and event detail page
- Tapping save: INSERT into saved_events
- Saved events appear in patron's "My Shows" tab
- Saving triggers push notification reminder (show starting soon)

---

# Task 3-8 & 3-9: Push Notifications
**Status:** 🔲 Not Started

## Setup
```typescript
import * as Notifications from 'expo-notifications'

// Request permissions on onboarding
const { status } = await Notifications.requestPermissionsAsync()
if (status === 'granted') {
  const token = await Notifications.getExpoPushTokenAsync()
  // Save token to profiles.expo_push_token in Supabase
}
```

## Notification Types

| Type | Trigger | Message |
|---|---|---|
| New event | Followed artist/venue adds event, is_public = true | "🎵 Dustin Bradley just added a show at Slider's!" |
| Show tonight | Saved event date = today, 9 AM morning alert | "Tonight! Dustin Bradley @ Slider's — 8PM" |
| Show starting soon | Saved event, 30 min before start_time | "Dustin Bradley starts in 30 min @ Slider's 🎸" |
| New promotion | Followed venue adds promotion | "🍺 Slider's: Free drink for first 20 guests tonight!" |

## Dispatch
Push notifications dispatched via `dispatch-notifications` Supabase Edge Function.  
Store `expo_push_token TEXT` on profiles table (add column in migration).

---

# Task 3-10: Event Detail Screen
**Status:** 🔲 Not Started

## Layout
- Full-width event image (or gradient if no image)
- Artist name (large, bold)
- Venue name + address
- Date and time
- Description
- Artist bio snippet + "View Profile" link
- Venue info snippet + "View Venue" link
- Map thumbnail showing venue location (tap → opens Maps app)
- Save button | Share button
- If patron saved: "⏰ You're going to this show"

---

## Phase 3 Phase Gate

Do not begin Phase 4 until:
- [ ] Discovery feed displays real events from database
- [ ] Weekly calendar shows events by day
- [ ] Map displays venue pins with tonight indicator
- [ ] Follow and save functions work and persist
- [ ] Push notifications fire for new events and show reminders
- [ ] Event detail screen displays complete event info
- [ ] TASK_LOG.md Phase 3 tasks marked ✅
