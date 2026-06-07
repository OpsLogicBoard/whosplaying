# Phase 2 — Artist & Venue
**Who's Playing | whosplaying.live**  
**Goal:** Artists and venues can create profiles, manage events, and use the app to share their music and upcoming shows.  
**Estimated Duration:** 3–4 sessions  
**Status:** 🔲 Not Started  
**Depends on:** Phase 1 complete

---

## Overview

This phase builds the supply side of the platform. Without artist and venue content, there is nothing for patrons to discover. Priority order:

1. Artist profile + event creation
2. Venue profile + calendar
3. Double-booking detection
4. OCR calendar capture
5. Share sheet cross-posting

---

# Task 2-1: Artist Profile & Onboarding
**Status:** 🔲 Not Started

## Screens to Build (Expo)

### Onboarding (first login as artist)
- Stage name (required)
- Genre selection (multi-select: Rock, Country, Jazz, Blues, R&B, Pop, Reggae, Folk, Electronic, Other)
- Solo or Band toggle
- Band member names (if band)
- Bio (optional, 300 char limit)
- Profile photo (camera or gallery)
- Social links: Instagram handle, Facebook URL, TikTok handle

### Artist Profile Screen
- Header: Profile photo, stage name, genre tags, verified badge (if verified)
- Bio
- Music links: Spotify, Apple Music, YouTube, SoundCloud (any provided)
- Upcoming shows list (pulls from events table)
- Follow button (for patron view)
- Edit button (for own profile)

### Profile Edit Screen
- Edit all onboarding fields
- Add/update music platform links
- Booking contact (email, phone — visible to venues and admin only)

## Supabase Calls
- INSERT artists row on profile completion
- UPDATE artists on profile edit
- SELECT events JOIN event_artists WHERE artist_id = current

---

# Task 2-2: Artist Event Management
**Status:** 🔲 Not Started

## Screens

### My Events (artist tab)
- List of upcoming events (own events from event_artists)
- Past events tab
- "+ Add Event" button
- Event card: Date, Time, Venue, Status (draft/approved/public)

### Create Event Screen
- Date picker
- Start time / End time
- Venue: search or type (searches venues table, or free text if not registered)
- Description (optional)
- Cover image (optional)
- Privacy toggle: "Publish immediately" / "Keep private until 7 days before"
- Submit button

### On Submit
1. INSERT into events (status = 'pending' if venue is registered, 'approved' if self-managed)
2. INSERT into event_artists
3. Call edge function `check-double-booking`
4. If conflict: show conflict screen
5. If clear: confirm screen with share option

### Conflict Screen
- "You have another event at this time: [Event Name] @ [Venue]"
- Options: Cancel new event | Continue anyway | Invite to collaborate
- "Invite to collaborate" sends in-app notification to any other artist involved

---

# Task 2-3: Double Booking Detection
**Status:** 🔲 Not Started

## Edge Function: `check-double-booking`
(Full spec in `architecture/edge-functions.md`)

## Conflict Resolution UI Flow

When conflict_status = 'detected':
1. Both artists see a warning banner on the conflicting events
2. Banner: "⚠️ Schedule Conflict — You have overlapping events. Tap to resolve."
3. Conflict detail screen shows both events, both venues
4. Options:
   - **Resolve Solo:** Remove one of your own events
   - **Confirm Collaboration:** Mark as shared billing. Both events merge display: "Artist A & Artist B @ Venue"
   - **Ignore:** Keeps both active, warning stays visible to admin

## In `booking_conflicts` table
- `conflict_status` updates based on action taken
- `collaboration_confirmed` = true if both artists confirm collaboration

---

# Task 2-4: OCR Calendar Capture
**Status:** 🔲 Not Started

## Objective
Artist takes a photo of a handwritten calendar, printed schedule, or digital screen. App extracts event details and pre-fills event creation form.

## Flow
1. Artist taps "Capture Schedule" on My Events screen
2. Camera opens (expo-camera)
3. Artist photographs calendar/flyer/schedule
4. Image sent to `/api/parse/ocr-image` (Next.js admin API, not called directly — use Supabase Edge Function to proxy)
5. Claude Vision API extracts: dates, times, venue names, event descriptions
6. Returns list of detected events: `[{ date, time, venue, description }]`
7. App shows confirmation list — each event has edit field
8. Artist taps checkboxes to select which to import
9. Selected events batch-inserted to events table

## Claude API Prompt for OCR
```
You are extracting live music event details from an image of a calendar or schedule.
Extract all events you can identify and return ONLY valid JSON in this format:
{
  "events": [
    {
      "date": "YYYY-MM-DD or null if unclear",
      "time": "HH:MM in 24h format or null",
      "venue": "venue name or null",
      "description": "any other relevant details",
      "confidence": 0.0 to 1.0
    }
  ]
}
Return nothing outside the JSON object.
```

## Note
Low-confidence events (< 0.6) should be flagged with a warning indicator. Artist can still confirm them.

---

# Task 2-5: Venue Profile & Calendar
**Status:** 🔲 Not Started

## Venue Onboarding (Expo)
- Venue name (required)
- Address (required, used for map pin)
- Google Maps geocode address → lat/lng (use Google Geocoding API or Mapbox Geocoding)
- Venue type (Bar, Restaurant, Outdoor, Amphitheater, Club, Other)
- Capacity (optional)
- Phone number
- Website URL
- Cover photo (camera or gallery)
- Confirm: "This venue hosts live music events" toggle (all-events must be live music)

## Venue Calendar Screen
- Monthly calendar view
- Each date with events shows artist name(s)
- Tapping date → event list for that day
- Events pulled from `events` table WHERE `venue_id = current venue`
- Cross-references with `event_artists` to show artist names

## Artist @ Venue Combined View
- On each event card: Artist name + Venue name
- Venue can see full picture of confirmed artists per night

---

# Task 2-6: Native Share Sheet
**Status:** 🔲 Not Started

## Objective
After creating or viewing an event, artists and venues can share it to Instagram, Facebook, TikTok, or any other app via the OS native share sheet. No API approval required — user handles posting in their own app.

## Implementation

```typescript
import * as Sharing from 'expo-sharing'
import { captureRef } from 'react-native-view-shot'

// Generate share image
const shareEvent = async (eventCardRef, event) => {
  // Capture event card as image
  const uri = await captureRef(eventCardRef, {
    format: 'png',
    quality: 1.0
  })
  
  const caption = `🎵 ${event.artist_name} LIVE\n📍 ${event.venue_name}\n📅 ${formattedDate} at ${formattedTime}\n\nFind more live music at whosplaying.live`
  
  await Sharing.shareAsync(uri, {
    dialogTitle: 'Share This Show',
    mimeType: 'image/png'
  })
}
```

## Share Card Design
- Who's Playing branded card
- Artist name (large)
- Venue name
- Date and time
- QR code linking to event in app (Phase 3)
- Who's Playing logo + @handle

---

## Phase 2 Phase Gate

Do not begin Phase 3 until:
- [ ] Artist can create profile and add event
- [ ] Venue can create profile and view calendar
- [ ] Double-booking detection fires and shows UI
- [ ] OCR capture successfully imports at least one event from a photo
- [ ] Share sheet opens with branded event card
- [ ] TASK_LOG.md Phase 2 tasks marked ✅
