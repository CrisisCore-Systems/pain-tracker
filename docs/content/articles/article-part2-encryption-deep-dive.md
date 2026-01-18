---
title: "Client-Side Encryption for Healthcare Apps"
published: true
description: "AES-GCM encryption, PBKDF2 key derivation, secure key management. Web Crypto API. No backend. No trust required."
tags: ["security", "javascript", "webdev", "encryption"]
cover_image: https://dev-to-uploads.s3.amazonaws.com/uploads/articles/encryption-healthcare-cover.png
canonical_url: 
---

# Client-Side Encryption for Healthcare Apps

I've had my data used against me in court.

Not hypothetically. Actual court. Actual lawyers. Actual judge reading things I wrote during a pain flare, reframed as evidence of instability.

That's why I use a strong KDF configuration and authenticated encryption (for example, PBKDF2 + AES-GCM via Web Crypto). That's why key material is kept client-side in normal use, and why I treat offline attacks as a first-class threat.

This isn't a tutorial. This is the architecture that keeps my health data out of discovery motions, custody disputes, and insurance fraud investigations. If you're building for people whose data could be weaponized—disability claimants, chronic pain patients, anyone the system has already decided to disbelieve—this is how you protect them.

---

## The Problem

Traditional model: User → Server → Database.

The server decrypts to process. Your health data passes through corporate infrastructure. Employees access it. Subpoenas demand it. Breaches expose it. Business models monetize it. Custody lawyers subpoena it. Disability reviewers "request" it.

In a user-held-keys model, a server (if present) only sees ciphertext; the operator can’t read user content without the key.

Local-first means your data can stay on-device by default, with sharing happening via explicit exports/imports. Encryption helps with lost/stolen device risk and casual inspection; it’s not a guarantee against a fully compromised OS or a determined forensic adversary.

---

## Web Crypto API

Third-party crypto libraries add supply-chain risk.

Web Crypto API is built into the browser. Hardware-accelerated. No supply chain. Nothing to install. Nothing to explain to a forensic analyst.

```typescript
const cryptoAPI = globalThis.crypto || window.crypto;
const subtle = cryptoAPI.subtle;
```

---

## Key Generation

```typescript
async function generateEncryptionKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}
```

AES-GCM. Authenticated encryption. NIST-approved. Hardware-accelerated. If someone tampers with the ciphertext, decryption fails. No silent corruption.

HMAC on top of that. Belt and suspenders. Because I've seen what happens when you trust one layer:

```typescript
async function generateHMACKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: 'HMAC', hash: 'SHA-256' },
    true,
    ['sign', 'verify']
  );
}
```

---

## Encryption

The important part:

```typescript
const iv = crypto.getRandomValues(new Uint8Array(12));
```

Fresh IV every time. AES-GCM dies if you reuse IVs. Not "performs poorly." Dies. Complete security collapse. I've seen implementations that hardcode this. Those implementations belong to people who've never had opposing counsel.

```typescript
async function encrypt<T>(
  data: T,
  encryptionKey: CryptoKey,
  hmacKey: CryptoKey
): Promise<EncryptedPayload> {
  const plaintext = JSON.stringify(data);
  const plaintextBytes = new TextEncoder().encode(plaintext);
  
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const ciphertextBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    encryptionKey,
    plaintextBytes
  );
  
  const hmacSignature = await crypto.subtle.sign(
    'HMAC',
    hmacKey,
    ciphertextBuffer
  );
  
  return {
    ciphertext: arrayBufferToBase64(ciphertextBuffer),
    iv: arrayBufferToBase64(iv.buffer),
    hmac: arrayBufferToBase64(hmacSignature),
    algorithm: 'AES-256-GCM',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  };
}
```

---

## Decryption

HMAC verification first. Tampered ciphertext fails before decryption. Fast rejection.

```typescript
async function decrypt<T>(
  payload: EncryptedPayload,
  encryptionKey: CryptoKey,
  hmacKey: CryptoKey
): Promise<T> {
  const ciphertextBuffer = base64ToArrayBuffer(payload.ciphertext);
  const iv = base64ToArrayBuffer(payload.iv);
  const expectedHmac = base64ToArrayBuffer(payload.hmac);
  
  const isValid = await crypto.subtle.verify(
    'HMAC',
    hmacKey,
    expectedHmac,
    ciphertextBuffer
  );
  
  if (!isValid) {
    throw new Error('Integrity check failed');
  }
  
  const plaintextBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    encryptionKey,
    ciphertextBuffer
  );
  
  return JSON.parse(new TextDecoder().decode(plaintextBuffer));
}
```

---

## Key Storage

Every option is bad:

| Storage | Problem |
|---------|---------|
| `localStorage` | XSS steals it |
| `sessionStorage` | Gone when you close the tab |
| IndexedDB | Still XSS vulnerable |
| Password-derived | User types it every time |
| `extractable: false` | Can't backup, can't migrate |

I use layered keys. Master key wraps data keys. Password-derived key wraps backups. If someone gets the wrapped key without the wrapper, they get noise.

```typescript
async function wrapKeyForStorage(
  keyToWrap: CryptoKey,
  wrappingKey: CryptoKey
): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const wrapped = await crypto.subtle.wrapKey(
    'raw',
    keyToWrap,
    wrappingKey,
    { name: 'AES-GCM', iv }
  );
  
  return JSON.stringify({
    wrapped: arrayBufferToBase64(wrapped),
    iv: arrayBufferToBase64(iv.buffer),
  });
}
```

---

## PBKDF2

Password-protected backups. 150,000 iterations.

That number isn't arbitrary. I've had my data used against me. I've sat in a courtroom while someone read my pain journal entries aloud, recontextualized as evidence. 150,000 iterations means brute-force takes months. Months I can use to burn the key.

```typescript
async function deriveKeyFromPassword(
  password: string,
  salt: Uint8Array,
  iterations: number = 150000
): Promise<CryptoKey> {
  const passwordBuffer = new TextEncoder().encode(password);
  
  const baseKey = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}
```

Salt is stored alongside the backup. It's not secret. The iterations count is stored too—so I can increase it later without breaking old backups.

---

## Key Rotation

Keys rotate. Not because best practices say so. Because I've had to abandon devices. Because I've had to assume compromise. Because sometimes you need to make everything before a certain date unrecoverable.

```typescript
async function rotateKey(keyId: string): Promise<void> {
  const newBundle = await generateKeyBundle();
  const allEntries = await loadAllEncryptedEntries();
  const oldKey = await getKey(keyId);
  
  for (const entry of allEntries) {
    const plaintext = await decrypt(entry.data, oldKey.enc, oldKey.hmac);
    const newCiphertext = await encrypt(plaintext, newBundle.encryptionKey, newBundle.hmacKey);
    await updateEntry(entry.id, newCiphertext);
  }
  
  await archiveKey(keyId, oldKey);
  await storeKey(keyId, newBundle);
  
  await logSecurityEvent({
    type: 'key_rotation',
    keyId,
    timestamp: new Date(),
  });
}
```

Archive the old key for recovery. Or don't. Depends on what you're recovering from.

---

## Audit Logging

Every cryptographic operation gets logged. Locally. Never sent anywhere.

```typescript
function logSecurityEvent(event: SecurityEvent): void {
  const auditLog = JSON.parse(localStorage.getItem('security_audit') || '[]');
  auditLog.push({
    ...event,
    timestamp: event.timestamp.toISOString(),
  });
  
  if (auditLog.length > 1000) {
    auditLog.splice(0, auditLog.length - 1000);
  }
  
  localStorage.setItem('security_audit', JSON.stringify(auditLog));
}
```

If someone asks what the app did with my data, I can show them. Locally. Without involving a server. Without involving lawyers. Without involving anyone who might decide my pain journal is evidence of something.

---

## What Breaks

Private browsing mode. localStorage throws. Fall back to in-memory and warn the user their data won't persist.

Test environments. Web Crypto API behaves differently under Vitest. Mock it or use `@peculiar/webcrypto`.

Base64 encoding. Browser and Node.js do it differently. Handle both or pick one and stick with it.

```typescript
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(buffer).toString('base64');
  }
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
```

---

## Why This Matters

I built this from a motel room with 11% battery and eviction papers on the passenger seat.

Not because I wanted to learn cryptography. Because my health data was being used to argue I was unstable. Because pain journals became evidence. Because "seeking treatment" became "drug-seeking behavior" in someone else's narrative.

If you're building for people the system has already decided to disbelieve, you don't get to trust the system with their data. You don't get to assume good faith. You don't get to hope the server admin is ethical, the company won't get acquired, the backup won't get subpoenaed.

You encrypt. Client-side. With keys that never leave the device. With iteration counts that make brute-force a career.

And you document it well enough that someone else can verify it without trusting you either.

---

**Repository**: [github.com/CrisisCore-Systems/pain-tracker](https://github.com/CrisisCore-Systems/pain-tracker)

The encryption service is in `src/services/EncryptionService.ts`. Read it. Audit it. Tell me what I missed.
