import { describe, expect, it } from 'vitest';
import { encryptionService } from '../services/EncryptionService';

describe('EncryptionService browser-only fallback branches (no Buffer)', () => {
  it('roundtrips encrypt/decrypt using btoa/atob paths when Buffer is unavailable', async () => {
    const originalBuffer = (globalThis as unknown as { Buffer?: typeof Buffer }).Buffer;
    const originalBtoa = (globalThis as unknown as { btoa?: (s: string) => string }).btoa;
    const originalAtob = (globalThis as unknown as { atob?: (s: string) => string }).atob;

    try {
      // Simulate a browser environment branch where Node's Buffer is not available.
      // Keep a reference so our polyfills can still compute base64.
      (globalThis as unknown as { Buffer?: unknown }).Buffer = undefined;

      (globalThis as unknown as { btoa?: (s: string) => string }).btoa = (bin: string) =>
        originalBuffer!.from(bin, 'binary').toString('base64');
      (globalThis as unknown as { atob?: (s: string) => string }).atob = (b64: string) =>
        originalBuffer!.from(b64, 'base64').toString('binary');

      const payload = { hello: 'browser-branch', n: 1 };
      const encrypted = await encryptionService.encrypt(payload);
      const decrypted = await encryptionService.decrypt<typeof payload>(encrypted);
      expect(decrypted).toEqual(payload);
    } finally {
      (globalThis as unknown as { Buffer?: unknown }).Buffer = originalBuffer;
      (globalThis as unknown as { btoa?: unknown }).btoa = originalBtoa;
      (globalThis as unknown as { atob?: unknown }).atob = originalAtob;
    }
  });
});
