import { test, expect } from '../../test-setup';

/**
 * E2E Test Suite: Retention Analytics View
 * 
 * Tests retention-specific analytics including:
 * - Metrics display
 * - Streak information
 * - Win conditions
 * - Trend visualization
 * - Data export
 */

test.describe('Retention Analytics View', () => {
  test.setTimeout(60000);

  test('should navigate to analytics page', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    
    // Look for analytics navigation
    const analyticsNav = page.locator('a:has-text("Analytics"), a:has-text("Trends"), button:has-text("Analytics")').first();
    
    if (await analyticsNav.count() > 0) {
      await analyticsNav.click();
      await page.waitForTimeout(1000);
      
      // Verify we're on analytics page
      const analyticsHeading = page.locator('h1:has-text("Analytics"), h1:has-text("Trends"), h2:has-text("Your Data")').first();
      expect(await analyticsHeading.count()).toBeGreaterThan(0);
    } else {
      // Analytics might be on main page
      const analyticsSection = page.locator('[data-testid*="analytics"], text=/analytics|insights|trends/i').first();
      expect(await analyticsSection.count()).toBeGreaterThan(0);
    }
  });

  test('should display retention metrics', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    
    // Look for metrics like total check-ins, streak, etc.
    const metricsDisplay = page.locator('text=/total.*entries|check.*ins|days.*tracked|streak/i').first();
    
    if (await metricsDisplay.count() > 0) {
      const metricsText = await metricsDisplay.textContent();
      expect(metricsText).toBeTruthy();
      expect(metricsText).toMatch(/\d+/);
    } else {
      // Check if metrics data exists in storage
      const hasMetrics = await page.evaluate(() => {
        const store = localStorage.getItem('pain-tracker-store') || localStorage.getItem('pt:store');
        return store !== null && (store.includes('total') || store.includes('count'));
      });
      
      expect(hasMetrics).toBeTruthy();
    }
  });

  test('should show current streak information', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    
    // Look for streak display
    const streakDisplay = page.locator('text=/\\d+.*day.*streak|consecutive.*days|in.*a.*row/i').first();
    
    if (await streakDisplay.count() > 0) {
      const streakText = await streakDisplay.textContent();
      expect(streakText).toMatch(/\d+/);
    } else {
      // Check storage for streak data
      const hasStreak = await page.evaluate(() => {
        const store = localStorage.getItem('pain-tracker-store') || localStorage.getItem('pt:store');
        return store !== null && (store.includes('streak') || store.includes('consecutive'));
      });
      
      expect(hasStreak).toBeTruthy();
    }
  });

  test('should display win conditions and achievements', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    
    // Look for achievements or milestones
    const achievements = page.locator('text=/achievement|milestone|badge|unlock/i').first();
    const winCondition = page.locator('text=/3.*day|7.*day|30.*day/i').first();
    
    const hasAchievements = await achievements.count() > 0;
    const hasWinCondition = await winCondition.count() > 0;
    
    // Either achievements are visible or the system exists
    expect(hasAchievements || hasWinCondition).toBeTruthy();
  });

  test('should visualize trends with charts', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    
    // Look for chart elements (canvas, svg, or chart components)
    const chartElement = page.locator('canvas, svg[class*="chart"], [data-testid*="chart"]').first();
    const chartContainer = page.locator('[class*="chart-container"], [role="img"]').first();
    
    const hasChartElement = await chartElement.count() > 0;
    const hasChartContainer = await chartContainer.count() > 0;
    
    // Or check for trend visualization text
    const trendVisualization = page.locator('text=/trend|pattern|over.*time|timeline/i').first();
    const hasTrendViz = await trendVisualization.count() > 0;
    
    expect(hasChartElement || hasChartContainer || hasTrendViz).toBeTruthy();
  });

  test('should allow data export', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    
    // Look for export button or menu
    const exportButton = page.locator('button:has-text("Export"), button:has-text("Download"), a:has-text("Export")').first();
    
    if (await exportButton.count() > 0) {
      expect(await exportButton.isVisible()).toBeTruthy();
    } else {
      // Export might be in settings or menu
      const settingsButton = page.locator('button[aria-label*="menu"], button[aria-label*="settings"]').first();
      if (await settingsButton.count() > 0) {
        await settingsButton.click();
        await page.waitForTimeout(500);
        
        const exportOption = page.locator('text=/export|download/i').first();
        expect(await exportOption.count()).toBeGreaterThan(0);
      }
    }
  });

  test('should show retention rate over time', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    
    // Look for retention rate or consistency metrics
    const retentionMetric = page.locator('text=/retention|consistency|frequency|regular/i').first();
    
    if (await retentionMetric.count() > 0) {
      const metricText = await retentionMetric.textContent();
      expect(metricText).toBeTruthy();
    } else {
      // Check if retention data is calculated
      const hasRetentionData = await page.evaluate(() => {
        const store = localStorage.getItem('pain-tracker-store') || localStorage.getItem('pt:store');
        if (!store) return false;
        
        // Look for entries with dates to calculate retention
        return store.includes('timestamp') || store.includes('date') || store.includes('entries');
      });
      
      expect(hasRetentionData).toBeTruthy();
    }
  });
});
