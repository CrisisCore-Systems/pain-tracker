# Changelog

All notable changes to the Pain Tracker project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.0] - 2026-01-18

### Added

- **Advanced Visualizations**: Added a correlation scatter plot (with optional trend line) for pain vs. sleep/mood/stress/activity.
- **Analytics**: Surfaced the body location heatmap and correlation graph in the advanced analytics view.

### Changed

- **Charts**: The shared Chart wrapper now supports scatter plots.

### Tests

- **Analytics**: Added unit coverage for the correlation graph component.

## [1.1.3] - 2026-01-13

### Fixed

- **Persistence**: Persisted PainTracker store data now survives reloads by encrypting Zustand persisted state with the vault (libsodium) and rehydrating after unlock.

### Changed

- **Screenshots**: Refined screenshot showcase routes and refreshed portfolio assets/metadata for marketing and launch workflows.

## [1.1.2] - 2026-01-11

### Changed

- **Docs**: Consolidated and reorganized markdown documentation under `docs/` buckets (planning/engineering/product/ops/security/marketing/etc.) and repaired internal links and indexes.

## [1.1.1] - 2026-01-10

### Fixed

- **Weather Auto-Capture**: Prevented CSP violations by ensuring weather fetches stay same-origin via `/api/weather` (Vite proxy / Vercel rewrites) and removing stray generated service artifacts that bypassed the proxy.
- **Weather Reliability**: Increased geolocation timeout and allowed cached positions so permission prompts don’t cause silent timeouts during entry creation.
- **Tone Selector**: Moved tone preferences to a real Settings panel and persisted them as Class C preferences via secure storage (with legacy migration), reducing confusion with the dev-only tester.

## [1.1.0] - 2026-01-10 - "The Assistant Update"

### Added (Phase 4: Agency)
- **Energy Budget**: New `EnergyStore` and `EnergyBudgetCard` to track daily exertion capacity ("Spoon Theory" support).
- **Intervention Vault**: Offline-first media player (Breathing Pacer) for crisis management.
- **Advocacy Cards**: High-contrast, large-text flash cards for non-verbal communication during episodes.

### Added (Phase 5: Intelligence)
- **Flare Forecast**: Bayesian probabilistic model (`BayesianInferenceService`) that predicts risk levels (Low/Moderate/High) based on sleep, activity load, and triggers.
- **Trigger Detective**: Automated relative risk calculation for tags (e.g., "Stress increases risk by 2.1x").
- **Dashboard Widget**: `FlareForecastWidget` added to the main view.

### Added (Phase 6: Connectivity)
- **Biometric Import**: Ability to parse and import Apple Health XML exports (`export.xml`) exclusively client-side.
- **Encrypted Health Store**: Secure storage for biological data (`health-data-store.ts`).
- **Correlated Charts**: Pain History chart now supports an optional heart rate overlay to visualize physiological stress alongside subjective pain.

### Planned

- Machine learning pain pattern recognition (Q1 2026)
- EMR/EHR integration capabilities (Q2 2026)
- Multi-platform native applications (Q3 2026)

## [1.0.16] - 2026-01-04

### Added

- **Analytics**: Enhanced the Body Heatmap with an over-time grid (location × time buckets) that visualizes average intensity (color) and frequency (counts).
- **Tests**: Added unit coverage for the enhanced Location Heatmap.

### Fixed

- **Validation Technology**: When enabled, it no longer blocks the Body Map entry form and exposes the insights view toggle.

### Security

- **PWA Backups**: Stopped exporting/restoring pending sync queue items to prevent backup files from reintroducing network operations.
- **Background Sync**: Restricted sync-queue replays to same-origin API endpoints (`/api` or `VITE_API_BASE_URL`) and sanitized replayed headers. Mitigates data exfiltration risk where a malicious or corrupted sync-queue item could redirect health data to an attacker-controlled origin when the queue is replayed.
- **Analytics**: Prevented loading remote GA4 scripts until both build-time enablement and explicit user consent are present.

## [1.0.15] - 2025-12-31

### Added

- **Fibromyalgia**: Replaced the placeholder “Patterns & Insights” tab with computed insights.
- **Tests**: Added Vitest coverage for fibromyalgia analytics and diagnostic history.

### Changed

- **Analytics**: Made results deterministic by sorting entries by timestamp and improved flare episode detection and trigger bucketing.

## [1.0.14] - 2025-12-29

### Changed

- **Git Hooks**: Updated the `pre-push` hook to never create commits; it regenerates badge JSONs and
  blocks the push if they changed, requiring an explicit commit.
- **Docs**: Updated README badge documentation to match the new `pre-push` behavior.

## [1.0.13] - 2025-12-29

### Fixed

- **E2E Stability (PWA)**: Prevented Playwright hangs/timeouts by enforcing a stable Vite port and
  replacing indefinite waits with bounded service-worker readiness checks.

### Changed

- **PWA E2E Tests**: Aligned cache assertions to the actual service worker behavior by deriving the expected cache name from `SW_VERSION`.
- **CI/Repo Hygiene**: Stopped tracking Playwright output artifacts so test runs no longer create massive diffs.

## [1.0.12] - 2025-12-29

### Changed

- **Version Update**: Routine version bump and changelog maintenance

## [1.0.11] - 2025-12-29

### Added

- **Voice Commands**: Complete voice command functionality with full action execution
  - Natural language parsing for pain levels ("my pain is 7", "moderate pain", "severe")
  - Body location recognition from speech ("lower back", "neck", "left shoulder")
  - Symptom recognition ("sharp pain", "throbbing", "aching")
  - Navigation commands ("go back", "next", "continue")
  - Action commands ("save", "done", "cancel", "help")
  - Emergency commands ("help me", "call doctor", "emergency")
  - Audio feedback using speech synthesis
- **VoiceCommandService** (`src/services/VoiceCommandService.ts`): Central dispatcher with NL parsing
- **useVoiceCommands hook** (`src/hooks/useVoiceCommands.ts`): React hook for component integration
- **Voice Commands Tests**: 22 comprehensive test cases for voice command parsing and execution

### Changed

- **QuickLogStepper**: Integrated full voice commands with help panel and real-time command feedback

## [1.0.10] - 2025-12-28

### Fixed

- **Accessibility**: Ensured public pages contain a `<main id="main-content">` landmark so primary content is consistently contained by landmarks.

### Changed

- **Tests**: Increased timeout for the `PainTrackerContainer` success toast test to reduce flakiness.

## [1.0.9] - 2025-12-27

### Added

- **Tests**: Added a global Vitest setup that mocks `libsodium-wrappers-sumo` for deterministic, low-cost crypto primitives in unit tests.

### Changed

- **Tests**: Reduced vault KDF cost and silenced crypto init logs in test runs to keep unit tests fast and consistent.
- **Vitest**: Kept `jsdom` as the default environment and limited `happy-dom` usage to opt-in tests.

### Fixed

- **Tests**: Added a `MutationObserver` polyfill to prevent teardown failures in non-browser environments.
- **Zustand persist**: Hardened persisted state hydration against corrupted JSON by using a safe storage wrapper.
- **Test stability**: Refactored persist/migrate coverage to rely on `usePainTrackerStore.persist.rehydrate()`
  rather than module reset/dynamic import behavior.

## [1.0.8] - 2025-12-27

### Fixed

- **Bundling**: Disabled aggressive `chart-vendor` manual chunking that caused `forwardRef` runtime errors with chart libraries.

## [1.0.4] - 2025-12-25

### Security

- **CSP Hardening**: Removed `unsafe-inline` from `script-src` and enforced `object-src 'none'` to address security scan failures.
- **Script Extraction**: Extracted inline theme loader and service worker registration scripts to external files
  (`theme-loader.js`, `sw-register.js`) to comply with strict CSP.

## [1.0.3] - 2025-12-25

### Security

- **Security Headers**: Implemented strict Content Security Policy (CSP), X-Frame-Options, and other security headers
  in `vercel.json` to improve security score (A+ target).

## [1.0.2] - 2025-12-25

### Fixed

- **Landing Page**: Fixed 404 link for the WorkSafeBC case study in the "Featured" section.
- **SEO**: Optimized metadata and descriptions for blog post publishing scripts.

## [1.0.1] - 2025-12-24

### Added

- **Black Box Splash Screen**: Added a "ritual" loading screen with a brutalist glitch effect to signal the secure, offline environment.
- **Vercel Analytics**: Integrated privacy-preserving analytics to track usage patterns.

## [1.0.0] - 2025-12-24

### Changed

- **Official Release** - Transitioned from Beta to Stable.
- Updated documentation to reflect stable status.
- Finalized WorkSafeBC export features.

## [0.1.1-beta] - 2025-12-08

### Added

#### Phase 1.5 Accessibility (WCAG 2.2 AA Target)

- **AccessiblePainSlider** - Accessible pain rating component with:
  - Keyboard navigation (Arrow keys ±1, Home/End 0/10, PageUp/PageDown ±2)
  - ARIA labels and live region announcements for screen readers
  - Optional haptic feedback for mobile devices
  - Direct numeric input field for precise values
  - Stepper buttons (±) for fine control
  - High contrast visual indicators

- **FocusTrap Component** - Modal focus management with:
  - Automatic focus trapping within modal boundaries
  - Escape key handling for dismissal
  - Return focus to trigger element on close
  - Scroll lock to prevent background interaction

- **AccessibleModal Component** - Complete modal solution with:
  - ARIA role="dialog" and aria-modal attributes
  - Proper heading hierarchy (aria-labelledby)
  - Backdrop click handling
  - Keyboard accessibility throughout

#### Enhanced WorkSafe BC PDF Export

- **exportWorkSafeBCPDF** - Professional clinical report generation with:
  - Executive summary with key pain metrics
  - Pain trend analysis with severity classification
  - Functional impact assessment section
  - Work impact documentation (missed work, modified duties)
  - Clinical recommendations based on patterns
  - Legal disclaimer for WorkSafe BC compliance
  - Multi-page support with professional headers/footers
  - Patient and claim information fields
  - Date range filtering for targeted reporting

- **downloadWorkSafeBCPDF** - One-click PDF download utility

#### Test Coverage

- Added a focused test suite for WCB export functionality
- Tests cover edge cases: empty entries, special characters, large datasets

### Verified

- **Panic Mode** - Confirmed fully implemented and integrated in ModernAppLayout
- **PWA Service Worker** - Verified sw.js exists with cache-first strategy
- **Validation UI** - Confirmed enabled by default (VITE_REACT_APP_ENABLE_VALIDATION)

### Changed

- Updated accessibility component exports in `src/components/accessibility/index.ts`
- Added VITE_REACT_APP_ENABLE_VALIDATION=true to `.env.example`

## [0.1.0-beta] - 2025-11-20

### Current State

This version represents the culmination of extensive development through November 2025, including many in-repo components for a SaaS-style deployment (availability varies by deployment and configuration).

### Added - Major Features

#### Core Functionality

- **7-Step Pain Assessment Form** - Multi-dimensional tracking across anatomical locations
- **Empathy Intelligence Engine** - Heuristic-based pain pattern analysis with predictive modeling
- **Trauma-Informed UI** - Comprehensive accessibility system with crisis detection
- **Customizable Dashboard** - Widget-based layout with user preferences
- **WorkSafe BC Export** - CSV/JSON exports for claims and clinical reporting

#### Security & Compliance (Implementation)

- **Multi-Layer Security Architecture** - Client-side encryption, CSP, audit trails
- **Compliance-Oriented Controls** - HIPAA-aligned controls and documentation patterns (not a compliance claim)
- **Zero-Trust Model** - Explicit permission and comprehensive audit logging
- **Encryption Service** - Local-first encryption with secure key management

#### Advanced Analytics

- **Advanced Analytics Engine** - Pattern detection and correlation analysis
- **Pain Analytics Service** - Trend analysis and visualization
- **Predictive Pain Modeling** - 7-day forecasting with pattern recognition
- **Privacy-Preserving Analytics** - Privacy-preserving approaches and minimization (varies by subsystem)

#### Fibromyalgia Support

- **WPI/SSS-Style Scoring** - Scoring helpers and threshold support (not a diagnosis)
- **Fibro Fog Tracking** - Cognitive symptom assessment
- **Flare Pattern Recognition** - Frequency, duration, and trigger correlation
- **Energy Envelope Management** - Activity pacing tools

#### SaaS Infrastructure

- **Stripe Integration** - Complete payment processing
- **Subscription Management** - Free, Basic, Pro, Enterprise tiers
- **Database Layer** - PostgreSQL schema with migration support
- **Feature Gating** - Quota enforcement and upgrade flows

#### PWA Features

- **Service Worker** - Complete offline functionality
- **Local Data Persistence** - IndexedDB with sync queues
- **Background Sync** - Intelligent retry logic with priority queues
- **Install Prompts** - Custom PWA installation experience

#### Clinical Integration

- **Clinical PDF Exporter** - Professional medical reports
- **FHIR Service** - Healthcare data interoperability
- **Healthcare Provider API** - OAuth integration support
- **Data Sharing Protocols** - Secure clinical data exchange

### Added - Infrastructure & Tooling

#### Development Tools

- **TypeScript** - Full type safety across 578+ TypeScript files
- **Vite** - Modern build tooling with optimized bundling
- **Vitest** - Comprehensive unit testing with 90%+ target coverage
- **Playwright** - End-to-end testing across browsers
- **Stryker** - Mutation testing for code quality

#### Code Quality

- **ESLint** - Automated linting with TypeScript support
- **Prettier** - Code formatting automation
- **Husky** - Git hooks for pre-commit validation
- **Commitlint** - Conventional commit message enforcement

#### Security Tooling

- **Security Audit Scripts** - Automated vulnerability scanning
- **SBOM Generation** - Software bill of materials tracking
- **Secret Scanning** - Automated secret detection
- **Dependency Auditing** - Regular security updates

#### Documentation

- **140+ Documentation Files** - Comprehensive guides and references
- **API Documentation** - Complete API reference
- **Deployment Guides** - Step-by-step deployment instructions
- **Security Documentation** - Security architecture and compliance guides

### Added - Component Architecture

#### Major Component Categories (40+ directories)

- Accessibility components and trauma-informed design
- Analytics and visualization components
- Body mapping and anatomical tracking
- Calendar and scheduling
- Clinical portal and healthcare integration
- Dashboard and customization
- Data resilience and offline support
- Export and reporting
- Fibromyalgia-specific features
- Form enhancements and validation
- Goals and progress tracking
- Landing page and onboarding
- Mobile optimization
- Notifications and alerts
- PWA components
- Security components
- Subscription management

### Changed

- **Architecture** - Migrated from monolithic to modular component architecture
- **State Management** - Implemented Zustand with Immer for predictable state
- **Data Storage** - Enhanced IndexedDB with encryption and sync capabilities
- **UI/UX** - Refined trauma-informed patterns and accessibility features

### Fixed

- **Dashboard Overflow** - Resolved text wrapping and spacing issues
- **Mobile Responsiveness** - Improved layouts for smaller screens
- **Offline Functionality** - Enhanced service worker reliability
- **Type Safety** - Resolved TypeScript configuration issues

### Security

- **Encryption Implementation** - AES-GCM for all sensitive data
- **Audit Logging** - Comprehensive event tracking for compliance-oriented auditing (avoid logging sensitive content)
- **CSP Headers** - Content Security Policy for XSS protection
- **Input Validation** - Multi-layer validation with Zod schemas

### Documentation

- **VERSION_ANALYSIS.md** - Comprehensive version state analysis
- **DEPLOYMENT_STATUS.md** - Production readiness checklist
- **PWA-COMPLETE.md** - PWA implementation summary
- **SECURITY_AUDIT.md** - Security vulnerability reports
- **96+ docs/** files - Detailed technical documentation

### Technical Debt

- [x] Validation technology integration (components ready, not fully integrated)
- [ ] Advanced PDF export formatting
- [ ] Complete PWA browser testing
- [x] Git tag implementation for releases
- [x] Automated version bumping workflow

---

## Version History Notes

### Version 0.1.0-beta Timeline

- **2024 Q2-Q3**: Initial architecture and core features
- **2024 Q4**: Security hardening and compliance-oriented controls
- **2025 Q1-Q2**: Advanced analytics and empathy engine
- **2025 Q3**: PWA implementation and trauma-informed UX refinements
- **2025 Q4**: SaaS infrastructure and production readiness

### Statistics (as of 0.1.0-beta)

- **TypeScript Files**: 620+
- **Documentation Files**: 135+
- **Major Services**: 30+
- **Component Directories**: 50+
- **Dependencies**: 108 production packages
- **Lines of Code**: ~50,000+ (estimated)
- **Test Coverage Target**: 90%+

### Contributors

- CrisisCore-Systems development team
- Community contributors (see CONTRIBUTING.md)

### License

MIT License - see LICENSE file for details

---

## Semantic Versioning Guide

This project follows [Semantic Versioning](https://semver.org/):

- **MAJOR** version (X.0.0): Incompatible API changes
- **MINOR** version (0.X.0): New features, backward compatible
- **PATCH** version (0.0.X): Bug fixes, backward compatible
- **Pre-release** tags: -alpha, -beta, -rc

### Version Progression Plan

- `0.1.0-beta` → Current active development beta
- `0.9.0-beta` → Feature-complete beta (proposed)
- `1.0.0-beta` → Production beta (proposed)
- `1.0.0` → First stable production release

---

**Note**: This CHANGELOG was created on 2025-11-20 to establish version tracking going forward. Prior version
history has been reconstructed from git commits and documentation analysis.

For detailed version analysis, see [VERSION_ANALYSIS.md](VERSION_ANALYSIS.md).
