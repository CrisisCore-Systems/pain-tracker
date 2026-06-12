# Pain Tracker | CrisisCore Systems

<!-- markdownlint-disable MD013 MD033 -->

[![Continuous Integration Workflow Status](https://github.com/CrisisCore-Systems/pain-tracker/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/CrisisCore-Systems/pain-tracker/actions/workflows/ci.yml)
[![Smoke Tests Workflow Status](https://github.com/CrisisCore-Systems/pain-tracker/actions/workflows/smoke.yml/badge.svg?branch=main)](https://github.com/CrisisCore-Systems/pain-tracker/actions/workflows/smoke.yml)
[![Code Coverage Percentage](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/CrisisCore-Systems/pain-tracker/main/badges/coverage-badge.json)](https://github.com/CrisisCore-Systems/pain-tracker/actions)
[![Security Vulnerabilities Count](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/CrisisCore-Systems/pain-tracker/main/badges/security-badge.json)](https://github.com/CrisisCore-Systems/pain-tracker/security)
[![MIT License Badge](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.18887610.svg)](https://doi.org/10.5281/zenodo.18887610)

> Privacy-first, offline-capable pain documentation for people living with chronic pain.

Pain Tracker helps people record pain, symptoms, treatments, and work impact, then export structured summaries for appointments, claim-related discussions, and personal records. The core app is local-first by default. Optional network, clinic, weather, publishing, and payment paths are treated as explicit trust boundaries rather than baseline requirements.

## Current Status

- App package version: `1.2.0`
- Runtime target: Node `>=22.12.0 <23`, npm `>=9`
- Tests badge: 440
- Coverage badge: 89%
- Security badge: 0 known vulnerability count
- LOC badge: 173,234
- Bundle badge: 6.32MB
- Mutation badge: n/a
- Canonical trust artifact: PainTracker Protective Computing Reference Packet v1.0, dated 2026-05-09
- Production app: https://www.paintracker.ca
- Core posture: local-first, offline-capable, no account required for core tracking
- Evidence posture: self-attested / repo-backed candidate reference implementation; not certified
- Active draft work: First Entry Loop PR #173 is open and not merged

<p align="center">
  <img src="docs/screenshots/main-dashboard.png" alt="Pain Tracker dashboard" style="max-height: 420px; width: auto; max-width: 100%; object-fit: contain; display: block; margin: 0 auto;" />
</p>

<p align="center">
  <a href="https://www.paintracker.ca"><strong>Private Offline Pain Tracker</strong></a> | <a href="https://www.paintracker.ca/case-study"><strong>Case Study</strong></a> | <a href="https://www.paintracker.ca/proof"><strong>Proof</strong></a> | <a href="docs/user-guide/INSTALL.md"><strong>Install</strong></a> | <a href="PRIVACY.md"><strong>Privacy</strong></a> | <a href="docs/user-guide/EXPORT_DATA.md"><strong>Export Guide</strong></a> | <a href="docs/README.md"><strong>Docs</strong></a>
</p>

## Key Resource Paths

These are the primary product and resource paths used in external references.

- [Private offline pain tracking app](https://www.paintracker.ca)
- [Download a private pain tracker](https://www.paintracker.ca/download)
- [Chronic pain tracking resources](https://www.paintracker.ca/resources)
- [PainTracker pricing and upgrades](https://www.paintracker.ca/pricing)
- [Free pain journal templates](https://www.paintracker.ca/resources/daily-pain-tracker-printable)
- [What to include in a pain journal](https://www.paintracker.ca/resources/what-to-include-in-pain-journal)
- [How to track pain for doctors](https://www.paintracker.ca/resources/how-to-track-pain-for-doctors)
- [Pain journal for appointments](https://www.paintracker.ca/resources/doctor-visit-pain-summary-template)
- [WorkSafeBC pain documentation tool](https://www.paintracker.ca/resources/worksafebc-pain-journal-template)
- [Tracking and data policy](https://www.paintracker.ca/tracking-data-policy)
- [Privacy architecture](https://www.paintracker.ca/privacy-architecture)
- [Pain Tracker whitepaper](https://www.paintracker.ca/whitepaper)
- [PMMP provider review](https://www.paintracker.ca/providers/pmmp)
- [Private offline pain tracker app guide](https://www.paintracker.ca/pain-tracker-app)

The public site includes a resource acquisition layer under `/resources/*`, including printable pain trackers, appointment-prep sheets, disability/workers-compensation documentation pages, condition-specific tracking pages, and device-specific offline tracking pages. These pages are part of the product funnel. Resource funnel measurement is intentionally constrained: health content, symptom text, medications, notes, attachments, export contents, claim details, identity, and persistent profiling are not measured.

## Why This Exists

Pain Tracker exists because standard health software often assumes stable housing, reliable internet, cognitive surplus, safe disclosure conditions, and uninterrupted sessions. This project is built around Protective Computing: a design discipline for systems that must remain legible and useful under pain, fatigue, interruption, weak infrastructure, and coercive conditions.

That posture shapes the architecture: local-first storage, user-controlled export, plain recovery paths, and explicit trust boundaries for anything that reaches beyond the device.

- Full origin story: [Coding Through Collapse - Why This App Forgets You Exist](https://blog.paintracker.ca/coding-through-collapse)
- Protective Computing introduction: [Architecting for Vulnerability: Introducing Protective Computing Core v1.0](https://dev.to/crisiscoresystems/architecting-for-vulnerability-introducing-protective-computing-core-v10)
- Canonical paper: Overton, K. (2026). Protective Computing Canon v1.0. DOI: [10.5281/zenodo.18887610](https://doi.org/10.5281/zenodo.18887610)

## Core Features

| Area | Current capability |
| --- | --- |
| Daily tracking | One-screen quick log, daily check-in, edit/history flows, local persistence |
| Review surfaces | Clinical dashboard, calendar view, history page, body map, analytics dashboard |
| Reporting | Reports page with user-controlled export flows for appointment and WorkSafeBC-oriented documentation |
| Specialized workflows | Fibromyalgia hub, body-location capture, occupational/work-impact fields, treatment/medication notes |
| PWA behavior | Offline banner, install prompt, PWA status indicator, service-worker management |
| Onboarding | First-run onboarding, mock analytics preview, walkthrough/tutorial flow |
| Accessibility | Keyboard shortcuts, focus-aware UI, trauma-informed provider, display/workflow preferences + navigation visibility controls |
| Monetization boundary | Free/Basic/Pro/Enterprise surfaces, with local tracking preserved outside payment dependency |
| Workflow preferences | Local settings for industrial field mode, WCB template style, and Fibromyalgia Hub navigation visibility without reload |

Deeper product detail lives in [docs/product](docs/product) and the broader docs index at [docs/README.md](docs/README.md).

## Trust Boundaries

Pain Tracker is local-first by default.

The canonical PainTracker implementation artifact is the PainTracker Protective Computing Reference Packet v1.0. Legacy mappings are retained only as historical drafts until rewritten against the current repository, CI evidence, and claim badge taxonomy.

Protective Computing Specification v1.0 is a founder-authored normative design specification. Current implementation claims are conformance claims, not certification. PainTracker is a candidate reference implementation with a public reference packet, explicit limitations, and bounded evidence anchors. It is not certified. Its current posture is Level 2 to Level 3 alignment where evidence exists, with unresolved gaps in active-coercion resistance, accessibility-complete degraded mode, and external review.

| Boundary | Default | Notes |
| --- | --- | --- |
| Pain entries and symptom history | Local device storage | Sharing happens through explicit export flows |
| Analytics | Local-first | No surveillance analytics required for core use |
| Weather correlation | Optional network call | Must be explicitly configured and treated as an external dependency |
| Clinic workflows | Deployment-specific | Optional backend paths are not required for core tracking |
| Payments / upgrades | Optional and non-core | Pricing/upgrades surfaces may exist, but core local tracking must not depend on Stripe, accounts, subscriptions, or payment-service availability |
| Publishing and SEO automation | Maintainer-only tooling | Scripts read markdown from `docs/notes` and may call third-party publishing APIs when explicitly run |
| Search Console dashboard | Maintainer-only optional client-side tool | OAuth token is user-provided, tab-local, not persisted, readonly scope, no server-side storage |
| Compliance posture | No compliance claim | Privacy-aligned architecture and controls only |

For trust and reversibility framing, see [docs/trust/paintracker-protective-computing-reference-packet-v1.0.md](docs/trust/paintracker-protective-computing-reference-packet-v1.0.md), [docs/trust/README.md](docs/trust/README.md), and [SECURITY_INVARIANTS.md](SECURITY_INVARIANTS.md).

## Repository Map

| Path | Purpose |
| --- | --- |
| `src/` | Main React/Vite PWA, components, stores, services, tests, and local app routes |
| `packages/design-system/` | Shared UI/design-system package used by the app |
| `packages/services/` | Shared service package compiled before app builds |
| `packages/utils/` | Shared utility package compiled before app builds |
| `packages/blog/` | Next.js public site/blog build surface |
| `pages/` | Static/page-source content used for public-facing routes and copy surfaces |
| `research/` | Research, study, and evaluation planning artifacts |
| `security/` and `security-reports/` | SBOM, audit, and security report artifacts |
| `api/` and `api-lib/` | Optional Vercel-style endpoints and shared server helpers |
| `docs/` | User, engineering, trust, product, accessibility, SEO, and planning docs |
| `docs/notes/` | Active publishing markdown sources used by Hashnode and related scripts |
| `docs/archive/` and `archive/` | Historical drafts, disabled APIs, old reports, and traceability artifacts |
| `e2e/` | Playwright smoke, degraded-mode, PWA, and accessibility tests |
| `scripts/` | Build, validation, privacy, badge, screenshot, publishing, and deployment utilities |
| `database/` and `deployment/` | Optional backend schema, migrations, and deployment support files |
| `desktop/` | Electron desktop wrapper assets |
| `starter-kit/` | Protective Computing claim and evidence templates |

Generated local outputs such as `accessibility-reports/`, `test-results/`, `coverage/`, `dist/`, `.vite/`, `artifacts/`, and `evidence/` are ignored. Commit reusable source, curated docs, or explicit archive summaries instead of raw generated runs.

## Architecture

Pain Tracker is a React and TypeScript PWA using Vite, Zustand, Zod, IndexedDB-oriented storage, local analytics, and export pipelines designed around local durability and auditability. The public web/blog surface is built separately from `packages/blog`.

```mermaid
flowchart LR
    A[User input] --> B[Zod validation]
    B --> C[Zustand state update]
    C --> D[Local persistence]
    D --> E[Local analytics]
    D --> F[User-controlled export]
    G[Optional network integrations] -. explicit configuration .-> C
```

- Architecture overview: [docs/engineering/ARCHITECTURE.md](docs/engineering/ARCHITECTURE.md)
- Deep dive: [docs/engineering/ARCHITECTURE_DEEP_DIVE.md](docs/engineering/ARCHITECTURE_DEEP_DIVE.md)
- Data flow diagrams: [docs/diagrams/README.md](docs/diagrams/README.md)

## Getting Started

Pain Tracker is developed primarily on Windows with PowerShell. The repo expects Node `>=22.12.0 <23` and npm `>=9`.

```powershell
git clone https://github.com/CrisisCore-Systems/pain-tracker.git
Set-Location .\pain-tracker
npm ci
npm run dev
```

Open the local app at the Vite URL shown in the terminal.

Core verification commands:

```powershell
npm run docs:validate
npm run check:quick
npm run build
```

For a fuller setup path, see [docs/user-guide/INSTALL.md](docs/user-guide/INSTALL.md), [QUICKSTART.md](QUICKSTART.md), and [docs/engineering/DEVELOPER_COMMANDS.md](docs/engineering/DEVELOPER_COMMANDS.md).

## Configuration

- Validation UI flags: `VITE_REACT_APP_ENABLE_VALIDATION` and `VITE_ENABLE_VALIDATION_TECH`
- Analytics subsystem: `VITE_ENABLE_ANALYTICS` defaults to disabled unless explicitly set to `true`
- Local API server: `npm run dev:api` runs optional Vercel-style API functions for local testing
- Full Vercel build: `npm run build:vercel` builds packages, the PWA app, copies the app bundle, then builds `packages/blog`
- Search Console dashboard: `/seo/search-console-dashboard` uses a manually supplied OAuth token with `webmasters.readonly`; token is not stored by the app
- Optional clinic, weather, payment, and publishing paths require explicit environment configuration

Some older deployment/Stripe/subscription docs are historical or experimental. Treat local-first tracking as the canonical supported path unless a backend feature is explicitly documented as current.

Use [.env.example](.env.example) for non-secret configuration shape. Do not commit `.env`, `.env.local`, tokens, webhooks, API keys, or user data.

## Build and Deployment Surfaces

PainTracker has multiple build/deployment surfaces:

- `npm run build`: generates sitemap, builds the Vite app, and prerenders public routes.
- `npm run build:vercel`: builds shared packages, builds/copies the PWA app, then builds `packages/blog`.
- `scripts/vercel-build.mjs`: Vercel entrypoint; builds shared packages, validates environment/trust/clinic-auth guards, builds Vite, then prerenders public routes.
- `.github/workflows/deploy.yml`: GitHub Pages deploy workflow using the built `dist/` artifact.

## Testing and Quality

Automated coverage and vulnerability posture are published through the generated badges above. Source, Playwright, SEO, privacy, and publishing tests live under `src/`, `e2e/`, and `test/`.

Primary quality gates:

```powershell
npm run docs:validate
npm run claims:validate
npm run check:quick
npm run check
npm run security-full
```

Focused commands and workflows live in [docs/engineering/DEVELOPER_COMMANDS.md](docs/engineering/DEVELOPER_COMMANDS.md). Current automated metrics are published through the badges at the top of this README.

### Focused Commands

| Need | Command |
| --- | --- |
| Fast local confidence | `npm run check:quick` |
| Full CI-style verification | `npm run check` |
| Privacy/telemetry boundary checks | `npm run test:privacy-gates` |
| SEO route/schema/sitemap checks | `npm run test:seo && npm run seo:check-sitemap-sync` |
| Browser smoke coverage | `npm run e2e:smoke` |
| PWA verification | `npm run e2e:pwa` |
| Vercel/public web build | `npm run build:vercel` |
| Badge refresh | `npm run badge:all` |

## Known Security / Audit Status

- No high/critical production vulnerabilities in the latest lockfile remediation branch.
- Known remaining issue: moderate production vulnerabilities remain in the `brace-expansion -> minimatch -> glob` dependency chain.
- Do not market the app as certified, compliant, or clinically validated.

## Security

- Local-first storage and selective encryption helpers for sensitive data
- CSP, security scans, secret scanning, and trust-claims validation in repo workflows
- Audit/event logging patterns designed to avoid reconstructing sensitive user content
- Private vulnerability reporting guidance in [SECURITY.md](SECURITY.md)

Start with [SECURITY.md](SECURITY.md), [SECURITY_INVARIANTS.md](SECURITY_INVARIANTS.md), and [docs/trust/threat-model.md](docs/trust/threat-model.md).

Background sync is constrained by a method/path allowlist and is local-only unless an authorized destination exists. Adding replayable endpoints must update the allowlist, tests, and human-readable justification.

Known trust gaps remain explicit:
- Active-coercion resistance is not fully implemented/reviewed;
- Degraded-functionality accessibility evidence is partial;
- External review/certification has not been completed.

## In Flight

| Work | Status | Trust boundary |
| --- | --- | --- |
| First Entry Loop | Draft PR #173 | Local save confirmation, no telemetry, no backend intake, no hidden feedback submission |

## Roadmap

### Draft / Pending

- First Entry Loop: open draft PR #173. Not shipped on `main` yet. Includes additional security/storage primitives (duress, camouflage, WAL) that are currently experimental and inactive in production paths.

Current 2026 priorities:

1. Strengthen local-only analytics and visualizations without adding surveillance surfaces.
2. Expand export and reporting defensibility for appointment and WorkSafeBC-related workflows.
3. Improve degraded-mode resilience, especially around persistence, recovery, and PWA behavior.
4. Tighten trust-boundary documentation for optional integrations and deployment-specific backend paths.
5. Continue accessibility and trauma-informed UX hardening against the WCAG 2.2 AA target.
6. Ship first-entry onboarding without adding telemetry or backend intake.
7. Maintain SEO/resource pages, sitemap generation, and Search Console review tooling.
8. Replace stale backend/subscription quickstart language with local-first-first setup docs.

Longer-form planning lives under [docs/planning](docs/planning) and [docs/index](docs/index). Some planning files are historical and may reference older release numbers. Treat the README, `package.json`, the trust reference packet, and badge files as the current top-level status anchors.

## Documentation

Use the docs hub for longform material: [docs/README.md](docs/README.md)

- User docs: [docs/user-guide/INSTALL.md](docs/user-guide/INSTALL.md), [docs/user-guide/FAQ.md](docs/user-guide/FAQ.md), [docs/user-guide/EXPORT_DATA.md](docs/user-guide/EXPORT_DATA.md)
- Engineering docs: [docs/engineering/ARCHITECTURE.md](docs/engineering/ARCHITECTURE.md), [docs/engineering/DEVELOPER_COMMANDS.md](docs/engineering/DEVELOPER_COMMANDS.md)
- Trust and security docs: [docs/trust/README.md](docs/trust/README.md), [SECURITY.md](SECURITY.md), [SECURITY_INVARIANTS.md](SECURITY_INVARIANTS.md)
- Product and research docs: [docs/product](docs/product), [docs/papers](docs/papers)
- Screenshot and marketing references: [docs/marketing/SCREENSHOT_PORTFOLIO.md](docs/marketing/SCREENSHOT_PORTFOLIO.md), [docs/screenshots/light-mode/README.md](docs/screenshots/light-mode/README.md)

## Contributing

Contributions should preserve local authority, exposure minimization, reversibility, degraded-mode resilience, coercion resistance, and truthful documentation.

- Contribution guide: [CONTRIBUTING.md](CONTRIBUTING.md)
- Repo operating rules for agents and reviewers: [AGENTS.md](AGENTS.md)
- Commit conventions and developer workflows: [docs/engineering/DEVELOPER_COMMANDS.md](docs/engineering/DEVELOPER_COMMANDS.md)

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
