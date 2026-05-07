# Hostile Bureaucracy Export RFC

## Status

- Date: 2026-05-07
- Status: Implemented in bounded form
- Owners: Product + Engineering

## Purpose

This document defines the "Hostile Bureaucracy" export mode for Pain Tracker.

The target outcome is not emotional resonance. The target outcome is lower institutional dismissal risk by exporting a record that is:

- structured
- explicit about amendments
- explicit about device-reported capture context
- legible in print
- careful not to overclaim proof that the architecture cannot honestly provide

## What Shipped

The current implementation adds four concrete behaviors.

1. Entry provenance metadata

- Pain entries now support `recordIntegrity` metadata.
- New entries record `createdAt`, `originalTimestamp`, `revisionCount`, and local capture context.
- Entry edits append a revision record with `amendedAt`, changed field names, and a bounded summary of the last delta.
- Existing persisted entries are normalized through migration so the export path can rely on a stable shape.

2. Device-state capture context

- New entries record device-reported network state as `online`, `offline`, or `unknown`.
- Export output summarizes network-state counts for the selected range.
- Export copy explicitly states that this is device-reported context, not notarization or geolocation proof.

3. Functional limitation translation

- Quick Log now captures explicit occupational limitation flags:
  - Incapable of lifting >10 lbs
  - Impaired mobility
  - Loss of grip strength
  - Unable to operate machinery
- The export renders these as binary-style checkbox indicators with entry counts.
- Unchecked items are not inferred from pain score alone.

4. Hostile-bureaucracy template mode

- WorkSafeBC export now supports `templateStyle: 'hostile-bureaucracy'`.
- This mode adds:
  - a provenance log section
  - a capture-environment section
  - a functional limitation translation section
  - monochrome/monospaced presentation cues
- The report manifest now records the selected template style.

## Truthfulness Boundaries

The product must not claim any of the following unless the architecture materially changes.

- "Immutable record"
- "Unforgeable"
- "Cryptographically notarized"
- "Proves location"
- "Proves in-situ capture"
- "Tamper-proof"

The current implementation supports these narrower claims.

- "Amendment-aware local record"
- "Append-only amendment log within the app's persisted record model"
- "Device-reported capture metadata"
- "Structured export for case review"
- "Monochrome audit-style print layout"

## Why The Language Is Constrained

Pain Tracker is a local-first browser application.

That means:

- timestamps depend on device time
- network state depends on browser/device reporting
- there is no external timestamp authority
- there is no third-party witness or notarization service

Because of that, the export can strengthen credibility and reduce ambiguity, but it cannot honestly claim external proof.

## UX Changes Shipped Alongside Export

To reduce capture friction in degraded physical conditions:

- the app now opens to Quick Log when there are no saved entries
- quick-log control targets were enlarged in key high-frequency areas
- explicit occupational limitation toggles were added to the first-screen flow

This is the current low-risk slice of the broader "trades / industrial" mode direction.

## Data Minimization Notes

The amendment log stores bounded summaries, not full historical snapshots of every field.

This is intentional.

- It preserves a reviewable change trail.
- It avoids duplicating sensitive note bodies unnecessarily.
- It reduces exposure compared with full per-revision payload snapshots.

## Follow-Up Work

The following work remains open.

1. Add a user-visible label for the export mode in the reports UI instead of only routing it internally through the WorkSafeBC export path.
2. Add a dedicated settings toggle or route-level mode for industrial / thick-glove entry instead of only changing zero-state landing behavior.
3. Consider chained revision hashes for stronger local tamper-evidence language, while still avoiding external-proof claims.
4. Add broader integration coverage for migration of legacy entries into the provenance model.
5. Review product and marketing copy to replace any unearned "immutable" language with the narrower claims above.

## Validation

Focused validation completed against:

- container quick-entry routing tests
- reports page export-routing tests
- WorkSafeBC export utility tests

At the time of writing, the focused suites passed with 66/66 tests.