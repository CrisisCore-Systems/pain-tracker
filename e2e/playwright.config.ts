import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './',
  timeout: 120_000,
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
    trace: 'on-first-retry',
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
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
