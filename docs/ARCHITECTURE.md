# Pain Tracker – Architecture Overview

_Last updated: 2025-11-13_

## 1. Purpose

Pain Tracker is a **local-first, privacy-first** PWA for tracking chronic pain and exporting claim-ready reports (with a focus on **WorkSafeBC** forms).  
All data stays on the user's device. No backend. No analytics. No dark patterns.

---

## 2. High-Level Architecture

- **Client**: React 18 + TypeScript
- **State Management**: Zustand (+ Immer)
- **Storage**: IndexedDB (via Dexie or custom wrapper)
- **Packaging**: Vite + PWA plugin
- **Security**: AES-GCM encryption with PBKDF2-derived keys using the Web Crypto API
- **Platform**: Installable PWA (desktop and mobile)

```text
+------------------------------+
| React UI (Forms, Reports)    |
+--------------+---------------+
               |
               v
+------------------------------+
| Zustand Store (painStore)    |
+--------------+---------------+
               |
               v
+------------------------------+
| IndexedDB (encrypted entries)|
+------------------------------+
```

---

## 3. Core Domain Model

### 3.1 PainEntry

```typescript
export interface PainEntry {
  id: string;          // UUID
  timestamp: Date;     // ISO 8601

  painLevel: number;   // 0–10
  location: string[];  // body regions
  quality: string[];   // "sharp", "burning", etc.

  activities: string[];
  medications: string[];
  triggers: string[];

  emotionalState?: EmotionalMetrics;
  notes?: string;

  version: number;     // schema version
  encrypted: boolean;
}
```

### 3.2 EmotionalMetrics (MVP)

```typescript
export interface EmotionalMetrics {
  sentiment: 'positive' | 'neutral' | 'negative' | 'crisis';
  keywords: string[];
  crisisIndicators: string[];
}
```

> Note: The interface supports future ML-based scoring; current implementation uses rule-based heuristics.

---

## 4. State Management

### 4.1 painStore

```typescript
interface PainStore {
  entries: PainEntry[];
  filters: FilterState;

  addEntry(entry: PainEntry): void;
  updateEntry(id: string, changes: Partial<PainEntry>): void;
  deleteEntry(id: string): void;

  getFilteredEntries(): PainEntry[];
  getAnalytics(): AnalyticsData;
  getWCBReport(range: DateRange): WCBReport;
}
```

Implemented using Zustand with Immer:
- Immutable updates.
- Easy testability.
- Simple, flat store — no Redux boilerplate.

---

## 5. Persistence Layer

### 5.1 IndexedDB

Object stores:
- `painEntries`: id, timestamp, painLevel, location*
- `settings`: key

All sensitive data is stored encrypted (see below).

Batch operations are used where possible (e.g. bulk add/import).

---

## 6. Security Design

### 6.1 Threat Model

Single-user app on personal devices.

No server → no remote compromise of a central database.

Main risks:
- Device theft.
- Shoulder-surfing / casual access.
- Browser storage inspection.

### 6.2 Encryption

- **Algorithm**: AES-GCM (256-bit).
- **Key derivation**: PBKDF2-HMAC-SHA256 with configurable iterations.
- Keys derived from user passphrase, never stored in plaintext.

High-level flow:
1. User provides passphrase.
2. Key is derived via PBKDF2 (with per-user salt).
3. Pain entries are serialized and encrypted.
4. Ciphertext + IV + salt are stored in IndexedDB.

### 6.3 Content Security Policy (CSP)

- `default-src 'self'`
- `frame-ancestors 'none'` (no embedding)
- `object-src 'none'`
- Images/fonts/scripts restricted to self (and minimal required exceptions for dev).

---

## 7. PWA Architecture

- Service worker pre-caches the app shell.
- Pain entries are stored in IndexedDB and remain available offline.
- The app can be installed to home screen on supported devices.
- Updates:
  - New versions are detected and the user is prompted to reload.

---

## 8. Reporting & WorkSafeBC Integration

Pain Tracker generates a structured summary suitable for manual transcription into WorkSafeBC forms (6/7/8) and a PDF export with:

- Time-bounded pain log.
- Trend summary (average/peak over the selected period).
- Activity limitations snapshot.
- Free-text narrative of pain progression.

> Note: Direct, official form replication may require legal review; current implementation focuses on helpful summaries aligned to WorkSafeBC requirements.

---

## 9. Testing Strategy

- **Unit tests**: Core utilities (encryption, validation, analytics).
- **Integration tests**: Store + IndexedDB persistence.
- **E2E tests**: Critical flows:
  - Create/edit/delete pain entry.
  - Refresh and verify persistence.
  - Generate export.

Testing tools: Vitest + Playwright.

---

## 10. Roadmap (High-Level)

- Emotional metrics with more nuanced scoring.
- Advanced analytics (trigger correlations, flare prediction).
- Optional clinician reports.
- Optional sync / backup mechanisms (user-controlled, privacy-preserving).

---

This document is a living overview. See the roadmap in README.md or GitHub Issues for current priorities.