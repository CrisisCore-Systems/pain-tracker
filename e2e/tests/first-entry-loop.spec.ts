import { expect, test } from '@playwright/test';

test('resource visitor can save one local entry offline and reach bounded next actions', async ({
  context,
  page,
}) => {
  await context.addInitScript(() => {
    localStorage.setItem('pt:test_mode', '1');
    localStorage.setItem('pain-tracker-onboarding-completed', 'true');
    localStorage.setItem('pt:pain-tracker-onboarding-completed', JSON.stringify('true'));
    localStorage.setItem('pain_tracker_entries', '[]');
    localStorage.setItem('pt:pain_tracker_entries', '[]');
    localStorage.setItem('pain-tracker-notification-consent', 'declined');
    localStorage.setItem('pain-tracker-analytics-consent', JSON.stringify({ consented: false }));
  });

  await page.goto('/resources/daily-pain-tracker-printable');

  const startEntry = page.getByRole('link', { name: 'Start a private pain entry', exact: true });
  await expect(startEntry).toBeVisible();
  await startEntry.click();
  await expect(page).toHaveURL(/\/app$/);

  await expect(page.getByRole('heading', { name: 'First Pain Entry', exact: true })).toBeVisible();
  await expect(page.getByText(/No account is required/i)).toBeVisible();

  const suspiciousRequests: string[] = [];
  let observeSaveRequests = false;
  page.on('request', request => {
    if (!observeSaveRequests) return;
    if (!['fetch', 'xhr'].includes(request.resourceType())) return;

    const url = request.url();
    if (
      /analytics|collect|feedback|intake|weather/i.test(url) ||
      !url.startsWith('http://localhost:3000')
    ) {
      suspiciousRequests.push(url);
    }
  });

  await context.setOffline(true);
  observeSaveRequests = true;
  await page.getByRole('button', { name: /^(log pain now|save( and finish)?( entry)?)$/i }).click();

  const confirmation = page.getByRole('region', { name: /Saved on this device/i });
  await expect(confirmation).toBeVisible();
  await expect(confirmation).toBeFocused();

  const nextActions = page.getByRole('group', { name: 'Next actions' });
  await expect(nextActions.getByRole('button')).toHaveCount(3);
  await expect(nextActions.getByRole('button', { name: 'Add another entry' })).toBeVisible();
  await expect(nextActions.getByRole('button', { name: 'Export printable report' })).toBeVisible();
  await expect(nextActions.getByRole('button', { name: 'Draft feedback manually' })).toBeVisible();
  expect(suspiciousRequests).toEqual([]);

  await nextActions.getByRole('button', { name: 'Draft feedback manually' }).click();
  await expect(page.getByText(/Email may reveal your address/i)).toBeVisible();
  await expect(page.getByText(/stays on your device until you copy it/i)).toBeVisible();

  observeSaveRequests = false;
  await context.setOffline(false);
  await nextActions.getByRole('button', { name: 'Export printable report' }).click();
  await expect(page.getByRole('heading', { name: 'Reports & Export' })).toBeVisible();
});
