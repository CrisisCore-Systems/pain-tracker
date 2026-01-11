export type SodiumApi = {
  ready: Promise<unknown>;

  crypto_pwhash: (
    outLen: number,
    passwd: string | Uint8Array,
    salt: Uint8Array,
    opslimit: number,
    memlimit: number,
    alg: number
  ) => Uint8Array;
  crypto_pwhash_str: (passwd: string, opslimit: number, memlimit: number) => string;
  crypto_pwhash_str_verify: (hash: string, passwd: string) => boolean;

  crypto_pwhash_SALTBYTES: number;
  crypto_pwhash_OPSLIMIT_MIN: number;
  crypto_pwhash_OPSLIMIT_MODERATE: number;
  crypto_pwhash_MEMLIMIT_MIN: number;
  crypto_pwhash_MEMLIMIT_MODERATE: number;
  crypto_pwhash_ALG_ARGON2ID13: number;

  crypto_aead_xchacha20poly1305_ietf_KEYBYTES: number;
  crypto_aead_xchacha20poly1305_ietf_NPUBBYTES: number;
  crypto_aead_xchacha20poly1305_ietf_encrypt: (
    message: Uint8Array | string,
    additionalData: Uint8Array | null,
    nsec: unknown,
    nonce: Uint8Array,
    key: Uint8Array
  ) => Uint8Array;
  crypto_aead_xchacha20poly1305_ietf_decrypt: (
    nsec: unknown,
    cipher: Uint8Array,
    additionalData: Uint8Array | null,
    nonce: Uint8Array,
    key: Uint8Array
  ) => Uint8Array;

  randombytes_buf: (length: number) => Uint8Array;

  to_base64: (bin: Uint8Array, variant: number) => string;
  from_base64: (b64: string, variant: number) => Uint8Array;
  to_string: (bin: Uint8Array) => string;

  memzero: (bin: Uint8Array) => void;
} & Record<string, unknown>;

let sodiumInstance: SodiumApi | null = null;
let sodiumPromise: Promise<SodiumApi> | null = null;

const isTest = (() => {
  try {
    const env =
      (typeof process !== 'undefined'
        ? (process as unknown as { env?: Record<string, string | undefined> }).env
        : undefined) || {};
    return !!(env && (env.VITEST || env.NODE_ENV === 'test'));
  } catch {
    return false;
  }
})();

function log(message: string, ...args: unknown[]) {
  if (!isTest) {
    console.log(message, ...args);
  }
}

function hasReadyPromise(value: unknown): value is { ready: Promise<unknown> } {
  if (!value || (typeof value !== 'object' && typeof value !== 'function')) return false;
  const record = value as Record<string, unknown>;

  const ready = record.ready as unknown;
  const then = (ready as { then?: unknown } | undefined)?.then;
  return typeof then === 'function';
}

function unwrapDefaultChain(moduleCandidate: unknown, maxDepth = 4): unknown[] {
  const results: unknown[] = [];
  const seen = new Set<unknown>();

  let current: unknown = moduleCandidate;
  for (let depth = 0; depth < maxDepth; depth++) {
    if (!current || (typeof current !== 'object' && typeof current !== 'function')) break;
    if (seen.has(current)) break;
    seen.add(current);
    results.push(current);

    const next = (current as { default?: unknown }).default;
    if (next === undefined) break;
    current = next;
  }

  return results;
}

export async function getSodium(): Promise<SodiumApi> {
  // Validate cached instance has required functions
  if (sodiumInstance && typeof sodiumInstance.crypto_pwhash === 'function') {
    return sodiumInstance;
  }

  // Clear invalid cache
  if (sodiumInstance) {
    console.warn('[sodium] Clearing invalid cached instance');
    sodiumInstance = null;
    sodiumPromise = null;
  }

  if (!sodiumPromise) {
    sodiumPromise = (async () => {
      log('[sodium] Starting initialization (SUMO version)...');
      const sodiumModule = await import('libsodium-wrappers-sumo');
      log('[sodium] Module type:', typeof sodiumModule);
      log('[sodium] Module.default type:', typeof sodiumModule.default);

      // libsodium-wrappers-sumo can present different shapes depending on CJS/ESM interop.
      // We unwrap a few common patterns: module, module.default, module.default.default, ...
      const candidates = unwrapDefaultChain(sodiumModule);
      log('[sodium] Candidate count:', candidates.length);

      const readyCandidate = candidates.find(hasReadyPromise);
      if (!readyCandidate) {
        throw new Error('[sodium] Invalid module shape: missing ready Promise');
      }

      const sodium = readyCandidate as unknown as SodiumApi;

      log('[sodium] Waiting for ready...');
      await sodium.ready;

      // Validate we have the required functions after initialization.
      // Some builds populate crypto functions only after `ready` resolves.
      if (typeof sodium.crypto_pwhash !== 'function') {
        // As a last resort, re-check candidates post-ready in case a different object was populated.
        const postReady = candidates.find((c) =>
          typeof (c as Record<string, unknown> | undefined)?.crypto_pwhash === 'function'
        );
        if (postReady) {
          const resolved = postReady as unknown as SodiumApi;
          if (hasReadyPromise(resolved)) {
            await resolved.ready;
          }
          if (typeof resolved.crypto_pwhash === 'function') {
            sodiumInstance = resolved;
            return resolved;
          }
        }
        throw new Error('[sodium] Invalid module shape: required functions missing');
      }

      log('[sodium] Library initialized successfully');
      log('[sodium] crypto_pwhash type:', typeof sodium.crypto_pwhash);
      log('[sodium] crypto_pwhash_str type:', typeof sodium.crypto_pwhash_str);
      log('[sodium] crypto_pwhash_SALTBYTES:', sodium.crypto_pwhash_SALTBYTES);

      sodiumInstance = sodium;
      return sodium;
    })();
  }
  return sodiumPromise;
}

export function getSodiumSync(): SodiumApi | null {
  return sodiumInstance;
}
