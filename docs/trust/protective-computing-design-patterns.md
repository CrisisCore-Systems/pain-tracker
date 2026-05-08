# Protective Computing Design Patterns

This is a stub artifact for the design-pattern layer of the Protective Computing proof path.

It exists to replace vague "forthcoming" language with a truthful status marker and a stable inspection surface.

## Current status

- This document is not a complete pattern catalog.
- It does not claim normative completeness.
- It does define the pattern families intended for the first publishable cut.

## Planned pattern families

### Local authority patterns

- Local-first write before sync
- User-controlled export boundaries
- Explicit storage location and retention choices

### Reversibility patterns

- Typed destructive confirmations
- Import preview before mutation
- Rollback-safe migrations with export-first recovery paths

### Exposure minimization patterns

- Coarse audit logging
- Layered trust-boundary declarations
- Explicit optional-integration gates

### Degraded-mode resilience patterns

- Offline boot without remote configuration
- Mixed-version rollback containment
- Interrupted-session recovery with truthful state messaging

### Coercion-resistance patterns

- Safe-exit and low-visibility affordances
- Non-urgent language in high-stakes flows
- Friction that blocks involuntary destructive actions

## Evidence rule

Each future pattern entry should ship with:

- the failure mode it addresses
- the minimum structural requirement
- one reference implementation or counterexample
- one verification path or test heuristic

## Why this stub exists

Protective Computing should not claim a completed design-pattern library where one is not yet published.

Until the fuller catalog exists, this stub is the honest boundary: pattern work is in progress, the PLS rubric is already live at [pls-rubric.md](./pls-rubric.md), and this page defines the intended scope of the next artifact rather than pretending it is already complete.