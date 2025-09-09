import { test, expect } from './fixtures';

test.describe('Pain Tracker - Error Handling and Edge Cases', () => {
  test.beforeEach(async ({ painTrackerPage, testUtils }) => {
    await testUtils.clearLocalStorage(painTrackerPage.page);
    await painTrackerPage.goto();
    await testUtils.waitForAppLoad(painTrackerPage.page);
  });

  test('should handle localStorage unavailable', async ({ painTrackerPage }) => {
    // Disable localStorage
    await painTrackerPage.page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: () => { throw new Error('localStorage not available'); },
          setItem: () => { throw new Error('localStorage not available'); },
          removeItem: () => { throw new Error('localStorage not available'); },
          clear: () => { throw new Error('localStorage not available'); },
        },
        writable: false
      });
    });
    
    await painTrackerPage.page.reload();
    
    // Should still render the page gracefully
    await expect(painTrackerPage.pageTitle).toBeVisible();
  });

  test('should handle invalid form data', async ({ painTrackerPage }) => {
    // Try to enter invalid pain intensity
    const intensityInput = painTrackerPage.page.getByRole('slider', { name: /intensity/i });
    await intensityInput.fill('15'); // Should be max 10
    
    await painTrackerPage.saveButton.click();
    
    // Should show validation error
    await expect(painTrackerPage.page.getByText(/invalid/i).or(
      painTrackerPage.page.getByText(/must be between/i)
    )).toBeVisible();
  });

  test('should handle network errors gracefully', async ({ painTrackerPage, testUtils }) => {
    // Create a pain entry first
    const testEntry = testUtils.generateTestPainEntry();
    await painTrackerPage.fillPainEntry(testEntry);
    
    // Simulate network error for any API calls
    await testUtils.simulateNetworkError(painTrackerPage.page);
    
    await painTrackerPage.savePainEntry();
    
    // Should handle the error gracefully (either show error message or work offline)
    await expect(painTrackerPage.page).not.toHaveTitle(/Error/);
  });

  test('should handle slow network conditions', async ({ painTrackerPage, testUtils }) => {
    // Simulate slow network
    await testUtils.simulateSlowNetwork(painTrackerPage.page, 3000);
    
    const testEntry = testUtils.generateTestPainEntry();
    await painTrackerPage.fillPainEntry(testEntry);
    await painTrackerPage.savePainEntry();
    
    // Should show loading state or complete eventually
    await expect(painTrackerPage.pageTitle).toBeVisible();
  });

  test('should handle large amounts of data', async ({ painTrackerPage, testUtils }) => {
    // Create many entries to test performance
    const entriesCount = 20;
    const entries = Array.from({ length: entriesCount }, () => testUtils.generateTestPainEntry());
    
    for (const entry of entries) {
      await painTrackerPage.fillPainEntry(entry);
      await painTrackerPage.savePainEntry();
      // No delay to stress test
    }
    
    // Verify all entries were created
    const finalCount = await painTrackerPage.getPainEntriesCount();
    expect(finalCount).toBe(entriesCount);
    
    // Check that analytics still work with many entries
    await painTrackerPage.openAnalytics();
    await expect(painTrackerPage.page.getByText(/Analytics/i)).toBeVisible();
  });

  test('should handle browser refresh during form filling', async ({ painTrackerPage, testUtils }) => {
    const testEntry = testUtils.generateTestPainEntry();
    
    // Start filling form
    await painTrackerPage.painIntensitySlider.fill(testEntry.intensity.toString());
    await painTrackerPage.descriptionInput.fill(testEntry.description);
    
    // Refresh page before saving
    await painTrackerPage.page.reload();
    await testUtils.waitForAppLoad(painTrackerPage.page);
    
    // Form should be reset (this is expected behavior)
    await expect(painTrackerPage.descriptionInput).toHaveValue('');
  });

  test('should handle concurrent user actions', async ({ painTrackerPage, testUtils }) => {
    const testEntry = testUtils.generateTestPainEntry();
    await painTrackerPage.fillPainEntry(testEntry);
    
    // Try to perform multiple actions simultaneously
    const savePromise = painTrackerPage.savePainEntry();
    const analyticsPromise = painTrackerPage.openAnalytics();
    
    await Promise.allSettled([savePromise, analyticsPromise]);
    
    // Should not crash the application
    await expect(painTrackerPage.pageTitle).toBeVisible();
  });

  test('should handle special characters in text inputs', async ({ painTrackerPage }) => {
    const specialEntry = {
      intensity: 5,
      location: 'Back',
      description: 'Pain with special chars: éñáőüß & <script>alert("xss")</script> 😊',
    };
    
    await painTrackerPage.fillPainEntry(specialEntry);
    await painTrackerPage.savePainEntry();
    
    // Should sanitize and save properly
    await painTrackerPage.verifyPainEntryExists('Pain with special chars');
  });

  test('should handle extremely long text inputs', async ({ painTrackerPage }) => {
    const longText = 'A'.repeat(5000); // Very long text
    
    const longEntry = {
      intensity: 3,
      location: 'Back',
      description: longText,
    };
    
    await painTrackerPage.fillPainEntry(longEntry);
    await painTrackerPage.savePainEntry();
    
    // Should handle long text appropriately (truncate or show error)
    await expect(painTrackerPage.pageTitle).toBeVisible();
  });
});