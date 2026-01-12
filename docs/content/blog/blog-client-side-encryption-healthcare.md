# Keeping Your Health Data Out of Court

I've had my pain journal read aloud in a courtroom. Not as evidence FOR me—against me. Lawyers twisted my worst days into proof I was unstable. 

That's why I encrypt everything. That's why 150,000 iterations. That's why the key dies before I let anyone brute-force it cheap.

This isn't theory. It's the code that keeps my data out of custody battles and insurance fraud investigations.

---

## The Web Crypto Advantage

Forget crypto-js. That's another dependency to explain to forensic analysts. Web Crypto API ships with every browser. No install, no audit trail, no "whoops we found a vulnerability" emails.

```typescript
const subtle = crypto.subtle;
```

That's it. Hardware-accelerated, NIST-approved, zero supply chain risk.

---

## Fresh IVs or Die

```typescript
const iv = crypto.getRandomValues(new Uint8Array(12));
```

Every. Single. Time. Reuse an IV with AES-GCM and your security doesn't degrade—it collapses completely. I've seen production apps hardcode this value. Those developers have clearly never sat across from opposing counsel.

---

## Encrypt-Then-HMAC

```typescript
async function lockItUp<T>(
  data: T,
  encKey: CryptoKey,
  signKey: CryptoKey
): Promise<LockedData> {
  const plaintext = JSON.stringify(data);
  const textBytes = new TextEncoder().encode(plaintext);
  
  // Never reuse this
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    encKey,
    textBytes
  );
  
  // Sign the ciphertext, not the plaintext
  const signature = await crypto.subtle.sign(
    'HMAC',
    signKey,
    encrypted
  );
  
  return {
    payload: bufferToBase64(encrypted),
    iv: bufferToBase64(iv.buffer),
    signature: bufferToBase64(signature),
    timestamp: new Date().toISOString(),
  };
}
```

Why HMAC the ciphertext? Because you verify integrity BEFORE attempting decryption. Tampered data fails fast. No wasted cycles on corrupted input.

---

## Storage: Every Option Sucks

localStorage? XSS steals it. sessionStorage? Gone when you close the tab. Password-derived? Users hate typing it every session.

So I layer it. Master key in memory, non-extractable. Data keys wrapped and stored. Password-protected backups for export.

```typescript
// Master key never touches storage
const masterKey = await crypto.subtle.generateKey(
  { name: 'AES-GCM', length: 256 },
  false,  // NON-extractable
  ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey']
);
```

Non-extractable means it can't be exported, only used. Page reload? It's gone. That's the point.

---

## PBKDF2: Making Brute-Force a Career

Password-protected backups get 150,000 iterations minimum. Export files get 310,000. That's not arbitrary—that's how long I need to burn the key if someone seizes my hardware.

```typescript
async function stretchPassword(
  password: string,
  salt: Uint8Array,
  rounds: number = 150000
): Promise<CryptoKey> {
  const passBytes = new TextEncoder().encode(password);
  
  const importedPass = await crypto.subtle.importKey(
    'raw',
    passBytes,
    'PBKDF2',
    false,
    ['deriveKey']
  );
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt.buffer,
      iterations: rounds,
      hash: 'SHA-256',
    },
    importedPass,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}
```

When OWASP bumps their recommendations, I bump my iteration count. Old backups still work. New ones get harder to crack.

---

## Key Rotation: Because Shit Happens

Sometimes you need to make everything before a certain date unrecoverable. Maybe your laptop got stolen. Maybe you had to assume compromise. Maybe opposing counsel is getting creative.

```typescript
async function burnAndReplace(keyId: string): Promise<void> {
  // Generate fresh keys
  const newEncKey = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 }, 
    true, 
    ['encrypt', 'decrypt']
  );
  
  // Re-encrypt everything
  const allData = await loadEncryptedEntries();
  for (const entry of allData) {
    const plaintext = await unlock(entry.data, oldKeys);
    const newCiphertext = await lockItUp(plaintext, newEncKey, newSignKey);
    await updateEntry(entry.id, newCiphertext);
  }

  // Old key gets archived or destroyed—your choice
  await keyManager.replace(keyId, newKeys);
  
  logSecurityEvent({
    type: 'key_rotation',
    reason: 'manual',
    timestamp: new Date(),
  });
}
```

Archive the old key if you need recovery. Burn it if you don't. Depends what you're recovering from.

---

## Audit Everything

Every crypto operation gets logged. Locally. Never leaves the device.

```typescript
function trackSecurityEvent(event: SecurityEvent): void {
  const log = JSON.parse(
    localStorage.getItem('crypto_audit') || '[]'
  );
  
  log.push({
    ...event,
    sessionId: currentSession,
    timestamp: new Date().toISOString(),
  });
  
  // Keep last 1000, dump the rest
  if (log.length > 1000) {
    log.splice(0, log.length - 1000);
  }
  
  localStorage.setItem('crypto_audit', JSON.stringify(log));
}
```

Every encryption, every decryption, every failure. If someone asks what happened to my data, I can show them without involving servers or lawyers.

---

## What Breaks and How to Fix It

Private browsing kills localStorage. Detect it and warn:

```typescript
function canStore(): boolean {
  try {
    localStorage.setItem('test', 'value');
    localStorage.removeItem('test');
    return true;
  } catch {
    console.warn('Private mode - data won\'t persist');
    return false;
  }
}
```

Test environments mock Web Crypto differently. Use reduced iterations:

```typescript
const iterations = process.env.VITEST ? 100 : 150000;
```

Base64 encoding varies between browser and Node:

```typescript
function bufferToBase64(buffer: ArrayBuffer): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(buffer).toString('base64');
  }
  
  const bytes = new Uint8Array(buffer);
  let result = '';
  for (let i = 0; i < bytes.length; i++) {
    result += String.fromCharCode(bytes[i]);
  }
  return btoa(result);
}
```

---

## The Architecture

```
Your Device Only
├── React UI (plaintext)
├── Zustand Store (state)
├── Encryption Layer (AES-256-GCM + HMAC)
├── Key Manager (wrapped keys)
├── IndexedDB (ciphertext only)
└── Audit Log (local events)

Export: PDF/CSV/JSON (your choice)

NO SERVERS. NO CLOUD. NO SHARING.
```

Data enters as plaintext, gets encrypted immediately, stored as ciphertext. Keys stay wrapped except during use. Everything logged locally.

---

## Why This Matters

I built this in a motel room with eviction papers on my passenger seat. Not for fun—because my health data got weaponized in court. Pain journals became "evidence of instability." Treatment-seeking became "drug-seeking behavior."

If you're building for people the system's already decided to distrust, you can't trust the system with their data. No good faith assumptions. No hoping the admin stays ethical. No trusting the company won't get bought.

You encrypt client-side. Keys never leave the device. Iteration counts that make brute-force expensive. And you document it well enough that others can verify without trusting you either.

---

Code's at github.com/CrisisCore-Systems/pain-tracker. Read it. Audit it. Find what I missed.

Still unstable housing. Still shipping code. Take what works, build something better.