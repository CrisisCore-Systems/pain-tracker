
End-to-end tests for the Pain Tracker app using Playwright

Getting started

- Install dependencies (from project root):

  npm install

- Install Playwright browsers (optional - Playwright will attempt install during first run):

  npx playwright install --with-deps

- Run dev server (Playwright config will reuse an existing server if found):

  npm run dev

- Run the e2e tests:

  npm run e2e

Windows-specific notes

If you're developing on Windows and `canvas` or other native build deps fail, run the helper script:

```powershell
npm run bootstrap-windows
```

The script provides guidance and attempts to automate MSYS2 installation where possible. See `docs/CANVAS_WINDOWS_PREREQS.md` for full platform and CI instructions.

CI notes

- Use `npx playwright install --with-deps` in CI runners to ensure browsers and dependencies are available.
- The Playwright config starts a Vite dev server automatically if one is not found.

Troubleshooting

- If tests can't find UI elements, inspect the DOM to determine the correct labels or roles used in your build. The sample tests use flexible selectors and will skip export tests if the expected button isn't present.

