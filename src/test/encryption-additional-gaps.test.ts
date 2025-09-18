import { describe, it, expect, vi, beforeEach } from 'vitest';
import { encryptionService, EndToEndEncryptionService } from '../services/EncryptionService';
import { securityService } from '../services/SecurityService';

// Helper to create large repetitive payload for compression + RLE (>1000 chars with long runs)
const largePayload = 'AAAAABBBBBCCCCCDDDDDEEEEE'.repeat(60); // produces long repeated segments

// Access private methods via cast for targeted coverage
const anyEnc = encryptionService as unknown as { decompressString: (c: string) => string };

describe('EncryptionService additional gaps', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('falls back to in-memory key cache when secure storage fails (storeKey path)', async () => {
    const secureStorage = securityService.createSecureStorage();
    vi.spyOn(securityService, 'createSecureStorage').mockImplementation(() => ({
      ...secureStorage,
      store: async () => { throw new Error('secure storage unavailable'); },
      retrieve: async () => null,
      delete: async () => {}
  }) as unknown as ReturnType<typeof securityService.createSecureStorage>);
    const svc = new EndToEndEncryptionService();
    // Force generateKey -> storeKey fallback
    const data = await svc.encrypt({ hello: 'world' });
    expect(data.metadata.keyId).toBeDefined();
  });

  it('compresses large data and successfully decrypts (compression + decompress branches)', async () => {
    const encrypted = await encryptionService.encrypt({ blob: largePayload }, { addIntegrityCheck: true });
    expect(encrypted.data.length).toBeGreaterThan(0);
  const decrypted = await encryptionService.decrypt<{ blob: string }>(encrypted);
    expect(decrypted.blob).toBe(largePayload);
  });

  it('decompressString expands RLE encoded sequences', () => {
    // Directly invoke private decompressString via any cast with crafted compressed string containing RLE ~ markers
    const compressed = 'COMPRESSED:v1:' + btoa('~A' + String.fromCharCode(10));
    const out = anyEnc.decompressString(compressed);
    expect(out).toBe('A'.repeat(10));
  });
});
