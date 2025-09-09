import { test, expect } from './fixtures';

test.describe('Pain Tracker - Mobile and Cross-Platform', () => {
  test.beforeEach(async ({ painTrackerPage, testUtils }) => {
    await testUtils.clearLocalStorage(painTrackerPage.page);
    await painTrackerPage.goto();
    await testUtils.waitForAppLoad(painTrackerPage.page);
  });

  test('should be responsive on mobile devices', async ({ painTrackerPage }) => {
    // Set mobile viewport
    await painTrackerPage.page.setViewportSize({ width: 375, height: 667 });
    
    await expect(painTrackerPage.pageTitle).toBeVisible();
    
    // Check that form elements are still accessible
    await expect(painTrackerPage.page.getByText(/Pain Intensity/i)).toBeVisible();
    
    // Take screenshot for visual verification
    await painTrackerPage.page.screenshot({ 
      path: 'test-results/screenshots/mobile-responsive.png',
      fullPage: true 
    });
  });

  test('should work with touch interactions', async ({ painTrackerPage, testUtils }) => {
    // Set mobile viewport
    await painTrackerPage.page.setViewportSize({ width: 375, height: 667 });
    
    const testEntry = testUtils.generateTestPainEntry();
    
    // Test touch interactions
    await painTrackerPage.descriptionInput.tap();
    await painTrackerPage.descriptionInput.fill(testEntry.description);
    
    // Test slider with touch
    const slider = painTrackerPage.painIntensitySlider;
    await slider.tap();
    
    await painTrackerPage.saveButton.tap();
    
    // Should work the same as desktop
    await painTrackerPage.verifyPainEntryExists(testEntry.description);
  });

  test('should handle different screen orientations', async ({ painTrackerPage }) => {
    // Test portrait orientation
    await painTrackerPage.page.setViewportSize({ width: 375, height: 667 });
    await expect(painTrackerPage.pageTitle).toBeVisible();
    
    // Test landscape orientation
    await painTrackerPage.page.setViewportSize({ width: 667, height: 375 });
    await expect(painTrackerPage.pageTitle).toBeVisible();
    
    // Form should still be usable in landscape
    await expect(painTrackerPage.page.getByText(/Pain Intensity/i)).toBeVisible();
  });

  test('should work on tablet devices', async ({ painTrackerPage, testUtils }) => {
    // Set tablet viewport
    await painTrackerPage.page.setViewportSize({ width: 768, height: 1024 });
    
    const testEntry = testUtils.generateTestPainEntry();
    await painTrackerPage.fillPainEntry(testEntry);
    await painTrackerPage.savePainEntry();
    
    await painTrackerPage.verifyPainEntryExists(testEntry.description);
    
    // Test analytics on tablet
    await painTrackerPage.openAnalytics();
    await expect(painTrackerPage.page.getByText(/Analytics/i)).toBeVisible();
  });

  test('should handle zoom levels', async ({ painTrackerPage }) => {
    // Test with high zoom
    await painTrackerPage.page.setViewportSize({ width: 1200, height: 800 });
    await painTrackerPage.page.evaluate(() => {
      document.body.style.zoom = '1.5';
    });
    
    await expect(painTrackerPage.pageTitle).toBeVisible();
    
    // Reset zoom
    await painTrackerPage.page.evaluate(() => {
      document.body.style.zoom = '1';
    });
    
    // Test with low zoom
    await painTrackerPage.page.evaluate(() => {
      document.body.style.zoom = '0.75';
    });
    
    await expect(painTrackerPage.pageTitle).toBeVisible();
  });
});

test.describe('Pain Tracker - Cross-Browser Compatibility', () => {
  test.beforeEach(async ({ painTrackerPage, testUtils }) => {
    await testUtils.clearLocalStorage(painTrackerPage.page);
    await painTrackerPage.goto();
    await testUtils.waitForAppLoad(painTrackerPage.page);
  });

  test('should work consistently across browsers', async ({ painTrackerPage, testUtils }) => {
    // This test will run on all configured browsers (Chrome, Firefox, Safari)
    const testEntry = testUtils.generateTestPainEntry();
    
    await painTrackerPage.fillPainEntry(testEntry);
    await painTrackerPage.savePainEntry();
    
    await painTrackerPage.verifyPainEntryExists(testEntry.description);
    
    // Test analytics
    await painTrackerPage.openAnalytics();
    await expect(painTrackerPage.page.getByText(/Analytics/i)).toBeVisible();
  });

  test('should handle browser-specific features', async ({ painTrackerPage }) => {
    // Test that app doesn't rely on browser-specific APIs
    await expect(painTrackerPage.pageTitle).toBeVisible();
    
    // Test form validation
    await painTrackerPage.saveButton.click();
    // Should show validation regardless of browser
  });

  test('should work without modern browser features', async ({ painTrackerPage }) => {
    // Disable some modern features to test fallbacks
    await painTrackerPage.page.addInitScript(() => {
      // Disable fetch API
      delete (window as any).fetch;
      
      // Disable CSS Grid support
      const style = document.createElement('style');
      style.textContent = `
        @supports (display: grid) {
          .grid { display: block !important; }
        }
      `;
      document.head.appendChild(style);
    });
    
    await painTrackerPage.page.reload();
    await expect(painTrackerPage.pageTitle).toBeVisible();
  });
});

test.describe('Pain Tracker - Performance', () => {
  test.beforeEach(async ({ painTrackerPage, testUtils }) => {
    await testUtils.clearLocalStorage(painTrackerPage.page);
  });

  test('should load within acceptable time', async ({ painTrackerPage }) => {
    const startTime = Date.now();
    
    await painTrackerPage.goto();
    await expect(painTrackerPage.pageTitle).toBeVisible();
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
  });

  test('should handle large datasets efficiently', async ({ painTrackerPage, testUtils }) => {
    await painTrackerPage.goto();
    await testUtils.waitForAppLoad(painTrackerPage.page);
    
    // Create 50 entries quickly
    const startTime = Date.now();
    
    for (let i = 0; i < 50; i++) {
      const entry = testUtils.generateTestPainEntry();
      await painTrackerPage.fillPainEntry(entry);
      await painTrackerPage.savePainEntry();
    }
    
    const creationTime = Date.now() - startTime;
    
    // Open analytics with large dataset
    const analyticsStartTime = Date.now();
    await painTrackerPage.openAnalytics();
    await expect(painTrackerPage.page.getByText(/Analytics/i)).toBeVisible();
    const analyticsLoadTime = Date.now() - analyticsStartTime;
    
    // Performance should be reasonable
    expect(analyticsLoadTime).toBeLessThan(3000); // Analytics should load within 3 seconds
  });
});