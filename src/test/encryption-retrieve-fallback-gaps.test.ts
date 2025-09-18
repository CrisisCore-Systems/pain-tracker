import { describe, it, expect } from 'vitest';
import { encryptionService } from '../services/EncryptionService';
import { securityService } from '../services/SecurityService';

// Cover retrieveKey catch path when secure storage retrieval throws, ensuring fallback to in-memory cache.
describe('EncryptionService retrieveKey catch fallback', () => {
  it('returns in-memory key when secure storage retrieval throws error', async () => {
    const keyId = 'retrieve-fallback-key';
    // Prime in-memory cache directly
    encryptionService['inMemoryKeyCache'].set(keyId, { key: 'mem-key-xyz', created: new Date().toISOString() });

    const originalCreate = securityService.createSecureStorage.bind(securityService);
    // Monkey patch to throw on retrieve
  interface MinimalStorage { store: (...a: unknown[]) => Promise<void>; retrieve: (...a: unknown[]) => Promise<unknown>; delete: (...a: unknown[]) => Promise<void>; clear: (...a: unknown[]) => Promise<void>; }
  (securityService as unknown as { createSecureStorage: () => MinimalStorage }).createSecureStorage = () => ({
      store: async () => { /* noop */ },
      retrieve: async () => { throw new Error('forced retrieve failure'); },
      delete: async () => { /* noop */ },
      clear: async () => { /* noop */ }
    });

    const key = await encryptionService['keyManager'].retrieveKey(keyId);
    expect(key).toBe('mem-key-xyz');

    // Restore original
    (securityService as unknown as { createSecureStorage: typeof originalCreate }).createSecureStorage = originalCreate;
  });
});
