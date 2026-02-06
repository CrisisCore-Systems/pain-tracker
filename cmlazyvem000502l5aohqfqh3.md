---
title: "Local-Only Encryption Explained: How PainTracker Protects Data at Rest"
datePublished: Fri Feb 06 2026 14:45:14 GMT+0000 (Coordinated Universal Time)
cuid: cmlazyvem000502l5aohqfqh3
slug: local-only-encryption-explained
tags: security, accessibility, privacy, open-source

---

## What local-only encryption means

Local-only encryption means your data is encrypted and decrypted entirely within your browser, using keys that never leave your device. Unlike server-side encryption—where a company holds the keys and can decrypt your data—local-only encryption ensures that only someone with your passphrase can read your records. The application developer, the hosting provider, and anyone who might access the server infrastructure cannot decrypt your health data.

This is sometimes called "client-side encryption" or "zero-knowledge encryption." The key distinction is who controls the decryption key: you do, and only you. There is no "forgot password" recovery because there is no server-side copy of your key to recover.

## How the encryption process works

When you set up PainTracker, you choose a passphrase. This passphrase is processed through a key derivation function that produces a cryptographic key. The derivation function is deliberately slow—it requires significant computation—which makes brute-force guessing attacks impractical even if someone extracts the encrypted data from your device.

Each time you enter a pain record, the application encrypts the entry using this derived key before writing it to IndexedDB. When you view your data, the application decrypts entries on the fly using the same key, which exists only in memory during your active session. When you close the app or lock it, the key is cleared from memory.

The Web Crypto API provides the underlying cryptographic operations. This is a browser-native library maintained by browser vendors and audited by security researchers worldwide. PainTracker uses standard algorithms through this API rather than implementing custom cryptographic code—a critical best practice in security engineering.

## Why passphrase strength matters

Your encryption is only as strong as your passphrase. A short or common passphrase can be guessed through dictionary attacks, even with a slow key derivation function. Choose a passphrase that is long (at least four random words or twelve characters), unique (not reused from other accounts), and memorable to you but not guessable by someone who knows you.

PainTracker cannot enforce passphrase strength without storing information about your passphrase, which would compromise the zero-knowledge guarantee. The responsibility for passphrase quality rests with you—but the reward is genuine cryptographic protection that no policy or promise can provide.

## What encryption does and does not protect

Local encryption protects against: unauthorized access to your stored data if your device is lost, stolen, or accessed by someone without your passphrase; extraction of readable health data from browser storage; and forensic recovery of health records from your device's storage.

Local encryption does not protect against: someone who knows your passphrase, malware or keyloggers that capture your passphrase as you type it, a compromised operating system that can read application memory, or a compromised browser that can intercept data before encryption. These are operating-system-level threats that no application can fully defeat.

## Verifying the encryption yourself

PainTracker is open source, which means you—or a security professional you trust—can inspect the encryption implementation directly. The code that derives keys, encrypts data, and manages the encryption lifecycle is visible in the public repository. This transparency ensures that the encryption claims are verifiable rather than aspirational.

For users without technical background, the open-source nature provides indirect verification: security researchers, privacy advocates, and other developers can and do review the code. Any vulnerability or deviation from claimed security properties can be identified and reported publicly.

---

*[Try PainTracker free](https://blog.paintracker.ca/app) — offline, encrypted, clinician-ready pain tracking.*