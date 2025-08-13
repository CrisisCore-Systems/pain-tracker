# Pain Tracker

[![Security Scan](https://github.com/CrisisCore-Systems/pain-tracker/actions/workflows/security.yml/badge.svg)](https://github.com/CrisisCore-Systems/pain-tracker/actions/workflows/security.yml)
[![CI/CD Pipeline](https://github.com/CrisisCore-Systems/pain-tracker/actions/workflows/ci.yml/badge.svg)](https://github.com/CrisisCore-Systems/pain-tracker/actions/workflows/ci.yml)
[![CodeQL](https://github.com/CrisisCore-Systems/pain-tracker/actions/workflows/codeql.yml/badge.svg)](https://github.com/CrisisCore-Systems/pain-tracker/actions/workflows/codeql.yml)
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/CrisisCore-Systems/pain-tracker/badge)](https://securityscorecards.dev/viewer/?uri=github.com/CrisisCore-Systems/pain-tracker)

A comprehensive pain tracking application that helps users monitor and analyze their pain patterns over time.

## Features

- Record detailed pain entries with:
  - Pain level (0-10 scale)
  - Pain locations
  - Associated symptoms
  - Functional impact
  - Sleep and mood impact
  - Work impact
- Visualize pain patterns with interactive charts
- Track trends and statistics
- Export data in CSV and JSON formats
- Mobile-friendly interface

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

1. Record Pain Entry:
   - Use the slider to indicate pain level
   - Select affected locations
   - Choose relevant symptoms
   - Add notes and additional details

2. View Analytics:
   - Switch to the Analytics tab
   - View pain trends over time
   - Analyze pain patterns by location and time of day
   - Track symptom correlations

3. Export Data:
   - Click "Export CSV" for spreadsheet-compatible format
   - Click "Export JSON" for complete data backup
   - Use exported data with healthcare providers or external tools

## Data Privacy

All data is stored locally in your browser. No data is sent to external servers.

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

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Headless UI
- **Charts**: Recharts + Chart.js
- **Testing**: Vitest + Testing Library + jsdom
- **Build**: Vite with optimal chunking strategy
- **Quality**: ESLint + Prettier + Husky + CommitLint

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

- [WorkSafe BC](https://www.worksafebc.com/) for domain expertise
- [OpenSSF](https://openssf.org/) for security best practices
- [React](https://reactjs.org/) team for the excellent framework
- [Vite](https://vitejs.dev/) for the blazing fast build tool

---

**Developed with ❤️ by [CrisisCore Systems](https://github.com/CrisisCore-Systems)**

*Building secure, reliable tools for healthcare and safety.*

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 