# 🔐 Encryption Key Management

**Version**: 1.0  
**Last Updated**: 2025-01-XX  
**Status**: Active Documentation

## Overview

This document describes the encryption key management system used by the Pain Tracker application, including automatic key generation behavior, key storage, rotation, and security considerations.

---

## Key Auto-Generation Behavior

### Automatic Master Key Creation

The `EndToEndEncryptionService` automatically generates encryption keys when they don't exist. This is a **design decision** to ensure zero-friction encryption for users while maintaining security.

```typescript
// From EncryptionService.ts - initializeService()
private async initializeService(): Promise<void> {
  try {
    // Ensure default key exists
    const defaultKey = await this.keyManager.retrieveKey(this.defaultKeyId);
    if (!defaultKey) {
      await this.keyManager.generateKey(this.defaultKeyId);
    }
    // ...
  }
}
```

### When Auto-Generation Occurs

Keys are automatically generated in these scenarios:

1. **First Application Launch**: Master key (`pain-tracker-master`) is created on initial service initialization
2. **Key Retrieval Failure**: If a key cannot be retrieved from storage
3. **Key Rotation**: New key generated during rotation (old key archived)
4. **Backup Creation**: Unique password-derived keys for encrypted exports

### Security Implications

| Scenario | Behavior | Risk Level | Mitigation |
|----------|----------|------------|------------|
| Fresh install | Master key auto-generated | Low | Key stored in secure storage with encryption |
| Cleared storage | New master key created | **Medium** | Old encrypted data becomes inaccessible |
| Multiple devices | Independent keys per device | Low | Backup/restore with password-protected exports |
| Test environment | In-memory fallback keys | N/A | Test isolation via `isTestEnv()` detection |

---

## Key Types & Lifecycle

### Master Key (`pain-tracker-master`)

- **Purpose**: Encrypts all local pain entry data
- **Algorithm**: AES-256-GCM + HMAC-SHA-256
- **Storage**: SecureStorage (encrypted at rest)
- **Rotation**: Manual via `rotateKey()` method
- **Persistence**: Always persisted (whitelisted)

### Backup Keys (`backup-*`)

- **Purpose**: Password-protected data exports
- **Algorithm**: AES-256-GCM with PBKDF2-derived key
- **Storage**: Stored with backup file metadata
- **Rotation**: N/A (one-time use per export)
- **Persistence**: Persisted for backup restoration

### Temporary Keys

- **Purpose**: Session-specific encryption needs
- **Storage**: In-memory only (`inMemoryKeyCache`)
- **Persistence**: NOT persisted (not whitelisted)
- **Cleanup**: Cleared on service restart

### Key Sensitivity Whitelist

```typescript
private readonly SENSITIVITY_WHITELIST = new Set<string>([
  'pain-tracker-master',
  // backup-* keys (password-protected backups) are allowed
]);
```

Only keys in this whitelist (or matching `backup-*` prefix) are persisted to storage. All other keys remain in-memory only and are lost on page refresh.

---

## Key Storage Architecture

### Storage Layers

```
┌─────────────────────────────────────────────┐
│ CryptoKey (Web Crypto API)                   │
│ - Raw key material in browser memory         │
└───────────────┬─────────────────────────────┘
                │ wrapKey()
                ▼
┌─────────────────────────────────────────────┐
│ Wrapped Key (JSON Payload)                   │
│ - encWrapped: AES-GCM key (wrapped)          │
│ - hmacWrapped: HMAC key (wrapped)            │
│ - created: ISO timestamp                     │
└───────────────┬─────────────────────────────┘
                │ SecureStorage.store()
                ▼
┌─────────────────────────────────────────────┐
│ SecureStorage (Encrypted at Rest)            │
│ - IndexedDB or localStorage                  │
│ - Encrypted with SecurityService master      │
└─────────────────────────────────────────────┘
```

### Key Payload Formats

**Wrapped Payload** (preferred):
```json
{
  "encWrapped": "<base64-wrapped-aes-key>",
  "hmacWrapped": "<base64-wrapped-hmac-key>",
  "created": "2025-01-01T00:00:00.000Z"
}
```

**Raw Payload** (fallback when wrapping unavailable):
```json
{
  "enc": "<base64-raw-aes-key>",
  "hmac": "<base64-raw-hmac-key>",
  "created": "2025-01-01T00:00:00.000Z"
}
```

---

## Test Environment Behavior

### Detection

```typescript
private isTestEnv(): boolean {
  try {
    const env = (typeof process !== 'undefined' ? process.env : undefined) || {};
    return !!(env && (env.VITEST || env.NODE_ENV === 'test'));
  } catch {
    return false;
  }
}
```

### Test-Specific Behavior

1. **In-Memory Fallback**: When secure storage fails (common in jsdom), keys are stored in `inMemoryKeyCache`
2. **Reduced Logging**: Security events filtered to reduce test noise
3. **Isolated Keys**: Each test run gets independent key generation

---

## Key Rotation

### Manual Rotation

```typescript
// Trigger key rotation
const newKeyPayload = await encryptionService.rotateKey('pain-tracker-master');
```

### Rotation Process

1. Generate new AES-GCM + HMAC key pair
2. Archive old key with timestamp suffix
3. Store new key under original keyId
4. Log security event for audit trail
5. Return new key payload

### Re-encryption Requirements

After key rotation, existing encrypted data must be re-encrypted:

```typescript
// Decrypt with old key, re-encrypt with new
const decrypted = await encryptionService.decrypt(oldEncryptedData);
const reEncrypted = await encryptionService.encrypt(decrypted);
```

⚠️ **Note**: The application does not automatically re-encrypt existing data after rotation. This must be handled by application logic.

---

## Security Audit Trail

All key operations are logged via `SecurityService`:

```typescript
// Key generation logged
{
  type: 'encryption',
  level: 'info',
  message: 'New encryption key generated: pain-tracker-master',
  timestamp: new Date()
}

// Service initialization logged
{
  type: 'encryption',
  level: 'info',
  message: 'End-to-end encryption service initialized',
  timestamp: new Date()
}
```

---

## Data Loss Scenarios

### ⚠️ When Data Becomes Inaccessible

| Scenario | Cause | Recovery |
|----------|-------|----------|
| Browser storage cleared | User action or storage quota | Import from password-protected backup |
| Key corruption | Storage error | Import from backup |
| Device change | No key sync | Export/import via backup |
| incognito/private mode | Ephemeral storage | Export before closing |

### Prevention Strategies

1. **Regular Backups**: Export password-protected JSON/CSV regularly
2. **Backup Reminders**: App prompts for periodic exports
3. **Cloud Sync** (future): Optional encrypted cloud backup

---

## API Reference

### KeyManager Interface

```typescript
interface KeyManager {
  generateKey(keyId: string): Promise<string>;
  storeKey(keyId: string, key: string): Promise<void>;
  retrieveKey(keyId: string): Promise<string | null>;
  rotateKey(keyId: string): Promise<string>;
  deleteKey(keyId: string): Promise<void>;
  listKeys(): Promise<string[]>;
}
```

### Common Operations

```typescript
// Check if key exists
const key = await encryptionService.keyManager.retrieveKey('pain-tracker-master');
const exists = key !== null;

// List all stored keys
const keyIds = await encryptionService.keyManager.listKeys();

// Delete a key (irreversible!)
await encryptionService.keyManager.deleteKey('old-key-id');
```

---

## Troubleshooting

### Key Not Found After Page Refresh

**Symptom**: Data encrypted but key missing after reload

**Causes**:
- Key not in whitelist (stored in-memory only)
- SecureStorage initialization failure
- Browser storage cleared

**Solution**:
1. Check browser dev tools → Application → Storage
2. Verify key is in whitelist
3. Check console for storage errors

### Encryption/Decryption Failures

**Symptom**: `decrypt() failed` or gibberish output

**Causes**:
- Key mismatch (old data, new key)
- Corrupted ciphertext
- Wrong algorithm parameters

**Solution**:
1. Check encryption metadata for keyId
2. Verify key exists and matches
3. Import from backup if needed

---

## References

- [Web Crypto API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [AES-GCM - NIST SP 800-38D](https://csrc.nist.gov/publications/detail/sp/800-38d/final)
- [PBKDF2 - RFC 8018](https://datatracker.ietf.org/doc/html/rfc8018)

---

*This document is part of the Pain Tracker security documentation. For questions, see `SECURITY.md` or create an issue.*
