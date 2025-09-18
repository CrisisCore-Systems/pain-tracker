# Pain Tracker Architecture Deep Dive

## 1. System Overview

Pain Tracker is an offline-first, privacy-preserving progressive web application for high‑resolution chronic pain and injury tracking. The architecture emphasizes:

- Local‑only data ownership (no backend dependency by default)
- Resilient offline persistence with deferred synchronization
- Modular domain segmentation (tracking, analytics, PWA infrastructure, sync, storage)
- Type safety, security hygiene, and future interoperability (FHIR-ready abstractions)

## 2. Architectural Pillars

| Pillar | Purpose | Key Modules |
| ------ | ------- | ----------- |
| Offline First | Operate fully without network | `offline-storage.ts`, `background-sync.ts`, service worker (`/public/sw.js`) |
| Observability & Health | Detect status, performance, sync health | `pwa-utils.ts`, custom events, diagnostics hooks |
| Extensibility | Add new data domains & sync strategies safely | Typed storage layer, table-like prefix model, queue item metadata |
| Security Posture | Reduce attack surface & supply chain risk | CSP headers, local-only storage, CI security gates |
| Interoperability | Prepare for clinical data standards | (Planned) FHIR mapping layer, export adapters |

## 3. High-Level Data Flow

```text
[User Interaction]
      ↓
[Zustand UI State]  (immediate optimistic update)
      ↓
[Offline Storage Service]
  • IndexedDB (structured records)
  • localStorage (fast key-value)
      ↓
[Sync Queue]
  • Prioritized pending operations
      ↓ (online & scheduled triggers)
[Background Sync Service]
  • Retry / backoff / conflict hooks
      ↓
[Remote Endpoint / Future API]
```

If remote endpoints are absent, the system still functions entirely locally. Remote sync is an extension, not a dependency.

## 4. Storage Layer Design

### 4.1 IndexedDB Wrapper (`offline-storage.ts`)

Provides two complementary models:

- Record Store (`offline-data`): Timestamped typed entries (pain entries, activity logs, emergency data, settings, sync records)
- Sync Queue Store (`sync-queue`): Pending network intents with retry metadata

### 4.2 Table-Like Abstraction via Key Prefixing

Instead of creating many object stores (costly migrations), a "virtual table" model uses settings records with keys shaped like:

```text
table:{tableName}:{id} → { value }
```

Helpers: `getAllFromTable`, `addToTable`, `updateInTable`, `replaceTable`, `removeFromTable`, `getFromTable`.

Benefits:

- Migration simplicity (avoid frequent IndexedDB version bumps)
- Namespace isolation
- Straightforward export/import semantics

### 4.3 Dual Persistence Strategy

- Fast path: Attempt localStorage write for low-latency reads
- Durable path: Always replicate to IndexedDB
- Reads fallback from localStorage → IndexedDB if absent

### 4.4 Data Integrity & Sync Flags

Records include `synced` and `lastModified` fields enabling future diff/merge logic and conflict detection strategies.

## 5. Background Synchronization (`background-sync.ts`)

### 5.1 Queue Model

Each queued operation:

```jsonc
{
      "id": 1,
      "url": "/api/pain-entry",
      "method": "POST",
      "headers": { "Content-Type": "application/json" },
      "body": "{...}",
      "priority": "medium",
      "retryCount": 0,
      "type": "api-request",
      "metadata": { }
}
      ```

Prioritization order: high → medium → low, then FIFO by timestamp.

### 5.2 Retry & Backoff

- Progressive delays: 1s → 5s → 15s; beyond list: exponential up to 30s cap
- Retries scheduled individually; cleared when success or max retries exceeded

### 5.3 Sync Lifecycle

1. Triggered by: online event, visibility restore, periodic timer (5m), manual force sync
2. Load ordered queue
3. Attempt fetch
4. On success: remove item; optionally reconcile local state
5. On retryable error (5xx/429): requeue with delay
6. On terminal error or max retries: remove and log failure

### 5.4 Compatibility & Evolution

`forcSync()` retained (legacy typo) with forward-correct `forceSync()` alias—minimizes breaking changes while codebase is refactored.

### 5.5 Extension Points

- Future: Plugin-based transformers for request/response shaping
- Planned: Conflict strategy injection (e.g., serverWins, clientWins, merge)
- Metadata field reserved for domain-specific reconciliation context

## 6. PWA Infrastructure (`pwa-utils.ts`)

### 6.1 Responsibilities

- Service worker registration & update lifecycle
- Install prompt management & install state signals
- Connection quality monitoring (Network Information API + synthetic latency tests)
- Cache performance telemetry (cache hit ratio events)
- Background sync registration and capability detection
- Export/import of offline data (IndexedDB + localStorage amalgamation)
- Health diagnostics (storage usage, pending sync count, last sync timestamp)

### 6.2 Observability Events

Dispatches custom DOM events such as:

```text
'pwa-initialized'
'pwa-online' / 'pwa-offline'
'pwa-update-available'
'pwa-cache-performance'
'pwa-connection-test'
'pwa-performance-metrics'
'pwa-data-imported'
'pwa-data-cleared'
```

UI or analytics layers can subscribe without direct coupling.

### 6.3 Adaptive Network Handling

- On regain connectivity: invokes `backgroundSync.forceSync()` (or legacy fallback) and registers background sync tags if available
- Latency classification: <100ms good, <500ms moderate, else poor (used for potential future adaptive batching)

## 7. Service Worker (`/public/sw.js`) Summary

(Not fully reproduced here; key behaviors.)

- Cache strategy hybrid: network-first for dynamic/API, cache-first for static assets
- Background sync integration for deferred POST/PUT
- Offline fallbacks (custom pages / asset substitution)
- Cache versioning & stale cleanup
- Broadcast-style messaging to page for update & cache events

## 8. Security & Resilience Measures

| Concern | Mitigation |
|---------|------------|
| Supply chain | CI: CodeQL, npm audit, secret scan, merge blockers |
| Data exfiltration | Local-only architecture by default |
| Stale caches | SW update lifecycle + `updateViaCache: 'none'` |
| Storage pressure | `navigator.storage.estimate()` usage metrics + potential future eviction policies |
| Retry storms | Capped exponential backoff + per-item timeout registry |
| Typo regression | Backward compatible alias (`forcSync`) |

## 9. Type Safety Strategy

- Replace `any` with structural interfaces (e.g., `SyncQueueItemShape`, union payloads)
- Guard unknown → serializable conversions before queue enqueue
- Discriminated entry types (`type` field) enable safe filtering

## 10. Extensibility Pathways

| Future Feature | Integration Point |
|---------------|-------------------|
| FHIR export/API | Translate `pain-entry` records → FHIR Observations before sync |
| Wearable ingestion | New virtual table (e.g., `table:wearable-metrics:{id}`) + analytics hook |
| Advanced conflict resolution | Hook into post-fetch reconciliation inside background sync loop |
| Encryption at rest | Wrap `setItem/storeData` with crypto layer; keep same API |
| Delta sync | Add `lastModified` filtering + server diff protocol |

## 11. Failure Modes & Recovery

| Failure Scenario | Current Behavior | Planned Enhancement |
|------------------|------------------|---------------------|
| IndexedDB open error | Fallback continues (exceptions logged) | Graceful degradation & user warning banner |
| Network flaps mid-sync | Items retried individually | Jittered aggregate retry planner |
| Corrupt localStorage JSON | Parse guarded with try/catch | Auto-purge + integrity hash per key |
| Max retries exceeded | Item removed, error logged | Persistent failure ledger & user surface |
| Large data export | In-memory aggregation | Streamed export or chunked writer |

## 12. Performance Considerations

- Queue ordering reduces latency for urgent (e.g., emergency) data
- Avoid proliferating object stores to minimize upgrade friction
- Latency sampling enables adaptive logic (future: dynamic retry scaling)
- Event-driven sync reduces unnecessary polling except for coarse 5m safeguard

## 13. Architectural Trade-offs

| Decision | Rationale | Trade-off |
|----------|-----------|-----------|
| Virtual tables via key prefixes | Simpler migrations, flexible namespacing | Less IndexedDB indexing granularity per table |
| Local-first no backend required | Guarantees offline usability | Delays multi-user sync scenarios |
| Retaining legacy `forcSync` | Avoids breaking older callers | Slight API surface noise |
| JSON body serialization in queue | Simplicity + deterministic retries | Limits binary payload support (future FormData expansion) |
| Single retry schedule array | Predictable backoff | Less adaptive to dynamic network states |

## 14. Testing & Verification Hooks

While deep automated coverage is evolving, architecture facilitates:

- Unit tests for queue ordering & retry calculation
- Integration tests simulating offline → online transitions (dispatch synthetic events)
- Snapshot/export integrity tests (round-trip export/import)

## 15. Roadmap Snapshot

Short-term:

- Dependency vulnerability remediation
- Add conflict resolution plugin interface
- Integrate coverage metrics into CI

Medium:

- FHIR mapping & clinical export adapters
- Encrypted at-rest storage option
- Adaptive retry scaling based on observed latency tiers

Long-term:

- Multi-device sync via optional backend
- Wearable sensor ingestion + correlation analytics
- Edge / worker-based ML model deployment

## 16. Quick Reference (API Surfaces)

### OfflineStorage (selected)

```text
storeData(type, data)
getData(type)
getUnsyncedData()
addToSyncQueue(item)
getSyncQueue()
updateSyncQueueItem(id, updates)
getAllFromTable(table)
addToTable(table, item)
replaceTable(table, items)
```

### BackgroundSyncService

```text
queueForSync(url, method, data?, priority?)
forceSync()/forcSync()
getPendingItemsCount()
emergencySync(data, endpoint)
clearFailedItems()
```

### PWAManager

```text
getCapabilities()
showInstallPrompt()
getDiagnostics()
exportOfflineData()/importOfflineData()
clearPWAData()
resetServiceWorker()
checkForUpdates()
```

## 17. Summary

The architecture balances immediate offline functionality, future interoperability, and maintainable extensibility. Core services (storage, sync, PWA manager) are intentionally decoupled via event dispatch and typed boundaries, enabling incremental evolution (encryption, conflict strategies, standards integration) without destabilizing foundational behavior.

---

Generated as part of codebase deep dive to accompany existing implementation summaries.
