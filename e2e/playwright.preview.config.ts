import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './',
  timeout: 180_000,
  retries: process.env.CI ? 2 : 0,
  expect: { timeout: 5000 },
  fullyParallel: true,
  reporter: [
    ['list'],
    ['junit', { outputFile: 'results/junit-preview.xml' }],
    ['html', { outputFolder: 'results/html-report-preview', open: 'never' }],
    ['json', { outputFile: 'results/test-results-preview.json' }],
  ],
  use: {
    baseURL: 'http://localhost:4173/pain-tracker/',
    trace: 'on',
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
