/**
 * secureStorage - wrapper around localStorage with:
 *  - try/catch safety
 *  - size / quota guard
 *  - optional JSON + (future) encryption hook
 *  - namespacing & allowed key whitelist pattern
 */

export interface SecureStorageOptions {
  encrypt?: boolean; // reserved for future encryption integration
  namespace?: string; // prefix keys
  maxValueSizeBytes?: number; // guard large blobs
  // Optional custom crypto hooks (return string <-> string)
  encryptFn?: (plaintext: string) => string;
  decryptFn?: (ciphertext: string) => string;
}

interface SetResult {
  success: boolean;
  error?: string;
  bytes?: number;
  truncated?: boolean;
}

const DEFAULT_NAMESPACE = 'pt';
const DEFAULT_MAX_VALUE = 50 * 1024; // 50KB per item heuristic

const allowedKeyPattern = /^[a-z0-9:_-]+$/i;

function namespaced(key: string, ns?: string) {
  return `${ns || DEFAULT_NAMESPACE}:${key}`;
}

function safeStringify(value: unknown): { data: string; truncated: boolean; bytes: number } {
  try {
    const data = typeof value === 'string' ? value : JSON.stringify(value);
    const bytes = new Blob([data]).size;
    return { data, truncated: false, bytes };
  } catch {
    return { data: '"__SERIALIZATION_ERROR__"', truncated: false, bytes: 28 };
  }
}

export const secureStorage = {
  get<T = unknown>(key: string, options?: SecureStorageOptions): T | null {
    try {
      if (!allowedKeyPattern.test(key)) return null;
      const fullKey = namespaced(key, options?.namespace);
      const raw = localStorage.getItem(fullKey);
      if (raw == null) return null;
      if (raw === '"__SERIALIZATION_ERROR__"') return null;
      try {
        let decoded = raw;
        if (options?.encrypt) {
          const decrypt =
            options.decryptFn ||
            (globalThis as unknown as { __secureStorageDecrypt?: (c: string) => string })
              .__secureStorageDecrypt;
          if (!decrypt) {
            return null;
          }
          try {
            decoded = decrypt(raw);
          } catch {
            return null; // decryption failure treated as missing
          }
        }
        return JSON.parse(decoded) as T;
      } catch {
        // return raw string if not JSON
        return raw as unknown as T;
      }
    } catch {
      return null;
    }
  },

  set(key: string, value: unknown, options?: SecureStorageOptions): SetResult {
    if (!allowedKeyPattern.test(key)) {
      return { success: false, error: 'INVALID_KEY' };
    }
    const fullKey = namespaced(key, options?.namespace);
    try {
      const { data, bytes } = safeStringify(value);
      const limit = options?.maxValueSizeBytes ?? DEFAULT_MAX_VALUE;
      if (bytes > limit) {
        return { success: false, error: 'VALUE_TOO_LARGE', bytes };
      }
      let out = data;
      if (options?.encrypt) {
        const encrypt =
          options.encryptFn ||
          (globalThis as unknown as { __secureStorageEncrypt?: (p: string) => string })
            .__secureStorageEncrypt;
        if (!encrypt) {
          return { success: false, error: 'ENCRYPTION_UNAVAILABLE' };
        }
        try {
          out = encrypt(data);
        } catch {
          return { success: false, error: 'ENCRYPT_FAILED' };
        }
      }
      localStorage.setItem(fullKey, out);
      return { success: true, bytes };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  },

  remove(key: string, options?: SecureStorageOptions): boolean {
    try {
      const fullKey = namespaced(key, options?.namespace);
      localStorage.removeItem(fullKey);
      return true;
    } catch {
      return false;
    }
  },

  safeJSON<T = unknown>(key: string, fallback: T, options?: SecureStorageOptions): T {
    const val = this.get<T>(key, options);
    return val == null ? fallback : val;
  },

  keys(namespace?: string): string[] {
    const prefix = `${namespace || DEFAULT_NAMESPACE}:`;
    const out: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix)) out.push(k.slice(prefix.length));
    }
    return out;
  },
};
