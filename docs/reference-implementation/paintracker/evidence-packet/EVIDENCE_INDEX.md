# Evidence Index

## Commit anchor

- Commit under review: `169c9fd0dca1ae6c582a8ed753a281a4346616e8`

## Repository-backed evidence

| Area | Evidence files |
|---|---|
| Canonical trust packet | `docs/trust/paintracker-protective-computing-reference-packet-v1.0.md` |
| Claims baseline and badge language | `docs/CLAIMS_BASELINE.md`; `docs/engineering/checklists/paintracker-overton-v0.2-control-mapping.md` |
| Release evidence snapshots | `docs/trust/release-evidence-2026-05-08.md`; `docs/trust/release-evidence-template.md`; `docs/trust/release-gating-policy.md` |
| Local-first and persistence surfaces | `src/stores/pain-tracker-store.ts`; `src/utils/pwa-utils.ts` |
| Export boundaries | `src/utils/pain-tracker/export.ts`; `src/utils/pain-tracker/wcb-export.ts`; `docs/user-guide/EXPORT_DATA.md` |
| Threat boundaries | `docs/trust/threat-model.md`; `SECURITY_INVARIANTS.md`; `docs/security/ENCRYPTION_KEY_MANAGEMENT.md` |

## CI-backed evidence

| Claim surface | Workflow | Run link | Commit SHA |
|---|---|---|---|
| Trust and docs verification gates | `ci.yml` | `https://github.com/CrisisCore-Systems/pain-tracker/actions/workflows/ci.yml` | `169c9fd0dca1ae6c582a8ed753a281a4346616e8` |
| Trust docs validation | `docs-validate.yml` | `https://github.com/CrisisCore-Systems/pain-tracker/actions/workflows/docs-validate.yml` | `169c9fd0dca1ae6c582a8ed753a281a4346616e8` |

## Evidence gaps

- No signed external degraded-mode accessibility review yet.
- No independent certification evidence.
- No complete active-coercion resistance validation packet.
- No proof that metadata visibility is zero across all boundaries.
