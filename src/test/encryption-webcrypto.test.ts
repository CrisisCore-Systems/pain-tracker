import { encryptionService } from '../../src/services/EncryptionService';

describe('EncryptionService Web Crypto migration', () => {
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
    const tampered = {
      ...encrypted,
      data: encrypted.data.slice(0, -2) + (encrypted.data.slice(-2) === 'AA' ? 'BB' : 'AA'),
    };
    await expect(encryptionService.decrypt(tampered as any)).rejects.toThrow();
  });
});
