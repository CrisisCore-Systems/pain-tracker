declare module 'libsodium-wrappers-sumo' {
  export interface Sodium {
    ready: Promise<void>;
    crypto_aead_xchacha20poly1305_ietf_encrypt(
      message: string | Uint8Array,
      additionalData: string | Uint8Array | null,
      nonce: Uint8Array,
      publicNonce: Uint8Array,
      key: Uint8Array
    ): Uint8Array;
    crypto_aead_xchacha20poly1305_ietf_decrypt(
      ciphertext: Uint8Array,
      additionalData: string | Uint8Array | null,
      nonce: Uint8Array,
      publicNonce: Uint8Array,
      key: Uint8Array
    ): Uint8Array;
    crypto_aead_xchacha20poly1305_ietf_keygen(): Uint8Array;
    randombytes_buf(length: number): Uint8Array;
    from_string(str: string): Uint8Array;
    to_string(bytes: Uint8Array): string;
    crypto_pwhash(
      keyLength: number,
      password: string | Uint8Array,
      salt: Uint8Array,
      opsLimit: number,
      memLimit: number,
      algorithm: number
    ): Uint8Array;
    crypto_pwhash_str(
      password: string | Uint8Array,
      opsLimit: number,
      memLimit: number
    ): string;
    crypto_pwhash_str_verify(
      hash: string,
      password: string | Uint8Array
    ): boolean;
    crypto_pwhash_OPSLIMIT_INTERACTIVE: number;
    crypto_pwhash_MEMLIMIT_INTERACTIVE: number;
    crypto_pwhash_ALG_ARGON2ID13: number;
    crypto_pwhash_ALG_DEFAULT: number;
    crypto_pwhash_SALTBYTES: number;
    to_hex(bytes: Uint8Array): string;
    from_hex(hex: string): Uint8Array;
  }

  const sodium: Sodium;
  export default sodium;
}
