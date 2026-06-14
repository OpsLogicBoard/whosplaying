# 02 - UI Design System v2.0

## Design Philosophy
Apple Simplicity + Spotify Energy + Airbnb Approachability

## Critical Layout Rule
Do not render brand documentation panels inside production pages.

The following belong only in design/spec routes or static documentation:
- PRIMARY LOGO board
- COLOR PALETTE panel
- TYPOGRAPHY panel
- Logo construction/spec overlays

The production homepage should be clean and functional, not a presentation collage.

## Page Structure

### Production Homepage
Use:
- Header with compact logo
- Navigation
- Hero
- Search
- Category pills
- Event cards
- Artist/Venue CTA
- Footer

Do not use:
- Logo review board
- Color palette board
- Typography board
- Any absolute-positioned design-documentation panels

## Header
Height:
```txt
72px desktop
64px mobile
```

Logo:
```txt
Compact logo only
Approx height: 38px desktop
Approx height: 34px mobile
```

Navigation:
- Tonight
- This Week
- Venues
- Artists
- Map
- Add Event CTA

## Logo Usage in Header
Use:
```jsx
<WhosPlayingLogo variant="compact" />
```

Do not use:
```jsx
<WhosPlayingLogo variant="reviewBoard" />
```

## Cards
- Border radius: 16px
- Background: #FFFFFF
- Border: 1px solid #E9EAED
- Shadow: 0 8px 30px rgba(0,0,0,.08)

## Buttons
Primary:
- Background: coral gradient
- Text: white
- Border radius: 999px

Secondary:
- White background
- Ink text
- Border: 1px solid #E9EAED

## Mobile Bottom Navigation
- Fixed bottom
- White background
- Five items max
- Active color: #FF5A5F
