# Contributing to Pain Tracker

## Star this repo if...

- You believe healthcare software should be privacy-first by default.
- You want a local-first, offline-capable pain tracker that doesn’t rely on surveillance.
- You’ve lived through medical trauma, housing instability, disability, or burnout — and you want tools built with dignity.

We love your input! We want to make contributing to Pain Tracker as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## 🚀 Local Development in 5 Minutes

Get up and running quickly with these steps:

### Prerequisites

- **Node.js 20 (LTS)** - Check with `node --version` ([Download here](https://nodejs.org/))
- **npm 9+** - Usually comes with Node.js, check with `npm --version`
- **Git** - Check with `git --version`

> 💡 **Tip**: Use [nvm](https://github.com/nvm-sh/nvm) to manage Node.js versions. This repo includes `.nvmrc` for automatic version switching.

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/CrisisCore-Systems/pain-tracker.git
cd pain-tracker

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev

# 4. Open your browser
# Visit http://localhost:3000 (or the URL shown in the terminal)
```

That's it! The app should now be running locally. 🎉

### Verify Your Setup

Run these commands to ensure everything works:

```bash
# Check environment
npm run doctor

# Run tests
npm run test

# Run linter
npm run lint

# Build for production (optional)
npm run build
```

### Common Commands

```bash
npm run dev          # Start dev server with hot reload
npm run test         # Run test suite
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
npm run lint         # Check code style
npm run typecheck    # Check TypeScript types
npm run build        # Build for production
npm run preview      # Preview production build
```

### Using Make (Optional)

If you have `make` installed (Linux/Mac/WSL):

```bash
make setup    # First-time setup
make dev      # Start dev server
make test     # Run tests
make check    # Run all checks (typecheck, lint, test, build)
make lint-fix # Auto-fix linting issues
```

### Troubleshooting

**Port already in use?**
```bash
# Kill the process using port 3000 (adjust for your port)
# Linux/Mac:
lsof -ti:3000 | xargs kill -9
# Windows PowerShell:
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

**Dependencies won't install?**
```bash
# Clear npm cache and try again
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Tests failing?**
```bash
# Ensure you're on Node.js 20
node --version  # Should show v20.x.x

# Try running tests with more memory
export NODE_OPTIONS="--max-old-space-size=4096"
npm run test
```

**Need help?**
- Check the [README.md](README.md) for detailed documentation
- Review existing [GitHub Issues](https://github.com/CrisisCore-Systems/pain-tracker/issues)
- Look at [GitHub Discussions](https://github.com/CrisisCore-Systems/pain-tracker/discussions)
- Run `npm run doctor` for environment diagnostics

## We Develop with Github
We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

## We Use [Github Flow](https://guides.github.com/introduction/flow/index.html)
Pull requests are the best way to propose changes to the codebase. We actively welcome your pull requests:

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Security & Data Safety (Healthcare App)

If your change touches encryption, storage (localStorage/IndexedDB), exports, audit logging, or migrations, please follow:

- `docs/security/SECURITY_CHANGE_CHECKLIST.md`
- `docs/engineering/LOCAL_DATA_AND_MIGRATIONS.md`

For security-critical changes (crypto/key handling/audit semantics), request human review before merging.

## Any contributions you make will be under the MIT Software License
In short, when you submit code changes, your submissions are understood to be under the same [MIT License](http://choosealicense.com/licenses/mit/) that covers the project. Feel free to contact the maintainers if that's a concern.

## Report bugs using Github's [issue tracker](https://github.com/crisiscore-systems/pain-tracker/issues)
We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/crisiscore-systems/pain-tracker/issues/new); it's that easy!

## Write bug reports with detail, background, and sample code

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can.
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## License
By contributing, you agree that your contributions will be licensed under its MIT License.

## References
This document was adapted from the open-source contribution guidelines for [Facebook's Draft](https://github.com/facebook/draft-js/blob/a9316a723f9e918afde44dea68b5f9f39b7d9b00/CONTRIBUTING.md). 