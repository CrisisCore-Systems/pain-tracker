Tailwind tokens & spacing (design-system)
========================================

Overview
--------
This project exposes a small, accessible typographic scale and spacing tokens via the design system theme. Tailwind is configured to use the theme values so you can use standard Tailwind utilities like `text-*` and spacing classes.

Typographic scale
------------------
The following sized tokens are available (mapped to `theme.typography.fontSize`):

- `text-h1` — Large heading (~28px, strong weight)
- `text-h2` — Section heading (~20px)
- `text-body` — Default body text (16px)
- `text-caption` — Small caption/helper text (12px)

Use examples:

```html
<h1 class="text-h1">Report summary</h1>
<h2 class="text-h2">Trends</h2>
<p class="text-body">Today I experienced...</p>
<span class="text-caption text-muted-foreground">Last updated 5m ago</span>
```

Spacing tokens
--------------
Spacing tokens are exposed via `theme.spacing` and include standard Tailwind spacing keys plus a few semantic helpers for touch sizes:

- `touch-sm` — 12px
- `touch-md` — 16px
- `touch-lg` — 24px

These can be used with padding/margin utilities, e.g.:

```html
<button class="px-touch-md py-touch-md">Tap me</button>
<div class="p-touch-lg">Card content</div>
```

Notes
-----
- The design system's `theme.ts` is the single source of truth for these tokens. Tailwind pulls them in via `tailwind.config.cjs` (see `fontSize`, `spacing`, `fontFamily`).
- Prefer semantic usage (e.g., `text-h2`, `p-touch-md`) over ad-hoc pixel classes to maintain consistency and accessibility.
- If you change tokens in `src/design-system/theme.ts`, Tailwind will pick them up on the next build.

Next steps
----------
- Add component-level style examples (cards, headings, form labels) showing correct token usage.
- Consider adding Storybook or a living styleguide to preview tokens and interactive states.
