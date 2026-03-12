# Pv Metric (Velocity Pressure)

## Formula

`Pv = generation_rate / verification_capacity`

- `generation_rate`: meaningful generated change units per period (for example changed sensitive files or generated diff blocks).
- `verification_capacity`: completed review/test/drill units per same period.

## Interpretation

- `Pv < 1`: verification is keeping pace.
- `Pv = 1`: at parity.
- `Pv > 1`: unsafe pressure; hard interlock required for sensitive scope.

## Suggested Weekly Recording

- Window:
- Sensitive PR count:
- Generated sensitive change units:
- Completed verification units:
- Pv value:
- Interlock state:
- Owner:
