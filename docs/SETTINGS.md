# Settings & Preferences Documentation

This document explains each setting in Pain Tracker, its impact, and privacy implications. All settings are designed for user autonomy, privacy, and accessibility.

---

## General Settings
- **Memory Aids:** Enables reminders and hints to support recall and adherence. No data leaves your device.
- **Progress Indicators:** Shows progress bars and completion markers for goals and activities. Visual only; no extra data stored.
- **Auto-Save:** Automatically saves form data locally as you type. No cloud storage; data is encrypted at rest.

## Privacy Controls
- **Share De-identified Data:** Allows sharing of aggregated, de-identified data for research. Disabled by default.
- **Analytics & Telemetry:** Optional anonymous usage analytics. Remote analytics is enabled/disabled at build/deploy time via `VITE_ENABLE_ANALYTICS`.
- **Data Retention:** Choose how long your data is kept before automatic deletion (30, 90, 365 days, or indefinitely).

## Notification Preferences
- **Enable Notifications:** Master switch for all notifications.
- **Delivery Methods:** Browser + in-app toggles are available in the Settings UI. Email/SMS are stored as preferences but require additional delivery integrations.
- **Quiet Hours / Frequency Limits:** Present in the notification-preferences model, but not currently exposed in the Settings UI.

## Backup & Restore
- **Export Backup:** Download all settings and data as a JSON file for safekeeping.
- **Import Backup:** Restore settings/data from a backup file. Overwrites local data.

## Theme Selection
- **Theme:** Choose dark, light, or auto (system) mode. No impact on data or privacy.

## Account Management
- **Change Password / 2FA / Sessions:** Account Management UI exists, but is currently a placeholder and not wired to a production account system.
- **No server account recovery:** There is no “forgot password” email flow because there is no backend account by default.

---

## Privacy Implications
- By default, all data is stored locally and encrypted. No Class A health data leaves your device unless you explicitly export or share.
- Optional analytics behavior depends on deploy/build configuration (`VITE_ENABLE_ANALYTICS`) and the in-app consent prompt.
- The Settings toggle stores your preference, but remote analytics script loading is currently controlled by `VITE_ENABLE_ANALYTICS`.

---

## How to Use
- Access Settings from the main menu.
- Adjust toggles and preferences as needed. Changes apply instantly and persist across sessions.
- For backup/restore, use the export/import buttons in Backup Settings.

---

## Contact & Feedback
If you have questions about settings or privacy, contact the development team or open an issue. Your feedback shapes future improvements.
