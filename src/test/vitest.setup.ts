import { vi } from 'vitest';

// Mock libsodium so pwhash is instant + deterministic in unit tests
vi.mock('libsodium-wrappers-sumo', () => {
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
    
    // Fast deterministic key derivation
    crypto_pwhash: (keyLen: number, _password: unknown, _salt: unknown) => {
      // Return a deterministic key based on inputs if needed, or just a fixed buffer
      // For tests, a fixed buffer of correct length is usually fine unless we test key uniqueness
      return new Uint8Array(keyLen).fill(1); 
    },
    
    crypto_pwhash_str: () => '$argon2id$v=19$m=65536,t=2,p=1$FAKE_SALT$FAKE_HASH',
    crypto_pwhash_str_verify: () => true,
    
    randombytes_buf: (length: number) => new Uint8Array(length).fill(0),
    
    from_base64: (s: string) => new Uint8Array(Buffer.from(s, 'base64')),
    to_base64: (b: Uint8Array) => Buffer.from(b).toString('base64'),
    
    // Mock encryption/decryption to be pass-through or simple transformation
    crypto_aead_xchacha20poly1305_ietf_encrypt: (msg: Uint8Array) => msg,
    crypto_aead_xchacha20poly1305_ietf_decrypt: (_: unknown, ciphertext: Uint8Array) => ciphertext,
    
    to_string: (b: Uint8Array) => Buffer.from(b).toString(),
    from_string: (s: string) => new Uint8Array(Buffer.from(s)),
  };

  // some codebases access `.default`
  return { ...fake, default: fake };
});
