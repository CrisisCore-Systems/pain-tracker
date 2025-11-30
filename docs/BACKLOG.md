# Backlog (auto-generated)

This backlog was created automatically from a repository scan of TODOs, placeholders and "coming soon" copy. It lists prioritized, small-to-medium tasks suitable for short PRs and issues. Use this as the source for creating issues and a backlog PR.

## How to use
- Create one GitHub issue per backlog item using the title and description below.
- Attach the issue URL to the item in this file when you open the PR.
- Run the full test suite and CI before merging any changes.

## High priority (low effort)

1. Move dashboard constants to a separate module
   - Files: `src/components/dashboard/CustomizableDashboard.tsx` → `src/components/dashboard/constants.tsx` (done)
   - Why: Removes fast-refresh warning and separates data from components.
   - Acceptance: `CustomizableDashboard` imports constants from `constants.tsx`; no behavior change; unit tests pass.
   - Est: 30–60m

2. Ensure `npm audit` output is processed when the tool exits non-zero
   - Files: `scripts/automated-security-testing.mjs` (implemented)
   - Why: CI robustness — `npm audit` exits non-zero on vulnerabilities but still returns JSON.
   - Acceptance: When `npm audit` returns JSON on stdout but non-zero exit, vulnerabilities are parsed into the security report.
   - Est: 15–30m

## Medium priority (documentation / UX)

3. Publish and maintain `docs/FEATURE_MATRIX.md`
   - Files: `docs/FEATURE_MATRIX.md` and components linking to it
   - Why: Many UI placeholders link to this doc; keep it up-to-date and actionable.
   - Acceptance: Document contains features, owners, priority, and target milestone/estimate.
   - Est: 1–2h

4. Replace placeholder copy with real issue links
   - Files: components that show "coming soon" or "Placeholder"
   - Why: Clicking a placeholder should take users to an issue or roadmap item.
   - Acceptance: Each placeholder links to a GitHub issue or `FEATURE_MATRIX.md` entry.
   - Est: 1–2h

## Low priority (larger work / spikes)

5. Spike: Implement EmpathyIntelligenceEngine algorithms
   - Files: `src/services/EmpathyIntelligenceEngine.ts`, `EmpathyDrivenAnalytics.ts`
   - Why: Core analytics are currently placeholder implementations.
   - Acceptance: Provide design doc, unit tests for heuristics, and a validated implementation that matches the contract.
   - Est: multi-day spike + follow-up tasks

6.   collector & guards for quantified empathy data flow
   - Files: referenced in `docs/QUANTIFIED_EMPATHY_DATA_FLOW.md`
   - Why: Security/privacy sensitive; requires architectural review and threat modeling.
   - Acceptance: Threat model approved, data collectors implemented with privacy-preserving guards and tests.
   - Est: multi-week, require human review

## Small polish tasks

- Replace generic `Placeholder` text in `src/components/widgets/DashboardContent.tsx` with a helpful message or link to `FEATURE_MATRIX.md`.
- Review `scripts/generate-test-badge.mjs` TODOs and make CI-friendly behavior (optional).
- Add `BACKLOG.md` to your project board and link each item to issues.

## Suggested next steps

1. Create GitHub issues for medium/low priority items and tag them with `area:analytics`, `area:docs`, `priority:medium` etc.
2. Open a small PR that adds this `BACKLOG.md` and links the high-priority issues.
3. Run CI and merge after approval.

---
Generated on: 2025-09-26

## How to add this BACKLOG to a GitHub project board

1. Create issues for each backlog item (use the titles and descriptions above).
2. Open your GitHub Project (or create one) and add a new column called `Backlog` or `To review`.
3. Add the created issues to the project board by clicking the \"Add cards\" button and searching for the issue number or title.
4. Optionally link each issue back to this `BACKLOG.md` entry by pasting the issue URL into the corresponding section here.

Maintainers: I cannot create issues or modify your project board from this agent. Use these steps to add entries and feel free to ask me to open a PR that adds issue links into this file.
