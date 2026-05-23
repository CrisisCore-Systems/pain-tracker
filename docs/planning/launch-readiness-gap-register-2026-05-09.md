# Launch Readiness Gap Register (2026-05-09)

Source: structured SEO, accessibility, PWA, copy, analytics, and trust-signal review.

This register preserves risk, priority, owner, and required action so launch gates are auditable.

## P0 Launch Blockers

| Area | Check | Status | Owner | Required action |
|---|---|---|---|---|
| Copy Clarity | Pricing and upgrade clarity mismatch (`README` says payments not supported production path while product includes `/pricing`) | Addressed | Kay | Aligned trust boundary copy to optional paid upgrade path via `/pricing` and Stripe Checkout, with sponsor path retained as optional support. |
| Analytics Gaps | Upgrade funnel measurement absent under privacy-first posture | Addressed | Growth | Added local-only funnel event counters for homepage and pricing flows (no Class A metadata). |
| Trust Signals | Pricing trust consistency mismatch between trust docs and `/pricing` surface | Addressed | Kay | Published consistent monetization truth across `README`, `/pricing`, and `/proof` launch evidence links. |

## P1 Fix Before Push

| Area | Check | Status | Owner | Required action |
|---|---|---|---|---|
| SEO Basics | Resource route coverage verification | Addressed | Engineering | Added automated top-25 resource metadata/prerender checks in `src/test/seo-prerendered-entrypoints.test.ts`. |
| SEO Basics | Robots and sitemap evidence missing | Addressed | Engineering | Added automated assertions for robots directives and sitemap public/protected route boundaries. |
| Accessibility | Public accessibility claim proof | Ready | Trust/Security | Treat WCAG 2.2 AA language as claim requiring linked automated axe + keyboard evidence on `/proof`. |
| Accessibility | Keyboard/focus repo evidence visibility | Addressed | Engineering | Published accessibility command and launch-readiness evidence links on `/proof`. |
| Accessibility | External conformance proof absent | Addressed (packet) | Trust/Security | Published narrow-review packet plus archived scan artifact index; external reviewer signature still pending. |
| PWA Behavior | Manifest completeness verification | Ready | Engineering | Run production Lighthouse PWA audit and archive result in proof artifacts. |
| PWA Behavior | Service worker regression safety | Ready | Engineering | Add regression test for offline reload, shell fallback, and API non-caching in production preview. |
| PWA Behavior | Offline fallback page uncertain | Addressed | Engineering | Added test assertions for `public/offline.html` presence and recovery guidance copy. |
| PWA Behavior | App shell route consistency (`/`, `/app`, installed launch) | Addressed | Engineering | Added test coverage for launch path split (`/` public, `/app` protected, `/start` launcher). |
| Copy Clarity | Medical/legal claim safety reinforcement | Ready | Content | Add persistent disclaimer on WorkSafeBC/clinician pages: supports organization only, no guaranteed legal/medical outcomes. |
| Analytics Gaps | Search Console feedback loop missing | Risky | Growth | Add weekly GSC import/review workflow (manual CSV acceptable): page, query, impressions, clicks, CTR, target action. |
| Analytics Gaps | Production runtime error visibility unproven | Addressed | Engineering | Added local-only `trackSafeError` collection using route + error class + source without raw payloads. |
| Trust Signals | README proof stack must be human-readable on web | Addressed | Trust/Security | Added proof-stack and launch delta section on `/proof` with direct evidence links. |
| Trust Signals | Security headers external verification evidence | Ready | Trust/Security | Run Observatory/securityheaders scan and archive score evidence. |
| Trust Signals | Privacy architecture visual proof | Ready | Trust/Security | Add one-screen privacy architecture diagram to `/privacy` and `/proof`. |
| Trust Signals | External review missing | Addressed (publication) | Trust/Security | Published narrow external review packet and archived scans; retain non-guarantee language until signed external findings land. |

## P2 Tighten Soon

| Area | Check | Status | Owner | Required action |
|---|---|---|---|---|
| SEO Basics | Homepage title + meta description | Ready | Content | Keep title stable; test alternate meta description only after sufficient Search Console data. |
| SEO Basics | Canonical and social metadata | Ready | Content | Verify route-level titles/descriptions are route-specific beyond app-shell defaults. |
| SEO Basics | Blog funnel alignment | Ready | Growth | Add consistent CTAs from blog to `/app`, `/resources`, `/proof`, and pricing/sponsor path per monetization truth. |
| Accessibility | Low-cognition claim visibility | Ready | Content | Add 3 screenshots/GIFs demonstrating sub-60-second log, export, and offline mode. |
| PWA Behavior | Install path clarity | Ready | Content | Add concise install CTA on homepage and `/download` with platform-specific copy. |
| Copy Clarity | Core positioning discipline | Ready | Content | Preserve utility-first above-the-fold hierarchy before doctrine framing. |
| Copy Clarity | Patient value path segmentation | Ready | Growth | Mirror patient/builder/WorkSafeBC segmentation on homepage/resources cards. |
| Trust Signals | Compliance claim boundary restraint | Ready | Trust/Security | Continue explicit conformance-not-certification language. |

## Suggested execution order (minimal risk)

1. Resolve P0 monetization truth and pricing consistency first.
2. Publish P1 trust-proof deltas on `/proof` (accessibility command/run, proof stack, evidence links).
3. Verify technical P1s: robots/sitemap, top resource crawl, offline fallback, `/` vs `/app` launch paths.
4. Add privacy-safe measurement and error visibility without collecting Class A content.
5. Close with external narrow review publication and archived scan artifacts.

## Evidence discipline notes

- Any public claim must map to one explicit proof level.
- Keep conformance language consistent with current trust packet posture.
- Do not introduce analytics that can reconstruct pain entries or sensitive user narratives.

## Execution update (2026-05-09)

- Monetization truth aligned in `README.md` and `/pricing` copy.
- `/proof` now includes accessibility command surface, proof stack, and launch-readiness evidence links.
- Technical P1 verification added to `src/test/seo-prerendered-entrypoints.test.ts` for robots/sitemap, top resource set, offline fallback, and launch paths.
- Local-only privacy-safe measurement added for funnel events and runtime error-class visibility.
- Narrow external review publication and archived scan index published under `docs/reference-implementation/paintracker/external-reviews/`.
