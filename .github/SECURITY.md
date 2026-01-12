# Security Policy

## Reporting Security Vulnerabilities

We take security vulnerabilities seriously. If you discover a security vulnerability, please report it responsibly:

1. **DO NOT** create a public GitHub issue
2. Email security concerns to the maintainers (via GitHub)
3. Include detailed information about the vulnerability
4. Allow time for assessment and remediation before disclosure

## Security-Sensitive Code Changes

If you are proposing a change (PR) that touches encryption, key handling, local persistence (localStorage/IndexedDB), migrations, exports, audit logging, or PHI/PII handling, please follow:

- `docs/security/SECURITY_CHANGE_CHECKLIST.md`
- `docs/engineering/LOCAL_DATA_AND_MIGRATIONS.md`

## Environment Variables & Configuration

### Required Environment Variables for Production
- `VITE_APP_ENVIRONMENT`: Application environment (production/development)
- `VITE_WCB_API_ENDPOINT`: WCB API endpoint URL

### Security Best Practices
- All secrets must use GitHub Secrets, never hardcode in source
- Frontend environment variables must be prefixed with `VITE_`
- Backend secrets must never use `VITE_` prefix
- No hardcoded API endpoints in workflows
- Regularly rotate API keys and access tokens

## Code Security Standards

### Protected Against
- **Cross-Site Scripting (XSS)**: Input sanitization and CSP headers
- **Code Injection**: No eval() usage, strict input validation
- **Prototype Pollution**: Regular security scans and dependency audits
- **Sensitive Data Exposure**: Automated scanning for hardcoded secrets

### Security Scanning
Our automated security pipeline includes:
- Pre-commit hooks that scan for hardcoded secrets
- Dependency vulnerability scanning with `npm audit`
- Static code analysis for security anti-patterns
- Build output verification to prevent sensitive data leakage

### Security Headers
When deployed, ensure the following security headers are configured:
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## Data Privacy & Protection

### Local Data Storage
- All pain tracking data is stored locally in browser storage
- No personal data is transmitted to external servers by default
- Users control their data export and deletion

### Optional External Services
- **WCB Integration**: Work compensation board submission (explicit user action)

## Development Security

### Pre-commit Security Checks
The following security checks run automatically:
1. Hardcoded secret detection
2. Prototype pollution patterns
3. Mathematical randomness in control flow
4. Mutable state exposure detection

### Dependencies
- Regular dependency updates via automated pull requests
- Security audit threshold: moderate and above
- Automated vulnerability scanning in CI/CD pipeline

## Incident Response

### In Case of Security Incident
1. Immediately assess impact and scope
2. Disable affected components if necessary
3. Notify users if data exposure is possible
4. Implement fix and verify remediation
5. Post-incident review and documentation

### Security Update Process
1. Security updates take priority over feature development
2. Emergency security patches may be deployed outside normal release cycle
3. All security updates include thorough testing
4. Security advisories published for significant vulnerabilities

## Compliance & Standards

### Standards Adherence
- OWASP Web Security Guidelines
- GDPR compliance for EU users
- Accessibility standards (WCAG 2.1)
- Industry best practices for healthcare data handling

### Regular Security Reviews
- Monthly dependency audits
- Quarterly security architecture reviews
- Annual penetration testing (if applicable)
- Continuous monitoring of security advisories

