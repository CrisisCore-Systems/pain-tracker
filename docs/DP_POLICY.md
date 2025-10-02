
## Differential Privacy (draft policy)

This document contains a short sensitivity proposal and recommended epsilon guidance for the Quantified Empathy pipeline. It's a draft: Product and Security must review and sign off on the per-metric sensitivities and cumulative epsilon budgets before any production rollout.

### Policy summary

- Default per-collection epsilon (recommended, conservative): 1.0
- Default per-metric sensitivity: 1 (override per-metric as listed below)

### Proposed per-metric sensitivity table (short proposal)

Metric | Proposed sensitivity | Rationale
---|---:|---
`pain_score` | 1 | Discrete 0–10 scale; single-record change affects by at most 1.
`mood_score` | 1 | Discrete 0–10 scale; bounded and similar semantics to pain_score.
`activity_level` | 1 | Ordinal small-range metric (low/medium/high) mapped to 0–2.
`medication_taken` | 1 | Binary flag per entry; presence/absence sensitivity = 1.
`sleep_hours` | 2 | Continuous-ish but measurement error; allow sensitivity 2 to be conservative.
`symptom_duration_minutes` | 5 | Measured in minutes; use coarser sensitivity to bound contribution.
`free_text_note_redactions` | 0 | Free-text content is not released directly; only redaction counts (integer) are exported — sensitivity 0 if counts are aggregated with DP guard.

Notes:
- These are conservative starting points. Product should validate that the numeric scaling and units above match UI data types. Security/Privacy must confirm acceptable cumulative epsilon and release cadence.

### Epsilon guidance and budget

- Per-collection epsilon (per-user per-day window) default: 1.0. This budget is consumed when an aggregated release with added noise occurs.
- For lower-frequency exports (weekly/monthly) consider increasing epsilon proportionally if needed for utility, or reduce sensitivity via pre-aggregation.
- Production MUST include a `PrivacyBudgetManager` with per-user accounting and rejection when budget is exhausted.

### Sign-off checklist (Product + Security)

- [ ] Product review: confirm metric units and business acceptability of proposed sensitivities.
- [ ] Security review: confirm epsilon budgets, cumulative release policy, and storage/transport protections.
- [ ] Decide retention & audit sink requirements (see `docs/AUDIT_HIPAA_IMPLEMENTATION.md` placeholder).
- [ ] Replace in-memory `PrivacyBudgetManager` and `KeyManager` stubs with production integrations before allowing real PHI-containing data to be processed.

### Next steps

- Triage `METRIC_SENSITIVITY` values in code and update this file with final approved numbers.
- Add a rationale table entry mapping to UI fields and sample rates (daily/weekly exports).

```
