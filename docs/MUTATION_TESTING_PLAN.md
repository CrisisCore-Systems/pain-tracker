# Mutation Testing Plan (short)

This file captures a concrete, low-risk plan to expand and operationalize mutation testing with Stryker in this repository.

Goals
- Improve test effectiveness by increasing mutation coverage in core logic
- Integrate mutation checks into CI as a non-blocking quality gate initially
- Provide automated PR feedback for maintainers to triage weak tests

Quick starter checklist
1. Keep Stryker as a devDependency and pin to a stable minor (already present).
2. Add a focused mutate set for core utilities and services (start small):
   - `src/utils/**` (calculations, trending, export)
   - `src/services/**` (EmpathyIntelligenceEngine, collectors)
   - `src/lib/analytics/**` (heuristics)
3. Run locally with higher timeout and incremental output:
   - `npx stryker run --timeoutMS 600000` or use `stryker.conf.js` to tune `timeoutMs`.

Configuration recommendations (stryker.conf.js)
- Use incremental mode where supported (speeds repeated local runs).
- Keep `concurrency` moderate (2-4) to avoid CI flakiness.
- Limit `mutate` globs to targeted folders for PR runs.

CI integration
- Add a lightweight mutation job on PRs that runs against the focused mutate set with a short timeout. Mark failures as informational comment on PR (do not block merge at first).
- If mutation score drops significantly (configurable threshold, e.g., -10%), fail a nightly job that flags regressions.

PR automation and triage
- Post a PR comment with Stryker summary and a link to the detailed report (artifact). Include: files mutated, survived mutants list, and suggested tests to strengthen.
- Assign to the PR author or a `tests` team for remediation.

Operational notes
- Start small: expand mutate set after steady-state (2-3 weeks) and when the team is comfortable with triage.
- Prioritize mutation hardening for security-critical code paths and data validation modules.
- Keep mutation runs off the main CI blocking path until the team has capacity to fix surviving mutants.

Next steps (actionable)
1. Create `stryker.conf.js` tuned for focused mutate globs and CI-friendly timeouts. (I can draft this file.)
2. Add a GitHub Action `mutation-check.yml` that runs Stryker on PRs with `--dry-run` artifacts and posts comments.
3. Start a pilot: run Stryker locally on `src/utils` and fix the top 10 surviving mutants.

References
- Stryker docs: https://stryker-mutator.io/docs

---

If you want, I can create `stryker.conf.js` and the GitHub Action workflow next (safe, small changes). Would you like me to add those now?
# Mutation Testing Plan (StrykerJS)

## Goals
- Quantify effectiveness of existing test suite beyond coverage %.
- Identify weak assertions and high-risk logic areas (analytics, reporting, storage abstractions).
- Integrate mutation score badge into existing dynamic badge pipeline.

## Tooling
- Library: `@stryker-mutator/core` (StrykerJS)
- Test Runner: Vitest (use `@stryker-mutator/vitest-runner` once stable; otherwise `command` test runner invoking `vitest --reporter json`)
- Mutated Files Target Phase 1:
  - `src/lib/**`
  - `src/components/pain-tracker/WCBReport.tsx`
  - `src/utils/**`

## Metrics
- Mutation Score (survived vs killed mutants)
- Threshold gates (fail build if below):
  - `high` (break glass target): 80%
  - `low` (minimum acceptable): 65%
  - `break` (fail fast): 50%

## Phase Rollout
| Phase | Scope | Objective | Exit Criteria |
|-------|-------|-----------|---------------|
| 1 | Core logic (lib, utils) | Baseline score | ≥60% baseline established |
| 2 | Key components (reporting) | Improve high-impact domains | +10% over baseline |
| 3 | Edge expansion (hooks, stores) | Strengthen behavioral coverage | Stable ≥75% |
| 4 | Full app w/ exclusion tuning | Optimize runtime vs value | CI runtime < 12m |

## Configuration Draft (stryker.conf.cjs)
```js
/** @type {import('@stryker-mutator/api/core').StrykerOptions} */
module.exports = {
  mutate: [
    'src/lib/**/*.ts',
    'src/utils/**/*.ts',
    'src/components/pain-tracker/WCBReport.tsx',
    '!src/**/__tests__/**',
    '!src/**/test/**'
  ],
  testRunner: 'command',
  commandRunner: { command: 'npx vitest run --reporter=json --passWithNoTests' },
  reporters: ['clear-text', 'html', 'json'],
  timeoutMS: 10000,
  concurrency: 4,
  thresholds: { high: 80, low: 65, break: 50 },
  coverageAnalysis: 'disabled' // Vitest instrumentation not reused yet
};
```

## Badge Generation
1. After mutation run, read `reports/mutation/mutation.json` (or configured json output path).
2. Extract `mutationScore` (float 0-100).
3. Map to color scale:
   - ≥85: brightgreen
   - 75–84: green
   - 65–74: yellowgreen
   - 55–64: yellow
   - 45–54: orange
   - <45: red
4. Emit `badges/mutation-badge.json` (Shields endpoint schema).
5. Add script: `node scripts/generate-mutation-badge.mjs`.
6. Extend `badge:all` → chain mutation step behind fast badges (optional flag for local skip `MUTATE=0`).

## GitHub Actions Integration
- New workflow `mutation.yml` (manual dispatch + scheduled weekly):
  - Install deps with caching.
  - Run baseline Stryker (phase 1 scope).
  - Upload HTML report as artifact.
  - Generate & commit `mutation-badge.json` (same pattern as coverage workflow).
- Optional future: PR comment summarizing diff in mutation score for touched files.

## Performance Considerations
- Start with narrowed `mutate` set (avoid UI-heavy React component trees initially).
- Increase `concurrency` gradually (balance with Windows CI runners if used).
- Potential exclusion candidates: index/barrel files, type-only modules.

## Developer Workflow
- Local exploratory run: `npx stryker run` (adds `reports/mutation/html/index.html`).
- Fast re-run subset: restrict with `--mutate` CLI flag for targeted modules.
- Badge regeneration optional locally (default skip unless `MUTATE=1`).

Example local badge run:
```powershell
$env:MUTATE=1; npm run badge:all
```

## Risk & Mitigation
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Long runtimes | Dev friction | Narrow scope + staged phases |
| Flaky mutants due to async tests | False negatives | Increase timeouts, ensure deterministic test factories |
| Overfitting tests to mutants | Reduced real quality | Prefer semantic assertions over literal noise |

## Success Indicators
- Mutation score trending upward without dramatic test runtime growth.
- Reduced number of survived mutants in critical logic (analytics, report generation).
- Developers referencing mutation reports during refactors.

## Next Steps
1. Add dev dependency: `@stryker-mutator/core`.
2. Add `stryker.conf.cjs` with Phase 1 scope.
3. Create `scripts/generate-mutation-badge.mjs`.
4. Add `badge:mutation` + integrate (optionally excluded by default).
5. Add workflow `mutation.yml` (manual & weekly cron).
6. Document in README (Dynamic Badges section) once stable.

---
*Prepared for initial integration; adjust thresholds after first baseline run.*
