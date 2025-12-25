# Google Analytics Setup Guide

> **Status**: ✅ Configured (build/deploy gated)  
> **Tracking ID**: G-X25RTEWBYL  
> **Last Updated**: 2025-12-24

## Overview

This document explains how Google Analytics is integrated into the Pain Tracker application and how to verify it's working correctly.

## Implementation Details

### 1. Google Analytics Tag (gtag.js)

Google Analytics is loaded *conditionally* at runtime by `src/analytics/analytics-loader.ts`.

- `index.html` includes the loader module.
- The loader appends the remote `gtag.js` script only when `VITE_ENABLE_ANALYTICS === 'true'`.

**Locations**:
- Loader: `src/analytics/analytics-loader.ts`
- Included by: `index.html`

### 2. Content Security Policy (CSP) Configuration

To allow Google Analytics to load and function properly, the following CSP configurations have been updated:

#### a. Cloudflare Pages / Netlify (`public/_headers`)

```
Content-Security-Policy: 
  script-src 'self' 'unsafe-inline' 'unsafe-eval' 
    https://www.googletagmanager.com 
    https://www.google-analytics.com;
  img-src 'self' data: blob: 
    https://www.google-analytics.com 
    https://www.googletagmanager.com;
  connect-src 'self' 
    https://www.google-analytics.com 
    https://analytics.google.com 
    https://region1.google-analytics.com 
    https://region1.analytics.google.com;
```

**Purpose**: Used by Cloudflare Pages and Netlify for security headers.

#### b. Apache Servers (`public/.htaccess`)

Same CSP configuration as above, but using Apache's `Header` directive.

**Purpose**: Used when deploying to Apache web servers.

#### c. Vite Development & Production (`vite.config.ts`)

**Development CSP** (allows hot reload):
```typescript
const devCsp = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com; ...";
```

**Production CSP** (stricter, but allows GA):
```typescript
const prodCsp = "default-src 'self'; script-src 'self' https://www.googletagmanager.com https://www.google-analytics.com; ...";
```

## Required CSP Domains

The following domains must be whitelisted in Content Security Policy for Google Analytics to function:

| Domain | Purpose | CSP Directive |
|--------|---------|---------------|
| `https://www.googletagmanager.com` | Load gtag.js script | `script-src` |
| `https://www.google-analytics.com` | Analytics script & tracking pixel | `script-src`, `img-src` |
| `https://analytics.google.com` | Send analytics data | `connect-src` |
| `https://region1.google-analytics.com` | Regional data endpoint | `connect-src` |
| `https://region1.analytics.google.com` | Regional analytics endpoint | `connect-src` |

## Verification

### Local Development

1. Start the development server with analytics enabled:
   ```powershell
   $env:VITE_ENABLE_ANALYTICS='true'
   npm run dev
   ```

   If you do not set `VITE_ENABLE_ANALYTICS='true'`, the remote GA script will not be appended.

2. Open browser DevTools (F12) and go to the Network tab

3. Filter for "gtag" or "analytics"

4. You should see requests to:
   - `https://www.googletagmanager.com/gtag/js?id=G-X25RTEWBYL`
   - `https://www.google-analytics.com/g/collect` (or similar)

5. Check Console for any CSP violations - there should be none

### Production Build

1. Build the application:
   ```powershell
   npm run build
   ```

2. Verify the built files:
   ```powershell
   # If GA is enabled at build time, the GA measurement ID should appear in the built output
   Select-String -Path .\dist\**\* -Pattern 'G-X25RTEWBYL'

   # Check that CSP allows GA domains (if your deployment uses the generated headers)
   if (Test-Path .\dist\_headers) { Select-String -Path .\dist\_headers -Pattern 'googletagmanager|google-analytics' }
   ```

3. Preview the production build:
   ```powershell
   npm run preview
   ```

4. Open browser and check Network tab (same as local development)

### Live Site Verification

1. Visit https://paintracker.ca or https://www.paintracker.ca

2. Open browser DevTools (F12)

3. Go to Network tab and filter for "analytics" or "gtag"

4. You should see successful requests (status 200) to Google Analytics endpoints

5. Go to Console tab - there should be no CSP violation errors related to Google Analytics

### Google Analytics Dashboard

1. Log in to [Google Analytics](https://analytics.google.com/)

2. Select the property for tracking ID `G-X25RTEWBYL`

3. Go to Reports → Realtime

4. Visit your site in another tab

5. You should see your visit appear in the Realtime report within a few seconds

## Troubleshooting

### Google Analytics Not Detected

**Symptom**: Google says "Your Google tag wasn't detected on www.paintracker.ca"

**Possible Causes**:

1. **CSP Blocking Scripts**
   - Check browser console for CSP violations
   - Ensure all GA domains are whitelisted in CSP
   - Solution: Update CSP configurations (already done)

2. **Ad Blocker Enabled**
   - Many ad blockers block Google Analytics
   - Test with ad blocker disabled
   - This is expected behavior, not a bug

3. **DNS/CDN Caching**
   - Changes may not be immediately visible
   - Clear Cloudflare cache if using Cloudflare
   - Wait 5-10 minutes for CDN propagation

4. **Script Loading Failure**
   - Check Network tab for failed requests
   - Verify HTTPS is working correctly
   - Ensure no network issues

### CSP Violations in Console

**Error**: `Refused to load the script 'https://www.googletagmanager.com/gtag/js?id=G-X25RTEWBYL' because it violates the Content-Security-Policy directive`

**Solution**: Verify that your deployment platform is using the correct security headers:

1. For Cloudflare Pages: Check that `public/_headers` is deployed
2. For Apache: Check that `.htaccess` is being read
3. For Vite dev server: Restart the dev server to pick up config changes

### Data Not Appearing in GA Dashboard

**Possible Causes**:

1. **Testing Locally**
   - GA may filter localhost traffic
   - Test on the live domain instead

2. **Real-Time Delay**
   - Real-time reports can have a 30-60 second delay
   - Historical reports can take 24-48 hours to process

3. **Browser Extensions**
   - Privacy extensions may block GA
   - Test in incognito/private mode

## Privacy & GDPR Compliance

### Current Implementation

Google Analytics is **build/deploy gated** via `VITE_ENABLE_ANALYTICS`. When enabled, the app currently initializes GA at startup.

For consent-first/GDPR-oriented behavior, consider:

1. **Cookie Consent**
   - Implement cookie consent banner
   - Only load GA after user consent (or use Google Consent Mode)
   - Consider using Google's consent mode

2. **IP Anonymization**
   - Already enabled by default in GA4
   - No additional configuration needed

3. **Privacy Policy**
   - Update privacy policy to mention Google Analytics
   - Explain what data is collected
   - Provide opt-out instructions

### Recommended Enhancements

```javascript
// Example: Conditional GA loading based on consent
if (userConsent.analytics) {
  // Load GA script
  const script = document.createElement('script');
  script.src = 'https://www.googletagmanager.com/gtag/js?id=G-X25RTEWBYL';
  script.async = true;
  document.head.appendChild(script);
}
```

## Security Considerations

### Why These CSP Changes Are Safe

1. **Specific Domains**: We only whitelist specific Google Analytics domains, not all external scripts
2. **HTTPS Only**: All GA domains use HTTPS, ensuring encrypted connections
3. **No Inline Scripts**: GA is injected via the loader module, not inline HTML
4. **Explicit Tradeoff**: Enabling GA introduces a third-party script and network calls; keep event payloads minimal and avoid Class A content

### What GA Can Access

When enabled, GA can collect:
- ✅ Page views and navigation patterns
- ✅ User device information (browser, OS, screen size)
- ✅ Geographic location (approximate, based on IP)
- ✅ Referrer URLs

Important nuance:
- A third-party script loaded into your page runs with normal page privileges, so it can **technically access** the DOM and web storage.
- Pain Tracker mitigates this by **not intentionally sending Class A health data** to GA4 and keeping custom event payloads coarse/minimized.

## Support & Resources

- **Google Analytics Help**: https://support.google.com/analytics
- **GA4 Documentation**: https://developers.google.com/analytics/devguides/collection/ga4
- **CSP Documentation**: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
- **Pain Tracker Issues**: https://github.com/CrisisCore-Systems/pain-tracker/issues

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-11-17 | Initial GA tag installation | GitHub Copilot |
| 2025-11-17 | Updated CSP in .htaccess, _headers, vite.config.ts | GitHub Copilot |
| 2025-11-17 | Created documentation | GitHub Copilot |
| 2025-12-24 | Updated doc for loader + build gating + PowerShell | GitHub Copilot |

---

*For questions or issues with Google Analytics integration, please open an issue on GitHub.*
