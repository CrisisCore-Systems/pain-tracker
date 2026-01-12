Accessibility improvements implemented (P1)

Summary
- Enforced visible keyboard focus indicators with `:focus-visible` and a `.focus-ring` utility.
- Added accessible components: `Alert` (aria-live), `AccessibilityAnnouncer` for screen reader messages.
- Design system additions: Button, Input, Skeleton components with accessible defaults.
- Typographic scale tokens added in `src/design-system/theme.ts` (h1,h2,body,caption).
- Button touch-target improved to meet 44x44px (default size now h-11).
- Automated contrast smoke test added: `src/design-system/contrast.test.tsx` (axe + programmatic checks).

How to run accessibility tests

Run the contrast/axe smoke test locally:

```powershell
npx vitest run src/design-system/contrast.test.tsx -t "color-contrast and accessibility smoke"
```

Run a more realistic accessibility scan (Playwright + axe)

1) Start the dev server in one terminal:

```powershell
npm run dev
```

2) In another terminal, run the accessibility scan (Chromium):

```powershell
npm run accessibility:scan
```

The Playwright scan visits several critical routes and fails the run if any high-impact (`critical` or `serious`) accessibility violations are found.

Notes
- The test suite includes a resilient test setup to avoid long initialization hangs.
- Focus styles respect `prefers-reduced-motion` and do not remove outlines globally.

Next steps
- Integrate inline validation microcopy across forms and add examples in the design system.
- Expand automated contrast scanning to more routes and components (worksafebc reports, analytics dashboards).
- Run manual spot checks for disabled states and error messages on critical pages.
