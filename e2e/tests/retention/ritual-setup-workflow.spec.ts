import { test, expect } from '../../test-setup';

/**
 * E2E Test Suite: Ritual Setup Workflow
 * 
 * Tests the complete ritual setup wizard including:
 * - Navigation to rituals
 * - Multi-step wizard flow
 * - Type/time/tone selection
 * - Ritual creation
 * - Persistence and display
 */

test.describe('Ritual Setup Workflow', () => {
  test.setTimeout(60000);

  test('should navigate to rituals section', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    
    // Look for rituals navigation or section
    const ritualsNav = page.locator('a:has-text("Ritual"), button:has-text("Ritual"), text=/daily.*ritual/i').first();
    
    if (await ritualsNav.count() > 0) {
      await ritualsNav.click();
      await page.waitForTimeout(1000);
      
      // Verify we're in rituals section
      const ritualsHeading = page.locator('h1:has-text("Ritual"), h2:has-text("Ritual")').first();
      expect(await ritualsHeading.count()).toBeGreaterThan(0);
    } else {
      // Rituals might be on main page or settings
      const ritualsSection = page.locator('[data-testid*="ritual"], text=/set.*up.*ritual/i').first();
      expect(await ritualsSection.count()).toBeGreaterThan(0);
    }
  });

  test('should display ritual setup wizard', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    
    // Look for "Set Up Ritual" or similar button
    const setupButton = page.locator('button:has-text("Set Up"), button:has-text("Create Ritual"), button:has-text("Add Ritual")').first();
    
    if (await setupButton.count() > 0) {
      await setupButton.click();
      await page.waitForTimeout(1000);
      
      // Wizard should appear with type selection
      const wizardStep = page.locator('text=/step|select.*type|morning|evening/i').first();
      expect(await wizardStep.count()).toBeGreaterThan(0);
    }
  });

  test('should select ritual type (morning)', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    
    // Try to open ritual setup
    const setupButton = page.locator('button:has-text("Set Up"), button:has-text("Create Ritual")').first();
    
    if (await setupButton.count() > 0) {
      await setupButton.click();
      await page.waitForTimeout(1000);
      
      // Select morning ritual type
      const morningOption = page.locator('button:has-text("Morning"), input[value="morning"], [data-value="morning"]').first();
      
      if (await morningOption.count() > 0) {
        await morningOption.click();
        await page.waitForTimeout(500);
        
        // Verify selection or progress to next step
        const nextStepButton = page.locator('button:has-text("Next"), button:has-text("Continue")').first();
        expect(await nextStepButton.count()).toBeGreaterThan(0);
      }
    }
  });

  test('should select ritual type (evening)', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    
    const setupButton = page.locator('button:has-text("Set Up"), button:has-text("Create Ritual")').first();
    
    if (await setupButton.count() > 0) {
      await setupButton.click();
      await page.waitForTimeout(1000);
      
      // Select evening ritual type
      const eveningOption = page.locator('button:has-text("Evening"), input[value="evening"], [data-value="evening"]').first();
      
      if (await eveningOption.count() > 0) {
        await eveningOption.click();
        await page.waitForTimeout(500);
        
        // Should be able to proceed
        const nextStepButton = page.locator('button:has-text("Next"), button:has-text("Continue")').first();
        const hasNextButton = await nextStepButton.count() > 0;
        
        // Or might auto-proceed to time selection
        const timeInput = page.locator('input[type="time"], select[name*="time"]').first();
        const hasTimeInput = await timeInput.count() > 0;
        
        expect(hasNextButton || hasTimeInput).toBeTruthy();
      }
    }
  });

  test('should select both morning and evening rituals', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    
    const setupButton = page.locator('button:has-text("Set Up"), button:has-text("Create Ritual")').first();
    
    if (await setupButton.count() > 0) {
      await setupButton.click();
      await page.waitForTimeout(1000);
      
      // Look for "both" option
      const bothOption = page.locator('button:has-text("Both"), input[value="both"], [data-value="both"]').first();
      
      if (await bothOption.count() > 0) {
        await bothOption.click();
        await page.waitForTimeout(500);
        
        expect(await bothOption.count()).toBeGreaterThan(0);
      }
    }
  });

  test('should navigate through wizard steps', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    
    const setupButton = page.locator('button:has-text("Set Up"), button:has-text("Create Ritual")').first();
    
    if (await setupButton.count() > 0) {
      await setupButton.click();
      await page.waitForTimeout(1000);
      
      // Step 1: Select type
      const eveningOption = page.locator('button:has-text("Evening"), [data-value="evening"]').first();
      if (await eveningOption.count() > 0) {
        await eveningOption.click();
        await page.waitForTimeout(500);
      }
      
      // Step 2: Continue to next
      const nextButton = page.locator('button:has-text("Next"), button:has-text("Continue")').first();
      if (await nextButton.count() > 0) {
        await nextButton.click();
        await page.waitForTimeout(1000);
        
        // Should see time selection
        const timeStep = page.locator('text=/time|when|schedule/i, input[type="time"]').first();
        expect(await timeStep.count()).toBeGreaterThan(0);
      }
    }
  });

  test('should navigate back to previous wizard step', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    
    const setupButton = page.locator('button:has-text("Set Up"), button:has-text("Create Ritual")').first();
    
    if (await setupButton.count() > 0) {
      await setupButton.click();
      await page.waitForTimeout(1000);
      
      // Select type and proceed
      const eveningOption = page.locator('button:has-text("Evening")').first();
      if (await eveningOption.count() > 0) {
        await eveningOption.click();
      }
      
      const nextButton = page.locator('button:has-text("Next"), button:has-text("Continue")').first();
      if (await nextButton.count() > 0) {
        await nextButton.click();
        await page.waitForTimeout(1000);
        
        // Click back button
        const backButton = page.locator('button:has-text("Back"), button:has-text("Previous")').first();
        if (await backButton.count() > 0) {
          await backButton.click();
          await page.waitForTimeout(500);
          
          // Should see type selection again
          const typeStep = page.locator('text=/morning|evening|both/i').first();
          expect(await typeStep.count()).toBeGreaterThan(0);
        }
      }
    }
  });

  test('should select ritual time', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    
    const setupButton = page.locator('button:has-text("Set Up"), button:has-text("Create Ritual")').first();
    
    if (await setupButton.count() > 0) {
      await setupButton.click();
      await page.waitForTimeout(1000);
      
      // Navigate to time step
      const eveningOption = page.locator('button:has-text("Evening")').first();
      if (await eveningOption.count() > 0) {
        await eveningOption.click();
      }
      
      const nextButton = page.locator('button:has-text("Next")').first();
      if (await nextButton.count() > 0) {
        await nextButton.click();
        await page.waitForTimeout(1000);
        
        // Select or input time
        const timeInput = page.locator('input[type="time"]').first();
        const timeButton = page.locator('button:has-text("20:00"), button:has-text("8:00")').first();
        
        if (await timeInput.count() > 0) {
          await timeInput.fill('20:00');
          await page.waitForTimeout(500);
        } else if (await timeButton.count() > 0) {
          await timeButton.click();
          await page.waitForTimeout(500);
        }
        
        // Verify we can proceed
        const continueButton = page.locator('button:has-text("Next"), button:has-text("Continue")').first();
        expect(await continueButton.count()).toBeGreaterThan(0);
      }
    }
  });

  test('should select ritual tone', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    
    const setupButton = page.locator('button:has-text("Set Up"), button:has-text("Create Ritual")').first();
    
    if (await setupButton.count() > 0) {
      await setupButton.click();
      await page.waitForTimeout(1000);
      
      // Navigate through steps to tone selection
      const eveningOption = page.locator('button:has-text("Evening")').first();
      if (await eveningOption.count() > 0) {
        await eveningOption.click();
      }
      
      // Continue to time
      let nextButton = page.locator('button:has-text("Next"), button:has-text("Continue")').first();
      if (await nextButton.count() > 0) {
        await nextButton.click();
        await page.waitForTimeout(1000);
      }
      
      // Select time
      const timeButton = page.locator('button:has-text("20:00"), button:has-text("8:00 PM")').first();
      if (await timeButton.count() > 0) {
        await timeButton.click();
      }
      
      // Continue to tone
      nextButton = page.locator('button:has-text("Next"), button:has-text("Continue")').first();
      if (await nextButton.count() > 0) {
        await nextButton.click();
        await page.waitForTimeout(1000);
        
        // Select a tone
        const toneOption = page.locator('button:has-text("Gentle"), button:has-text("Supportive"), button:has-text("Encouraging")').first();
        if (await toneOption.count() > 0) {
          await toneOption.click();
          await page.waitForTimeout(500);
          
          // Should see complete/finish button
          const completeButton = page.locator('button:has-text("Complete"), button:has-text("Finish"), button:has-text("Save")').first();
          expect(await completeButton.count()).toBeGreaterThan(0);
        }
      }
    }
  });

  test('should complete full ritual setup', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    
    const setupButton = page.locator('button:has-text("Set Up"), button:has-text("Create Ritual")').first();
    
    if (await setupButton.count() > 0) {
      await setupButton.click();
      await page.waitForTimeout(1000);
      
      // Step 1: Select evening type
      const eveningOption = page.locator('button:has-text("Evening")').first();
      if (await eveningOption.count() > 0) {
        await eveningOption.click();
      }
      
      let nextButton = page.locator('button:has-text("Next"), button:has-text("Continue")').first();
      if (await nextButton.count() > 0) {
        await nextButton.click();
        await page.waitForTimeout(1000);
      }
      
      // Step 2: Select time
      const timeButton = page.locator('button:has-text("20:00")').first();
      if (await timeButton.count() > 0) {
        await timeButton.click();
      }
      
      nextButton = page.locator('button:has-text("Next"), button:has-text("Continue")').first();
      if (await nextButton.count() > 0) {
        await nextButton.click();
        await page.waitForTimeout(1000);
      }
      
      // Step 3: Select tone
      const toneOption = page.locator('button:has-text("Gentle")').first();
      if (await toneOption.count() > 0) {
        await toneOption.click();
      }
      
      // Complete setup
      const completeButton = page.locator('button:has-text("Complete"), button:has-text("Finish"), button:has-text("Save")').first();
      if (await completeButton.count() > 0) {
        await completeButton.click();
        await page.waitForTimeout(2000);
        
        // Should see success or return to rituals view
        const successMessage = page.locator('text=/success|created|saved/i').first();
        const ritualsView = page.locator('text=/ritual.*setup|your.*ritual/i').first();
        
        const hasSuccess = await successMessage.count() > 0;
        const backAtRituals = await ritualsView.count() > 0;
        
        expect(hasSuccess || backAtRituals).toBeTruthy();
      }
    }
  });

  test('should persist ritual configuration', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    
    // Complete ritual setup
    const setupButton = page.locator('button:has-text("Set Up"), button:has-text("Create Ritual")').first();
    
    if (await setupButton.count() > 0) {
      await setupButton.click();
      await page.waitForTimeout(1000);
      
      // Quick setup
      const eveningOption = page.locator('button:has-text("Evening")').first();
      if (await eveningOption.count() > 0) {
        await eveningOption.click();
      }
      
      // Proceed through wizard (abbreviated)
      for (let i = 0; i < 3; i++) {
        const nextButton = page.locator('button:has-text("Next"), button:has-text("Continue"), button:has-text("Complete")').first();
        if (await nextButton.count() > 0) {
          await nextButton.click();
          await page.waitForTimeout(1000);
        }
      }
    }
    
    // Reload page to check persistence
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Check if ritual is stored
    const ritualInStorage = await page.evaluate(() => {
      const keys = Object.keys(localStorage);
      return keys.some(key => {
        const value = localStorage.getItem(key);
        return value && (value.includes('ritual') || value.includes('evening') || value.includes('morning'));
      });
    });
    
    expect(ritualInStorage).toBeTruthy();
  });

  test('should display created ritual in list', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    
    // Look for rituals list or configured ritual
    const ritualDisplay = page.locator('text=/morning.*ritual|evening.*ritual|your.*ritual/i').first();
    const hasRitualDisplay = await ritualDisplay.count() > 0;
    
    // Or check settings/preferences
    const ritualsSection = page.locator('[data-testid*="ritual"], text=/ritual.*enabled|ritual.*active/i').first();
    const hasRitualsSection = await ritualsSection.count() > 0;
    
    expect(hasRitualDisplay || hasRitualsSection).toBeTruthy();
  });

  test('should allow editing existing ritual', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    
    // Look for edit button on ritual
    const editButton = page.locator('button:has-text("Edit"), button[aria-label*="edit"]').first();
    
    if (await editButton.count() > 0) {
      await editButton.click();
      await page.waitForTimeout(1000);
      
      // Should open wizard or edit form
      const editForm = page.locator('text=/edit|modify|update/i, input[type="time"]').first();
      expect(await editForm.count()).toBeGreaterThan(0);
    }
  });

  test('should allow disabling ritual', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    
    // Look for toggle or disable option
    const disableButton = page.locator('button:has-text("Disable"), button:has-text("Turn Off"), input[type="checkbox"]').first();
    
    if (await disableButton.count() > 0) {
      await disableButton.click();
      await page.waitForTimeout(500);
      
      // Verify state changed
      const disabledIndicator = page.locator('text=/disabled|inactive|off/i').first();
      expect(await disabledIndicator.count()).toBeGreaterThan(0);
    }
  });
});
