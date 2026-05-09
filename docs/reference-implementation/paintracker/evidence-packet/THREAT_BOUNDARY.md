# Threat Boundary

## In-scope protections (bounded)

- Local-first journaling and exports with explicit user action.
- Repository-documented trust claims with badge-constrained language.
- Threat-model and security invariants documentation for current implementation surfaces.

## Out-of-scope or unresolved

- Active-coercion resistance is not fully proven.
- Accessibility-complete degraded mode is not externally reviewed end-to-end.
- Independent certification is not present.
- Zero metadata visibility is not proven.

## Operator and network boundary language

- PainTracker can claim bounded zero operator plaintext access on documented local-first default paths.
- PainTracker cannot claim zero metadata visibility.
- Optional network integrations are explicit trust boundaries and are not part of core local journaling guarantees.
