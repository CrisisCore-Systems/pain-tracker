import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './',
  timeout: 180_000,
  // Increase retries on CI for flaky engines (especially WebKit)
  retries: process.env.CI ? 2 : 0,
  expect: { timeout: process.env.CI ? 10_000 : 5_000 },
  forbidOnly: !!process.env.CI,
  // CI stability > speed: reduce contention on the dev server.
  workers: process.env.CI ? 1 : undefined,
  fullyParallel: true,
  reporter: [
    ['list'],
    ['junit', { outputFile: 'results/junit.xml' }],
    ['html', { outputFolder: 'results/html-report', open: 'never' }],
    ['json', { outputFile: 'results/test-results.json' }],
  ],
  use: {
    // Dev server runs at root - no /pain-tracker/ prefix needed
    baseURL: 'http://localhost:3000',
    actionTimeout: process.env.CI ? 20_000 : 15_000,
    navigationTimeout: process.env.CI ? 45_000 : 30_000,
    // Traces are invaluable, but always-on traces can slow runs and add flakiness.
    trace: process.env.CI ? 'on-first-retry' : 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Enable service worker support
        serviceWorkers: 'allow',
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        serviceWorkers: 'allow',
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        serviceWorkers: 'allow',
      },
    },
    // Mobile browser testing
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
        serviceWorkers: 'allow',
      },
    },
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 12'],
        serviceWorkers: 'allow',
      },
    },
  ],
  webServer: {
    // Force a stable port for E2E runs. Vite's default config allows fallback
    // ports, which can cause Playwright to wait on the wrong baseURL.
    command: 'npm run -s dev -- --port 3000 --strictPort',
    url: 'http://localhost:3000/',
    // Reuse existing server if already running (common during development)
    reuseExistingServer: !process.env.CI,
    // Increase webServer timeout to allow the dev server more time to become fully responsive
    // during CI/slow machines (helps avoid module fetch timeouts observed in traces).
    timeout: 240_000,
    env: {
      // Use default base path (/) for E2E tests - simpler routing without basename issues.
      // The production deployment uses /pain-tracker/ via GitHub Pages config.
      VITE_LANDING_SCREENSHOT: '/assets/analytics-dashboard.png',
      // (Removed VITE_DEV_HTTPS) E2E runs default to HTTP dev server so browsers
      // won't be forced to upgrade to HTTPS by CSP during tests.
    }
  },
});
