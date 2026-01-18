# Analytics Module

This module provides privacy-respecting analytics for the Pain Tracker application using Google Analytics 4 (GA4).

## Overview

The analytics integration is designed to be:
- **Privacy-first**: No PHI (Protected Health Information) is ever sent
- **Opt-in by default**: Controlled by `VITE_ENABLE_ANALYTICS` environment variable
- **Bundled at build time**: Only included in production builds when explicitly enabled
- **Local-first**: Analytics are optional and the app works fully offline without them

## Architecture

### Files

- **`analytics-loader.ts`**: Initializes GA4 and loads the gtag.js script when analytics is enabled
- **`ga4-events.ts`**: Provides type-safe event tracking functions for application events
- **`index.ts`**: Re-exports all analytics functionality

### How It Works

1. The `analytics-loader.ts` module is imported in `src/main.tsx`
2. At build time, Vite checks the `VITE_ENABLE_ANALYTICS` environment variable
3. If enabled (`'true'`), the loader code is bundled and will:
   - Create a `gtag` function on the window object
   - Load the GA4 script from Google Tag Manager
   - Initialize GA4 with measurement ID `G-X25RTEWBYL`
4. If disabled (any other value), a no-op `gtag` stub is provided for safety

## Configuration

### Environment Variables

**`VITE_ENABLE_ANALYTICS`**: Controls whether GA4 analytics is loaded

- Set to `'true'` to enable analytics in production builds
- Set to `'false'` or omit to disable analytics (no external scripts loaded)

### Example Usage

```bash
# Enable analytics for production build
VITE_ENABLE_ANALYTICS='true' npm run build

# Disable analytics (development/testing)
VITE_ENABLE_ANALYTICS='false' npm run dev
```

### Deployment Workflows

The following GitHub Actions workflows enable analytics:

- `.github/workflows/deploy.yml` - Main production deployment
- `.github/workflows/pages.yml` - GitHub Pages deployment
- `.github/workflows/deploy-staging.yml` - Staging environment

## Event Tracking

### Using GA4 Events

Import tracking functions from the analytics module:

```typescript
import { trackPainEntryLogged, trackDataExported } from '@/analytics';

// Track a pain entry
trackPainEntryLogged({
  painLevel: 7,
  hasLocation: true,
  hasNotes: true,
  locationCount: 2,
  symptomCount: 3
});

// Track data export
trackDataExported('csv', 150);
```

### Available Events

See `ga4-events.ts` for the complete list of tracked events, including:

- Pain entry operations (log, update, delete)
- Validation system usage
- Progress and analytics views
- Data exports (CSV, JSON, PDF)
- WorkSafeBC report exports
- Clinical report generation
- Body map interactions
- Empathy insights
- Template operations
- Backup and restore
- Accessibility settings
- Milestones
- Crisis resources
- Mood entries
- Onboarding completion

## Privacy & Security

### Data Minimization

- **No PHI**: Free-text notes, names, or identifiable information are never sent
- **Aggregate metrics only**: Pain levels, counts, and interaction types
- **No user tracking**: No persistent user IDs or cross-session tracking
- **Local-first**: All sensitive data remains on the device

### CSP Compliance

The Content Security Policy (CSP) allows GA4 domains when analytics is enabled:

```
script-src 'self' https://www.googletagmanager.com https://www.google-analytics.com
connect-src 'self' https://www.google-analytics.com https://analytics.google.com
img-src 'self' https://www.google-analytics.com https://www.googletagmanager.com
```

### Service Worker Considerations

The service worker is configured to:
- Use network-first strategy for HTML (ensures fresh content)
- Cache static assets only (JS, CSS, images)
- Service-worker cache version: `1.10` (bumped to force a cache refresh after analytics changes; not the app release version)

## Testing

### Unit Tests

Analytics functions have comprehensive test coverage:

```bash
npm run test -- src/analytics/ga4-events.test.ts
```

### E2E Tests

E2E tests mock GA4 to avoid real analytics calls:

```typescript
// Test setup blocks GA requests
await page.context().route('**://www.google-analytics.com/**', (route) => route.abort());
```

### Manual Verification

1. Build with analytics enabled:
   ```bash
   VITE_ENABLE_ANALYTICS='true' npm run build
   ```

2. Check the built bundle contains GA4:
   ```bash
   grep -o "googletagmanager.com" dist/assets/index-*.js
   ```

3. Open the built app in DevTools and check:
   - Network tab for `g/collect` requests with `tid=G-X25RTEWBYL`
   - Console for `window.gtag` function availability
   - Console for `window.dataLayer` array

## Troubleshooting

### Analytics not loading

1. **Check environment variable**: Ensure `VITE_ENABLE_ANALYTICS='true'` is set during build
2. **Clear service worker**: Hard refresh (Ctrl+Shift+R) or unregister SW in DevTools
3. **Check CSP**: Ensure GA4 domains are allowed in Content-Security-Policy header
4. **Verify build output**: Check that `googletagmanager.com` appears in the bundle

### No events showing in GA4

1. **Wait for propagation**: GA4 realtime view takes 1-2 minutes to show events
2. **Check network tab**: Look for `g/collect` requests with status 200
3. **Verify measurement ID**: Confirm `tid=G-X25RTEWBYL` in network requests
4. **Check browser extensions**: Some ad blockers may block GA4

### Service worker caching old version

1. **Bump SW version**: Increment version number in `public/sw.js`
2. **Hard reload**: Use Ctrl+Shift+R to bypass cache
3. **Unregister SW**: DevTools → Application → Service Workers → Unregister
4. **Clear site data**: DevTools → Application → Clear storage

## Maintenance

### Updating the Measurement ID

If the GA4 Measurement ID changes, update it in:

1. `src/analytics/analytics-loader.ts` (initialization code)
2. This README file (documentation)
3. Test fixtures if applicable

### Adding New Events

1. Add event name to `GA4Events` constant in `ga4-events.ts`
2. Add event parameters interface to `GA4EventParams` if needed
3. Create a typed tracking function (e.g., `trackNewFeature()`)
4. Export the function from `ga4-events.ts` and `index.ts`
5. Add tests in `ga4-events.test.ts`

## References

- [GA4 Event Reference](https://support.google.com/analytics/answer/9267735)
- [GA4 Measurement Protocol](https://developers.google.com/analytics/devguides/collection/protocol/ga4)
- [Privacy-Preserving Analytics](https://web.dev/vitals-ga4/)
