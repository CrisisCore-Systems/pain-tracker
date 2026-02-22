# Pain Tracker — Overton Framework v1.3 Compliance Matrix (Living)

Status: **self-assessed**, evidence-driven. This document is intended to prevent overclaiming by tracking what is implemented, what has evidence, what is unknown, and what requires explicit human review.

## Scope

- Normative reference: [docs/engineering/overton-framework-protective-computing-v1.3.md](../overton-framework-protective-computing-v1.3.md)
- Companion controls reference: `overton-framework/companion/*` (currently Companion header indicates v0.2)
- Evidence harness:
  - Playwright: `e2e/tests/overton-level-a-evidence.spec.ts`
  - Evidence packet runner: `scripts/run-overton-level-a-evidence.ps1`

## Human review gates (red-zone)

Before implementing any of the “Open items” below, complete the human review checklist:

- `docs/engineering/reviews/overton-v1.3-human-review-implementation-gates-2026-02-20.md`
- Draft contract for sign-off: `docs/engineering/reviews/overton-v1.3-reversibility-contract-2026-02-20.md`
- Deletion/export inventory: `docs/security/EXPORT_AND_DELETION_AUDIT.md`

## Classification

- **Implemented**: Behavior exists in product code.
- **Evidence**: Automated test or reproducible evidence artifact exists.
- **Gap**: Not implemented or no evidence.
- **Human review required**: Security-critical boundary (crypto, exports/templates, CSP/SW, new network/telemetry).

## Canon: Five Protective Design Principles (v1.3)

| Principle | Implementation status | Evidence | Notes / Gaps |
|---|---|---|---|
| **1) Radical Reversibility** | Partial | Partial | Implemented **temporal buffering** (10s cancel window) for destructive “clear all data” actions and scheduled report delete. Tombstones/restore windows/append-only retention remain **open** and require explicit contract + human review. |
| **2) Minimum Necessary Exposure** | Partial | ✅ | “No external egress during essential flows” evidence test added (metadata-only). Telemetry/analytics must remain opt-in and minimized. Any change to encryption-before-transmission requires **human review**. |
| **3) Failure Containment** | Partial | ✅ | Offline cache reload evidence exists. Local-first authority remains a core expectation; conflict retention / fail-safe semantics should be periodically re-validated. |
| **4) Cognitive Load Preservation** | Implemented | ✅ | Panic Mode provides a crisis overlay. Added temporary Automatic Zoom + **interrupt suppression** for explicitly-marked nonessential prompts while Panic Mode is active. |
| **5) Asymmetric Power Defense** | Gap / Unknown | ❌ | Canon includes coercion/duress defenses (e.g., duress codes, neutral presentation, panic protocol/crypto erasure). This is a **red zone** area; requires careful human review and threat-model validation. |

## Companion Controls (PC-* families)

| Control family | Implementation status | Evidence | Notes / Gaps |
|---|---|---|---|
| **PC-1 Offline / Local-first availability** | Implemented | ✅ | Evidence: offline cache reload capture in `e2e/tests/overton-level-a-evidence.spec.ts` (PC-1 test). |
| **PC-2 Reversibility / recoverability** | Partial | ❌ | Implemented **temporal buffering** for destructive actions (10s cancel window) without retaining Class A backups. Deeper recoverability (restore windows/tombstones/append-only) remains **open** and requires human review + acceptance criteria. |
| **PC-3 Exposure minimization / telemetry constraints** | Partial | ✅ | Evidence: “no external egress during essential flows” capture (metadata-only) in `03-telemetry/`. Verify any optional subsystems (weather, analytics) remain disabled by default or explicitly consented. |
| **PC-4 Crisis UX (reduced cognitive load)** | Implemented | ✅ | Evidence: Panic overlay reachable/closable + Automatic Zoom + prompt suppression via `body.ti-protective-mode` and `data-nonessential-prompt="true"`. |
| **PC-5 Duress / safe export / portability** | Implemented (exports) / Unknown (duress) | ✅ / ❌ | Evidence: offline exports (CSV/JSON/PDF/WCB) captured. Duress-specific requirements (neutral UI, panic protocol, crypto erasure) remain **unknown/gap** and require human review. |
| **PC-6 Update integrity / traceability** | Unknown | ❌ | Requires supply-chain and release-process evidence (signing, provenance, reproducibility, rollback strategy). Treat as **process + security** work. |

## Evidence inventory (automation)

- `e2e/tests/overton-level-a-evidence.spec.ts`
  - PC-1 offline cache load
  - PC-5 offline export
  - PC-4 panic overlay reachable/closable
  - PC-3 no external egress during essential flows (metadata-only)
- `src/test/accessibility.test.tsx`
  - Panic Mode temporary zoom multiplier applies and is cleaned up
  - Protective mode class toggles on `<body>` during Panic Mode

### Latest evidence packet (local)

- Evidence root: `evidence/overton-level-a/`
- Latest run: `evidence/overton-level-a/2026-02-20_dev_507ae80/`
  - PC-1: `01-offline/cache-summary.json`, `01-offline/offline-reload.png`
  - PC-5: `02-exports/*` (CSV/JSON/PDF/WCB + screenshot)
  - PC-4: `04-crisis-ux/panic-mode-open.png`, `04-crisis-ux/panic-mode-closed.png`
  - PC-3: `03-telemetry/no-external-egress-essential-flows.json` (request metadata only)

## Open items (needs human review before implementation)

- Stronger reversibility guarantees for Class A data (tombstones, restore windows, auditability without reconstruction)
- Duress/coercion defenses (duress codes, neutral presentation, panic protocol, crypto erasure claims)
- Any changes to encryption/key handling, export/report templates, CSP/service worker caching rules, or introducing new network/telemetry behavior
