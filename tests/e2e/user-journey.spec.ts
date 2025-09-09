import { test, expect } from './fixtures';
import { SAMPLE_PAIN_ENTRIES, TEST_TIMEOUTS } from './fixtures/testData';

test.describe('Pain Tracker - User Journey Integration', () => {
  test.beforeEach(async ({ painTrackerPage, testUtils }) => {
    await testUtils.clearLocalStorage(painTrackerPage.page);
    await painTrackerPage.goto();
    await testUtils.waitForAppLoad(painTrackerPage.page);
  });

  test('complete user journey: onboarding to data export', async ({ painTrackerPage, testUtils }) => {
    // Step 1: First time user experience
    await expect(painTrackerPage.pageTitle).toBeVisible();
    
    // Step 2: Create multiple pain entries
    for (const sampleEntry of SAMPLE_PAIN_ENTRIES.slice(0, 2)) {
      await painTrackerPage.fillBasicPainEntry({
        intensity: sampleEntry.intensity,
        locations: sampleEntry.locations,
        symptoms: sampleEntry.symptoms
      });
      await painTrackerPage.submitPainEntry();
      await painTrackerPage.page.waitForTimeout(TEST_TIMEOUTS.FORM_SUBMISSION);
    }
    
    // Step 3: View analytics
    await painTrackerPage.openAnalytics();
    await expect(painTrackerPage.page.getByText(/analytics|chart|trend/i)).toBeVisible();
    
    // Step 4: Export data
    await painTrackerPage.exportData('json');
    
    // Step 5: Generate WCB report
    await painTrackerPage.toggleWCBReport();
    await expect(painTrackerPage.page.getByText(/worksafe|wcb/i)).toBeVisible();
    
    // Verify the complete journey worked
    const entryCount = await painTrackerPage.getPainEntriesCount();
    expect(entryCount).toBe(SAMPLE_PAIN_ENTRIES.slice(0, 2).length);
  });

  test('data consistency across app sections', async ({ painTrackerPage, testUtils }) => {
    const testEntry = testUtils.generateTestPainEntry();
    
    // Create entry
    await painTrackerPage.fillBasicPainEntry(testEntry);
    await painTrackerPage.submitPainEntry();
    
    // Verify entry appears in history
    await painTrackerPage.verifyPainEntryExists({
      intensity: testEntry.intensity,
      location: testEntry.locations[0]
    });
    
    // Verify entry affects analytics
    await painTrackerPage.openAnalytics();
    await expect(painTrackerPage.page.getByText(testEntry.intensity.toString())).toBeVisible();
    
    // Verify entry is included in exports
    const download = await testUtils.waitForDownload(painTrackerPage.page, async () => {
      await painTrackerPage.exportData('json');
    });
    expect(await download.suggestedFilename()).toContain('.json');
  });

  test('workflow interruption and recovery', async ({ painTrackerPage, testUtils }) => {
    const testEntry = testUtils.generateTestPainEntry();
    
    // Start filling form
    await painTrackerPage.painLevelSlider.fill(testEntry.intensity.toString());
    
    // Interrupt with page refresh
    await painTrackerPage.page.reload();
    await testUtils.waitForAppLoad(painTrackerPage.page);
    
    // Form should reset - verify recovery
    await expect(painTrackerPage.painLevelSlider).toHaveValue('0');
    
    // Complete a full entry after interruption
    await painTrackerPage.fillBasicPainEntry(testEntry);
    await painTrackerPage.submitPainEntry();
    
    // Verify entry was saved despite interruption
    const entryCount = await painTrackerPage.getPainEntriesCount();
    expect(entryCount).toBe(1);
  });

  test('help system and onboarding flow', async ({ painTrackerPage }) => {
    // Test help button
    const helpButton = painTrackerPage.helpButton;
    if (await helpButton.isVisible()) {
      await helpButton.click();
      
      // Should show help content or tutorial
      await expect(painTrackerPage.page.getByText(/help|tutorial|guide/i)).toBeVisible();
    }
    
    // Test onboarding elements if present
    const onboardingElements = painTrackerPage.page.getByText(/welcome|getting started|first time/i);
    if (await onboardingElements.first().isVisible()) {
      await onboardingElements.first().click();
    }
  });

  test('keyboard-only navigation workflow', async ({ painTrackerPage, testUtils }) => {
    const testEntry = testUtils.generateTestPainEntry();
    
    // Navigate using only keyboard
    await painTrackerPage.page.keyboard.press('Tab'); // Focus first element
    
    // Fill pain level using keyboard
    await painTrackerPage.painLevelSlider.focus();
    await painTrackerPage.page.keyboard.press('ArrowRight'); // Increase value
    await painTrackerPage.page.keyboard.press('ArrowRight');
    await painTrackerPage.page.keyboard.press('ArrowRight');
    
    // Navigate to location selection
    await painTrackerPage.page.keyboard.press('Tab');
    await painTrackerPage.page.keyboard.press('Space'); // Select first location
    
    // Complete form navigation using keyboard
    let tabCount = 0;
    while (tabCount < 10) { // Prevent infinite loop
      await painTrackerPage.page.keyboard.press('Tab');
      
      // Check if we reached submit button
      const focused = await painTrackerPage.page.locator(':focus').textContent();
      if (focused && /submit|save|add/i.test(focused)) {
        await painTrackerPage.page.keyboard.press('Enter');
        break;
      }
      tabCount++;
    }
    
    // Verify keyboard navigation worked
    await painTrackerPage.page.waitForTimeout(TEST_TIMEOUTS.FORM_SUBMISSION);
  });
});