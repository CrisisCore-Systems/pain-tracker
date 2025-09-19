# 🩺 Pain Tracker | CrisisCore Systems

> A security-hardened health platform for chronic pain and injury management.

![GitHub top language](https://img.shields.io/github/languages/top/CrisisCore-Systems/pain-tracker?color=blue&label=TypeScript)
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/CrisisCore-Systems/pain-tracker/ci.yml?label=CI%2FCD%20Pipeline)
![Security Scan](https://github.com/CrisisCore-Systems/pain-tracker/actions/workflows/security.yml/badge.svg)
![GitHub License](https://img.shields.io/github/license/CrisisCore-Systems/pain-tracker?color=lightgrey)
![Version](https://img.shields.io/badge/version-0.1.0--dev-yellow)
![Tests](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/CrisisCore-Systems/pain-tracker/main/badges/test-badge.json)
![Development Status](https://img.shields.io/badge/status-early%20development-orange)

![Coverage](https://github.com/CrisisCore-Systems/pain-tracker/actions/workflows/coverage.yml/badge.svg)
![Docs Validation](https://github.com/CrisisCore-Systems/pain-tracker/actions/workflows/docs-validate.yml/badge.svg)
[![Coverage %](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/CrisisCore-Systems/pain-tracker/main/badges/coverage-badge.json)](coverage/coverage-summary.json)
![Security](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/CrisisCore-Systems/pain-tracker/main/badges/security-badge.json)
[![Open Issues](https://img.shields.io/github/issues/CrisisCore-Systems/pain-tracker)](https://github.com/CrisisCore-Systems/pain-tracker/issues)
[![Open PRs](https://img.shields.io/github/issues-pr/CrisisCore-Systems/pain-tracker)](https://github.com/CrisisCore-Systems/pain-tracker/pulls)
![Commit Activity](https://img.shields.io/github/commit-activity/m/CrisisCore-Systems/pain-tracker)
[![SBOM](https://img.shields.io/badge/SBOM-CycloneDX-blue)](security/sbom-latest.json)
[![Feature Matrix](https://img.shields.io/badge/feature%20matrix-live-informational)](docs/FEATURE_MATRIX.md)
[![LOC](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/CrisisCore-Systems/pain-tracker/main/badges/loc-badge.json)](badges/loc-badge.json)
[![Bundle Size](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/CrisisCore-Systems/pain-tracker/main/badges/bundle-badge.json)](badges/bundle-badge.json)
[![Mutation](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/CrisisCore-Systems/pain-tracker/main/badges/mutation-badge.json)](badges/mutation-badge.json)

---

## 🚨 Why Pain Tracker exists

Pain is more than a number. Most apps oversimplify; this one doesn't.
Pain Tracker maps pain in high resolution for real-world recovery,
with WorkSafe BC reporting and security-focused engineering.

Status: early development (v0.1.0-dev). Core features are functional,
tested, and secure. We're remediating development dependency vulnerabilities.
See Security Status below.

![Pain Tracker Main Interface](https://github.com/user-attachments/assets/3bc3ea51-709f-446c-9f39-5dad15a58a3b)

---

## 🌟 Key features

| Feature Domain | What Sets It Apart |
|----------------|--------------------|
| 📝 Pain assessment | 7-step multi-dimensional tracking, 25+ mapped body locations |
| 📊 Analytics & heatmaps | Symptom trends, recovery progression, treatment correlations |
| 🏥 Healthcare integration | Automated WorkSafe BC claims, clinician-ready CSV/JSON exports |
| 💊 Treatment tracking | Medications, therapy logs, and outcome analysis |
| 🧩 Quality-of-life metrics | Mood, sleep, activity impacts |
| 🚨 Emergency panel | Automated protocols and alert system |
| 🔒 Security by design | CSP, Zod validation, secret scanning, SAST pipelines |

![Pain Tracker Analytics](https://github.com/user-attachments/assets/2e684837-21b3-4bc4-aca0-22ad07b26fce)

---

## 🧱 Tech stack and architecture

See ARCHITECTURE_DEEP_DIVE.md for storage, background sync, PWA infra,
extensibility, and roadmap details.

Key pillars: offline-first resilience, event-driven sync, typed IndexedDB
wrapper, prioritized queue processing, and forward-compatible shims
(for example, legacy forcSync → forceSync).

| Layer | Tech |
|-------|-----|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Headless UI |
| Analytics | Recharts, Chart.js, custom visualizations |
| Validation | Zod schemas for all inputs |
| Testing | Vitest, Testing Library, jsdom |

---

## 🛡️ Security status

Current posture: comprehensive security infrastructure is in place,
but some development dependency vulnerabilities remain.

- Security infrastructure: CodeQL, SAST, secret scanning in CI/CD
- Development security: pre-commit gates and audit checks
- Dependencies: issues are in dev tooling, not runtime
- Production safety: runtime dependencies are clean
- Local data only: no cloud storage or transmission

Security architecture:

```mermaid
flowchart LR
  A[Developer] --> B[Pre-Commit Security Gates]
  B --> C[GitHub Repo]
  C --> D[CI/CD Pipeline: CodeQL, SAST, npm audit]
  D --> E[Production: Hardened Build + Local Data Storage]

  subgraph Security Gates
    B1[Secret Scanning]
    B2[Type Checking]
    B3[Merge Conflict Detection]
    B4[CrisisCore Vulnerability Rules]
  end

  B --> B1 --> B2 --> B3 --> B4
```

Mitigation: dependency updates are in progress; the security framework
ensures dev-tooling issues don't affect production builds.

![Pain Tracker Interface](https://github.com/user-attachments/assets/74e7b0fb-c3e4-4ff2-8a52-2b0f0bb6a2f8)

---

## 🛠️ Dynamic badges and metrics

Badges (tests, coverage, security, LOC, issues, PRs, commit activity)
are generated by scripts under scripts/ and served as JSON in badges/
for Shields.io.

Sources:

- scripts/generate-test-badge.mjs
- scripts/generate-coverage-badge.mjs
- scripts/generate-security-badge.mjs
- scripts/generate-loc-badge.mjs
- scripts/generate-bundle-badge.mjs

Local refresh (PowerShell):

```powershell
npm run badge:all
```

Or individually:

```powershell
npm run badge:tests
npm run badge:loc
node scripts/generate-security-badge.mjs
```

The pre-push hook (.husky/pre-push) auto-regenerates and commits badge
JSONs when pushing main to keep them current and reduce noise.

Color thresholds:

- Coverage: 90+ brightgreen, 80–89 green, 70–79 yellowgreen,
  60–69 yellow, 50–59 orange, <50 red
- Tests: scaled to project size (adjust as the suite grows)
- LOC: favors smaller core; green under 1k, yellowgreen <5k,
  yellow <12k, orange <20k, red beyond

Mutation badge is updated weekly; local runs show n/a until a report exists.

---

## 🧰 Getting started

Prerequisites:

- Node.js v18 or higher
- npm v9 or higher
- make (optional, for convenience)

Installation:

```bash
# 1) Clone
git clone https://github.com/CrisisCore-Systems/pain-tracker.git
cd pain-tracker

# 2) One-step setup (recommended)
make setup

# Manual setup
npm install --legacy-peer-deps
cp .env.example .env
npm run dev
```

Known issues:

- Some legacy peer deps are required while test ecosystem
  versions converge; remediation is underway.

Node compatibility:

- Node.js 18, 20, 22 supported
- npm 9+ required
- Use --legacy-peer-deps during installation if needed

---

## 🤝 Contributing and development

This repo enforces Conventional Commits and has strong pre-commit gates.

Examples:

```text
feat(tracker): add pain heatmap visualization
fix(api): resolve WCB integration timeout
docs(readme): add contributing guidelines
```

Skip tags: [skip lint], [skip build], [skip all]

---

## 🔧 Documentation details

<details>
<summary>Expand for developer workflow and commands</summary>

Key commands (Makefile):

```bash
make help         # List commands
make dev          # Start Vite dev server
make test         # Run Vitest
make check        # Lint, typecheck, security
make lint-fix     # Auto-fix linting issues
make badge:all    # Regenerate dynamic badges
```

Commit convention:

- feat(scope): add new feature
- fix(api): resolve endpoint issue
- docs(readme): update installation guide
- chore(deps): upgrade dependencies

Dynamic badges are generated by scripts in /scripts and kept fresh
via the pre-push hook on main.

Version: 0.1.0-dev (early development)
Build: passing
Security: dev dependency vulnerabilities present
Deployment: GitHub Pages configured

Implemented core features:

- Multi-step assessment (7 steps)
- Interactive analytics and charts
- WorkSafe BC report generation
- Emergency response panel
- Local storage import/export
- Comprehensive test suite
- Security scanning and validation
- Onboarding and tutorial system
- Responsive, accessible UI
- Full TypeScript + Zod

In active development:

- Dependency remediation
- Enhanced analytics
- Mobile optimization
- Additional export formats

</details>

<details>
<summary>📋 Full feature list</summary>

- Multi-dimensional pain assessment: intensity, 25+ locations,
  19+ symptom types
- Advanced analytics: trend charts, heat maps, progression analysis
- WorkSafe BC report generation
- Emergency response panel
- Clinical data export: CSV and JSON outputs
- Work impact assessment: missed days, modified duties, limitations
- Medication and treatment logging
- Quality-of-life metrics: sleep, mood, activity
- Secure local-first storage: data stays on device
- Data portability: import, export, backups

</details>

---

## 🖤 Built with empathy, rigor, and transparency

Commitment to honest status reporting, privacy-first architecture,
layered security, and evidence-driven iteration.

By CrisisCore Systems.

---

## License

MIT License — see LICENSE.
# 🩺 Pain Tracker | CrisisCore Systems

<<<<<<< HEAD
> **A Security-Hardened, Offline-First Health Platform for High-Resolution Chronic Pain and Injury Management.**

<!-- Main Badges: Status & Health -->
![Development Status](https://img.shields.io/badge/status-early%20development-orange)
![Version](https://img.shields.io/badge/version-0.1.0--dev-yellow)
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/CrisisCore-Systems/pain-tracker/ci.yml?label=CI%2FCD)
![Security Scan](https://github.com/CrisisCore-Systems/pain-tracker/actions/workflows/security.yml/badge.svg)
![GitHub License](https://img.shields.io/github/license/CrisisCore-Systems/pain-tracker?color=lightgrey)

<!-- Metrics Badges: Generated & Dynamic -->
![Tests](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/CrisisCore-Systems/pain-tracker/main/badges/test-badge.json)
[![Coverage %](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/CrisisCore-Systems/pain-tracker/main/badges/coverage-badge.json)](coverage/coverage-summary.json)
![Security](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/CrisisCore-Systems/pain-tracker/main/badges/security-badge.json)
[![LOC](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/CrisisCore-Systems/pain-tracker/main/badges/loc-badge.json)](badges/loc-badge.json)
[![Bundle Size](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/CrisisCore-Systems/pain-tracker/main/badges/bundle-badge.json)](badges/bundle-badge.json)
[![Mutation](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/CrisisCore-Systems/pain-tracker/main/badges/mutation-badge.json)](badges/mutation-badge.json)

<!-- Community & Repo Activity Badges -->
=======
> **A Security-Hardened Health Platform for Chronic Pain and Injury Management**

![GitHub top language](https://img.shields.io/github/languages/top/CrisisCore-Systems/pain-tracker?color=blue&label=TypeScript)
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/CrisisCore-Systems/pain-tracker/ci.yml?label=CI%2FCD%20Pipeline)
![Security Scan](https://github.com/CrisisCore-Systems/pain-tracker/actions/workflows/security.yml/badge.svg)
![GitHub License](https://img.shields.io/github/license/CrisisCore-Systems/pain-tracker?color=lightgrey)
![Version](https://img.shields.io/badge/version-0.1.0--dev-yellow)
![Tests](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/CrisisCore-Systems/pain-tracker/main/badges/test-badge.json)
![Development Status](https://img.shields.io/badge/status-early%20development-orange)

<!-- Extended badges -->
![Coverage](https://github.com/CrisisCore-Systems/pain-tracker/actions/workflows/coverage.yml/badge.svg)
![Docs Validation](https://github.com/CrisisCore-Systems/pain-tracker/actions/workflows/docs-validate.yml/badge.svg)
[![Coverage %](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/CrisisCore-Systems/pain-tracker/main/badges/coverage-badge.json)](coverage/coverage-summary.json)
![Security](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/CrisisCore-Systems/pain-tracker/main/badges/security-badge.json)
>>>>>>> d73cc0d (test: Fix async error assertion)
[![Open Issues](https://img.shields.io/github/issues/CrisisCore-Systems/pain-tracker)](https://github.com/CrisisCore-Systems/pain-tracker/issues)
[![Open PRs](https://img.shields.io/github/issues-pr/CrisisCore-Systems/pain-tracker)](https://github.com/CrisisCore-Systems/pain-tracker/pulls)
![Commit Activity](https://img.shields.io/github/commit-activity/m/CrisisCore-Systems/pain-tracker)
[![SBOM](https://img.shields.io/badge/SBOM-CycloneDX-blue)](security/sbom-latest.json)
<<<<<<< HEAD

---

## 🚨 The Mission
=======
[![Feature Matrix](https://img.shields.io/badge/feature%20matrix-live-informational)](docs/FEATURE_MATRIX.md)
[![LOC](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/CrisisCore-Systems/pain-tracker/main/badges/loc-badge.json)](badges/loc-badge.json)
[![Bundle Size](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/CrisisCore-Systems/pain-tracker/main/badges/bundle-badge.json)](badges/bundle-badge.json)
[![Mutation](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/CrisisCore-Systems/pain-tracker/main/badges/mutation-badge.json)](badges/mutation-badge.json)

---

## 🚨 Why Pain Tracker Exists

Pain is more than a number. Most apps oversimplify—this one doesn't. We built **Pain Tracker** to **map pain in high resolution** for real-world recovery, backed by **WorkSafe BC reporting** and **security-focused engineering**.
>>>>>>> d73cc0d (test: Fix async error assertion)

Standard pain apps often reduce complex experiences to a single number. This project is different. We built **Pain Tracker** to **map pain in high resolution**, providing the detailed insights needed for real-world recovery, **WorkSafe BC reporting**, and effective clinical collaboration.

> **⚠️ Current Status**: This project is in **early development** (v0.1.0-dev). The core feature set is functional, tested, and secure. We are now actively resolving vulnerabilities in development dependencies. See the [Security Status](#-security-status) for more details.

![Pain Tracker Main Interface](https://github.com/user-attachments/assets/3bc3ea51-709f-446c-9f39-5dad15a58a3b)

---

## 🌟 Key Features

| Feature Domain | What Sets It Apart |
|----------------|--------------------|
<<<<<<< HEAD
| 📝 **Pain Assessment** | 7-step multi-dimensional tracking, 25+ mapped body locations, 19+ symptom types. |
| 📊 **Analytics & Heatmaps** | Uncover symptom trends, recovery progression, and treatment correlations. |
| 🏥 **Healthcare Integration**| Automated WorkSafe BC claims and clinician-ready CSV/JSON exports. |
| 💊 **Treatment Tracking** | Log medications and therapies to analyze outcome effectiveness. |
| ❤️ **Quality of Life** | Monitor mood, sleep, and activity levels to see the bigger picture. |
| 🔒 **Security by Design** | Privacy-first architecture with local-only data, CSP, and robust validation. |
=======
| 📝 Pain Assessment | 7-step multi-dimensional tracking, 25+ mapped body locations |
| 📊 Analytics & Heatmaps | Symptom trends, recovery progression, treatment correlations |
| 🏥 Healthcare Integration | Automated WorkSafe BC claims, clinician-ready CSV/JSON exports |
| 💊 Treatment Tracking | Medications, therapy logs, and outcome analysis |
| 🧩 Quality of Life Metrics | Mood, sleep, activity impacts |
| 🚨 Emergency Panel | Automated protocols & alert system |
| 🔒 Security by Design | CSP, Zod validation, secret scanning, SAST pipelines |

![Pain Tracker Analytics](https://github.com/user-attachments/assets/2e684837-21b3-4bc4-aca0-22ad07b26fce)
>>>>>>> d73cc0d (test: Fix async error assertion)

---

## 🧱 Tech Stack & Architecture

<<<<<<< HEAD
This project is built on a modern, resilient, and secure foundation. For a complete technical breakdown, see the [**ARCHITECTURE_DEEP_DIVE.md**](./ARCHITECTURE_DEEP_DIVE.md).
=======
For a detailed exploration of storage design, background synchronization, PWA infrastructure, extensibility paths, and roadmap, see: [ARCHITECTURE_DEEP_DIVE.md](./ARCHITECTURE_DEEP_DIVE.md).

Key pillars: Offline-first resilience, event-driven sync, typed IndexedDB wrapper, prioritized queue processing, and forward-compatible shims (e.g., legacy `forcSync` → `forceSync`).

---

## 🛡️ Security Status

**Current Security Posture**: CrisisCore Systems has implemented comprehensive security infrastructure, but the project currently has dependency vulnerabilities that require attention:

- ✅ **Security Infrastructure**: Complete CI/CD security pipeline with CodeQL, SAST, and secret scanning
- ✅ **Development Security**: Pre-commit hooks, vulnerability scanning, and security-focused code practices  
- ⚠️ **Dependencies**: 77 vulnerabilities in dev dependencies (73 critical, 1 high, 3 moderate)
- ✅ **Production Safety**: Vulnerabilities are in development tools, not runtime dependencies
- ✅ **Local Data Only**: No cloud storage or data transmission reduces attack surface

**Security Architecture**:
```mermaid
flowchart LR
  A[Developer] --> B[Pre-Commit Security Gates]
  B --> C[GitHub Repo]
  C --> D[CI/CD Pipeline: CodeQL, SAST, npm audit]
  D --> E[Production: Hardened Build + Local Data Storage]

  subgraph Security Gates
    B1[Secret Scanning]
    B2[Type Checking]
    B3[Merge Conflict Detection]
    B4[CrisisCore Vulnerability Rules]
  end

  B --> B1 --> B2 --> B3 --> B4
```

**Mitigation Plan**: Dependency updates are in progress. The security framework ensures that vulnerabilities in development tools don't affect the production application.

![Pain Tracker Interface](https://github.com/user-attachments/assets/74e7b0fb-c3e4-4ff2-8a52-2b0f0bb6a2f8)

---

## 🧩 Tech Stack
>>>>>>> d73cc0d (test: Fix async error assertion)

| Layer | Tech Stack |
|-------|------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Headless UI |
<<<<<<< HEAD
| **State & Validation** | Zod for type-safe schemas across the application. |
| **Data Persistence** | Offline-first IndexedDB with a secure wrapper for local storage. |
| **Analytics** | Recharts & Chart.js for interactive visualizations. |
| **Testing** | Vitest, Testing Library, and jsdom for a comprehensive test suite. |
| **DevOps** | GitHub Actions, Makefile, Husky, and CommitLint for a streamlined, secure workflow. |
=======
| **Analytics** | Recharts, Chart.js, Custom Visualizations |
| **Validation** | Zod schemas for all inputs |
| **Testing** | Vitest, Testing Library, jsdom (128 tests) |

---

## 🛠️ Dynamic Badges & Metrics

The badges at the top (tests, coverage %, security vulns, LOC, issues, PRs, commit activity) are generated via scripts in `scripts/` and JSON endpoints in `badges/` consumed by Shields.io.

Generation sources:
- `scripts/generate-test-badge.mjs`: counts tests via Vitest list / fallback static scan.
- `scripts/generate-coverage-badge.mjs`: reads `coverage/coverage-summary.json` (v8) after `vitest` run.
- `scripts/generate-security-badge.mjs`: parses `security-audit-report.json`.
- `scripts/generate-loc-badge.mjs`: fast LOC count over `.ts/.tsx` excluding vendor/output.
- `scripts/generate-bundle-badge.mjs`: parses esbuild metafile (or fallback) to compute total JS+CSS size.

Local refresh (PowerShell):

```powershell
npm run badge:all
```

Or individually:

```powershell
npm run badge:tests
npm run badge:loc
node scripts/generate-security-badge.mjs
```

Git pre-push hook (`.husky/pre-push`) auto-regenerates and amends/commits badge JSONs when pushing `main` to keep them current and reduce noisy commits.

Color thresholds:
- Coverage: 90+ brightgreen, 80–89 green, 70–79 yellowgreen, 60–69 yellow, 50–59 orange, <50 red.
- Tests count: scaled for current project size (>=250 brightgreen ... <60 lightgrey) – adjust as suite grows.
- LOC: Favor smaller core; green under 1k, yellowgreen <5k, yellow <12k, orange <20k, red beyond.

Future ideas: bundle size badge (real metafile integration pending), mutation score, performance timing snapshots.

### DevOps & Security Tooling

- **DevOps**: GitHub Actions, Husky, CommitLint, Makefile workflows
- **Security**: CodeQL, npm audit, CrisisCore Gates, CSP headers

Mutation badge is updated via a weekly workflow; local runs will show "n/a" until a report exists.
>>>>>>> d73cc0d (test: Fix async error assertion)

---

## 🛡️ Security Status

<<<<<<< HEAD
Security is a core principle, not an afterthought. We've implemented a comprehensive, multi-layered security strategy.

- ✅ **Complete CI/CD Pipeline**: Integrated CodeQL, SAST, secret scanning, and dependency audits.
- ✅ **Hardened Development**: Pre-commit hooks enforce security rules before code ever reaches the repository.
- ⚠️ **Dependency Vulnerabilities**: We are actively remediating 77 vulnerabilities found in **development dependencies**.
- ✅ **Production Safety**: These vulnerabilities are confined to our dev tooling and **do not affect the production build** or runtime environment.
- ✅ **Zero Attack Surface**: With all data stored locally, the application has no cloud footprint to attack.

**Security Architecture:**
```mermaid
flowchart LR
  A[Developer] --> B{Pre-Commit Gates};
  B --> C[GitHub Repo];
  C --> D[CI/CD Pipeline];
  D --> E[Production Build];

  subgraph "Local Security Gates"
    direction LR
    B1[Secret Scan] --> B2[Vuln Check] --> B3[Lint & Format];
  end

  subgraph "Automated CI Security"
    direction LR
    D1[CodeQL Scan] --> D2[SAST Analysis] --> D3[Dependency Audit];
  end

  B --> B1;
  D --> D1;
```
=======
### 📊 Comprehensive Pain Tracking

- **Multi-dimensional Pain Assessment**: Pain intensity (0-10), 25+ body locations, 19+ symptom types (incl. nerve)
- **Advanced Analytics**: Trends, heat maps, pattern recognition
- **Historical Tracking**: Full pain history & progression analysis

### 🏥 Healthcare Integration

- **WorkSafe BC Report Generation**: Automated claims/reporting
- **Emergency Response Panel**: Protocols & contact management
- **Clinical Data Export**: CSV & JSON clinician-ready formats

### 💼 Workplace Injury Management

- **Work Impact Assessment**: Missed days, modified duties, limitations
- **Functional Analysis**: ADL impacts & assistance needs
- **Return-to-Work Planning**: Accommodation documentation

### 💊 Treatment & Medication Tracking

- **Medication Management**: Dose, frequency, effectiveness
- **Treatment Logging**: Therapies & outcome tracking
- **Progress Monitoring**: Effectiveness over time

### 🎯 Quality of Life Metrics

- **Sleep Quality Tracking**
- **Mood & Social Impact**
- **Activity Logging**

### 🔧 Advanced Features

- **Nerve Symptom Analysis**
- **Functional Limitations Assessment**
- **Comparison Tracking**
- **Onboarding & Tutorials**

### 🛡️ Privacy & Security

- **Local Data Storage**: No cloud by design
- **Secure Architecture**: CSP + validation layers
- **Data Portability**: Export & backup flows
>>>>>>> d73cc0d (test: Fix async error assertion)

---

## 🧰 Getting Started

### Prerequisites
- **Node.js**: `v18` or higher
- **npm**: `v9` or higher
- **make**: For using the streamlined command aliases.

### Installation
```bash
# 1. Clone the repository
git clone https://github.com/CrisisCore-Systems/pain-tracker.git
cd pain-tracker

# 2. Run the setup script (recommended)
# This installs dependencies, sets up .env, and enables Git hooks.
make setup

<<<<<<< HEAD
# 3. Start the development server
make dev
```
Your application will be running at `http://localhost:5173`.
=======
# Manual setup
npm install --legacy-peer-deps
cp .env.example .env
npm run dev
```

### 🔧 Known Issues & Requirements

**Current Dependencies**: Some legacy peer dependencies are required due to version conflicts in the testing ecosystem (remediation underway).

**Node.js Compatibility**:
- ✅ Node.js 18, 20, 22 supported
- ✅ npm 9+ required
- ⚠️ Use `--legacy-peer-deps` flag during installation
>>>>>>> d73cc0d (test: Fix async error assertion)

---

## 🤝 Contributing & Development

<<<<<<< HEAD
We welcome contributions from security engineers, clinicians, and open-source developers. Please read our [**CONTRIBUTING.md**](CONTRIBUTING.md) for detailed guidelines.
=======
This repo enforces Conventional Commits and strong pre-commit enforcement:

```bash
feat(tracker): add pain heatmap visualization
fix(api): resolve WCB integration timeout
docs(readme): add contributing guidelines
```

**Skip tags:** `[skip lint]`, `[skip build]`, `[skip all]`

---

## 🔧 Detailed Documentation
>>>>>>> d73cc0d (test: Fix async error assertion)

<details>
<summary><strong>Expand for Developer Workflow & Commands</strong></summary>

<<<<<<< HEAD
### Key Commands

Our `Makefile` provides aliases for all common development tasks.

```bash
make help         # Display all available commands
make dev          # Start the Vite development server
make test         # Run the full test suite with Vitest
make check        # Run all checks (lint, type, format, security)
make lint-fix     # Automatically fix linting issues
make badge:all    # Regenerate all dynamic badges
```

### Commit Convention

This repository enforces [Conventional Commits](https://www.conventionalcommits.org/). Commits that do not follow this format will be rejected.

- `feat(scope): add new feature`
- `fix(api): resolve endpoint issue`
- `docs(readme): update installation guide`
- `chore(deps): upgrade dependencies`

### Dynamic Badges

The metrics badges in the header are dynamically generated by scripts in the `/scripts` directory and are updated automatically on pre-push hooks to `main`. This ensures they always reflect the current state of the repository.
=======
**Version**: 0.1.0-dev (Early Development)  
**Build Status**: ✅ Passing (128 tests)  
**Security Status**: ⚠️ Dev dependency vulnerabilities present  
**Deployment**: ✅ GitHub Pages configured

### ✅ Implemented Core Features
- Multi-step assessment (7 steps)
- Interactive analytics & charts
- WorkSafe BC report generation
- Emergency response panel
- Local storage import/export
- Comprehensive test suite (128)
- Security scanning & validation
- Onboarding & tutorial system
- Responsive & accessible UI
- Full TypeScript + Zod

### 🎯 Verified Use Cases
- Individual pain management
- Workplace injury claims
- Healthcare collaboration exports
- Emergency readiness

### 🔄 In Active Development
- Dependency remediation
- Enhanced analytics
- Mobile optimization
- Additional export formats
>>>>>>> d73cc0d (test: Fix async error assertion)

</details>

<details>
<summary><strong>📋 Full Feature List</strong></summary>

<<<<<<< HEAD
- **Multi-dimensional Pain Assessment**: Intensity, 25+ body locations, 19+ symptom types.
- **Advanced Analytics**: Trend charts, location heat maps, and progression analysis.
- **WorkSafe BC Report Generation**: Automate claim and reporting documentation.
- **Emergency Response Panel**: Centralize emergency protocols and contacts.
- **Clinical Data Export**: Generate clinician-ready data in CSV & JSON formats.
- **Work Impact Assessment**: Track missed days, modified duties, and limitations.
- **Medication & Treatment Logging**: Monitor dosage, frequency, and effectiveness over time.
- **Quality of Life Metrics**: Track sleep, mood, and activity levels.
- **Secure Local-First Storage**: All data remains on your device by design.
- **Data Portability**: Full import/export and backup functionality.

</details>

=======
### Prerequisites
- Node.js 18+ (20+ recommended)
- npm 9 or higher
- Git 2.0+

### Health Check
```bash
make doctor
```

### 🔍 Dependency Status Check
```bash
npm audit --audit-level moderate
npm run check-security
```

### Deployment

```bash
# Check deployment status
make deploy-status
# Deploy to staging
make deploy-staging
# Create a release
yarn release-patch | make release-patch
# Health checks
make deploy-healthcheck
# Rollback example
make deploy-rollback ENV=production VERSION=v1.2.3
```

</details>

<details>
<summary>📊 Usage & Features</summary>

### Assessment Steps
1. Pain Assessment
2. Functional Impact
3. Medications
4. Treatments
5. Quality of Life
6. Work Impact
7. Comparison

### Analytics
- Pain history & trends
- Location heat maps
- Progression analysis
- Treatment effectiveness

</details>

<details>
<summary>🔒 Data Privacy & Security</summary>

All tracking data stays local (no remote sync). Export only when you choose. No accounts, no analytics beacons.

Security layers:
- Zod validation
- CSP headers
- Automated scanning
- Regular audit review (in progress)

</details>

<details>
<summary>⚡ Developer Workflow</summary>

### Key Commands
```bash
make help
make dev
make test
make check
make lint-fix
make typecheck
```

Skip checks via commit message tags (e.g. `[skip lint]`).

### Commit Format
```text
<type>(<scope>): <description>
```

</details>

## 🔐 Secure Storage Migration (LocalStorage → secureStorage)

Migrating from raw `localStorage` keys to hardened `secureStorage` abstraction (namespacing, future encryption, deterministic tests). See code comments for migration helpers.

---

## 🚀 Current Development Status

Working: core tracking, analytics, reporting, local persistence, tests, security pipeline.

Active: dependency updates, coverage expansion, mobile tuning, export enhancements.

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Security engineers, clinicians, and OSS devs welcome.

**Security disclosures:** <security@crisiscore.systems>

---

## 🏆 Acknowledgments

- WorkSafe BC guidance
- Clinical model collaborators
- OpenSSF practices
- Chronic pain community feedback

>>>>>>> d73cc0d (test: Fix async error assertion)
---

## 🖤 Built with Empathy, Rigor, and Transparency

<<<<<<< HEAD
This project is a commitment to honest status reporting, privacy-first architecture, and evidence-driven iteration.
=======
Commitment to honest status reporting, privacy-first architecture, layered security, and evidence-driven iteration.
>>>>>>> d73cc0d (test: Fix async error assertion)

**By [CrisisCore Systems](https://github.com/CrisisCore-Systems)**

---

## License

<<<<<<< HEAD
This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
=======
MIT License - see [LICENSE](LICENSE).
>>>>>>> d73cc0d (test: Fix async error assertion)
