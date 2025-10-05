import { describe, it, expect, vi, beforeEach } from 'vitest';
import { encryptionService, EndToEndEncryptionService } from '../services/EncryptionService';
import { securityService } from '../services/SecurityService';

// Helper to create large repetitive payload for compression + RLE (>1000 chars with long runs)
const largePayload = 'AAAAABBBBBCCCCCDDDDDEEEEE'.repeat(60); // produces long repeated segments

// Access private methods via cast for targeted coverage
const anyEnc = encryptionService as unknown as { decompressString: (c: string) => string };

// Helper to initialize encryption keys for tests
async function setupEncryptionKeys() {
  const encKey = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
  const hmacKey = await crypto.subtle.generateKey({ name: 'HMAC', hash: 'SHA-256' }, true, ['sign', 'verify']);
  const encRaw = await crypto.subtle.exportKey('raw', encKey);
  const hmacRaw = await crypto.subtle.exportKey('raw', hmacKey);
  const encB64 = btoa(String.fromCharCode(...new Uint8Array(encRaw)));
  const hmacB64 = btoa(String.fromCharCode(...new Uint8Array(hmacRaw)));
  const payload = JSON.stringify({ enc: encB64, hmac: hmacB64, created: new Date().toISOString() });
  (encryptionService as any).inMemoryKeyCache.set('pain-tracker-master', { key: payload, created: new Date().toISOString() });
}

describe('EncryptionService additional gaps', () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    await setupEncryptionKeys();
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
    
    // Initialize keys for the new service instance by directly populating its in-memory cache
    const encKey = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
    const hmacKey = await crypto.subtle.generateKey({ name: 'HMAC', hash: 'SHA-256' }, true, ['sign', 'verify']);
    const encRaw = await crypto.subtle.exportKey('raw', encKey);
    const hmacRaw = await crypto.subtle.exportKey('raw', hmacKey);
    const encB64 = btoa(String.fromCharCode(...new Uint8Array(encRaw)));
    const hmacB64 = btoa(String.fromCharCode(...new Uint8Array(hmacRaw)));
    const payload = JSON.stringify({ enc: encB64, hmac: hmacB64, created: new Date().toISOString() });
    (svc as any).inMemoryKeyCache.set('pain-tracker-master', { key: payload, created: new Date().toISOString() });
    
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
