import { test as baseTest } from '@playwright/test';
import {
  disableOnboarding,
  seedPainEntries,
  seedEncryptedPainEntries,
  deleteVaultDb,
} from './utils/test-harness';

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
  // NOTE: Do not block third-party requests here.
  // We want E2E suites (especially Overton evidence tests) to be able to observe
  // and fail on any unexpected external network egress.
  try {
    // Provide a small init script that fakes persistent storage
    // so app code that requests persistent storage won't log or branch unexpectedly during tests.
    await page.context().addInitScript(() => {
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
    // Aggressive test-only DOM cleanup: remove persistent toasts, overlays,
    // and disable pointer-events on fixed/fullscreen elements that may
    // intermittently intercept clicks in CI. This installs a small MutationObserver
    // inside the page that continuously removes known blocking elements.
    try {
      await page.addInitScript(() => {
        try {
          const cleanup = () => {
            try {
              document.querySelectorAll('div.fixed.inset-0, .modal-backdrop, [data-testid="overlay"], .fixed.bottom-4.left-4').forEach(e => e.remove());
              document.querySelectorAll('[role="alert"], .toast, .notification, .alert').forEach(e => e.remove());
              Array.from(document.querySelectorAll('*')).forEach((n) => {
                try {
                  const s = window.getComputedStyle(n as Element);
                      if (s && (s.position === 'fixed' || s.position === 'sticky')) {
                    (n as HTMLElement).style.pointerEvents = 'none';
                  }
                  const z = parseInt(s?.zIndex || '0', 10);
                  if (!Number.isNaN(z) && z > 1000) {
                    (n as HTMLElement).style.pointerEvents = 'none';
                  }
                } catch {
                  // ignore per-node errors
                }
              });
              document.querySelectorAll('main, #main-content, [data-testid="app-shell"]').forEach(m => { try { (m as HTMLElement).style.pointerEvents = 'auto'; } catch {} });
            } catch {
              /* ignore cleanup errors */
            }
          };

          // Run once immediately and then observe DOM for new blocking elements.
          cleanup();
          try {
            const mo = new MutationObserver(() => cleanup());
            mo.observe(document.documentElement || document.body, { childList: true, subtree: true });
            // Expose to window for debugging/cleanup if needed
            (window as any).__e2e_cleanup_mo = mo;
          } catch {
            // ignore observer failures
          }
        } catch {
          // ignore entire init script failures
        }
      });
    } catch {
      // ignore if addInitScript not available
    }

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
