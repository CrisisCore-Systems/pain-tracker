# Pain Tracker – Architecture Overview

_Last updated: 2026-01-09_

## 1. Purpose

Pain Tracker is a **local-first, privacy-first** PWA for tracking chronic pain and exporting claim-ready reports (with a focus on **WorkSafeBC** forms).  
All data stays on the user's device. No backend. No analytics. No dark patterns.

---

## 2. High-Level Architecture

### Privacy-First Data Flow

Our architecture ensures your health data never leaves your device without your explicit action:

<p align="center">
  <img src="diagrams/privacy-first-flow.svg" alt="Privacy-First Data Flow" width="600" />
</p>

**Key Principles:**
- **Local-First**: All data storage happens exclusively in the browser's IndexedDB
- **Zero-Knowledge**: Client-side encryption means we never have access to your data
- **User-Controlled**: Only YOU decide when to export data for clinical or claims purposes
- **No Third Parties**: No cloud servers, no analytics, no data sharing, no tracking

[View detailed comparison with traditional health apps →](diagrams/data-flow-comparison.svg)

### Technical Stack

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

## 4. Empathy Intelligence Engine

The **Empathy Intelligence Engine** provides context-aware feedback without sending data to the cloud.

- **Purpose**: Detect crisis patterns, validate user pain, and suggest local interventions.
- **Mechanism**:
  - **Local Heuristics**: Analyzes recent entry velocity, severity spikes, and emotional keywords.
  - **Privacy**: Differential privacy noise is injected into aggregated metrics before they are displayed or stored in local analytical summaries.
  - **Crisis Detection**: Identifies patterns matching clinical definitions of "flare-up" or "crisis" and triggers local UI adaptions (e.g., simplifying the interface).

---

## 5. State Management

### 5.1 painStore

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

## 6. Persistence Layer

### 5.1 IndexedDB

Object stores:
- `painEntries`: id, timestamp, painLevel, location*
- `settings`: key

All sensitive data is stored encrypted (see below).

Batch operations are used where possible (e.g. bulk add/import).

---

## 7. Security Design

### 7.1 Threat Model

Single-user app on personal devices.

No server → no remote compromise of a central database.

Main risks:
- Device theft.
- Shoulder-surfing / casual access.
- Browser storage inspection.

### 7.2 Encryption

- **Algorithm**: AES-GCM (256-bit).
- **Key derivation**: PBKDF2-HMAC-SHA256 with configurable iterations.
- Keys derived from user passphrase, never stored in plaintext.

High-level flow:
1. User provides passphrase.
2. Key is derived via PBKDF2 (with per-user salt).
3. Pain entries are serialized and encrypted.
4. Ciphertext + IV + salt are stored in IndexedDB.

### 7.3 Content Security Policy (CSP)

- `default-src 'self'`
- `frame-ancestors 'none'` (no embedding)
- `object-src 'none'`
- Images/fonts/scripts restricted to self (and minimal required exceptions for dev).

---

## 8. PWA Architecture

- Service worker pre-caches the app shell.
- Pain entries are stored in IndexedDB and remain available offline.
- The app can be installed to home screen on supported devices.
- Updates:
  - New versions are detected and the user is prompted to reload.

---

## 9. Reporting & WorkSafeBC Integration

Pain Tracker generates a structured summary suitable for manual transcription into WorkSafeBC forms (6/7/8) and a PDF export with:

- Time-bounded pain log.
- Trend summary (average/peak over the selected period).
- Activity limitations snapshot.
- Free-text narrative of pain progression.

> Note: Direct, official form replication may require legal review; current implementation focuses on helpful summaries aligned to WorkSafeBC requirements.

---

## 10. Testing Strategy

- **Unit tests**: Core utilities (encryption, validation, analytics).
- **Integration tests**: Store + IndexedDB persistence.
- **E2E tests**: Critical flows:
  - Create/edit/delete pain entry.
  - Refresh and verify persistence.
  - Generate export.

Testing tools: Vitest + Playwright.

---

## 11. Roadmap (High-Level)

- Emotional metrics with more nuanced scoring.
- Advanced analytics (trigger correlations, flare prediction).
- Optional clinician reports.
- Optional sync / backup mechanisms (user-controlled, privacy-preserving).

---

This document is a living overview. See the roadmap in README.md or GitHub Issues for current priorities.