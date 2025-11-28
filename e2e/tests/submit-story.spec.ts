import { test, expect } from '../test-setup';

test('submit story flow', async ({ page }) => {
  await page.goto('/submit-story');
  await expect(page.locator('h1')).toHaveText(/Share your story/);

  await page.fill('[id=submit-story-text]', 'This is an e2e test story');
  await page.check('text=I consent to my story');
  await page.click('text=Submit');

  // Wait for success page
  await expect(page.locator('text=Thank you for sharing your story')).toBeVisible();
});
