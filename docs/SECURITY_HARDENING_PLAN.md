# Security Hardening Plan - Production Ready

## Analysis Date: 2025-10-04
## Current Security Level: Development (Good Foundation)
## Target: Production-Grade HIPAA-Aligned Security

---

## 🛡️ Current Security Implementation

### ✅ **Existing Strengths**

1. **Content Security Policy (CSP)**
   - Dev CSP with unsafe-inline/unsafe-eval for development
   - Prod CSP removes unsafe directives
   - Configured in vite.config.ts
   
2. **Security Headers**
   - X-Frame-Options: DENY
   - X-Content-Type-Options: nosniff
   - X-XSS-Protection: 1; mode=block
   - Referrer-Policy: strict-origin-when-cross-origin
   - Permissions-Policy: restrictive
   
3. **Data Encryption**
   - AES-256-GCM for sensitive data
   - XChaCha20-Poly1305 for vault service
   - libsodium for cryptographic operations
   
4. **HIPAA Compliance Features**
   - Audit trail logging
   - Data de-identification
   - PHI detection
   - Breach assessment

### ⚠️ **Gaps & Improvements Needed**

1. **CSP Still Allows External CDNs**
   - cdn.jsdelivr.net for scripts (risk)
   - Should inline or self-host critical scripts

2. **Missing Security Headers**
   - No Cross-Origin-Embedder-Policy (COEP)
   - No Cross-Origin-Opener-Policy (COOP)
   - No Cross-Origin-Resource-Policy (CORP)
   - No Strict-Transport-Security (HSTS)

3. **No Subresource Integrity (SRI)**
   - External resources not integrity-checked
   - Risk of CDN compromise

4. **Service Worker Security**
   - No CSP for service worker itself
   - Cache could store sensitive data
   - No cache encryption validation

5. **Build-Time Security**
   - No automated security scanning in CI
   - No dependency vulnerability checks
   - Source maps exposed in production

---

## 🎯 Security Enhancement Strategy

### Phase 1: Enhanced CSP (CRITICAL - Week 1)

#### Current Production CSP:
```javascript
"default-src 'self'; 
script-src 'self' https://cdn.jsdelivr.net; 
style-src 'self' https://fonts.googleapis.com; 
font-src 'self' https://fonts.gstatic.com data:; 
img-src 'self' data: blob:; 
connect-src 'self' https://api.wcb.gov; 
media-src 'self'; 
object-src 'none'; 
frame-src 'none'; 
frame-ancestors 'none'; 
form-action 'self'; 
base-uri 'self'; 
upgrade-insecure-requests"
```

#### Issues:
1. **cdn.jsdelivr.net** - External script source (XSS risk)
2. **fonts.googleapis.com** - External CSS (less risky but not ideal)
3. **No nonce/hash** - Can't use for inline scripts if needed
4. **No report-uri** - CSP violations not monitored

---

#### Enhanced Production CSP:
```javascript
const strictProdCsp = [
  "default-src 'none'", // Deny all by default
  "script-src 'self'", // Only our scripts
  "style-src 'self'", // Only our styles (self-host fonts)
  "font-src 'self' data:", // Self-hosted fonts + data URIs
  "img-src 'self' data: blob:", // Images from our origin
  "connect-src 'self'", // APIs from our origin only
  "worker-src 'self'", // Service worker from our origin
  "manifest-src 'self'", // PWA manifest from our origin
  "media-src 'self'", // Audio/video from our origin
  "object-src 'none'", // No plugins
  "frame-src 'none'", // No iframes
  "frame-ancestors 'none'", // Can't be framed
  "form-action 'self'", // Forms submit to our origin only
  "base-uri 'self'", // Prevent base tag hijacking
  "upgrade-insecure-requests", // Force HTTPS
  "block-all-mixed-content", // No HTTP resources on HTTPS
  "require-trusted-types-for 'script'", // Trusted Types API
  "trusted-types 'default' 'react-dom'", // Allow React's DOM manipulation
  "report-uri https://your-domain.report-uri.com/r/d/csp/enforce" // Monitor violations
].join('; ');
```

**Action Items**:
- [ ] Self-host fonts instead of Google Fonts
- [ ] Remove cdn.jsdelivr.net dependency
- [ ] Set up CSP violation reporting
- [ ] Implement nonce-based CSP for any inline scripts
- [ ] Test CSP with trusted types

---

### Phase 2: Additional Security Headers (HIGH - Week 1)

#### 2.1 Cross-Origin Policies
```javascript
// Prevent cross-origin attacks
headers: {
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
}
```

**Benefits**:
- Isolates origin from cross-origin attacks
- Enables SharedArrayBuffer securely
- Prevents Spectre-like attacks

---

#### 2.2 Strict Transport Security (HSTS)
```javascript
headers: {
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
}
```

**Benefits**:
- Forces HTTPS for all requests
- Prevents SSL stripping attacks
- Can submit to HSTS preload list

**Action Items**:
- [ ] Add HSTS header
- [ ] Test with max-age=300 first (5 minutes)
- [ ] Increase to 1 year after testing
- [ ] Submit to [hstspreload.org](https://hstspreload.org/)

---

#### 2.3 Permissions Policy (Enhanced)
```javascript
headers: {
  'Permissions-Policy': [
    'accelerometer=()',
    'ambient-light-sensor=()',
    'autoplay=()',
    'battery=()',
    'camera=()',
    'display-capture=()',
    'document-domain=()',
    'encrypted-media=()',
    'fullscreen=(self)', // Allow fullscreen for our origin
    'geolocation=()',
    'gyroscope=()',
    'magnetometer=()',
    'microphone=()',
    'midi=()',
    'payment=()',
    'picture-in-picture=()',
    'publickey-credentials-get=(self)', // Allow WebAuthn
    'screen-wake-lock=()',
    'sync-xhr=()',
    'usb=()',
    'web-share=(self)', // Allow Web Share API
    'xr-spatial-tracking=()'
  ].join(', ')
}
```

**Action Items**:
- [ ] Allow only necessary permissions
- [ ] Test with feature detection
- [ ] Document allowed features

---

#### 2.4 Cache-Control for Sensitive Data
```javascript
// For API responses with PHI
headers: {
  'Cache-Control': 'no-store, no-cache, must-revalidate, private',
  'Pragma': 'no-cache',
  'Expires': '0'
}
```

---

### Phase 3: Subresource Integrity (SRI) (MEDIUM - Week 2)

#### Current Risk:
External resources (fonts, potential CDN scripts) not integrity-checked.

#### Solution:
```html
<!-- ❌ Current: No integrity check -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

<!-- ✅ Enhanced: Self-hosted with integrity -->
<link href="/fonts/inter.css" rel="stylesheet" integrity="sha384-..." crossorigin="anonymous">

<!-- ✅ If using CDN (not recommended): -->
<script src="https://cdn.jsdelivr.net/..." 
        integrity="sha384-..." 
        crossorigin="anonymous"></script>
```

**Action Items**:
- [ ] Generate SRI hashes for all external resources
- [ ] Add integrity attribute to all external resources
- [ ] Prefer self-hosting over CDN
- [ ] Automate SRI generation in build process

---

### Phase 4: Service Worker Security (HIGH - Week 2)

#### 4.1 Service Worker CSP
```javascript
// sw.js - Add CSP header for service worker responses
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      const response = await fetch(event.request);
      const headers = new Headers(response.headers);
      headers.set('Content-Security-Policy', strictProdCsp);
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
      });
    })());
  }
});
```

---

#### 4.2 Cache Security
```javascript
// Never cache sensitive PHI data
const NEVER_CACHE_PATTERNS = [
  /\/api\/pain-entries/,
  /\/api\/vault/,
  /\/api\/auth/,
  /\/api\/user/
];

function shouldCache(url) {
  return !NEVER_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));
}

// Encrypt cache storage
async function cacheWithEncryption(request, response) {
  const data = await response.clone().arrayBuffer();
  const encrypted = await encryptData(data);
  const encryptedResponse = new Response(encrypted, {
    headers: response.headers
  });
  await cache.put(request, encryptedResponse);
}
```

**Action Items**:
- [ ] Implement cache encryption for sensitive data
- [ ] Exclude PHI from service worker caches
- [ ] Add cache validation checks
- [ ] Implement cache expiration for sensitive data

---

#### 4.3 Service Worker Integrity
```javascript
// Check service worker hasn't been tampered with
async function validateServiceWorker() {
  const registration = await navigator.serviceWorker.getRegistration();
  const swUrl = new URL(registration.active.scriptURL);
  const response = await fetch(swUrl);
  const content = await response.text();
  const hash = await crypto.subtle.digest('SHA-256', 
    new TextEncoder().encode(content));
  const hashHex = Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  // Compare with known good hash
  const expectedHash = 'YOUR_SW_HASH_HERE';
  if (hashHex !== expectedHash) {
    console.error('Service worker integrity check failed!');
    await registration.unregister();
  }
}
```

---

### Phase 5: Build-Time Security (CRITICAL - Week 1)

#### 5.1 Remove Source Maps in Production
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    sourcemap: process.env.NODE_ENV === 'development', // Only in dev
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log
        drop_debugger: true, // Remove debugger statements
      }
    }
  }
});
```

---

#### 5.2 Automated Security Scanning
```json
// package.json - Add security scripts
{
  "scripts": {
    "security:audit": "npm audit --production",
    "security:audit-fix": "npm audit fix",
    "security:full": "npm audit && npm run security:snyk",
    "security:snyk": "snyk test",
    "security:owasp": "dependency-check --scan . --format JSON",
    "prebuild": "npm run security:audit"
  }
}
```

**Action Items**:
- [ ] Run `npm audit` before every build
- [ ] Set up Snyk for continuous monitoring
- [ ] Add OWASP Dependency-Check to CI
- [ ] Fail build on high/critical vulnerabilities

---

#### 5.3 Dependency Pinning
```json
// package.json - Use exact versions
{
  "dependencies": {
    "react": "18.3.1", // Not "^18.3.1"
    "react-dom": "18.3.1",
    // ... exact versions for all deps
  }
}
```

**Action Items**:
- [ ] Remove `^` and `~` from package.json
- [ ] Use `npm ci` instead of `npm install` in CI
- [ ] Set up Dependabot for security updates
- [ ] Review and approve each update manually

---

### Phase 6: Runtime Security Monitoring (LOW - Week 3-4)

#### 6.1 CSP Violation Reporting
```javascript
// Monitor CSP violations in production
if ('securitypolicyviolation' in document) {
  document.addEventListener('securitypolicyviolation', (e) => {
    const violation = {
      documentURL: e.documentURL,
      violatedDirective: e.violatedDirective,
      effectiveDirective: e.effectiveDirective,
      originalPolicy: e.originalPolicy,
      blockedURI: e.blockedURI,
      statusCode: e.statusCode,
      timestamp: new Date().toISOString()
    };
    
    // Send to logging service
    fetch('/api/csp-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(violation)
    });
  });
}
```

---

#### 6.2 Suspicious Activity Detection
```javascript
// Detect unusual behavior
const securityMonitor = {
  failedLoginAttempts: 0,
  lastActivityTime: Date.now(),
  
  checkForSuspiciousActivity() {
    // Detect rapid repeated requests (possible attack)
    const timeSinceLastActivity = Date.now() - this.lastActivityTime;
    if (timeSinceLastActivity < 100) {
      this.logSuspiciousActivity('Rapid requests detected');
    }
    
    // Detect failed authentication attempts
    if (this.failedLoginAttempts > 5) {
      this.lockAccount();
    }
    
    this.lastActivityTime = Date.now();
  }
};
```

---

### Phase 7: HIPAA Compliance Enhancements (HIGH - Week 2)

#### 7.1 Enhanced Audit Logging
```typescript
interface EnhancedAuditLog {
  timestamp: string;
  userId: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'export';
  resource: string;
  resourceId: string;
  ipAddress: string; // If available
  userAgent: string;
  success: boolean;
  failureReason?: string;
  dataClassification: 'phi' | 'pii' | 'public';
  encryptionUsed: boolean;
  sessionId: string;
}

// Log all PHI access
async function logPhiAccess(log: EnhancedAuditLog) {
  await auditService.log({
    ...log,
    dataClassification: 'phi',
    encryptionUsed: true,
    // Encrypt the audit log itself
    encrypted: true
  });
}
```

---

#### 7.2 Automatic PHI Expiration
```typescript
// Automatically remove old PHI data
const PHI_RETENTION_DAYS = 365 * 7; // 7 years for medical records

async function enforceRetentionPolicy() {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - PHI_RETENTION_DAYS);
  
  const oldEntries = await db.painEntries
    .where('timestamp')
    .below(cutoffDate.toISOString())
    .toArray();
  
  for (const entry of oldEntries) {
    // Archive before deletion
    await archivePhiData(entry);
    // Securely delete
    await secureDelete(entry.id);
    // Log the deletion
    await logPhiAccess({
      action: 'delete',
      resource: 'pain-entry',
      resourceId: entry.id,
      reason: 'Retention policy expired'
    });
  }
}
```

---

#### 7.3 Data Anonymization for Analytics
```typescript
// Remove PII/PHI before analytics
function anonymizeForAnalytics(entry: PainEntry) {
  return {
    painLevel: entry.intensity,
    duration: entry.duration,
    location: entry.location,
    // Anonymize demographics
    ageGroup: getAgeGroup(entry.userId),
    region: getRegion(entry.location),
    // NO: userId, name, specific dates, notes
  };
}
```

---

## 🔐 Enhanced vite.config.ts

```typescript
// Enhanced security configuration
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const isProd = process.env.NODE_ENV === 'production';

// Strict production CSP
const strictProdCsp = [
  "default-src 'none'",
  "script-src 'self'",
  "style-src 'self'",
  "font-src 'self' data:",
  "img-src 'self' data: blob:",
  "connect-src 'self'",
  "worker-src 'self'",
  "manifest-src 'self'",
  "media-src 'self'",
  "object-src 'none'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "upgrade-insecure-requests",
  "block-all-mixed-content",
  "require-trusted-types-for 'script'",
].join('; ');

// Development CSP (more permissive)
const devCsp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // For HMR
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "img-src 'self' data: blob:",
  "connect-src 'self' ws://localhost:* wss://localhost:*", // For HMR
  "worker-src 'self' blob:", // For service worker dev
].join('; ');

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: !isProd, // Only in development
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: isProd, // Remove console in production
        drop_debugger: true,
      },
      format: {
        comments: false, // Remove all comments
      }
    },
    rollupOptions: {
      output: {
        // Better chunking (see BUNDLE_OPTIMIZATION_ANALYSIS.md)
        manualChunks: { /* ... */ }
      }
    }
  },
  server: {
    headers: {
      'Content-Security-Policy': devCsp,
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    }
  },
  preview: {
    headers: {
      'Content-Security-Policy': strictProdCsp,
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'same-origin',
      'Strict-Transport-Security': 'max-age=63072000; includeSubDomains',
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    }
  }
});
```

---

## 📊 Security Audit Checklist

### Pre-Production Checklist
- [ ] All external resources self-hosted or SRI-protected
- [ ] CSP tested with no violations
- [ ] All security headers configured
- [ ] Source maps removed from production
- [ ] Console logs removed from production
- [ ] npm audit shows 0 vulnerabilities
- [ ] HTTPS enforced with HSTS
- [ ] Service worker integrity validated
- [ ] Sensitive data encrypted at rest
- [ ] Audit logging enabled
- [ ] PHI retention policy enforced
- [ ] Data anonymization tested

### Ongoing Monitoring
- [ ] CSP violation reports reviewed weekly
- [ ] Security audit run before each deployment
- [ ] Dependency updates reviewed and tested
- [ ] Audit logs reviewed for suspicious activity
- [ ] Penetration testing scheduled annually
- [ ] Security training for development team

---

## 🧪 Security Testing Plan

### 1. CSP Testing
```bash
# Test CSP with CSP Evaluator
npm install -g csp-evaluator
csp-evaluator --csp="$(cat csp-policy.txt)"

# Test for CSP bypasses
# Use https://csp-evaluator.withgoogle.com/
```

### 2. Security Headers Testing
```bash
# Use securityheaders.com
curl -I https://your-domain.com | grep -E "^(Content-Security-Policy|X-Frame-Options|Strict-Transport-Security)"

# Or use Mozilla Observatory
# https://observatory.mozilla.org/
```

### 3. Vulnerability Scanning
```bash
# npm audit
npm audit --production

# Snyk
snyk test

# OWASP ZAP (automated pen-testing)
docker run -t owasp/zap2docker-stable zap-baseline.py -t https://your-domain.com
```

### 4. Penetration Testing Scenarios
- [ ] XSS attempts via pain entry notes
- [ ] SQL injection via API (if applicable)
- [ ] CSRF attacks on forms
- [ ] Session hijacking attempts
- [ ] Service worker manipulation
- [ ] Cache poisoning
- [ ] Man-in-the-middle attacks

---

## 📚 Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/index.html)
- [CSP Reference](https://content-security-policy.com/)
- [Security Headers Guide](https://securityheaders.com/)
- [Mozilla Web Security](https://infosec.mozilla.org/guidelines/web_security)

---

**Document Version**: 1.0  
**Last Updated**: 2025-10-04  
**Next Security Audit**: After Phase 1-2 implementation  
**Maintained By**: Security Team
