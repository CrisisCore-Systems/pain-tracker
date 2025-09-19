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
| Reporting | WorkSafe BC Export (CSV/JSON) | Implemented | `src/features/reports/worksafebc/` | Sample provided |
| Reporting | WorkSafe BC PDF Export | Partial | `src/features/reports/worksafebc/pdf/` | Generator pending |
| Emergency | Emergency Response Panel | Partial | `src/components/accessibility/` | Core panel + triggers |
| Emergency | Crisis Simulation Dashboard | Implemented | `src/components/accessibility/CrisisTestingDashboard.tsx` | Adaptive testing |
| Security | Secure Storage Wrapper | Implemented | `src/lib/storage/secureStorage.ts` | Namespaced |
| Security | Encryption (Selective) | Partial | same as above | Shim; AES-GCM planned |
| Security | SBOM Generation | Implemented | `security/sbom-latest.json` | Regeneratable |
| Security | Automated Docs Validation | Implemented | `.github/workflows/docs-validate.yml` | CI enforced |
| Storage | IndexedDB Encrypted Layer | Planned | (future) | Scale & performance |
| Treatment | Medication Tracking | Implemented | `src/features/treatments/` | |
| Treatment | Treatment Outcomes Correlation | Partial | `src/features/analytics/` | Deeper correlation planned |
| QoL | Sleep / Mood / Activity | Implemented | `src/features/qol/` | |
| Export | CSV/JSON General Export | Implemented | `src/features/export/` | |
| Export | PDF General Export | Partial | `src/features/export/pdf/` | Framework pending |
| Platform | Mobile Optimization | Partial | responsive tweaks ongoing | |
| Ops | Health Check Automation | Planned | `scripts/health-check.js` (future) | Categories defined |
| Ops | Rollback Procedure | Implemented | `docs/DEPLOYMENT.md` | Documented |
| Governance | Conventional Commits Enforcement | Implemented | Husky / lint tools | |
| Governance | Dependency Vulnerability Remediation | Partial | root dependencies | Ongoing |

(Adjust paths if they differ in the repository.)
