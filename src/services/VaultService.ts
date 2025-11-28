import { securityService } from './SecurityService';
import { secureStorage } from '../lib/storage/secureStorage';
import { getSodium, getSodiumSync } from '../lib/crypto/sodium';

type VaultPhase = 'uninitialized' | 'locked' | 'unlocking' | 'unlocked' | 'error';

type Listener = (status: VaultStatus) => void;

const STORAGE_KEY = 'vault:metadata';
const VAULT_VERSION = '3.0.0';
const BASE64_VARIANT = 1; // libsodium.base64_variants.ORIGINAL

function toBytes(input: unknown): Uint8Array {
  if (input == null) {
    throw new TypeError('encryptString: message is null/undefined');
  }

  if (input instanceof Uint8Array) {
    return input;
  }

  if (
    typeof Buffer !== 'undefined' &&
    typeof Buffer.isBuffer === 'function' &&
    Buffer.isBuffer(input)
  ) {
    return new Uint8Array(
      (input as Buffer).buffer,
      (input as Buffer).byteOffset,
      (input as Buffer).byteLength
    );
  }

  if (ArrayBuffer.isView(input)) {
    const view = input as ArrayBufferView;
    return new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
  }

  if (input instanceof ArrayBuffer) {
    return new Uint8Array(input);
  }

  // For strings and objects, use TextEncoder (universally available in Node + browsers)
  const encoder = new TextEncoder();
  if (typeof input === 'string') {
    return encoder.encode(input);
  }

  return encoder.encode(JSON.stringify(input));
}

async function ensureReady(): Promise<void> {
  await getSodium();
}

function isEnvelopeString(raw: string): boolean {
  try {
    const parsed = JSON.parse(raw);
    return (
      typeof parsed === 'object' &&
      parsed?.v === 'xchacha20-poly1305' &&
      typeof parsed?.c === 'string' &&
      typeof parsed?.n === 'string'
    );
  } catch {
    return false;
  }
}

export interface VaultMetadata {
  version: string;
  createdAt: string;
  updatedAt: string;
  derivation: {
    algorithm: 'argon2id';
    salt: string; // base64
    opslimit: number;
    memlimit: number;
    keyLength: number;
  };
  verification: {
    algorithm: 'argon2id';
    hash: string;
  };
  cipher: {
    algorithm: 'xchacha20-poly1305';
    nonceLength: number;
  };
  migrations?: {
    legacyCompletedAt?: string;
  };
}

export interface VaultStatus {
  state: VaultPhase;
  metadata: VaultMetadata | null;
  sodiumReady: boolean;
}

export class EncryptedVaultService {
  private status: VaultStatus = {
    state: 'uninitialized',
    metadata: null,
    sodiumReady: false,
  };

  private key: Uint8Array | null = null;
  private listeners = new Set<Listener>();
  private initialized = false;

  async initialize(): Promise<VaultStatus> {
    if (this.initialized) {
      return this.status;
    }

    try {
      await getSodium();
      this.status.sodiumReady = true;
    } catch (error) {
      this.logEvent('error', 'Failed to initialize libsodium', {
        error: error instanceof Error ? error.message : 'unknown',
      });
      this.status.state = 'error';
      return this.status;
    }

    const metadata = this.loadMetadata();
    if (!metadata) {
      this.status = { state: 'uninitialized', metadata: null, sodiumReady: true };
    } else {
      this.status = { state: 'locked', metadata, sodiumReady: true };
    }

    this.initialized = true;
    this.emit();
    return this.status;
  }

  onChange(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.status);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getStatus(): VaultStatus {
    return this.status;
  }

  async setupPassphrase(passphrase: string): Promise<void> {
    if (!passphrase || passphrase.length < 12) {
      throw new Error('Passphrase must be at least 12 characters.');
    }

    // Ensure libsodium ready and reference stable instance
    await ensureReady();
    const sodium = await getSodium();

    console.log('[VaultService] Sodium instance retrieved:', {
      sodiumType: typeof sodium,
      hasCryptoPwhash: typeof sodium.crypto_pwhash,
      hasCryptoPwhashStr: typeof sodium.crypto_pwhash_str,
      saltBytes: sodium.crypto_pwhash_SALTBYTES,
    });

    // Defensive: crypto_pwhash_SALTBYTES must be a valid positive integer
    const configuredSaltBytes = sodium.crypto_pwhash_SALTBYTES as unknown;
    const saltBytes =
      Number.isInteger(configuredSaltBytes as number) && (configuredSaltBytes as number) > 0
        ? (configuredSaltBytes as number)
        : 16; // fallback to 16 bytes in test/env edge cases
    if (saltBytes !== configuredSaltBytes) {
      this.logEvent('warning', 'Using fallback salt length', { configuredSaltBytes, saltBytes });
    }
    const salt = sodium.randombytes_buf(saltBytes);
    const opslimit = sodium.crypto_pwhash_OPSLIMIT_MODERATE;
    const memlimit = sodium.crypto_pwhash_MEMLIMIT_MODERATE;
    const keyLength = sodium.crypto_aead_xchacha20poly1305_ietf_KEYBYTES;

    console.log('[VaultService] Creating vault with:', {
      passphraseType: typeof passphrase,
      passphraseLength: passphrase?.length,
      keyLength,
      opslimit,
      memlimit,
      saltLength: salt.length,
    });

    const key = sodium.crypto_pwhash(
      keyLength,
      passphrase,
      salt,
      opslimit,
      memlimit,
      sodium.crypto_pwhash_ALG_ARGON2ID13
    );

    console.log('[VaultService] Key derived, creating verification hash...');

    const verificationHash = sodium.crypto_pwhash_str(passphrase, opslimit, memlimit);

    console.log('[VaultService] Verification hash created:', verificationHash?.length);

    const metadata: VaultMetadata = {
      version: VAULT_VERSION,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      derivation: {
        algorithm: 'argon2id',
        salt: sodium.to_base64(salt, BASE64_VARIANT),
        opslimit,
        memlimit,
        keyLength,
      },
      verification: {
        algorithm: 'argon2id',
        hash: verificationHash,
      },
      cipher: {
        algorithm: 'xchacha20-poly1305',
        nonceLength: sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES,
      },
      migrations: {},
    };

    const storeResult = secureStorage.set(STORAGE_KEY, metadata);
    if (!storeResult.success) {
      throw new Error('Failed to persist vault metadata.');
    }

    this.key = key;
    this.status = { state: 'unlocked', metadata, sodiumReady: true };
    this.applyGlobalHooks();
    await this.migrateLegacyStorage();
    this.logEvent('info', 'Vault passphrase initialized');
    this.emit();
  }

  async unlock(passphrase: string): Promise<void> {
    if (!passphrase) {
      throw new Error('Passphrase is required.');
    }

    await this.initialize();
    await ensureReady();

    const { metadata } = this.status;
    if (!metadata) {
      throw new Error('Vault not configured.');
    }

    const sodium = await getSodium();

    let isValid = false;
    try {
      isValid = sodium.crypto_pwhash_str_verify(metadata.verification.hash, passphrase);
    } catch (error) {
      this.logEvent('error', `Passphrase verification error: ${error}`);
      throw new Error('Passphrase verification failed.');
    }

    if (!isValid) {
      this.logEvent('warning', 'Vault unlock attempt failed');
      throw new Error('Incorrect passphrase.');
    }

    const salt = sodium.from_base64(metadata.derivation.salt, BASE64_VARIANT);
    if (!(salt instanceof Uint8Array) || salt.length <= 0) {
      this.logEvent('error', 'Derived salt invalid', { actual: (salt as Uint8Array)?.length });
    }
    const key = sodium.crypto_pwhash(
      metadata.derivation.keyLength,
      passphrase,
      salt,
      metadata.derivation.opslimit,
      metadata.derivation.memlimit,
      sodium.crypto_pwhash_ALG_ARGON2ID13
    );

    this.key = key;
    this.status = { ...this.status, state: 'unlocked' };
    this.applyGlobalHooks();
    await this.migrateLegacyStorage();
    this.logEvent('info', 'Vault unlocked');
    this.emit();
  }

  lock(): void {
    if (this.key) {
      void getSodium()
        .then(sodium => {
          sodium.memzero(this.key!);
        })
        .catch(() => undefined);
    }
    this.key = null;
    delete (globalThis as { __secureStorageEncrypt?: (plaintext: string) => string })
      .__secureStorageEncrypt;
    delete (globalThis as { __secureStorageDecrypt?: (ciphertext: string) => string })
      .__secureStorageDecrypt;
    if (this.status.state !== 'uninitialized') {
      this.status = { ...this.status, state: 'locked' };
      this.emit();
    }
    this.logEvent('info', 'Vault locked');
  }

  isUnlocked(): boolean {
    return this.status.state === 'unlocked' && !!this.key;
  }

  encryptString(message: unknown): string {
    if (!this.key) {
      throw new Error('encryptString: key not set');
    }
    if (!this.status.sodiumReady) {
      throw new Error('encryptString: libsodium not ready');
    }

    const sodium = this.assertSodium();
    const key = this.key as Uint8Array;
    if (
      !(key instanceof Uint8Array) ||
      key.length !== sodium.crypto_aead_xchacha20poly1305_ietf_KEYBYTES
    ) {
      throw new Error('encryptString: invalid key type/length');
    }

    const msg = toBytes(message);

    const nonceLen = sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES;
    if (!Number.isInteger(nonceLen) || nonceLen <= 0) {
      throw new Error('encryptString: invalid nonce length constant');
    }
    const nonce = sodium.randombytes_buf(nonceLen);

    // Ensure msg is truly a Uint8Array for libsodium (realm-safe conversion)
    const finalMsg = ArrayBuffer.isView(msg)
      ? new Uint8Array(
          (msg as ArrayBufferView).buffer,
          (msg as ArrayBufferView).byteOffset,
          (msg as ArrayBufferView).byteLength
        )
      : msg;

    const cipher = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
      finalMsg,
      null,
      null,
      nonce,
      key
    );

    return JSON.stringify({
      v: 'xchacha20-poly1305',
      n: sodium.to_base64(nonce, BASE64_VARIANT),
      c: sodium.to_base64(cipher, BASE64_VARIANT),
    });
  }

  decryptString(payload: string): string {
    if (!this.key) {
      throw new Error('decryptString: key not set');
    }
    if (!this.status.sodiumReady) {
      throw new Error('decryptString: libsodium not ready');
    }

    const sodium = this.assertSodium();
    try {
      const env = JSON.parse(payload);
      if (env?.v !== 'xchacha20-poly1305') {
        return payload;
      }

      const key = this.key as Uint8Array;
      const nonce = sodium.from_base64(env.n, BASE64_VARIANT);
      const cipher = sodium.from_base64(env.c, BASE64_VARIANT);
      const plain = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
        null,
        cipher,
        null,
        nonce,
        key
      );
      return sodium.to_string(plain);
    } catch {
      return payload;
    }
  }

  encryptBytes(data: Uint8Array): { nonce: string; cipher: string } {
    if (!this.key) {
      throw new Error('Vault is locked.');
    }
    const sodium = this.assertSodium();
    const nonceSize = sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES;
    if (!Number.isInteger(nonceSize) || nonceSize <= 0) {
      throw new Error('encryptBytes: invalid nonce length constant');
    }
    const nonce = sodium.randombytes_buf(nonceSize);
    const cipher = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
      data,
      null,
      null,
      nonce,
      this.key
    );
    return {
      nonce: sodium.to_base64(nonce, BASE64_VARIANT),
      cipher: sodium.to_base64(cipher, BASE64_VARIANT),
    };
  }

  decryptBytes(payload: { nonce: string; cipher: string }): Uint8Array {
    if (!this.key) {
      throw new Error('Vault is locked.');
    }
    const sodium = this.assertSodium();
    const nonce = sodium.from_base64(payload.nonce, BASE64_VARIANT);
    const cipher = sodium.from_base64(payload.cipher, BASE64_VARIANT);
    const decrypted = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
      null,
      cipher,
      null,
      nonce,
      this.key
    );
    return decrypted;
  }

  clearAll(): void {
    secureStorage.remove(STORAGE_KEY);
    this.lock();
    this.status = { state: 'uninitialized', metadata: null, sodiumReady: this.status.sodiumReady };
    this.emit();
  }

  private emit(): void {
    for (const listener of this.listeners) {
      listener(this.status);
    }
  }

  private loadMetadata(): VaultMetadata | null {
    try {
      const metadata = secureStorage.get<VaultMetadata>(STORAGE_KEY);
      if (!metadata) {
        return null;
      }
      return metadata;
    } catch {
      return null;
    }
  }

  private async migrateLegacyStorage(): Promise<void> {
    if (!this.key || !this.status.metadata) {
      return;
    }

    let reencrypted = 0;
    let skipped = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const fullKey = localStorage.key(i);
      if (!fullKey || !fullKey.startsWith('pt:')) {
        continue;
      }
      if (fullKey === `pt:${STORAGE_KEY}`) {
        continue;
      }

      const raw = localStorage.getItem(fullKey);
      if (typeof raw !== 'string' || raw.length === 0) {
        skipped += 1;
        continue;
      }
      if (isEnvelopeString(raw)) {
        continue;
      }

      try {
        const wrapped = this.encryptString(raw);
        localStorage.setItem(fullKey, wrapped);
        reencrypted += 1;
      } catch (error) {
        skipped += 1;
        this.logEvent('warning', 'Failed to migrate legacy secureStorage entry', {
          key: fullKey,
          error: error instanceof Error ? error.message : 'unknown',
        });
      }
    }

    if (reencrypted > 0 || skipped > 0) {
      const metadata: VaultMetadata = {
        ...this.status.metadata,
        migrations: {
          ...this.status.metadata?.migrations,
          legacyCompletedAt: new Date().toISOString(),
        },
        updatedAt: new Date().toISOString(),
      };
      const updateResult = secureStorage.set(STORAGE_KEY, metadata);
      if (!updateResult.success) {
        this.logEvent('warning', 'Failed to update vault metadata after migration');
      }
      this.status = { ...this.status, metadata };
      this.logEvent('info', 'Legacy storage re-encrypted', { reencrypted, skipped });
    }
  }

  private applyGlobalHooks(): void {
    if (!this.key) return;
    (
      globalThis as { __secureStorageEncrypt?: (plaintext: string) => string }
    ).__secureStorageEncrypt = (plaintext: string) => this.encryptString(plaintext);
    (
      globalThis as { __secureStorageDecrypt?: (ciphertext: string) => string }
    ).__secureStorageDecrypt = (ciphertext: string) => this.decryptString(ciphertext);
  }

  private assertSodium(): typeof import('libsodium-wrappers') {
    const sodium = getSodiumSync();
    if (!sodium) {
      throw new Error('libsodium not ready');
    }
    return sodium;
  }

  private logEvent(
    level: 'info' | 'warning' | 'error',
    message: string,
    metadata?: Record<string, unknown>
  ): void {
    try {
      securityService.logSecurityEvent({
        type: 'vault',
        level,
        message,
        metadata,
        timestamp: new Date(),
      });
    } catch {
      // ignore logging failures
    }
  }
}

export const vaultService = new EncryptedVaultService();

// DEV-only: expose a small test hook on window so E2E tests can programmatically
// initialize or unlock the vault in newly created pages. This avoids flaky UI
// interactions in isolated pages used by tests. Only attach in development builds.
try {
  // Vite exposes import.meta.env.DEV; guard to ensure this stays absent in prod
  if (import.meta.env && (import.meta as unknown as { DEV?: boolean }).DEV) {
    (globalThis as unknown as { __test_vault?: unknown }).__test_vault = {
      setup: async (passphrase: string) => {
        try {
          await vaultService.setupPassphrase(passphrase);
          return { success: true };
        } catch (err) {
          return { success: false, error: String((err as Error)?.message || err) };
        }
      },
      unlock: async (passphrase: string) => {
        try {
          await vaultService.unlock(passphrase);
          return { success: true };
        } catch (err) {
          return { success: false, error: String((err as Error)?.message || err) };
        }
      },
      isUnlocked: () => vaultService.isUnlocked(),
    };
  }
} catch {
  // ignore failures attaching test hook
}
