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
