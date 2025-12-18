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
    // Dev server runs at root - no /pain-tracker/ prefix needed
    baseURL: 'http://localhost:3000',
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
    url: 'http://localhost:3000/',
    // Reuse existing server if already running (common during development)
    reuseExistingServer: true,
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
