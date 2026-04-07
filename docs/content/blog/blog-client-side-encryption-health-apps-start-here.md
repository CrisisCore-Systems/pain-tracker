# Client-Side Encryption for Health Apps: Start Here

*A reading path through the three posts that explain what real user-held-keys encryption means, how to recognize fake encryption claims, and how the actual Web Crypto architecture works in practice.*

---

This cluster belongs together for one reason:

“encrypted” is one of the most abused words in health software.

Sometimes it means TLS.
Sometimes it means encrypted-at-rest on a server the company fully controls.
Sometimes it means marketing copy with no architecture behind it.

This reading path exists to separate those claims from a system where the user, not the operator, holds the meaningful boundary.

---

## Read these in order

1. [Keeping Your Health Data Out of Court](https://blog.paintracker.ca/keeping-your-health-data-out-of-court)
2. [If Your Health App Can't Explain Its Encryption, It Doesn't Have Any](https://blog.paintracker.ca/if-your-health-app-cant-explain-its-encryption-it-doesnt-have-any)
3. [Client-Side Encryption for Healthcare Apps](https://blog.paintracker.ca/client-side-encryption-for-healthcare-apps)

If you want the adjacent sharing/export boundary after that, read [Exports are a security boundary: the moment local-first becomes shareable](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/content/blog/devto-series-06-exports-as-a-security-boundary.md).

---

## What each post contributes

Keeping Your Health Data Out of Court

- the threat-model opening
- why this is not abstract privacy language in this repo
- how legal exposure, data seizure, and hostile interpretation shape the encryption posture

If Your Health App Can't Explain Its Encryption, It Doesn't Have Any

- the claim-auditing layer
- how to tell the difference between transport security, operator-controlled encryption, and real client-side boundaries
- the questions a health app should be able to answer plainly

Client-Side Encryption for Healthcare Apps

- the implementation layer
- Web Crypto, AES-GCM, HMAC, PBKDF2, and key-handling choices
- what the architecture actually looks like when the system is built to keep operators out of user content during normal use

---

## The short version

If you only want the fastest useful path:

1. [If Your Health App Can't Explain Its Encryption, It Doesn't Have Any](https://blog.paintracker.ca/if-your-health-app-cant-explain-its-encryption-it-doesnt-have-any)
2. [Client-Side Encryption for Healthcare Apps](https://blog.paintracker.ca/client-side-encryption-for-healthcare-apps)

If you want the reason this posture is non-negotiable in the first place, start with [Keeping Your Health Data Out of Court](https://blog.paintracker.ca/keeping-your-health-data-out-of-court).

---

## Why this path exists

Real encryption claims need to answer at least four things:

- who has the keys
- where plaintext exists
- what a server can see
- what happens under subpoena, breach, or seizure

This path exists to make those answers legible.

The point is not to sound secure.

The point is to describe a boundary the code can actually support.