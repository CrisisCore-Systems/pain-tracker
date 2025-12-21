import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { vaultService } from '../services/VaultService';
import { secureStorage } from '../lib/storage/secureStorage';
import sodium from 'libsodium-wrappers-sumo';

type SodiumWithPolyfills = typeof sodium & {
  crypto_pwhash?: { (...args: unknown[]): unknown; toString?: () => string };
  crypto_pwhash_str?: (passphrase: string) => string;
  crypto_pwhash_str_verify?: (stored: string, passphrase: string) => boolean;
  __preparePolyfillKey?: (
    passphrase: string,
    salt: Uint8Array,
    outputLength: number,
    opslimit: number
  ) => Promise<Uint8Array>;
  crypto_generichash?: (outLen: number, input: string) => Uint8Array;
  to_base64?: (data: Uint8Array, variant: number) => string;
  crypto_pwhash_OPSLIMIT_MODERATE?: number;
  crypto_aead_xchacha20poly1305_ietf_KEYBYTES?: number;
  crypto_pwhash_SALTBYTES?: number;
};

const sodiumExt = sodium as unknown as SodiumWithPolyfills;

// Test-only sodium polyfill for environments missing crypto_pwhash
async function ensurePolyfill() {
  await sodium.ready;
  const missing =
    typeof sodiumExt.crypto_pwhash !== 'function' || typeof sodiumExt.crypto_pwhash_str !== 'function';
  if (!missing) return;

  console.warn('[vault-service.test] Applying sodium crypto_pwhash polyfill for test environment');

  async function pbkdf2(
    passphrase: string,
    salt: Uint8Array,
    length: number,
    iterations: number
  ): Promise<Uint8Array> {
    const enc = new TextEncoder().encode(passphrase);
    const baseKey = await crypto.subtle.importKey('raw', enc, 'PBKDF2', false, ['deriveBits']);
    // Some DOM lib typings in test environments require ArrayBuffer for salt
    const saltBuffer: ArrayBuffer =
      salt.buffer instanceof ArrayBuffer ? salt.buffer : new Uint8Array(salt).buffer;
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: saltBuffer as ArrayBuffer, iterations, hash: 'SHA-256' },
      baseKey,
      length * 8
    );
    return new Uint8Array(bits);
  }

  sodiumExt.__preparePolyfillKey = async function (
    passphrase: string,
    salt: Uint8Array,
    outputLength: number,
    opslimit: number
  ) {
    const iterations = Math.max(1000, Math.min(10000, opslimit * 10));
    return pbkdf2(passphrase, salt, outputLength, iterations);
  };

  sodiumExt.crypto_pwhash_str = function (passphrase: string) {
    const digest = sodiumExt.crypto_generichash?.(32, passphrase);
    if (!digest) throw new Error('crypto_generichash not available in test environment');
    const encoded = sodiumExt.to_base64?.(digest, 1);
    if (!encoded) throw new Error('to_base64 not available in test environment');
    return 'pbkdf2$' + encoded;
  };

  sodiumExt.crypto_pwhash_str_verify = function (stored: string, passphrase: string) {
    if (!stored.startsWith('pbkdf2$')) return false;
    const digest = sodiumExt.crypto_generichash?.(32, passphrase);
    if (!digest) throw new Error('crypto_generichash not available in test environment');
    const encoded = sodiumExt.to_base64?.(digest, 1);
    if (!encoded) throw new Error('to_base64 not available in test environment');
    const compare = 'pbkdf2$' + encoded;
    return compare === stored;
  };
}

async function prederiveIfNeeded(passphrase: string) {
  await ensurePolyfill();
  const hasReal =
    typeof sodiumExt.crypto_pwhash === 'function' &&
    !String(sodiumExt.crypto_pwhash.toString?.() ?? sodiumExt.crypto_pwhash).includes('Polyfill');
  if (hasReal) return;
  const opslimit = sodiumExt.crypto_pwhash_OPSLIMIT_MODERATE || 2;
  const keyLength = sodiumExt.crypto_aead_xchacha20poly1305_ietf_KEYBYTES || 32;
  const saltBytes =
    (sodiumExt.crypto_pwhash_SALTBYTES ?? 0) > 0 ? (sodiumExt.crypto_pwhash_SALTBYTES ?? 0) : 16;
  const salt = sodium.randombytes_buf(saltBytes);
  if (!sodiumExt.__preparePolyfillKey) {
    throw new Error('Polyfill key preparation function not initialized');
  }
  const derived = await sodiumExt.__preparePolyfillKey(passphrase, salt, keyLength, opslimit);
  (sodiumExt as unknown as Record<string, unknown>).crypto_pwhash = function (...args: unknown[]) {
    const requested = args[0];
    const outLen = typeof requested === 'number' ? requested : keyLength;
    return derived.slice(0, outLen);
  };
}

const TEST_KEY = 'vault-test-entry';
const TEST_VAULT_PASSPHRASE = process.env.TEST_VAULT_PASSPHRASE || 'test-vault-passphrase-2025';

describe('EncryptedVaultService', () => {
  beforeAll(async () => {
    await prederiveIfNeeded(TEST_VAULT_PASSPHRASE);
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
  }, 30000);

  it('re-encrypts legacy plaintext values on unlock', async () => {
    vaultService.lock();
    const namespacedKey = `pt:${TEST_KEY}-legacy`;
    const legacyPayload = JSON.stringify({ mood: 'hopeful', scale: 5 });
    localStorage.setItem(namespacedKey, legacyPayload);

    await vaultService.unlock(TEST_VAULT_PASSPHRASE);

    const migrated = secureStorage.get<{ mood: string; scale: number }>(`${TEST_KEY}-legacy`, {
      encrypt: true,
    });
    expect(migrated).toMatchObject({ mood: 'hopeful', scale: 5 });
    const raw = localStorage.getItem(namespacedKey);
    expect(raw).toBeTruthy();
    if (raw) {
      expect(raw).toContain('"v":"xchacha20-poly1305"');
    }
  }, 30000);
});
