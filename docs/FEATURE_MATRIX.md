# Feature Maturity Matrix

Status Legend:
- Implemented: Feature is functionally present and in active use
- Partial: Core scaffolding or subset implemented; further depth planned
- Planned: Not yet implemented; design or roadmap acknowledged

| Category | Feature | Status | Representative Source | Notes |
|----------|---------|--------|-----------------------|-------|
| Assessment | 7-Step Pain Assessment | Implemented | `src/features/assessment/` | Full flow active |
| Assessment | Comparison Tracking | Implemented | `src/features/assessment/steps/Comparison*` | Included in step 7 |
| Analytics | Trend Charts | Implemented | `src/features/analytics/` | Uses Recharts/Chart.js |
| Analytics | Heatmaps | Partial | `src/features/analytics/heatmap/` | Visualization WIP |
| Reporting | WorkSafe BC Export (CSV/JSON) | Implemented | `src/features/reports/worksafebc/` | Sample CSV/JSON export available; verify templates before production use |
| Reporting | WorkSafe BC PDF Export | Partial | `src/features/reports/worksafebc/pdf/` | PDF generator scaffold exists; rendering templates and edge-case formatting pending |
| Emergency | Emergency Response Panel | Partial | `src/components/accessibility/` | Core panel implemented; automated escalation and external integrations pending |
| Emergency | Crisis Simulation Dashboard | Implemented | `src/components/accessibility/CrisisTestingDashboard.tsx` | Adaptive testing |
| Security | Secure Storage Wrapper | Implemented | `src/lib/storage/secureStorage.ts` | Namespaced; selective encryption implemented but review recommended for AES-GCM at scale |
| Security | Encryption (Selective) | Partial | same as above | Encryption wrapper present; full AES-GCM encrypted IndexedDB layer planned and not yet in production use |
| Security | SBOM Generation | Implemented | `security/sbom-latest.json` | Regeneratable |
| Security | Automated Docs Validation | Implemented | `.github/workflows/docs-validate.yml` | CI enforced |
| Storage | IndexedDB Encrypted Layer | Planned | (future) | Enterprise-grade encrypted layer (AES-GCM) is planned; current storage uses selective encryption wrappers |
| Treatment | Medication Tracking | Implemented | `src/features/treatments/` | |
| Treatment | Treatment Outcomes Correlation | Partial | `src/features/analytics/` | Deeper correlation planned |
| QoL | Sleep / Mood / Activity | Implemented | `src/features/qol/` | |
| Export | CSV/JSON General Export | Implemented | `src/features/export/` | CSV/JSON working; cross-browser testing recommended for large exports |
| Export | PDF General Export | Partial | `src/features/export/pdf/` | PDF export scaffolding exists; stable templates and styling pending |
| Platform | Mobile Optimization | Partial | responsive tweaks ongoing | Mobile UI responsive; performance tuning and touch-UX refinements ongoing |
| Ops | Health Check Automation | Planned | `scripts/health-check.js` (future) | Categories defined |
| Ops | Rollback Procedure | Implemented | `docs/DEPLOYMENT.md` | Documented |
| Governance | Conventional Commits Enforcement | Implemented | Husky / lint tools | |
| Governance | Dependency Vulnerability Remediation | Partial | root dependencies | Ongoing; several dev-dependency vulnerabilities noted; recommend running `npm audit` and patching critical items before release |

(Adjust paths if they differ in the repository.)
