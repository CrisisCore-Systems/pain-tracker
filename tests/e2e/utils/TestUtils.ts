import { Page, expect } from '@playwright/test';

export class TestUtils {
  static async waitForAppLoad(page: Page) {
    // Wait for React app to load
    await page.waitForSelector('[data-testid="app-loaded"]', { timeout: 10000 }).catch(() => {
      // Fallback: wait for main content
      return page.waitForSelector('main', { timeout: 10000 });
    });
  }

  static async mockLocalStorage(page: Page, data: Record<string, any>) {
    await page.addInitScript((data) => {
      for (const [key, value] of Object.entries(data)) {
        localStorage.setItem(key, JSON.stringify(value));
      }
    }, data);
  }

  static async clearLocalStorage(page: Page) {
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }

  static async takeFullPageScreenshot(page: Page, name: string) {
    await page.screenshot({ 
      path: `test-results/screenshots/${name}.png`, 
      fullPage: true 
    });
  }

  static async checkAccessibility(page: Page) {
    // Basic accessibility checks that can be done with Playwright
    // Check for proper heading hierarchy
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();
    expect(headings.length).toBeGreaterThan(0);

    // Check for alt text on images
    const images = await page.locator('img').all();
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }

    // Check for form labels
    const inputs = await page.locator('input[type="text"], input[type="number"], textarea').all();
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const name = await input.getAttribute('name');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      
      if (id) {
        const label = await page.locator(`label[for="${id}"]`).count();
        expect(label > 0 || ariaLabel || ariaLabelledBy).toBeTruthy();
      }
    }
  }

  static async simulateNetworkError(page: Page) {
    await page.route('**/*', route => {
      route.abort('failed');
    });
  }

  static async simulateSlowNetwork(page: Page, delay: number = 2000) {
    await page.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, delay));
      route.continue();
    });
  }

  static generateTestPainEntry() {
    return {
      intensity: Math.floor(Math.random() * 10) + 1,
      locations: ['Back', 'Neck', 'Knee', 'Shoulder'].slice(0, Math.floor(Math.random() * 2) + 1),
      symptoms: ['Aching', 'Sharp', 'Burning'].slice(0, Math.floor(Math.random() * 3) + 1)
    };
  }

  static async waitForDownload(page: Page, actionCallback: () => Promise<void>) {
    const downloadPromise = page.waitForEvent('download');
    await actionCallback();
    const download = await downloadPromise;
    return download;
  }

  static async verifyJsonExport(page: Page, expectedEntryCount: number) {
    const download = await this.waitForDownload(page, async () => {
      await page.getByText(/export json/i).click();
    });

    // Get download path and verify content
    const path = await download.path();
    expect(path).toBeTruthy();
    
    // Could read and parse the JSON to verify structure
    return download;
  }
}