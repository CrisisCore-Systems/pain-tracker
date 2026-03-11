# 📊 Pain Tracker — Repository Status & Stats

> **Generated:** 2026-03-11
> **Branch:** `copilot/assess-repo-stat-status` | **Commit:** `84c0820`
> **Version:** 1.2.0 | **License:** MIT

---

## 🗂️ Repository Overview

| Field               | Value                                         |
|---------------------|-----------------------------------------------|
| **Project Name**    | pain-tracker                                  |
| **Version**         | 1.2.0                                         |
| **Author**          | CrisisCore-Systems                            |
| **Website**         | https://paintracker.ca                        |
| **License**         | MIT                                           |
| **Node.js Target**  | 20.x (LTS)                                    |
| **Primary Language**| TypeScript                                    |
| **Architecture**    | Monorepo with 4 workspace packages + Vite/React PWA frontend + Vercel serverless API routes. Express is used in local dev server scripts and the Electron desktop wrapper; it is not part of the deployed serverless surface. |

**Description:**  
A privacy-first, offline-capable chronic pain tracking Progressive Web App (PWA) implementing the *Protective Computing Core v1.0* pattern library. Designed for chronic-pain patients and WorkSafeBC documentation workflows, with local-only encrypted storage and clinician-ready exports.

---

## 📁 Directory Structure

```
pain-tracker/
├── src/                    # Main application source (213,752 LOC)
├── packages/               # Monorepo packages (13,679 LOC)
│   ├── blog/               # Next.js documentation blog
│   ├── design-system/      # Shared UI component library
│   ├── services/           # Shared business-logic services
│   └── utils/              # Shared utility functions
├── api/                    # Vercel serverless API functions
├── api-lib/                # API helper utilities
├── e2e/                    # Playwright end-to-end tests (7,146 LOC)
├── test/                   # Integration test suite
├── database/               # PostgreSQL schema + Prisma ORM + migrations
├── desktop/                # Electron desktop wrapper (desktop/electron/main.cjs)
├── docs/                   # Comprehensive documentation (360 markdown files)
├── deployment/             # nginx + logrotate deployment configs
├── scripts/                # Build, deploy, and automation scripts (18,687 LOC)
├── .github/                # CI/CD workflows (19) + issue templates
└── public/                 # Static assets, PWA manifest, icons
```

---

## 📏 Code Statistics

> **Count methodology:** File counts for `src/`, `packages/`, and `e2e/` are produced by `find <dir> \( -name "*.ts" -o -name "*.tsx" \) | wc -l` (recursive TypeScript scan); their LOC figures use the same recursive `find … | xargs wc -l` pipeline. The `scripts/` file count uses `find scripts/ -maxdepth 1 -type f | wc -l` (79 top-level files; 8 subdirectories with additional scripts also exist but are not included in the table count); the `scripts/` LOC figure is calculated over those same 79 top-level files only. Excludes `node_modules/`, `dist/`, `docs/`, `public/`, and `accessibility-reports/`. Package versions are semver ranges as declared in `package.json`; resolved install versions may differ.

| Scope                             | Files | Lines of Code |
|-----------------------------------|-------|---------------|
| `src/` (application)              | 875   | 213,752       |
| `packages/` (monorepo)            | 113   | 13,679        |
| `e2e/` (Playwright tests)         | 28    | 7,146         |
| `scripts/` (top-level automation files) | 79    | 18,687        |
| **Subtotal (app + pkgs + tests + top-level automation)** | **1,095** | **~253,000** |

Other tracked surfaces not included in the subtotal above: `api/` + `api-lib/` (2,031 LOC), `test/` (40 LOC), `database/` (906 LOC), `.github/workflows/` (YAML), `docs/` (360 Markdown files).

### `src/` TypeScript File Breakdown (all directories)

| Directory                    | TS Files |
|------------------------------|----------|
| `src/components/`            | 370      |
| `src/services/`              | 90       |
| `src/test/`                  | 85       |
| `src/utils/`                 | 70       |
| `src/pages/`                 | 54       |
| `src/design-system/`         | 53       |
| `src/lib/`                   | 34       |
| `src/hooks/`                 | 27       |
| `src/types/`                 | 27       |
| `src/analytics/`             | 7        |
| `src/api/`                   | 7        |
| `src/contexts/`              | 7        |
| `src/config/`                | 5        |
| `src/data/`                  | 4        |
| `src/features/`              | 4        |
| `src/examples/`              | 3        |
| `src/constants/`             | 2        |
| `src/containers/`            | 2        |
| `src/stores/`                | 10       |
| `src/i18n/`                  | 1        |
| `src/routes/`                | 1        |
| `src/schemas/`               | 1        |
| `src/store/`                 | 1        |
| `src/tools/`                 | 1        |
| `src/validation-technology/` | 1        |
| `src/workers/`               | 1        |
| `src/content/`               | 1        |
| `src/context/`               | 1        |
| `src/` root files            | 5        |
| **Total**                    | **875**  |

---

## 🔧 Tech Stack

### Frontend

| Technology              | Version   | Role                              |
|-------------------------|-----------|-----------------------------------|
| React                   | ^18.3.1   | UI framework                      |
| TypeScript              | ^5.7.2    | Type safety                       |
| Vite                    | ^7.1.9    | Build tooling & dev server        |
| Zustand                 | ^5.0.8    | State management                  |
| Zod                     | ^4.1.7    | Schema validation                 |
| React Hook Form         | ^7.63.0   | Form management                   |
| Tailwind CSS            | 3.4.17    | Utility-first styling             |
| Chart.js / Recharts     | 4.4.7 / 3.4.1 | Data visualizations           |
| i18next                 | ^25.5.2   | Internationalization              |

### Backend / API

The deployed API surface consists of **Vercel serverless functions** (`api/` directory). Express is **not** used in the deployed serverless handlers. It appears in:
- `scripts/api-dev-server.js` and `scripts/api-proxy.js` — local development servers that mirror Vercel function behaviour
- `scripts/webhook-dev-server.js` — local webhook testing harness
- `desktop/electron/main.cjs` — Electron desktop wrapper that uses Express to serve the compiled PWA build locally

| Technology              | Version   | Role                                                   |
|-------------------------|-----------|--------------------------------------------------------|
| Vercel Serverless       | —         | Production API runtime (deployed functions)            |
| Express                 | 5.1.0     | Local dev server scripts + Electron PWA server wrapper |
| PostgreSQL (pg)         | 8.16.3    | Relational database (clinic/server-side features)      |
| Prisma ORM              | (schema only, not a direct dep) | Database access layer          |
| Redis                   | 4.3.0     | Session / rate-limit cache                             |
| bcrypt                  | 6.0.0     | Password hashing                                       |
| express-rate-limit      | 8.1.0     | API rate limiting (dev server + Electron paths)        |

### Security / Encryption

| Technology                    | Version  | Role                         |
|-------------------------------|----------|------------------------------|
| libsodium-wrappers-sumo       | 0.7.15   | At-rest encryption (Class A data) |
| crypto-js                     | 4.2.0    | Supplementary cryptography   |
| otplib                        | 13.2.0   | TOTP 2FA                     |

### Testing

| Technology              | Version    | Role                              |
|-------------------------|------------|-----------------------------------|
| Vitest                  | 3.2.4      | Unit & integration testing        |
| Playwright              | ^1.55.1    | End-to-end testing                |
| jest-axe                | ^10.0.0    | Accessibility unit testing        |
| @axe-core/playwright    | ^4.10.2    | Accessibility E2E testing         |
| Stryker                 | 9.5.1      | Mutation testing                  |

### Desktop

| Technology  | Version | Role                                                                 |
|-------------|---------|----------------------------------------------------------------------|
| Electron    | —       | Desktop wrapper (`desktop/electron/main.cjs`). Serves the compiled PWA build via a local Express static server, providing an offline-capable desktop experience. |

### DevOps / Tooling

| Technology          | Version   | Role                                |
|---------------------|-----------|-------------------------------------|
| ESLint              | ^9.35.0   | Linting (TypeScript + React rules)  |
| Prettier            | ^3.8.1    | Code formatting                     |
| Husky               | 9.1.7     | Git hooks (pre-commit, pre-push)    |
| lint-staged         | 16.1.6    | Staged-file linting                 |
| commitlint          | —         | Conventional commit enforcement     |
| CycloneDX           | —         | SBOM generation                     |
| cspell              | —         | Spell checking in code & docs       |

---

## 🧪 Test Coverage

| Category             | Count | Notes                                                                                  |
|----------------------|-------|----------------------------------------------------------------------------------------|
| Unit test files      | 205   | `.test.ts` / `.test.tsx` files colocated throughout `src/` (components, services, utils, etc.) and within `src/test/` (85 files). Many are colocated next to the source they test. |
| E2E test files       | 28    | Playwright tests under `e2e/tests/` (multi-browser, cross-platform)                    |
| Integration tests    | 1     | `test/services/EmpathyIntelligenceEngine.test.ts` (40 LOC, separate `test/` directory) |
| Accessibility audits | 30+   | Generated HTML + JSON report artifacts stored under `accessibility-reports/` — not counted in source LOC |

### Test Commands

```bash
npm run test                # Unit tests (Vitest)
npm run test:coverage       # With V8 coverage report
npm run e2e                 # Full Playwright suite
npm run e2e:smoke           # Smoke tests (mobile + desktop)
npm run accessibility:scan  # WCAG audit
```

---

## ⚙️ CI/CD Pipelines

19 GitHub Actions workflows:

| Workflow File                   | Purpose                              |
|---------------------------------|--------------------------------------|
| `ci.yml`                        | Main CI: lint, typecheck, test, build|
| `security.yml`                  | Dependency + secret scanning         |
| `encryption-check.yml`          | Encryption invariant verification    |
| `mutation.yml` / `mutation-check.yml` | Stryker mutation testing        |
| `e2e-playwright.yml`            | Cross-browser E2E tests              |
| `e2e-playwright-sane.yml`       | Subset E2E (CI-safe)                 |
| `e2e-playwright-windows.yml`    | Windows E2E tests                    |
| `e2e.yml`                       | General E2E suite                    |
| `smoke.yml`                     | Hourly smoke checks                  |
| `coverage.yml`                  | Coverage report upload (Codecov)     |
| `deploy.yml`                    | Production deploy (manual trigger)   |
| `deploy-staging.yml`            | Staging deploy (on push to `main`)   |
| `deploy-preview.yml`            | PR preview deployments               |
| `deploy-ubuntu-vm.yml`          | Ubuntu VM deployment                 |
| `pages.yml`                     | GitHub Pages (docs)                  |
| `release.yml`                   | Release automation (semver tags)     |
| `docs-validate.yml`             | Markdown / docs linting              |
| `devto-auto-publish.yml`        | Dev.to CMS auto-publish              |

---

## 🔐 Security Architecture

| Layer                | Implementation                                    |
|----------------------|---------------------------------------------------|
| **At-rest encryption** | libsodium (IndexedDB payloads, Class A data)   |
| **CSP**              | Vite plugin injects strict Content-Security-Policy|
| **Rate limiting**    | Redis-backed rate limiting for API surfaces via `api-lib/rateLimiter.ts` (Redis with in-memory fallback); `express-rate-limit` is used only in the local dev proxy (`scripts/api-proxy.js`) and is not part of the deployed serverless surface |
| **Authentication**   | bcrypt + TOTP (otplib) for clinic portals         |
| **Secret scanning**  | `scripts/scan-secrets.js` + GitHub Actions        |
| **SBOM**             | CycloneDX generated on each release               |
| **Audit logging**    | Compliance audit events (action/resource/outcome) |
| **Privacy gates**    | `npm run test:privacy-gates` asserts analytics/telemetry boundaries are not crossed in tested code paths |

**Threat model scope:** The app is designed to reduce exposure from lost/stolen devices (at-rest encryption), origin-level script injection risks (CSP), coercive dynamics (panic mode, user control), and shoulder-surfing. It considers common browser-side threats but does not claim to fully defend against a privileged browser extension with unrestricted page access — that risk class is outside the scope of a web app's security boundary. The threat model explicitly does *not* claim protection against OS-level compromise, malware with kernel access, or physical device seizure beyond in-app safety controls.

---

## 📦 Dependencies Summary

| Category            | Count |
|---------------------|-------|
| Production deps     | 52    |
| Dev deps            | 49    |
| **Total**           | **101** |

Notable external services integrated:
- **Stripe** — payment processing (clinic subscriptions)
- **Vercel Analytics** — privacy-scoped deployment analytics
- **Open-Meteo** — weather correlation data (local fetch, no tracking)
- **Dev.to CMS** — automated blog publishing

---

## 🗄️ Database & API

### Database (`database/`)

| File                        | Purpose                              |
|-----------------------------|--------------------------------------|
| `schema.sql`                | Core PostgreSQL schema               |
| `schema.prisma`             | Prisma ORM definitions               |
| `clinic-auth-schema.sql`    | Clinic authentication tables         |
| `migrations/001_*.sql`      | Security enhancement migration       |
| `migrations/002_*.sql`      | Session token extension migration    |

### API Routes (`api/` — Vercel Functions)

| Route                                    | Purpose                        |
|------------------------------------------|--------------------------------|
| `api/health/db.ts`                       | Database health check          |
| `api/clinic/auth/verify.ts`              | Clinic JWT verification        |
| `api/stripe/create-checkout-session.ts`  | Stripe checkout                |
| `api/stripe/webhook.ts`                  | Stripe webhook handler         |
| `api/landing/testimonials.ts`            | Testimonial listing            |
| `api/landing/testimonials_verify.ts`     | Testimonial moderation         |

---

## 📚 Documentation

| Location                   | Count | Notes                                  |
|----------------------------|-------|----------------------------------------|
| `docs/`                    | 360   | Full technical + ops + user-guide docs |
| Root markdown files        | 13    | README, SECURITY, CONTRIBUTING, etc.   |
| `.github/`                 | 6     | Maintainer guides, PR template         |

Key root docs: `README.md`, `QUICKSTART.md`, `SECURITY.md`, `SECURITY_INVARIANTS.md`, `PRIVACY.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `CHANGELOG.md`.

---

## 🛠️ Developer Workflow

### Setup

```bash
make setup      # Install deps + environment setup
make doctor     # Environment diagnostics
```

### Daily Loop

```bash
make dev        # Vite dev server (port 3000)
make test       # Unit tests
make check      # lint + typecheck + build
```

### Quality Gates

```bash
make lint-fix         # Auto-fix lint issues
make typecheck        # TypeScript strict type checking
npm run security-full # Full security audit
```

---

## 📊 Project Health Indicators

| Indicator                      | Status                         |
|--------------------------------|--------------------------------|
| TypeScript strict mode         | ✅ Enabled                     |
| ESLint (TypeScript + React)    | ✅ Configured                  |
| Prettier formatting            | ✅ Enforced via git hooks       |
| Conventional commits           | ✅ commitlint enforced          |
| Unit test suite                | ✅ 205 test files (colocated + src/test/) |
| E2E test suite                 | ✅ Playwright multi-browser (28 files)    |
| Accessibility automation       | ✅ axe-core + WCAG checks       |
| Mutation testing               | ✅ Stryker configured           |
| Secret scanning                | ✅ CI workflow + local script   |
| SBOM generation                | ✅ CycloneDX on release         |
| TODO/FIXME comments in src     | ✅ 0 (clean)                   |
| PWA offline support            | ✅ Service worker + cache       |
| Internationalization           | ✅ i18next integrated           |
| Deployment automation          | ✅ Vercel + Ubuntu VM + preview |

---

## 🗺️ Feature Matrix (High-Level)

| Feature                     | Status |
|-----------------------------|--------|
| Pain entry logging          | ✅ |
| Multi-symptom tracking      | ✅ |
| Medication tracking         | ✅ |
| Mood & mental health logs   | ✅ |
| Local encrypted storage     | ✅ |
| Offline / PWA               | ✅ |
| WorkSafeBC export (CSV/PDF) | ✅ |
| Clinician portal            | ✅ |
| Weather correlation         | ✅ |
| Analytics & visualizations  | ✅ |
| Goal & pacing tracking      | ✅ |
| Fibromyalgia assessments    | ✅ |
| Panic / safety mode         | ✅ |
| Multi-language (i18n)       | ✅ |
| Desktop (Electron wrapper)  | ✅ |
| Stripe subscription billing | ✅ |

> Desktop wrapper entry point: `desktop/electron/main.cjs`

---

*This file is auto-generated as part of the repository assessment workflow.*
