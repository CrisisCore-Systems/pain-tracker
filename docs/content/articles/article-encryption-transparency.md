---
title: "If Your Health App Can't Explain Its Encryption, It Doesn't Have Any"
published: true
description: "Most 'encrypted' health apps are lying. Here's how to tell the difference, and what real client-side encryption actually looks like."
tags: ["security", "privacy", "healthtech", "webdev"]
cover_image: https://dev-to-uploads.s3.amazonaws.com/uploads/articles/encryption-transparency-cover.png
canonical_url: 
---

# If Your Health App Can't Explain Its Encryption, It Doesn't Have Any

"Your data is encrypted."

Every health app says this. Almost none of them mean what you think they mean.

---

## The Lie

Here's what "encrypted" usually means in health apps:

**HTTPS** - Your data is encrypted *in transit*. Between your phone and their server. That's it. The moment it arrives, they decrypt it. They read it. They store it in plaintext or with keys they control. They sell it. They leak it. They hand it over when lawyers ask.

**Encrypted at rest** - Your data sits encrypted on their servers. They hold the keys. They can decrypt it whenever they want. For "customer support." For "product improvement." For "legal compliance."

**"Bank-level encryption"** - Marketing term. Meaningless. Banks get breached constantly. Banks also have your data in plaintext on the backend. "Bank-level" means they bought an SSL certificate.

None of this protects you from the company itself. None of this protects you from subpoenas. None of this protects you from the inevitable breach.

---

## Why It Matters

Your pain journal isn't just data. It's:

- Evidence in disability hearings
- Ammunition in custody battles
- "Pre-existing conditions" for insurers
- "Drug-seeking behavior" for doctors who don't believe you
- A liability for employers looking for reasons

I know because I've had my health data used against me. In actual court. By actual lawyers. Reading entries I wrote during pain flares, reframed as evidence of instability.

"But I consented to the privacy policy."

You consented to a document designed to be unreadable. A document that says they can share your data with "partners" and "service providers" and "as required by law." A document that changes whenever they want.

Consent isn't protection. Architecture is protection.

---

## What Real Encryption Looks Like

Real encryption means **the company cannot read your data**. Not "won't." Cannot.

```
YOUR DEVICE                          THEIR SERVER
┌─────────────────┐                  ┌─────────────────┐
│                 │                  │                 │
│  Plaintext      │                  │  Ciphertext     │
│  (readable)     │  ──encrypted──►  │  (noise)        │
│                 │                  │                 │
│  Keys stay here │                  │  No keys here   │
│                 │                  │                 │
└─────────────────┘                  └─────────────────┘
```

The keys never leave your device. The server only sees noise. If they get breached, attackers get noise. If they get subpoenaed, lawyers get noise. If they get acquired by a company that wants to monetize health data, the new owners get noise.

This is called **client-side encryption** or **zero-knowledge architecture**.

---

## The Questions Your Health App Can't Answer

Ask your health app these questions:

1. **Where are the encryption keys stored?**
   - If they say "on our servers" → they can read your data
   - If they say "we use AWS KMS" → Amazon can read your data
   - If they can't answer → they don't know, which is worse

2. **Can your engineers access my data for debugging?**
   - If yes → not encrypted
   - If "only with your permission" → not encrypted, just policy
   - If "no, it's impossible" → maybe actually encrypted

3. **What happens if you get subpoenaed for my data?**
   - If "we comply with legal requests" → they can read it
   - If "we can only provide encrypted blobs" → maybe real
   - If they look confused → run

4. **Can I export my data and verify the encryption myself?**
   - If no → you're trusting them completely
   - If yes but it's plaintext → not encrypted
   - If yes and it's ciphertext you can decrypt locally → real

5. **Is your encryption implementation open source?**
   - If no → you can't verify anything
   - If yes → check it. Or find someone who can.

---

## How I Built It Different

Pain Tracker uses client-side encryption. Here's what that actually means:

### Key Generation (On Your Device)

```typescript
const encryptionKey = await crypto.subtle.generateKey(
  { name: 'AES-GCM', length: 256 },
  true,
  ['encrypt', 'decrypt']
);
```

This key is generated in your browser. It never touches a network. It never goes to any server. It exists only on your device.

### Encryption (Before Anything Leaves)

```typescript
const iv = crypto.getRandomValues(new Uint8Array(12));

const ciphertext = await crypto.subtle.encrypt(
  { name: 'AES-GCM', iv },
  encryptionKey,
  plaintextBytes
);
```

Fresh IV every time. AES-GCM authenticated encryption. If someone tampers with the ciphertext, decryption fails. No silent corruption.

### Storage (Local Only)

```typescript
await indexedDB.put('pain-entries', {
  id: crypto.randomUUID(),
  data: ciphertext,  // Encrypted blob
  iv: iv,            // Needed for decryption
  timestamp: Date.now()
});
```

The plaintext never exists outside your browser's memory. The database stores noise.

### The Part Most Apps Skip

```typescript
// HMAC verification - detect tampering
const hmac = await crypto.subtle.sign(
  'HMAC',
  hmacKey,
  ciphertext
);

// Before decryption, verify HMAC first
const isValid = await crypto.subtle.verify(
  'HMAC',
  hmacKey,
  storedHmac,
  ciphertext
);

if (!isValid) {
  throw new Error('Data integrity check failed');
}
```

Belt and suspenders. If someone modifies the encrypted data, we know before we try to decrypt it.

---

## "But What About Sync?"

I get this question a lot. "How do I sync between devices without a server?"

You don't. That's the point.

Sync requires either:
1. A server that can read your data (not encrypted)
2. A server that stores encrypted blobs + key exchange between devices (complex, still requires trusting the server for key exchange)
3. Direct device-to-device transfer (limited, but actually secure)

I chose local-only. Your data lives on your device. If you want to share it with your doctor, you export a file. You hand them the file. No intermediary.

Is this inconvenient? Yes.

Is your health data being sold to insurance companies? No.

Trade-offs.

---

## "What If I Lose My Device?"

Then your data is gone.

This is the honest answer that no "encrypted" health app will give you. Real encryption means real consequences.

You can mitigate this:
- **Encrypted exports** - Password-protected backups you control
- **Key escrow** - Store an encrypted copy of your key somewhere you control (not their servers)
- **Accept the trade-off** - Some data is better lost than leaked

I chose encrypted exports with PBKDF2 key derivation:

```typescript
const backupKey = await crypto.subtle.deriveKey(
  {
    name: 'PBKDF2',
    salt: salt,
    iterations: 150000,  // Brute-force resistant
    hash: 'SHA-256',
  },
  passwordKey,
  { name: 'AES-GCM', length: 256 },
  false,
  ['encrypt', 'decrypt']
);
```

150,000 iterations. If someone steals your backup file, they need months to crack a decent password. Months you can use to change your life situation, if that's what this is about.

---

## The Audit Trail They Don't Want You To Have

Real apps log what they do with your data. Locally.

```typescript
function logSecurityEvent(event: SecurityEvent): void {
  const log = getLocalAuditLog();
  log.push({
    type: event.type,
    timestamp: new Date().toISOString(),
    details: event.details
  });
  saveLocalAuditLog(log);
}

// Every decrypt operation
logSecurityEvent({ type: 'decrypt', details: { entryId, reason: 'user_view' } });

// Every export
logSecurityEvent({ type: 'export', details: { format: 'pdf', count: entries.length } });
```

If someone asks what the app did with my data, I can show them. From my device. Without asking anyone's permission.

Try asking your health app for this log. They don't have it. Or they have it on their servers, which defeats the purpose.

---

## How To Verify

Don't trust me either. Verify.

1. **Open DevTools** → Network tab → Use the app → Watch for requests
   - If your pain data appears in request bodies, it's not encrypted
   - If you see Base64 blobs that look random, maybe encrypted

2. **Check IndexedDB** → Application tab → IndexedDB → Look at stored data
   - Readable JSON? Not encrypted.
   - Binary blobs? Possibly encrypted.

3. **Read the source code**
   - Is it open source? Can you find the encryption implementation?
   - Do they use Web Crypto API or a library? Which one?
   - Where do they store keys?

4. **Export your data**
   - Is it plaintext? Not encrypted at rest.
   - Is it ciphertext you can decrypt with a key you control? Real.

---

## The Uncomfortable Truth

Most health apps don't want to give you real encryption because:

1. **They can't monetize encrypted data** - Can't sell what you can't read
2. **Customer support is harder** - "I can see your account" isn't possible
3. **Legal requests are harder** - "We can't comply" is uncomfortable
4. **It's more engineering work** - Actually secure systems are complex

Real encryption is a business decision that costs them money. They won't make it unless users demand it.

---

## What You Can Do

**For users:**
- Ask the questions above before trusting a health app
- Prefer apps that are open source and verifiable
- Assume any data that leaves your device can be read

**For developers:**
- Implement client-side encryption if you handle sensitive data
- Open source your encryption implementation
- Be honest about your threat model

**For everyone:**
- Stop accepting "your data is encrypted" as meaningful
- Demand specifics: where are the keys, who can access them, what's the implementation
- Remember that "encrypted" is a spectrum, and most apps are at the wrong end

---

## The Standard Should Be Higher

I built Pain Tracker because I needed something I could trust with data that had been used against me.

Not "trust the company's privacy policy." Not "trust their security team." Not "trust that the acquisition won't change anything."

Trust the math. Trust the architecture. Trust code I can read and you can audit.

If your health app can't explain its encryption in technical terms you can verify, it doesn't have encryption. It has marketing.

---

**Repository**: [github.com/CrisisCore-Systems/pain-tracker](https://github.com/CrisisCore-Systems/pain-tracker)

The encryption implementation is in `src/services/EncryptionService.ts`. It's not perfect. It's auditable. That's the point.

Read it. Tell me what I missed. Build something better.
