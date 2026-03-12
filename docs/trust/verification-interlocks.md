# Verification Interlocks

Purpose: prevent unsafe merges caused by generation speed exceeding human verification capacity.

## Definitions

- `Generation events`: AI-assisted code additions or modifications to runtime behavior.
- `Verification events`: human review actions, tests, and scenario drills that validate generated changes.
- `Pv`: velocity pressure metric defined in `docs/trust/pv-metric.md`.

## Interlock Levels

- `Soft Interlock`:
  - Trigger: `Pv` approaching 1 on sensitive scope.
  - Action: require focused reviewer checklist and targeted tests.
- `Hard Interlock`:
  - Trigger: `Pv > 1` for sensitive scope.
  - Action: block merge/release until verification parity is restored.

## Sensitive Scope

- Red-zone files listed in `.github/copilot-instructions.md`.
- Crisis logic, panic mode, export boundaries, CSP/service-worker, and Class A data handling paths.

## Minimum Required Evidence

- Review checklist completed.
- Relevant tests executed and linked.
- Scenario drill status linked when runtime behavior changed.
- PLS rubric entry completed for release candidate.
