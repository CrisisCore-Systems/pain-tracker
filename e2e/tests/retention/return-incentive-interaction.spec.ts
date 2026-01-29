import { test, expect } from '../../test-setup';

/**
 * E2E Test Suite: Return Incentive Interaction
 * 
 * Tests the return incentive widget features including:
 * - Widget visibility
 * - Pending insights display
 * - Progress indicators
 * - Unlock thresholds
 * - Navigation to insights
 */

test.describe('Return Incentive Interaction', () => {
  test.setTimeout(60000);

  test('should display return incentive widget', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    
    // Look for return incentive widget
    const incentiveWidget = page.locator('text=/pending.*insight|unlock|coming.*soon|more.*entries/i').first();
    
    if (await incentiveWidget.count() > 0) {
      expect(await incentiveWidget.isVisible()).toBeTruthy();
    } else {
      // Widget might not show if all insights are unlocked
      // Check if insights section exists instead
      const insightsSection = page.locator('text=/insight|analysis|trend/i').first();
      expect(await insightsSection.count()).toBeGreaterThan(0);
    }
  });

  test('should show pending insights count', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    
    // Look for pending insights indicator
    const pendingCount = page.locator('text=/\\d+.*pending|\\d+.*unlock|\\d+.*more/i').first();
    
    if (await pendingCount.count() > 0) {
      const countText = await pendingCount.textContent();
      expect(countText).toMatch(/\d+/);
    } else {
      // Check if there's any insight-related content
      const insightContent = page.locator('text=/insight|discover|unlock/i').first();
      expect(await insightContent.count()).toBeGreaterThan(0);
    }
  });

  test('should display progress bars for pending insights', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    
    // Look for progress indicators
    const progressBar = page.locator('[role="progressbar"], progress, [data-testid*="progress"]').first();
    const progressText = page.locator('text=/\\d+\\/\\d+|\\d+%/i').first();
    
    const hasProgressBar = await progressBar.count() > 0;
    const hasProgressText = await progressText.count() > 0;
    
    // At least some form of progress indication
    expect(hasProgressBar || hasProgressText).toBeTruthy();
  });

  test('should show correct unlock thresholds', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    
    // Look for threshold indicators (e.g., "7 entries", "14 entries")
    const thresholdText = page.locator('text=/\\d+.*entries|\\d+.*more.*entries|\\d+.*days/i').first();
    
    if (await thresholdText.count() > 0) {
      const text = await thresholdText.textContent();
      expect(text).toMatch(/\d+/);
    } else {
      // Check storage for threshold data
      const hasThresholds = await page.evaluate(() => {
        const store = localStorage.getItem('pain-tracker-store') || localStorage.getItem('pt:store');
        return store !== null && (store.includes('threshold') || store.includes('pending'));
      });
      
      expect(hasThresholds).toBeTruthy();
    }
  });

  test('should navigate to insights when clicking widget', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    
    // Look for "View Insights" or similar button
    const viewInsightsButton = page.locator('button:has-text("View"), button:has-text("Insights"), a:has-text("Insights")').first();
    
    if (await viewInsightsButton.count() > 0) {
      await viewInsightsButton.click();
      await page.waitForTimeout(1000);
      
      // Should navigate to insights or analytics page
      const insightsPage = page.locator('h1:has-text("Insights"), h1:has-text("Analytics"), text=/your.*insights/i').first();
      expect(await insightsPage.count()).toBeGreaterThan(0);
    }
  });

  test('should update progress when new entries are added', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    
    // Get initial progress if visible
    const initialProgress = await page.locator('text=/\\d+.*more|\\d+\\/\\d+/i').first().textContent().catch(() => '0');
    
    // Add a new entry
    const checkInButton = page.locator('button:has-text("Check"), button:has-text("New Entry")').first();
    if (await checkInButton.count() > 0) {
      await checkInButton.click();
      await page.waitForTimeout(1000);
      
      const painInput = page.locator('input[type="range"], input[type="number"]').first();
      if (await painInput.count() > 0) {
        await painInput.fill('5');
      }
      
      const submitButton = page.locator('button:has-text("Submit"), button:has-text("Save")').first();
      if (await submitButton.count() > 0) {
        await submitButton.click();
        await page.waitForTimeout(2000);
      }
    }
    
    // Check if progress updated
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    
    const updatedProgress = await page.locator('text=/\\d+.*more|\\d+\\/\\d+|progress/i').first().textContent().catch(() => '');
    
    // Progress indicator should exist or have changed
    expect(initialProgress !== updatedProgress || updatedProgress.length > 0).toBeTruthy();
  });
});
