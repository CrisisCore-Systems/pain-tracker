import { test, expect } from '../test-setup';

test('submit -> admin verify -> public publish flow', async ({ page }) => {
  const uniq = `e2e-${Date.now()}`;
  const quote = `This is an e2e test story ${uniq}`;

  // Intercept submission POST to return a created testimonial with id
  await page.route('**/api/landing/testimonial', async (route) => {
    const req = route.request();
    if (req.method() === 'POST') {
      route.fulfill({ status: 201, body: JSON.stringify({ ok: true, created: { id: 9999, quote, anonymized: false, name: 'E2E Test', role: 'Patient', created_at: new Date().toISOString(), verified: false } }) });
      return;
    }
    route.continue();
  });

  await page.goto('/submit-story');
  await page.fill('[id=submit-story-text]', quote);
  // The consent label may be long; choose the checkbox by selector (the second checkbox) to ensure consent
  const checkboxes = page.locator('input[type=checkbox]');
  await checkboxes.nth(1).check();
  await page.click('text=Submit');
  await expect(page.locator('text=Thank you for sharing your story')).toBeVisible();

  // Now open admin portal and stub testimonials list and verify endpoint
  await page.goto('/clinic/testimonials');
  // Set a fake clinic access token so client adds Authorization header
  await page.evaluate(() => localStorage.setItem('clinic_access_token', 'test-admin-token'));

  // Intercept GET list of unverified testimonials
  await page.route('**/api/landing/testimonials?verified=false', async (route) => {
    route.fulfill({ status: 200, body: JSON.stringify({ ok: true, testimonials: [{ id: 9999, quote, anonymized: false, name: 'E2E Test', role: 'Patient', created_at: new Date().toISOString(), verified: false }] }) });
  });

  // Intercept verify POST and respond success
  await page.route('**/api/landing/testimonials_verify', async (route) => {
    const body = await route.request().postData();
    // Echo the request as successful
    route.fulfill({ status: 200, body: JSON.stringify({ ok: true, updated: JSON.parse(body || '{}') }) });
  });

  // Simulate clicking the verify button
  await expect(page.locator('text=E2E Test')).toBeVisible();
  await page.click('text=Verify');

  // Now the public testimonials should show verified entries; intercept GET verified=true
  await page.goto('/');
  await page.route('**/api/landing/testimonials?verified=true', async (route) => {
    route.fulfill({ status: 200, body: JSON.stringify({ ok: true, testimonials: [{ id: 9999, quote, anonymized: false, name: 'E2E Test', role: 'Patient', created_at: new Date().toISOString(), verified: true }] }) });
  });
  // Ensure the verified testimonial appears on the landing page
  await expect(page.locator(`text=${quote}`)).toBeVisible();
});
