import { test as base } from '@playwright/test';
import { PainTrackerPage } from '../pages/PainTrackerPage';
import { TestUtils } from '../utils/TestUtils';

// Define custom fixtures
type Fixtures = {
  painTrackerPage: PainTrackerPage;
  testUtils: typeof TestUtils;
};

export const test = base.extend<Fixtures>({
  painTrackerPage: async ({ page }, use) => {
    const painTrackerPage = new PainTrackerPage(page);
    await use(painTrackerPage);
  },

  testUtils: async ({}, use) => {
    await use(TestUtils);
  },
});

export { expect } from '@playwright/test';