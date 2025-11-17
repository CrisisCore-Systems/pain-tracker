import { describe, it, expect } from 'vitest';
import CryptoJS from 'crypto-js';
import { encryptionService } from '../services/EncryptionService';
import { securityService } from '../services/SecurityService';
import type { SecurityEvent } from '../services/SecurityService';

// These tests specifically exercise previously uncovered fallback / error branches
// in EncryptionService: in-memory key cache fallback, key rotation failure path,
// and legacy (non versioned) compressed payload decompression path.

describe('EncryptionService additional fallback and legacy paths', () => {
  it('falls back to in-memory key cache when secure storage write fails', async () => {
    const originalSetItem = localStorage.setItem;
    // Force storage failure inside key manager storeKey -> storage.store path
    (localStorage as unknown as { setItem: (...args: unknown[]) => void }).setItem = () => {
      throw new Error('Forced failure');
    };

    const keyId = 'fallback-test-key';
    const keyValue = 'abc123-fallback';
    await encryptionService['keyManager'].storeKey(keyId, keyValue);

    // Restore original localStorage.setItem
    (localStorage as unknown as { setItem: typeof originalSetItem }).setItem = originalSetItem;

    // Verify key persisted in in-memory cache (private field access via bracket)
    const cached = encryptionService['inMemoryKeyCache'].get(keyId);
    expect(cached).toBeTruthy();
    if (!cached) throw new Error('Cached key missing');
    expect(cached.key).toBe(keyValue);
  });

  it('records failed key rotation without throwing (rotation failure branch)', async () => {
    // Ensure a key exists in in-memory cache to be picked up by listKeys
    const failingKeyId = 'failing-rotation-key';
    encryptionService['inMemoryKeyCache'].set(failingKeyId, {
      key: 'old-key',
      created: new Date().toISOString(),
    });

    // Patch rotateKey to throw for this key while preserving original for others
    const originalRotate = encryptionService['keyManager'].rotateKey;
    encryptionService['keyManager'].rotateKey = async (keyId: string) => {
      if (keyId === failingKeyId) {
        throw new Error('Simulated rotation failure');
      }
      return originalRotate.call(encryptionService['keyManager'], keyId);
    };

    // Should not throw despite internal failure
    await encryptionService.rotateEncryptionKeys();

    // Restore rotateKey
    encryptionService['keyManager'].rotateKey = originalRotate;

    // Confirm security event logged for completion
    const events = securityService.getSecurityEvents({ type: 'encryption' });
    const rotationEvent = events.find((e: SecurityEvent) => e.message === 'Key rotation completed');
    expect(rotationEvent).toBeTruthy();
  });

  it('decompresses legacy payloads with COMPRESSED: prefix (no version marker)', async () => {
    // Ensure default key exists
    let key = await encryptionService['keyManager'].retrieveKey('pain-tracker-master');
    if (!key) {
      key = await encryptionService['keyManager'].generateKey('pain-tracker-master');
    }

    const legacyPlaintext = 'COMPRESSED:"legacy"';
    const encryptedRaw = CryptoJS.AES.encrypt(legacyPlaintext, key!).toString();
    const checksum = CryptoJS.SHA256(legacyPlaintext + key!).toString();

    const legacyEncrypted: {
      data: string;
      checksum: string;
      metadata: { algorithm: string; keyId: string; timestamp: Date; version: string };
    } = {
      data: encryptedRaw,
      checksum,
      metadata: {
        algorithm: 'AES-256',
        keyId: 'pain-tracker-master',
        timestamp: new Date(),
        version: '1.0.0',
      },
    };

    const result = await encryptionService.decrypt<string>(legacyEncrypted);
    expect(result).toBe('legacy');
  });
});
