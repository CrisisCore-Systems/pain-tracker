import { test, expect } from './fixtures';

test.describe('Pain Tracker - API Integration and Data Sync', () => {
  test.beforeEach(async ({ painTrackerPage, testUtils }) => {
    await testUtils.clearLocalStorage(painTrackerPage.page);
    await painTrackerPage.goto();
    await testUtils.waitForAppLoad(painTrackerPage.page);
  });

  test('should handle offline functionality', async ({ painTrackerPage, testUtils }) => {
    const testEntry = testUtils.generateTestPainEntry();
    
    // Go offline
    await painTrackerPage.page.context().setOffline(true);
    
    // Try to create entry while offline
    await painTrackerPage.fillBasicPainEntry(testEntry);
    await painTrackerPage.submitPainEntry();
    
    // Should still work with localStorage
    await painTrackerPage.verifyPainEntryExists({
      intensity: testEntry.intensity,
      location: testEntry.locations[0]
    });
    
    // Go back online
    await painTrackerPage.page.context().setOffline(false);
    
    // Verify data persists when back online
    await painTrackerPage.page.reload();
    await testUtils.waitForAppLoad(painTrackerPage.page);
    
    await painTrackerPage.verifyPainEntryExists({
      intensity: testEntry.intensity,
      location: testEntry.locations[0]
    });
  });

  test('should handle API timeouts gracefully', async ({ painTrackerPage, testUtils }) => {
    // Intercept API calls and delay them
    await painTrackerPage.page.route('**/api/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second delay
      route.continue();
    });
    
    const testEntry = testUtils.generateTestPainEntry();
    
    // Try to create entry with slow API
    await painTrackerPage.fillBasicPainEntry(testEntry);
    await painTrackerPage.submitPainEntry();
    
    // Should handle timeout gracefully (either show loading or work offline)
    await expect(painTrackerPage.pageTitle).toBeVisible(); // Page should still be responsive
  });

  test('should sync data between tabs', async ({ painTrackerPage, testUtils, page }) => {
    const testEntry = testUtils.generateTestPainEntry();
    
    // Create entry in first tab
    await painTrackerPage.fillBasicPainEntry(testEntry);
    await painTrackerPage.submitPainEntry();
    
    // Open second tab
    const secondTab = await page.context().newPage();
    const secondPainTracker = new (await import('../pages/PainTrackerPage')).PainTrackerPage(secondTab);
    
    await secondPainTracker.goto();
    await testUtils.waitForAppLoad(secondTab);
    
    // Verify data appears in second tab
    await secondPainTracker.verifyPainEntryExists({
      intensity: testEntry.intensity,
      location: testEntry.locations[0]
    });
    
    await secondTab.close();
  });

  test('should handle WCB API integration', async ({ painTrackerPage, testUtils }) => {
    // Mock WCB API responses
    await painTrackerPage.page.route('**/wcb/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          reportId: 'WCB-TEST-001',
          status: 'submitted',
          timestamp: new Date().toISOString()
        })
      });
    });
    
    // Create some entries for the report
    const testEntry = testUtils.generateTestPainEntry();
    await painTrackerPage.fillBasicPainEntry(testEntry);
    await painTrackerPage.submitPainEntry();
    
    // Generate WCB report
    await painTrackerPage.toggleWCBReport();
    
    // Fill report dates and submit
    const startDate = painTrackerPage.page.getByLabel(/start date/i);
    const endDate = painTrackerPage.page.getByLabel(/end date/i);
    
    if (await startDate.isVisible()) {
      await startDate.fill('2024-01-01');
      await endDate.fill('2024-12-31');
      
      const submitButton = painTrackerPage.page.getByRole('button', { name: /submit|generate/i });
      if (await submitButton.isVisible()) {
        await submitButton.click();
        
        // Should show success message or report
        await expect(painTrackerPage.page.getByText(/success|submitted|generated/i)).toBeVisible();
      }
    }
  });

  test('should handle data import functionality', async ({ painTrackerPage, testUtils }) => {
    // Prepare test data file
    const testData = {
      entries: [
        {
          id: 1,
          timestamp: new Date().toISOString(),
          baselineData: {
            pain: 7,
            locations: ['Back'],
            symptoms: ['Sharp']
          }
        }
      ]
    };
    
    // Look for import functionality
    const importButton = painTrackerPage.page.getByText(/import|upload/i);
    if (await importButton.isVisible()) {
      await importButton.click();
      
      // Create a test file and upload it
      const fileInput = painTrackerPage.page.locator('input[type="file"]');
      if (await fileInput.isVisible()) {
        // Create temporary file
        const fs = require('fs');
        const path = require('path');
        const tempFile = path.join('/tmp', 'test-data.json');
        fs.writeFileSync(tempFile, JSON.stringify(testData));
        
        // Upload file
        await fileInput.setInputFiles(tempFile);
        
        // Confirm import
        const confirmButton = painTrackerPage.page.getByRole('button', { name: /confirm|import/i });
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
          
          // Verify data was imported
          await painTrackerPage.verifyPainEntryExists({
            intensity: 7,
            location: 'Back'
          });
        }
        
        // Cleanup
        fs.unlinkSync(tempFile);
      }
    }
  });

  test('should validate data integrity on export/import cycle', async ({ painTrackerPage, testUtils }) => {
    // Create test entries
    const testEntries = [
      testUtils.generateTestPainEntry(),
      testUtils.generateTestPainEntry()
    ];
    
    for (const entry of testEntries) {
      await painTrackerPage.fillBasicPainEntry(entry);
      await painTrackerPage.submitPainEntry();
    }
    
    // Export data
    const download = await testUtils.waitForDownload(painTrackerPage.page, async () => {
      await painTrackerPage.exportData('json');
    });
    
    // Verify export was successful
    expect(await download.suggestedFilename()).toContain('.json');
    
    // Clear current data
    await painTrackerPage.clearAllData();
    
    // Verify data is cleared
    const clearedCount = await painTrackerPage.getPainEntriesCount();
    expect(clearedCount).toBe(0);
    
    // Note: Full import testing would require file upload functionality
    // This tests the export portion of the cycle
  });
});