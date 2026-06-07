# Who's Playing — API Routes Reference
**Last Updated:** 2026-05-09

All admin API routes are Next.js App Router Route Handlers (`/app/api/`).  
Mobile app communicates directly with Supabase client SDK except where Claude API calls require a server proxy.

---

## Admin Web API Routes (Next.js)

### Events
| Method | Route | Description | Auth |
|---|---|---|---|
| GET | `/api/events` | List all events (with filters) | Admin |
| GET | `/api/events/[id]` | Get single event | Admin |
| POST | `/api/events` | Create event | Admin |
| PATCH | `/api/events/[id]` | Update event | Admin |
| DELETE | `/api/events/[id]` | Delete event | Admin |
| PATCH | `/api/events/[id]/approve` | Approve pending event | Admin |
| PATCH | `/api/events/[id]/reject` | Reject pending event | Admin |

### Social Captures
| Method | Route | Description | Auth |
|---|---|---|---|
| GET | `/api/captures` | List captures by status | Admin |
| POST | `/api/captures` | Receive new capture from extension | Admin |
| PATCH | `/api/captures/[id]/approve` | Approve capture, create event | Admin |
| PATCH | `/api/captures/[id]/reject` | Reject capture | Admin |

### AI Parsing (proxies Claude API — key never exposed to client)
| Method | Route | Description | Auth |
|---|---|---|---|
| POST | `/api/parse/event-text` | Parse raw post text → event fields | Admin |
| POST | `/api/parse/ocr-image` | Parse image → event fields | Admin/Artist |

### Google Calendar
| Method | Route | Description | Auth |
|---|---|---|---|
| POST | `/api/calendar/push` | Push event to Google Calendar | Admin |
| DELETE | `/api/calendar/[googleEventId]` | Remove from Google Calendar | Admin |

### Daily Post Generator
| Method | Route | Description | Auth |
|---|---|---|---|
| POST | `/api/posts/generate` | Generate daily template images | Admin |
| GET | `/api/posts/[date]` | Get generated post for date | Admin |

### n8n Webhooks (inbound from n8n)
| Method | Route | Description | Auth |
|---|---|---|---|
| POST | `/api/webhooks/n8n/event-formatted` | Receive formatted event from n8n | Webhook secret |
| POST | `/api/webhooks/n8n/post-ready` | Receive daily post ready notification | Webhook secret |

---

## Supabase Edge Functions

Deployed to Supabase. Called server-side or from mobile app via Supabase client.

| Function | Trigger | Description |
|---|---|---|
| `check-double-booking` | On event INSERT | Checks artist calendar for time conflicts |
| `dispatch-notifications` | On event UPDATE (is_public → true) | Sends push to followers |
| `award-checkin-points` | On checkin INSERT | Adds points to patron_points |
| `select-giveaway-winner` | Scheduled (pg_cron) | Picks winner when giveaway ends_at passes |

See `architecture/edge-functions.md` for full specifications.

---

## Mobile App — Supabase Direct Calls

Mobile app uses `@supabase/supabase-js` directly for most operations. RLS policies enforce security.

### Key query patterns

**Discovery feed:**
```js
supabase
  .from('events')
  .select(`*, venues(*), event_artists(*, artists(*))`)
  .eq('is_public', true)
  .eq('status', 'approved')
  .gte('event_date', today)
  .order('event_date', { ascending: true })
```

**Patron feed (personalized by follows):**
```js
// Get followed artist IDs and venue IDs first, then:
supabase
  .from('events')
  .select(`*, venues(*), event_artists(*, artists(*))`)
  .eq('is_public', true)
  .in('venue_id', followedVenueIds)
  // OR join through event_artists for followed artists
```

**Artist calendar (own events + private):**
```js
supabase
  .from('events')
  .select(`*, venues(*), event_artists(*)`)
  .eq('event_artists.artist_id', artistId)
  .order('event_date', { ascending: true })
// RLS allows artist to see own private events
```

---

## Extension → Admin API

The browser extension sends a POST to `/api/captures` with:

```json
{
  "source_platform": "instagram",
  "source_url": "https://www.instagram.com/p/...",
  "raw_text": "Full post text here",
  "screenshot_base64": "data:image/png;base64,...",
  "auth_token": "admin JWT token"
}
```

The route handler:
1. Validates admin JWT
2. Uploads screenshot to Supabase Storage (`social-captures` bucket)
3. Calls `/api/parse/event-text` with raw_text
4. Saves to `social_captures` table with parsed fields
5. Returns capture ID to extension for confirmation display
