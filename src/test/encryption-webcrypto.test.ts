import { encryptionService } from '../../src/services/EncryptionService';

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

describe('EncryptionService Web Crypto migration', () => {
  beforeEach(async () => {
    await setupEncryptionKeys();
  });

  test('roundtrip encrypt/decrypt with AES-GCM', async () => {
    const payload = { hello: 'world', n: 42 };
    const encrypted = await encryptionService.encrypt(payload);
    expect(encrypted.metadata.version).toBe('2.0.0');
    const decrypted = await encryptionService.decrypt(encrypted as any);
    expect(decrypted).toEqual(payload);
  });

  test('tamper detection fails integrity check', async () => {
    const payload = { sensitive: 'data' };
    const encrypted = await encryptionService.encrypt(payload);
    // mutate ciphertext
    const tampered = { ...encrypted, data: encrypted.data.slice(0, -2) + (encrypted.data.slice(-2) === 'AA' ? 'BB' : 'AA') };
    await expect(encryptionService.decrypt(tampered as any)).rejects.toThrow();
  });
});
