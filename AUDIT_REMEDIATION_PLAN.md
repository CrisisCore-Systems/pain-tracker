# Audit Remediation Plan

**Project:** Pain Tracker  
**Date Created:** December 13, 2024  
**Owner:** Development Team  
**Status:** 🟡 In Progress (see Current Verification)

## Current Verification (as of January 6, 2026)

The items below were re-verified in the local dev environment (Windows + PowerShell) and are currently passing:

- TypeScript project build: `npm run -s tsc-build` ✅
- TypeScript typecheck (CI): `npm run -s typecheck:ci` ✅
- Unit tests (full): `npm run -s test -- --run` ✅ (147 files passed; 860 tests passed; 1 skipped)
- Lint: `npm run -s lint` ✅
- Dependency audit (moderate+): `npm audit --audit-level=moderate` ❌ (2 critical vulnerabilities in `jspdf`)

  - Advisory: jsPDF Local File Inclusion / Path Traversal (GHSA-f8cm-6447-x5h2)
  - Fix requires a breaking upgrade to `jspdf@4` (and compatible `jspdf-autotable`)
  - This touches the PDF export boundary and needs human review + export regression checks

This plan remains useful as a backlog, but several “Critical” items have been completed since the original audit snapshot.

This document provides an actionable remediation plan based on the comprehensive project audit
completed on December 13, 2024. Issues are prioritized and grouped by urgency.

---

## Quick Action Summary

| Priority | Issues | Est. Time | Status                  |
| -------- | ------ | --------- | ----------------------- |
| Critical | 3      | 4-5 days  | ✅ Completed (verified) |
| High     | 3      | 1-2 weeks | 🟡 In Progress          |
| Medium   | 3      | 2-3 weeks | ⏳ Not Started          |
| Low      | 2      | 1 month   | ⏳ Not Started          |

---

## Critical Priority (Complete Within 1 Week)

### 1. Fix ESLint Configuration

**Issue ID:** AUDIT-001  
**Severity:** Critical  
**Impact:** Development workflow, code quality  
**Estimated Time:** 1-2 days  
**Assigned To:** TBD  
**Status:** ✅ Completed (verified 2026-01-04)

**Problem:**

- 3,737 linting issues (2,948 errors, 789 warnings)
- Most errors are from generated Playwright HTML reports in `e2e/results/`

**Action Items:**

- [x] Add ignore patterns for generated files to `eslint.config.js`
- [x] Add ignores for `e2e/results/`, `test-results/`, `playwright-report/`
- [x] Run `npm run lint` to verify reduction in errors (80.7% reduction achieved)
- [x] Fix remaining fixable issues with `npm run lint -- --fix`
- [x] Resolve remaining critical errors/warnings
- [x] Target achieved: Lint is clean in current environment

**Commands:**

```bash
# Auto-fix what's possible
npm run lint -- --fix

# Verify current count
npm run lint 2>&1 | tail -1

# Expected: ~33 errors, ~686 warnings = 719 total
# Target: <100 total
```

**Success Criteria:**

- Linting errors < 100
- All team members can run lint without seeing generated file errors
- CI/CD pipeline passes linting stage

**Verification (2026-01-04):** `npm run -s lint` ✅

---

### 2. Fix TypeScript Compilation Errors

**Issue ID:** AUDIT-002  
**Severity:** Critical  
**Impact:** Type safety, IDE experience  
**Estimated Time:** 1 day  
**Assigned To:** TBD  
**Status:** ✅ Completed (verified 2026-01-04)

**Problem:**

- 13 TypeScript compilation errors
- Build package dependencies not built
- Type mismatches in tests
- Invalid export format strings

**Action Items:**

#### 2.1 Fix Build Dependencies

- [x] Run `npm run build:packages` before type checking
- [x] Ensure package.json runs package builds before type checking
- [ ] Update CI/CD to build packages first (verify pipeline)

```bash
npm run build:packages
npm run typecheck
```

#### 2.2 Fix Test Type Mismatches (wcb-export.test.ts)

- [x] Resolved (no current TypeScript errors reported by `typecheck:ci`)

```typescript
// Example fix for line 77
- triggers: false,
+ triggers: [],

// Example fix for line 151
- painIntensity: false,
+ painIntensity: 0,
```

#### 2.3 Fix Export Format Type (wcb-export.ts)

- [x] Resolved (no current TypeScript errors reported by `typecheck:ci`)

```typescript
// Option 1: Update type
type ExportFormat = "json" | "csv" | "pdf" | "wcb-pdf";

// Option 2: Change string usage
- generateReport('wcb-pdf', ...)
+ generateReport('pdf', ...)
```

#### 2.4 Fix empathy-metrics-sanitization.test.ts

- [x] Resolved (no current TypeScript errors reported by `typecheck:ci`)

**Success Criteria:**

- Zero TypeScript compilation errors
- `npm run typecheck` passes
- All IDE type errors resolved

**Verification (2026-01-04):** `npm run -s tsc-build` ✅ and `npm run -s typecheck:ci` ✅

---

### 3. Fix Failing Tests

**Issue ID:** AUDIT-003  
**Severity:** Critical  
**Impact:** Test reliability, confidence in changes  
**Estimated Time:** 2-3 days  
**Assigned To:** TBD  
**Status:** ✅ Completed (verified 2026-01-04)

**Problem:**

- 14 test failures (mostly encryption-related)
- 1 unhandled error in Button component

**Action Items:**

#### 3.1 Fix Encryption Test Setup (10 failures)

**Files Affected:**

- `encryption-additional-gaps.test.ts`
- `encryption-compression.test.ts`
- `encryption-edge-cases.test.ts`
- `encryption-rle-status-gaps.test.ts`
- `encryption-webcrypto.test.ts`
- `encryption-indexeddb.test.ts`

**Root Cause:** Test environment not properly initializing encryption keys

- [x] Test harness provides required crypto/vault initialization
- [x] Encryption tests now pass in current environment

```typescript
// Example fix in test setup
beforeEach(async () => {
  // Properly initialize encryption service
  const service = new EndToEndEncryptionService();
  await service.initialize();
  // Store for test use
});
```

#### 3.2 Fix Security Service Test (1 failure)

**File:** `security-service.test.ts`

**Error:** `Failed to execute 'sign' on 'SubtleCrypto'`

- [x] Security service tests now pass in current environment

```typescript
// Fix buffer conversion
const data = new TextEncoder().encode(jsonData);
// Instead of passing string directly
```

#### 3.3 Fix Weekly Edge Case Test (1 failure)

**File:** `weeklyEdge.test.ts`

- [x] Weekly edge-case tests now pass in current environment

#### 3.4 Fix Button Component Timer Cleanup (1 unhandled error)

**File:** `Button.tsx` line 192

- [x] No unhandled Button timer error observed in current full test run

```typescript
useEffect(() => {
  const timerId = setTimeout(() => {
    setRipples(prev => prev.filter(r => r.id !== id));
  }, 600);

  return () => clearTimeout(timerId);
}, [id]);
```

**Success Criteria:**

- All 732 tests passing
- Zero unhandled errors
- Test suite completes without warnings

**Verification (2026-01-04):** `npm run -s test -- --run` ✅

---

## High Priority (Complete Within 2 Weeks)

### 4. Update Vulnerable Dependencies

**Issue ID:** AUDIT-004  
**Severity:** High  
**Impact:** Security, deployment reliability  
**Estimated Time:** 3-5 days  
**Assigned To:** TBD  
**Status:** 🔴 Blocked (requires breaking upgrade + human review)

**Problem:**

- `npm audit --audit-level=moderate` reports **2 critical** vulnerabilities in `jspdf`.
- `jspdf` is used by the PDF export/report pipeline, so dependency changes must be verified against real exports.

**Action Items:**

#### 4.1 Fix jsPDF vulnerability (export boundary)

- [ ] Review `jspdf@4` breaking changes
- [ ] Upgrade `jspdf` + `jspdf-autotable` to compatible versions
- [ ] Run tests that cover PDF generation
- [ ] Manually verify PDF outputs (WCB + report templates)

```bash
npm install jspdf@4.0.0 jspdf-autotable@5.0.7
npm run test
npm run build
```

#### 4.2 Run Automated Fixes

- [ ] Run `npm audit fix` for non-breaking updates
- [ ] Review changes in package-lock.json
- [ ] Run full test suite after updates

#### 4.3 Verify Remaining Vulnerabilities

- [ ] Run `npm audit` to check status
- [ ] Document any remaining vulnerabilities
- [ ] Create issues for unresolvable vulnerabilities

**Success Criteria:**

- High-severity vulnerabilities: 0
- Moderate vulnerabilities: ≤ 2 (dev dependencies only)
- All deployments working correctly

**Note:** Because this affects report/export generation, treat this as a security-critical change and require human review before merge.

---

### 5. Reduce TypeScript `any` Usage

**Issue ID:** AUDIT-005  
**Severity:** High  
**Impact:** Type safety, maintainability  
**Estimated Time:** 1 week  
**Assigned To:** TBD  
**Status:** ✅ Complete (active code)

**Problem:**

- Prior audit snapshot significantly over-counted `any` usage.
- Goal is to eliminate `any` from active runtime and unit-test code to preserve strict typing.

**Current Snapshot (2026-01-06):**

- `src/**/*.{ts,tsx}`: 0 `any` type usages (remaining matches are the English word in comments).
- `api/**/*.{ts,tsx}`: 0 `any` type usages.
- `e2e/**/*.{ts,tsx}`: 0 `any` type usages.
- Remaining `any` occurrences are confined to `archive/api-disabled/**` (archived code).

**Action Items:**

#### 5.1 API Handlers

- [x] Verified `api/**/*.{ts,tsx}` has no `any` type usage.

```typescript
// Before
function handler(req: any, res: any) { ... }

// After
interface ApiRequest extends Request {
  body: RequestBody;
  user: User;
}
function handler(req: ApiRequest, res: Response) { ... }
```

#### 5.2 Type Definitions

- [x] Verified `src/types/**/*` has no `any` type usage.

#### 5.3 Test Files

- [x] Updated E2E test glue to use `unknown`-based typings (no `any`).
- [ ] Optional: if archived code is re-enabled, re-audit and remove `any` there.

**Success Criteria:**

- Active code `any` usage: 0
- Archived-only `any` usage acceptable until/unless code is re-enabled

---

### 6. Bundle Size Optimization

**Issue ID:** AUDIT-006  
**Severity:** High  
**Impact:** Performance, user experience  
**Estimated Time:** 1 week  
**Assigned To:** TBD  
**Status:** ✅ Complete (initial-load optimization)

**Problem:**

- Public-route initial load was pulling in protected-route dependencies, inflating initial JS.
- `libsodium-wrappers-sumo` remains large (~356 KB gzipped) but is now deferred behind protected routes.

**Current Snapshot (2026-01-06, clean `npm run build`):**

- Entry chunk (`index-*.js`): ~61 KB gzipped
- `react-vendor`: ~176 KB gzipped
- Landing route chunk (`LandingPage-*.js`): ~21 KB gzipped
- CSS (`index-*.css`): ~36 KB gzipped
- Large deferred chunks (not required for landing):
  - `crypto-vendor`: ~357 KB gzipped
  - `pdf-vendor`: ~132 KB gzipped

**Action Items:**

#### 6.1 Implement Code Splitting

- [x] Implement route-based code splitting
- [x] Use `React.lazy()` for protected routes/components
- [x] Add loading fallbacks

```typescript
// Example route splitting
const PremiumAnalytics = lazy(() => import('./components/analytics/PremiumAnalyticsDashboard'));
const ReportsPage = lazy(() => import('./components/reports/ReportsPage'));
```

#### 6.2 Configure Manual Chunks

- [x] Add `manualChunks` to vite.config.ts
- [x] Split vendor bundles logically
- [x] Separate heavy libraries (crypto, PDF, i18n, icons)

```typescript
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-react': ['react', 'react-dom'],
        'vendor-charts': ['chart.js', 'recharts'],
        'vendor-crypto': ['libsodium-wrappers-sumo'],
        'vendor-pdf': ['jspdf', '@react-pdf/renderer'],
      }
    }
  }
}
```

#### 6.3 Evaluate libsodium Alternatives

- [ ] Analyze actual usage of libsodium features (security-critical; requires human review)
- [ ] Consider Web Crypto API only for some operations (security-critical; requires human review)
- [ ] Evaluate lighter alternatives (security-critical; requires human review)
- [ ] Create proof-of-concept (security-critical; requires human review)

#### 6.4 Fix Dynamic/Static Import Conflicts

- [x] Ensure consistent import strategy for offline/PWA modules to reduce build warnings

**Success Criteria:**

- Initial load (landing) < 300 KB gzipped
- Total page weight < 800 KB gzipped
- All dynamic imports working correctly
- Build warnings reduced to < 5

---

## Medium Priority (Complete Within 3 Weeks)

### 7. Code Quality Improvements

**Issue ID:** AUDIT-007  
**Severity:** Medium  
**Impact:** Maintainability, code cleanliness  
**Estimated Time:** 2 weeks  
**Assigned To:** TBD  
**Status:** ⏳ Not Started

**Action Items:**

- [ ] Remove ~80 unused variables
- [ ] Fix remaining linting warnings
- [ ] Add JSDoc comments to complex functions
- [ ] Improve inline code documentation

**Success Criteria:**

- Linting warnings < 100
- All exported functions have JSDoc comments

---

### 8. Test Coverage Enhancement

**Issue ID:** AUDIT-008  
**Severity:** Medium  
**Impact:** Quality assurance, confidence  
**Estimated Time:** 2 weeks  
**Assigned To:** TBD  
**Status:** ⏳ Not Started

**Action Items:**

- [ ] Achieve 95%+ coverage across all modules
- [ ] Add integration tests for key workflows
- [ ] Expand E2E test suite
- [ ] Add visual regression tests

**Success Criteria:**

- Overall coverage: 95%+
- No modules below 80% coverage
- All user flows have E2E tests

---

### 9. Performance Optimization

**Issue ID:** AUDIT-009  
**Severity:** Medium  
**Impact:** User experience, performance  
**Estimated Time:** 2 weeks  
**Assigned To:** TBD  
**Status:** ⏳ Not Started

**Action Items:**

- [ ] Implement lazy loading for routes
- [ ] Optimize re-renders with React.memo
- [ ] Add performance monitoring
- [ ] Implement request caching
- [ ] Optimize images and assets

**Success Criteria:**

- First Contentful Paint < 1.5s
- Time to Interactive < 3s
- Lighthouse Performance score > 90

---

## Low Priority (Complete Within 1 Month)

### 10. Documentation Enhancements

**Issue ID:** AUDIT-010  
**Severity:** Low  
**Impact:** Developer experience  
**Estimated Time:** 1 month  
**Assigned To:** TBD  
**Status:** ⏳ Not Started

**Action Items:**

- [ ] Add JSDoc API documentation
- [ ] Create component storybook
- [ ] Add video tutorials
- [ ] Create architecture diagrams update

---

### 11. Dependency Maintenance

**Issue ID:** AUDIT-011  
**Severity:** Low  
**Impact:** Security, maintenance  
**Estimated Time:** 1 month  
**Assigned To:** TBD  
**Status:** ⏳ Not Started

**Action Items:**

- [ ] Update all dependencies to latest stable
- [ ] Remove unused dependencies
- [ ] Audit and minimize dependency tree
- [ ] Set up Dependabot

---

## Progress Tracking

### Sprint 1 (Week 1)

- [x] AUDIT-001: Fix ESLint Configuration
- [x] AUDIT-002: Fix TypeScript Compilation Errors
- [x] AUDIT-003: Fix Failing Tests

### Sprint 2 (Week 2)

- [ ] AUDIT-004: Update Vulnerable Dependencies
- [x] AUDIT-005: Reduce TypeScript `any` Usage (start)

### Sprint 3 (Week 3)

- [x] AUDIT-005: Reduce TypeScript `any` Usage (complete)
- [x] AUDIT-006: Bundle Size Optimization

### Sprint 4 (Week 4+)

- [ ] AUDIT-007: Code Quality Improvements
- [ ] AUDIT-008: Test Coverage Enhancement
- [ ] AUDIT-009: Performance Optimization
- [ ] AUDIT-010: Documentation Enhancements
- [ ] AUDIT-011: Dependency Maintenance

---

## Metrics & KPIs

Track these metrics weekly to measure progress:

| Metric                | Current                         | Target   | Status |
| --------------------- | ------------------------------- | -------- | ------ |
| Linting Errors        | 0                               | < 100    | 🟢     |
| TypeScript Errors     | 0                               | 0        | 🟢     |
| Failing Tests         | 0                               | 0        | 🟢     |
| High/Critical CVEs    | 2                               | 0        | 🔴     |
| Bundle Size (gzipped) | Improving (landing ~300 KB)     | < 800 KB | 🟡     |
| Test Coverage         | 90%                             | 95%      | 🟢     |
| `any` Usage           | 0                               | 0        | 🟢     |

---

## Review Schedule

- **Daily Standups:** Progress updates on current sprint items
- **Weekly Review:** Every Friday at 2 PM
- **Sprint Planning:** Every Monday at 10 AM
- **Monthly Audit:** First Monday of each month

---

## Notes

- This plan is living document and should be updated as work progresses
- Priorities may shift based on business needs
- Estimated times are guidelines, actual time may vary
- All changes should include tests and documentation updates
- Security issues take precedence over other priorities

---

**Last Updated:** January 5, 2026  
**Next Review:** TBD
