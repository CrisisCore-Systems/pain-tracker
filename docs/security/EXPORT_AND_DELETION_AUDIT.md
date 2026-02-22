# Export + Deletion Audit (Repo-Grounded)

_Last updated: 2025-12-22_

Scope: document what the repo currently does for **export portability** and **delete/clear** flows, based on code inspection. This doc intentionally proposes no behavioral changes.

Risk note: changes to export/report formats, storage deletion semantics, crypto, or network calls are **human-review boundaries** per `.github/copilot-instructions.md`.

## Export Implementations (Canonical Code)

- `src/utils/pain-tracker/export.ts`
  - `exportToCSV(entries)` outputs fixed columns: Date, Time, Pain Level, Locations, Symptoms, Limited Activities, Sleep Quality, Mood Impact, Missed Work Days, Notes.
  - `exportToJSON(entries)` is `JSON.stringify(entries, null, 2)`.
  - `exportToPDF(entries)` generates a jsPDF “Pain Tracking Report”; detailed entries are limited to the first **20** entries (then “... and N more”).
  - All three export functions currently emit analytics: `privacyAnalytics.trackDataExport(...)` and GA4 `trackDataExported(...)`.

- `src/utils/pain-tracker/wcb-export.ts`
  - `exportWorkSafeBCPDF(entries, options)` generates an “Enhanced WorkSafe BC” jsPDF report.
  - Filters by date range (`startDate`/`endDate`), sorts ascending.
  - “Daily Pain Log Summary” table includes up to **25** entries (`maxEntries = Math.min(filteredEntries.length, 25)`).
  - Includes a disclaimer (“not affiliated with WorkSafe BC”).
  - Analytics tracking currently uses `trackDataExported('pdf', ...)` and `trackExport('pdf', ...)`.

- `src/features/export/exportCsv.ts`
  - `entriesToCsv(entries)` infers keys from the first object and serializes values (objects JSON-stringified).
  - This is a generic CSV utility; the exported columns depend entirely on the caller’s object shape.

## Export Entry Points (UI → Implementation)

- `src/components/settings/ExportSettings.tsx`
  - Uses `exportToCSV` / `exportToJSON` / `exportToPDF` + `downloadData`.
  - Has `includeCharts` toggle in UI state, but it is currently **not used** by any export function.

- `src/components/reports/ReportsPage.tsx`
  - “Quick Export” uses `exportToCSV` / `exportToJSON` / `exportToPDF` + `downloadData`.
  - Specialized report tiles exist (WCB/Insurance/Clinical), but this file segment does not show a wired action to `wcb-export.ts`.

- `src/components/export/DataExportModal.tsx`
  - Uses `exportToCSV` / `exportToJSON` / `exportToPDF` + `downloadData`.
  - Filters (date/pain/symptoms/locations) are applied to which entries are exported.
  - “Include quality of life / work impact / medications / treatments” toggles are currently **not applied** to the export content (the export functions are not parameterized).

- `src/components/widgets/DashboardOverview.tsx`
  - Exports CSV via `src/features/export/exportCsv.ts` and maps each entry to `{ id, timestamp, pain, notes }`.

- `src/components/widgets/ModernDashboard.tsx`
  - Same as above: exports CSV via `exportCsv.ts` with `{ id, timestamp, pain, notes }`.

### Portability mismatch (current)

There are currently **multiple CSV pipelines** in the UI:

- “Full” CSV (fixed columns) via `exportToCSV`.
- “Light” CSV (id/timestamp/pain/notes only) via `entriesToCsv` callers.

## Delete / Clear Semantics (What Exists)

### Zustand store “clear all data”

- `src/stores/pain-tracker-store.ts` → `clearAllData()` clears:
  - `entries`, `moodEntries`, `fibromyalgiaEntries`, `activityLogs`, `emergencyData`, `scheduledReports`, `error`.

### PWA “clear data”

- `src/utils/pwa-utils.ts` → `PWAManager.clearPWAData()` clears:
  - Service worker caches (`clearCaches()`)
  - IndexedDB via `offlineStorage.clearAllData()`
  - Namespaced `secureStorage` keys: `secureStorage.keys().forEach(k => secureStorage.remove(k))` (default namespace prefix `pt:`)
- It does **not** clear un-namespaced localStorage keys such as the Zustand persist key `pain-tracker-storage`.
- It does **not** clear un-namespaced localStorage keys such as the Zustand persist key `pain-tracker-storage`.

### Emergency wipe / “clear all user data”

- `src/services/emergency-wipe.ts` → `performEmergencyWipe(...)` calls `clearAllUserData()`.
- `src/utils/clear-all-user-data.ts` → `clearAllUserData()` best-effort clears:
  - in-memory store state via `clearAllData()`
  - Zustand persisted storage (`persist.clearStorage()` + `localStorage.removeItem('pain-tracker-storage')`)
  - PWA/offline layers via `PWAManager.clearPWAData()`
  - legacy raw key `localStorage.removeItem('pain_tracker_entries')`

### Legacy pain entry storage

- `src/utils/pain-tracker/storage.ts` uses `secureStorage` with key `pain_tracker_entries` (stored as `pt:pain_tracker_entries`).
- `clearPainEntries()` removes that key.

## Network Behavior (Privacy/Local-first Risk)

- `src/services/wcb-submission.ts` calls `fetch(...)` to `import.meta.env.VITE_WCB_API_ENDPOINT || 'https://api.wcb.gov/submissions'` and requires an API key.
- Any UI path that enables this is a **local-first boundary** and should be treated as a human-reviewed decision.

## Punch List (Next Decisions)

All items below likely touch Class A handling, export formats, or network behavior → **human review recommended/required**.

1. Define “Export portability” as a single contract (fields + formats), then unify UI entry points to one pipeline.
2. Decide whether to (a) wire `includeCharts` and modal “include” toggles into export implementations, or (b) remove/disable them until supported.
3. Define “Delete all data” semantics across:
   - Zustand persisted key `pain-tracker-storage`
   - `secureStorage` namespace `pt:*`
   - IndexedDB offline storage
   - legacy `pt:pain_tracker_entries`
   - scheduled reports and any other persisted slices
4. Decide whether WCB submission is supported, gated, stubbed, or removed to preserve local-first posture.
