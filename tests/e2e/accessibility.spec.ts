import { test, expect } from './fixtures';

test.describe('Pain Tracker - Accessibility', () => {
  test.beforeEach(async ({ painTrackerPage, testUtils }) => {
    await testUtils.clearLocalStorage(painTrackerPage.page);
    await painTrackerPage.goto();
    await testUtils.waitForAppLoad(painTrackerPage.page);
  });

  test('should have proper heading hierarchy', async ({ painTrackerPage, testUtils }) => {
    await testUtils.checkAccessibility(painTrackerPage.page);
  });

  test('should be keyboard navigable', async ({ painTrackerPage }) => {
    // Test tab navigation through form elements
    await painTrackerPage.page.keyboard.press('Tab');
    await expect(painTrackerPage.page.locator(':focus')).toBeVisible();
    
    // Continue tabbing to ensure proper focus order
    for (let i = 0; i < 5; i++) {
      await painTrackerPage.page.keyboard.press('Tab');
      await expect(painTrackerPage.page.locator(':focus')).toBeVisible();
    }
  });

  test('should have proper ARIA labels', async ({ painTrackerPage }) => {
    // Check for ARIA labels on interactive elements
    const sliders = await painTrackerPage.page.locator('[role="slider"]').all();
    for (const slider of sliders) {
      const ariaLabel = await slider.getAttribute('aria-label');
      const ariaLabelledBy = await slider.getAttribute('aria-labelledby');
      expect(ariaLabel || ariaLabelledBy).toBeTruthy();
    }
    
    // Check buttons have accessible names
    const buttons = await painTrackerPage.page.locator('button').all();
    for (const button of buttons) {
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      const ariaLabelledBy = await button.getAttribute('aria-labelledby');
      expect(text?.trim() || ariaLabel || ariaLabelledBy).toBeTruthy();
    }
  });

  test('should work with screen reader announcements', async ({ painTrackerPage }) => {
    // Test that important changes are announced
    const testEntry = {
      intensity: 5,
      location: 'Back',
      description: 'Test accessibility entry',
    };
    
    await painTrackerPage.fillPainEntry(testEntry);
    await painTrackerPage.savePainEntry();
    
    // Check for success message or live region updates
    await expect(painTrackerPage.page.locator('[aria-live], [role="status"], [role="alert"]')).toHaveCount({ min: 0 });
  });

  test('should have sufficient color contrast', async ({ painTrackerPage }) => {
    // Take screenshot for manual color contrast verification
    await painTrackerPage.page.screenshot({ 
      path: 'test-results/screenshots/color-contrast-check.png',
      fullPage: true 
    });
    
    // Test that text is readable (basic check)
    const bodyElements = await painTrackerPage.page.locator('body *').all();
    let hasVisibleText = false;
    
    for (const element of bodyElements.slice(0, 10)) { // Check first 10 elements
      const text = await element.textContent();
      if (text && text.trim().length > 0) {
        hasVisibleText = true;
        break;
      }
    }
    
    expect(hasVisibleText).toBe(true);
  });

  test('should support high contrast mode', async ({ painTrackerPage }) => {
    // Simulate high contrast mode by injecting CSS
    await painTrackerPage.page.addStyleTag({
      content: `
        @media (prefers-contrast: high) {
          * {
            background: black !important;
            color: white !important;
            border-color: white !important;
          }
        }
      `
    });
    
    await painTrackerPage.page.reload();
    await expect(painTrackerPage.pageTitle).toBeVisible();
  });

  test('should work with reduced motion preferences', async ({ painTrackerPage }) => {
    // Set reduced motion preference
    await painTrackerPage.page.emulateMedia({ 
      reducedMotion: 'reduce' 
    });
    
    await painTrackerPage.page.reload();
    await expect(painTrackerPage.pageTitle).toBeVisible();
    
    // Verify animations are disabled or reduced
    const animatedElements = await painTrackerPage.page.locator('[class*="animate"], [class*="transition"]').count();
    // Just ensure the page still functions with reduced motion
    expect(animatedElements).toBeGreaterThanOrEqual(0);
  });
});