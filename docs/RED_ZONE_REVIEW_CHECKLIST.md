# 🚨 Red-Zone Review Checklist: Export Pipeline Changes

> **Status**: Pending Human Review
> **Area**: `src/services/PDFExportService.ts` & `scripts/generate-wcb-sample-pdf.ts`
> **Risk Level**: High (Touches Clinical Export Logic)

## 1. `src/services/PDFExportService.ts`

### Changes
- **Refactoring**: The service now manually tracks the `y` vertical cursor position across sections (`addHeader`, `addPainTrends`, etc.) to support dynamic content flow better than the previous implementation.
- **Node.js Compatibility**: Added a dynamic import workaround to attach the `jspdf-autotable` plugin in Node environments (required for the static site generator script).
  ```typescript
  // In initializePDF():
  const applyPlugin = (autoTableModule as any).applyPlugin;
  if (typeof applyPlugin === 'function') {
    applyPlugin(jsPDF);
  }
  ```
- **Watermarking**: Added `applyWatermark(text)` method and updated `generateWCBReport` signature to accept an optional `watermarkText`.
  - **Implementation**: Renders large, light-gray (RGB 200,200,200), rotated text (35°) on every page.
  - **Purpose**: Used solely for generating the "SAMPLE REPORT" for the marketing site/case study.

### Security & Safety Verification
- [ ] **Data Leakage**: Confirm `generateWCBReport` still returns a local `Blob` and does **not** initiate any network transfers.
- [ ] **Browser Compatibility**: Verify the `applyPlugin` workaround does not break the standard browser-based export flow (where `jspdf-autotable` usually auto-attaches).
- [ ] **Legibility**: Confirm the watermark (if used) does not obscure clinical data in a way that could lead to misinterpretation (though it is intended for synthetic samples only).

## 2. `scripts/generate-wcb-sample-pdf.ts`

### Changes
- **New Script**: A standalone script to generate a sample WCB report PDF for the documentation/marketing site.
- **Output**: Writes to `docs/case-studies/worksafe-bc/generated/`.
- **Data Source**: Uses `scripts/fixtures/wcb-sample-entries.ts` (Synthetic Data).

### Security & Safety Verification
- [ ] **Synthetic Data Only**: Confirm `WCB_SAMPLE_ENTRIES` contains **no real user data** or PII.
- [ ] **Local Execution**: Confirm the script writes to the local filesystem only and does not upload artifacts.
- [ ] **Git Ignore**: Confirm `docs/case-studies/worksafe-bc/generated/*.pdf` is in `.gitignore` to prevent binary bloat or accidental commit of generated artifacts.

## 3. `scripts/fixtures/wcb-sample-entries.ts`

### Changes
- **New File**: Contains an array of `PainEntry` objects.

### Security & Safety Verification
- [ ] **PII Check**: Verify all names, notes, and identifiers are clearly synthetic (e.g., "Lorem ipsum", "Sample User").

---

## Recommendation
The changes appear to be **safe** and **necessary** for the new WorkSafeBC case study content. The refactoring of `PDFExportService` improves layout robustness. The Node.js compatibility fix is scoped to initialization.

**Action**: Reviewers should manually test the "Export WCB Report" feature in the browser to ensure no regression in the main app flow.
