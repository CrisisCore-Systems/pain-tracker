# Data-Flow Map (Ingress/Egress + Storage Surfaces)

This document maps **all known ingress and egress paths** for user data and operational metadata in PainTracker, including:

- Where data **enters** the system (UI, device APIs, imports)
- Where data is **stored** (**in memory**, **at rest**, **in transit**)
- Which flows touch **third parties** (directly or via same-origin proxies)
- Identification of **silent/ambiguous flows** that can surprise maintainers

> Note: This is an architectural inventory. It is not a promise of “no network ever”.
> Some features are explicitly networked (e.g., weather, clinic portal, payments) and
> are called out below.

## Quick Definitions

- **Class A (Highly sensitive / health data)**: pain entries, symptoms, meds, mood, free-text notes, attachments, exports/reports, identifiers.
- **Class B (Sensitive operational)**: audit/security events, feature flags, error traces (when they may contain identifiers), consent records.
- **Class C (Non-sensitive)**: UI preferences, theme/layout, non-identifying UX settings.

## System Boundaries (Where Data Can Live)

### Browser / Device (primary boundary)

- **In memory**
  - React component state
  - Zustand stores (Pain Tracker, health data, energy, advocacy, etc.)
  - Workers (e.g. background insights)
  - Temporary strings during encryption/decryption and export generation

- **At rest**
  - **IndexedDB**
    - `pain-tracker-offline` (offline storage + settings + sync queue metadata)
    - `pain-tracker-audit` (audit sink)
    - `pain-tracker-tone` (tone/voice related persistence)
    - Potential additional app-scoped DBs created by subsystems
  - **localStorage**
    - Consent flags (e.g. analytics consent)
    - `secureStorage` namespaced keys (`pt:*`) and legacy keys where still present
  - **CacheStorage**
    - Service worker caches (app shell and cached assets)

### Same-origin API boundary (still “connect-src 'self'” compliant)

- `/api/*` endpoints used by the client.
- In development this may be a Vite proxy.
- In production this may be implemented via rewrites/serverless functions (e.g. Vercel).

### Third-party / External services

- Open‑Meteo (weather)
- Google Analytics 4 (optional, opt-in)
- Stripe (payments, optional)
- Any configured clinic/FHIR endpoints (optional)
- Any configured WCB submission endpoint (optional)

## Storage Surfaces (At Rest vs In Memory vs Transit)

### In Memory

- **Zustand state**: decrypted, usable objects in runtime memory.
- **Vault / crypto material**: keys and intermediate plaintext exist transiently in memory during encrypt/decrypt and export generation.
- **Workers**: computed analytics/insights and message payloads passed via `postMessage`.

### At Rest

- **Encrypted IndexedDB persistence for core stores**
  - Implemented via `createEncryptedOfflinePersistStorage` in `src/stores/encrypted-idb-persist.ts`.
  - Encrypted blobs are stored under OfflineStorage “settings” records (keyed like `zustand:persist:${storeName}`).
  - Legacy migration paths may read from older localStorage keys.

- **OfflineStorageService (IndexedDB + some localStorage mirroring)**
  - `src/lib/offline-storage.ts` stores typed rows in IndexedDB.
  - Its `setItem/getItem` helper also attempts to mirror values to `localStorage` for speed (best-effort).

- **secureStorage (localStorage wrapper)**
  - `src/lib/storage/secureStorage.ts` provides a namespaced storage wrapper.
  - Some consumers pass `{ encrypt: true }` (encrypted payload at rest in localStorage).

- **Service Worker + CacheStorage**
  - `src/utils/pwa-utils.ts` manages SW registration and can clear caches.
  - Cached assets are “at rest” in CacheStorage.

### In Transit (Network)

All network egress is via `fetch()` and is either:

- **Same-origin**: `/api/...` (may be proxied/rewritten to a third party)
- **Explicit remote base URLs**: e.g. configured FHIR endpoints

## Ingress Paths (Data Entering the App)

### 1) Direct user entry (UI)

- Pain entry forms, dashboards, settings, notes.
- Stored into Zustand stores, then persisted via encrypted IndexedDB.

Primary flows:

- UI components → validation/sanitization helpers → store actions → encrypted persistence.

### 2) Voice / microphone (device API)

- Speech-to-text via Web Speech APIs (`SpeechRecognition` / `webkitSpeechRecognition`), and in some paths microphone permission checks via `navigator.mediaDevices.getUserMedia({ audio: true })`.
- Entry points include:
  - `src/hooks/useVoiceCommands.ts`
  - `src/design-system/fused-v2/QuickLogOneScreen.tsx`
  - Accessibility speech features.

**Ambiguity warning**: Web Speech recognition implementations may route audio to a vendor-operated service depending on browser/OS. Offline behavior varies.

### 3) Geolocation (device API)

- Weather auto-capture uses `navigator.geolocation.getCurrentPosition`.
- Entry point: `src/services/weatherAutoCapture.ts`.

### 4) Import / restore / backup

- PWA “export/import offline data” uses `secureStorage` keys:
  - `src/utils/pwa-utils.ts` (`exportOfflineData` / `importOfflineData`).

**Ambiguity warning**: This backup path appears focused on legacy `secureStorage` keys (`painEntries`, `pain-tracker-settings`) and may not include the canonical encrypted IndexedDB Zustand persistence.

### 5) URL/query-string derived state

- Example: checkout return params (Stripe success/cancel URLs), feature flags, filters.
- These can be user-controllable inputs and should be treated as untrusted.

## Egress Paths (Data Leaving the App)

### 1) Export boundary (user-controlled file outputs)

- CSV/JSON/PDF/FHIR/WCB report generation.
- Typically produces a `Blob` or data URI and triggers a browser download.

Primary implementations:

- `src/utils/pain-tracker/export.ts` (CSV/JSON/FHIR/PDF export)
- `src/utils/pain-tracker/wcb-export.ts` (WorkSafeBC export)
- `src/utils/pdfReportGenerator.ts` and related PDF utilities

**Storage/transit**:

- In-memory only until the user downloads.
- After download, the data is outside the app’s control (OS/browser download folder).

### 2) Clipboard boundary (user-controlled share)

- Some dashboards can copy summaries or URLs to the clipboard.
- Example: `src/components/analytics/PremiumAnalyticsDashboard.tsx` and other UI helpers.

**Risk**: Clipboard is a cross-application channel. Users may paste into third-party apps.

### 3) Notifications boundary (device UI)

- Browser notifications can display text on screen / lock screen.
- Implemented via:
  - `src/utils/pwa-utils.ts` (simple notifications)
  - `src/utils/notifications/*` (scheduler/storage/browser notifications)

**Risk**: Notification text may be visible to others (shoulder-surfing). Treat notification content as a potential disclosure channel.

### 4) Optional network egress (third-party or remote systems)

#### Weather (Open‑Meteo via same-origin proxy)

- Client calls `GET /api/weather?...` from `src/services/weather.ts`.
- In dev: Vite proxy to Open‑Meteo.
- In prod: rewrite (e.g. Vercel) to Open‑Meteo.

**Data in transit**:

- Coordinates (latitude/longitude) are sent as query params.
- Weather response contains environmental readings.

#### Google Analytics 4 (optional, opt-in)

- Remote script load: `src/analytics/analytics-loader.ts` loads `https://www.googletagmanager.com/gtag/js` only when:
  - `VITE_ENABLE_ANALYTICS === 'true'`, and
  - local consent flag is `'granted'`.
- Event sending: `src/analytics/ga4-events.ts` gates on the same rules.

**Data in transit**:

- Only coarse/bucketed values and non-identifying flags should be sent (see `ga4-events.ts`).

#### Stripe checkout (payments)

- Client calls `POST /api/stripe/create-checkout-session` (`src/utils/stripe-checkout.ts`) and then redirects to Stripe.

**Data in transit**:

- User identifiers and email (if provided) may transit to the serverless API and then to Stripe.

#### Clinic portal / authentication (same-origin API)

- Various UI routes use `/api/clinic/...` endpoints.
- These flows are operationally networked and should be treated as external egress.

#### FHIR integrations (explicit remote base URL)

- `src/services/FHIRService.ts` uses `fetch()` to a configured `baseUrl` for create/read/update/search.

**Data in transit**:

- FHIR resources can contain Class A content (observations/notes). Treat as explicit sharing.

#### WCB submission (explicit remote endpoint)

- `src/services/wcb-submission.ts` posts a `WCBReport` to a configured endpoint when `VITE_ENABLE_WCB_SUBMISSION === 'true'`.

**Data in transit**:

- `WCBReport` content may include Class A content.
- Endpoint must be explicitly configured; there is no hard-coded default.

#### Background sync / queued network operations (potentially ambiguous)

- `src/lib/background-sync.ts` and related offline modules reference queued fetch behavior.
- Treat any sync queue as potentially containing sensitive payloads unless it is explicitly proven otherwise.

## Third-Party Touchpoints (Inventory)

- **Open‑Meteo**: weather data (via same-origin proxy/rewrites)
- **Google Analytics 4**: optional remote script + event egress (opt-in)
- **Stripe**: checkout session creation (via same-origin API) + redirect to Stripe hosted pages
- **Browser/OS speech vendor**: Web Speech recognition may use vendor-operated services (browser-dependent)
- **Hosting/edge platform** (e.g. Vercel, Cloudflare): terminates TLS and may implement `/api` routes/rewrites

## Silent or Ambiguous Flows (Callouts)

These are flows that can be easy to miss during review:

1. **Same-origin endpoints that are actually third-party**
   - `/api/weather` is same-origin in the browser, but proxies/rewrites to Open‑Meteo.

2. **Analytics “silent failure” behavior**
   - GA4 sending intentionally swallows errors and returns early when gated.
   - This can mask misconfiguration during testing.

3. **OfflineStorageService localStorage mirroring**
   - `src/lib/offline-storage.ts` attempts to store some settings in localStorage as well as IndexedDB.
   - This increases the number of at-rest locations.

4. **Backup/export path potentially missing canonical data**
   - `exportOfflineData`/`importOfflineData` appear to operate on legacy `secureStorage` keys rather than the encrypted IndexedDB-backed Zustand persistence.

5. **Audit sink fallback to console**
   - Some sinks fall back to console logging when IndexedDB is unavailable.
   - Ensure logged payloads remain non-reconstructive.

6. **Speech recognition network ambiguity**
   - Web Speech APIs can involve remote processing depending on platform.

7. **Notification content exposure**
   - Notifications are “egress” to the lock screen / notification tray.

## Review Checklist (Data-Flow Changes)

See also:

- [docs/security/FAILURE_EXPOSURE_REGISTER.md](docs/security/FAILURE_EXPOSURE_REGISTER.md)

When a change touches any path above, confirm:

- Does it introduce a **new egress** (network, clipboard, file export, notification)?
- Does it add a **new at-rest surface** (new DB, new localStorage keys, new cache)?
- Does it increase plaintext lifetime (more time in memory, more copies)?
- Does it add a third-party touchpoint or remote script?
- Are there any **silent** fallbacks (console, swallow errors) that should be documented?

