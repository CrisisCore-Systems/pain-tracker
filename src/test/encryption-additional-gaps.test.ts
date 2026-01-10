import { describe, it, expect, vi, beforeEach } from 'vitest';
import { encryptionService, EndToEndEncryptionService } from '../services/EncryptionService';
import { securityService } from '../services/SecurityService';

// Helper to create large repetitive payload for compression + RLE (>1000 chars with long runs)
const largePayload = 'AAAAABBBBBCCCCCDDDDDEEEEE'.repeat(60); // produces long repeated segments

// Access private methods via cast for targeted coverage
const anyEnc = encryptionService as unknown as { decompressString: (c: string) => string };

describe('EncryptionService additional gaps', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('detects test environment (isTestEnv) without throwing', () => {
    const svc = new EndToEndEncryptionService();
    const isTestEnv = (svc as unknown as { isTestEnv: () => boolean }).isTestEnv();
    expect(typeof isTestEnv).toBe('boolean');
  });

  it('returns false for isTestEnv when process is unavailable (browser-like branch)', () => {
    const originalProcess = (globalThis as unknown as { process?: unknown }).process;
    try {
      (globalThis as unknown as { process?: unknown }).process = undefined;
      const svc = new EndToEndEncryptionService();
      const isTestEnv = (svc as unknown as { isTestEnv: () => boolean }).isTestEnv();
      expect(isTestEnv).toBe(false);
    } finally {
      (globalThis as unknown as { process?: unknown }).process = originalProcess;
    }
  });

  it('detects test env via NODE_ENV when VITEST flag is absent', () => {
    const env = process.env as Record<string, string | undefined>;
    const originalVitest = env.VITEST;
    const originalNodeEnv = env.NODE_ENV;
    try {
      delete env.VITEST;
      env.NODE_ENV = 'test';
      const svc = new EndToEndEncryptionService();
      const isTestEnv = (svc as unknown as { isTestEnv: () => boolean }).isTestEnv();
      expect(isTestEnv).toBe(true);
    } finally {
      if (originalVitest === undefined) delete env.VITEST;
      else env.VITEST = originalVitest;
      if (originalNodeEnv === undefined) delete env.NODE_ENV;
      else env.NODE_ENV = originalNodeEnv;
    }
  });

  it('swallows security logging failures (logSecurityEvent catch)', () => {
    const spy = vi.spyOn(securityService, 'logSecurityEvent').mockImplementation(() => {
      throw new Error('logger down');
    });

    expect(() => encryptionService.clearInMemoryKeyCache()).not.toThrow();
    expect(spy).toHaveBeenCalled();
  });

  it('logs initialize failure when key retrieval throws (initializeService catch)', async () => {
    const svc = new EndToEndEncryptionService();
    const logSpy = vi.spyOn(securityService, 'logSecurityEvent');
    (svc as unknown as { keyManager: { retrieveKey: (id: string) => Promise<string | null> } }).keyManager.retrieveKey =
      async () => {
        throw new Error('boom');
      };

    await (svc as unknown as { initializeService: () => Promise<void> }).initializeService();

    expect(logSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'encryption',
        level: 'error',
        message: 'Failed to initialize encryption service',
      })
    );
  });

  it('generates and stores wrapped key bundles when wrapping is available (generateKey try path)', async () => {
    const svc = new EndToEndEncryptionService();
    const keyId = `backup-wrap-${Date.now()}`;

    // Make the wrapped-path deterministic (and ensure we actually exercise the try branch).
    vi.spyOn(securityService, 'wrapKey').mockResolvedValue('wrapped');

    const payload = await (
      svc as unknown as { keyManager: { generateKey: (id: string) => Promise<string> } }
    ).keyManager.generateKey(keyId);

    const parsed = JSON.parse(payload) as { encWrapped?: string; hmacWrapped?: string; enc?: string; hmac?: string };
    expect(parsed.encWrapped ?? parsed.enc).toBeTruthy();
    expect(parsed.hmacWrapped ?? parsed.hmac).toBeTruthy();

    // Cleanup to reduce cross-test pollution
    await (svc as unknown as { keyManager: { deleteKey: (id: string) => Promise<void> } }).keyManager.deleteKey(keyId);
  });

  it('falls back to raw key export when wrapping fails in generateKey (generateKey catch path)', async () => {
    const svc = new EndToEndEncryptionService();
    const keyId = `backup-wrapfail-${Date.now()}`;

    let callCount = 0;
    vi.spyOn(securityService, 'wrapKey').mockImplementation(async () => {
      callCount += 1;
      // Fail the initial wrapping attempt to drive generateKey into its catch/fallback.
      if (callCount <= 2) throw new Error('wrap failed');
      return `wrapped:${callCount}`;
    });

    const payload = await (
      svc as unknown as { keyManager: { generateKey: (id: string) => Promise<string> } }
    ).keyManager.generateKey(keyId);

    const parsed = JSON.parse(payload) as { enc?: string; hmac?: string; encWrapped?: string; hmacWrapped?: string };
    // In the fallback path, generateKey returns a payload with raw enc/hmac (base64).
    expect(parsed.enc).toBeTruthy();
    expect(parsed.hmac).toBeTruthy();
    expect(parsed.encWrapped).toBeUndefined();
    expect(parsed.hmacWrapped).toBeUndefined();

    await (svc as unknown as { keyManager: { deleteKey: (id: string) => Promise<void> } }).keyManager.deleteKey(keyId);
  });

  it('imports raw key material and wraps it before storing (storeKey raw enc/hmac branch)', async () => {
    const svc = new EndToEndEncryptionService();
    const keyId = `backup-raw-${Date.now()}`;

    // Force the wrapping path to succeed deterministically so we can assert on stored encWrapped/hmacWrapped.
    let wrapCount = 0;
    vi.spyOn(securityService, 'wrapKey').mockImplementation(async () => {
      wrapCount += 1;
      return `wrapped:${wrapCount}`;
    });

    const encKey = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
      'encrypt',
      'decrypt',
    ]);
    const hmacKey = await crypto.subtle.generateKey({ name: 'HMAC', hash: 'SHA-256' }, true, [
      'sign',
      'verify',
    ]);
    const encRaw = await crypto.subtle.exportKey('raw', encKey);
    const hmacRaw = await crypto.subtle.exportKey('raw', hmacKey);
    const rawPayload = JSON.stringify({
      enc: Buffer.from(encRaw).toString('base64'),
      hmac: Buffer.from(hmacRaw).toString('base64'),
    });

    await (
      svc as unknown as { keyManager: { storeKey: (id: string, key: string) => Promise<void> } }
    ).keyManager.storeKey(keyId, rawPayload);

    const retrieved = await (
      svc as unknown as { keyManager: { retrieveKey: (id: string) => Promise<string | null> } }
    ).keyManager.retrieveKey(keyId);

    expect(retrieved).toBeTruthy();
    const stored = JSON.parse(retrieved!) as { encWrapped?: string; hmacWrapped?: string };
    expect(stored.encWrapped).toBeTruthy();
    expect(stored.hmacWrapped).toBeTruthy();

    await (svc as unknown as { keyManager: { deleteKey: (id: string) => Promise<void> } }).keyManager.deleteKey(keyId);
  });

  it('stores opaque key strings when JSON parsing fails (storeKey JSON.parse catch)', async () => {
    const svc = new EndToEndEncryptionService();
    const keyId = `backup-opaque-${Date.now()}`;

    await (
      svc as unknown as { keyManager: { storeKey: (id: string, key: string) => Promise<void> } }
    ).keyManager.storeKey(keyId, 'not-json');

    const retrieved = await (
      svc as unknown as { keyManager: { retrieveKey: (id: string) => Promise<string | null> } }
    ).keyManager.retrieveKey(keyId);

    expect(retrieved).toBe('not-json');

    await (svc as unknown as { keyManager: { deleteKey: (id: string) => Promise<void> } }).keyManager.deleteKey(keyId);
  });

  it('returns wrapped payload as JSON when only hmacWrapped is present (retrieveKey payload-falsy branch)', async () => {
    const svc = new EndToEndEncryptionService();
    const keyId = `backup-hmac-only-${Date.now()}`;
    const storage = securityService.createSecureStorage();
    const stored = { hmacWrapped: 'hmac-only', created: new Date().toISOString() };
    await storage.store(`key:${keyId}`, stored, true);

    const retrieved = await (
      svc as unknown as { keyManager: { retrieveKey: (id: string) => Promise<string | null> } }
    ).keyManager.retrieveKey(keyId);

    expect(retrieved).toBeTruthy();
    expect(JSON.parse(retrieved!)).toMatchObject({ hmacWrapped: 'hmac-only' });

    await (svc as unknown as { keyManager: { deleteKey: (id: string) => Promise<void> } }).keyManager.deleteKey(keyId);
  });

  it('stores non-whitelisted keys in-memory only (SENSITIVITY_WHITELIST branch)', async () => {
    const svc = new EndToEndEncryptionService();
    const keyId = `session-only-${Date.now()}`;
    const key = JSON.stringify({ ephemeral: true, created: new Date().toISOString() });

    await (
      svc as unknown as { keyManager: { storeKey: (id: string, key: string) => Promise<void> } }
    ).keyManager.storeKey(keyId, key);

    const retrieved = await (
      svc as unknown as { keyManager: { retrieveKey: (id: string) => Promise<string | null> } }
    ).keyManager.retrieveKey(keyId);

    expect(retrieved).toBe(key);
  });

  it('logs and rethrows when encryption key material cannot be resolved (encrypt catch path)', async () => {
    const svc = new EndToEndEncryptionService();
    const logSpy = vi.spyOn(securityService, 'logSecurityEvent');

    // Force retrieveKey to return a string that is neither valid JSON nor valid base64.
    (svc as unknown as { keyManager: { retrieveKey: (id: string) => Promise<string | null> } }).keyManager.retrieveKey =
      async () => '!!!not-json-or-base64!!!';

    await expect(svc.encrypt({ a: 1 }, { addIntegrityCheck: false, useCompression: false })).rejects.toThrow(
      /Encryption key material not available/i
    );

    expect(logSpy).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Data encryption failed', level: 'error' })
    );
  });

  it('logs Unknown error when encrypt throws a non-Error value (encrypt catch metadata ternary)', async () => {
    vi.restoreAllMocks();

    const svc = new EndToEndEncryptionService();
    const logSpy = vi.spyOn(securityService, 'logSecurityEvent');

    const originalGetRandomValues = crypto.getRandomValues.bind(crypto);
    const grvSpy = vi.spyOn(crypto, 'getRandomValues').mockImplementation((arr: any) => {
      // Trigger a non-Error throw after key material is resolved.
      throw 'boom';
    });

    try {
      await expect(
        svc.encrypt({ a: 1 }, { keyId: `non-error-encrypt-${Date.now()}`, addIntegrityCheck: false, useCompression: false })
      ).rejects.toBe('boom');

      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Data encryption failed',
          metadata: expect.objectContaining({ error: 'Unknown error' }),
        })
      );
    } finally {
      grvSpy.mockRestore();
      // Ensure crypto.getRandomValues is restored even if spy restore fails
      (crypto as unknown as { getRandomValues: typeof originalGetRandomValues }).getRandomValues = originalGetRandomValues;
    }
  });

  it('uses digest fallback when HMAC key import fails (encrypt SHA-256 checksum branch)', async () => {
    const svc = new EndToEndEncryptionService();

    // Provide a valid AES raw key, but an invalid HMAC base64 to force the HMAC import catch.
    const encKey = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
      'encrypt',
      'decrypt',
    ]);
    const encRaw = await crypto.subtle.exportKey('raw', encKey);

    const keyPayload = JSON.stringify({
      enc: Buffer.from(encRaw).toString('base64'),
      hmac: 'not-base64',
    });

    (svc as unknown as { keyManager: { retrieveKey: (id: string) => Promise<string | null> } }).keyManager.retrieveKey =
      async () => keyPayload;

    const encrypted = await svc.encrypt({ hello: 'digest' }, { addIntegrityCheck: true, useCompression: false });
    expect(encrypted.checksum).toBeTruthy();
  });

  it('throws when decryption key does not exist (decrypt missing-key branch)', async () => {
    const logSpy = vi.spyOn(securityService, 'logSecurityEvent');

    await expect(
      encryptionService.decrypt({
        data: 'AA==',
        checksum: '',
        metadata: {
          algorithm: 'AES-256',
          keyId: `missing-${Date.now()}`,
          timestamp: new Date(),
          version: '2.0.0',
        } as unknown as any,
      } as unknown as any)
    ).rejects.toThrow(/Decryption key not found/i);

    expect(logSpy).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Data decryption failed', level: 'error' })
    );
  });

  it('logs Unknown error when decrypt throws a non-Error value (decrypt catch metadata ternary)', async () => {
    vi.restoreAllMocks();

    const svc = new EndToEndEncryptionService();
    const logSpy = vi.spyOn(securityService, 'logSecurityEvent');

    (svc as unknown as { keyManager: { retrieveKey: (id: string) => Promise<string | null> } }).keyManager.retrieveKey =
      async () => {
        throw 'boom';
      };

    await expect(
      svc.decrypt({
        data: 'AA==',
        checksum: '',
        metadata: { algorithm: 'AES-256', keyId: 'any', timestamp: new Date(), version: '2.0.0', iv: 'AA==' } as any,
      } as any)
    ).rejects.toBe('boom');

    expect(logSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Data decryption failed',
        metadata: expect.objectContaining({ error: 'Unknown error' }),
      })
    );
  });

  it('parses wrapped key payloads in decrypt and fails fast when IV is missing (unwrapKey branches)', async () => {
    const svc = new EndToEndEncryptionService();

    (svc as unknown as { keyManager: { retrieveKey: (id: string) => Promise<string | null> } }).keyManager.retrieveKey =
      async () => JSON.stringify({ wrapped: 'wrapped-aes', hmacWrapped: 'wrapped-hmac' });

    const encKey = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
      'encrypt',
      'decrypt',
    ]);
    const hmacKey = await crypto.subtle.generateKey({ name: 'HMAC', hash: 'SHA-256' }, true, [
      'sign',
      'verify',
    ]);

    const unwrapSpy = vi.spyOn(securityService, 'unwrapKey').mockImplementation(async (_wrapped, algo) => {
      // Return deterministic keys so we can reach the IV validation branch.
      return (algo as { name?: string }).name === 'HMAC' ? hmacKey : encKey;
    });

    await expect(
      (svc as unknown as EndToEndEncryptionService).decrypt({
        data: 'AA==',
        checksum: '',
        metadata: {
          algorithm: 'AES-256',
          keyId: 'any',
          timestamp: new Date(),
          version: '2.0.0',
          // iv intentionally missing
        } as unknown as any,
      } as unknown as any)
    ).rejects.toThrow(/Missing IV/i);

    expect(unwrapSpy).toHaveBeenCalled();
  });

  it('encrypts using wrapped key payloads by unwrapping AES+HMAC keys (encrypt unwrapKey branches)', async () => {
    const svc = new EndToEndEncryptionService();

    (svc as unknown as { keyManager: { retrieveKey: (id: string) => Promise<string | null> } }).keyManager.retrieveKey =
      async () => JSON.stringify({ wrapped: 'wrapped-aes', hmacWrapped: 'wrapped-hmac' });

    const encKey = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
      'encrypt',
      'decrypt',
    ]);
    const hmacKey = await crypto.subtle.generateKey({ name: 'HMAC', hash: 'SHA-256' }, true, [
      'sign',
      'verify',
    ]);

    const unwrapSpy = vi.spyOn(securityService, 'unwrapKey').mockImplementation(async (_wrapped, algo) => {
      return (algo as { name?: string }).name === 'HMAC' ? hmacKey : encKey;
    });

    const encrypted = await svc.encrypt({ wrapped: true }, { addIntegrityCheck: true, useCompression: false });
    expect(encrypted.checksum).toBeTruthy();
    expect(unwrapSpy).toHaveBeenCalled();
  });

  it('hits the raw AES import failure catch when AES key length is invalid (encrypt inner catch)', async () => {
    const svc = new EndToEndEncryptionService();

    // base64("\x00") => 1 byte; AES-GCM importKey should reject invalid key lengths.
    (svc as unknown as { keyManager: { retrieveKey: (id: string) => Promise<string | null> } }).keyManager.retrieveKey =
      async () => JSON.stringify({ enc: 'AA==' });

    await expect(svc.encrypt({ a: 1 }, { addIntegrityCheck: false, useCompression: false })).rejects.toThrow(
      /Encryption key material not available/i
    );
  });

  it('archives old keys during rotation when an old key exists (rotateKey archive success)', async () => {
    const svc = new EndToEndEncryptionService();
    const keyId = 'pain-tracker-master';

    // Ensure rotateKey sees an existing key so it attempts to archive it.
    (svc as unknown as { keyManager: { retrieveKey: (id: string) => Promise<string | null> } }).keyManager.retrieveKey =
      async (id: string) => (id === keyId ? 'old-key-material' : null);

    const storeCalls: string[] = [];
    vi.spyOn(securityService, 'createSecureStorage').mockImplementation(
      () =>
        ({
          store: async (k: string) => {
            storeCalls.push(k);
          },
          retrieve: async () => null,
          delete: async () => {},
        }) as unknown as ReturnType<typeof securityService.createSecureStorage>
    );

    vi.spyOn(securityService, 'wrapKey').mockResolvedValue('wrapped');

    await (
      svc as unknown as { keyManager: { rotateKey: (id: string) => Promise<string> } }
    ).keyManager.rotateKey(keyId);

    expect(storeCalls.some(k => k.startsWith(`archived-key:${keyId}:`))).toBe(true);
  });

  it('falls back to in-memory key cache when secure storage fails (storeKey path)', async () => {
    const secureStorage = securityService.createSecureStorage();
    vi.spyOn(securityService, 'createSecureStorage').mockImplementation(
      () =>
        ({
          ...secureStorage,
          store: async () => {
            throw new Error('secure storage unavailable');
          },
          retrieve: async () => null,
          delete: async () => {},
        }) as unknown as ReturnType<typeof securityService.createSecureStorage>
    );
    const svc = new EndToEndEncryptionService();
    // Force generateKey -> storeKey fallback
    const data = await svc.encrypt({ hello: 'world' });
    expect(data.metadata.keyId).toBeDefined();
  });

  it('compresses large data and successfully decrypts (compression + decompress branches)', async () => {
    const encrypted = await encryptionService.encrypt(
      { blob: largePayload },
      { addIntegrityCheck: true }
    );
    expect(encrypted.data.length).toBeGreaterThan(0);
    const decrypted = await encryptionService.decrypt<{ blob: string }>(encrypted);
    expect(decrypted.blob).toBe(largePayload);
  });

  it('decompressString expands RLE encoded sequences', () => {
    // Directly invoke private decompressString via any cast with crafted compressed string containing RLE ~ markers
    const compressed = 'COMPRESSED:v1:' + btoa('~A' + String.fromCharCode(10));
    const out = anyEnc.decompressString(compressed);
    expect(out).toBe('A'.repeat(10));
  });
});

  it('returns false for isTestEnv when neither VITEST nor NODE_ENV=test is set', () => {
    const env = process.env as Record<string, string | undefined>;
    const originalVitest = env.VITEST;
    const originalNodeEnv = env.NODE_ENV;
    try {
      delete env.VITEST;
      env.NODE_ENV = 'production';
      const svc = new EndToEndEncryptionService();
      const isTestEnv = (svc as unknown as { isTestEnv: () => boolean }).isTestEnv();
      expect(isTestEnv).toBe(false);
    } finally {
      if (originalVitest === undefined) delete env.VITEST;
      else env.VITEST = originalVitest;
      if (originalNodeEnv === undefined) delete env.NODE_ENV;
      else env.NODE_ENV = originalNodeEnv;
    }
  });

  it('logs a warning if archiving the old key fails during rotation (rotateKey archive catch)', async () => {
    const svc = new EndToEndEncryptionService();
    const keyId = 'pain-tracker-master';

    (svc as unknown as { keyManager: { retrieveKey: (id: string) => Promise<string | null> } }).keyManager.retrieveKey =
      async (id: string) => (id === keyId ? 'old-key-material' : null);

    // Fail only the archive store call.
    vi.spyOn(securityService, 'createSecureStorage').mockImplementation(
      () =>
        ({
          store: async (k: string) => {
            if (k.startsWith(`archived-key:${keyId}:`)) {
              throw new Error('archive store failed');
            }
          },
          retrieve: async () => null,
          delete: async () => {},
        }) as unknown as ReturnType<typeof securityService.createSecureStorage>
    );

    const logSpy = vi.spyOn(securityService, 'logSecurityEvent');
    vi.spyOn(securityService, 'wrapKey').mockResolvedValue('wrapped');

    await (
      svc as unknown as { keyManager: { rotateKey: (id: string) => Promise<string> } }
    ).keyManager.rotateKey(keyId);

    expect(logSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'warning',
        message: expect.stringContaining('Failed to archive old key during rotation'),
      })
    );
  });

  it('logs Unknown error if archiving throws a non-Error value (rotateKey archive catch metadata ternary)', async () => {
    vi.restoreAllMocks();

    const svc = new EndToEndEncryptionService();
    const keyId = 'pain-tracker-master';

    (svc as unknown as { keyManager: { retrieveKey: (id: string) => Promise<string | null> } }).keyManager.retrieveKey =
      async (id: string) => (id === keyId ? 'old-key-material' : null);

    vi.spyOn(securityService, 'createSecureStorage').mockImplementation(
      () =>
        ({
          store: async (k: string) => {
            if (k.startsWith(`archived-key:${keyId}:`)) {
              throw 'boom';
            }
          },
          retrieve: async () => null,
          delete: async () => {},
        }) as unknown as ReturnType<typeof securityService.createSecureStorage>
    );

    const logSpy = vi.spyOn(securityService, 'logSecurityEvent');
    vi.spyOn(securityService, 'wrapKey').mockResolvedValue('wrapped');

    await (
      svc as unknown as { keyManager: { rotateKey: (id: string) => Promise<string> } }
    ).keyManager.rotateKey(keyId);

    expect(logSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'warning',
        message: expect.stringContaining('Failed to archive old key during rotation'),
        metadata: expect.objectContaining({ error: 'Unknown error' }),
      })
    );
  });

  it('removes in-memory keys when secure delete fails (deleteKey catch branch)', async () => {
    const svc = new EndToEndEncryptionService();
    const keyId = `session-delete-${Date.now()}`;
    const key = 'ephemeral';

    await (
      svc as unknown as { keyManager: { storeKey: (id: string, key: string) => Promise<void> } }
    ).keyManager.storeKey(keyId, key);

    vi.spyOn(securityService, 'createSecureStorage').mockImplementation(
      () =>
        ({
          delete: async () => {
            throw new Error('delete failed');
          },
          retrieve: async () => null,
          store: async () => {},
        }) as unknown as ReturnType<typeof securityService.createSecureStorage>
    );

    await (
      svc as unknown as { keyManager: { deleteKey: (id: string) => Promise<void> } }
    ).keyManager.deleteKey(keyId);

    const retrieved = await (
      svc as unknown as { keyManager: { retrieveKey: (id: string) => Promise<string | null> } }
    ).keyManager.retrieveKey(keyId);

    expect(retrieved).toBeNull();
  });

  it('still lists in-memory keys when localStorage access throws (listKeys catch)', async () => {
    const svc = new EndToEndEncryptionService();
    const keyId = `session-list-${Date.now()}`;

    await (
      svc as unknown as { keyManager: { storeKey: (id: string, key: string) => Promise<void> } }
    ).keyManager.storeKey(keyId, 'k');

    const originalLocalStorage = window.localStorage;
    Object.defineProperty(window, 'localStorage', {
      value: {
        get length() {
          throw new Error('blocked');
        },
        key: () => null,
      },
      configurable: true,
    });

    try {
      const keys = await (
        svc as unknown as { keyManager: { listKeys: () => Promise<string[]> } }
      ).keyManager.listKeys();
      expect(keys).toContain(keyId);
    } finally {
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        configurable: true,
      });
    }
  });

  it('uses digest fallback in decrypt when HMAC import throws (decrypt HMAC import catch)', async () => {
    const svc = new EndToEndEncryptionService();

    // Encrypt with wrapped keys but with integrity check on (so checksum exists).
    const encKey = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
      'encrypt',
      'decrypt',
    ]);
    const unwrapSpy = vi.spyOn(securityService, 'unwrapKey').mockImplementation(async (_wrapped, algo) => {
      return (algo as { name?: string }).name === 'HMAC'
        ? (await crypto.subtle.generateKey({ name: 'HMAC', hash: 'SHA-256' }, true, ['sign', 'verify']))
        : encKey;
    });

    // Force decrypt's HMAC importKey to throw so it uses digest fallback.
    const originalImportKey = crypto.subtle.importKey.bind(crypto.subtle);
    const importSpy = vi.spyOn(crypto.subtle, 'importKey').mockImplementation(async (format, keyData, algorithm, extractable, usages) => {
      const name = (algorithm as { name?: string }).name;
      if (name === 'HMAC') throw new Error('hmac import fail');
      return originalImportKey(format, keyData, algorithm, extractable, usages);
    });

    // Use a key payload that triggers wrapped AES, but also includes a raw hmac field so decrypt attempts the HMAC import branch.
    (svc as unknown as { keyManager: { retrieveKey: (id: string) => Promise<string | null> } }).keyManager.retrieveKey =
      async () => JSON.stringify({ wrapped: 'wrapped-aes', hmac: 'AA==' });

    const encrypted = await svc.encrypt({ msg: 'digest-fallback' }, { addIntegrityCheck: true, useCompression: false });
    const decrypted = await svc.decrypt<typeof encrypted extends { data: any } ? any : any>(encrypted as any);
    expect(decrypted).toEqual({ msg: 'digest-fallback' });
    expect(importSpy).toHaveBeenCalled();
    expect(unwrapSpy).toHaveBeenCalled();
  });

  it('logs and rethrows when rotateEncryptionKeys cannot list keys (outer catch)', async () => {
    const svc = new EndToEndEncryptionService();
    const logSpy = vi.spyOn(securityService, 'logSecurityEvent');

    (svc as unknown as { keyManager: { listKeys: () => Promise<string[]> } }).keyManager.listKeys = async () => {
      throw new Error('list failed');
    };

    await expect(svc.rotateEncryptionKeys()).rejects.toThrow(/list failed/i);

    expect(logSpy).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Key rotation failed', level: 'error' })
    );
  });

  it('logs Unknown error when rotateEncryptionKeys throws a non-Error value (rotateEncryptionKeys catch metadata ternary)', async () => {
    vi.restoreAllMocks();

    const svc = new EndToEndEncryptionService();
    const logSpy = vi.spyOn(securityService, 'logSecurityEvent');

    (svc as unknown as { keyManager: { listKeys: () => Promise<string[]> } }).keyManager.listKeys = async () => {
      throw 'boom';
    };

    await expect(svc.rotateEncryptionKeys()).rejects.toBe('boom');

    expect(logSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Key rotation failed',
        metadata: expect.objectContaining({ error: 'Unknown error' }),
      })
    );
  });

  it('returns false for isTestEnv when reading process.env throws (isTestEnv catch)', () => {
    vi.restoreAllMocks();

    const originalProcess = (globalThis as unknown as { process?: unknown }).process;
    try {
      (globalThis as unknown as { process?: unknown }).process = {
        get env() {
          throw new Error('env blocked');
        },
      };
      const svc = new EndToEndEncryptionService();
      const isTestEnv = (svc as unknown as { isTestEnv: () => boolean }).isTestEnv();
      expect(isTestEnv).toBe(false);
    } finally {
      (globalThis as unknown as { process?: unknown }).process = originalProcess;
    }
  });

  it('falls back to in-memory cache when stored key payload access throws (retrieveKey inner catch)', async () => {
    vi.restoreAllMocks();

    const svc = new EndToEndEncryptionService();
    const keyId = `retrieve-inner-catch-${Date.now()}`;

    // Seed in-memory cache so retrieveKey has a safe fallback.
    (svc as unknown as { inMemoryKeyCache: Map<string, { key: string; created: string }> }).inMemoryKeyCache.set(
      keyId,
      { key: 'mem-value', created: new Date().toISOString() }
    );

    // Return a stored object that throws when properties are read.
    vi.spyOn(securityService, 'createSecureStorage').mockImplementation(
      () =>
        ({
          retrieve: async () =>
            ({
              get encWrapped() {
                throw new Error('getter boom');
              },
            }) as unknown,
          store: async () => {},
          delete: async () => {},
        }) as unknown as ReturnType<typeof securityService.createSecureStorage>
    );

    const retrieved = await (
      svc as unknown as { keyManager: { retrieveKey: (id: string) => Promise<string | null> } }
    ).keyManager.retrieveKey(keyId);

    expect(retrieved).toBe('mem-value');
  });

  it('logs and falls back to in-memory cache when secure storage retrieval throws (retrieveKey outer catch)', async () => {
    vi.restoreAllMocks();

    const svc = new EndToEndEncryptionService();
    const keyId = `retrieve-outer-catch-${Date.now()}`;

    (svc as unknown as { inMemoryKeyCache: Map<string, { key: string; created: string }> }).inMemoryKeyCache.set(
      keyId,
      { key: 'mem-value', created: new Date().toISOString() }
    );

    vi.spyOn(securityService, 'createSecureStorage').mockImplementation(
      () =>
        ({
          retrieve: async () => {
            throw new Error('retrieve failed');
          },
          store: async () => {},
          delete: async () => {},
        }) as unknown as ReturnType<typeof securityService.createSecureStorage>
    );

    const logSpy = vi.spyOn(securityService, 'logSecurityEvent');
    const retrieved = await (
      svc as unknown as { keyManager: { retrieveKey: (id: string) => Promise<string | null> } }
    ).keyManager.retrieveKey(keyId);

    expect(retrieved).toBe('mem-value');
    expect(logSpy).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining(`Failed to retrieve key: ${keyId}`) })
    );
  });

  it('returns null in retrieveKey outer catch when no in-memory cache entry exists (mem undefined branch)', async () => {
    vi.restoreAllMocks();

    const svc = new EndToEndEncryptionService();
    const keyId = `retrieve-outer-catch-miss-${Date.now()}`;

    vi.spyOn(securityService, 'createSecureStorage').mockImplementation(
      () =>
        ({
          retrieve: async () => {
            throw 'boom';
          },
          store: async () => {},
          delete: async () => {},
        }) as unknown as ReturnType<typeof securityService.createSecureStorage>
    );

    const logSpy = vi.spyOn(securityService, 'logSecurityEvent');

    const retrieved = await (
      svc as unknown as { keyManager: { retrieveKey: (id: string) => Promise<string | null> } }
    ).keyManager.retrieveKey(keyId);

    expect(retrieved).toBeNull();
    expect(logSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining(`Failed to retrieve key: ${keyId}`),
        metadata: expect.objectContaining({ error: 'Unknown error' }),
      })
    );
  });

  it('returns null in retrieveKey outer catch when cache entry exists but key is empty (mem.key falsy branch)', async () => {
    vi.restoreAllMocks();

    const svc = new EndToEndEncryptionService();
    const keyId = `retrieve-outer-catch-empty-${Date.now()}`;

    (svc as unknown as { inMemoryKeyCache: Map<string, { key: string; created: string }> }).inMemoryKeyCache.set(
      keyId,
      { key: '', created: new Date().toISOString() }
    );

    vi.spyOn(securityService, 'createSecureStorage').mockImplementation(
      () =>
        ({
          retrieve: async () => {
            throw new Error('retrieve failed');
          },
          store: async () => {},
          delete: async () => {},
        }) as unknown as ReturnType<typeof securityService.createSecureStorage>
    );

    const retrieved = await (
      svc as unknown as { keyManager: { retrieveKey: (id: string) => Promise<string | null> } }
    ).keyManager.retrieveKey(keyId);

    expect(retrieved).toBeNull();
  });

  it('hits the raw AES import failure catch in decrypt when AES key length is invalid (decrypt inner catch)', async () => {
    vi.restoreAllMocks();

    const svc = new EndToEndEncryptionService();
    const logSpy = vi.spyOn(securityService, 'logSecurityEvent');

    // AES-GCM raw key invalid length (1 byte) => importKey rejects; decrypt should catch and continue.
    (svc as unknown as { keyManager: { retrieveKey: (id: string) => Promise<string | null> } }).keyManager.retrieveKey =
      async () => JSON.stringify({ enc: 'AA==' });

    await expect(
      svc.decrypt({
        data: 'AA==',
        checksum: '',
        metadata: {
          algorithm: 'AES-256',
          keyId: 'any',
          timestamp: new Date(),
          version: '2.0.0',
          iv: 'AA==',
        } as unknown as any,
      } as unknown as any)
    ).rejects.toThrow(/Decryption key material not available/i);

    expect(logSpy).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Data decryption failed', level: 'error' })
    );
  });

  it('throws when HMAC verification fails (HMAC mismatch branch)', async () => {
    vi.restoreAllMocks();

    const svc = new EndToEndEncryptionService();

    // Use a deterministic key bundle so decrypt has an HMAC key and attempts verify().
    const encKey = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
      'encrypt',
      'decrypt',
    ]);
    const hmacKey = await crypto.subtle.generateKey({ name: 'HMAC', hash: 'SHA-256' }, true, [
      'sign',
      'verify',
    ]);
    const encRaw = await crypto.subtle.exportKey('raw', encKey);
    const hmacRaw = await crypto.subtle.exportKey('raw', hmacKey);
    const keyPayload = JSON.stringify({
      enc: Buffer.from(encRaw).toString('base64'),
      hmac: Buffer.from(hmacRaw).toString('base64'),
    });

    (svc as unknown as { keyManager: { retrieveKey: (id: string) => Promise<string | null> } }).keyManager.retrieveKey =
      async () => keyPayload;

    const encrypted = await svc.encrypt({ hello: 'hmac-mismatch' }, { addIntegrityCheck: true, useCompression: false });

    vi.spyOn(crypto.subtle, 'verify').mockResolvedValue(false);

    await expect(svc.decrypt(encrypted as any)).rejects.toThrow(/HMAC mismatch/i);
  });

  it('throws when digest verification fails (digest mismatch branch)', async () => {
    vi.restoreAllMocks();

    const svc = new EndToEndEncryptionService();

    // Ensure decrypt cannot obtain an HMAC key (base64 parsing won't throw in Node,
    // so we explicitly fail the HMAC importKey call to force digest fallback).
    const originalImportKey = crypto.subtle.importKey.bind(crypto.subtle);
    vi.spyOn(crypto.subtle, 'importKey').mockImplementation(async (format, keyData, algorithm, extractable, usages) => {
      const name = (algorithm as { name?: string }).name;
      if (name === 'HMAC') throw new Error('force digest fallback');
      return originalImportKey(format, keyData, algorithm, extractable, usages);
    });

    // Force digest fallback by making HMAC import fail during encrypt/decrypt.
    const encKey = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
      'encrypt',
      'decrypt',
    ]);
    const encRaw = await crypto.subtle.exportKey('raw', encKey);
    const keyPayload = JSON.stringify({
      enc: Buffer.from(encRaw).toString('base64'),
      hmac: 'not-base64',
    });

    (svc as unknown as { keyManager: { retrieveKey: (id: string) => Promise<string | null> } }).keyManager.retrieveKey =
      async () => keyPayload;

    const encrypted = await svc.encrypt({ hello: 'digest-mismatch' }, { addIntegrityCheck: true, useCompression: false });

    // Tamper checksum so digest comparison fails.
    const tampered = { ...encrypted, checksum: 'bogus' };

    await expect(svc.decrypt(tampered as any)).rejects.toThrow(/digest mismatch/i);
  });

  it('encrypts and decrypts via the PainEntry helper methods (encryptPainEntry/decryptPainEntry wrappers)', async () => {
    vi.restoreAllMocks();

    const svc = new EndToEndEncryptionService();
    const entry = {
      id: `p-${Date.now()}`,
      timestamp: new Date().toISOString(),
      painLevel: 5,
    } as unknown as any;

    const encrypted = await svc.encryptPainEntry(entry);
    const decrypted = await svc.decryptPainEntry(encrypted as any);
    expect(decrypted).toEqual(entry);
  });

  it('continues decrypt when raw HMAC key import fails (decrypt HMAC import catch)', async () => {
    vi.restoreAllMocks();

    const svc = new EndToEndEncryptionService();

    // Provide a valid AES key and any HMAC key bytes; we will force HMAC importKey to throw.
    const encKey = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
      'encrypt',
      'decrypt',
    ]);
    const hmacKey = await crypto.subtle.generateKey({ name: 'HMAC', hash: 'SHA-256' }, true, [
      'sign',
      'verify',
    ]);
    const encRaw = await crypto.subtle.exportKey('raw', encKey);
    const hmacRaw = await crypto.subtle.exportKey('raw', hmacKey);

    const keyPayload = JSON.stringify({
      enc: Buffer.from(encRaw).toString('base64'),
      hmac: Buffer.from(hmacRaw).toString('base64'),
    });

    (svc as unknown as { keyManager: { retrieveKey: (id: string) => Promise<string | null> } }).keyManager.retrieveKey =
      async () => keyPayload;

    const originalImportKey = crypto.subtle.importKey.bind(crypto.subtle);
    vi.spyOn(crypto.subtle, 'importKey').mockImplementation(async (format, keyData, algorithm, extractable, usages) => {
      const name = (algorithm as { name?: string }).name;
      if (name === 'HMAC') throw new Error('force hmac import fail');
      return originalImportKey(format, keyData, algorithm, extractable, usages);
    });

    const encrypted = await svc.encrypt(
      { hello: 'no-integrity' },
      { addIntegrityCheck: false, useCompression: false }
    );

    // If we reach the plaintext, the HMAC import failure catch executed without breaking decrypt.
    const decrypted = await svc.decrypt(encrypted as any);
    expect(decrypted).toEqual({ hello: 'no-integrity' });
  });

  it('ignores failures when populating the in-memory cache during storeKey (cache set catch)', async () => {
    vi.restoreAllMocks();

    const svc = new EndToEndEncryptionService();

    // Override the cache with a minimal object whose set() throws, to hit the catch.
    (svc as unknown as { inMemoryKeyCache: { set: () => void; get: () => unknown } }).inMemoryKeyCache = {
      set: () => {
        throw new Error('cache set failed');
      },
      get: () => undefined,
    };

    // Ensure secure storage succeeds so we reach the cache population block.
    vi.spyOn(securityService, 'createSecureStorage').mockImplementation(
      () =>
        ({
          store: async () => {},
          retrieve: async () => null,
          delete: async () => {},
        }) as unknown as ReturnType<typeof securityService.createSecureStorage>
    );

    await (
      svc as unknown as { keyManager: { storeKey: (id: string, key: string) => Promise<void> } }
    ).keyManager.storeKey('pain-tracker-master', 'not-json');
  });

  it('hits the non-JSON base64 AES import failure catch in decrypt (Not JSON -> bare base64 import catch)', async () => {
    vi.restoreAllMocks();

    const svc = new EndToEndEncryptionService();

    // Non-JSON key string; base64ToBytes works but AES-GCM importKey rejects invalid key lengths.
    (svc as unknown as { keyManager: { retrieveKey: (id: string) => Promise<string | null> } }).keyManager.retrieveKey =
      async () => 'AA==';

    await expect(
      svc.decrypt({
        data: 'AA==',
        checksum: '',
        metadata: {
          algorithm: 'AES-256',
          keyId: 'any',
          timestamp: new Date(),
          version: '2.0.0',
          iv: 'AA==',
        } as unknown as any,
      } as unknown as any)
    ).rejects.toThrow(/Decryption key material not available/i);
  });

  it('records initialize failure with Unknown error when a non-Error is thrown (initializeService metadata branch)', async () => {
    vi.restoreAllMocks();

    const svc = new EndToEndEncryptionService();
    const logSpy = vi.spyOn(securityService, 'logSecurityEvent');

    (svc as unknown as { keyManager: { retrieveKey: (id: string) => Promise<string | null> } }).keyManager.retrieveKey =
      async () => {
        throw 'boom';
      };

    await (svc as unknown as { initializeService: () => Promise<void> }).initializeService();

    expect(logSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Failed to initialize encryption service',
        metadata: expect.objectContaining({ error: 'Unknown error' }),
      })
    );
  });

  it('wraps and stores a raw AES key when only enc is provided (storeKey enc-only branch)', async () => {
    vi.restoreAllMocks();

    const svc = new EndToEndEncryptionService();
    const keyId = `backup-enc-only-${Date.now()}`;

    vi.spyOn(securityService, 'wrapKey').mockResolvedValue('wrapped-enc');

    const encKey = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
      'encrypt',
      'decrypt',
    ]);
    const encRaw = await crypto.subtle.exportKey('raw', encKey);
    const rawPayload = JSON.stringify({ enc: Buffer.from(encRaw).toString('base64') });

    await (
      svc as unknown as { keyManager: { storeKey: (id: string, key: string) => Promise<void> } }
    ).keyManager.storeKey(keyId, rawPayload);

    const retrieved = await (
      svc as unknown as { keyManager: { retrieveKey: (id: string) => Promise<string | null> } }
    ).keyManager.retrieveKey(keyId);

    const parsed = JSON.parse(retrieved!) as { encWrapped?: string; hmacWrapped?: string };
    expect(parsed.encWrapped).toBeTruthy();
    expect(parsed.hmacWrapped).toBeUndefined();
  });

  it('returns a normalized wrapped JSON payload when storage returns `wrapped` (retrieveKey payload-truthy branch)', async () => {
    vi.restoreAllMocks();

    const svc = new EndToEndEncryptionService();
    const keyId = `retrieve-wrapped-${Date.now()}`;

    vi.spyOn(securityService, 'createSecureStorage').mockImplementation(
      () =>
        ({
          retrieve: async () => ({ wrapped: 'wrapped-aes', hmacWrapped: 'wrapped-hmac', created: 't' }),
          store: async () => {},
          delete: async () => {},
        }) as unknown as ReturnType<typeof securityService.createSecureStorage>
    );

    const retrieved = await (
      svc as unknown as { keyManager: { retrieveKey: (id: string) => Promise<string | null> } }
    ).keyManager.retrieveKey(keyId);

    const parsed = JSON.parse(retrieved!) as { hmacWrapped?: string; created?: string };
    expect(parsed.hmacWrapped).toBe('wrapped-hmac');
    expect(parsed.created).toBe('t');
  });

  it('returns JSON.stringify(stored) when wrapped material exists but payload is falsy (retrieveKey payload-falsy branch)', async () => {
    vi.restoreAllMocks();

    const svc = new EndToEndEncryptionService();
    const keyId = `retrieve-wrapped-payload-falsy-${Date.now()}`;

    vi.spyOn(securityService, 'createSecureStorage').mockImplementation(
      () =>
        ({
          retrieve: async () => ({ hmacWrapped: 'wrapped-hmac-only', created: 't' }),
          store: async () => {},
          delete: async () => {},
        }) as unknown as ReturnType<typeof securityService.createSecureStorage>
    );

    const retrieved = await (
      svc as unknown as { keyManager: { retrieveKey: (id: string) => Promise<string | null> } }
    ).keyManager.retrieveKey(keyId);

    const parsed = JSON.parse(retrieved!) as { hmacWrapped?: string; encWrapped?: string; wrapped?: string };
    expect(parsed.hmacWrapped).toBe('wrapped-hmac-only');
    expect(parsed.encWrapped).toBeUndefined();
    expect(parsed.wrapped).toBeUndefined();
  });

  it('treats `encWrapped` as the wrapped payload source (retrieveKey encWrapped operand branch)', async () => {
    vi.restoreAllMocks();

    const svc = new EndToEndEncryptionService();
    const keyId = `retrieve-encWrapped-${Date.now()}`;

    vi.spyOn(securityService, 'createSecureStorage').mockImplementation(
      () =>
        ({
          retrieve: async () => ({ encWrapped: 'wrapped-aes-only', created: 't' }),
          store: async () => {},
          delete: async () => {},
        }) as unknown as ReturnType<typeof securityService.createSecureStorage>
    );

    const retrieved = await (
      svc as unknown as { keyManager: { retrieveKey: (id: string) => Promise<string | null> } }
    ).keyManager.retrieveKey(keyId);

    const parsed = JSON.parse(retrieved!) as { encWrapped?: string; hmacWrapped?: string; created?: string };
    expect(parsed.encWrapped).toBe('wrapped-aes-only');
    expect(parsed.hmacWrapped).toBeUndefined();
    expect(parsed.created).toBe('t');
  });

  it('uses a generated created timestamp when an opaque stored key has no created field (retrieveKey OpaqueKeyPayload created fallback)', async () => {
    vi.restoreAllMocks();

    const svc = new EndToEndEncryptionService();
    const keyId = `retrieve-opaque-no-created-${Date.now()}`;

    vi.spyOn(securityService, 'createSecureStorage').mockImplementation(
      () =>
        ({
          retrieve: async () => ({ key: 'opaque-key-without-created' }),
          store: async () => {},
          delete: async () => {},
        }) as unknown as ReturnType<typeof securityService.createSecureStorage>
    );

    const retrieved = await (
      svc as unknown as { keyManager: { retrieveKey: (id: string) => Promise<string | null> } }
    ).keyManager.retrieveKey(keyId);

    expect(retrieved).toBe('opaque-key-without-created');
    const mem = (
      svc as unknown as { inMemoryKeyCache: Map<string, { created: string }> }
    ).inMemoryKeyCache.get(keyId);
    expect(typeof mem?.created).toBe('string');
  });

  it('returns cached key when secure storage returns null (retrieveKey mem?.key truthy branch)', async () => {
    vi.restoreAllMocks();

    const svc = new EndToEndEncryptionService();
    const keyId = `retrieve-mem-hit-${Date.now()}`;

    vi.spyOn(securityService, 'createSecureStorage').mockImplementation(
      () =>
        ({
          retrieve: async () => null,
          store: async () => {},
          delete: async () => {},
        }) as unknown as ReturnType<typeof securityService.createSecureStorage>
    );

    (svc as unknown as { inMemoryKeyCache: Map<string, { key: string; created: string }> }).inMemoryKeyCache.set(
      keyId,
      { key: 'mem-key', created: new Date().toISOString() }
    );

    const retrieved = await (
      svc as unknown as { keyManager: { retrieveKey: (id: string) => Promise<string | null> } }
    ).keyManager.retrieveKey(keyId);

    expect(retrieved).toBe('mem-key');
  });

  it('returns null when cache exists but key is empty (retrieveKey mem?.key falsy branch)', async () => {
    vi.restoreAllMocks();

    const svc = new EndToEndEncryptionService();
    const keyId = `retrieve-mem-empty-${Date.now()}`;

    vi.spyOn(securityService, 'createSecureStorage').mockImplementation(
      () =>
        ({
          retrieve: async () => null,
          store: async () => {},
          delete: async () => {},
        }) as unknown as ReturnType<typeof securityService.createSecureStorage>
    );

    (svc as unknown as { inMemoryKeyCache: Map<string, { key: string; created: string }> }).inMemoryKeyCache.set(
      keyId,
      { key: '', created: new Date().toISOString() }
    );

    const retrieved = await (
      svc as unknown as { keyManager: { retrieveKey: (id: string) => Promise<string | null> } }
    ).keyManager.retrieveKey(keyId);

    expect(retrieved).toBeNull();
  });

  it('decrypts legacy v1 data and validates legacy checksum (legacy branch)', async () => {
    vi.restoreAllMocks();

    const svc = new EndToEndEncryptionService();
    const CryptoJS = (await import('crypto-js')) as unknown as any;

    const key = 'legacy-key';
    const plain = JSON.stringify({ hello: 'legacy' });
    const data = CryptoJS.AES.encrypt(plain, key).toString();
    const checksum = CryptoJS.SHA256(plain + key).toString();

    (svc as unknown as { keyManager: { retrieveKey: (id: string) => Promise<string | null> } }).keyManager.retrieveKey =
      async () => key;

    const decrypted = await svc.decrypt({
      data,
      checksum,
      metadata: {
        algorithm: 'AES-256',
        keyId: 'any',
        timestamp: new Date(),
        version: '1.0.0',
      } as unknown as any,
    } as unknown as any);

    expect(decrypted).toEqual({ hello: 'legacy' });
  });

  it('decrypts legacy v1 data without a checksum (legacy checksum-falsy branch)', async () => {
    vi.restoreAllMocks();

    const svc = new EndToEndEncryptionService();
    const CryptoJS = (await import('crypto-js')) as unknown as any;

    const key = 'legacy-key';
    const plain = JSON.stringify({ hello: 'legacy-no-checksum' });
    const data = CryptoJS.AES.encrypt(plain, key).toString();

    (svc as unknown as { keyManager: { retrieveKey: (id: string) => Promise<string | null> } }).keyManager.retrieveKey =
      async () => key;

    const decrypted = await svc.decrypt({
      data,
      checksum: '',
      metadata: {
        algorithm: 'AES-256',
        keyId: 'any',
        timestamp: new Date(),
        version: '1.0.0',
      } as unknown as any,
    } as unknown as any);

    expect(decrypted).toEqual({ hello: 'legacy-no-checksum' });
  });

  it('decrypts legacy v1 data with COMPRESSED prefix via decompressString fallback (legacy compressed branch)', async () => {
    vi.restoreAllMocks();

    const svc = new EndToEndEncryptionService();
    const CryptoJS = (await import('crypto-js')) as unknown as any;

    const key = 'legacy-key';
    const plain = `COMPRESSED:${JSON.stringify({ hello: 'legacy-compressed' })}`;
    const data = CryptoJS.AES.encrypt(plain, key).toString();

    (svc as unknown as { keyManager: { retrieveKey: (id: string) => Promise<string | null> } }).keyManager.retrieveKey =
      async () => key;

    const decrypted = await svc.decrypt({
      data,
      checksum: '',
      metadata: {
        algorithm: 'AES-256',
        keyId: 'any',
        timestamp: new Date(),
        version: '1.0.0',
      } as unknown as any,
    } as unknown as any);

    expect(decrypted).toEqual({ hello: 'legacy-compressed' });
  });

  it('throws on legacy checksum mismatch (legacy integrity failure branch)', async () => {
    vi.restoreAllMocks();

    const svc = new EndToEndEncryptionService();
    const CryptoJS = (await import('crypto-js')) as unknown as any;

    const key = 'legacy-key';
    const plain = JSON.stringify({ hello: 'legacy' });
    const data = CryptoJS.AES.encrypt(plain, key).toString();

    (svc as unknown as { keyManager: { retrieveKey: (id: string) => Promise<string | null> } }).keyManager.retrieveKey =
      async () => key;

    await expect(
      svc.decrypt({
        data,
        checksum: 'bogus',
        metadata: {
          algorithm: 'AES-256',
          keyId: 'any',
          timestamp: new Date(),
          version: '1.0.0',
        } as unknown as any,
      } as unknown as any)
    ).rejects.toThrow(/legacy/i);
  });

  it('throws when legacy decrypted plaintext is empty (legacy !decrypted branch)', async () => {
    vi.restoreAllMocks();

    const svc = new EndToEndEncryptionService();
    const CryptoJS = (await import('crypto-js')) as unknown as any;

    vi.spyOn(CryptoJS.AES, 'decrypt').mockReturnValue({
      toString: () => '',
    });

    const correctKey = 'legacy-key';
    const data = 'ciphertext-does-not-matter';

    (svc as unknown as { keyManager: { retrieveKey: (id: string) => Promise<string | null> } }).keyManager.retrieveKey =
      async () => correctKey;

    await expect(
      svc.decrypt({
        data,
        checksum: '',
        metadata: {
          algorithm: 'AES-256',
          keyId: 'any',
          timestamp: new Date(),
          version: '1.0.0',
        } as unknown as any,
      } as unknown as any)
    ).rejects.toThrow(/invalid key or corrupted data \(legacy\)/i);
  });

  it('creates an unpassworded backup using the default key (createEncryptedBackup no-password branch)', async () => {
    vi.restoreAllMocks();

    const svc = new EndToEndEncryptionService();

    // Ensure the default key exists; initializeService is async and not awaited in the constructor.
    await (
      svc as unknown as { keyManager: { generateKey: (id: string) => Promise<string> } }
    ).keyManager.generateKey('pain-tracker-master');

    const backupJson = await svc.createEncryptedBackup({ hello: 'no-password' });
    const parsed = JSON.parse(backupJson) as { metadata?: { passwordSalt?: string } };
    expect(parsed.metadata?.passwordSalt).toBeUndefined();
  });

  it('decrypts when metadata.version is missing (legacy version short-circuit branch)', async () => {
    vi.restoreAllMocks();

    const svc = new EndToEndEncryptionService();
    const encrypted = await svc.encrypt({ hello: 'no-version' }, { addIntegrityCheck: true, useCompression: false });

    const withoutVersion = {
      ...encrypted,
      metadata: { ...encrypted.metadata },
    } as any;
    delete withoutVersion.metadata.version;

    const decrypted = await svc.decrypt(withoutVersion);
    expect(decrypted).toEqual({ hello: 'no-version' });
  });

  it('decrypts compressed payloads by executing the COMPRESSED: decompress branch (AES-GCM decrypt compression branch)', async () => {
    vi.restoreAllMocks();

    const svc = new EndToEndEncryptionService();
    const big = { blob: 'a'.repeat(1400) };

    const encrypted = await svc.encrypt(big, { useCompression: true, addIntegrityCheck: true });
    const decrypted = await svc.decrypt(encrypted as unknown as any);

    expect(decrypted).toEqual(big);
  });

  it('stores JSON keys that are neither wrapped nor raw enc/hmac as opaque key strings (storeKey default-after-parse branch)', async () => {
    vi.restoreAllMocks();

    const svc = new EndToEndEncryptionService();
    const keyId = 'pain-tracker-master';
    const key = JSON.stringify({ foo: 'bar' });

    await (
      svc as unknown as { keyManager: { storeKey: (id: string, key: string) => Promise<void> } }
    ).keyManager.storeKey(keyId, key);

    const retrieved = await (
      svc as unknown as { keyManager: { retrieveKey: (id: string) => Promise<string | null> } }
    ).keyManager.retrieveKey(keyId);

    expect(retrieved).toBe(key);
  });

  it('stores already-wrapped payloads unchanged via storeKey (storeKey isWrapped branch with `wrapped`)', async () => {
    vi.restoreAllMocks();

    const svc = new EndToEndEncryptionService();
    const keyId = 'pain-tracker-master';

    await (
      svc as unknown as { keyManager: { storeKey: (id: string, key: string) => Promise<void> } }
    ).keyManager.storeKey(keyId, JSON.stringify({ wrapped: 'wrapped-aes' }));

    const retrieved = await (
      svc as unknown as { keyManager: { retrieveKey: (id: string) => Promise<string | null> } }
    ).keyManager.retrieveKey(keyId);

    expect(retrieved).toBeTruthy();
    const parsed = JSON.parse(retrieved!) as { created?: string };
    expect(typeof parsed.created).toBe('string');
  });

  it('falls back to generated created timestamps when stored payload has no created field (retrieveKey created fallback)', async () => {
    vi.restoreAllMocks();

    const svc = new EndToEndEncryptionService();
    const keyId = `retrieve-created-fallback-${Date.now()}`;

    vi.spyOn(securityService, 'createSecureStorage').mockImplementation(
      () =>
        ({
          retrieve: async () => ({ wrapped: 'wrapped-aes', hmacWrapped: 'wrapped-hmac' }),
          store: async () => {},
          delete: async () => {},
        }) as unknown as ReturnType<typeof securityService.createSecureStorage>
    );

    const retrieved = await (
      svc as unknown as { keyManager: { retrieveKey: (id: string) => Promise<string | null> } }
    ).keyManager.retrieveKey(keyId);

    expect(retrieved).toBeTruthy();
    const mem = (svc as unknown as { inMemoryKeyCache: Map<string, { created: string }> }).inMemoryKeyCache.get(keyId);
    expect(typeof mem?.created).toBe('string');
  });

  it('records mixed success/failure during rotateEncryptionKeys and logs completion metrics (rotationResults filter branches)', async () => {
    vi.restoreAllMocks();

    const svc = new EndToEndEncryptionService();
    const logSpy = vi.spyOn(securityService, 'logSecurityEvent');

    (svc as unknown as { keyManager: { listKeys: () => Promise<string[]> } }).keyManager.listKeys = async () => [
      'ok-key',
      'bad-key',
    ];

    (svc as unknown as { keyManager: { rotateKey: (id: string) => Promise<string> } }).keyManager.rotateKey = async (
      id: string
    ) => {
      if (id === 'bad-key') throw new Error('rotate failed');
      return 'new-key';
    };

    await svc.rotateEncryptionKeys();

    expect(logSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Key rotation completed',
        metadata: expect.objectContaining({ totalKeys: 2, successful: 1, failed: 1 }),
      })
    );
  });

  it('does not attempt to archive an old key during rotateKey when no old key exists (rotateKey oldKey-falsy branch)', async () => {
    vi.restoreAllMocks();

    const svc = new EndToEndEncryptionService();
    const keyId = `rotate-no-old-${Date.now()}`;

    const storeSpy = vi.fn(async (k: any, v?: any) => {});
    vi.spyOn(securityService, 'createSecureStorage').mockImplementation(
      () =>
        ({
          retrieve: async () => null,
          store: storeSpy,
          delete: async () => {},
        }) as unknown as ReturnType<typeof securityService.createSecureStorage>
    );

    // Force "no old key" to skip the archive branch
    (svc as unknown as { keyManager: { retrieveKey: (id: string) => Promise<string | null> } }).keyManager.retrieveKey =
      async () => null;

    // Keep the rotation path deterministic and avoid falling back to raw export
    vi.spyOn(securityService, 'wrapKey').mockResolvedValue('wrapped-any');

    await (
      svc as unknown as { keyManager: { rotateKey: (id: string) => Promise<string> } }
    ).keyManager.rotateKey(keyId);

    const archivedCalls = storeSpy.mock.calls.filter(([k]) => String(k).startsWith('archived-key:'));
    expect(archivedCalls.length).toBe(0);
  });

  it('uses the 310000-iteration PBKDF2 override when not in test env (createEncryptedBackup)', async () => {
    const svc = new EndToEndEncryptionService();

    const env = process.env as Record<string, string | undefined>;
    const originalVitest = env.VITEST;
    const originalNodeEnv = env.NODE_ENV;

    const fakeDerivedKey = {} as CryptoKey;
    const originalDeriveKey = crypto.subtle.deriveKey.bind(crypto.subtle);
    const originalExportKey = crypto.subtle.exportKey.bind(crypto.subtle);

    const deriveSpy = vi
      .spyOn(crypto.subtle, 'deriveKey')
      .mockImplementation(async (...args: unknown[]) => {
        const algorithm = args[0] as { name?: string; iterations?: number };
        if (algorithm?.name === 'PBKDF2') {
          expect(algorithm.iterations).toBe(310000);
          return fakeDerivedKey;
        }
        return (originalDeriveKey as unknown as (...a: unknown[]) => Promise<CryptoKey>)(...args);
      });

    const exportSpy = vi
      .spyOn(crypto.subtle, 'exportKey')
      .mockImplementation(async (format: unknown, key: unknown) => {
        if (format === 'raw' && key === fakeDerivedKey) {
          return new Uint8Array(32).buffer;
        }
        return (originalExportKey as unknown as (f: unknown, k: unknown) => Promise<ArrayBuffer>)(format, key);
      });

    try {
      delete env.VITEST;
      env.NODE_ENV = 'production';

      const backupJson = await svc.createEncryptedBackup({ hello: 'pbkdf2' }, 'pw');
      expect(backupJson).toContain('"passwordSalt"');
      expect(deriveSpy).toHaveBeenCalled();
      expect(exportSpy).toHaveBeenCalled();
    } finally {
      if (originalVitest === undefined) delete env.VITEST;
      else env.VITEST = originalVitest;
      if (originalNodeEnv === undefined) delete env.NODE_ENV;
      else env.NODE_ENV = originalNodeEnv;
    }
  });

  it('uses the 310000-iteration PBKDF2 override when not in test env (restoreFromEncryptedBackup)', async () => {
    const svc = new EndToEndEncryptionService();

    const env = process.env as Record<string, string | undefined>;
    const originalVitest = env.VITEST;
    const originalNodeEnv = env.NODE_ENV;

    const fakeDerivedKey = {} as CryptoKey;
    const originalDeriveKey = crypto.subtle.deriveKey.bind(crypto.subtle);
    const originalExportKey = crypto.subtle.exportKey.bind(crypto.subtle);

    const deriveSpy = vi
      .spyOn(crypto.subtle, 'deriveKey')
      .mockImplementation(async (...args: unknown[]) => {
        const algorithm = args[0] as { name?: string; iterations?: number };
        if (algorithm?.name === 'PBKDF2') {
          expect(algorithm.iterations).toBe(310000);
          return fakeDerivedKey;
        }
        return (originalDeriveKey as unknown as (...a: unknown[]) => Promise<CryptoKey>)(...args);
      });

    vi.spyOn(crypto.subtle, 'exportKey').mockImplementation(async (format: unknown, key: unknown) => {
      if (format === 'raw' && key === fakeDerivedKey) {
        return new Uint8Array(32).buffer;
      }
      return (originalExportKey as unknown as (f: unknown, k: unknown) => Promise<ArrayBuffer>)(format, key);
    });

    try {
      delete env.VITEST;
      env.NODE_ENV = 'production';

      const original = { hello: 'restore-pbkdf2' };
      const backupJson = await svc.createEncryptedBackup(original, 'pw');
      const restored = await svc.restoreFromEncryptedBackup<typeof original>(backupJson, 'pw');

      expect(restored).toEqual(original);
      expect(deriveSpy).toHaveBeenCalled();
    } finally {
      if (originalVitest === undefined) delete env.VITEST;
      else env.VITEST = originalVitest;
      if (originalNodeEnv === undefined) delete env.NODE_ENV;
      else env.NODE_ENV = originalNodeEnv;
    }
  });

  it('logs Unknown error when restoreFromEncryptedBackup throws a non-Error value (restore catch metadata ternary)', async () => {
    vi.restoreAllMocks();

    const svc = new EndToEndEncryptionService();
    const logSpy = vi.spyOn(securityService, 'logSecurityEvent');

    vi.spyOn(svc, 'decrypt').mockImplementation(async () => {
      throw 'boom';
    });

    const backupData = JSON.stringify({
      data: 'irrelevant',
      checksum: '',
      metadata: { algorithm: 'AES-256', keyId: 'any', timestamp: new Date(), version: '2.0.0' },
    });

    await expect(svc.restoreFromEncryptedBackup(backupData)).rejects.toBe('boom');

    expect(logSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Failed to restore from encrypted backup',
        metadata: expect.objectContaining({ error: 'Unknown error' }),
      })
    );
  });
