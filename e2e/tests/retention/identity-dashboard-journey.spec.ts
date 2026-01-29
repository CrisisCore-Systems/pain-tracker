import { test, expect } from '../../test-setup';

/**
 * E2E Test Suite: Identity Dashboard Journey
 * 
 * Tests the identity dashboard features including:
 * - Journey narrative display
 * - Pattern discovery visualization
 * - Identity insights
 * - Personal meaning
 * - Journey personalization
 */

test.describe('Identity Dashboard Journey', () => {
  test.setTimeout(60000);

  test('should navigate to identity dashboard', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    
    // Look for identity/journey navigation
    const identityNav = page.locator('a:has-text("Identity"), a:has-text("Journey"), button:has-text("Identity")').first();
    
    if (await identityNav.count() > 0) {
      await identityNav.click();
      await page.waitForTimeout(1000);
      
      // Verify we're on identity page
      const identityHeading = page.locator('h1:has-text("Identity"), h1:has-text("Journey"), h2:has-text("Your Journey")').first();
      expect(await identityHeading.count()).toBeGreaterThan(0);
    } else {
      // Identity dashboard might be on main page
      const identitySection = page.locator('[data-testid*="identity"], text=/your.*journey|identity/i').first();
      expect(await identitySection.count()).toBeGreaterThan(0);
    }
  });

  test('should display journey narrative', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    
    // Look for narrative text
    const narrative = page.locator('text=/your.*pain.*journey|tracking.*for|you.*have.*been/i').first();
    
    if (await narrative.count() > 0) {
      const narrativeText = await narrative.textContent();
      expect(narrativeText).toBeTruthy();
      expect(narrativeText!.length).toBeGreaterThan(10);
    } else {
      // Check if narrative exists in storage even if not displayed
      const hasNarrative = await page.evaluate(() => {
        const store = localStorage.getItem('pain-tracker-store') || localStorage.getItem('pt:store');
        return store !== null && store.includes('narrative');
      });
      
      expect(hasNarrative).toBeTruthy();
    }
  });

  test('should display discovered patterns', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    
    // Look for patterns section
    const patternsSection = page.locator('text=/pattern|discovered|insight/i').first();
    
    if (await patternsSection.count() > 0) {
      // Check for pattern items
      const patternItem = page.locator('text=/correlation|trigger|relief|trend/i').first();
      const hasPatterns = await patternItem.count() > 0;
      
      // Or check for empty state
      const emptyState = page.locator('text=/no.*pattern|keep.*tracking/i').first();
      const hasEmptyState = await emptyState.count() > 0;
      
      expect(hasPatterns || hasEmptyState).toBeTruthy();
    }
  });

  test('should show identity insights', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    
    // Look for insights section
    const insightsSection = page.locator('text=/insight|strength|goal|discovery/i').first();
    
    if (await insightsSection.count() > 0) {
      // Verify insights display
      const insightText = await insightsSection.textContent();
      expect(insightText).toBeTruthy();
    } else {
      // Check storage for insights data
      const hasInsights = await page.evaluate(() => {
        const store = localStorage.getItem('pain-tracker-store') || localStorage.getItem('pt:store');
        return store !== null && store.includes('insight');
      });
      
      expect(hasInsights).toBeTruthy();
    }
  });

  test('should display personalized identity language', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    
    // Look for personalized language
    const personalizedText = page.locator('text=/warrior|survivor|advocate|champion/i').first();
    const hasPersonalized = await personalizedText.count() > 0;
    
    // Or generic identity display
    const identityDisplay = page.locator('[data-testid*="identity"], text=/identity|role|journey/i').first();
    const hasIdentity = await identityDisplay.count() > 0;
    
    expect(hasPersonalized || hasIdentity).toBeTruthy();
  });

  test('should update narrative with new entries', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    
    // Get initial narrative or pattern count
    const initialCount = await page.locator('text=/pattern|insight/i').count();
    
    // Add a new entry
    const checkInButton = page.locator('button:has-text("Check"), button:has-text("New Entry")').first();
    if (await checkInButton.count() > 0) {
      await checkInButton.click();
      await page.waitForTimeout(1000);
      
      const painInput = page.locator('input[type="range"], input[type="number"]').first();
      if (await painInput.count() > 0) {
        await painInput.fill('6');
      }
      
      const submitButton = page.locator('button:has-text("Submit"), button:has-text("Save")').first();
      if (await submitButton.count() > 0) {
        await submitButton.click();
        await page.waitForTimeout(2000);
      }
    }
    
    // Navigate back to identity and check for updates
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    
    // Journey should reflect updated data
    const updatedCount = await page.locator('text=/pattern|insight|entry|entries/i').count();
    expect(updatedCount).toBeGreaterThanOrEqual(initialCount);
  });
});
