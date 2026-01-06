import { test as baseTest } from '@playwright/test';
import {
  disableOnboarding,
  seedPainEntries,
  seedEncryptedPainEntries,
} from './utils/test-harness';
import { deleteVaultDb } from './utils/test-harness';

// Extend the base test with configurable fixtures: seedCount (default 7)
// and seedEncrypted (default false) to opt into encrypted seeding.
export const test = baseTest.extend<{
  seedCount: number;
  seedEncrypted: boolean;
  seedPassphrase: string;
}>(
  {
    // allow tests to override seedCount via `test.use({ seedCount: 3 })`
    seedCount: [7, { option: true }],
    // allow tests to opt into encrypted DB seeding
    seedEncrypted: [false, { option: true }],
    // allow tests to configure the vault passphrase used during seeded vault setup
    seedPassphrase: ['test-passphrase-12345', { option: true }],
  }
);

// Run the harness before each test to reduce flakiness across suites that opt in.
test.beforeEach(async ({ page, seedCount, seedEncrypted, seedPassphrase }) => {
  await disableOnboarding(page);
  // Prevent external analytics from loading during E2E runs (stops CSP errors and flakiness)
  // Block network requests to Google Analytics / Tag Manager and provide a no-op gtag implementation.
  try {
    // Block known external analytics hosts to avoid network calls in CI
    await page.context().route('**://www.googletagmanager.com/**', (route) => route.abort());
    await page.context().route('**://www.google-analytics.com/**', (route) => route.abort());
    await page.context().route('**://analytics.google.com/**', (route) => route.abort());
    await page.context().route('**://region1.analytics.google.com/**', (route) => route.abort());
    await page.context().route('**://region1.google-analytics.com/**', (route) => route.abort());

    // Block other third-party CDNs used only for optional assets in dev.
    await page.context().route('**://cdn.jsdelivr.net/**', (route) => route.abort());
    await page.context().route('**://static.cloudflareinsights.com/**', (route) => route.abort());
    await page.context().route('**://fonts.googleapis.com/**', (route) => route.abort());
    await page.context().route('**://fonts.gstatic.com/**', (route) => route.abort());

    // Provide a small init script that creates a no-op gtag and fakes persistent storage
    // so app code that requests persistent storage won't log or branch unexpectedly during tests.
    await page.context().addInitScript(() => {
      const w = window as unknown as {
        dataLayer?: unknown[][];
        gtag?: (...args: unknown[]) => void;
      };

      w.dataLayer = w.dataLayer ?? [];
      w.gtag = (...args: unknown[]) => {
        w.dataLayer = w.dataLayer ?? [];
        w.dataLayer.push(args);
      };

      try {
        // Mock navigator.storage.persist/persisted for tests (so app sees persistent storage as granted)
        const nav = navigator as unknown as {
          storage?: {
            persist?: () => Promise<boolean>;
            persisted?: () => Promise<boolean>;
          };
        };

        if (nav.storage) {
          nav.storage.persist = () => Promise.resolve(true);
          nav.storage.persisted = () => Promise.resolve(true);
        } else {
          Object.defineProperty(navigator, 'storage', {
            value: {
              persist: () => Promise.resolve(true),
              persisted: () => Promise.resolve(true),
            },
            configurable: true,
          });
        }
      } catch {
        // ignore
      }
    });

    // Filter noisy CSP-related console messages in tests so only real errors surface.
    page.on('console', (msg) => {
      try {
        const text = msg.text();
        if (
          text.includes('Content Security Policy') ||
          text.includes('Refused to load') ||
          text.includes('Refused to execute inline script') ||
          text.includes('Refused to apply inline style')
        ) {
          // drop CSP noise
          return;
        }
      } catch {
        /* ignore */
      }
      // Forward other console messages for debugging
      // Use console.log for debug output
      console.log('[page]', msg.type(), msg.text());
    });
  } catch {
    // ignore if routing isn't available in this environment
  }
  if (seedEncrypted) {
    // when encrypted seeding is requested, drive the app and create encrypted entries
    await seedEncryptedPainEntries(page, seedCount, seedPassphrase);
  } else {
    // default fast fallback: write plain fallback keys before load
    await seedPainEntries(page, seedCount);
  }
});

// Cleanup: if we created encrypted DBs for this test, delete the vault DB afterwards
test.afterEach(async ({ page, seedEncrypted }) => {
  if (seedEncrypted) {
    await deleteVaultDb(page);
    // also remove test-mode localStorage keys to reset state
    await page.evaluate(() => {
      try {
        localStorage.removeItem('pt:test_mode');
        localStorage.removeItem('pain_tracker_entries');
        localStorage.removeItem('pt:pain_tracker_entries');
        localStorage.removeItem('pt:pain-tracker-onboarding-completed');
      } catch {
        // ignore
      }
    });
  }
});

export const expect = test.expect;

export default test;
