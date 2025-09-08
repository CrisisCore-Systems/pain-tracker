# Pain Tracker

[![Security Scan](https://github.com/CrisisCore-Systems/pain-tracker/actions/workflows/security.yml/badge.svg)](https://github.com/CrisisCore-Systems/pain-tracker/actions/workflows/security.yml)
[![CI/CD Pipeline](https://github.com/CrisisCore-Systems/pain-tracker/actions/workflows/ci.yml/badge.svg)](https://github.com/CrisisCore-Systems/pain-tracker/actions/workflows/ci.yml)
[![CodeQL](https://github.com/CrisisCore-Systems/pain-tracker/actions/workflows/codeql.yml/badge.svg)](https://github.com/CrisisCore-Systems/pain-tracker/actions/workflows/codeql.yml)
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/CrisisCore-Systems/pain-tracker/badge)](https://securityscorecards.dev/viewer/?uri=github.com/CrisisCore-Systems/pain-tracker)

A comprehensive pain and injury management system designed for individuals with chronic conditions and workplace injuries. Built with healthcare professionals and WorkSafe BC integration in mind.

> **Current Status**: Early Development (v0.1.0) - Core features implemented and functional

## Features

### 📊 Comprehensive Pain Tracking
- **Multi-dimensional Pain Assessment**: 
  - Pain intensity (0-10 scale) with visual feedback
  - 25+ specific body locations including detailed leg/foot mapping
  - 19+ symptom types including nerve-specific symptoms
- **Advanced Analytics**: Interactive charts showing pain trends, location heat maps, and pattern recognition
- **Historical Tracking**: Complete pain history with progression analysis

### 🏥 Healthcare Integration
- **WorkSafe BC Report Generation**: Automated report creation for workplace injury claims
- **Emergency Response Panel**: Emergency contacts, protocols, and real-time pain monitoring
- **Clinical Data Export**: Professional-grade CSV and JSON exports for healthcare providers

### 💼 Workplace Injury Management
- **Work Impact Assessment**: Track missed days, modified duties, and workplace limitations
- **Functional Analysis**: Monitor activities of daily living and assistance requirements
- **Return-to-Work Planning**: Document accommodations and workplace modifications

### 💊 Treatment & Medication Tracking
- **Medication Management**: Track current medications, dosages, frequency, and effectiveness
- **Treatment Logging**: Record therapies, appointments, and treatment outcomes
- **Progress Monitoring**: Analyze treatment effectiveness over time

### 🎯 Quality of Life Metrics
- **Sleep Quality Tracking**: Monitor how pain affects rest and recovery
- **Mood & Social Impact**: Track emotional and social consequences of pain
- **Activity Logging**: Record daily activities and their impact on pain levels

### 🔧 Advanced Features
- **Nerve Symptom Analysis**: Specialized tracking for neurological symptoms
- **Functional Limitations Assessment**: Detailed mobility and capability monitoring
- **Comparison Tracking**: Monitor changes since injury or diagnosis
- **Onboarding & Tutorials**: Guided setup and interactive help system

### 🛡️ Privacy & Security
- **Local Data Storage**: All data remains on your device - no cloud storage
- **Secure Architecture**: Multiple security layers and vulnerability scanning
- **Data Portability**: Easy export and backup capabilities

## Quick Start

### Option 1: Using Make (Recommended)
```bash
git clone https://github.com/CrisisCore-Systems/pain-tracker.git
cd pain-tracker
make setup    # Install dependencies, setup environment, install hooks
make dev      # Start development server
```

### Option 2: Manual Setup
```bash
git clone https://github.com/CrisisCore-Systems/pain-tracker.git
cd pain-tracker
npm install
cp .env.example .env  # Configure your environment
npm run dev
```

### Health Check
```bash
make doctor   # Or: node scripts/doctor.js
```

## Getting Started

### Prerequisites

- Node.js 18+ (20+ recommended)
- npm 9 or higher
- Git 2.0+

### Installation

1. Clone the repository:
```bash
git clone https://github.com/CrisisCore-Systems/pain-tracker.git
cd pain-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
```

## Current Status

**Version**: 0.1.0 (Early Development)  
**Build Status**: ✅ Passing (all 128 tests)  
**Security Status**: ✅ Multiple security layers active  
**Deployment**: GitHub Pages ready  

### Implemented Features
- ✅ Multi-step pain assessment form
- ✅ Interactive data visualization and analytics  
- ✅ WorkSafe BC report generation
- ✅ Emergency response panel
- ✅ Local data storage with export capabilities
- ✅ Comprehensive testing suite
- ✅ Security scanning and validation
- ✅ Onboarding and tutorial system

### Supported Use Cases
- **Individual Pain Management**: Personal tracking and analysis
- **Workplace Injury Claims**: WorkSafe BC integration and reporting
- **Healthcare Collaboration**: Professional data exports and reports
- **Emergency Situations**: Automated alerts and contact management

## Deployment

The application is configured for automatic deployment to GitHub Pages:

1. Fork this repository
2. Enable GitHub Pages in your repository settings
3. Push changes to the main branch
4. GitHub Actions will automatically build and deploy your changes

For manual deployment:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

### 📝 Recording Pain Entries
The application uses a comprehensive 7-step assessment process:

1. **Pain Assessment**: Set pain level (0-10), select body locations, and identify symptoms
2. **Functional Impact**: Document limited activities, assistance needs, and mobility aids
3. **Medications**: Track current medications, dosages, and effectiveness
4. **Treatments**: Record recent therapies, effectiveness, and planned treatments
5. **Quality of Life**: Assess sleep quality, mood impact, and social effects
6. **Work Impact**: Document missed work, modified duties, and workplace limitations
7. **Comparison**: Track changes since injury and new limitations

### 📊 Analytics & Visualization
- **Pain History Charts**: Interactive timeline of pain levels and trends
- **Location Heat Maps**: Visual representation of pain patterns by body region
- **Progression Analysis**: Track improvements or deterioration over time
- **Treatment Effectiveness**: Analyze correlation between treatments and pain levels

### 🏥 Healthcare Features
- **WorkSafe BC Reports**: Generate professional reports for workplace injury claims
- **Emergency Panel**: Access emergency contacts and protocols based on current pain levels
- **Clinical Exports**: Export detailed data in CSV/JSON formats for healthcare providers

### 🔄 Data Management
- **Local Storage**: All data stored securely in your browser
- **Data Export**: Complete backup capabilities for data portability
- **Sample Data**: Try the application with pre-loaded demonstration data
- **Onboarding**: Interactive tutorial for new users

## Data Privacy & Security

**Complete Privacy**: All pain tracking data is stored locally in your browser using secure web storage APIs. No data is transmitted to external servers or cloud services.

**Data Control**: You maintain complete control over your data with:
- Local-only storage (never leaves your device)
- Secure export capabilities (CSV/JSON)  
- No account creation or login required
- No tracking cookies or analytics

**Security Features**:
- Input validation and sanitization
- Content Security Policy (CSP) headers
- Automated vulnerability scanning
- Regular security audits

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## Developer Workflow

### Available Commands

```bash
# Quick help
make help             # Show all available commands

# Development
make dev              # Start development server
make build            # Build for production
make test             # Run tests
make check            # Run all checks (lint, typecheck, test, build)

# Code Quality
make lint             # Run ESLint
make lint-fix         # Fix ESLint issues automatically
make typecheck        # Run TypeScript type checking
make format           # Format code with Prettier

# Security & Diagnostics
make doctor           # Run environment diagnostics
make scan-secrets     # Scan for hardcoded secrets
make check-security   # Run all security checks

# Git Workflow
make check-pre-commit # Test pre-commit hooks
```

### Pre-commit Hooks

This project uses modular pre-commit hooks that run:
- 🛡️ CrisisCore collapse vector detection
- 📝 TypeScript type checking
- 🔍 ESLint code quality checks
- 🏗️ Build verification
- 🔐 Secret scanning
- 🔀 Merge conflict marker detection

**Skip individual checks** by adding tags to your commit message:
```bash
git commit -m "fix: urgent hotfix [skip lint]"
git commit -m "docs: update readme [skip build]"
git commit -m "wip: experimental feature [skip all]"
```

Available skip tags: `[skip typecheck]`, `[skip lint]`, `[skip build]`, `[skip secrets]`, `[skip merge]`, `[skip collapse]`, `[skip all]`

### Commit Message Format

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `build`, `security`, `deps`, `config`

**Examples:**
```bash
feat(tracker): add pain intensity heatmap visualization
fix(api): resolve CORS issues with WCB integration
docs(readme): add contribution guidelines
security(auth): implement rate limiting for API endpoints
```

## Security

This project follows security best practices and implements multiple layers of protection:

### 🛡️ Security Features

- **Automated Secret Scanning**: Prevents hardcoded credentials from being committed
- **Dependency Vulnerability Scanning**: Regular audits of npm packages
- **Static Code Analysis**: CodeQL and custom security checks
- **Content Security Policy**: XSS protection headers
- **Input Validation**: Zod schema validation for all user inputs
- **CrisisCore Security Gates**: Custom patterns to prevent specific vulnerabilities

### 🔒 Security Workflow

1. **Pre-commit**: Secrets are scanned before every commit
2. **CI/CD**: Comprehensive security analysis on every PR
3. **Dependency Monitoring**: Automated alerts for vulnerable packages
4. **Regular Audits**: Weekly security scans and dependency updates

### 📢 Reporting Security Issues

**DO NOT** open public issues for security vulnerabilities.

Instead, please email security concerns to: [security@crisiscore.systems](mailto:security@crisiscore.systems)

We follow responsible disclosure and will:
1. Acknowledge receipt within 24 hours
2. Provide a detailed response within 72 hours
3. Work with you to understand and resolve the issue
4. Credit you in our security acknowledgments (if desired)

### 🏆 Security Standards

This project aims to achieve:
- [OpenSSF Best Practices](https://bestpractices.coreinfrastructure.org/) certification
- [OpenSSF Scorecard](https://securityscorecards.dev/) score of 8.0+
- Zero high/critical severity vulnerabilities
- 100% code coverage for security-critical functions

### 🔐 Security Tools

- **CodeQL**: GitHub's semantic code analysis
- **npm audit**: Dependency vulnerability scanning  
- **Custom Scanners**: CrisisCore-specific security patterns
- **Secrets Detection**: 12+ patterns for common credential types
- **SAST**: Static Application Security Testing

## Architecture

### Technology Stack

- **Frontend**: React 18 + TypeScript + Vite (Hot Module Replacement)
- **Styling**: Tailwind CSS + Headless UI + Custom Design System  
- **Data Visualization**: Recharts + Chart.js + Custom Analytics
- **Form Management**: Multi-step forms with validation
- **Testing**: Vitest + Testing Library + jsdom (128+ tests)
- **Build & Dev**: Vite with optimal chunking and tree-shaking
- **Code Quality**: ESLint + Prettier + Husky + CommitLint
- **Security**: Input validation (Zod), CSP headers, secret scanning

### Security Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Developer     │───▶│   Pre-commit     │───▶│   Repository    │
│   Environment   │    │   Security Gates │    │   (GitHub)      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Local Tools   │    │   CI/CD Pipeline │    │   Production    │
│   • doctor.js   │    │   • CodeQL       │    │   • Secure      │
│   • scan-secrets│    │   • Dependency   │    │   • Monitored   │
│   • pre-commit  │    │   • SAST Tools   │    │   • Validated   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Acknowledgments

- [WorkSafe BC](https://www.worksafebc.com/) for workplace injury management domain expertise
- Healthcare professionals who provided input on pain assessment methodologies
- [OpenSSF](https://openssf.org/) for security best practices and frameworks
- [React](https://reactjs.org/) ecosystem for robust development tools
- [Vite](https://vitejs.dev/) for exceptional development experience
- Pain management community for feedback and feature suggestions

---

**Developed with ❤️ by [CrisisCore Systems](https://github.com/CrisisCore-Systems)**

*Building secure, reliable tools for healthcare and safety.*

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 