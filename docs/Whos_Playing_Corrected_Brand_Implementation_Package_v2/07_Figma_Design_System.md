# 07 - Figma Design System v2.0

## Purpose
This document defines design tokens and component boundaries for Figma and frontend implementation.

## Critical Boundary
Figma presentation frames are not production layouts.

A frame showing logo, colors, typography, and mobile mockups is a design review board. It should not be coded directly into the public homepage.

## Logo Components

### Component: Logo / Full
Use:
- Brand presentations
- Marketing
- Landing page hero if intentional

Includes:
- Live Pin mark
- Stacked wordmark
- Tagline

### Component: Logo / Compact
Use:
- Header
- Navigation
- App shell

Includes:
- Small Live Pin mark
- Wordmark

Does not include:
- Tagline
- PRIMARY LOGO label

### Component: Logo / Mark
Use:
- App icon
- Favicon
- Map pin
- Social avatar

## Design Tokens

### Colors
```css
--wp-bg: #F7F8FA;
--wp-ink: #111318;
--wp-deep-ink: #071020;
--wp-slate: #5C6470;
--wp-divider: #E9EAED;
--wp-coral: #FF5A5F;
--wp-blue: #2D7FF9;
--wp-lime: #B7F34A;
--wp-purple: #8B5CF6;
--wp-golden: #FFB020;
```

### Radius
```css
--radius-card: 16px;
--radius-input: 14px;
--radius-pill: 999px;
```

### Shadows
```css
--shadow-sm: 0 2px 10px rgba(0,0,0,.05);
--shadow-md: 0 8px 30px rgba(0,0,0,.08);
--shadow-lg: 0 20px 60px rgba(0,0,0,.12);
```

## Components
- Header
- Search Input
- Filter Pills
- Event Card
- Artist Card
- Venue Card
- Map Pin
- Bottom Tab Bar

## Breakpoints
- Mobile: 320px–767px
- Tablet: 768px–1023px
- Desktop: 1024px+
