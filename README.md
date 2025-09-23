# 🩺 Pain Tracker | CrisisCore Systems

[![Security Status](https://img.shields.io/badge/security-hardened-green)](./security/)
[![Beta](https://img.shields.io/badge/status-beta-yellow)](https://github.com/CrisisCore-Systems/pain-tracker/issues)
[![Test Coverage](https://img.shields.io/badge/coverage-90%25-brightgreen)](./coverage/)
[![TypeScript](https://img.shields.io/badge/typescript-76.1%25-blue)](https://www.typescriptlang.org/)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> **A security-first, offline-capable chronic pain tracking application built with empathy and clinical-minded design.**

Pain Tracker provides high-resolution, multidimensional pain tracking with a security-first, local-first architecture. It includes clinical-focused exports and tooling for WorkSafe BC reporting. Some advanced analytics and integrations are in active development; see the implementation snapshot in `.github/copilot-instructions.md` for current status.

---

## 🎯 **Vision & Mission**

**Vision:** Transform chronic pain management through technology that respects patient privacy while delivering clinical-grade insights.

**Mission:** Bridge the gap between patient experience and clinical understanding through comprehensive, secure, and accessible pain tracking technology.

---

## 🌟 **Core Features**

### 📊 **Advanced Pain Analytics**
- **Multidimensional Tracking**: 7-step assessment across 25+ anatomical locations
- **Symptom Complexity**: 19+ symptom types with severity gradients
- **Pattern Recognition**: AI-assisted trend analysis and correlation detection (core heuristics implemented; advanced predictive models are in development)
- **Visual Heatmaps**: Body mapping with temporal progression visualization (basic heatmaps implemented; advanced visualizations in progress)

### 🏥 **Clinical Integration**
- **WorkSafe BC Compliance**: Automated claims generation and reporting
- **Healthcare Exports**: Clinician-ready CSV/JSON data exports
- **Evidence-Based Metrics**: Validated pain assessment scales
- **Treatment Correlation**: Outcome tracking and intervention analysis

### 🔒 **Security Architecture**
- **Local-First Data**: Primarily local storage (IndexedDB) with selective encryption; full enterprise-grade encrypted IndexedDB layer is planned.
- **Enterprise Hardening**: CSP, SAST pipelines, secret scanning
- **Threat Modeling**: Continuous security assessment and mitigation
- **Compliance Ready**: HIPAA-aligned data handling practices

### 💊 **Comprehensive Tracking**
- **Medication Management**: Dosage tracking, side effect monitoring
- **Treatment Protocols**: Therapy session logging and effectiveness analysis
- **Quality of Life**: Mood, sleep, and activity impact correlation
- **Emergency Protocols**: Core emergency UI and simulation dashboards exist; automated external escalation and integrations are pending

---

## 🏗️ **Technical Architecture**

### **Frontend Stack**
- **React 18** with TypeScript for type-safe development
- **Vite** for lightning-fast development and optimized builds
- **Tailwind CSS** + **Headless UI** for responsive, accessible design
- **Zustand** for predictable state management

### **Data & Validation**
- **Zod Schemas** for runtime type validation and data integrity
- **IndexedDB wrapper** for sophisticated offline-first data management
- **Event-driven sync** with conflict resolution and prioritized queues
- **Immutable updates** (e.g. Immer) and forward-compatible shims

### **Analytics & Visualization**
- **Recharts** & **Chart.js** for interactive data visualization
- **Custom Heatmap Engine** for anatomical pain mapping
- **Temporal Analysis** with trend detection algorithms
- **Export Pipelines** for clinical and insurance reporting

### **Quality Assurance**
- **Vitest** testing framework with **@testing-library/react**
- **Stryker Mutator** for mutation testing and code quality
- **ESLint** + **TypeScript** for code consistency
- **Husky** + **CommitLint** for development workflow enforcement

### **DevOps & Security**
- **GitHub Actions** CI/CD with security scanning
- **CodeQL** static analysis and vulnerability detection
- **Dynamic Badge Generation** for real-time project metrics
- **Makefile Workflows** for standardized development processes

---

## 🛡️ **Security Posture**

| Security Layer | Implementation | Status |
|----------------|----------------|--------|
| **Data Storage** | Local IndexedDB only, no external transmission | ✅ Active |
| **Code Analysis** | CodeQL, ESLint security rules, SAST pipeline | ✅ Active |
| **Dependency Management** | Automated scanning, SBOM generation | ✅ Active |
| **Secret Protection** | Pre-commit scanning, .env validation | ✅ Active |
| **Runtime Security** | CSP headers, input validation, XSS protection | ✅ Active |

**Current Security Status:** 
- ✅ Production dependencies: Clean
- ⚠️ Development dependencies: Minor tooling vulnerabilities (non-runtime impact)
- 🔄 Ongoing remediation of dev-tool security advisories

---

## 📁 **Project Structure**

```
src/
├── components/          # Reusable UI components
├── containers/          # Page-level components and layouts
├── stores/             # Zustand state management
├── services/           # Data persistence and sync logic
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── validation-technology/ # Zod schemas and validation
├── lib/                # Core utilities and helpers
├── design-system/      # Design tokens and system components
├── workers/            # Web Workers for background processing
├── i18n/               # Internationalization support
└── test/               # Test utilities and fixtures
```

---


## 🚀 Getting Started

-### **Prerequisites**
- Node.js 20 (LTS) is the standardized version for development and CI. Older LTS versions (18) may work, but CI and workflows are aligned to Node 20.
-
- Note: an `.nvmrc` file has been added to the repository to pin the Node.js version for local development.
 - npm 9+
 - Modern browser with IndexedDB support

### Canvas on Windows

If you are developing on Windows or running CI on Windows runners, follow the detailed instructions in `docs/CANVAS_WINDOWS_PREREQS.md` to install Visual Studio Build Tools or MSYS2 and the native `cairo` dependencies required by `canvas@3.x`.

### Badges
Badges (tests, coverage, security, LOC, issues, PRs, commit activity) are generated
by scripts in `scripts/` and stored under `badges/` for Shields.io.

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

The pre-push hook (`.husky/pre-push`) auto-regenerates and commits badge JSONs when
pushing `main` to keep them current.

Color thresholds:

- Coverage: 90+ `brightgreen`, 80–89 `green`, 70–79 `yellowgreen`,
  60–69 `yellow`, 50–59 `orange`, <50 `red`
- LOC thresholds favor smaller core (adjust as needed)

### Development Setup

```bash
# Clone the repository
git clone https://github.com/CrisisCore-Systems/pain-tracker.git
cd pain-tracker

# Install dependencies
npm install

# Start development server
npm run dev

# Run comprehensive tests
npm run test:coverage
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to GitHub Pages
npm run deploy
```

## 🧪 **Testing & Quality**

### **Testing Strategy**
- **Unit Tests**: Component and utility function testing
- **Integration Tests**: Store and service interaction testing  
- **Mutation Testing**: Code quality and test effectiveness analysis
- **Security Testing**: Automated vulnerability and penetration testing

### **Quality Metrics**
```bash
# Run all tests with coverage
npm run test:coverage

# Generate security audit
npm run security-full

# Update project metrics
npm run badge:all

# Health check
npm run doctor
```

---

## 📋 **Compliance & Standards**

### **Healthcare Standards**
- **FHIR Compatibility**: Structured data export capabilities
- **HL7 Alignment**: Healthcare data interchange standards
- **Clinical Validation**: Evidence-based assessment methodologies

### **Regional Compliance**
- **WorkSafe BC**: Automated claims and reporting integration
- **Privacy Legislation**: PIPEDA and provincial privacy law alignment
- **Accessibility**: WCAG 2.1 AA compliance target

---

## 🤝 **Contributing**

We welcome contributions that advance the mission of empathetic, secure healthcare technology.

### **Development Process**
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** with conventional commits (`git commit -m 'feat: add amazing feature'`)
4. **Test** comprehensively (`npm run test:coverage && npm run security-full`)
5. **Submit** a pull request

### **Code Standards**
- TypeScript strict mode required
- 90%+ test coverage for new features
- Security review for all data-handling code
- Accessibility compliance for UI components

---

## 📊 **Project Metrics**

| Metric | Value | Badge |
|--------|-------|-------|
| **Test Coverage** | 90%+ | ![Coverage](./badges/coverage.svg) |
| **Security Score** | A+ | ![Security](./badges/security.svg) |
| **Lines of Code** | 15K+ | ![LOC](./badges/loc.svg) |
| **Bundle Size** | <2MB | ![Bundle](./badges/bundle.svg) |

---

## 🔮 **Roadmap**

- **Phase 1: Foundation** *(Current)*
- Core pain tracking functionality
- Security hardening and compliance (ongoing)
- 🔄 Development dependency remediation

### **Phase 2: Intelligence** *(Q2 2025)*
- 🎯 Machine learning pain pattern recognition
- 🎯 Predictive analytics for pain episodes
- 🎯 Advanced treatment correlation analysis

### **Phase 3: Integration** *(Q3 2025)*
- 🎯 EMR/EHR system integration
- 🎯 Telehealth platform connectivity
- 🎯 Wearable device data integration

### **Phase 4: Ecosystem** *(Q4 2025)*
- 🎯 Multi-platform native applications
- 🎯 Healthcare provider dashboard
- 🎯 Research data anonymization platform

---

## 📄 **Documentation**

- **[Architecture Deep Dive](ARCHITECTURE_DEEP_DIVE.md)** - Technical implementation details
- **[Contributing Guide](CONTRIBUTING.md)** - Development and contribution guidelines
- **[Security Policy](security/)** - Security practices and vulnerability reporting
- **[PWA Implementation](PWA-COMPLETE.md)** - Progressive Web App features
- **[Empathy Framework](EMPATHY_ENHANCEMENT_SUMMARY.md)** - User experience philosophy

---

## 📞 **Support & Contact**

- **Issues**: [GitHub Issues](https://github.com/CrisisCore-Systems/pain-tracker/issues)
- **Security**: See [SECURITY.md](SECURITY.md) for vulnerability reporting
- **General**: Visit [CrisisCore Systems](https://github.com/CrisisCore-Systems)

---

## 📜 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 **Acknowledgments**

- **Pain Management Community**: For insights and validation
- **Healthcare Professionals**: For clinical guidance and feedback  
- **Security Community**: For vulnerability research and hardening advice
- **Open Source Contributors**: For the foundational technologies that make this possible

---

<div align="center">

**Built with ❤️ for those who need it most**

*Pain Tracker - Where Technology Meets Compassion*

</div>
=======
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

Current core features (implemented or partially implemented):

- Multi-step assessment (7 steps) — implemented
- Interactive analytics and charts — implemented (trend charts)
- WorkSafe BC report generation (CSV/JSON) — implemented; PDF export partial
- Emergency response panel — partial (core UI implemented)
- Local storage import/export — implemented (selective encryption wrappers)
- Comprehensive test suite — implemented for core services; coverage targets ongoing
- Security scanning and validation — implemented for CI; dev-dependency remediation ongoing
- Onboarding and tutorial system — basic flows implemented
- Responsive, accessible UI — implemented with trauma-informed patterns
- Full TypeScript + Zod — implemented

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
>>>>>>> e82c41c (chore: Update generated badges\n\nAuto-generated badge updates)
