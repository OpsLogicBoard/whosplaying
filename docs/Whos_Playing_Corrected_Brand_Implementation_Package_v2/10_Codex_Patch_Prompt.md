# Codex Patch Prompt - Fix Who's Playing Logo and Homepage Branding

## Goal

Patch the existing Who's Playing monorepo so the public web app uses the approved Live Pin brand system without rendering brand-documentation panels on the production homepage.

The original mockup/package contains a brand review board. Treat that board as reference material only. The production homepage should look like a clean live-local-music discovery app, not a Figma/spec collage.

## Repo Context

Follow `AGENTS.md` and the monorepo file map:

- Web app: `apps/web/app/`
- Shared brand assets: `packages/ui/src/brand/`
- Shared UI exports: `packages/ui/src/index.ts`
- Shared tokens: `packages/ui/src/tokens/`
- Tailwind preset: `packages/ui/tailwind-preset.js`

Do not create a stray app-local `src/components/brand` folder. This repo uses `@whosplaying/ui` for shared brand components.

## Reference Files To Read First

Read these package files before editing:

- `01_Brand_System.md`
- `02_UI_Design_System.md`
- `04_AI_Implementation_Guide.md`
- `05_Visual_Identity_Guidelines.md`
- `07_Figma_Design_System.md`
- `09_Codex_Failure_Review.md`
- `11_Exact_Logo_Component.html`

`11_Exact_Logo_Component.html` is the exact review-board logo reference. Do not look for `09_Exact_Logo_Rebuild_Spec.md`; that file is not in this package.

## Inspect The Existing Implementation

Search the repo for:

- `PRIMARY LOGO`
- `COLOR PALETTE`
- `TYPOGRAPHY`
- `reviewBoard`
- `wp-logo-board`
- `brand-board`
- `logo-board`
- `Wordmark`
- `WordmarkInline`
- `LogoMark`
- `Who's Playing`
- `who’s playing`
- `whos playing`

Identify which production routes import or render brand-board/spec-board content.

## Required Changes

### 1. Keep brand review artifacts out of production routes

The public homepage and shared app/header layouts must not render:

- `PRIMARY LOGO`
- `COLOR PALETTE`
- `TYPOGRAPHY`
- Logo construction panels
- Palette/type specimen panels
- The 754 x 428 review board
- Absolute-positioned brand/spec overlays

Those artifacts may exist only in documentation files or an isolated internal review route. Do not import that route/component into `apps/web/app/(marketing)/page.tsx`, `apps/web/app/(marketing)/layout.tsx`, or the app shell.

### 2. Implement the approved logo in the shared UI package

Use `packages/ui/src/brand/` for logo work.

Create or refactor a single reusable exported component:

```txt
packages/ui/src/brand/WhosPlayingLogo.tsx
```

Export it from:

```txt
packages/ui/src/index.ts
```

The component must support:

```ts
type WhosPlayingLogoVariant = 'compact' | 'full' | 'mark' | 'reviewBoard'
```

Default variant:

```tsx
<WhosPlayingLogo variant="compact" />
```

Accept practical sizing props such as `width`, `height`, `className`, and `mono` only if they fit the existing UI package style.

Prefer reusing/refactoring the existing `LivePinMark`, `Wordmark`, `WordmarkInline`, and `LogoMark` files instead of duplicating brand logic across the app.

### 3. Match the approved Live Pin mark

The logo mark must use custom SVG paths from the approved Live Pin direction:

- Gradient location pin
- White inner circle
- Right-facing play triangle
- Two rounded signal-wave strokes per side
- No music notes
- No equalizer bars
- No Lucide, Font Awesome, emoji, or generic icon library replacement

Use these approved gradients:

```css
/* Pin and play triangle */
linear-gradient(135deg, #FF4F63 0%, #FF6B42 48%, #FF2F70 100%)

/* "playing" wordmark */
linear-gradient(180deg, #FF8751 0%, #FF5A5F 52%, #FF3F73 100%)
```

The full/review wordmark is stacked:

- Top: `who's`
- Bottom: `playing`

The `playing` word must use the approved orange/coral/pink gradient.

### 4. Use the compact logo in the web header

Update the marketing/app header to import from `@whosplaying/ui` and use:

```tsx
<WhosPlayingLogo variant="compact" />
```

Header constraints:

- Desktop header height: about `72px`
- Mobile header height: about `64px`
- Compact logo visual height: about `38px` desktop, `34px` mobile
- No tagline in the header
- No `PRIMARY LOGO` label in the header
- No review board in the header

If `WordmarkInline` remains as a compatibility export, it should not force the old or incorrect mark into the header.

### 5. Keep the homepage as a product page

The homepage should render normal product sections:

- Header/navigation from layout
- Hero/search entry point for discovering live music
- Tonight's Top Picks or equivalent event-card area
- Artist/Venue CTA
- Responsive mobile/tablet/desktop layout

The homepage must not be rebuilt as a collage and must not include design-documentation panels.

### 6. Optional review board isolation

If a review board is useful, place it behind a clearly isolated route or component, for example:

```txt
apps/web/app/brand-review/page.tsx
```

That route may render:

```tsx
<WhosPlayingLogo variant="reviewBoard" />
```

The review-board variant should be constrained to the reference canvas:

```txt
754px wide x 428px high
Background: #F8F9FB
```

It may include `PRIMARY LOGO`, but only inside the isolated review route.

## Files Likely To Change

Start with these files, then adjust only what the search results prove is necessary:

- `packages/ui/src/brand/WhosPlayingLogo.tsx`
- `packages/ui/src/brand/Wordmark.tsx`
- `packages/ui/src/brand/LogoMark.tsx`
- `packages/ui/src/index.ts`
- `apps/web/app/(marketing)/layout.tsx`
- `apps/web/app/(marketing)/page.tsx`
- `apps/web/app/globals.css` or shared Tailwind config only if needed for responsive styling

Do not touch Supabase migrations, auth, secrets, generated build output, or unrelated mobile screens for this brand-only patch.

## Acceptance Criteria

Pass/fail checklist:

- [ ] `/` homepage has no visible `PRIMARY LOGO`
- [ ] `/` homepage has no visible `COLOR PALETTE`
- [ ] `/` homepage has no visible `TYPOGRAPHY`
- [ ] Header uses `WhosPlayingLogo` with `variant="compact"`
- [ ] Header logo is compact, aligned, and does not include the tagline
- [ ] Full/review logo lockup is not floating over the homepage
- [ ] Logo mark uses custom SVG paths, not an icon library
- [ ] Full/review wordmark is stacked
- [ ] `playing` uses the approved gradient
- [ ] No absolute-positioned spec panels overlap production content
- [ ] Homepage remains responsive at mobile, tablet, and desktop widths
- [ ] Existing shared UI package exports remain usable by the web app
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes

## Verification Commands

Run from the repository root:

```sh
pnpm typecheck
pnpm lint
```

For visual verification, run the web app and check `/` at mobile, tablet, and desktop widths:

```sh
pnpm --filter @whosplaying/web dev
```

If port `3000` hangs because of an old process, follow the existing `AGENTS.md` dev-server note before restarting.

## Non-Negotiables

Do not:

- Use Font Awesome
- Use Lucide for the logo
- Use emoji
- Use generic music-note icons
- Use equalizer bars as the primary logo
- Use screenshots as production logo assets
- Render the brand board as a homepage section
- Put `PRIMARY LOGO`, `COLOR PALETTE`, or `TYPOGRAPHY` on the public homepage
- Duplicate domain types or touch Supabase code for this patch
- Touch secrets or `.env*` files
- Commit unrelated dirty worktree changes
