# Audit Quick Reference

**Quick commands for running audits and checking project health**

## Daily Health Checks

```bash
# Quick health check
make doctor

# Check for security issues
npm audit

# Run linting
npm run lint

# Run type checking
npm run typecheck
```

## Weekly Audits

```bash
# Full quality check (lint + typecheck + test + build)
make check

# Test with coverage
npm run test:coverage

# Build and check bundle size
npm run build
npm run badge:bundle

# Security audit with details
npm run security-full
```

## Monthly Full Audit

```bash
# 1. Environment setup
make setup

# 2. Run comprehensive checks
make check

# 3. Generate all badges
npm run badge:all

# 4. Security audit
npm audit --json > security-audit-latest.json
npm run security-audit

# 5. Update metrics in audit reports
# - Edit PROJECT_AUDIT_REPORT.md Appendix B
# - Update AUDIT_SUMMARY.md metrics dashboard
# - Update AUDIT_REMEDIATION_PLAN.md progress tracking
```

## Current Baseline Metrics (Dec 13, 2024)

| Metric | Current | Target | Command |
|--------|---------|--------|---------|
| Linting Errors | 719 | <100 | `npm run lint` |
| TypeScript Errors | 13 | 0 | `npm run typecheck` |
| Test Pass Rate | 98% | 100% | `npm run test` |
| Test Coverage | 90%+ | 95% | `npm run test:coverage` |
| High CVEs | 2 | 0 | `npm audit` |
| Bundle Size (gzipped) | 1.1 MB | <800 KB | `npm run build` |

## Tracking Progress

### After Each Fix
```bash
# Re-run the relevant check
npm run lint          # for linting fixes
npm run typecheck     # for type fixes
npm run test          # for test fixes
npm audit            # for dependency updates

# Update progress in AUDIT_REMEDIATION_PLAN.md
# Mark items as complete: [ ] → [x]
```

### Weekly Progress Report
```bash
# Generate updated metrics
npm run lint 2>&1 | tail -1          # Get error count
npm run typecheck 2>&1 | grep error  # Get type error count
npm run test:coverage | grep "All"   # Get test results
npm audit --json | jq '.metadata.vulnerabilities'  # Get vuln count

# Update AUDIT_SUMMARY.md metrics dashboard
# Update AUDIT_REMEDIATION_PLAN.md sprint progress
```

## Critical Issue Commands

### Fix Linting (Priority 1)
```bash
# Auto-fix what's possible
npm run lint -- --fix

# Check improvement
npm run lint 2>&1 | tail -1
```

### Fix TypeScript (Priority 2)
```bash
# Build packages first
npm run build:packages

# Run typecheck
npm run typecheck

# Fix individual files
# See AUDIT_REMEDIATION_PLAN.md section 2 for specific fixes
```

### Fix Tests (Priority 3)
```bash
# Run specific test file
npm run test -- src/test/encryption-additional-gaps.test.ts

# Run all tests
npm run test

# With coverage
npm run test:coverage
```

### Update Dependencies (Priority 4)
```bash
# Update specific package
npm install @vercel/node@2.3.0

# Auto-fix vulnerabilities
npm audit fix

# Check remaining issues
npm audit
```

## Useful Filters

```bash
# Count only errors (not warnings)
npm run lint 2>&1 | grep -c "error"

# List files with errors
npm run lint --quiet

# Get TypeScript error count
npm run typecheck 2>&1 | grep -c "error TS"

# Get test failure count
npm run test 2>&1 | grep "Test Files"

# Get vulnerability summary
npm audit --json | jq '.metadata.vulnerabilities'
```

## Before Committing

```bash
# Run pre-commit checks
make check-pre-commit

# Or comprehensive check
make check
```

## Before Deploying

```bash
# Pre-deployment validation
npm run deploy:precheck

# Health check
npm run deploy:healthcheck

# Validate configuration
npm run deploy:validate
```

## Troubleshooting

### ESLint configuration
```bash
# Check ESLint flat config ignores
cat eslint.config.js | grep -A 10 ignores

# Verify ignores are working
npm run lint -- --debug

# Note: Project uses ESLint flat config (eslint.config.js)
# Ignore patterns are in the config file, not .eslintignore
```

### Tests failing with "key material not available"
```bash
# Check test setup
cat src/test/setup.ts | grep -A 10 crypto

# Run with verbose output
npm run test -- --reporter=verbose
```

### Build fails
```bash
# Check environment
npm run prebuild

# Clean and rebuild
make clean-build
npm run build
```

### High memory usage in TypeScript
```bash
# Use memory-optimized command
npm run typecheck:memory:ps  # Windows PowerShell
```

## Documentation Updates

After making significant progress, update these files:

1. **AUDIT_SUMMARY.md**
   - Update metrics dashboard
   - Update progress status
   - Update completion percentage

2. **AUDIT_REMEDIATION_PLAN.md**
   - Mark completed items: `- [x]`
   - Update sprint progress
   - Add notes on completed work

3. **PROJECT_AUDIT_REPORT.md**
   - Update Appendix B metrics
   - Add notes in relevant sections
   - Update last reviewed date

## Quick Links

- **Full Audit Report**: [PROJECT_AUDIT_REPORT.md](./PROJECT_AUDIT_REPORT.md)
- **Remediation Plan**: [AUDIT_REMEDIATION_PLAN.md](./AUDIT_REMEDIATION_PLAN.md)
- **Executive Summary**: [AUDIT_SUMMARY.md](./AUDIT_SUMMARY.md)
- **Security Policy**: [SECURITY.md](./SECURITY.md)
- **Contributing Guide**: [CONTRIBUTING.md](./CONTRIBUTING.md)
- **Makefile Commands**: Run `make help` for all available commands

## Support

For questions or issues:
1. Check the relevant audit document
2. Review [docs/](./docs/) directory
3. Create an issue with `[audit]` prefix
4. Tag with priority label

---

**Last Updated:** December 13, 2024  
**Next Review:** December 20, 2024
