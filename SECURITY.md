# Security guidance and CSP recommendations

This repository follows a security-first, defense-in-depth approach. Below are actionable recommendations and troubleshooting steps for Content Security Policy (CSP), security scan triage, and temporary mitigations.

## Content-Security-Policy (CSP)

- Production recommendation: avoid 'unsafe-inline' and 'unsafe-eval'. Use a restrictive policy that defaults to 'self' for scripts and styles and whitelists required CDNs.

  Example production CSP (recommended):

  default-src 'self';
  script-src 'self' https://cdn.jsdelivr.net; /* Prefer nonces or hashes for inline scripts */
  style-src 'self' https://fonts.googleapis.com; /* Prefer nonce-based styles for any inline CSS */
  font-src 'self' https://fonts.gstatic.com data:;
  img-src 'self' data: blob:;
  connect-src 'self' https://api.wcb.gov; 
  object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';

- If inline scripts/styles are currently used (development convenience or third-party bundles), prefer nonces or hashes instead of allowing 'unsafe-inline'. Nonces are injected per-response and are the recommended method for apps that perform server-side HTML generation or serve pre-rendered pages.

  - Nonce approach (server injects a random nonce per response):
    - Add nonce to scripts: <script nonce="<RANDOM>">...</script>
    - CSP header: script-src 'nonce-<RANDOM>' 'self' https://cdn.jsdelivr.net;

  - Hash approach (for known static inline scripts):
    - Compute the base64-encoded SHA256 of the script body and include it in the policy: script-src 'sha256-abc...'

- If you must allow 'unsafe-inline' temporarily, document why and where in this repo and add a remediation TODO with a timeline. Prefer limiting that to non-production environments only (dev/preview) and ensure production builds use the stricter policy.

## Why avoid 'unsafe-inline'

- 'unsafe-inline' allows arbitrary inline execution and is the most common vector for XSS exploitation when combined with injection points. Nonces or hashes constrain inline execution to explicitly approved snippets.

## Troubleshooting / Triage (CI & Security Scans)

1. CodeQL SARIF outputs

   - Location: security-scan artifacts include SARIF files (uploaded by CI). Download the SARIF and open it in GitHub's Code Scanning UI or a local SARIF viewer to get detailed findings.
   - Prioritization: prioritize high-confidence, high-severity findings and any code paths that handle user input, serialization/deserialization, or dynamic code execution.
   - False positives: mark incidental findings with context in the PR and include a short note explaining why the finding is not exploitable. If it is a known false positive in a third-party library, consider suppressing via CodeQL query configuration or file-level annotations.

2. Dependency audit failures (npm audit)

   - If CI fails due to high/critical vulnerabilities: run `npm audit --json` locally, review the advisory, and either:
     - Upgrade the affected package to a patched version.
     - Introduce a mitigations (e.g., limit attack surface) and open an issue with an actionable remediation plan.
   - If the package is a transitive dependency, use `npm audit fix --package-lock-only` or consider patching via an override (e.g., `overrides` in package.json) with justification.

3. Secret scanning / hardcoded credential findings

   - Treat as high priority. Revoke any exposed credentials and rotate them immediately.
   - Add detection to allowlists only after careful review; do not ignore findings silently.

4. Quick triage checklist for pipeline failures

   - Retrieve SARIF and audit JSON artifacts from the workflow run artifacts.
   - Reproduce the scan locally where possible (CodeQL CLI, npm audit).
   - Create a short issue with reproduction steps and an assigned owner.
   - If the finding blocks a release, include a short mitigation and remediation timeline in the issue.

## CI notes

- The development Vite server uses a more permissive CSP (including 'unsafe-inline' for dev-time convenience). Ensure __BUILD_CSP__ and preview servers set production CSP for production artifacts.

- When updating CSP in code, update `vite.config.ts` devCsp/prodCsp constants and ensure the preview server uses the production CSP in CI builds where appropriate.

## Recommended actions

- Replace any remaining inline scripts/styles in production builds with external files that can be hashed or given a nonce.
- Document any temporary exceptions in an `SECURITY_EXCEPTIONS.md` with a planned remediation date.
- Keep CodeQL queries updated and triage SARIF outputs as part of the standard PR review process.

If you discover credentials in the repository, follow the incident response steps in `security/` and notify the maintainers immediately.
