import { test, expect } from './fixtures';

test.describe('Pain Tracker - Data Export and Analytics', () => {
  test.beforeEach(async ({ painTrackerPage, testUtils }) => {
    await testUtils.clearLocalStorage(painTrackerPage.page);
    await painTrackerPage.goto();
    await testUtils.waitForAppLoad(painTrackerPage.page);
    
    // Create some test data
    const testEntries = [
      testUtils.generateTestPainEntry(),
      testUtils.generateTestPainEntry(),
    ];
    
    for (const entry of testEntries) {
      await painTrackerPage.fillBasicPainEntry(entry);
      await painTrackerPage.submitPainEntry();
      await painTrackerPage.page.waitForTimeout(200);
    }
  });

  test('should display analytics dashboard', async ({ painTrackerPage }) => {
    await painTrackerPage.openAnalytics();
    
    // Check for analytics elements
    await expect(painTrackerPage.page.getByText(/Pain Analytics/i)).toBeVisible();
    await expect(painTrackerPage.page.getByText(/Average Pain/i)).toBeVisible();
    await expect(painTrackerPage.page.getByText(/Pain Trends/i)).toBeVisible();
  });

  test('should show charts with data', async ({ painTrackerPage }) => {
    await painTrackerPage.openAnalytics();
    
    // Look for chart containers (charts might use canvas or svg)
    await expect(painTrackerPage.page.locator('canvas, svg')).toHaveCount({ min: 1 });
  });

  test('should export data as JSON', async ({ painTrackerPage, testUtils }) => {
    // Navigate to export section or find export button
    const exportSection = painTrackerPage.page.getByText(/Data Management/i);
    if (await exportSection.isVisible()) {
      await exportSection.click();
    }
    
    // Test JSON export
    const download = await testUtils.waitForDownload(painTrackerPage.page, async () => {
      await painTrackerPage.page.getByText(/Export JSON/i).click();
    });
    
    expect(await download.suggestedFilename()).toContain('.json');
  });

  test('should generate WCB report', async ({ painTrackerPage }) => {
    // Show WCB report section
    const wcbToggle = painTrackerPage.page.getByText(/Show WCB Report/i);
    if (await wcbToggle.isVisible()) {
      await wcbToggle.click();
      
      // Check that WCB report elements are visible
      await expect(painTrackerPage.page.getByText(/WorkSafe BC/i)).toBeVisible();
      await expect(painTrackerPage.page.getByText(/Start Date/i)).toBeVisible();
      await expect(painTrackerPage.page.getByText(/End Date/i)).toBeVisible();
    }
  });

  test('should handle empty data gracefully', async ({ painTrackerPage, testUtils }) => {
    // Clear all data
    await painTrackerPage.clearAllData();
    
    // Navigate to analytics
    await painTrackerPage.openAnalytics();
    
    // Should show appropriate message for no data
    await expect(painTrackerPage.page.getByText(/No data available/i).or(
      painTrackerPage.page.getByText(/No entries/i)
    )).toBeVisible();
  });

  test('should filter data by date range', async ({ painTrackerPage }) => {
    await painTrackerPage.openAnalytics();
    
    // Look for date picker or filter controls
    const dateFilter = painTrackerPage.page.getByLabel(/date/i).first();
    if (await dateFilter.isVisible()) {
      await dateFilter.fill('2024-01-01');
      
      // Should update displayed data
      await painTrackerPage.page.waitForTimeout(500);
    }
  });
});