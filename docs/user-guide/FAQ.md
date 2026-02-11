# Frequently Asked Questions

## General

### What is Pain Tracker?

Pain Tracker is a free, open-source chronic pain tracking application. It helps you log pain levels, symptoms, medications, and lifestyle factors — then visualize patterns and generate reports for your healthcare providers.

### Is Pain Tracker free?

Yes. Pain Tracker is free and open-source under the MIT license.

### Do I need to create an account?

No. Pain Tracker works entirely on your device. No email, no registration, no account required.

---

## Privacy & Security

### Where is my data stored?

All data is stored locally on your device using your browser's IndexedDB. Your health data never leaves your device unless you explicitly export it.

### Is my data encrypted?

Yes. Pain Tracker encrypts sensitive data at rest using AES-GCM encryption (via libsodium). You set a passphrase when you first use the app, and that passphrase protects your data.

### Can you see my data?

No. We have no access to your data. It is stored only on your device. There is no server-side database for health records.

### What happens if I lose my passphrase?

Your data cannot be recovered. This is a deliberate security design — only you can access your data. We recommend keeping your passphrase in a password manager.

### Does Pain Tracker collect analytics?

Pain Tracker does not collect analytics on your health data. Optional privacy-preserving page view analytics may be present on the public website (paintracker.ca), but these never include health information.

---

## Using the App

### How do I log a pain entry?

1. Open Pain Tracker and unlock your vault with your passphrase
2. Click **"New Entry"** or use the quick-log stepper
3. Follow the guided steps: rate your pain, select body locations, add symptoms, notes, and contextual factors
4. Click **Save**

### What is the 7-step assessment?

The pain assessment walks you through seven dimensions:
1. **Pain Level** — 0–10 intensity scale
2. **Body Location** — anatomical body map
3. **Pain Quality** — sharp, dull, burning, throbbing, etc.
4. **Symptoms** — associated symptoms
5. **Medications** — current treatments
6. **Context** — mood, sleep, weather, activity level
7. **Notes** — free-text for anything else

### Can I track fibromyalgia specifically?

Yes. Pain Tracker includes fibromyalgia-specific features:
- WPI (Widespread Pain Index) scoring support
- SSS (Symptom Severity Scale) scoring support
- Fibro fog cognitive tracking
- Flare pattern recognition
- Energy envelope management

### How do I export my data?

See the [Export Data Guide](EXPORT_DATA.md) for detailed instructions. In short:
1. Go to the export section in the app
2. Choose your format (PDF, CSV, or JSON)
3. Select a date range
4. Download the file to share with your doctor or keep as a record

### Can I use Pain Tracker offline?

Yes. After your first visit, Pain Tracker works entirely offline. You can log entries, view history, and generate reports without an internet connection.

---

## WorkSafeBC & Clinical Use

### Can I use Pain Tracker for WorkSafeBC claims?

Pain Tracker includes WorkSafeBC-oriented export templates designed to support claims documentation. You can generate formatted PDF reports with:
- Pain trend summaries
- Functional impact documentation
- Work impact records
- Date-range filtered data

**Note:** Pain Tracker is a documentation tool. It does not make medical or legal claims. Always work with your healthcare provider and claims advisor.

### Can I share reports with my doctor?

Yes. Export your data as a PDF clinical report and share it with your healthcare provider. The reports are designed to be clear and useful for clinical discussions.

---

## Technical

### What browsers are supported?

Chrome 90+, Firefox 90+, Safari 15+, and Edge 90+ are supported. A modern browser with IndexedDB support is required.

### Can I run Pain Tracker on my phone?

Yes. Pain Tracker is a Progressive Web App (PWA) and works on mobile browsers. You can install it to your home screen for a native-like experience. See the [Install Guide](INSTALL.md).

### Is the source code available?

Yes. Pain Tracker is open-source: [github.com/CrisisCore-Systems/pain-tracker](https://github.com/CrisisCore-Systems/pain-tracker)

### How do I report a bug?

Open an issue on GitHub: [github.com/CrisisCore-Systems/pain-tracker/issues](https://github.com/CrisisCore-Systems/pain-tracker/issues)

### How do I report a security vulnerability?

See [SECURITY.md](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/SECURITY.md) for responsible disclosure instructions.

---

For more information, see the [Documentation Index](../INDEX.md) or the [main README](../../README.md).
