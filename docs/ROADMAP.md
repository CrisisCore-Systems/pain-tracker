# Pain Tracker - Product Roadmap

_Last Updated: 2025-11-13_  
_Current Version: v0.1.0-beta_  
_Target: v0.2.0 by 2025-12-15_

---

## 🎯 Vision

Pain Tracker is a **privacy-first, local-only PWA** for chronic pain management with WorkSafeBC compliance. This roadmap focuses on **locking down MVP functionality** before adding aspirational features.

---

## 📊 Current State Assessment

### ✅ What Exists (Verified)
- Modern stack: React 18 + TypeScript + Vite
- Zustand state management infrastructure
- Component library (Tailwind CSS)
- Testing infrastructure (Vitest + Playwright)
- PWA setup (service workers, manifest)
- Security tooling (encryption workers, CSP config)

### ⚠️ What Needs Verification (Audit Phase)
- Core state management (painStore CRUD)
- IndexedDB persistence layer
- Encryption service implementation
- Zod validation schemas
- WorkSafeBC export functionality
- Offline-first capabilities

### 🚫 What's NOT in v0.2.0
- Machine learning / AI predictions
- FHIR integration
- Multi-tenancy
- Cloud sync
- Enterprise features

---

## 🗓️ Release Timeline

```
v0.1.0-beta (Current)  →  v0.2.0 (Target: Dec 15, 2025)
      ↓
Phase 1A: Audit MVP Spine (Weeks 1-2)
Phase 1B: Lock Empathy Engine (Weeks 2-3)
Phase 1C: WCB Export MVP (Weeks 3-4)
Phase 2:  Security Hardening (Weeks 5-6)
Phase 3:  Testing Pyramid (Weeks 7-8)
```

---

## Phase 1A: Audit MVP Spine (Weeks 1-2)

**Goal:** Verify that claimed features actually work.

### Issues:
- **#TBD: Audit Core State Management**
  - Verify `painStore.ts` exists with full CRUD
  - Test getFilteredEntries(), getAnalytics(), getWCBReport()
  - Confirm Immer integration
  - **Priority:** P0 | **Effort:** 4h

- **#TBD: Audit Data Persistence**
  - Find IndexedDB service (Dexie or custom)
  - Verify object stores: painEntries, settings
  - Test write → read → update cycle
  - Benchmark query performance (<50ms for 1000 entries)
  - **Priority:** P0 | **Effort:** 6h

- **#TBD: Audit Encryption Implementation**
  - Locate encryption service
  - Verify Web Crypto API (NOT CryptoJS)
  - Test AES-GCM + PBKDF2 (100k iterations)
  - Confirm Web Worker usage
  - **Priority:** P0 | **Effort:** 6h

- **#TBD: Audit Validation Layer**
  - Find all Zod schemas in src/schemas/
  - Verify painEntry schema coverage
  - Test validation error messages
  - **Priority:** P0 | **Effort:** 3h

---

## Phase 1B: Lock Empathy Engine (Weeks 2-3)

**Goal:** Ship honest, rule-based emotional analysis (no fake ML).

### Issues:
- **#TBD: Implement Basic Emotional Analysis**
  - Create `src/services/emotionalAnalysis.ts`
  - Keyword-based crisis detection
  - 4-state sentiment (positive, neutral, negative, crisis)
  - Unit tests for edge cases
  - **Priority:** P1 | **Effort:** 8h

- **#TBD: Crisis Response UX**
  - Design non-patronizing crisis message
  - Show BC Crisis Centre: 1-800-784-2433
  - Add "I'm safe, dismiss" option
  - Never block entry submission
  - **Priority:** P1 | **Effort:** 4h

---

## Phase 1C: WorkSafe BC Export (Weeks 3-4)

**Goal:** Generate structured reports aligned to WorkSafeBC Form 8.

### Issues:
- **#TBD: WCB Report Structure**
  - Create `src/features/wcb-export/`
  - Define WCBReport type
  - Date range filtering
  - Pain narrative generation
  - Trend calculation (avg, peak, direction)
  - **Priority:** P1 | **Effort:** 10h

- **#TBD: Export to PDF**
  - Add jsPDF or similar (check bundle size)
  - Simple template (no fancy form replication)
  - Include disclaimer: "For WorkSafeBC reference only"
  - Test 30-day, 90-day ranges
  - **Priority:** P1 | **Effort:** 6h

- **#TBD: CRITICAL - Legal Review Prep**
  - Draft disclaimer text
  - Check form mimicry safety
  - Document "structured summary" vs "official form"
  - Update SECURITY.md
  - **Priority:** P0 | **Effort:** 2h

---

## Phase 2: Security Hardening (Weeks 5-6)

**Goal:** Production-ready security posture.

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

## Phase 3: Testing Pyramid (Weeks 7-8)

**Goal:** 80%+ coverage, critical flows validated.

### Issues:
- **#TBD: Unit Test Coverage**
  - Target: 80%+ for src/utils/, src/services/
  - All encryption functions tested
  - All validation schemas tested
  - Store actions tested
  - **Priority:** P1 | **Effort:** 12h

- **#TBD: Integration Tests**
  - painStore + IndexedDB persistence
  - Encryption service + storage
  - Form submission → storage → retrieval
  - **Priority:** P1 | **Effort:** 8h

- **#TBD: E2E Critical Flows**
  - Create pain entry → verify saved
  - Edit entry → verify updated
  - Delete entry → verify removed
  - Export WCB report → verify PDF
  - Offline mode → create entry → sync
  - **Priority:** P1 | **Effort:** 10h

---

## 📈 Success Metrics (v0.2.0)

| Metric | Target | Current |
|--------|--------|---------|
| **Core Features Working** | 100% | TBD (audit pending) |
| **Test Coverage** | 80%+ | TBD |
| **Security Audit** | 0 high/critical vulns | TBD |
| **Bundle Size** | <500KB (gzipped <120KB) | TBD |
| **Lighthouse PWA Score** | 95+ | TBD |
| **Accessibility** | WCAG 2.1 AA | TBD |

---

## 🚫 Out of Scope (Post-v0.2.0)

These features are **explicitly deferred** to future versions:

### v0.3.0+ (Q2 2026)
- Machine learning pain predictions
- Natural language processing for notes
- Advanced trigger correlation analytics
- FHIR integration for EHR systems
- Medication interaction warnings

### v1.0.0+ (Q3 2026)
- Multi-tenancy for clinics/hospitals
- Optional cloud sync (self-hosted)
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

**This is a living document. Last audit: 2025-11-13**