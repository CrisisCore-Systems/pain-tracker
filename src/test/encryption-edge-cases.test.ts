import { describe, it, expect } from 'vitest';
import { encryptionService } from '../services/EncryptionService';

interface Payload { msg: string; pad?: string }

function bigPayload(): Payload { return { msg: 'x'.repeat(1200), pad: 'y'.repeat(800) }; }

describe('EncryptionService edge cases', () => {
  it('rotates keys without throwing', async () => {
    await encryptionService.rotateEncryptionKeys();
    const status = encryptionService.getEncryptionStatus();
    expect(status.encryptionEnabled).toBe(true);
  });

  it('rotates multiple keys when additional key present', async () => {
    // Create an additional password-based backup to introduce a second keyId
    const backup = await encryptionService.createEncryptedBackup({ sample: true }, 'extraPW');
    expect(backup.length).toBeGreaterThan(10);
    await encryptionService.rotateEncryptionKeys();
    // If rotation fails it will throw; we just assert pass-through
    const status = encryptionService.getEncryptionStatus();
    expect(status.defaultKeyExists).toBe(true);
  });

  it('creates and restores password-protected backup', async () => {
    const data = { entries: [bigPayload(), { msg: 'short' }] };
    const backup = await encryptionService.createEncryptedBackup(data, 'pw123');
    const restored = await encryptionService.restoreFromEncryptedBackup<typeof data>(backup, 'pw123');
    expect(restored.entries[0].msg.length).toBe(1200);
  });

  it('fails integrity check if tampered', async () => {
    const encrypted = await encryptionService.encrypt({ value: 'secure' });
    // Tamper payload
    const hacked = { ...encrypted, data: encrypted.data.slice(0, -4) + 'ABCD' };
  // Pass tampered object; runtime integrity or parse should fail
  await expect(encryptionService.decrypt(hacked as typeof encrypted)).rejects.toThrow();
  });

  it('skips compression when below threshold', async () => {
    const small = await encryptionService.encrypt({ v: 'tiny' }, { useCompression: true });
    // Not large enough to trigger compression marker
    expect(small.data.startsWith('COMPRESSED:')).toBe(false);
    const round = await encryptionService.decrypt(small);
    expect(round.v).toBe('tiny');
  });

  it('rejects password-protected backup missing salt metadata', async () => {
    const data = { entries: [{ msg: 'secure' }] };
    const backup = await encryptionService.createEncryptedBackup(data, 'pwABC');
    const parsed = JSON.parse(backup);
    // Remove salt field to simulate tampering
    if (parsed.metadata && parsed.metadata.passwordSalt) {
      delete parsed.metadata.passwordSalt;
    }
    const tampered = JSON.stringify(parsed);
    await expect(encryptionService.restoreFromEncryptedBackup(tampered, 'pwABC')).rejects.toThrow(/salt/i);
  });
});
