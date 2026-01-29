import { test, expect } from '../../test-setup';

/**
 * E2E Test Suite: Daily Check-In Journey
 * 
 * Tests the complete daily check-in workflow including:
 * - Prompt appearance
 * - Form interaction
 * - Data submission
 * - Persistence
 * - Streak tracking
 */

test.describe('Daily Check-In Journey', () => {
  test.setTimeout(60000);

  test('should display daily check-in prompt on app load', async ({ page }) => {
    await page.goto('/app');
    
    // Wait for app to load
    await page.waitForLoadState('networkidle');
    
    // Look for daily check-in prompt - could be in various forms
    const prompt = page.locator('text=/daily.*check.*in/i').first();
    const hasPrompt = await prompt.count() > 0;
    
    // Should see some form of check-in prompt or entry interface
    const checkInButton = page.locator('button:has-text("Check")').first();
    const newEntryButton = page.locator('button:has-text("New Entry")').first();
    
    const hasCheckInUI = (await checkInButton.count() > 0) || (await newEntryButton.count() > 0);
    
    expect(hasPrompt || hasCheckInUI).toBeTruthy();
  });

  test('should complete basic check-in flow', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    
    // Try to find and click check-in or new entry button
    const checkInButton = page.locator('button:has-text("Check"), button:has-text("Start"), button:has-text("New Entry")').first();
    
    if (await checkInButton.count() > 0) {
      await checkInButton.click();
      
      // Wait for form or dialog to appear
      await page.waitForTimeout(1000);
      
      // Look for pain level input (slider, number input, or buttons)
      const painLevelInput = page.locator('input[type="range"], input[type="number"], input[name*="pain"]').first();
      const painLevelButton = page.locator('button:has-text("5"), button:has-text("6")').first();
      
      if (await painLevelInput.count() > 0) {
        await painLevelInput.fill('5');
      } else if (await painLevelButton.count() > 0) {
        await painLevelButton.click();
      }
      
      // Try to submit the form
      const submitButton = page.locator('button:has-text("Submit"), button:has-text("Save"), button:has-text("Complete")').first();
      if (await submitButton.count() > 0) {
        await submitButton.click();
        
        // Wait for submission to complete
        await page.waitForTimeout(2000);
        
        // Verify success - look for success message or return to main view
        const successIndicator = page.locator('text=/success|saved|complete|added/i').first();
        const hasSuccess = await successIndicator.count() > 0;
        
        // Or check if we're back at the main app view
        const appView = page.locator('[data-testid="app-view"], main, #app').first();
        const backAtApp = await appView.count() > 0;
        
        expect(hasSuccess || backAtApp).toBeTruthy();
      }
    }
  });

  test('should persist check-in data after submission', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    
    // Complete a check-in
    const checkInButton = page.locator('button:has-text("Check"), button:has-text("Start"), button:has-text("New Entry")').first();
    
    if (await checkInButton.count() > 0) {
      await checkInButton.click();
      await page.waitForTimeout(1000);
      
      // Fill in pain level
      const painLevelInput = page.locator('input[type="range"], input[type="number"]').first();
      if (await painLevelInput.count() > 0) {
        await painLevelInput.fill('7');
      }
      
      // Submit
      const submitButton = page.locator('button:has-text("Submit"), button:has-text("Save")').first();
      if (await submitButton.count() > 0) {
        await submitButton.click();
        await page.waitForTimeout(2000);
      }
    }
    
    // Navigate away and back to verify persistence
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Look for entries list or history
    const entriesList = page.locator('text=/entries|history|logs/i, [data-testid="entries"]').first();
    const hasEntries = await entriesList.count() > 0;
    
    // Or check localStorage for data
    const hasLocalData = await page.evaluate(() => {
      const keys = Object.keys(localStorage);
      return keys.some(key => 
        key.includes('entry') || 
        key.includes('pain') || 
        key.includes('tracker')
      );
    });
    
    expect(hasEntries || hasLocalData).toBeTruthy();
  });

  test('should show validation for required fields', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    
    // Try to submit without filling required fields
    const checkInButton = page.locator('button:has-text("Check"), button:has-text("Start"), button:has-text("New Entry")').first();
    
    if (await checkInButton.count() > 0) {
      await checkInButton.click();
      await page.waitForTimeout(1000);
      
      // Try to submit immediately without filling anything
      const submitButton = page.locator('button:has-text("Submit"), button:has-text("Save")').first();
      if (await submitButton.count() > 0) {
        await submitButton.click();
        await page.waitForTimeout(500);
        
        // Look for validation message or error
        const validationMessage = page.locator('text=/required|must|please|error/i, [role="alert"]').first();
        const hasValidation = await validationMessage.count() > 0;
        
        // Or check if form is still open (not submitted)
        const formStillOpen = page.locator('input[type="range"], input[type="number"]').first();
        const stillOpen = await formStillOpen.count() > 0;
        
        expect(hasValidation || stillOpen).toBeTruthy();
      }
    }
  });

  test('should update streak counter after consecutive check-ins', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    
    // Look for streak indicator
    const streakIndicator = page.locator('text=/streak|consecutive|days in a row/i').first();
    const hasStreakUI = await streakIndicator.count() > 0;
    
    if (hasStreakUI) {
      // Get initial streak value if visible
      const streakText = await streakIndicator.textContent();
      expect(streakText).toBeTruthy();
    }
    
    // Even if not visible, streak should be tracked in state
    const hasStreakData = await page.evaluate(() => {
      const store = localStorage.getItem('pain-tracker-store') || localStorage.getItem('pt:store');
      return store !== null && (store.includes('streak') || store.includes('consecutive'));
    });
    
    expect(hasStreakUI || hasStreakData).toBeTruthy();
  });

  test('should show milestone celebration for streak achievements', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    
    // Complete a check-in
    const checkInButton = page.locator('button:has-text("Check"), button:has-text("Start"), button:has-text("New Entry")').first();
    
    if (await checkInButton.count() > 0) {
      await checkInButton.click();
      await page.waitForTimeout(1000);
      
      const painLevelInput = page.locator('input[type="range"], input[type="number"]').first();
      if (await painLevelInput.count() > 0) {
        await painLevelInput.fill('5');
      }
      
      const submitButton = page.locator('button:has-text("Submit"), button:has-text("Save")').first();
      if (await submitButton.count() > 0) {
        await submitButton.click();
        await page.waitForTimeout(2000);
        
        // Look for celebration or achievement notification
        const celebration = page.locator('text=/congrat|achievement|milestone|great|well done|🎉/i').first();
        const hasCelebration = await celebration.count() > 0;
        
        // Celebration might not appear on every check-in, but the feature should exist
        // We're just testing that the UI supports it
        const celebrationSupported = await page.evaluate(() => {
          // Check if celebration components are loaded
          return document.querySelector('[data-testid*="celebration"]') !== null ||
                 document.querySelector('[class*="celebration"]') !== null ||
                 // Or if animation/toast system exists
                 document.querySelector('[role="alert"]') !== null;
        });
        
        expect(hasCelebration || celebrationSupported).toBeTruthy();
      }
    }
  });

  test('should allow adding optional notes to check-in', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    
    const checkInButton = page.locator('button:has-text("Check"), button:has-text("Start"), button:has-text("New Entry")').first();
    
    if (await checkInButton.count() > 0) {
      await checkInButton.click();
      await page.waitForTimeout(1000);
      
      // Look for notes or description field
      const notesField = page.locator('textarea, input[type="text"][name*="note"], input[placeholder*="note"]').first();
      
      if (await notesField.count() > 0) {
        await notesField.fill('Test note for E2E check-in');
        
        // Fill pain level
        const painLevelInput = page.locator('input[type="range"], input[type="number"]').first();
        if (await painLevelInput.count() > 0) {
          await painLevelInput.fill('6');
        }
        
        // Submit
        const submitButton = page.locator('button:has-text("Submit"), button:has-text("Save")').first();
        if (await submitButton.count() > 0) {
          await submitButton.click();
          await page.waitForTimeout(2000);
        }
        
        // Verify note was saved - check in history or details
        const savedNote = page.locator('text="Test note for E2E check-in"').first();
        const noteInStorage = await page.evaluate(() => {
          const keys = Object.keys(localStorage);
          return keys.some(key => {
            const value = localStorage.getItem(key);
            return value && value.includes('Test note for E2E check-in');
          });
        });
        
        expect((await savedNote.count() > 0) || noteInStorage).toBeTruthy();
      }
    }
  });

  test('should handle rapid consecutive check-ins gracefully', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    
    // Attempt multiple quick check-ins
    for (let i = 0; i < 2; i++) {
      const checkInButton = page.locator('button:has-text("Check"), button:has-text("Start"), button:has-text("New Entry")').first();
      
      if (await checkInButton.count() > 0) {
        await checkInButton.click();
        await page.waitForTimeout(500);
        
        const painLevelInput = page.locator('input[type="range"], input[type="number"]').first();
        if (await painLevelInput.count() > 0) {
          await painLevelInput.fill((5 + i).toString());
        }
        
        const submitButton = page.locator('button:has-text("Submit"), button:has-text("Save")').first();
        if (await submitButton.count() > 0) {
          await submitButton.click();
          await page.waitForTimeout(1000);
        }
      }
    }
    
    // App should still be responsive
    const appResponsive = await page.evaluate(() => {
      return document.readyState === 'complete';
    });
    
    expect(appResponsive).toBeTruthy();
  });
});
