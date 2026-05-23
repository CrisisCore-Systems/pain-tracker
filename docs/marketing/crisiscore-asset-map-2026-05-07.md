# CrisisCore Asset Map

Generated May 7, 2026.

## Scope
This document captures the current state of owned CrisisCore web properties, known cross-property links, orphaned assets, and cleanup priorities.

Status labels in this audit:

- Live and healthy
- Partial / needs work
- Dead / unreachable
- Active link
- Orphaned (no inbound)
- Broken / 404

## Snapshot
The current web presence is fragmented across a main commercial site, a thin portfolio property, a separate Protective Computing brand site, a DEV profile, and the PainTracker flagship product.

The highest-consequence problem is on the commercial site: proof-oriented calls to action appear unresolved at the conversion point. The second problem is routing authority away from the commercial site via the DEV profile URL. The portfolio and Protective Computing properties are both currently isolated from the main trust path.

## Property Inventory
| Asset | URL | Current state | Notes |
|---|---|---|---|
| CrisisCore Systems main site | https://crisiscore-systems.ca | Live and healthy | Custom domain. No blog. No nav path to portfolio. Primary commercial site for audit and review services. |
| CrisisCore portfolio | https://crisiscore-portfolio.vercel.app | Partial / needs work | Vercel subdomain only. Thin content detected during crawl. Appears isolated from the rest of the brand system. |
| Protective Computing site | https://protective-computing.github.io | Partial / needs work | Live GitHub Pages property, but currently orphaned from the main commercial path. |
| DEV profile | https://dev.to/crisiscoresystems | Live and healthy | Profile is live with published posts, but profile URL currently sends traffic to PainTracker instead of the main commercial site. |
| PainTracker | https://paintracker.ca | Referenced live | Flagship product and primary proof asset. Not directly crawled in this audit, but receives inbound references. |
| GitHub org | https://github.com/CrisisCore-Systems | Live and healthy | Public proof-of-work surface. Not linked from the main commercial site. |

## Per-Property Notes
### crisiscore-systems.ca
- Purpose: primary commercial site for privacy and security audit services.
- Offer framing observed: 48h Teardown (CA$250), Full Review (CA$1,200), Fix Sprint (CA$1,500).
- Proof references observed: PainTracker and ProofVault.
- Outbound links found:
  - Active link to PainTracker in the proof section.
  - Contact form on-page.
  - Case study CTA appears unresolved and likely points to `/case-study` or another missing route.
  - Redacted artifact CTA appears unresolved and likely points to `/proof` or another missing route.
- Inbound links detected:
  - No detected inbound from the portfolio property.
  - No detected inbound from the DEV profile.

### crisiscore-portfolio.vercel.app
- Purpose: portfolio showcase site.
- Observed state: thin content, likely starter-template level content.
- Outbound links found: no resolvable outbound links detected in the crawl snapshot.
- Inbound links detected:
  - Not linked from crisiscore-systems.ca.
  - Not linked from the DEV profile.
  - Not linked from protective-computing.github.io.

### protective-computing.github.io
- Purpose: Protective Computing project site and separate brand surface.
- Observed state: live, but disconnected from the commercial trust path.
- Outbound links found:
  - GitHub org and repositories implied.
  - No detected links to crisiscore-systems.ca.
  - No detected links to paintracker.ca.
- Inbound links detected:
  - Not linked from crisiscore-systems.ca.
  - Not linked from the DEV profile.

### dev.to/crisiscoresystems
- Purpose: publication and discovery channel.
- Observed state: live profile with published posts.
- Published posts observed:
  - Service Worker Failure Modes in Offline-First PWAs (May 4, 2026)
  - Trauma-informed design: How does it actually know I'm struggling? (Nov 29, 2025)
  - Building Software That Actually Gives a Damn (Nov 28, 2025)
  - Building a Healthcare PWA That Actually Works (Nov 27, 2025)
- Profile bio link state:
  - Profile URL points to paintracker.ca.
  - crisiscore-systems.ca is not present in the profile links observed in this audit.
  - Portfolio link is not present in the profile links observed in this audit.

### paintracker.ca
- Role: flagship product and strongest proof asset in the current ecosystem.
- Observed inbound references:
  - Linked from crisiscore-systems.ca in the proof section.
  - Used as the DEV profile URL.
- Missing inbound references:
  - No detected link from the portfolio property.
  - No detected link from protective-computing.github.io.

### github.com/CrisisCore-Systems
- Role: public proof-of-work and verification surface.
- Known repositories observed in this audit:
  - `pain-tracker`.
  - `protective-computing`.
- Inbound links detected:
  - DEV repo card links to the PainTracker repository.
- Missing inbound links:
  - No detected link from crisiscore-systems.ca.

## Cross-Property Link Map
| From | To | State |
|---|---|---|
| crisiscore-systems.ca | paintracker.ca | Active link |
| dev.to/crisiscoresystems | paintracker.ca | Active link via profile URL |
| dev.to/crisiscoresystems | github.com/CrisisCore-Systems/pain-tracker | Active link via repo card |
| crisiscore-portfolio.vercel.app | Any owned asset | No outbound links detected |
| protective-computing.github.io | crisiscore-systems.ca | No outbound link detected |
| protective-computing.github.io | paintracker.ca | No outbound link detected |
| crisiscore-systems.ca | Case study CTA | Broken or unresolved |
| crisiscore-systems.ca | Redacted artifact CTA | Broken or unresolved |

## Primary Findings
### 1. Broken proof CTAs on the main commercial site
The main conversion surface appears to advertise a flagship case study and redacted artifact, but those links were not resolved during the crawl. That weakens credibility at the exact point where a buyer is being asked to trust the proof narrative.

### 2. DEV traffic is routed away from the commercial site
The current DEV profile URL points to PainTracker only. That means the strongest public discovery channel routes people to the product instead of the audit business.

### 3. The portfolio property has no trust-path function
The portfolio site currently behaves like an isolated island. It adds maintenance surface without contributing to conversion, search authority, or proof continuity.

### 4. Protective Computing branding is structurally disconnected
The GitHub Pages site appears live but unintegrated. Without explicit bridge copy, it reads as a separate brand fragment rather than a supporting doctrine site.

### 5. GitHub proof is underexposed
The open-source proof surface exists, but the main commercial site does not currently appear to link to it. That blocks easy buyer verification.

### 6. Publishing cadence on DEV is uneven
A five-month visible gap between Nov 2025 and May 2026 weakens profile authority and makes the channel look less active than the underlying work suggests.

## Cleanup Priority Order
| Priority | Issue | Asset | Impact | Recommended fix |
|---|---|---|---|---|
| 1 | Broken case study and redacted artifact links | crisiscore-systems.ca | Damages trust at the conversion point | Publish `/case-study` and `/proof` pages, or remove those CTAs until the target pages exist. |
| 2 | DEV profile URL points only to PainTracker | dev.to/crisiscoresystems | Discovery traffic bypasses the commercial site | Change the profile URL to `https://crisiscore-systems.ca` and add a secondary PainTracker link in the profile bio. |
| 3 | Portfolio site is fully isolated | crisiscore-portfolio.vercel.app | No SEO or navigation value | Add a nav link from the main site, or redirect the portfolio into a `/work` section on the main site. |
| 4 | Protective Computing site is orphaned | protective-computing.github.io | Dilutes authority and fragments the brand graph | Either consolidate the content under CrisisCore, or add explicit cross-links and relationship copy. |
| 5 | No GitHub org link from main site | crisiscore-systems.ca | Buyers cannot easily verify proof-of-work | Add a GitHub link in the footer or proof section. |
| 6 | DEV posting gap is too long | dev.to/crisiscoresystems | Weakens freshness and discoverability | Publish at least one post per month; repurpose build logs and implementation notes from PainTracker. |
| 7 | Portfolio remains on a Vercel subdomain | crisiscore-portfolio.vercel.app | Weakens presentation quality if shared directly | Either map it to `portfolio.crisiscore-systems.ca` or consolidate it into the main site. |
| 8 | PainTracker repo social proof is thin | github.com/CrisisCore-Systems/pain-tracker | Weakens visible showcase strength | Pin the repo, refresh the README, add badges and a live-demo link, and reference it directly from DEV posts. |

## Recommended Execution Sequence
### Immediate
- Fix or remove the broken proof CTAs on crisiscore-systems.ca.
- Change the DEV profile URL to crisiscore-systems.ca.
- Add a GitHub org link to the main site.

### Next
- Decide whether the portfolio remains a standalone property or becomes part of the main site.
- Decide whether Protective Computing remains a distinct public brand or becomes a clearly-labeled supporting doctrine section.

### Ongoing
- Maintain a minimum monthly DEV publishing cadence.
- Keep PainTracker as the flagship proof path, but route discovery through the commercial site first.

## Open Verification Items
The following claims should be rechecked against the live properties before they are treated as final cleanup tickets:

- Exact target hrefs for the unresolved case study and redacted artifact CTAs.
- Whether protective-computing.github.io has hidden footer or nav links not visible in the crawl snapshot.
- Whether the portfolio property contains outbound links that were missed by the thin-content crawl.
- Whether the DEV profile bio contains additional links that were omitted from the crawl snapshot.

## Decision Rule
Do not keep disconnected properties live without a clear job in the trust path. Every public asset should do at least one of the following:

- convert
- prove
- explain
- route

If it does none of those, consolidate or retire it.
