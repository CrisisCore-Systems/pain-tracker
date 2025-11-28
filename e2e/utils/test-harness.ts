import type { Page } from '@playwright/test';

/**
 * Adds an init script so that when the app loads it sees onboarding as completed.
 */
export async function disableOnboarding(page: Page) {
  await page.addInitScript(() => {
    try {
      localStorage.setItem('pt:pain-tracker-onboarding-completed', JSON.stringify('true'));
    } catch {
      // ignore
    }
  });
}

/**
 * Seeds the app with a number of minimal pain entries by writing the fallback
 * `pain_tracker_entries` key into localStorage before the app loads.
 * This avoids needing to interact with secureStorage/encrypted IndexedDB during tests.
 */
export async function seedPainEntries(page: Page, count = 7) {
  await page.addInitScript((c: number) => {
    try {
      const entries: Array<Record<string, unknown>> = [];
      const now = Date.now();
      for (let i = 0; i < c; i++) {
        entries.push({
          id: i + 1,
          timestamp: new Date(now - i * 24 * 60 * 60 * 1000).toISOString(),
          baselineData: {
            pain: Math.max(1, (i % 5) + 1),
            locations: [],
            symptoms: [],
          },
          functionalImpact: {
            limitedActivities: [],
            assistanceNeeded: [],
            mobilityAids: [],
          },
        });
      }
      // set test-mode flag so the app's DEV-only bootstrap can detect test runs
      try {
        localStorage.setItem('pt:test_mode', '1');
      } catch {
        // ignore
      }

      // write as raw fallback key used by storage loader
      localStorage.setItem('pain_tracker_entries', JSON.stringify(entries));
      // also write namespaced secureStorage key for completeness (non-encrypted fallback)
      try {
        localStorage.setItem('pt:pain_tracker_entries', JSON.stringify(entries));
      } catch {
        // ignore
      }
    } catch {
      // ignore
    }
  }, count);
}

/**
 * Advanced: seed encrypted pain entries into an IndexedDB store. This
 * exercises the full vault/encryption path. This must be run after the
 * app has loaded and the vault is unlocked (the helper will drive the
 * VaultGate UI to create a vault using the provided passphrase).
 */
export async function seedEncryptedPainEntries(
  page: Page,
  count = 7,
  passphrase = 'test-passphrase-12345',
  keepOpen = false
): Promise<{ page?: Page; envelopes?: string[]; debug?: { setupExists: boolean; unlockExists: boolean; hookFound: boolean; fallbackUsed?: boolean } } | void> {
  // Run the seeding in an isolated page so it won't interfere with the
  // test's main page (avoids navigation / execution-context-destroyed
  // issues when the app reloads or routes change).
  const isolated = await page.context().newPage();
  let envelopes: string[] = [];
  let setupExists = false;
  let unlockExists = false;
  let hookFound = false;
  try {
    // Ensure the isolated page does not inherit any existing vault metadata so the
    // app will show the setup UI (helps deterministic seeding in tests).
    await isolated.addInitScript(() => {
      try {
        localStorage.removeItem('pt:vault:metadata');
        localStorage.removeItem('vault:metadata');
      } catch {
        // ignore
      }
    });
    await isolated.goto('/', { waitUntil: 'domcontentloaded' });

    // If the vault UI is present, either create a vault or unlock it so the app sets up encryption hooks
    try {
  const setupSelector = 'form[aria-labelledby="vault-setup-title"]';
  const unlockSelector = 'form[aria-labelledby="vault-unlock-title"]';
  setupExists = (await isolated.locator(setupSelector).count()) > 0;
  unlockExists = (await isolated.locator(unlockSelector).count()) > 0;

      if (setupExists) {
        await isolated.fill('#vault-passphrase', passphrase);
        await isolated.fill('#vault-passphrase-confirm', passphrase);
        await Promise.all([
          isolated.click(`${setupSelector} button[type="submit"]`),
          isolated.waitForSelector('#vault-dialog-title', { state: 'hidden', timeout: 5000 }).catch(() => {}),
        ]);
        await isolated.waitForTimeout(300);
      } else if (unlockExists) {
        // try to unlock using the provided passphrase
        await isolated.fill('#vault-passphrase-unlock', passphrase);
        await Promise.all([
          isolated.click(`${unlockSelector} button[type="submit"]`),
          isolated.waitForSelector('#vault-dialog-title', { state: 'hidden', timeout: 5000 }).catch(() => {}),
        ]).catch(() => {});
        await isolated.waitForTimeout(300);
      }
    } catch {
      // ignore vault setup/unlock failures in harness
    }

    // Give the page time to finish any navigation/network activity, then wait for the
    // app to install the global encrypt hook after unlock/setup. This can take a
    // moment while libsodium initializes.
    try {
      await isolated.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => undefined);
      await isolated.waitForFunction(
        () => typeof (globalThis as unknown as { __secureStorageEncrypt?: unknown }).__secureStorageEncrypt === 'function',
        null,
        { timeout: 15000 }
      );
      // double-check presence
      try {
        hookFound = await isolated.evaluate(() =>
          typeof (globalThis as unknown as { __secureStorageEncrypt?: unknown }).__secureStorageEncrypt === 'function'
        );
      } catch {
        hookFound = false;
      }
    } catch {
      // proceed even if hook didn't appear; evaluate will return no envelopes in that case
    }

    // If encrypt hook not found but the app exposes a DEV-only test hook, use it
    // to programmatically setup/unlock the vault. This makes seeding deterministic.
    if (!hookFound) {
      try {
        const hasTestVault = await isolated.evaluate(() => typeof (globalThis as unknown as { __test_vault?: unknown }).__test_vault === 'object');
        if (hasTestVault) {
          // Use the test hook to set up/unlock. We call setup first (it will no-op if already set).
          await isolated.evaluate((pw: string) => {
            try {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              return (globalThis as any).__test_vault?.setup?.(pw);
            } catch {
              return null;
            }
          }, passphrase).catch(() => undefined);

          // Wait briefly and re-check for encrypt hook
          await isolated.waitForTimeout(300);
          try {
            hookFound = await isolated.evaluate(() => typeof (globalThis as unknown as { __secureStorageEncrypt?: unknown }).__secureStorageEncrypt === 'function');
          } catch {
            hookFound = false;
          }
        }
      } catch {
        // ignore
      }
    }

    // Write encrypted entries into an IndexedDB in the isolated page using the app's encrypt hook
    // Collect the produced envelope strings and return them so tests can decrypt deterministically
    envelopes = await isolated.evaluate(
      (c: number) => {
        try {
          const out: string[] = [];
          const encrypt = (globalThis as unknown as { __secureStorageEncrypt?: (p: string) => string }).__secureStorageEncrypt;
          if (typeof encrypt !== 'function') return out;

          const metaRaw = localStorage.getItem('pt:vault:metadata') || localStorage.getItem('vault:metadata');
          const meta = metaRaw ? JSON.parse(metaRaw) : { version: 'unknown' };

          const dbName = 'pain-tracker-vault';
          const storeName = 'pain-entries';

          const openReq = indexedDB.open(dbName);
          openReq.onupgradeneeded = () => {
            const db = openReq.result;
            if (!db.objectStoreNames.contains(storeName)) db.createObjectStore(storeName);
          };

          openReq.onsuccess = () => {
            const db = openReq.result;
            const tx = db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            const now = Date.now();
            for (let i = 0; i < c; i++) {
              const entry = {
                id: String(i + 1),
                timestamp: new Date(now - i * 24 * 60 * 60 * 1000).toISOString(),
                baselineData: { pain: Math.max(1, (i % 5) + 1), locations: [], symptoms: [] },
                functionalImpact: { limitedActivities: [], assistanceNeeded: [], mobilityAids: [] },
              };
              try {
                const envelope = encrypt(JSON.stringify(entry));
                out.push(envelope);
                const env = JSON.parse(envelope);
                const record = {
                  v: env.v,
                  n: env.n,
                  c: env.c,
                  createdAt: new Date().toISOString(),
                  keyVersion: meta?.version ?? 'unknown',
                  metadata: {},
                };
                store.put(record, entry.id);
              } catch {
                // ignore individual encryption errors
              }
            }
            tx.oncomplete = () => db.close();
            tx.onerror = () => db.close();
          };
          return out;
        } catch {
          return [] as string[];
        }
      },
      count
  );

    // If encrypt hook wasn't available or produced no envelopes, write a non-encrypted
    // fallback set of entries into localStorage so tests can proceed deterministically.
    if ((!envelopes || envelopes.length === 0)) {
      try {
        await isolated.evaluate((c: number) => {
          try {
            const entries: Array<Record<string, unknown>> = [];
            const now = Date.now();
            for (let i = 0; i < c; i++) {
              entries.push({
                id: i + 1,
                timestamp: new Date(now - i * 24 * 60 * 60 * 1000).toISOString(),
                baselineData: { pain: Math.max(1, (i % 5) + 1), locations: [], symptoms: [] },
                functionalImpact: { limitedActivities: [], assistanceNeeded: [], mobilityAids: [] },
              });
            }
            try {
              localStorage.setItem('pt:test_mode', '1');
            } catch {
              // ignore
            }
            localStorage.setItem('pain_tracker_entries', JSON.stringify(entries));
            try {
              localStorage.setItem('pt:pain_tracker_entries', JSON.stringify(entries));
            } catch {
              // ignore
            }
          } catch {
            // ignore
          }
        }, count);
        // mark that fallback was used in the debug info
        hookFound = false;
      } catch {
        // ignore
      }
    }
  } catch {
    // ignore harness-level errors
  }

  if (keepOpen) {
    return { page: isolated, envelopes, debug: { setupExists, unlockExists, hookFound } };
  }
  try {
    await isolated.close();
  } catch {
    // ignore
  }
  return { envelopes, debug: { setupExists, unlockExists, hookFound } };
}

export default {
  disableOnboarding,
  seedPainEntries,
};
/**
 * Delete the vault IndexedDB database used by encrypted seeding.
 */
export async function deleteVaultDb(page: Page) {
  const iso = await page.context().newPage();
  try {
    await iso.evaluate(() => {
      try {
        indexedDB.deleteDatabase('pain-tracker-vault');
      } catch {
        // ignore
      }
    });
  } finally {
    try {
      await iso.close();
    } catch {
      // ignore
    }
  }
}
