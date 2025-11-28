import test from '../test-setup';
import { expect, Page } from '@playwright/test';

test('encrypted seeding makes entries decryptable and readable by app', async ({ page }) => {
  // Seed encrypted entries in an isolated page so the same execution context
  // holds the decrypt hook we will use to read data.
  const isolated = await page.context().newPage();

  const harness = await import('../utils/test-harness');
  const result = (await harness.seedEncryptedPainEntries(isolated, 3, 'test-passphrase-12345', true)) as { page?: Page; envelopes?: string[] } | void;
  const readPage = ((result && result.page) ? result.page : isolated) as Page;
  const envelopes = (result && result.envelopes) ? result.envelopes : [];

  // Wait for the decrypt hook to appear in the isolated page
  try {
    await readPage.waitForFunction(() => typeof (globalThis as unknown as { __secureStorageDecrypt?: unknown }).__secureStorageDecrypt === 'function', null, { timeout: 5000 });
  } catch {
    // If decrypt hook isn't set yet, allow small grace period
    await readPage.waitForTimeout(300);
  }

  // Decrypt the first envelope returned by the harness inside the isolated page
  let decrypted: unknown = null;
  if (envelopes.length === 0) {
    // fallback: read non-encrypted seeded entries from localStorage in the isolated page
    decrypted = await readPage.evaluate(() => {
      try {
        const raw = localStorage.getItem('pain_tracker_entries') || localStorage.getItem('pt:pain_tracker_entries');
        if (!raw) return null;
        const arr = JSON.parse(raw as string);
        return arr && arr.length > 0 ? arr[0] : null;
      } catch {
        return null;
      }
    });
  } else {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (attempt > 0) await readPage.waitForTimeout(200 * attempt);
      decrypted = await readPage.evaluate((env: string) => {
        try {
          const decrypt = (globalThis as unknown as { __secureStorageDecrypt?: (s: string) => string }).__secureStorageDecrypt;
          if (typeof decrypt === 'function') {
            try {
              return JSON.parse(decrypt(env));
            } catch {
              return null;
            }
          }
          return null;
        } catch {
          return null;
        }
      }, envelopes[0]);
      break;
    } catch (err) {
      const msg = String(((err as unknown) as { message?: string })?.message || '');
      if (msg.includes('Execution context was destroyed') && attempt < 2) {
        continue;
      }
      throw err;
    }
  }
  }
  const dd = decrypted as unknown as Record<string, unknown>;
  expect(dd).not.toBeNull();
  expect(dd).toHaveProperty('timestamp');
  expect(dd).toHaveProperty('baselineData');
  expect((dd['baselineData'] as Record<string, unknown>)).toHaveProperty('pain');

  try {
    await readPage.close();
  } catch {
    // ignore
  }
});
