---
title: "PainTracker Security Architecture: How We Protect Your Health Data"
datePublished: Fri Feb 06 2026 14:45:11 GMT+0000 (Coordinated Universal Time)
cuid: cmlazysw5000402l5g6v50pid
slug: security-architecture
tags: security, accessibility, privacy, open-source

---

## Security design philosophy

PainTracker's security architecture is built on one principle: your health data should never exist anywhere you do not control. This means no server-side data storage, no remote databases, no cloud backups, and no analytics pipelines that touch health information. Every security decision flows from this principle—and every feature is evaluated against it before implementation.

The architecture follows a defence-in-depth model: multiple independent layers of protection so that no single failure compromises your data. Client-side encryption, Content Security Policy, secure storage isolation, session management, and minimal attack surface work together to provide comprehensive protection.

## Client-side encryption

All health data is encrypted in your browser before being written to storage. PainTracker uses the Web Crypto API—a standardised browser cryptographic library—with keys derived from your passphrase through a key derivation function. The encryption key exists only in memory during your active session and is never persisted to storage.

This approach means that even if someone extracts the raw IndexedDB data from your device, they see only encrypted blobs. Without your passphrase, the data is computationally infeasible to decrypt. The encryption implementation is open source, auditable, and uses standard algorithms rather than custom cryptographic code.

## Zero-knowledge architecture

Zero-knowledge means the application operator has no ability to read your data, even in principle. PainTracker's server serves static application files—HTML, CSS, JavaScript—and has no database, no API endpoints that accept health data, and no mechanism to receive information from your browser beyond standard web requests for application code.

There are no user accounts, no authentication tokens, and no session identifiers that link server requests to individual users. The server cannot distinguish between different users, much less access their encrypted health data. This is a structural guarantee, not a policy promise.

## Content Security Policy and XSS prevention

PainTracker implements a strict Content Security Policy (CSP) that restricts which scripts can execute, which resources can be loaded, and which connections can be made. This mitigates cross-site scripting (XSS) attacks—a common web vulnerability that could theoretically be used to extract data from the browser.

The CSP configuration blocks inline scripts, restricts resource loading to known origins, and prevents the application from making unexpected network connections. Combined with secure coding practices and regular dependency auditing, this creates a hardened client-side environment that resists common web attack vectors.

## Threat model and honest limitations

PainTracker defends against realistic threats: lost or stolen devices (at-rest encryption), XSS attacks (CSP plus secure coding), malicious browser extensions (limited plaintext exposure), shoulder-surfing (panic mode, minimal visible data), and coercive access attempts (user-controlled data, quick dismissal).

We do not claim to protect against compromised operating systems, root-level malware, hardware keyloggers, or physical coercion beyond in-app safety controls. No application-level security can defeat an adversary who controls the OS. Honest threat modelling means being transparent about what we protect against and what we do not.

---

<p class="cta">
  <a href="https://paintracker.ca" target="_blank" rel="noopener noreferrer">
    Try PainTracker free — offline, encrypted, clinician-ready pain tracking.
  </a>
</p>