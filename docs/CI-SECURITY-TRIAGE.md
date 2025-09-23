# CI Security Triage

This short guide explains how to triage CI security scan failures, CodeQL SARIF results, and dependency audit issues.

1. Download artifacts

   - From the failing workflow run, download `security-scan-results` artifact (contains audit-results.json and SARIF outputs).

2. Reproduce locally

   - Run `npm ci --legacy-peer-deps` and `npm audit --json` to reproduce dependency issues.
   - Use the CodeQL CLI (`codeql`) locally to run the same query packs if deeper analysis is needed.

3. Prioritize and classify

   - Class A: High/Critical vulnerabilities in runtime dependencies (blocker).
   - Class B: CodeQL high-confidence findings in code paths that handle user input (urgent).
   - Class C: Medium/low severity or false positives (document and schedule remediation).

4. Create issues and assign owners

   - For each Class A/B item, create a GitHub issue with reproduction steps, affected versions, and proposed remediation.

5. Temporary mitigations

   - For urgent releases, document any temporary mitigations and plan a follow-up PR to fully remediate.

6. Closing the loop

   - After remediation, re-run the CI pipeline and attach SARIF/audit results to the issue for verification.

Appendix: Useful commands

```bash
# Reproduce audit locally
npm ci --legacy-peer-deps
npm audit --json > audit-results.json

# Run CodeQL locally (if codeql CLI available)
codeql database create codeql-db --language=javascript
codeql database analyze codeql-db --format=sarif-latest --output=results.sarif
```
