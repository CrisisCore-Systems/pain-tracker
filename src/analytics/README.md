# Analytics Module

This module currently runs in local/no-op mode only.

## Current Behavior

- `src/analytics/analytics-loader.ts` does not load third-party scripts.
- `window.gtag` and `window.dataLayer` are initialized as local no-op shims for compatibility.
- No outbound GA4 or other third-party analytics network requests are made by the loader.

## Why This Exists

Some UI and analytics helper code paths expect a `gtag`-like surface. The loader preserves that surface without enabling external telemetry.

## Guardrails

- Do not add remote script injection here without explicit privacy/security review.
- Do not update documentation to claim GA4 is active unless the code actually sends events off-device.
- Keep CSP `connect-src` and `script-src` constraints aligned with this local-only posture.

## Verification

1. Open DevTools Network tab and interact with the app.
2. Confirm no requests are sent to GA/Tag Manager domains.
3. In DevTools Console, verify `typeof window.gtag === 'function'`.

## Related Files

- `src/analytics/analytics-loader.ts`
- `src/analytics/ga4-events.ts`
- `src/analytics/index.ts`
