import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './',
  timeout: 120_000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  reporter: [['list'], ['junit', { outputFile: 'results/junit.xml' }]],
  use: {
    baseURL: 'http://localhost:3000/pain-tracker/',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
  webServer: {
    command: 'npm run -s dev',
    url: 'http://localhost:3000/pain-tracker/',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
