# Privacy Policy

**Pain Tracker** by CrisisCore Systems  
**Effective Date:** February 2026  
**Version:** 1.0

---

## Our Privacy Promise

Pain Tracker is built on a simple principle: **your health data belongs to you**.

We designed this application from the ground up to keep your information private and under your control. This is not a policy bolted on after the fact — it is the architecture of the software itself.

---

## What Data Is Collected

### Data You Create

- **Pain entries** — severity, location, symptoms, notes, timestamps
- **Mood, sleep, and activity logs** — contextual factors you choose to record
- **Medication and treatment records** — dosage and effectiveness tracking
- **Export reports** — PDF, CSV, and JSON files you generate

### Data Stored Automatically

- **Application preferences** — theme, layout, accessibility settings
- **Encryption keys** — derived from your passphrase, stored locally

---

## Where Your Data Is Stored

**All data is stored locally on your device.** Pain Tracker uses your browser's IndexedDB for persistence. Your health data is encrypted at rest using AES-GCM encryption.

- ✅ Data stays on your device by default
- ✅ No cloud database
- ✅ No server-side storage of health records
- ✅ No account or sign-up required

---

## What We Do NOT Do

- ❌ **No cloud transmission** — your health data is never sent to our servers
- ❌ **No analytics on health data** — we do not analyze or profile your pain entries
- ❌ **No telemetry** — no usage tracking of your health information
- ❌ **No third-party data sharing** — your data is never sold or shared
- ❌ **No advertising** — no ads, no ad tracking, no ad networks
- ❌ **No account required** — no email, no registration, no identity collection

---

## User Controls

You have full control over your data at all times:

- **Export** — generate PDF, CSV, or JSON reports whenever you choose
- **Delete** — clear all data from your device through the app settings
- **Encryption** — your data is protected by a passphrase only you know
- **Sharing** — you decide when and with whom to share your exports (doctor, WorkSafeBC, etc.)

---

## Optional Network Features

Some features may make network requests when explicitly enabled:

| Feature | Purpose | When Active |
|---------|---------|-------------|
| **Weather correlation** | Fetches local weather via same-origin proxy | Only when enabled in settings |
| **PWA updates** | Checks for new app versions | On app load (service worker) |

These features do **not** transmit your health data. Weather requests are routed through a same-origin API proxy and do not include any personal or health information.

---

## Encryption

Pain Tracker encrypts sensitive data at rest using:

- **AES-GCM** encryption via libsodium
- **Passphrase-derived keys** that never leave your device
- **Vault-based session management** — data is only accessible after you unlock with your passphrase

We cannot recover your data if you lose your passphrase. This is by design.

---

## Children's Privacy

Pain Tracker does not knowingly collect data from children under 13. The application does not collect any identifying information from any user.

---

## Changes to This Policy

We will update this policy as the application evolves. Material changes will be noted in the [CHANGELOG](CHANGELOG.md) and reflected in the version number above.

---

## Contact

- **Issues:** [GitHub Issues](https://github.com/CrisisCore-Systems/pain-tracker/issues)
- **Security concerns:** See [SECURITY.md](SECURITY.md)
- **Project:** [github.com/CrisisCore-Systems/pain-tracker](https://github.com/CrisisCore-Systems/pain-tracker)

---

**Summary:** Your data is stored locally, encrypted, and never transmitted. You control all exports and sharing. No accounts, no analytics on health data, no telemetry.
