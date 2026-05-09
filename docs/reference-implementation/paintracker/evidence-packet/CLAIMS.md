# Claims Under Review

## Required language

Protective Computing Specification v1.0 is a founder-authored normative design specification. Current implementation claims are conformance claims, not certification. A system may be described as self-attested, repo backed, CI backed, externally reviewed, or certified only according to the published proof badge taxonomy.

PainTracker is a candidate reference implementation with a public reference packet, explicit limitations, and bounded evidence anchors. It is not certified. Its current posture is Level 2 to Level 3 alignment where evidence exists, with unresolved gaps in active-coercion resistance, accessibility-complete degraded mode, and external review.

## Claim ledger

| Claim | Proof level | Evidence | Limitation |
|---|---|---|---|
| PainTracker supports local-first journaling with local persistence defaults. | Repo backed | `src/stores/pain-tracker-store.ts`; `src/utils/pwa-utils.ts`; `README.md` | Does not prove all optional integrations are local-only. |
| PainTracker provides user-triggered export paths (CSV/JSON/PDF, WorkSafeBC-oriented flows where enabled). | Repo backed | `src/utils/pain-tracker/export.ts`; `src/utils/pain-tracker/wcb-export.ts`; `docs/user-guide/EXPORT_DATA.md` | Export use can increase disclosure risk outside the app boundary. |
| PainTracker has trust-claim and trust-doc quality gates in CI. | CI backed | Workflow: `ci.yml` and `docs-validate.yml`; Run link: `https://github.com/CrisisCore-Systems/pain-tracker/actions/workflows/ci.yml`; Commit SHA: `169c9fd0dca1ae6c582a8ed753a281a4346616e8` | This packet does not include immutable run IDs for each historical claim update. |
| PainTracker has bounded release evidence snapshots documenting current verification state. | Repo backed | `docs/trust/release-evidence-2026-05-08.md`; `docs/trust/release-gating-policy.md`; `docs/trust/release-evidence-template.md` | Evidence is time-bound and can become stale. |
| PainTracker has externally reviewed degraded-mode accessibility behavior across essential journaling flow. | Self attested | Planned review scope in `docs/reference-implementation/paintracker/external-reviews/degraded-mode-accessibility-review-0001.md` | External review not yet completed and signed. |

## Explicit non-claims

| Non-claim | Reason |
|---|---|
| PainTracker is certified Protective Computing compliant. | No independent certification body has issued a certification. |
| PainTracker provides zero metadata visibility. | Metadata visibility is not proven to be zero across all boundaries. |
| PainTracker has complete per-entry version history and point-in-time rollback. | Only bounded versioning evidence exists where linked. |
| PainTracker enforces mutual TLS in deployed environments. | No deployment config and runtime evidence packet proving mTLS is linked here. |
| PainTracker currently ships CRDT/operational-transform sync. | Default posture is local-first with no required sync path. |
| PainTracker is funded by verified grant awards. | No public award evidence is linked in this packet. |
| PainTracker PWA uses native mobile keychain/Android Keystore paths. | PWA trust boundary is browser/Web Crypto/local storage; native wrappers not claimed. |
