# CrisisCore Web Presence Follow-Up Plan

Generated May 7, 2026.

This plan converts the asset-map audit into concrete repo-side work items, page requirements, and channel updates.

## Repo Reality Check
- In this repo, the PainTracker proof path is already implemented: `/case-study`, `/proof`, and GitHub org links are live on the landing and proof surfaces.
- That means the remaining gap is not route creation inside this repo. The remaining gap is commercial-site alignment, DEV routing, and property consolidation decisions.
- Treat the Priority 1 page requirements below as acceptance checks for the existing PainTracker implementation and as mirroring requirements for the commercial site if that site lives in a different repo.

## Immediate Objectives
- Restore trust at the commercial conversion point.
- Route discovery traffic through the commercial site first.
- Give every public property a clear job: convert, prove, explain, or route.

## Priority 1: Repair the Main-Site Proof Path
### Task 1. Add `/case-study` landing page
- Goal: give the commercial site a concrete proof narrative instead of a dead CTA.
- Source material:
  - `docs/content/blog/blog-worksafe-bc-case-study-documentation-time-savings.md`
  - `docs/case-studies/worksafe-bc/README.md`
- Page job: convert and prove.
- Required sections:
  - Headline and subhead framing the case study as a composite example.
  - Problem statement: paperwork burden, memory fragmentation, documentation inconsistency.
  - Workflow improvement summary: before vs after.
  - Privacy boundary summary: local-first, review before sharing, no outcome promises.
  - Trust disclaimer: not affiliated with or endorsed by WorkSafeBC; not legal or medical advice.
  - CTA block: read the full case study, view PainTracker, contact CrisisCore.
- Acceptance criteria:
  - No dead links in the page body.
  - Composite-example disclaimer visible before any metrics.
  - No claims of guaranteed acceptance, legal success, or medical efficacy.

### Task 2. Add `/proof` landing page
- Goal: replace the unresolved proof artifact CTA with a truthful artifact overview.
- Source material:
  - `docs/trust/defensibility-packet.md`
  - `docs/content/blog/devto-proofvault-trust-case-release-artifact.md`
  - `docs/trust/release-evidence-2026-03-20.md`
  - `docs/trust/threat-model.md`
- Page job: prove and route.
- Required sections:
  - What the proof page is: release evidence, trust case materials, and verification receipts.
  - What it is not: not a claim of perfect security or universal protection.
  - Artifact index: defensibility packet, threat model, release evidence, verification policy.
  - Verification path: what someone can inspect and in what order.
  - CTA block: inspect docs, view GitHub org, contact for audit work.
- Acceptance criteria:
  - Every artifact link resolves.
  - Non-guarantees are explicit.
  - Copy distinguishes release evidence from product marketing.

### Task 3. Add GitHub org link to the proof path
- Goal: let buyers verify the open-source proof surface.
- Placement options:
  - Footer
  - Proof section on the main site
  - `/proof` CTA block
- Acceptance criteria:
  - Link points to `https://github.com/CrisisCore-Systems`.
  - Context explains why the link exists: public proof-of-work and supporting artifacts.

## Priority 2: Fix Discovery Routing
### Task 4. Update DEV profile routing
- Goal: stop routing discovery traffic directly away from the commercial site.
- Change set:
  - Change profile URL to `https://crisiscore-systems.ca`.
  - Add secondary links in the bio or pinned context for:
    - PainTracker
    - GitHub org
    - Protective Computing site, only if kept as a separate public property
- Acceptance criteria:
  - Commercial site becomes the primary profile destination.
  - PainTracker remains visible as the flagship proof asset.

### Recommended DEV profile copy
Short bio:

`Privacy and security audits for software that has to survive unstable conditions. Built by CrisisCore Systems. Flagship proof: PainTracker.`

Suggested link order:
1. `https://crisiscore-systems.ca`
2. `https://paintracker.ca`
3. `https://github.com/CrisisCore-Systems`

## Priority 3: Resolve Property Fragmentation
### Task 5. Decide the fate of the portfolio property
- Option A: fold it into `crisiscore-systems.ca/work`.
- Option B: keep it, but map it to `portfolio.crisiscore-systems.ca` and link it from the main nav.
- Recommendation: consolidate unless the standalone site has a distinct conversion purpose.

### Task 6. Decide the fate of the Protective Computing site
- Option A: keep it as an explicit doctrine/library property with clear relationship copy.
- Option B: consolidate the strongest material into the CrisisCore site and use the GitHub Pages site only as a reference mirror.
- Recommendation: do not leave it as an orphaned brand fragment.

## Monthly Publishing Cadence
### Goal
Keep DEV active enough to support authority without turning it into a content treadmill.

### Minimum cadence
- 1 post per month.

### Preferred cadence
- 2 posts per month.
  - Post 1: build-log or implementation lesson.
  - Post 2: trust, architecture, or verification piece.

### Low-friction monthly checklist
1. Pick one completed PainTracker change, verification pass, or artifact update.
2. Turn it into a short repo-grounded post.
3. Link back to `crisiscore-systems.ca` as the commercial front door.
4. Link one proof asset: PainTracker, GitHub org, or a trust artifact page.
5. Record publish date in the channel tracker.

### Suggested next three posts
1. `Why the commercial site now links to release evidence instead of vague trust copy`
2. `What a defensibility packet proves and what it does not prove`
3. `From isolated product to proof path: how we connected CrisisCore, PainTracker, and release artifacts`

## Repo Tasks To Open
1. Verify the commercial site mirrors or links to the existing PainTracker `/case-study` proof path.
2. Verify the commercial site mirrors or links to the existing PainTracker `/proof` artifact index.
3. Ensure the commercial-site trust path exposes the GitHub org link with proof-of-work context.
4. Update DEV profile URL and bio copy.
5. Decide whether to consolidate or retain the portfolio property.
6. Decide whether to consolidate or retain the Protective Computing property.

## Execution Checklist
### Week of May 7, 2026
| Item | Owner | Target Date | Output |
| --- | --- | --- | --- |
| Confirm where the CrisisCore commercial site is hosted and which repo controls routing/content. | Kay | 2026-05-08 | Repo or hosting target identified so the proof-path work has an implementation destination. |
| Mirror or link the PainTracker `/case-study` proof path from the commercial site. | Kay | 2026-05-10 | Live commercial-site route or explicit redirect to the existing PainTracker case-study page. |
| Mirror or link the PainTracker `/proof` artifact index from the commercial site. | Kay | 2026-05-10 | Live commercial-site route or explicit redirect to the existing PainTracker proof page. |
| Add the GitHub org link to the commercial-site trust path with proof-of-work context. | Kay | 2026-05-10 | Trust surface links to `https://github.com/CrisisCore-Systems` and explains why. |
| Update the DEV profile URL, bio, and link order. | Kay | 2026-05-09 | DEV profile points to `https://crisiscore-systems.ca` first, with PainTracker and GitHub org as secondary links. |
| Decide whether the portfolio property is being consolidated or retained with a routing job. | Kay | 2026-05-14 | Decision recorded with redirect or nav implications. |
| Decide whether the Protective Computing property is being consolidated or retained with relationship copy. | Kay | 2026-05-14 | Decision recorded with redirect or mirror implications. |
| Schedule the next DEV post and record it in the channel tracker. | Kay | 2026-05-14 | Publish date assigned before the next gap forms. |

### Dependencies and blockers
- Commercial-site routing work cannot be completed from this repo unless the commercial-site repo or hosting config is added to the workspace.
- DEV profile changes require a manual account update unless a separate automation path exists outside this repo.
- Property-consolidation decisions should be made before adding new cross-site links that may be temporary.

## Repo Status Snapshot
- Completed in this repo:
  - `/case-study` route and landing page content.
  - `/proof` route and artifact overview page.
  - GitHub org link in the landing proof section and proof page CTA flow.
- Still external to this repo unless a second site workspace is added here:
  - CrisisCore commercial-site route updates.
  - DEV profile URL and bio changes.
  - Domain/property consolidation decisions.

## Definition Of Done
This cleanup is complete when all of the following are true:

- The PainTracker proof path remains live and link-valid.
- The commercial site has no dead proof CTAs.
- The DEV profile points to the commercial site first.
- The GitHub org is reachable from the main trust path.
- The portfolio property either has a routing role or is consolidated.
- The Protective Computing property either has a routing role or is consolidated.
- The next monthly DEV post is scheduled before another long channel gap forms.

## Commercial-Site Handoff Summary
- Reuse the already-implemented PainTracker proof structure instead of inventing a second trust narrative.
- The commercial site needs two trust-entry surfaces:
  - a case-study route that frames the PainTracker story as proof and conversion support.
  - a proof route that indexes artifacts, non-guarantees, and inspection order.
- Minimum CTA set for both routes:
  - View PainTracker.
  - Inspect proof materials.
  - View GitHub org.
  - Contact CrisisCore.
- Required trust boundaries in commercial-site copy:
  - composite-example disclaimer before any metrics.
  - no affiliation or endorsement claim involving WorkSafeBC.
  - no legal, medical, or outcome guarantees.
  - explicit distinction between release evidence and product marketing.
