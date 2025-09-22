# CI guidance: Wiring node-canvas for test fidelity

## Why

- Chart.js and some canvas-based libraries require a CanvasRenderingContext2D during unit tests.
- jsdom does not implement canvas by default which can cause runtime errors or inaccurate rendering in tests.
- Installing `canvas` (node-canvas) in CI provides a real CanvasRenderingContext2D implementation and
  improves test fidelity for chart snapshots and Chart.js usage.

## Recommended steps (GitHub Actions)

1) Add `canvas` to devDependencies in your project (locally or in CI environment):

```powershell
npm install --save-dev canvas
```

> Note: On some CI runners (especially Linux) `canvas` may require native dependencies (cairo, pango).
> GitHub-hosted runners usually have these available or prebuilt binaries; if you control your CI
> environment, ensure `libcairo2-dev`, `libpango1.0-dev`, and related packages are installed.

Example GitHub Actions snippet (Ubuntu runner)

```yaml
name: Node CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x]
    steps:
      - uses: actions/checkout@v4
      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      - name: Install dependencies
        run: npm ci
      - name: Install optional native deps (ubuntu)
        if: runner.os == 'Linux'
        run: sudo apt-get update && sudo apt-get install -y libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev
      - name: Run tests
        run: npm run -s test -- --run src/components/widgets --reporter=default
```

For Windows runners you can usually run `npm ci` and `npm run test`; if `canvas` binary builds are required,
consider using prebuilt canvas binaries or a toolcache.

## Optional: Keep fallback in test setup

- If you prefer not to require `canvas` for all contributors, keep the fallback minimal stub in
  `src/test/setup.ts`. When `canvas` is installed in CI, the setup will use `createCanvas` automatically.

## Troubleshooting

- If `canvas` fails to build on CI because of missing native libs, prefer one of:
  - Install the native packages in the runner (apt-get for ubuntu) as shown above.
  - Use a Docker image that includes the native deps.
  - Use prebuilt binaries for `canvas` where available.

## Security note

- `canvas` is a native module; treat build logs with care and ensure CI runners are trusted.

If you'd like, I can add `canvas` to devDependencies and update the project's CI workflow file to install
native deps automatically.
