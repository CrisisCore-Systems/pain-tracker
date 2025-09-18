import { describe, it, expect } from 'vitest';
import { encryptionService } from '../services/EncryptionService';

interface Dummy { text: string; repeat: string; }

const sample: Dummy = { text: 'hello world', repeat: 'aaaaaaaaaaaaabbbbbbbbbbbbcccccccccccc' };

describe('Encryption compression', () => {
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
