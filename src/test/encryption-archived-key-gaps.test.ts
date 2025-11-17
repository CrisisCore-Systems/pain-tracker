import { describe, it, expect } from 'vitest';
import { encryptionService } from '../services/EncryptionService';
import { securityService } from '../services/SecurityService';

describe('EncryptionService archived key rotation branch', () => {
  it('stores archived key when rotating existing key', async () => {
    // Monkey patch secure storage to a deterministic in-memory impl capturing archived stores
    const archived: Array<{ k: string; v: unknown }> = [];
    const originalCreate = securityService.createSecureStorage.bind(securityService);
    interface MinimalStorage {
      store: (k: string, v: unknown) => Promise<void>;
      retrieve: (...a: unknown[]) => Promise<unknown>;
      delete: (...a: unknown[]) => Promise<void>;
      clear: (...a: unknown[]) => Promise<void>;
    }
    (
      securityService as unknown as { createSecureStorage: () => MinimalStorage }
    ).createSecureStorage = () => ({
      store: async (key: string, value: unknown) => {
        archived.push({ k: key, v: value });
      },
      retrieve: async () => null,
      delete: async () => {},
      clear: async () => {},
    });

    // Ensure an initial key exists (in-memory ok)
    await encryptionService['keyManager'].storeKey('pain-tracker-master', 'initial-key-value');
    const old = await encryptionService['keyManager'].retrieveKey('pain-tracker-master');
    expect(old).toBeTruthy();

    // Perform rotation directly via keyManager to target branch
    await encryptionService['keyManager'].rotateKey('pain-tracker-master');

    // Restore original secure storage
    (
      securityService as unknown as { createSecureStorage: typeof originalCreate }
    ).createSecureStorage = originalCreate;

    // Confirm an archived-key entry was captured
    const archivedEntry = archived.find(a => a.k.startsWith('archived-key:pain-tracker-master'));
    expect(archivedEntry).toBeTruthy();
  });
});
