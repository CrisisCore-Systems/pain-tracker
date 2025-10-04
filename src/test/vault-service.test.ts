import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { vaultService } from '../services/VaultService';
import { secureStorage } from '../lib/storage/secureStorage';

const TEST_KEY = 'vault-test-entry';
const TEST_VAULT_PASSPHRASE = process.env.TEST_VAULT_PASSPHRASE || 'test-vault-passphrase-2025';

describe('EncryptedVaultService', () => {
  beforeAll(async () => {
    const status = await vaultService.initialize();
    if (status.state === 'uninitialized') {
      await vaultService.setupPassphrase(TEST_VAULT_PASSPHRASE);
    }
    if (vaultService.getStatus().state !== 'unlocked') {
      await vaultService.unlock(TEST_VAULT_PASSPHRASE);
    }
  });

  afterAll(async () => {
    // Ensure the vault remains unlocked for subsequent tests that rely on encrypted storage.
    if (!vaultService.isUnlocked()) {
      await vaultService.unlock(TEST_VAULT_PASSPHRASE);
    }
    secureStorage.remove(TEST_KEY, { encrypt: true });
  });

  it('encrypts secureStorage entries when unlocked and hides them when locked', async () => {
  expect(vaultService.isUnlocked()).toBe(true);
  const payload = { message: 'gentle reassurance', createdAt: new Date().toISOString() };
  const encryptedPreview = vaultService.encryptString(JSON.stringify(payload));
  expect(typeof encryptedPreview).toBe('string');
  expect(encryptedPreview).toContain('"v":"xchacha20-poly1305"');
  const setResult = secureStorage.set(TEST_KEY, payload, { encrypt: true });
  expect(setResult.error).toBeUndefined();
  expect(setResult.success).toBe(true);

    const namespacedKey = `pt:${TEST_KEY}`;
    const raw = localStorage.getItem(namespacedKey);
    expect(raw).toBeTruthy();
    expect(typeof raw).toBe('string');
    if (raw) {
      expect(raw).toContain('"v":"xchacha20-poly1305"');
    }

    vaultService.lock();
    expect(vaultService.isUnlocked()).toBe(false);
    const lockedRead = secureStorage.get<typeof payload>(TEST_KEY, { encrypt: true });
    expect(lockedRead).toBeNull();

    await vaultService.unlock(TEST_VAULT_PASSPHRASE);
    const unlockedRead = secureStorage.get<typeof payload>(TEST_KEY, { encrypt: true });
    expect(unlockedRead).toBeTruthy();
    expect(unlockedRead?.message).toBe(payload.message);
  });

  it('re-encrypts legacy plaintext values on unlock', async () => {
    vaultService.lock();
    const namespacedKey = `pt:${TEST_KEY}-legacy`;
    const legacyPayload = JSON.stringify({ mood: 'hopeful', scale: 5 });
    localStorage.setItem(namespacedKey, legacyPayload);

    await vaultService.unlock(TEST_VAULT_PASSPHRASE);

    const migrated = secureStorage.get<{ mood: string; scale: number }>(`${TEST_KEY}-legacy`, { encrypt: true });
    expect(migrated).toMatchObject({ mood: 'hopeful', scale: 5 });
    const raw = localStorage.getItem(namespacedKey);
    expect(raw).toBeTruthy();
    if (raw) {
      expect(raw).toContain('"v":"xchacha20-poly1305"');
    }
  });
});
