import { Page, Locator, expect } from '@playwright/test';

export class PainTrackerPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly painLevelSlider: Locator;
  readonly painLevelLabel: Locator;
  readonly locationButtons: Locator;
  readonly symptomButtons: Locator;
  readonly nextButton: Locator;
  readonly previousButton: Locator;
  readonly submitButton: Locator;
  readonly wcbReportToggle: Locator;
  readonly helpButton: Locator;
  readonly painEntriesSection: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByText('Pain Tracker');
    this.painLevelSlider = page.locator('#pain-level');
    this.painLevelLabel = page.getByText(/Pain Level:/);
    this.locationButtons = page.locator('[role="checkbox"][aria-label*="Pain location"]');
    this.symptomButtons = page.locator('[role="checkbox"][aria-label*="symptom"]');
    this.nextButton = page.getByRole('button', { name: /next/i });
    this.previousButton = page.getByRole('button', { name: /previous|back/i });
    this.submitButton = page.getByRole('button', { name: /submit|save entry/i });
    this.wcbReportToggle = page.getByText(/show wcb report|hide wcb report/i);
    this.helpButton = page.getByRole('button', { name: /help/i });
    this.painEntriesSection = page.locator('[data-testid="pain-entries"], .pain-entries');
  }

  async goto() {
    await this.page.goto('/');
    await expect(this.pageTitle).toBeVisible();
  }

  async fillBasicPainEntry(data: {
    intensity: number;
    locations: string[];
    symptoms?: string[];
  }) {
    // Set pain level
    await this.painLevelSlider.fill(data.intensity.toString());
    
    // Select locations
    for (const location of data.locations) {
      const locationButton = this.page.locator(`[role="checkbox"][aria-label*="${location}"]`);
      await locationButton.click();
    }
    
    // Select symptoms if provided
    if (data.symptoms) {
      // Need to navigate to symptoms section - might require clicking next
      const symptomsSection = this.page.getByText('Symptoms');
      if (await symptomsSection.isVisible()) {
        for (const symptom of data.symptoms) {
          const symptomButton = this.page.locator(`[role="checkbox"][aria-label*="${symptom}"]`);
          await symptomButton.click();
        }
      }
    }
  }

  async navigateFormSections() {
    // Navigate through the multi-step form
    let hasNext = true;
    const maxSections = 7; // Prevent infinite loop
    let sectionCount = 0;
    
    while (hasNext && sectionCount < maxSections) {
      if (await this.nextButton.isVisible()) {
        await this.nextButton.click();
        await this.page.waitForTimeout(200); // Wait for section transition
        sectionCount++;
      } else {
        hasNext = false;
      }
    }
  }

  async submitPainEntry() {
    // Navigate to final section and submit
    await this.navigateFormSections();
    
    if (await this.submitButton.isVisible()) {
      await this.submitButton.click();
    } else {
      // Try alternative button names
      const saveButton = this.page.getByRole('button', { name: /save|add entry/i });
      if (await saveButton.isVisible()) {
        await saveButton.click();
      }
    }
    
    // Wait for submission to complete
    await this.page.waitForTimeout(500);
  }

  async openAnalytics() {
    // Look for analytics or chart section
    const analyticsButton = this.page.getByText(/analytics|charts|trends/i);
    if (await analyticsButton.isVisible()) {
      await analyticsButton.click();
    } else {
      // Analytics might be in a tab or separate section
      const tabs = this.page.locator('[role="tab"]');
      const tabCount = await tabs.count();
      for (let i = 0; i < tabCount; i++) {
        const tab = tabs.nth(i);
        const tabText = await tab.textContent();
        if (tabText && /analytics|chart|trend/i.test(tabText)) {
          await tab.click();
          break;
        }
      }
    }
  }

  async exportData(format: 'json' | 'pdf' = 'json') {
    // Look for export functionality
    const exportButton = this.page.getByText(/export|download/i);
    if (await exportButton.isVisible()) {
      await exportButton.click();
      
      if (format === 'json') {
        await this.page.getByText(/json/i).click();
      } else {
        await this.page.getByText(/pdf/i).click();
      }
    }
  }

  async toggleWCBReport() {
    await this.wcbReportToggle.click();
    // Wait for WCB report section to appear/disappear
    await this.page.waitForTimeout(300);
  }

  async verifyPainEntryExists(criteria: { intensity?: number; location?: string }) {
    // Check if entry exists in the pain history or entries list
    if (criteria.intensity) {
      await expect(this.page.getByText(criteria.intensity.toString())).toBeVisible();
    }
    if (criteria.location) {
      await expect(this.page.getByText(criteria.location)).toBeVisible();
    }
  }

  async getPainEntriesCount(): Promise<number> {
    // Try to find entries in pain history or similar section
    const entries = this.page.locator('.pain-entry, [data-entry], .entry-item');
    await entries.first().waitFor({ state: 'attached', timeout: 2000 }).catch(() => {});
    return await entries.count();
  }

  async clearAllData() {
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await this.page.reload();
    await expect(this.pageTitle).toBeVisible();
  }
}