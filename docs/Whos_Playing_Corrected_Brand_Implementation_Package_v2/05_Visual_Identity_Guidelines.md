# Who's Playing — Exact Logo Rebuild Specification v2.0

## Purpose

This file replaces all earlier loose logo guidance.

Codex must recreate the approved logo as a **locked SVG/CSS composition**, not as an icon-font approximation, stock icon, emoji, Lucide icon, Font Awesome icon, or generic text logo.

## Approved Logo

The approved logo is the **Live Pin Lockup**:

- Left: gradient location pin
- Inside pin: white circle
- Inside circle: right-facing play triangle
- Left/right of pin: two signal-wave strokes per side
- Right: stacked wordmark
  - Top: `who’s`
  - Bottom: `playing`
- Bottom: centered tagline
  - `LIVE MUSIC.  LOCAL PEOPLE.  REAL CONNECTION.`

## Critical Correction

The logo must **not** be implemented as a large brand-board panel inside the website homepage.

The logo lockup is a reusable brand asset.  
The homepage header should use a compact version only.  
The brand-spec board is for review documentation, not production layout.

## Exact Review Canvas

For review only:

```txt
Canvas: 754px wide × 428px high
Background: #F8F9FB
```

## Exact Logo Lockup Placement

Inside the 754 × 428 canvas:

```txt
Label:
top: 43px
left: 44px

Logo lockup:
top: 72px
left: 48px
width: 622px
height: 235px

Tagline:
top: 361px
left: 124px
width: approximately 496px
```

## Exact Mark

```txt
SVG viewBox: 0 0 250 270
Rendered size: 250px wide × 270px high
Position: left 0px, top 0px inside lockup
```

## Wordmark

```txt
Wordmark container:
left: 277px
top: 27px

Gap between icon and wordmark:
27px
```

### `who’s`

```txt
Font: Inter Black / 900
Size: 74px
Line-height: 0.92
Letter spacing: -0.055em
Color: #071020
```

### `playing`

```txt
Font: Inter Black / 900
Size: 77px
Line-height: 0.90
Letter spacing: -0.055em
Top margin from who’s: 14px
Fill: vertical gradient
```

Gradient:

```css
linear-gradient(180deg, #FF8751 0%, #FF5A5F 52%, #FF3F73 100%)
```

## Tagline

```txt
Text: LIVE MUSIC.  LOCAL PEOPLE.  REAL CONNECTION.
Font: Inter Extra Bold / 800
Size: 16px
Line-height: 1
Letter spacing: 0.105em
Color: #111318
White-space: nowrap
```

## SVG Mark Rules

- Pin gradient and play triangle use same gradient.
- White inner circle must remain white.
- Play triangle must point right.
- There are two signal strokes on each side.
- Stroke caps are round.
- Stroke widths are 7px–8px.
- Waves must not become music notes.
- Waves must not be replaced with equalizer bars.

## Exact HTML

```html
<section class="wp-logo-board" aria-label="Who's Playing primary logo">
  <div class="wp-logo-label">PRIMARY LOGO</div>

  <div class="wp-logo-lockup">
    <svg class="wp-mark" viewBox="0 0 250 270" aria-hidden="true">
      <defs>
        <linearGradient id="wpPinGradient" x1="40" y1="20" x2="215" y2="250" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#ff4f63"/>
          <stop offset="48%" stop-color="#ff6b42"/>
          <stop offset="100%" stop-color="#ff2f70"/>
        </linearGradient>
      </defs>

      <path d="M31 100 C8 125 8 165 31 190"
            fill="none"
            stroke="#ff5a5f"
            stroke-width="8"
            stroke-linecap="round"/>

      <path d="M48 118 C34 135 34 155 48 172"
            fill="none"
            stroke="#ff7a3f"
            stroke-width="7"
            stroke-linecap="round"/>

      <path d="M126 18
               C178 18 219 59 219 111
               C219 173 154 233 126 258
               C98 233 33 173 33 111
               C33 59 74 18 126 18Z"
            fill="url(#wpPinGradient)"/>

      <circle cx="126" cy="111" r="67" fill="#ffffff"/>

      <path d="M108 78
               C108 72 115 69 120 73
               L159 101
               C166 106 166 116 159 121
               L120 149
               C115 153 108 150 108 144Z"
            fill="url(#wpPinGradient)"/>

      <path d="M221 166 C240 181 240 209 221 225"
            fill="none"
            stroke="#ff7a3f"
            stroke-width="7"
            stroke-linecap="round"/>

      <path d="M204 178 C216 188 216 201 204 211"
            fill="none"
            stroke="#ff5a5f"
            stroke-width="7"
            stroke-linecap="round"/>
    </svg>

    <div class="wp-wordmark">
      <div class="wp-whos">who&rsquo;s</div>
      <div class="wp-playing">playing</div>
    </div>
  </div>

  <div class="wp-tagline">LIVE MUSIC. &nbsp; LOCAL PEOPLE. &nbsp; REAL CONNECTION.</div>
</section>
```

## Exact CSS

```css
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@700;800;900&display=swap");

.wp-logo-board {
  position: relative;
  width: 754px;
  height: 428px;
  background: #f8f9fb;
  font-family: Inter, -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif;
  overflow: hidden;
}

.wp-logo-label {
  position: absolute;
  top: 43px;
  left: 44px;
  font-size: 15px;
  line-height: 1;
  font-weight: 800;
  letter-spacing: 0.02em;
  color: #111318;
}

.wp-logo-lockup {
  position: absolute;
  top: 72px;
  left: 48px;
  width: 622px;
  height: 235px;
}

.wp-mark {
  position: absolute;
  left: 0;
  top: 0;
  width: 250px;
  height: 270px;
  overflow: visible;
}

.wp-wordmark {
  position: absolute;
  left: 277px;
  top: 27px;
}

.wp-whos {
  font-size: 74px;
  line-height: 0.92;
  font-weight: 900;
  letter-spacing: -0.055em;
  color: #071020;
}

.wp-playing {
  margin-top: 14px;
  font-size: 77px;
  line-height: 0.9;
  font-weight: 900;
  letter-spacing: -0.055em;
  background: linear-gradient(180deg, #ff8751 0%, #ff5a5f 52%, #ff3f73 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.wp-tagline {
  position: absolute;
  top: 361px;
  left: 124px;
  font-size: 16px;
  line-height: 1;
  font-weight: 800;
  letter-spacing: 0.105em;
  color: #111318;
  white-space: nowrap;
}
```

## Compact Header Logo

Use this in the actual app header. Do not use the 754 × 428 board in the header.

```txt
Header logo height: 38px
Mark size: 38px × 41px
Wordmark total width: approximately 110px
Tagline: hidden
Label: hidden
```

## Common Failures to Reject

Reject the implementation if:

- The logo appears as a giant panel over the homepage.
- The logo pushes/overlaps the hero content.
- The logo is not a reusable component.
- The wordmark is on one line instead of stacked.
- The pin is too large relative to the wordmark.
- The tagline is attached to the header version.
- The image/spec board is used as a production asset.
- The color palette or typography panels appear on the public homepage.
- The homepage contains review-board elements such as "PRIMARY LOGO", "COLOR PALETTE", or "TYPOGRAPHY".
