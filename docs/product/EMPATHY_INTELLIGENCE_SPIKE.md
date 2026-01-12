# Empathy Intelligence Engine Spike

Goal
----
Implement a minimal, testable EmpathyIntelligenceEngine baseline that provides deterministic, explainable heuristics and matches the shape expected by existing tests.

Contract (minimal)
------------------
- Function: `calculateAdvancedEmpathyMetrics(userId, painEntries, moodEntries)`
- Inputs:
  - `userId: string`
  - `painEntries: PainEntry[]` (uses `baselineData.pain` numeric 0-10)
  - `moodEntries: MoodEntry[]` (contains `mood` 0-10, `notes: string`, `emotionalClarity`, `emotionalRegulation`, `hopefulness`, `anxiety`, `socialSupport`, `copingStrategies`, etc.)
- Output: `QuantifiedEmpathyMetrics` object (partial supported shape acceptable for spike):
  - `emotionalIntelligence` with numeric subfields
  - `compassionateProgress` with numeric subfields
  - `empathyKPIs` with numeric subfields
  - `humanizedMetrics` with numeric subfields
  - `empathyIntelligence` (profile)
  - `temporalPatterns` (summary)
  - `microEmpathyMoments`
  - `predictiveMetrics`

Heuristics (baseline)
---------------------
- Default for empty inputs: neutral mid-range scores (40-60) to avoid alarming users.
- Use simple aggregates: averages, proportions of entries containing keywords.
- Predictive metrics: lightweight trend-based scores using last N entries.
- Determinism: avoid randomness in spike.

Edge cases
----------
- Empty arrays -> return defaults
- Single entry -> base heuristics using that entry
- Large text notes -> only examine lowercase keywords
- Missing optional fields -> fallback to safe defaults

Privacy & Safety
----------------
- All processing is local and deterministic.
- No external network calls in spike.
- Avoid exposing raw note text in outputs.

Testing Plan
------------
- Unit tests (Vitest):
  - empty inputs -> all major numeric fields present and within 0-100
  - single mood entry -> metrics reflect mood value
  - multiple entries with keywords -> detect counts and adjust heuristics

Next steps
----------
- Implement baseline helper functions in `src/services/EmpathyIntelligenceEngine.ts` (some already present).
- Add tests in `test/services/EmpathyIntelligenceEngine.test.ts`.
- Run `npm run test` and iterate to green.
- Expand heuristics and add documentation for each metric.
