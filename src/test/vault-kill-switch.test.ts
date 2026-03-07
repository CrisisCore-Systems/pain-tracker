import { describe, it, expect, vi } from 'vitest';

// @vitest-environment happy-dom

vi.mock('../services/emergency-wipe', () => ({
  performEmergencyWipe: vi.fn().mockResolvedValue(undefined),
}));

const TEST_PASSPHRASE = 'test-vault-passphrase-2025';

describe('Vault kill switch', () => {
  it('triggers emergency wipe after 3 failed unlock attempts', async () => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.resetModules();

    // Override the global test mock (src/test/vitest.setup.ts) for this file.
    // The default mock makes verification always succeed, which would prevent
    // exercising failed-unlock logic.
    vi.doMock('libsodium-wrappers-sumo', () => {
      const fake = {
        ready: Promise.resolve(),
        crypto_pwhash_SALTBYTES: 16,
        crypto_pwhash_OPSLIMIT_MIN: 1,
        crypto_pwhash_OPSLIMIT_MODERATE: 2,
        crypto_pwhash_MEMLIMIT_MIN: 1024,
        crypto_pwhash_MEMLIMIT_MODERATE: 2048,
        crypto_pwhash_ALG_DEFAULT: 1,
        crypto_pwhash_ALG_ARGON2ID13: 1,
        crypto_aead_xchacha20poly1305_ietf_KEYBYTES: 32,
        crypto_aead_xchacha20poly1305_ietf_NPUBBYTES: 24,

        crypto_pwhash: (keyLen: number) => new Uint8Array(keyLen).fill(1),
        crypto_pwhash_str: (passwd: string) => `hash:${passwd}`,
        crypto_pwhash_str_verify: (hash: string, passwd: string) => hash === `hash:${passwd}`,

        randombytes_buf: (length: number) => new Uint8Array(length).fill(0),
        from_base64: (s: string) => new Uint8Array(Buffer.from(s, 'base64')),
        to_base64: (b: Uint8Array) => Buffer.from(b).toString('base64'),
        crypto_aead_xchacha20poly1305_ietf_encrypt: (msg: Uint8Array) => msg,
        crypto_aead_xchacha20poly1305_ietf_decrypt: (_: unknown, ciphertext: Uint8Array) =>
          ciphertext,
        to_string: (b: Uint8Array) => Buffer.from(b).toString(),
      };

      return { ...fake, default: fake };
    });

    const [{ vaultService }, { secureStorage }, { performEmergencyWipe }] = await Promise.all([
      import('../services/VaultService'),
      import('../lib/storage/secureStorage'),
      import('../services/emergency-wipe'),
    ]);

    await vaultService.initialize();
    if (vaultService.getStatus().state === 'uninitialized') {
      await vaultService.setupPassphrase(TEST_PASSPHRASE);
    }
    vaultService.lock();

    await expect(vaultService.unlock('wrong-passphrase-1')).rejects.toThrow('Incorrect passphrase.');
    expect(secureStorage.get<number>('vault:failed-unlock-attempts')).toBe(1);

    await expect(vaultService.unlock('wrong-passphrase-2')).rejects.toThrow('Incorrect passphrase.');
    expect(secureStorage.get<number>('vault:failed-unlock-attempts')).toBe(2);

    await expect(vaultService.unlock('wrong-passphrase-3')).rejects.toThrow('Incorrect passphrase.');
    expect(performEmergencyWipe).toHaveBeenCalledTimes(1);

    // Vault metadata cleared (as minimum guarantee)
    expect(secureStorage.get('vault:metadata')).toBeNull();
    expect(vaultService.getStatus().state).toBe('uninitialized');
  });

  it('does not wipe when the kill switch is disabled (but still counts)', async () => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.resetModules();

    vi.doMock('libsodium-wrappers-sumo', () => {
      const fake = {
        ready: Promise.resolve(),
        crypto_pwhash_SALTBYTES: 16,
        crypto_pwhash_OPSLIMIT_MIN: 1,
        crypto_pwhash_OPSLIMIT_MODERATE: 2,
        crypto_pwhash_MEMLIMIT_MIN: 1024,
        crypto_pwhash_MEMLIMIT_MODERATE: 2048,
        crypto_pwhash_ALG_DEFAULT: 1,
        crypto_pwhash_ALG_ARGON2ID13: 1,
        crypto_aead_xchacha20poly1305_ietf_KEYBYTES: 32,
        crypto_aead_xchacha20poly1305_ietf_NPUBBYTES: 24,

        crypto_pwhash: (keyLen: number) => new Uint8Array(keyLen).fill(1),
        crypto_pwhash_str: (passwd: string) => `hash:${passwd}`,
        crypto_pwhash_str_verify: (hash: string, passwd: string) => hash === `hash:${passwd}`,

        randombytes_buf: (length: number) => new Uint8Array(length).fill(0),
        from_base64: (s: string) => new Uint8Array(Buffer.from(s, 'base64')),
        to_base64: (b: Uint8Array) => Buffer.from(b).toString('base64'),
        crypto_aead_xchacha20poly1305_ietf_encrypt: (msg: Uint8Array) => msg,
        crypto_aead_xchacha20poly1305_ietf_decrypt: (_: unknown, ciphertext: Uint8Array) =>
          ciphertext,
        to_string: (b: Uint8Array) => Buffer.from(b).toString(),
      };

      return { ...fake, default: fake };
    });

    const [{ vaultService }, { secureStorage }, { performEmergencyWipe }, { writePrivacySettings }] =
      await Promise.all([
        import('../services/VaultService'),
        import('../lib/storage/secureStorage'),
        import('../services/emergency-wipe'),
        import('../utils/privacySettings'),
      ]);

    await vaultService.initialize();
    if (vaultService.getStatus().state === 'uninitialized') {
      await vaultService.setupPassphrase(TEST_PASSPHRASE);
    }
    vaultService.lock();

    // Write privacy settings AFTER vault setup+lock so that
    // migrateLegacyStorage (which re-encrypts all pt: keys) doesn't
    // encrypt the plain-JSON settings value, making it unreadable by
    // isEmergencyWipeOnFailedUnlockEnabled (which reads without decrypt).
    writePrivacySettings({ vaultKillSwitchEnabled: false });

    await expect(vaultService.unlock('wrong-passphrase-1')).rejects.toThrow('Incorrect passphrase.');
    await expect(vaultService.unlock('wrong-passphrase-2')).rejects.toThrow('Incorrect passphrase.');
    await expect(vaultService.unlock('wrong-passphrase-3')).rejects.toThrow('Incorrect passphrase.');

    expect(secureStorage.get<number>('vault:failed-unlock-attempts')).toBe(3);
    expect(performEmergencyWipe).toHaveBeenCalledTimes(0);

    // Vault metadata should remain; we did not wipe.
    expect(secureStorage.get('vault:metadata')).not.toBeNull();
    expect(vaultService.getStatus().state).toBe('locked');
  });
});
