---
title: "If Your Health App Can't Explain Its Encryption, It Doesn't Have Any"
published: true
description: "Most 'encrypted' health apps are lying. Here's how to tell the difference, and what real client-side encryption actually looks like."
tags: ["security", "privacy", "healthtech", "webdev"]
cover_image: https://dev-to-uploads.s3.amazonaws.com/uploads/articles/encryption-transparency-cover.png
canonical_url:
---

> Series: Client-Side Encryption for Health Apps
> Part 2 of 3.
> Start here: [Client-Side Encryption for Health Apps: Start Here](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/content/blog/blog-client-side-encryption-health-apps-start-here.md)
> Read first: [Keeping Your Health Data Out of Court](https://blog.paintracker.ca/keeping-your-health-data-out-of-court)
> Read next: [Client-Side Encryption for Healthcare Apps](https://blog.paintracker.ca/client-side-encryption-for-healthcare-apps)

"Your data is encrypted."

Every health app says this. Almost none of them mean what you think they mean.

---

## The Lie

Here's what "encrypted" usually means in health apps:

**HTTPS** means your data is encrypted *in transit* between your phone and the
server. That's it. The moment it arrives, they decrypt it. They read it. They
store it in plaintext or with keys they control. They sell it. They leak it.
They hand it over when lawyers ask.

**Encrypted at rest** means your data sits encrypted on their servers, but they
hold the keys. They can decrypt it whenever they want: for customer support,
product improvement, or legal compliance.

**Bank-level encryption** is a marketing term. It is meaningless. Banks get
breached constantly. Banks also have your data in plaintext on the backend.
"Bank-level" usually means they bought an SSL certificate.

None of this protects you from the company itself. None of it protects you from
subpoenas. None of it protects you from the inevitable breach.

---

## Why It Matters

Your pain journal isn't just data. It's:

- evidence in disability hearings
- ammunition in custody battles
- "pre-existing conditions" for insurers
- "drug-seeking behavior" for doctors who don't believe you
- a liability for employers looking for reasons

I know because I've had my health data used against me. In actual court. By
actual lawyers. Reading entries I wrote during pain flares and reframing them as
evidence of instability.

"But I consented to the privacy policy."

You consented to a document designed to be unreadable. A document that says they
can share your data with partners, service providers, and anyone else required
by law. A document that changes whenever they want.

Consent isn't protection. Architecture is protection.

---

## What Real Encryption Looks Like

Real encryption means **the company cannot read your data**. Not "won't."
Cannot.

```text
YOUR DEVICE                          THEIR SERVER
+-----------------+                  +-----------------+
| Plaintext       | --encrypted-->   | Ciphertext      |
| (readable)      |                  | (noise)         |
| Keys stay here  |                  | No keys here    |
+-----------------+                  +-----------------+
```

In a user-held-keys design, keys are generated and kept client-side during
normal use. A server, if present, may only see ciphertext. If they get
breached, attackers may still only get ciphertext.

This is often called **client-side encryption** or a **user-held-keys**
architecture.

---

## The Questions Your Health App Can't Answer

Ask your health app these questions:

### 1. Where are the encryption keys stored?

- If they say "on our servers," they can read your data.
- If they say "we use AWS KMS," Amazon can read your data.
- If they can't answer, they don't know, which is worse.

### 2. Can your engineers access my data for debugging?

- If yes, it's not encrypted.
- If they say "only with your permission," it's not encrypted, just policy.
- If they say "no, we can't access it without your key," it may be real.

### 3. What happens if you get subpoenaed for my data?

- If they say "we comply with legal requests," they can read it.
- If they say "we can only provide encrypted blobs," it may be real.
- If they look confused, run.

### 4. Can I export my data and verify the encryption myself?

- If no, you're trusting them completely.
- If yes but it's plaintext, it's not encrypted.
- If yes and it's ciphertext you can decrypt locally, it's real.

### 5. Is your encryption implementation open source?

- If no, you can't verify anything.
- If yes, check it, or find someone who can.

---

## How I Built It Different

Pain Tracker uses client-side encryption. Here's what that actually means.

### Key Generation (On Your Device)

```typescript
const encryptionKey = await crypto.subtle.generateKey(
  { name: 'AES-GCM', length: 256 },
  true,
  ['encrypt', 'decrypt']
);
```

This key is generated in your browser. It never touches a network. It never
goes to any server. It exists only on your device.

### Encryption (Before Anything Leaves)

```typescript
const iv = crypto.getRandomValues(new Uint8Array(12));

const ciphertext = await crypto.subtle.encrypt(
  { name: 'AES-GCM', iv },
  encryptionKey,
  plaintextBytes
);
```

Fresh IV every time. AES-GCM authenticated encryption. If someone tampers with
the ciphertext, decryption fails. No silent corruption.

### Storage (Local Only)

```typescript
await indexedDB.put('pain-entries', {
  id: crypto.randomUUID(),
  data: ciphertext,
  iv,
  timestamp: Date.now()
});
```

The plaintext never exists outside your browser's memory. The database stores
noise.

### The Part Most Apps Skip

```typescript
const hmac = await crypto.subtle.sign('HMAC', hmacKey, ciphertext);

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

If someone modifies the encrypted data, we know before we try to decrypt it.

---

## But What About Sync?

I get this question a lot. How do you sync between devices without a server?

You don't. That's the point.

Sync requires either:

- a server that can read your data
- a server that stores encrypted blobs plus key exchange between devices
- direct device-to-device transfer

I chose local-only. Your data lives on your device. If you want to share it
with your doctor, you export a file and hand them the file. No intermediary.

Is this inconvenient? Yes.

Is your health data being sold to insurance companies? No.

Trade-offs.

---

## What If I Lose My Device?

Then your data is gone.

This is the honest answer that no "encrypted" health app will give you. Real
encryption means real consequences.

You can mitigate this:

- **Encrypted exports**: password-protected backups you control
- **Key escrow**: store an encrypted copy of your key somewhere you control
- **Accept the trade-off**: some data is better lost than leaked.

I chose encrypted exports with PBKDF2 key derivation:

```typescript
const backupKey = await crypto.subtle.deriveKey(
  {
    name: 'PBKDF2',
    salt,
    iterations: 150000,
    hash: 'SHA-256'
  },
  passwordKey,
  { name: 'AES-GCM', length: 256 },
  false,
  ['encrypt', 'decrypt']
);
```

If someone steals your backup file, they need serious brute-force effort to
crack a decent password. That's time you can use to respond.

---

## The Audit Trail They Don't Want You To Have

Real apps log what they do with your data locally.

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

logSecurityEvent({ type: 'decrypt', details: { entryId, reason: 'user_view' } });
logSecurityEvent({ type: 'export', details: { format: 'pdf', count: entries.length } });
```

If someone asks what the app did with my data, I can show them from my device,
without asking anyone's permission.

Try asking your health app for this log. They don't have it. Or they have it on
their servers, which defeats the purpose.

---

## How To Verify

Don't trust me either. Verify.

### 1. Open DevTools and watch the network tab while you use the app

- If your pain data appears in request bodies, it's not encrypted.
- If you see random-looking blobs, it may be encrypted.

### 2. Check IndexedDB in the application tab

- Readable JSON means not encrypted.
- Binary blobs mean maybe encrypted.

### 3. Read the source code

- Is it open source?
- Can you find the encryption implementation?
- Where do they store keys?

### 4. Export your data

- If it is plaintext, it's not encrypted at rest.
- If it is ciphertext you can decrypt with a key you control, it's real.

---

## The Uncomfortable Truth

Most health apps don't want to give you real encryption because:

1. they can't monetize encrypted data
2. customer support gets harder
3. legal requests get harder
4. actually secure systems take more work

Real encryption is a business decision that costs them money. They won't make
it unless users demand it.

---

## What You Can Do

### For users

- ask the questions above before trusting a health app
- prefer apps that are open source and verifiable
- assume any data that leaves your device can be read

### For developers

- implement client-side encryption if you handle sensitive data
- open source your encryption implementation
- be honest about your threat model

### For everyone

- stop accepting "your data is encrypted" as meaningful
- demand specifics: where are the keys, who can access them, what is the implementation
- remember that encrypted is a spectrum, and most apps are at the wrong end

---

## The Standard Should Be Higher

I built Pain Tracker because I needed something I could trust with data that had
been used against me.

Not trust-the-company's-privacy-policy. Not trust-their-security-team. Not trust
that the acquisition won't change anything.

Trust the math. Trust the architecture. Trust code I can read and you can audit.

If your health app can't explain its encryption in technical terms you can
verify, it doesn't have encryption. It has marketing.

---

**Repository**:
[github.com/CrisisCore-Systems/pain-tracker](https://github.com/CrisisCore-Systems/pain-tracker)

The encryption implementation is in `src/services/EncryptionService.ts`. It's
not perfect. It's auditable. That's the point.

Read it. Tell me what I missed. Build something better.
