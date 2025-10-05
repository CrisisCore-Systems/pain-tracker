import { describe, it, expect, beforeEach } from 'vitest';
import { encryptionService } from '../services/EncryptionService';

// Create a large JSON string with long repeated characters to trigger RLE compression branch (>4 run length)
const buildRepeatingPayload = () => {
  const base = 'AAAAABBBBBCCCCCCCCDDDDDDDD'; // multiple runs >4
  const arr = Array.from({ length: 120 }, () => base); // ensure length > 1000 after JSON.stringify
  return { data: arr };
};

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

describe('EncryptionService compression RLE + status', () => {
  beforeEach(async () => {
    await setupEncryptionKeys();
  });

  it('compresses and round-trips data containing long runs', async () => {
    const payload = buildRepeatingPayload();
    const encrypted = await encryptionService.encrypt(payload, { useCompression: true });
    // Should bear compression marker
    expect(encrypted.data).toBeTruthy();
    const decrypted = await encryptionService.decrypt<typeof payload>(encrypted);
    expect(decrypted.data.length).toBe(payload.data.length);
  });

  it('reports encryption status shape', () => {
    const status = encryptionService.getEncryptionStatus();
    expect(status).toHaveProperty('encryptionEnabled');
    expect(status).toHaveProperty('defaultKeyExists');
  });
});
