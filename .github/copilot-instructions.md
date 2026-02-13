# 🤖 Pain Tracker — AI Agent Instructions

> **Version 2.4** | Last Updated: **2025-12-18** | **Confidence Level**: High
> **Primary dev environment**: **Windows + Visual Studio Code + PowerShell terminal**

---

## 🎯 Executive Summary

**What**: A **security-first, offline-first** chronic pain tracking app designed for **clinical-grade exports** and **WorkSafeBC workflows**, with **trauma-informed** UX and accessibility as a first-class constraint.

**Why**: Most pain apps optimize for extraction. PainTracker optimizes for **autonomy, privacy, and psychological safety** while still producing data clinicians can actually use.

**How**: React 18 + TypeScript + Zustand + Immer + Zod + IndexedDB + encryption + CSP + robust exports, with local-only analytics/correlations.

**Non-negotiables**:

1. **Local-first** (no cloud dependency)
2. **No Class A telemetry by default** (any usage analytics must be explicit, minimized, and reviewed)
3. **Accessibility (WCAG 2.2 AA target)**
4. **Data minimization + auditability**
5. **No security-critical changes without human review**

---

## 🧭 Operating Rules (Read Once. Obey Always.)

### 🖥️ Shell & Command Compatibility

* **All commands must be PowerShell-compatible** (VS Code terminal).
* Do **not** provide bash-only commands (`export FOO=`, `/dev/null`, `sed/grep` assumptions, etc.).
* Prefer explicit PowerShell patterns:

  * Env vars: `$env:VITE_REACT_APP_ENABLE_VALIDATION="true"`
  * Paths: `.\scripts\tool.ps1`, `.\src\...`

### 🧨 Hard Stops (Ask Human Before Proceeding)

Stop immediately and ask for review if your change touches **any** of the following:

* Encryption, key handling, unlock flows, storage of secrets
* Any code that reads/writes **Class A** data (defined below) in new ways
* Export/report generation formats (PDF/CSV/JSON) or claim language
* CSP, service worker, caching/security headers
* Anything that introduces **network calls**, telemetry, 3rd-party SDKs, remote logging, or analytics services
* Any changes to crisis logic, panic mode, or empathy heuristics

### ✅ “Safe Work” Default

If you’re not sure whether something is security-critical: **treat it as security-critical**.

---

## 🔍 Decision Framework

```
New Feature/Task?
├── Security/crypto/auth/storage? → STOP (human review)
├── Touches health data (Class A)? → Audit trail + minimization + tests
├── UI/UX change? → Trauma-informed + a11y checks
├── Core logic? → Add/adjust tests + regression checks
└── Docs/visual refactors? → Allowed if no behavior changes
```

---

## 🧠 Data Classification & Handling Rules

### Data Classes

* **Class A (Highly sensitive / health data)**
  Pain entries, symptoms, meds, mood, free-text notes, attachments, exports/reports, identifiers.
* **Class B (Sensitive operational)**
  Audit events, security events, error traces (when they may contain identifiers), feature flags.
* **Class C (Non-sensitive)**
  UI preferences, theme settings, layout settings (unless tied to identity).

### Hard Rules

* **Class A never leaves the device** by default. No remote logs containing Class A. Third-party analytics must not receive Class A content by default.
* Do not log raw notes, export content, or anything that reconstructs entries.
* Store only what the feature strictly needs. If unsure: store less.

---

## 🛡️ Threat Model Snapshot

### We actively defend against

* Lost/stolen device (at-rest protection + locked sessions)
* XSS within our origin (CSP + safe coding + minimizing secret exposure)
* Malicious browser extensions (limit plaintext exposure; treat as elevated risk)
* Shoulder-surfing + coercive dynamics (panic mode, user control, minimal friction)
* Accidental oversharing via exports (clear controls + defaults + warnings)

### We do **not** claim to solve

* Compromised OS / malware / root-level compromise
* User-installed spyware
* Physical coercion beyond in-app safety controls

**No security copy should imply otherwise.**

---

## 🏗️ Architecture & Mental Models

### Core Principles

**1) Security-first**

* Least privilege, defense-in-depth, minimize plaintext lifetime in memory.
* Treat any new data surface as hostile until proven safe.

**2) Trauma-informed UX**

* Reduce cognitive load, offer control, avoid blame language.
* Keep “panic mode” reliable, fast, and accessible.

**3) Clinical usefulness without surveillance**

* Exports should be clean, consistent, and defensible.
* Correlation features must be **local-only** unless explicitly re-architected and approved.

### Tech Stack

| Layer      | Tech                | Purpose           | Critical Patterns                        |
| ---------- | ------------------- | ----------------- | ---------------------------------------- |
| UI         | React 18 + TS       | Components        | a11y-first, trauma-informed patterns     |
| State      | Zustand + Immer     | Predictable state | immutable updates, UI/data separation    |
| Validation | Zod                 | Integrity         | schema-first, defensive parsing          |
| Storage    | IndexedDB           | Persistence       | versioned schema, migrations, resilience |
| Security   | Encryption + CSP    | Protection        | audited boundaries, no secret leakage    |
| Testing    | Vitest + Playwright | Confidence        | regression coverage + a11y checks        |
| Build      | Vite + Makefile     | workflow          | consistent commands + security headers   |

### Data Flow (Local-Only by Design)

```
User input
  ↓ (Zod validation)
Normalized entry
  ↓ (empathy heuristics / crisis checks)
State update (Zustand/Immer)
  ↓ (encryption boundary)
IndexedDB persistence
  ↓ (local workers)
Local analytics + correlations (NO network)
  ↓ (export boundary)
WCB / clinical exports (user-controlled)
```

---

## 🧷 Security-Critical Code Boundary (Human Review Required)

Treat these as **red zones**:

* `src/services/EncryptionService.ts` (and any key derivation/key storage)
* Any “vault”, “unlock”, “session key”, “passphrase” logic
* Storage adapters that persist encrypted payloads
* Export/report pipeline (PDF/CSV/JSON) and templates
* CSP/security headers generation
* Service worker caching rules
* Anything introducing fetch/XHR/websocket, telemetry, or 3rd-party SDKs

---

## 🛠️ Development Workflows (PowerShell)

### Environment Setup

```powershell
# First time
make setup
make doctor

# Daily loop
make dev
make test
make check
```

### Feature Flags / Env Vars (Vite + PowerShell)

```powershell
# Enable validation tech (session-only env var)
$env:VITE_REACT_APP_ENABLE_VALIDATION="true"; npm run dev
```

Notes:
- `VITE_REACT_APP_ENABLE_VALIDATION`: used by most validation UI integration points (default enabled unless set to `'false'`).
- `VITE_ENABLE_VALIDATION_TECH`: used by the main `PainTracker` module (default enabled unless set to `'false'`).
- `VITE_ENABLE_ANALYTICS`: enables the analytics subsystems (default disabled unless set to `'true'`).

> Rule: If you introduce a new flag, it must be `VITE_*` and documented here.

### Quality Gates

```powershell
make lint-fix
make typecheck
npm run security-full
```

### Tests

```powershell
make test
npm run test:coverage
npm run e2e
npm run accessibility:scan
```

---

## 📋 Implementation Patterns

### Zustand + Immer (Immutable Updates Only)

✅ DO:

```ts
export const usePainTrackerStore = create<PainTrackerState>()(
  immer((set) => ({
    addEntry: (entryData) => set((state) => {
      state.entries.push({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...entryData
      });
    })
  }))
);
```

❌ DON’T:

```ts
usePainTrackerStore.getState().entries.push(newEntry); // never
```

---

## 🧾 Audit Logging Rules (Minimal + Non-Reconstructive)

**Audit intent**: prove “what happened” without capturing sensitive content.

✅ DO log:

* action type, resource type, resource id (if safe), outcome, timestamp
* counts/flags (e.g., “exported 12 entries”) — not the entries

❌ NEVER log:

* free text notes
* export contents
* identifiers unnecessarily
* any key material / passphrases / derived secrets

Example:

```ts
await complianceAuditService.logAuditEvent({
  actionType: 'create' | 'read' | 'update' | 'delete',
  resourceType: 'PainEntry' | 'UserData' | 'Report',
  outcome: 'success' | 'failure',
  details: { entryCount: 1 } // keep coarse
});
```

---

## 🔐 Encryption & Key Handling (Documentation Discipline)

This project uses encryption to protect **Class A** at rest.
Because crypto details are easy to misstate:

* Never claim “secure localStorage for keys.” If keys touch storage, it must be **explicitly documented** and treated as high risk.
* Any change to key derivation, key storage, rotation, or unlock flows is a **hard stop** requiring human review.
* If you’re updating docs: describe what the code actually does, not what you wish it did.

---

## 🧩 UI/UX Standards (Trauma-Informed + Accessible)

### Minimum bar for any UI change

* Keyboard reachable controls
* Visible focus state
* Clear error messages (no blame language)
* Touch targets remain usable
* Motion/visual intensity respects preferences (where applicable)

Example pattern:

```ts
const { preferences } = useTraumaInformed();
<Button size={preferences.touchTargetSize}>
  {preferences.gentleLanguage ? 'Save' : 'Save'}
</Button>
```

---

## 🚨 Error Handling Standard

* UI must reflect failure states cleanly.
* Errors must be non-shaming.
* Logs must never contain Class A content.

```ts
try {
  await sensitiveOperation(data);
} catch (err) {
  const message = (err as Error).message;
  setError(message);

  await securityService.logEvent({
    type: 'error',
    level: 'error',
    message,
    metadata: { operation: 'sensitiveOperation' }
  });

  if (isDataOperation) {
    await complianceAuditService.logAuditEvent({
      actionType: 'operation',
      resourceType: 'Data',
      outcome: 'failure',
      details: { reason: 'operation_failed' }
    });
  }
}
```

---

## 🔬 Critical Systems Deep Dive

### Empathy Intelligence Engine

* Heuristic-based (not ML).
* Treat modifications as high-risk UX changes: regressions here harm real people.

### Trauma-Informed Accessibility System

* Provider must wrap the app.
* Preferences must reliably apply across routes and modals.

### Validation Technology Integration

**Enable (PowerShell + Vite):**

```powershell
$env:VITE_REACT_APP_ENABLE_VALIDATION="true"; npm run dev
```

**Read in code**: `import.meta.env.VITE_REACT_APP_ENABLE_VALIDATION` and `import.meta.env.VITE_ENABLE_VALIDATION_TECH`

---

## 🧰 Troubleshooting (High-Frequency Failures)

**Tests failing due to crypto mocks**
→ Verify `src/test/setup.ts` mocks and run `make test`

**Preferences not applying**
→ Confirm `TraumaInformedProvider` wraps root

**Validation not showing**
→ Confirm `$env:VITE_REACT_APP_ENABLE_VALIDATION="true"` (and/or `VITE_ENABLE_VALIDATION_TECH`) and code reads `import.meta.env`

**Security audit failures**
→ Run `npm run security-full` and fix high severity first

---

## 📊 Implementation Status & Roadmap

### Snapshot (2025-12-10)

| System                   | Status | Confidence | Notes                        |
| ------------------------ | -----: | ---------: | ---------------------------- |
| Empathy Engine           |      ✅ |       High | heuristic + tested           |
| Trauma-Informed UI       |      ✅ |       High | preferences + crisis support |
| Accessibility Phase 1.5  |      ✅ |       High | WCAG 2.2 AA components       |
| Panic Mode               |      ✅ |       High | integrated + verified        |
| Validation Tech          |      ✅ |       High | integrated                   |
| Security Architecture    |      ✅ |       High | multi-layer                  |
| WorkSafeBC Export        |      ✅ |       High | CSV/JSON/PDF + preview       |
| PWA                      |      ✅ |       High | cache-first                  |
| Weather Correlation      |      ✅ |       High | Open-Meteo                   |
| Analytics Visualizations |      ✅ |       High | extended fields              |

### Next Priorities

1. Advanced visualizations (heatmaps, correlations) — **local-only**
2. Pattern recognition — heuristics-first; ML only if local-only + approved
3. EMR/EHR integration — privacy architecture + explicit consent required

---

## 🧾 Change Tracking

```markdown
## Version 2.4 (2025-12-18)
- ✅ Enforced PowerShell + VS Code terminal command compatibility
- ✅ Hardened “hard stop” boundaries (network/telemetry/exports/crypto/CSP/SW)
- ✅ Added explicit data classification (Class A/B/C) + hard rules
- ✅ Added threat model snapshot + “no false security claims”
- ✅ Standardized WCAG target: 2.2 AA
- ✅ Reframed compliance wording to “privacy-aligned security controls” (not legal compliance claim)
- ✅ Clarified local-only analytics/correlations (no network)
- ✅ Tightened audit logging rules (minimal, non-reconstructive)
```

---

## 🤝 Working With Humans (How to Communicate Changes)

When you propose work:

* Reference exact files + functions
* Explain risks (privacy, safety, accessibility)
* Provide test evidence
* Provide rollback plan for risky UX changes

**Before you present changes:** run `make check`.

---

*This document is maintained by the development team. For questions or suggestions, create an issue or PR.*
