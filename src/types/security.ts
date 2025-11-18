/**
 * Shared security and encryption related type definitions.
 * Centralizes previously loosely-typed JSON payload shapes used when
 * wrapping/unwrapping keys and persisting encryption metadata.
 */

// Wrapped key payload produced by SecurityService.wrapKey
export interface WrappedKeyPayload {
  wrapped: string | null; // base64 of wrapped (AES-GCM) raw key material
  iv: string | null; // base64 IV used for AES-GCM wrapping (may be null in test/raw mode)
  format: 'raw' | 'none'; // 'raw' indicates wrapped raw key material; 'none' test fallback
  created?: string; // optional timestamp
}

// Key bundle when both encryption and HMAC keys are wrapped
export interface KeyBundleWrappedPayload {
  encWrapped?: string; // base64 wrapped encryption key
  hmacWrapped?: string; // base64 wrapped HMAC key
  wrapped?: string; // legacy single wrapped field
  created?: string; // ISO timestamp
}

// Raw (base64) key material bundle (fallback path when wrapping fails)
export interface KeyBundleRawPayload {
  enc?: string; // base64 raw AES key
  hmac?: string; // base64 raw HMAC key
  created?: string; // ISO timestamp
}

// Opaque single key storage object
export interface OpaqueKeyPayload {
  key?: string; // arbitrary opaque value (may be wrapped JSON string itself)
  created?: string;
}

// Union of possible stored key payload shapes
export type EncryptionKeyPayload = KeyBundleWrappedPayload | KeyBundleRawPayload | OpaqueKeyPayload;

// Metadata for encrypted blobs using current AES-GCM scheme
export interface EncryptedBlobMeta {
  algorithm: string; // e.g. 'AES-256'
  keyId: string; // logical key identifier
  timestamp: Date; // creation timestamp
  version: string; // encryption version (e.g. '2.0.0')
  iv?: string; // base64 IV
  passwordSalt?: string; // optional hex salt for password-derived backups
}

// JSON shape stored when creating an encrypted backup
export interface EncryptedBackupPayload<T = unknown> {
  data: string; // base64 ciphertext
  metadata: EncryptedBlobMeta; // encryption metadata
  checksum: string; // integrity verification (HMAC or digest)
  type?: T; // optional type phantom
}

// Wrapped key JSON string that unwrapKey expects after parsing.
export type UnwrapKeyJSON =
  | WrappedKeyPayload
  | KeyBundleWrappedPayload
  | KeyBundleRawPayload
  | OpaqueKeyPayload;

// Utility type guard helpers
export function isWrappedKeyPayload(v: unknown): v is WrappedKeyPayload {
  return !!v && typeof v === 'object' && 'wrapped' in (v as any);
}
export function isKeyBundleWrapped(v: unknown): v is KeyBundleWrappedPayload {
  return (
    !!v && typeof v === 'object' && ('encWrapped' in (v as any) || 'hmacWrapped' in (v as any))
  );
}
export function isKeyBundleRaw(v: unknown): v is KeyBundleRawPayload {
  return !!v && typeof v === 'object' && ('enc' in (v as any) || 'hmac' in (v as any));
}
