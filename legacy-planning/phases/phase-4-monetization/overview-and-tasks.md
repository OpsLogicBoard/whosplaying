# Phase 4 — Monetization
**Who's Playing | whosplaying.live**  
**Goal:** Make the platform self-funding through venue marketing tools, a patron points system, and giveaway contests. Add Meta API for direct cross-posting.  
**Estimated Duration:** 3–4 sessions  
**Status:** 🔲 Not Started  
**Depends on:** Phase 3 complete and live with real users

---

## Revenue Model Overview

| Revenue Stream | Who Pays | What They Get |
|---|---|---|
| Venue Basic Tier (Free) | Venue | Profile, calendar, event listing |
| Venue Marketing Tier ($29–49/mo) | Venue | Promotions, giveaways, featured placement, analytics |
| Points Sponsor | Venue | Branded points program, redemption management |
| Patron | Free | Full app access always free |

**Philosophy:** Patrons never pay. Venues pay because they get real customers. Artists never pay.

---

# Task 4-1: Venue Promotions
**Status:** 🔲 Not Started

## What Venues Can Create
- **Drink Special:** "Half-price margaritas during the show"
- **Free Entry:** "Free admission before 9PM"
- **Special Event:** "Halloween costume contest + prizes"
- Giveaway (separate task below)

## UI (Venue dashboard in app)
- "Add Promotion" button on venue dashboard
- Form: type, title, description, terms, linked event (optional), active dates
- Preview: how it will appear on patron event cards

## Patron View
- Promotion badge on event card: 🍺 "Drink Special" or 🎟 "Free Before 9"
- Promotion detail in event detail screen
- Promotions expire automatically at `end_at`

## Access Control
- Only venues on Marketing Tier can create promotions
- Stripe subscription gates this feature (see Task 4-8)

---

# Task 4-2 & 4-3: Points System & Giveaways
**Status:** 🔲 Not Started

## Points System

**Earning Points:**
- Attend a live music event at a venue: 10 points (base)
- First show at new venue: 25 points (bonus)
- Bring a friend who checks in: 5 points

**Check-in Mechanism:**
- Venue displays a daily QR code (generated in venue dashboard, refreshes every 24h)
- Patron scans QR code at event → check-in recorded → points awarded
- Alternative: Geofence check-in (within 100m of venue during event time window)

**Redeeming Points:**
- Venue sets redemption options: "200 points = $5 drink credit"
- Patron sees their points balance per venue in "My Shows" → "My Points" tab
- Patron shows points screen to bartender/staff → venue marks as redeemed in dashboard

## Giveaways

**Venue creates giveaway:**
- Title: "Win 2 VIP tickets!"
- Prize description
- Linked event (optional)
- End datetime
- Max entries (optional)

**Patron enters:**
- "Enter Giveaway" button on event card / promotion
- One entry per patron per giveaway
- Confirmation: "You're entered! 🎉"

**Winner selection:**
- `select-giveaway-winner` edge function runs every 15 min
- Random selection from entries when `ends_at <= NOW()`
- Push notification to winner
- Push notification to venue admin: "Your giveaway winner: [Name]"

---

# Task 4-4: Stripe Integration (Venue Subscriptions)
**Status:** 🔲 Not Started

## Setup
- Create Stripe account
- Create product: "Who's Playing Marketing Tier" at $39/month
- Stripe webhook → `/api/webhooks/stripe`

## Venue Upgrade Flow
- In venue dashboard: "Upgrade to Marketing Tier" button
- Opens Stripe Checkout (hosted page — no card data touches our server)
- On success: Supabase updates venue to `marketing_tier = true`
- On cancellation/failure: tier reverts

## Webhook Handler
```typescript
// /api/webhooks/stripe
// Handle: checkout.session.completed → enable tier
// Handle: customer.subscription.deleted → disable tier
```

---

# Task 4-5: Meta Graph API Cross-Posting
**Status:** 🔲 Not Started  
**Note:** Start Meta API application during Phase 2. Approval takes 4–8 weeks.

## Prerequisite
- Facebook Developer App approved for `pages_manage_posts` and `instagram_content_publish` permissions
- Venue connects their Facebook Page / Instagram Business account via OAuth

## Flow
1. Venue taps "Post to Social" on event or promotion
2. If not connected: OAuth flow to connect Facebook Page
3. Select: Instagram | Facebook | Both
4. Preview formatted post (image + caption)
5. Tap Post → Graph API call

## API Calls
```typescript
// Post to Instagram
POST https://graph.facebook.com/v18.0/{ig-user-id}/media
{ image_url, caption }

POST https://graph.facebook.com/v18.0/{ig-user-id}/media_publish
{ creation_id }

// Post to Facebook Page
POST https://graph.facebook.com/v18.0/{page-id}/photos
{ url, message }
```

---

# Phase 5 — App Store Submission
**Goal:** Submit the production app to Apple App Store and Google Play Store.  
**Estimated Duration:** 1–2 sessions + store review time (1–7 days)  
**Status:** 🔲 Not Started  
**Depends on:** Phase 4 complete, all features tested

---

# Task 5-1: Pre-Submission Checklist
**Status:** 🔲 Not Started

## Required Before Submission

### Legal (admin to provide or generate)
- [ ] Privacy Policy page (URL: whosplaying.live/privacy)
- [ ] Terms of Service page (URL: whosplaying.live/terms)
- [ ] Cookie/data handling disclosure

### App Content
- [ ] App name: "Who's Playing"
- [ ] Subtitle: "Live Music Near You"
- [ ] Description (4000 chars max for App Store)
- [ ] Keywords (App Store)
- [ ] Support URL: whosplaying.live/support
- [ ] Marketing URL: whosplaying.live

### Screenshots Required (Apple)
- 6.7" iPhone (required): 1290 × 2796
- 12.9" iPad (required if iPad supported): 2048 × 2732

### Screenshots Required (Google Play)
- Phone: minimum 2 screenshots
- 1080 × 1920 px minimum

---

# Task 5-2: iOS Build & Submission
**Status:** 🔲 Not Started

## Steps
```bash
# Build production iOS
eas build --platform ios --profile production

# Submit to App Store Connect
eas submit --platform ios
```

## Requirements
- Apple Developer Program membership ($99/year) — confirm status (Issue I-002)
- Distribution certificate and provisioning profile (EAS handles automatically)
- App Store Connect app record created

---

# Task 5-3: Android Build & Submission
**Status:** 🔲 Not Started

## Steps
```bash
# Build production Android
eas build --platform android --profile production

# Submit to Google Play
eas submit --platform android
```

## Requirements
- Google Play Developer account ($25 one-time) — confirm status (Issue I-003)
- Play Store app listing created
- Content rating questionnaire completed

---

## Final Phase Gate

Before marking project complete:
- [ ] Both apps live in their respective stores
- [ ] Admin pipeline eliminating manual scrolling workflow
- [ ] At least 10 venues and artists onboarded
- [ ] Push notifications confirmed working on real devices
- [ ] Privacy policy and terms of service pages live
- [ ] All TASK_LOG.md items marked ✅
