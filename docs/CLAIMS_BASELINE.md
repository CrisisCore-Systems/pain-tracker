# Claims Baseline

This baseline defines language that is safe to claim publicly in this repository.

## Allowed Claims

Use claims like these:

- local by default
- optional network-assisted features
- user-triggered exports
- privacy settings available
- encrypted storage for specific surfaces only, where proven

## Disallowed Claims (unless specifically proven for the exact surface)

- HIPAA compliant
- secure portal
- military-grade
- never leaves your device
- fully encrypted
- protected by default across all features

## Enforcement

- Automated check: `npm run claims:validate`
- CI/deploy pipelines should fail on disallowed phrases in product/marketing/docs surfaces.
- If a phrase must appear in explanatory context (for example, describing what to avoid), explicitly document it in an allowlist in `scripts/validate-trust-claims.js`.
