# Feature Matrix

Note: this file mirrors `docs/market/FEATURE_MATRIX.md` so tooling and older links keep working.

This document lists product features, owners, priority, target milestone, and estimates. It is the canonical place for UI placeholders to link to feature details.

Status Legend:
- Implemented: Feature is functionally present and in active use
- Partial: Core scaffolding or subset implemented; further depth planned
- Planned: Not yet implemented; design or roadmap acknowledged

| Feature | Owner | Priority | Target milestone | Estimate | Status | Representative Source | Notes |
|---|---|---:|---|---:|---|---|---|
| 7-Step Pain Assessment | @product-owner | High | v1.0 | 3d | Implemented | `src/features/assessment/` | Full flow active |
| Comparison Tracking | @product-owner | Medium | v1.1 | 2d | Implemented | `src/features/assessment/steps/Comparison*` | Included in step 7 |
| Trend Charts | @analytics | High | v1.0 | 3d | Implemented | `src/features/analytics/` | Uses Recharts/Chart.js |
| Heatmaps | @analytics | Medium | v1.2 | 1w | Partial | `src/features/analytics/heatmap/` | Visualization WIP |
| WorkSafe BC Export (CSV/JSON) | @policy | High | v1.1 | 3d | Implemented | `src/features/reports/worksafebc/` | Sample CSV/JSON export available; verify templates |
| WorkSafe BC PDF Export | @policy | Medium | v1.2 | 1w | Partial | `src/features/reports/worksafebc/pdf/` | PDF generator scaffold exists; templates pending |
| Emergency Response Panel | @accessibility | High | v1.0 | 2d | Partial | `src/components/accessibility/` | Core panel implemented; integrations pending |
| Crisis Simulation Dashboard | @accessibility | Medium | v1.2 | 3d | Implemented | `src/components/accessibility/CrisisTestingDashboard.tsx` | Adaptive testing |
| Secure Storage Wrapper | @security | High | v1.1 | 1w | Implemented | `src/lib/storage/secureStorage.ts` | Selective encryption implemented; review AES-GCM layer |
| AES-GCM Encrypted IndexedDB Layer | @security | High | v2.0 | 2w | Planned | (future) | Enterprise-grade encrypted layer planned |
| SBOM Generation | @ops | Medium | v1.0 | 1d | Implemented | `security/sbom-latest.json` | Regeneratable |
| Automated Docs Validation | @docs | Low | v1.0 | 1d | Implemented | `.github/workflows/docs-validate.yml` | CI enforced |
| Medication Tracking | @product-owner | Medium | v1.1 | 3d | Implemented | `src/features/treatments/` |  |
| Treatment Outcomes Correlation | @analytics | Low | v2.0 | 2w | Partial | `src/features/analytics/` | Deeper correlation planned |
| Sleep / Mood / Activity | @product-owner | Medium | v1.0 | 2d | Implemented | `src/features/qol/` |  |
| CSV/JSON General Export | @platform | Medium | v1.0 | 2d | Implemented | `src/features/export/` | Cross-browser testing recommended for large exports |
| PDF General Export | @platform | Low | v1.2 | 1w | Partial | `src/features/export/pdf/` | Stable templates pending |
| Mobile Optimization | @platform | Medium | v2.0 | 5d | Partial | responsive tweaks ongoing | Performance tuning ongoing |
| Health Check Automation | @ops | Low | v2.0 | 3d | Planned | `scripts/health-check.js` | Categories defined |
| Rollback Procedure | @ops | High | v1.0 | 1d | Implemented | `docs/ops/DEPLOYMENT.md` | Documented |
| Conventional Commits Enforcement | @ci | Medium | v1.0 | 1d | Implemented | Husky / lint tools |  |
| Dependency Vulnerability Remediation | @security | High | v1.0 | ongoing | Partial | root dependencies | Run `npm audit` and patch critical items before release |
| Clinic Portal: Appointments | @clinic | Medium | v2.0 | 2w | Implemented | `src/pages/clinic/ClinicAppointments.tsx` | Schedule management & check-in flow |
| Clinic Portal: Compliance | @privacy | High | v2.0 | 1w | Implemented | `src/pages/clinic/ClinicCompliance.tsx` | HIPAA audit logs and access tracking |
| Clinic Portal: Reports | @analytics | Medium | v2.0 | 2w | Implemented | `src/pages/clinic/ClinicReports.tsx` | Population health summaries and export |

## Roadmap Deep Dives

The sections below expand on upcoming releases that currently surface as in-app planned feature notices. Each subsection tracks intent, trauma-informed considerations, and the best place to follow progress.

### Holistic Progress Milestones
- **Goal:** Curate celebratory milestones that emerge from holistic progress tracking entries.
- **Why it matters:** Recognizes meaningful breakthroughs while keeping tone gentle and empowering.
- **Where to follow:** [Active issues](https://github.com/CrisisCore-Systems/pain-tracker/issues?q=is%3Aopen+holistic+milestones)

### Adaptive Coping Strategy Coach
- **Goal:** Deliver adaptive, trauma-informed coping prompts tuned to the user's current patterns.
- **Why it matters:** Reinforces agency with contextual recommendations that respect emotional safety.
- **Where to follow:** [Tracking board](https://github.com/CrisisCore-Systems/pain-tracker/issues?q=is%3Aopen+coping+strategy)

### Comparison Analytics 2.0
- **Goal:** Expand treatment and time-period comparisons with adjustable cohorts and clinician-ready summaries.
- **Why it matters:** Supports collaborative care conversations by visualizing how interventions affect outcomes.
- **Where to follow:** [Roadmap search](https://github.com/CrisisCore-Systems/pain-tracker/issues?q=is%3Aopen+comparison+analytics)

### Visual Comparison Charts
- **Goal:** Provide interactive charts that illuminate differences across selected time slices and therapies.
- **Why it matters:** Enhances accessibility by pairing numeric insights with visual storytelling.
- **Where to follow:** [Design explorations](https://github.com/CrisisCore-Systems/pain-tracker/issues?q=is%3Aopen+visual+comparison)

### Empathy Intelligence Deep Dives
- **Goal:** Unlock multi-dimensional empathy drill-downs including neural pattern explorers, wisdom journeys, temporal rhythms, predictive insights, cultural empathy, and micro-moment celebrations.
- **Why it matters:** Gives clinicians and users gentle, privacy-conscious visibility into empathy growth arcs.
- **Where to follow:**
	- [Empathy IQ roadmap](https://github.com/CrisisCore-Systems/pain-tracker/issues?q=is%3Aopen+empathy+intelligence)
	- [Neural empathy thread](https://github.com/CrisisCore-Systems/pain-tracker/issues?q=is%3Aopen+neural+empathy)
	- [Wisdom journey work](https://github.com/CrisisCore-Systems/pain-tracker/issues?q=is%3Aopen+wisdom+journey)
	- [Temporal empathy updates](https://github.com/CrisisCore-Systems/pain-tracker/issues?q=is%3Aopen+temporal+empathy)
	- [Predictive empathy roadmap](https://github.com/CrisisCore-Systems/pain-tracker/issues?q=is%3Aopen+predictive+empathy)
	- [Cultural empathy focus](https://github.com/CrisisCore-Systems/pain-tracker/issues?q=is%3Aopen+cultural+empathy)
	- [Micro-moment tasks](https://github.com/CrisisCore-Systems/pain-tracker/issues?q=is%3Aopen+micro+empathy)

### Clinic Portal Expansion
- **Goal:** Enable practitioners to manage appointments, view compliance logs, and generate population health reports.
- **Why it matters:** Streamlines the clinical workflow and ensures regulatory compliance.
- **Where to follow:** [Clinic portal roadmap](https://github.com/CrisisCore-Systems/pain-tracker/issues?q=is%3Aopen+clinic+portal)

## How to use
- Update your feature row when ownership, priority, milestone, or estimate changes.
- Link UI placeholders to this file using an anchor or direct reference.
- For larger features, link to a companion design doc and include the link in Notes.

## Maintenance
- Owners are responsible for keeping their rows accurate.
- Create a GitHub issue and replace the Notes cell with the issue URL when planning starts.

---
Generated: 2025-09-26
