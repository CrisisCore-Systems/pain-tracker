# Cloudflare + Vercel Deployment (Pain Tracker)

This repo supports:
- **Vercel** for hosting the Vite SPA **and** the `/api/*` serverless routes in the `api/` folder.
- **Cloudflare** for DNS/SSL/CDN and (optionally) Cloudflare Pages static hosting.

Important constraints
- The app deliberately uses **same-origin** calls (e.g. `/api/weather`) to comply with strict CSP (`connect-src 'self'`).
- If you host the frontend on Cloudflare Pages, you must ensure `/api/*` is still available at the same origin (either via Pages Functions or a reverse-proxy). This changes the network path and should be reviewed carefully.

---

## Option 1 (Recommended): Cloudflare DNS + Vercel Hosting

This keeps the full app (SPA + APIs) on Vercel, while Cloudflare manages DNS and edge features.

1) Deploy to Vercel
- In Vercel: **New Project** → Import `CrisisCore-Systems/pain-tracker`.
- The repo already includes `vercel.json` with:
  - `outputDirectory: dist`
  - rewrites for `/api/weather` → Open‑Meteo
  - runtimes for `api/*` functions

2) Attach your domain in Vercel
- Vercel Project → **Settings → Domains**
- Add `paintracker.ca` (apex) and `www.paintracker.ca`.

3) Point Cloudflare DNS to Vercel
In Cloudflare DNS for your zone:
- `A` record: `@` → `76.76.21.21`
- `CNAME` record: `www` → `cname.vercel-dns.com`

4) Verify
- Visit your domain.
- Confirm routes work:
  - SPA deep links (refresh on `/something`) should work.
  - `/api/health/*` routes should respond (if used).
  - Weather correlation should work (calls `/api/weather`).

---

## Option 2: Cloudflare Pages Hosting (Static) + (Required) API Strategy

Cloudflare Pages can deploy the SPA (`dist/`) and already has SPA fallback in `public/_redirects`.

Cloudflare Pages build settings:
- **Build command**: `npm run build:packages && npm run build`
- **Build output directory**: `dist`

However, for a working app you still need `/api/*`.

### 2A) Re-implement APIs as Cloudflare Pages Functions (largest change)
- You would need to port endpoints under `api/` into Cloudflare Pages Functions.
- This is a larger architectural shift.

### 2B) Reverse-proxy `/api/*` from Cloudflare Pages to Vercel (needs review)
- You can proxy `/api/*` to your Vercel deployment so the browser still talks to “same origin”.
- This changes the network path (Cloudflare becomes an intermediary for API traffic) and should be reviewed with the project’s local-first/privacy constraints.

If you want this route, tell me:
- The intended Vercel origin hostname (e.g. `pain-tracker.vercel.app`) and
- Whether you want to proxy **all** `/api/*` or only `/api/weather`.

---

## Notes
- `public/_redirects` currently configures SPA routing for Cloudflare Pages.
- `public/_headers` and `vercel.json` include security headers / CSP. Changes to CSP/headers should be human-reviewed.
