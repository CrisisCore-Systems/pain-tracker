# Documentation Accuracy — Red-Zone Review List

This file captures documentation areas that touch **security/telemetry/exports/crypto** where claims are easy to misstate. Items below are grounded in current repository code/config, but should be **human-reviewed** before treating as product promises.

## 1) Analytics / telemetry (GA4)

- **Build/deploy flag**: Remote GA4 script loading is controlled by `VITE_ENABLE_ANALYTICS` in `src/analytics/analytics-loader.ts`.
- **CI deploy reality**: Some workflows set `VITE_ENABLE_ANALYTICS: 'true'` (for example `.github/workflows/pages.yml`, `.github/workflows/deploy-staging.yml`). Preview builds set it to `'false'` in `.github/workflows/deploy-preview.yml`.
- **Consent prompt scope**: `src/components/BetaAnalyticsConsentPrompt.tsx` stores consent in localStorage (`pain-tracker:analytics-consent`) and calls `privacyAnalytics.requestConsent()` / `privacyAnalytics.updatePrivacyConfig(...)`, but it **does not control** whether the GA4 script is appended.
- **Potential consent gap**: When `VITE_ENABLE_ANALYTICS === 'true'`, the loader calls `window.gtag('config', 'G-X25RTEWBYL')`. If consent-first behavior is desired, this likely needs design + implementation review (e.g., consent mode / defer script until consent).
- **Settings toggle wiring**: The Settings UI stores `analyticsConsent` via `src/utils/privacySettings.ts`, but current code does **not** read this value to gate GA script loading or `PrivacyAnalyticsService` event emission.

## 2) Network-capable features beyond exports

- **Weather auto-capture**: `src/services/weatherAutoCapture.ts` can request geolocation and fetch weather data when enabled. Docs should not claim “no network calls” globally.

## 3) Crypto/key-handling statements

- Several documents make specific claims about key storage/handling (e.g., “secure localStorage for keys”). Treat these as **high-risk to word incorrectly**. Any edits here should be verified against the encryption/vault implementation.

## 4) Export/report generation promises

- Claims about report formats, clinical/legal wording, and WorkSafeBC packet behavior should be validated against the export/report pipeline and templates before being presented as guarantees.
