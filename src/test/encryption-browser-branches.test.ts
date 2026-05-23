import { describe, expect, it } from 'vitest';
import { encryptionService } from '../services/EncryptionService';

describe('EncryptionService browser-only fallback branches (no Buffer)', () => {
  it('roundtrips encrypt/decrypt using btoa/atob paths when Buffer is unavailable', async () => {
    const globals = globalThis as typeof globalThis & {
      __PAIN_TRACKER_FORCE_WEB_BASE64__?: boolean;
      btoa?: (s: string) => string;
      atob?: (s: string) => string;
    };
    const originalBuffer = (globalThis as unknown as { Buffer?: typeof Buffer }).Buffer;
    const originalBtoa = (globalThis as unknown as { btoa?: (s: string) => string }).btoa;
    const originalAtob = (globalThis as unknown as { atob?: (s: string) => string }).atob;
    const originalForceWebBase64 = globals.__PAIN_TRACKER_FORCE_WEB_BASE64__;

    try {
      // Simulate the browser base64 branch without mutating Node's global Buffer,
      // which Vitest workers rely on for message serialization.
      globals.__PAIN_TRACKER_FORCE_WEB_BASE64__ = true;

      (globalThis as unknown as { btoa?: (s: string) => string }).btoa = (bin: string) =>
        originalBuffer!.from(bin, 'binary').toString('base64');
      (globalThis as unknown as { atob?: (s: string) => string }).atob = (b64: string) =>
        originalBuffer!.from(b64, 'base64').toString('binary');

      const payload = { hello: 'browser-branch', n: 1 };
      const encrypted = await encryptionService.encrypt(payload);
      const decrypted = await encryptionService.decrypt<typeof payload>(encrypted);
      expect(decrypted).toEqual(payload);
    } finally {
      globals.__PAIN_TRACKER_FORCE_WEB_BASE64__ = originalForceWebBase64;
      (globalThis as unknown as { btoa?: unknown }).btoa = originalBtoa;
      (globalThis as unknown as { atob?: unknown }).atob = originalAtob;
    }
  });
});
