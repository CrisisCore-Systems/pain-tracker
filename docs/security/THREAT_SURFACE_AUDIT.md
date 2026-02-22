# Threat Surface Audit (Quick)

Date: 2026-02-21
Scope: quick, code-driven threat surface map (not a full pen-test).

## Summary (What can leave the device)

**Default posture**: most flows are same-origin and local-first. A small number of feature-gated paths can egress data.

Monetization boundary (product constraint):
- **Core tracking stays free and local-first**: no accounts required, no data harvesting, no server dependency.
- Monetization must come from **optional, explicitly enabled value-add features** (not from selling/harvesting health data).
- We charge for **functionality**, not for access to (or resale of) health data.
- Any optional feature that introduces network activity must be treated as part of the threat surface and documented as such.

Concrete examples of acceptable monetization (all optional):
- Encrypted cloud sync / multi-device backup
- Structured export packages for physician visits
- Specialized report generators (e.g., workers’ compensation workflows)
- Advanced analytics overlays (local-only by default)

Canonical product constraints: see `docs/product/MONETIZATION_PRINCIPLES.md`.

Highest-impact egress paths to keep in mind:
- **Testimonials submission API** (server-side can call Google reCAPTCHA + optional Slack webhook)
- **Stripe checkout** (server-side Stripe API + user redirect to Stripe)
- **Weather** (proxied via same-origin `/api/weather` rewrite to Open‑Meteo)
- **WCB submission / FHIR / provider streaming** (present in code; verify actual wiring + CSP allowances before enabling)

Optional paid feature categories (directional; some may be future work):
- **Encrypted multi-device sync/backup**: adds server dependency and new network paths; must be opt-in and reviewed.
- **Structured export packages** for physician visits: may expand export templates; treat as an export-boundary change.
- **Specialized report generators** (e.g., WCB): keep submission behind explicit gating and prefer same-origin proxy.
- **Advanced analytics overlays**: must be local-only by default and avoid telemetry.

Notes on “present in code”:
- **reCAPTCHA is intentionally disabled under the Self-Only production CSP**: we keep `vercel.json` with `script-src 'self'` and do not load the Google reCAPTCHA client script in `src/pages/SubmitStoryPage.tsx`. Enabling reCAPTCHA would require a red-zone CSP change to allow Google origins (and follow-on review).
- **Provider streaming / webhooks were purged**: the dormant healthcare/provider streaming client modules were removed from the repo so they cannot be accidentally wired into the app.

## Network Egress Map

### Browser → Same-origin API (expected)
- `/api/weather` (rewritten to Open‑Meteo on Vercel)
- `/api/stripe/create-checkout-session`
- `/api/landing/testimonial` and related landing endpoints
- `/api/clinic/auth/*` (admin verification/login/refresh/logout in app code)
- Background sync replays are restricted to **same-origin** and `pathname` under `/api` (see `isAllowedSyncUrl`).

### Browser → Third-party origins

- Third-party analytics (GA/GTM/Vercel Analytics) is **disabled** and not permitted by CSP.
- Any third-party navigation typically occurs as an explicit user action (e.g., redirecting to Stripe Checkout).

### Serverless → Third-party origins (Vercel functions)
- Stripe APIs via `stripe` SDK (server-side)
- Testimonials endpoint:
  - optional Google reCAPTCHA verify (`https://www.google.com/recaptcha/api/siteverify`)
  - optional Slack webhook notify (`ADMIN_SLACK_WEBHOOK`)

## Storage Surfaces

### IndexedDB / offline storage
- Encrypted IDB persistence is used for core state (Zustand encrypted persistence + vault boundary).
- Offline storage + sync queue: sync queue items are stored locally and replayed later, but replay is constrained to same-origin `/api`.

### localStorage/sessionStorage
- Used for small flags/preferences/consent and some legacy/migration paths.
- Anything in `localStorage` is accessible to same-origin JS (so XSS is the primary threat).

## PWA / Service Worker

- Service worker caches **static assets** and a minimal app shell; navigations are **network-first**.
- It does not cache API responses by default.
- PWA manager includes utilities to clear caches and best-effort delete IndexedDB databases.

## CSP / Headers Reality Check

There are **two** CSP sources:
- App-side config: `src/config/security.ts` (generates a CSP string)
- Actual deployed headers: `vercel.json` sets `Content-Security-Policy`.

**Current decision**: treat `vercel.json` as the production source of truth. The `index.html` meta CSP was removed to avoid drift.

The deployed CSP currently allows:
- `script-src` and `connect-src` are effectively **self-only** (no GTM/GA/Vercel Analytics origins).

This means:
- Third-party analytics scripts are blocked even if accidentally reintroduced in code.
- Some optional features in code that would require other origins (e.g., Stripe.js, remote WCB endpoints, remote FHIR base URLs) may be blocked unless proxied through same-origin APIs.

Recent hardening:
- Testimonials API: Slack notifications are metadata-only (no user-provided strings forwarded).
- E2E: essential flows now assert **no third-party requests** (unconditionally).

## Export Boundary

Exports (CSV/PDF/JSON/FHIR/WCB) are generated locally, but they are a privacy boundary because they can be saved/shared.
The code may record coarse “export happened” events via local usage tracking.

## Red-Zone Items (Human Review Before Changes)

Human approval recorded: `docs/engineering/reviews/red-zone-approval-2026-02-20.md`.

- Any change that expands `connect-src`/`script-src` in CSP, or enables new third-party origins.
- Any change that enables WCB submission to a remote endpoint rather than a same-origin proxy.
- Any use of FHIR/provider streaming against a remote base URL.
- Any change to vault/encryption/key handling, export formats, or background sync payload semantics.
- Any implementation of encrypted cloud sync / multi-device backup (new network surface, identity/entitlement semantics, and crypto guarantees).

## Recommended Next Checks (If you want to go deeper)

- Confirm which of the “optional” services are actually wired into production routes/UI.
- Add/maintain an automated e2e assertion that essential flows produce **no third-party requests**.
- Review serverless endpoints for input validation and ensure sensitive user-provided strings are not forwarded to Slack unintentionally.
- Keep monetization isolated from health-data surfaces: payment/entitlement flows should not ingest Class A content.
