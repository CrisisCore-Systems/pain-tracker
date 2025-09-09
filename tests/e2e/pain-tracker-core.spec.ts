import { test, expect } from './fixtures';

test.describe('Pain Tracker - Core Functionality', () => {
  test.beforeEach(async ({ painTrackerPage, testUtils }) => {
    await testUtils.clearLocalStorage(painTrackerPage.page);
    await painTrackerPage.goto();
    await testUtils.waitForAppLoad(painTrackerPage.page);
  });

  test('should load the application successfully', async ({ painTrackerPage }) => {
    await expect(painTrackerPage.pageTitle).toBeVisible();
    await expect(painTrackerPage.page).toHaveTitle(/Pain Tracker/);
  });

  test('should display the main pain entry form', async ({ painTrackerPage }) => {
    // Check that main form elements are present
    await expect(painTrackerPage.page.getByText(/Record Pain Entry/i)).toBeVisible();
    await expect(painTrackerPage.page.getByText(/Pain Intensity/i)).toBeVisible();
    await expect(painTrackerPage.page.getByText(/Location/i)).toBeVisible();
    await expect(painTrackerPage.page.getByText(/Description/i)).toBeVisible();
  });

  test('should create a new pain entry', async ({ painTrackerPage, testUtils }) => {
    const testEntry = testUtils.generateTestPainEntry();
    
    // Fill out the basic pain entry form
    await painTrackerPage.fillBasicPainEntry(testEntry);
    
    // Submit the entry (navigate through form sections and submit)
    await painTrackerPage.submitPainEntry();
    
    // Verify the entry was saved (check for specific values)
    await painTrackerPage.verifyPainEntryExists({ 
      intensity: testEntry.intensity,
      location: testEntry.locations[0] 
    });
    
    // Verify entry count increased
    const entryCount = await painTrackerPage.getPainEntriesCount();
    expect(entryCount).toBeGreaterThan(0);
  });

  test('should validate required fields', async ({ painTrackerPage }) => {
    // Try to submit without filling required fields
    await painTrackerPage.submitButton.click();
    
    // Should either show validation errors or not allow navigation
    // The form might prevent progression without required data
    const errorMessages = painTrackerPage.page.getByText(/required|invalid|must|error/i);
    const isStillOnFirstSection = await painTrackerPage.painLevelSlider.isVisible();
    
    expect(await errorMessages.count() > 0 || isStillOnFirstSection).toBe(true);
  });

  test('should persist data across page reloads', async ({ painTrackerPage, testUtils }) => {
    const testEntry = testUtils.generateTestPainEntry();
    
    // Create an entry
    await painTrackerPage.fillBasicPainEntry(testEntry);
    await painTrackerPage.submitPainEntry();
    
    // Reload the page
    await painTrackerPage.page.reload();
    await testUtils.waitForAppLoad(painTrackerPage.page);
    
    // Verify the entry still exists
    await painTrackerPage.verifyPainEntryExists({ 
      intensity: testEntry.intensity,
      location: testEntry.locations[0] 
    });
  });

  test('should handle multiple pain entries', async ({ painTrackerPage, testUtils }) => {
    const entries = [
      testUtils.generateTestPainEntry(),
      testUtils.generateTestPainEntry(),
      testUtils.generateTestPainEntry()
    ];
    
    // Create multiple entries
    for (const entry of entries) {
      await painTrackerPage.fillBasicPainEntry(entry);
      await painTrackerPage.submitPainEntry();
      await painTrackerPage.page.waitForTimeout(200); // Small delay between entries
    }
    
    // Verify count
    const entryCount = await painTrackerPage.getPainEntriesCount();
    expect(entryCount).toBe(entries.length);
  });
});