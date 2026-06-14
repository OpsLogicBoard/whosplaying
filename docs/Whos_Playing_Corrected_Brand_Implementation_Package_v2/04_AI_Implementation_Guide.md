# 04 - AI Implementation Guide v2.0

## Primary Instruction
Do not place design-system presentation boards into the production homepage.

The original mockup showed a brand presentation board. It was not a literal homepage layout.

## Required Implementation Separation

### Brand Assets
Reusable components:
- Logo
- Colors
- Typography
- Tokens

### Production UI
Actual user-facing screens:
- Home
- Events
- Artists
- Venues
- Map
- Profile

### Documentation / Review UI
Optional internal-only route:
- Brand board
- Logo specs
- Palette
- Typography

## Logo Component Requirement
Create:

```txt
src/components/brand/WhosPlayingLogo.jsx
```

Supported variants:
- `compact`
- `full`
- `mark`
- `reviewBoard`

Default variant:
```txt
compact
```

## Header Rule
The app header must use only:

```jsx
<WhosPlayingLogo variant="compact" />
```

## Homepage Rejection Conditions
Reject any result where the homepage shows:
- PRIMARY LOGO
- COLOR PALETTE
- TYPOGRAPHY
- Oversized logo board
- Floating documentation panels
- Overlapping absolute-positioned brand specs

## Codex Search Targets
Before patching, search the codebase for:
- `PRIMARY LOGO`
- `COLOR PALETTE`
- `TYPOGRAPHY`
- `reviewBoard`
- `brand-board`
- `logo-board`
- `wp-logo-board`

Remove or isolate those from production routes.

## Required Visual Outcome
The homepage should look like a clean live-music discovery app, not a design presentation collage.
