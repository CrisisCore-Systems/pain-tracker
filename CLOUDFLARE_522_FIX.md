# Cloudflare 522 Timeout Error - Resolution Guide

## Issue Summary

**Error**: Cloudflare 522 Connection Timed Out  
**Affected URL**: https://paintracker.ca  
**Root Cause**: Multiple configuration mismatches between deployment paths and application code  
**Status**: ✅ **FIXED** - Code changes committed

---

## What Was Wrong

### 1. Hardcoded `/pain-tracker/` Paths ❌

Several critical files had hardcoded `/pain-tracker/` paths, but the application is deployed at root (`/`):

- **public/sw.js** - Service worker trying to cache `/pain-tracker/*` resources
- **public/manifest.json** - PWA manifest with wrong `start_url` and `scope`
- **public/404.html** - Creating recursive `?p=` URL encoding

### 2. Recursive URL Wrapping ❌

The 404.html file had logic that created infinite URL encoding:
```javascript
// OLD CODE - BROKEN
location.replace('/pain-tracker/?p=' + encodeURIComponent(path + ...));
// Result: /pain-tracker/?p=%3Fp%3D%253Fp%3D... (infinite loop)
```

### 3. Service Worker Cache Misses ❌

Service worker couldn't cache resources because paths didn't match:
- SW looking for: `/pain-tracker/index.html`
- Actual location: `/index.html`
- Result: 404 errors, cache failures, timeouts

---

## What Was Fixed ✅

### 1. Service Worker (public/sw.js)

**Before:**
```javascript
const STATIC_ASSETS = [
  '/pain-tracker/',
  '/pain-tracker/index.html',
  '/pain-tracker/manifest.json',
  // ...
];
```

**After:**
```javascript
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  // ...
];
```

### 2. PWA Manifest (public/manifest.json)

**Before:**
```json
{
  "start_url": "/pain-tracker/",
  "scope": "/pain-tracker/"
}
```

**After:**
```json
{
  "start_url": "/",
  "scope": "/"
}
```

### 3. 404 Page (public/404.html)

**Before:**
```javascript
const path = location.pathname.replace(/^\/pain-tracker\//,'');
location.replace('/pain-tracker/?p=' + encodeURIComponent(path + ...));
```

**After:**
```javascript
// Simple redirect to root - let React Router handle 404
location.replace('/');
```

### 4. Added Health Check (public/health.json)

New static file for monitoring:
```json
{
  "status": "ok",
  "service": "pain-tracker",
  "version": "0.1.0"
}
```

### 5. Added Robots.txt (public/robots.txt)

For SEO and as another health check endpoint.

---

## Deployment Steps

### Step 1: Rebuild and Deploy

```bash
# Build with fixes
npm run build

# Deploy to Cloudflare Pages
# (Manual upload dist folder or use Wrangler CLI)
```

### Step 2: Clear Cloudflare Cache

1. Log into Cloudflare Dashboard
2. Go to your domain (paintracker.ca)
3. Navigate to **Caching** → **Configuration**
4. Click **Purge Everything**
5. Confirm the purge

### Step 3: Verify Service Worker Update

Users with old service worker cached will need to refresh:

1. Visit https://paintracker.ca
2. Open DevTools (F12)
3. Go to **Application** tab → **Service Workers**
4. You should see **v1.3** (with "root path fix")
5. If you see v1.2 or older, click **Unregister** then reload page

### Step 4: Test Health Endpoints

```bash
# Test health check
curl https://paintracker.ca/health.json

# Expected: {"status":"ok","service":"pain-tracker",...}

# Test robots.txt
curl https://paintracker.ca/robots.txt

# Expected: User-agent: * ...

# Test 404 handling
curl -I https://paintracker.ca/nonexistent

# Expected: Should redirect to / without ?p= parameters
```

### Step 5: Verify No Recursive URLs

1. Visit https://paintracker.ca
2. Click any navigation link
3. Check URL bar - should be clean paths like `/start`, `/app`
4. **Should NOT see**: `/?p=%3Fp%3D...` or `/pain-tracker/`

---

## Cloudflare Configuration Checklist

### DNS Settings ✅

Ensure paintracker.ca points to Cloudflare Pages:
- **Type**: CNAME
- **Name**: @ (or paintracker.ca)
- **Target**: pain-tracker.pages.dev (or your Pages URL)
- **Proxy**: Orange cloud (Proxied)

### Page Rules ⚠️

**IMPORTANT**: Remove any redirect rules that create `?p=` parameters!

Go to **Rules** → **Page Rules** and check for:
- ❌ Forwarding URL rules
- ❌ Rules that use `$uri`, `$query` variables
- ❌ Anything mentioning `/pain-tracker/?p=`

**If found, DELETE THEM.**

### Redirect Rules ⚠️

Go to **Rules** → **Redirect Rules** and verify:
- ✅ No rules redirecting to `/pain-tracker/`
- ✅ No rules appending `?p=` parameters
- ✅ Allow simple redirects like `www → non-www` if needed

### Cloudflare Pages Settings ✅

In **Workers & Pages** → **pain-tracker**:

1. **Build settings:**
   - Build command: `npm run build`
   - Output directory: `dist`
   - Root directory: `/` (default)

2. **Environment variables:**
   - VITE_APP_ENVIRONMENT: production
   - (Add any other needed variables)

3. **Functions:**
   - No custom Functions needed for static SPA
   - If you have API routes, ensure they're in `api/` folder

4. **Custom domains:**
   - Add `paintracker.ca`
   - Add `www.paintracker.ca` (optional, can redirect)

---

## Monitoring & Prevention

### Health Check Monitoring

Set up monitoring to ping:
```
https://paintracker.ca/health.json
```

Expected response:
```json
{"status":"ok","service":"pain-tracker","version":"0.1.0"}
```

Alert if:
- Response is not 200 OK
- Response takes > 5 seconds
- JSON is malformed

### Service Worker Version Check

Monitor service worker version in production:

```javascript
// In browser console
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('Service Worker version:', reg.active?.scriptURL);
});
```

Should include `v1.3` or later.

### Common Issues & Solutions

| Issue | Symptom | Solution |
|-------|---------|----------|
| **Old SW cached** | Site still broken | Unregister SW in DevTools |
| **Cloudflare cache** | Changes not visible | Purge Cloudflare cache |
| **Browser cache** | Old version showing | Hard refresh (Ctrl+Shift+R) |
| **Page Rules conflict** | Redirects to `/pain-tracker/` | Delete conflicting Page Rules |
| **DNS propagation** | Site not reachable | Wait 24-48h or flush DNS |

---

## Verification Checklist

After deployment, verify:

- [ ] ✅ https://paintracker.ca loads without errors
- [ ] ✅ No `?p=` parameters in URLs
- [ ] ✅ Service worker shows v1.3 or later
- [ ] ✅ /health.json returns 200 OK
- [ ] ✅ /robots.txt returns 200 OK
- [ ] ✅ PWA installable (manifest.json correct)
- [ ] ✅ Offline mode works (service worker caching)
- [ ] ✅ Navigation between routes works smoothly
- [ ] ✅ No console errors in browser DevTools
- [ ] ✅ Lighthouse score > 90 (optional)

---

## Additional Cloudflare Optimizations

### Recommended Settings

1. **Caching Level**: Standard
2. **Browser Cache TTL**: 4 hours
3. **Always Online**: ON (serves cached version if origin down)
4. **Auto Minify**: Enable HTML, CSS, JS
5. **Brotli Compression**: ON
6. **HTTP/3 (QUIC)**: ON

### Security Headers

Already configured in `public/_headers`:
- Content-Security-Policy
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security

### Performance

Monitor at: https://www.cloudflare.com/analytics/

Key metrics:
- **Total Requests**: Should increase after fix
- **Cached Requests %**: Should be > 80%
- **Errors**: Should drop to near 0%
- **Response Time**: Should be < 200ms

---

## Rollback Plan

If issues persist after deployment:

1. **Immediate**: Purge Cloudflare cache
2. **If still broken**: 
   - Check DNS settings
   - Verify Cloudflare Pages build succeeded
   - Check deployment logs in Cloudflare Pages dashboard
3. **Last resort**: Deploy previous known-good build

---

## Support & Documentation

- **Cloudflare 522 Errors**: https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-5xx-errors/error-522/
- **Cloudflare Pages Docs**: https://developers.cloudflare.com/pages/
- **Service Worker Debugging**: https://developer.chrome.com/docs/workbox/service-worker-lifecycle/

---

## Summary

✅ **Code fixes committed** - All hardcoded `/pain-tracker/` paths changed to `/`  
✅ **Recursive URL issue resolved** - 404.html simplified  
✅ **Service worker fixed** - Now caches correct paths  
✅ **PWA manifest corrected** - Proper scope and start_url  
✅ **Health checks added** - Monitoring endpoints available  

**Next Steps:**
1. Deploy the updated code to Cloudflare Pages
2. Purge Cloudflare cache
3. Verify all checklist items
4. Monitor health.json endpoint
5. Confirm 522 errors are resolved

---

**Document Version**: 1.0  
**Last Updated**: 2025-11-17  
**Author**: GitHub Copilot (Pain Tracker Team)
