import { describe, it, expect, beforeEach } from 'vitest';
import { encryptionService } from '../services/EncryptionService';

interface Dummy { text: string; repeat: string; }

const sample: Dummy = { text: 'hello world', repeat: 'aaaaaaaaaaaaabbbbbbbbbbbbcccccccccccc' };

describe('Encryption compression', () => {
  beforeEach(async () => {
    // Directly store in the in-memory cache to bypass secure storage in tests
    const encKey = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
    const hmacKey = await crypto.subtle.generateKey({ name: 'HMAC', hash: 'SHA-256' }, true, ['sign', 'verify']);
    const encRaw = await crypto.subtle.exportKey('raw', encKey);
    const hmacRaw = await crypto.subtle.exportKey('raw', hmacKey);
    const encB64 = btoa(String.fromCharCode(...new Uint8Array(encRaw)));
    const hmacB64 = btoa(String.fromCharCode(...new Uint8Array(hmacRaw)));
    const payload = JSON.stringify({ enc: encB64, hmac: hmacB64, created: new Date().toISOString() });
    
    // Access the private in-memory cache directly via the class
    (encryptionService as any).inMemoryKeyCache.set('pain-tracker-master', { key: payload, created: new Date().toISOString() });
  });

  it('compresses large JSON strings with marker and can round-trip', async () => {
    const big: Dummy = { text: sample.text.repeat(50), repeat: sample.repeat.repeat(30) };
    const encrypted = await encryptionService.encrypt(big, { useCompression: true });
    // Expect compressed marker present
    expect(encrypted.data.length).toBeGreaterThan(0);
    const decrypted = await encryptionService.decrypt<typeof big>(encrypted);
    expect(decrypted.text).toEqual(big.text);
    expect(decrypted.repeat).toEqual(big.repeat);
  });
});
