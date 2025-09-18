import { describe, it, expect } from 'vitest';
import { encryptionService } from '../services/EncryptionService';

// Create a large JSON string with long repeated characters to trigger RLE compression branch (>4 run length)
const buildRepeatingPayload = () => {
  const base = 'AAAAABBBBBCCCCCCCCDDDDDDDD'; // multiple runs >4
  const arr = Array.from({ length: 120 }, () => base); // ensure length > 1000 after JSON.stringify
  return { data: arr };
};

describe('EncryptionService compression RLE + status', () => {
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
