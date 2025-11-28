import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './',
  timeout: 180_000,
  // Increase retries on CI for flaky engines (especially WebKit)
  retries: process.env.CI ? 2 : 0,
  expect: { timeout: 5000 },
  fullyParallel: true,
  reporter: [
    ['list'],
    ['junit', { outputFile: 'results/junit.xml' }],
    ['html', { outputFolder: 'results/html-report', open: 'never' }],
    ['json', { outputFile: 'results/test-results.json' }],
  ],
  use: {
    baseURL: 'http://localhost:3000/pain-tracker/',
    // Collect full traces for flaky runs to aid debugging
    trace: 'on',
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
    command: 'npm run -s dev',
    url: 'http://localhost:3000/pain-tracker/',
  // Prefer Playwright to start the dev server with the correct test env.
  // During interactive debugging we allow reusing an existing server so we can
  // run Vite in a separate terminal and observe its logs. This will be reverted
  // back to 'false' for CI runs when triage is complete.
  reuseExistingServer: true,
    // Increase webServer timeout to allow the dev server more time to become fully responsive
    // during CI/slow machines (helps avoid module fetch timeouts observed in traces).
    timeout: 240_000,
    env: {
      // Vite exposes this at config time as process.env.VITE_BASE in vite.config.ts
      VITE_BASE: '/pain-tracker/',
      // Point Playwright-run dev server to the landing screenshot we add under public/pain-tracker/assets
      VITE_LANDING_SCREENSHOT: '/pain-tracker/assets/analytics-dashboard.png'
      ,
      // (Removed VITE_DEV_HTTPS) E2E runs default to HTTP dev server so browsers
      // won't be forced to upgrade to HTTPS by CSP during tests.
    }
  },
});
