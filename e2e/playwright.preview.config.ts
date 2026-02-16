import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './',
  timeout: 180_000,
  retries: process.env.CI ? 2 : 0,
  expect: { timeout: process.env.CI ? 10_000 : 5_000 },
  forbidOnly: !!process.env.CI,
  workers: process.env.CI ? 1 : undefined,
  fullyParallel: true,
  reporter: [
    ['list'],
    ['junit', { outputFile: 'results/junit-preview.xml' }],
    ['html', { outputFolder: 'results/html-report-preview', open: 'never' }],
    ['json', { outputFile: 'results/test-results-preview.json' }],
  ],
  use: {
    baseURL: 'http://localhost:4173/pain-tracker/',
    actionTimeout: process.env.CI ? 20_000 : 15_000,
    navigationTimeout: process.env.CI ? 45_000 : 30_000,
    trace: process.env.CI ? 'on-first-retry' : 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        serviceWorkers: 'allow',
      },
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        serviceWorkers: 'allow',
      },
    },
  ],
  // No webServer here — assume preview is already running at localhost:4173
});
