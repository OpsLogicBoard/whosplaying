# Who's Playing — Codex Failure Review and Required Corrections

## What Went Wrong in the Latest Pass

The latest generated layout did not recreate the original mockup. It mixed a brand-presentation board with a production homepage and created a visually broken composition.

## Visible Issues

1. **Logo board is oversized and incorrectly placed**
   - The large “PRIMARY LOGO” board is floating over the page.
   - It overlaps the homepage hero and hides page content.
   - It should exist only as a design-spec board, not inside the actual homepage.

2. **Logo scale is wrong**
   - The pin and wordmark are much larger than the original mockup context.
   - The lockup should be constrained to the exact review canvas or rendered as a compact header logo.

3. **The homepage is being treated like a collage**
   - Color palette and typography panels are stacked over the homepage.
   - Those are documentation artifacts.
   - They should not render inside the app page.

4. **Header logo usage is wrong**
   - Production header should use a compact logo version only.
   - It should not include:
     - PRIMARY LOGO label
     - tagline
     - design spec panels
     - giant logo board

5. **Layering/z-index is wrong**
   - The logo and spec panels sit above the homepage content.
   - Homepage content should flow normally in its own layout.

6. **The source instructions were too loose**
   - Earlier docs said “logo direction” and “Live Pin” but did not distinguish between:
     - brand presentation board
     - reusable logo asset
     - compact header logo
     - app icon
   - This caused Codex to place every design artifact into the visible page.

## Correct Interpretation

There are three separate artifacts:

### 1. Brand Review Board
Used only for client/design review.

Contains:
- Primary logo
- Color palette
- Typography
- UI components
- Web/mobile mockups

Not used directly in production.

### 2. Logo Component
Reusable SVG/CSS logo asset.

Variants:
- Full lockup
- Compact header lockup
- Mark-only app icon

### 3. Production Homepage
Actual app/page layout.

Contains:
- Header with compact logo
- Navigation
- Hero
- Event cards
- CTA sections
- Mobile-responsive layout

Does **not** contain:
- PRIMARY LOGO label
- Color palette panel
- Typography panel
- Logo-spec board
- Any overlapping design-system panels

## Required Codex Fix

Codex must remove all brand-board artifacts from the homepage and build the logo as a reusable component.

## Acceptance Criteria

The patch is successful only when:

- `/` homepage does not show "PRIMARY LOGO".
- `/` homepage does not show "COLOR PALETTE".
- `/` homepage does not show "TYPOGRAPHY".
- Header logo is compact and aligned left.
- Brand review board exists only in a dedicated route/file if needed.
- Full logo board is constrained to 754px × 428px when viewed in isolation.
- No absolute-positioned documentation panels overlap the homepage.
- The approved logo mark uses custom SVG paths, not icon libraries.
