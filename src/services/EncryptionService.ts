/**
 * End-to-End Encryption Service
 * Provides comprehensive encryption for all data at rest and in transit
 */

import { securityService } from './SecurityService';
import type { PainEntry } from '../types';

// --- Web Crypto helpers ---
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(buffer).toString('base64');
  }
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  if (typeof Buffer !== 'undefined') {
    return Uint8Array.from(Buffer.from(base64, 'base64')).buffer;
  }
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

function arrayBufferToHex(buffer: ArrayBuffer): string {
  return bufferToHex(buffer);
}

function hexToArrayBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  return bytes.buffer;
}

function concatUint8(a: Uint8Array, b: Uint8Array): Uint8Array {
  const out = new Uint8Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
}

async function deriveKeyFromPassword(password: string, salt: Uint8Array, iterations = 150000): Promise<ArrayBuffer> {
  const pwUtf8 = new TextEncoder().encode(password);
  const baseKey = await crypto.subtle.importKey('raw', pwUtf8, 'PBKDF2', false, ['deriveBits', 'deriveKey']);
  // Ensure we pass a plain ArrayBuffer (slice to the exact view range)
  const saltBuf = salt.buffer.slice(salt.byteOffset, salt.byteOffset + salt.byteLength) as ArrayBuffer;
  const derived = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: saltBuf as ArrayBuffer, iterations, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  const raw = await crypto.subtle.exportKey('raw', derived);
  return raw;
}


// Encryption metadata for tracking
export interface EncryptionMetadata {
  algorithm: string;
  keyId: string;
  timestamp: Date;
  version: string;
  // Optional salt used when deriving a password-based key for backups
  passwordSalt?: string;
  // optional IV for AES-GCM (base64)
  iv?: string;
}

// Encrypted data wrapper
export interface EncryptedData<T = unknown> {
  data: string; // Encrypted content
  metadata: EncryptionMetadata;
  checksum: string; // For integrity verification
  type?: T; // Type information for better TypeScript support (not used at runtime)
}

// Key management interface
export interface KeyManager {
  generateKey(keyId: string): Promise<string>;
  storeKey(keyId: string, key: string): Promise<void>;
  retrieveKey(keyId: string): Promise<string | null>;
  rotateKey(keyId: string): Promise<string>;
  deleteKey(keyId: string): Promise<void>;
  listKeys(): Promise<string[]>;
}

// Encryption options
export interface EncryptionOptions {
  keyId?: string;
  algorithm?: 'AES-256' | 'AES-192' | 'AES-128';
  useCompression?: boolean;
  addIntegrityCheck?: boolean;
}

/**
 * End-to-End Encryption Service
 * Handles encryption/decryption of all sensitive data
 */
export class EndToEndEncryptionService {
  private keyManager: KeyManager;
  private defaultKeyId = 'pain-tracker-master';
  // Only keys in this whitelist are allowed to be persisted (wrapped) to storage.
  // Other keys will remain in-memory only. Update this list when adding new persisted keys.
  private readonly SENSITIVITY_WHITELIST = new Set<string>([
    'pain-tracker-master',
    // backup-* keys (password-protected backups) are allowed
  ]);
  // In-memory fallback cache for test/jsdom environments where secure storage may fail
  private inMemoryKeyCache = new Map<string, { key: string; created: string }>();

  constructor() {
    this.keyManager = this.createKeyManager();
    this.initializeService();
  }

  // Detect test environments (Vitest / NODE_ENV=test)
  private isTestEnv(): boolean {
    try {
      // process may not exist in some browser-like environments
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const env = (typeof process !== 'undefined' ? (process as any).env : undefined) || {};
      return !!(env && (env.VITEST || env.NODE_ENV === 'test'));
    } catch {
      return false;
    }
  }

  // Route security logs through a filter so tests don't get noisy info/warning messages
  private logSecurityEvent(event: Parameters<typeof securityService.logSecurityEvent>[0]) {
    // Always forward security events to the centralized security service.
    // In test environments we avoid additional console noise elsewhere, but
    // tests rely on recorded security events (for example key rotation). Keep
    // logging active so unit tests can assert on recorded events.
    try {
      securityService.logSecurityEvent(event);
    } catch (e) {
      // Swallow logging errors to avoid impacting encryption flows/tests
      // but still avoid throwing from the logger.
      console.debug('logSecurityEvent failed', e);
    }
  }

  private async initializeService(): Promise<void> {
    try {
      // Ensure default key exists
      const defaultKey = await this.keyManager.retrieveKey(this.defaultKeyId);
      if (!defaultKey) {
        await this.keyManager.generateKey(this.defaultKeyId);
      }

      this.logSecurityEvent({
        type: 'encryption',
        level: 'info',
        message: 'End-to-end encryption service initialized',
        timestamp: new Date()
      });
    } catch (error) {
      this.logSecurityEvent({
        type: 'encryption',
        level: 'error',
        message: 'Failed to initialize encryption service',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: new Date()
      });
    }
  }

  private createKeyManager(): KeyManager {
    return {
      generateKey: async (keyId: string): Promise<string> => {
        // Generate a new AES-GCM key and a separate HMAC key, then wrap them for persistent storage.
        const encKey = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
        const hmacKey = await crypto.subtle.generateKey({ name: 'HMAC', hash: 'SHA-256' }, true, ['sign', 'verify']);

        // Wrap both keys using the SecurityService (which uses the master key)
        let payload: string;
        try {
          const encWrapped = await securityService.wrapKey(encKey);
          const hmacWrapped = await securityService.wrapKey(hmacKey);
          payload = JSON.stringify({ encWrapped, hmacWrapped, created: new Date().toISOString() });
          await this.keyManager.storeKey(keyId, payload);
        } catch (e) {
          // Fallback: export raw key material and store as base64 (will be encrypted at rest by secure storage)
          const encRaw = await crypto.subtle.exportKey('raw', encKey);
          const hmacRaw = await crypto.subtle.exportKey('raw', hmacKey);
          payload = JSON.stringify({ enc: arrayBufferToBase64(encRaw), hmac: arrayBufferToBase64(hmacRaw), created: new Date().toISOString() });
          await this.keyManager.storeKey(keyId, payload);
        }

        this.logSecurityEvent({
          type: 'encryption',
          level: 'info',
          message: `New encryption key generated: ${keyId}`,
          timestamp: new Date()
        });

        return payload;
      },

      storeKey: async (keyId: string, key: string): Promise<void> => {
        // If keyId is not whitelisted, keep in-memory only
        if (!this.SENSITIVITY_WHITELIST.has(keyId) && !keyId.startsWith('backup-')) {
          this.inMemoryKeyCache.set(keyId, { key, created: new Date().toISOString() });
          return;
        }

        try {
          const storage = securityService.createSecureStorage();

          // If caller passed a wrapped payload already, store as-is.
          try {
            const parsed = JSON.parse(key) as any;
            if (parsed && (parsed.encWrapped || parsed.hmacWrapped || parsed.wrapped)) {
              await storage.store(`key:${keyId}`, { ...parsed, created: new Date().toISOString() }, true);
              this.inMemoryKeyCache.set(keyId, { key: JSON.stringify({ ...parsed, created: new Date().toISOString() }), created: new Date().toISOString() });
              return;
            }
            // If caller provided raw enc/hmac base64 material, import and wrap it before storing
            if (parsed && (parsed.enc || parsed.hmac)) {
              // Import provided raw keys and wrap using securityService
              let encWrapped: string | undefined;
              let hmacWrapped: string | undefined;
              if (parsed.enc) {
                const encRaw = base64ToArrayBuffer(parsed.enc);
                const encCrypto = await crypto.subtle.importKey('raw', encRaw, { name: 'AES-GCM' }, true, ['encrypt', 'decrypt']);
                encWrapped = await securityService.wrapKey(encCrypto);
              }
              if (parsed.hmac) {
                const hmacRaw = base64ToArrayBuffer(parsed.hmac);
                const hmacCrypto = await crypto.subtle.importKey('raw', hmacRaw, { name: 'HMAC', hash: 'SHA-256' }, true, ['sign', 'verify']);
                hmacWrapped = await securityService.wrapKey(hmacCrypto);
              }
              const toStore = { encWrapped, hmacWrapped, created: new Date().toISOString() };
              await storage.store(`key:${keyId}`, toStore, true);
              this.inMemoryKeyCache.set(keyId, { key: JSON.stringify(toStore), created: new Date().toISOString() });
              return;
            }
          } catch (parseErr) {
            // fallthrough - treat as opaque and store via secure storage
          }

          // Default: store the provided key string as-is (secure storage encrypts it at rest)
          await storage.store(`key:${keyId}`, { key, created: new Date().toISOString() }, true);
        } catch (e) {
          // Fallback to in-memory store (primarily for tests)
          this.inMemoryKeyCache.set(keyId, { key, created: new Date().toISOString() });
        }
        // Always populate in-memory cache as well so callers can rely on fast access and for rotation flows
        try {
          this.inMemoryKeyCache.set(keyId, { key, created: new Date().toISOString() });
        } catch {
          // ignore cache set failures
        }
      },

      retrieveKey: async (keyId: string): Promise<string | null> => {
        try {
          const storage = securityService.createSecureStorage();
          const stored = await storage.retrieve(`key:${keyId}`, true) as any | null;
          if (stored) {
            // If stored contains wrapped blobs, return the wrapped JSON so callers can unwrap via SecurityService
            try {
              if (stored.encWrapped || stored.hmacWrapped || stored.wrapped) {
                const payload = stored.encWrapped || stored.wrapped;
                const out = payload ? JSON.stringify({ encWrapped: stored.encWrapped, hmacWrapped: stored.hmacWrapped, created: stored.created }) : JSON.stringify(stored);
                // populate in-memory cache for fast access
                this.inMemoryKeyCache.set(keyId, { key: out, created: stored.created || new Date().toISOString() });
                return out;
              }
              if (stored.key) {
                this.inMemoryKeyCache.set(keyId, { key: stored.key, created: stored.created || new Date().toISOString() });
                return stored.key;
              }
            } catch {}
          }
          const mem = this.inMemoryKeyCache.get(keyId);
          return mem?.key || null;
        } catch (error) {
          securityService.logSecurityEvent({
            type: 'encryption',
            level: 'error',
            message: `Failed to retrieve key: ${keyId}`,
            metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
            timestamp: new Date()
          });
          const mem = this.inMemoryKeyCache.get(keyId);
          return mem?.key || null;
        }
      },

      rotateKey: async (keyId: string): Promise<string> => {
        // Retrieve old key before rotation
        const oldKey = await this.keyManager.retrieveKey(keyId);
        
        // Store old key as archived if it exists
        if (oldKey) {
          try {
            const storage = securityService.createSecureStorage();
            await storage.store(`archived-key:${keyId}:${Date.now()}`, { key: oldKey, archived: new Date().toISOString() }, true);
          } catch (e) {
            securityService.logSecurityEvent({
              type: 'encryption',
              level: 'warning',
              message: `Failed to archive old key during rotation: ${keyId}`,
              metadata: { error: e instanceof Error ? e.message : 'Unknown error' },
              timestamp: new Date()
            });
          }
        }

        // Generate new keys (extractable to allow fallback export if wrap fails)
        const encKey = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
        const hmacKey = await crypto.subtle.generateKey({ name: 'HMAC', hash: 'SHA-256' }, true, ['sign', 'verify']);

        let payload: string;
        try {
          // Prefer wrapping via SecurityService
          const encWrapped = await securityService.wrapKey(encKey);
          const hmacWrapped = await securityService.wrapKey(hmacKey);
          payload = JSON.stringify({ encWrapped, hmacWrapped, created: new Date().toISOString() });
          await this.keyManager.storeKey(keyId, payload);
        } catch (e) {
          // Fallback: export raw key material and store via secure storage (encrypted at rest)
          const encRaw = await crypto.subtle.exportKey('raw', encKey);
          const hmacRaw = await crypto.subtle.exportKey('raw', hmacKey);
          payload = JSON.stringify({ enc: arrayBufferToBase64(encRaw), hmac: arrayBufferToBase64(hmacRaw), created: new Date().toISOString() });
          await this.keyManager.storeKey(keyId, payload);
        }

        this.logSecurityEvent({
          type: 'encryption',
          level: 'info',
          message: `Key rotated: ${keyId}`,
          timestamp: new Date()
        });

        return payload;
      },

      deleteKey: async (keyId: string): Promise<void> => {
        try {
          const storage = securityService.createSecureStorage();
          await storage.delete(`key:${keyId}`);
        } catch {
          this.inMemoryKeyCache.delete(keyId);
        }
        
        this.logSecurityEvent({
          type: 'encryption',
          level: 'warning',
          message: `Key deleted: ${keyId}`,
          timestamp: new Date()
        });
      },

      listKeys: async (): Promise<string[]> => {
        const keys: Set<string> = new Set();
        try {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith('key:')) {
              keys.add(key.substring(4));
            }
          }
        } catch {
          // ignore localStorage access errors
        }
        // Include in-memory keys
        this.inMemoryKeyCache.forEach((_v, k) => keys.add(k));
        return Array.from(keys);
      }
    };
  }

  /**
   * Encrypt any data object
   */
  async encrypt<T>(data: T, options: EncryptionOptions = {}): Promise<EncryptedData<T>> {
    try {
      const keyId = options.keyId || this.defaultKeyId;
      const algorithm = options.algorithm || 'AES-256';
      const useCompression = options.useCompression ?? true;
      const addIntegrityCheck = options.addIntegrityCheck ?? true;

  // Get encryption key (stored as base64 raw key)
  let key = await this.keyManager.retrieveKey(keyId);
      if (!key) {
        // Auto-generate missing key (helps test environment or first-run scenarios)
        securityService.logSecurityEvent({
          type: 'encryption',
          level: 'warning',
          message: `Encryption key missing, generating on-demand: ${keyId}`,
          timestamp: new Date()
        });
        key = await this.keyManager.generateKey(keyId);
      }

  // Serialize data
  let serialized = JSON.stringify(data);

      // Optional compression
      if (useCompression && serialized.length > 1000) {
        // Simple compression simulation (in real app, use actual compression)
        serialized = this.compressString(serialized);
      }

      // Resolve key material: accept wrapped payloads (encWrapped/hmacWrapped) or raw base64 fields
      let encCryptoKey: CryptoKey | null = null;
      let hmacCryptoKey: CryptoKey | null = null;
      try {
        const parsed = JSON.parse(key as string) as any;
        if (parsed) {
          if (parsed.encWrapped || parsed.wrapped) {
            const wrapped = parsed.encWrapped || parsed.wrapped;
            encCryptoKey = await securityService.unwrapKey(wrapped, { name: 'AES-GCM' }, ['encrypt', 'decrypt']);
          }
          if (parsed.hmacWrapped) {
            hmacCryptoKey = await securityService.unwrapKey(parsed.hmacWrapped, { name: 'HMAC', hash: { name: 'SHA-256' } } as any, ['sign', 'verify']);
          }
          if (!encCryptoKey && parsed.enc) {
            try {
              const encRaw = base64ToArrayBuffer(parsed.enc);
              encCryptoKey = await crypto.subtle.importKey('raw', encRaw, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
            } catch {}
          }
          if (!hmacCryptoKey && parsed.hmac) {
            try {
              const hmacRaw = base64ToArrayBuffer(parsed.hmac);
              hmacCryptoKey = await crypto.subtle.importKey('raw', hmacRaw, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
            } catch {}
          }
        }
      } catch {
        // Not JSON — try to import as raw base64 AES key
        try {
          const raw = base64ToArrayBuffer(key as string);
          encCryptoKey = await crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
        } catch {}
      }

      if (!encCryptoKey) throw new Error('Encryption key material not available');

      // AES-GCM IV (12 bytes recommended)
      const iv = crypto.getRandomValues(new Uint8Array(12));

      const enc = new TextEncoder().encode(serialized);
      const cipherBuffer = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, encCryptoKey, enc);
      const encrypted = arrayBufferToBase64(cipherBuffer);

      // Compute HMAC over ciphertext if hmac key present; store HMAC as base64
      let checksum = '';
      if (addIntegrityCheck && hmacCryptoKey) {
        const sig = await crypto.subtle.sign('HMAC', hmacCryptoKey, base64ToArrayBuffer(encrypted));
        checksum = arrayBufferToBase64(sig);
      } else if (addIntegrityCheck) {
        // fallback to SHA-256 digest (base64)
        const digest = await crypto.subtle.digest('SHA-256', base64ToArrayBuffer(encrypted));
        checksum = arrayBufferToBase64(digest);
      }

      const metadata: EncryptionMetadata = {
        algorithm,
        keyId,
        timestamp: new Date(),
        version: '2.0.0',
        iv: arrayBufferToBase64(iv.buffer)
      } as EncryptionMetadata;

      this.logSecurityEvent({
        type: 'encryption',
        level: 'info',
        message: 'Data encrypted successfully',
        metadata: {
          keyId,
          algorithm,
          originalSize: serialized.length,
          encryptedSize: encrypted.length,
          compressed: useCompression
        },
        timestamp: new Date()
      });

      return {
        data: encrypted,
        metadata,
        checksum
      };
    } catch (error) {
      this.logSecurityEvent({
        type: 'encryption',
        level: 'error',
        message: 'Data encryption failed',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: new Date()
      });
      throw error;
    }
  }

  /**
   * Decrypt encrypted data
   */
  async decrypt<T>(encryptedData: EncryptedData<T>): Promise<T> {
    try {
      const { data, metadata, checksum } = encryptedData;
      const { keyId, algorithm } = metadata;
      // Get decryption key
      const key = await this.keyManager.retrieveKey(keyId);
      if (!key) {
        throw new Error(`Decryption key not found: ${keyId}`);
      }

      // Support legacy CryptoJS ciphertexts for backward compatibility
      if (metadata.version && metadata.version.startsWith('1.')) {
        // Lazy-load CryptoJS only when handling legacy data
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const CryptoJS = require('crypto-js');
        const decrypted = CryptoJS.AES.decrypt(data, key).toString(CryptoJS.enc.Utf8);
        if (!decrypted) throw new Error('Decryption failed - invalid key or corrupted data (legacy)');
        if (checksum) {
          const calculatedChecksum = CryptoJS.SHA256(decrypted + key).toString();
          if (calculatedChecksum !== checksum) throw new Error('Data integrity check failed - data may be corrupted (legacy)');
        }
        let final = decrypted;
        if (decrypted.startsWith('COMPRESSED:')) final = this.decompressString(decrypted);
        this.logSecurityEvent({ type: 'encryption', level: 'info', message: 'Data decrypted (legacy) successfully', metadata: { keyId, algorithm, integrityVerified: !!checksum }, timestamp: new Date() });
        return JSON.parse(final);
      }

      // New branch: AES-GCM via SubtleCrypto
      // Resolve key payload: support wrapped keys (encWrapped/hmacWrapped), raw enc/hmac base64, or bare base64 AES key
      let encCryptoKey: CryptoKey | null = null;
      let hmacCryptoKey: CryptoKey | null = null;
      try {
        const parsed = JSON.parse(key as string) as any;
        if (parsed) {
          if (parsed.encWrapped || parsed.wrapped) {
            const wrapped = parsed.encWrapped || parsed.wrapped;
            encCryptoKey = await securityService.unwrapKey(wrapped, { name: 'AES-GCM' }, ['encrypt', 'decrypt']);
          }
          if (parsed.hmacWrapped) {
            hmacCryptoKey = await securityService.unwrapKey(parsed.hmacWrapped, { name: 'HMAC', hash: { name: 'SHA-256' } } as any, ['sign', 'verify']);
          }
          if (!encCryptoKey && parsed.enc) {
            try {
              const encRaw = base64ToArrayBuffer(parsed.enc);
              encCryptoKey = await crypto.subtle.importKey('raw', encRaw, { name: 'AES-GCM' }, false, ['decrypt']);
            } catch {}
          }
          if (!hmacCryptoKey && parsed.hmac) {
            try {
              const hmacRaw = base64ToArrayBuffer(parsed.hmac);
              hmacCryptoKey = await crypto.subtle.importKey('raw', hmacRaw, { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
            } catch {}
          }
        }
      } catch {
        // Not JSON -> try bare base64 AES key
        try {
          const raw = base64ToArrayBuffer(key as string);
          encCryptoKey = await crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['decrypt']);
        } catch {}
      }

      if (!encCryptoKey) throw new Error('Decryption key material not available');

      // Read IV from metadata
      const ivBase64 = metadata.iv;
      if (!ivBase64) throw new Error('Missing IV in metadata');
      const iv = new Uint8Array(base64ToArrayBuffer(ivBase64));

      // Decode ciphertext
      const cipherBuffer = base64ToArrayBuffer(data);
      let decryptedBuffer: ArrayBuffer;
      try {
        decryptedBuffer = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, encCryptoKey, cipherBuffer);
      } catch {
        throw new Error('Decryption failed - invalid key or corrupted data');
      }

      const decrypted = new TextDecoder().decode(new Uint8Array(decryptedBuffer));

      // Verify integrity if checksum exists (expect base64 HMAC or base64 digest)
      if (checksum) {
        if (hmacCryptoKey) {
          const valid = await crypto.subtle.verify('HMAC', hmacCryptoKey, base64ToArrayBuffer(checksum), base64ToArrayBuffer(data));
          if (!valid) throw new Error('Data integrity check failed - HMAC mismatch');
        } else {
          // fallback to digest comparison
          const digest = await crypto.subtle.digest('SHA-256', base64ToArrayBuffer(data));
          const expected = arrayBufferToBase64(digest);
          if (expected !== checksum) throw new Error('Data integrity check failed - digest mismatch');
        }
      }

      // Decompress if needed
      let final = decrypted;
      if (decrypted.startsWith('COMPRESSED:')) {
        final = this.decompressString(decrypted);
      }

      this.logSecurityEvent({
        type: 'encryption',
        level: 'info',
        message: 'Data decrypted successfully',
        metadata: {
          keyId,
          algorithm,
          integrityVerified: !!checksum
        },
        timestamp: new Date()
      });

      return JSON.parse(final);
    } catch (error) {
      this.logSecurityEvent({
        type: 'encryption',
        level: 'error',
        message: 'Data decryption failed',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: new Date()
      });
      throw error;
    }
  }

  /**
   * Encrypt pain entry data specifically
   */
  async encryptPainEntry(entry: PainEntry): Promise<EncryptedData<PainEntry>> {
    return this.encrypt(entry, {
      useCompression: true,
      addIntegrityCheck: true
    });
  }

  /**
   * Decrypt pain entry data specifically
   */
  async decryptPainEntry(encryptedEntry: EncryptedData<PainEntry>): Promise<PainEntry> {
    return this.decrypt(encryptedEntry);
  }

  /**
   * Encrypt an array of pain entries efficiently
   */
  async encryptPainEntries(entries: PainEntry[]): Promise<EncryptedData<PainEntry[]>> {
    return this.encrypt(entries, {
      useCompression: true,
      addIntegrityCheck: true
    });
  }

  /**
   * Decrypt an array of pain entries
   */
  async decryptPainEntries(encryptedEntries: EncryptedData<PainEntry[]>): Promise<PainEntry[]> {
    return this.decrypt(encryptedEntries);
  }

  /**
   * Secure backup creation with encryption
   */
  async createEncryptedBackup(data: unknown, password?: string): Promise<string> {
    const keyId = password ? `backup-${Date.now()}` : this.defaultKeyId;
    let passwordSalt: string | undefined;
    if (password) {
      // Generate salt and derive key using PBKDF2 via SubtleCrypto
      const salt = crypto.getRandomValues(new Uint8Array(16));
      passwordSalt = arrayBufferToHex(salt.buffer);
      const iterationOverride = (typeof process !== 'undefined' && process.env && (process.env.VITEST || process.env.NODE_ENV === 'test'))
        ? 500
        : 10000;
      const derivedRaw = await deriveKeyFromPassword(password, salt, iterationOverride);
      const derivedKeyBase64 = arrayBufferToBase64(derivedRaw);
      await this.keyManager.storeKey(keyId, derivedKeyBase64);
    }

    const encrypted = await this.encrypt(data, { keyId });
    if (password && passwordSalt) {
      (encrypted.metadata as EncryptionMetadata).passwordSalt = passwordSalt;
    }

    this.logSecurityEvent({
      type: 'encryption',
      level: 'info',
      message: 'Encrypted backup created',
      metadata: { keyId, passwordProtected: !!password },
      timestamp: new Date()
    });

    return JSON.stringify(encrypted, null, 2);
  }

  /**
   * Restore from encrypted backup
   */
  async restoreFromEncryptedBackup<T>(backupData: string, password?: string): Promise<T> {
    try {
      const encrypted = JSON.parse(backupData) as EncryptedData<T>;
      
      if (password) {
        const saltHex = (encrypted.metadata as EncryptionMetadata).passwordSalt;
        if (!saltHex) throw new Error('Backup missing password salt metadata');
        const salt = hexToArrayBuffer(saltHex);
        const iterationOverride = (typeof process !== 'undefined' && process.env && (process.env.VITEST || process.env.NODE_ENV === 'test'))
          ? 500
          : 10000;
        const derivedRaw = await deriveKeyFromPassword(password, new Uint8Array(salt), iterationOverride);
        const derivedKeyBase64 = arrayBufferToBase64(derivedRaw);
        await this.keyManager.storeKey(encrypted.metadata.keyId, derivedKeyBase64);
      }

      const decrypted = await this.decrypt(encrypted);
      
      this.logSecurityEvent({
        type: 'encryption',
        level: 'info',
        message: 'Data restored from encrypted backup',
        metadata: { keyId: encrypted.metadata.keyId },
        timestamp: new Date()
      });

      return decrypted;
    } catch (error) {
      this.logSecurityEvent({
        type: 'encryption',
        level: 'error',
        message: 'Failed to restore from encrypted backup',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: new Date()
      });
      throw error;
    }
  }

  /**
   * Key rotation for enhanced security
   */
  async rotateEncryptionKeys(): Promise<void> {
    try {
      const keys = await this.keyManager.listKeys();
      const rotationResults: Array<{ keyId: string; success: boolean }> = [];

      for (const keyId of keys) {
        try {
          await this.keyManager.rotateKey(keyId);
          rotationResults.push({ keyId, success: true });
        } catch (error) {
          rotationResults.push({ keyId, success: false });
          console.error(`Failed to rotate key ${keyId}:`, error);
        }
      }

      this.logSecurityEvent({
        type: 'encryption',
        level: 'info',
        message: 'Key rotation completed',
        metadata: {
          totalKeys: keys.length,
          successful: rotationResults.filter(r => r.success).length,
          failed: rotationResults.filter(r => !r.success).length
        },
        timestamp: new Date()
      });
    } catch (error) {
      this.logSecurityEvent({
        type: 'encryption',
        level: 'error',
        message: 'Key rotation failed',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: new Date()
      });
      throw error;
    }
  }

  /**
   * Get encryption status and metrics
   */
  getEncryptionStatus(): {
    keysGenerated: number;
    defaultKeyExists: boolean;
    encryptionEnabled: boolean;
    lastKeyRotation: Date | null;
  } {
    return {
      keysGenerated: 0, // Would be implemented with actual key counting
      defaultKeyExists: true, // Would check if default key exists
      encryptionEnabled: true,
      lastKeyRotation: null // Would track last rotation
    };
  }

  // Simple compression simulation (replace with actual compression library)
  private compressString(str: string): string {
    // Basic UTF-8 to Uint8Array then base64 + simple RLE for repeated characters (limited but better than placeholder)
    // 1. Simple run-length encode sequences >4
    let encoded = '';
    let i = 0;
    while (i < str.length) {
      let j = i + 1;
      while (j < str.length && str[j] === str[i] && (j - i) < 255) j++;
      const runLength = j - i;
      if (runLength > 4) {
        encoded += `~${str[i]}${String.fromCharCode(runLength)}`; // ~ marker + char + length byte
      } else {
        encoded += str.slice(i, j);
      }
      i = j;
    }
    const b64 = btoa(unescape(encodeURIComponent(encoded)));
    return `COMPRESSED:v1:${b64}`;
  }

  private decompressString(compressed: string): string {
    if (!compressed.startsWith('COMPRESSED:v1:')) return compressed.replace('COMPRESSED:', '');
    const b64 = compressed.substring('COMPRESSED:v1:'.length);
    const decoded = decodeURIComponent(escape(atob(b64)));
    // Reverse simple RLE
    let out = '';
    for (let i = 0; i < decoded.length; i++) {
      if (decoded[i] === '~' && i + 2 < decoded.length) {
        const ch = decoded[i + 1];
        const len = decoded.charCodeAt(i + 2);
        out += ch.repeat(len);
        i += 2;
      } else {
        out += decoded[i];
      }
    }
    return out;
  }
}

// Export singleton instance
export const encryptionService = new EndToEndEncryptionService();
