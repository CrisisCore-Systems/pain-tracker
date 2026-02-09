---
title: "Health Data Threat Model: What Risks Does Your Pain Diary Face?"
datePublished: Fri Feb 06 2026 14:45:17 GMT+0000 (Coordinated Universal Time)
cuid: cmlazyxv4000b02jodtit9d76
slug: health-data-threat-model
cover: https://cdn.hashnode.com/res/hashnode/image/upload/v1770444622165/b619c595-5ffe-4fb1-b984-4dc920dbbc7d.png
tags: security, accessibility, privacy, open-source

---

## Why threat modelling matters for health data

A threat model identifies who might want access to your data, how they might get it, and what protections are in place. For health data—especially chronic pain records that may affect employment, insurance, and legal matters—understanding threats is not paranoia; it is practical risk management. Different people face different threats, and security measures should match actual risks.

PainTracker's security architecture is designed around a specific threat model. Being transparent about what we protect against—and what we do not—helps you make informed decisions about whether our approach matches your needs.

## Threat: data breaches and server compromise

Health data breaches are frequent and devastating. Once exposed, health information cannot be changed like a credit card number—your medical history is permanently compromised. Cloud-based health apps store data on servers that are attractive targets for attackers, and even well-funded healthcare organisations suffer breaches regularly.

PainTracker's defence: there is no server-side health data to breach. The server delivers static application code and has no database, no user data, and no API endpoints that receive health information. The attack surface for health data is reduced to zero at the server level.

## Threat: employer or insurer access

Workers documenting injuries for compensation claims face a specific threat: employers or their insurers may seek access to health records to dispute claims. With cloud-based apps, a legal request to the app company could potentially expose your entire tracking history—including entries unrelated to the workplace injury.

PainTracker's defence: there is no company database to subpoena. Your data exists only on your device, encrypted with your passphrase. No legal process can compel PainTracker's developers to hand over data they do not possess. You control what is shared through selective exports.

## Threat: device loss or theft

If your phone or computer is lost or stolen, someone gaining physical access to your device could potentially access your browser storage. This is a real threat that requires application-level protection beyond device security.

PainTracker's defence: all health data is encrypted at rest using your passphrase-derived key. Even with full physical access to the device and its storage, an attacker cannot read your pain entries without your passphrase. The encryption uses standard algorithms that resist brute-force attacks.

## Threat: coercive situations and surveillance

Some patients track pain in situations where others—a controlling partner, an intrusive employer, a family member—monitor their digital activity. The mere visibility of a pain tracking app can be problematic in coercive domestic situations.

PainTracker's defence: panic mode allows quick dismissal of the application without leaving visible traces. The app runs as a Progressive Web App that can be named anything on the home screen. There are no push notifications that reveal pain tracking activity, no email receipts, and no calendar integrations that could expose health information through shared accounts.

## Threats we do not fully address

Honest security requires acknowledging limitations. PainTracker cannot protect against a compromised operating system or malware with root access—these threats operate below the application layer and can intercept any data the browser processes. We cannot protect against physical coercion where someone forces you to reveal your passphrase. We cannot prevent a compromised browser from intercepting data before encryption.

If you face these specific threats, additional measures beyond any single application are necessary: full-disk encryption, dedicated secure devices, and operational security practices. PainTracker provides strong protection within the browser application layer but is transparent about threats that require system-level defences.

---

<p class="cta">
  <a href="https://paintracker.ca" target="_blank" rel="noopener noreferrer">
    Try PainTracker free — offline, encrypted, clinician-ready pain tracking.
  </a>
</p>