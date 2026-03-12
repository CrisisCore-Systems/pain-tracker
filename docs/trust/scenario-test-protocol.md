# Scenario Test Protocol

Run reproducible runtime scenarios for trust claims.

## Scenario 1: Simulated Network Loss

Goal: confirm critical flows remain usable offline.

Steps:
1. Start app with normal connectivity.
2. Disable network.
3. Run critical flows: assessment, grounding tool, panic mode entry.
4. Capture any failed actions and user-visible errors.

Pass criteria:
- Critical flows remain available.
- No data-loss on reconnect.
- No unexpected network dependency for offline-critical features.

## Scenario 2: Coercion Walkthrough

Goal: validate neutral presentation and safe-exit behavior.

Steps:
1. Enter typical tracking workflow.
2. Trigger panic/safe-exit sequence.
3. Verify deterministic control placement and low-friction path.
4. Independent observer records visible tells.

Pass criteria:
- No obvious sensitive-state tells in neutral mode.
- Panic/safe-exit controls are reachable and consistent.

## Recording Requirements

- Date/time, app version, tester, observer.
- Exact scenario steps and screenshots/logs.
- Failures linked to issues before release approval.
