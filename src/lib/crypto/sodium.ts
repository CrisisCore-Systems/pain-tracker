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

const isTest = process.env.NODE_ENV === 'test' || !!process.env.VITEST;

function log(message: string, ...args: unknown[]) {
  if (!isTest) {
    console.log(message, ...args);
  }
}

function isSodiumApi(value: unknown): value is SodiumApi {
  if (!value || (typeof value !== 'object' && typeof value !== 'function')) return false;
  const record = value as Record<string, unknown>;

  const ready = record.ready as unknown;
  const then = (ready as { then?: unknown } | undefined)?.then;
  if (typeof then !== 'function') return false;

  return typeof record.crypto_pwhash === 'function';
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

      // Get the default export from the module
      const sodiumCandidate =
        (sodiumModule as unknown as { default?: unknown }).default ?? (sodiumModule as unknown);

      if (!isSodiumApi(sodiumCandidate)) {
        throw new Error('[sodium] Invalid module shape: required functions missing');
      }

      const sodium = sodiumCandidate;

      log('[sodium] Waiting for ready...');
      await sodium.ready;

      log('[sodium] Library initialized successfully');
      log('[sodium] crypto_pwhash type:', typeof sodium.crypto_pwhash);
      log('[sodium] crypto_pwhash_str type:', typeof sodium.crypto_pwhash_str);
      log('[sodium] crypto_pwhash_SALTBYTES:', sodium.crypto_pwhash_SALTBYTES);

      // Validate we have the required functions
      if (typeof sodium.crypto_pwhash !== 'function') {
        throw new Error('[sodium] crypto_pwhash function not available even in SUMO version!');
      }

      sodiumInstance = sodium;
      return sodium;
    })();
  }
  return sodiumPromise;
}

export function getSodiumSync(): SodiumApi | null {
  return sodiumInstance;
}
