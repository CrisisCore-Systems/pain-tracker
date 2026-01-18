# Pain Tracker - Product Roadmap

See also: `docs/planning/PAIN_TRACKER_PRO_ACTION_PLAN.md` (maps external requirements to repo reality + risk gates).

_Last Updated: 2025-12-24_  
_Current Version: v1.1.2_  
_Target: TBD_

---

## 🎯 Vision

Pain Tracker is a **privacy-first, local-only PWA** for chronic pain management with WorkSafeBC workflows. This roadmap focuses on **enhancing analytics and pattern recognition** while maintaining strict privacy.

---

## 📊 Current State Assessment

### ✅ What Exists (Verified v1.1.2)
- Modern stack: React 18 + TypeScript + Vite
- Zustand state management infrastructure
- Component library (Tailwind CSS)
- Testing infrastructure (Vitest + Playwright)
- PWA setup (service workers, manifest)
- Security tooling (encryption workers, CSP config)
- **FHIR R4 Clinical Exports** (Interoperability)
- **Advanced Local Analytics** (Location Heatmaps, Time Patterns)

### ✅ What's Been Verified (Audit Complete)
- Core state management: `pain-tracker-store.ts` with full CRUD operations
- IndexedDB persistence: Custom wrapper in `src/lib/offline-storage.ts`
- Encryption service: `src/services/EncryptionService.ts` (AES-GCM + PBKDF2)
- Zod validation schemas: `src/types/pain-entry.ts` with comprehensive schemas
- WorkSafeBC export: `src/utils/pain-tracker/wcb-export.ts` (implemented; validate)
- Offline-first capabilities: Service worker + IndexedDB sync queue
- **Clinical Integration**: FHIR R4 mapping in `src/services/clinical/FhirMapper.ts`
- **Analytics Service**: Centralized aggregation logic in `src/services/PainAnalyticsService.ts`

### 🚫 What's NOT in v1.1.2
- Machine learning / AI predictions (Scheduled for Q1 2026)
- Multi-tenancy
- Enterprise features

---

## 🗓️ Release Timeline

```
v1.0.0  →  v1.1.2 (Current)
      ↓
Phase 1: Stable Release ✅ COMPLETE
Phase 2: Security Hardening & Testing ✅ COMPLETE
Phase 3: Clinical Integration & Advanced Analytics ✅ COMPLETE
Phase 4: ML Pattern Recognition (In Planning)
```

---

## Phase 1A: Audit MVP Spine ✅ COMPLETE

**Goal:** Verify that claimed features actually work.

**Status:** All audit items verified and documented.

### Issues:
- **✅ COMPLETE: Audit Core State Management**
  - `src/stores/pain-tracker-store.ts` (550 lines) with full CRUD
  - Actions: addEntry, updateEntry, deleteEntry, plus mood/fibromyalgia support
  - Immer integration via zustand/middleware/immer
  - Analytics and reporting built-in
  - **Status:** Complete

- **✅ COMPLETE: Audit Data Persistence**
  - Custom IndexedDB wrapper: `src/lib/offline-storage.ts`
  - Object stores: painEntries, settings, sync-queue
  - Write → read → update cycle verified
  - Integration tests in `src/test/integration/encryption-indexeddb.test.ts`
  - **Status:** Complete

- **✅ COMPLETE: Audit Encryption Implementation**
  - `src/services/EncryptionService.ts` (1048 lines)
  - Web Crypto API with AES-GCM + PBKDF2 (150k iterations)
  - Key derivation with proper salt handling
  - Integration tested in `src/test/integration/encryption-indexeddb.test.ts`
  - **Status:** Complete

- **✅ COMPLETE: Audit Validation Layer**
  - Primary schemas in `src/types/pain-entry.ts`
  - Legacy re-exports in `src/schemas/painEntry.ts`
  - Full PainEntry schema with nested objects (Treatment, Medication, BaselineData, etc.)
  - Validation integrated with react-hook-form via @hookform/resolvers
  - **Status:** Complete

---

## Phase 1B: Lock Empathy Engine ✅ COMPLETE

**Goal:** Ship honest, rule-based emotional analysis (no fake ML).

**Status:** Implemented with heuristic-based analysis, crisis detection, and support resources.

### Issues:
- **✅ COMPLETE: Emotional Analysis Implementation**
  - `src/services/EmotionalValidationService.tsx` - EmotionalAnalysisService class
  - `src/services/EmpathyIntelligenceEngine.ts` - Advanced heuristics
  - `src/components/accessibility/useCrisisDetection.ts` - Crisis detection hook
  - Crisis state management with support resources
  - Tested in `src/services/__tests__/EmpathyIntelligenceEngine.test.ts`
  - **Status:** Complete

- **✅ COMPLETE: Crisis Response UX**
  - Panic mode in `ModernAppLayout.tsx` with gentle messaging
  - Crisis resources in `src/lib/therapeutic-resources.ts`
  - Emergency contacts: 911, 988 (US Crisis Lifeline)
  - Dismissible crisis UI with user agency
  - Crisis state management via `CrisisModeContext.ts`
  - **Status:** Complete

---

## Phase 1C: WorkSafe BC Export (Weeks 3-4) ✅ COMPLETE

**Goal:** Generate structured reports aligned to WorkSafeBC Form 8.

**Status:** Completed December 8, 2025

### Completed:
- ✅ **WCB Report Structure** - `src/utils/pain-tracker/wcb-export.ts`
  - Professional PDF generation with jsPDF
  - Executive summary with key metrics
  - Date range filtering
  - Pain trend analysis and severity classification
  - Functional and work impact documentation
  - 98.8% test coverage (22 tests)

- ✅ **Export to PDF** - Full implementation
  - Multi-page support with headers/footers
  - Patient info and claim number fields
  - Clinical recommendations section
  - Professional formatting and styling

- ✅ **Legal Disclaimer**
  - "For WorkSafeBC reference only" disclaimer included
  - Clear statement: "does not constitute medical advice"
  - Not affiliated with WorkSafe BC notice

---

## Phase 2: Security Hardening (Weeks 5-6)

**Goal:** Security hardening posture (validate in deployment).

### Issues:
- **#TBD: Content Security Policy**
  - Verify CSP headers in vite.config.ts
  - Test in production build
  - No unsafe-inline in production
  - Document exceptions
  - **Priority:** P0 | **Effort:** 4h

- **#TBD: Encryption Audit**
  - Confirm no plaintext passphrase storage
  - Test key derivation randomness
  - Verify IV uniqueness per entry
  - Add passphrase strength meter
  - Test session timeout
  - **Priority:** P0 | **Effort:** 6h

- **#TBD: Dependency Security**
  - Run npm audit (target: 0 high/critical)
  - Add Snyk or Dependabot
  - Document security policy
  - Add SECURITY.md contact method
  - **Priority:** P0 | **Effort:** 3h

---

## Phase 3: Testing Pyramid ✅ TARGET EXCEEDED

**Goal:** 80%+ coverage, critical flows validated.

**Status:** Coverage and unit test counts are tracked via repo badges and updated by hooks.

### Issues:
- **✅ COMPLETE: Unit Test Coverage**
  - Target: 80%+ overall coverage (met/exceeded)
  - Test counts vary as the suite evolves; see `badges/` for current counts
  - Key coverage: wcb-export.ts (98.8%), trending.ts (100%), calculations.ts (98.14%)
  - All encryption functions tested in multiple test files
  - Validation schemas tested via integration tests
  - **Status:** Target exceeded

- **✅ COMPLETE: Integration Tests**
  - `src/test/integration/encryption-indexeddb.test.ts` - Storage + encryption
  - Store actions tested in `src/test/stores/` directory
  - Form submission tested in component tests
  - **Status:** Complete

- **🟡 IN PROGRESS: E2E Critical Flows**
  - Playwright infrastructure in place (`e2e/` directory)
  - Basic flows covered
  - Remaining: Full offline sync E2E test
  - **Priority:** P1 | **Effort:** 4h remaining

---

## Phase 3: Clinical Integration & Advanced Analytics ✅ COMPLETE

**Goal:** Bridge the gap between patient tracking and clinical systems, plus actionable data visibility.

**Status:** Completed January 10, 2026

### Issues:
- **✅ COMPLETE: Clinical Data Exchange (FHIR R4)**
  - `src/services/clinical/FhirMapper.ts` - Bidirectional mapping
  - Supports `Condition`, `Observation`, `MedicationStatement` resources
  - Validated against HL7 FHIR R4 standard
  - JSON download verified
  - **Status:** Complete

- **✅ COMPLETE: Integrated Analytics Dashboard**
  - **Location Heatmap**: Refactored to service-layer aggregation (`src/services/PainAnalyticsService.ts`)
  - **Time-of-Day Analysis**: Heatmap for temporal pattern recognition
  - **Medication Effectiveness**: Bar/Line chart correlation
  - **Activity Impact**: Functional limit correlation
  - All charts integrated into `AdvancedAnalyticsDashboard.tsx`
  - **Status:** Complete

---

## 📈 Success Metrics (v1.1.0)

| Metric | Target | Current |
|--------|--------|---------|
| **Core Features Working** | 100% | ✅ Verified (Phases 1-3) |
| **Test Coverage** | 80%+ | ✅ **90.82%** (Stable) |
| **Security Audit** | 0 high/critical vulns | Run `npm audit` |
| **Bundle Size** | <500KB (gzipped <120KB) | Check `npm run build` |
| **Lighthouse PWA Score** | 95+ | Pending audit |
| **Accessibility** | WCAG 2.1 AA | ✅ **WCAG 2.2 AA** (exceeded) |

---

## 🚫 Out of Scope (Post-v1.1.0)

These features are **explicitly deferred** to future versions:

### v1.2.0+ (Q2 2026)
- Machine learning pain predictions
- Natural language processing for notes
- Medication interaction warnings

### v2.0.0+ (Q3 2026)
- Multi-tenancy for clinics/hospitals
- Provider portal for patient monitoring
- Clinical trial matching

---

## 🛠️ How to Use This Roadmap

1. **Issues will be created** via `setup-roadmap.sh` script
2. **Track progress** on GitHub Project Board: "Pain Tracker v0.2.0"
3. **CI checks** run automatically via `.github/workflows/mvp-audit.yml`
4. **Weekly reviews** on Fridays to adjust priorities

---

## 📞 Questions?

- **Technical questions:** Open a GitHub Discussion
- **Security concerns:** See SECURITY.md
- **Feature requests:** Check this roadmap first, then open an issue tagged `p2-future`

---

**This is a living document. Last audit: 2025-12-08**

---

## 📋 Audit Summary (December 8, 2025)

### Verified Components
| Component | File Location | Status |
|-----------|---------------|--------|
| State Management | `src/stores/pain-tracker-store.ts` | ✅ 550 lines, full CRUD |
| IndexedDB | `src/lib/offline-storage.ts` | ✅ 693 lines, custom wrapper |
| Encryption | `src/services/EncryptionService.ts` | ✅ 1048 lines, Web Crypto |
| Validation | `src/types/pain-entry.ts` | ✅ Comprehensive Zod schemas |
| WCB Export | `src/utils/pain-tracker/wcb-export.ts` | See current test results |
| Crisis Detection | `src/components/accessibility/useCrisisDetection.ts` | ✅ Integrated |
| Empathy Engine | `src/services/EmpathyIntelligenceEngine.ts` | ✅ Heuristic-based |

### Test Metrics
- **Tests/Coverage:** See current test output and `badges/coverage-badge.json`
- **Accessibility:** WCAG 2.2 AA target