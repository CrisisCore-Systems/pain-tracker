# Testing Trauma-Informed Systems: Start Here

*A reading path through the CrisisCore testing series for systems that need to work under pain, panic, overload, interruption, and recovery.*

---

This series grew into one of the clearest bodies of work in the repo, but it did not originally ship with a front door.

So this is the front door.

If you're trying to understand how Pain Tracker tests trauma-informed behavior without turning people into specimens, this is the reading order that makes the whole thing legible.

The short version:

- start with the ethics of simulation
- move into signal-injection and calibration
- expand into multi-crisis, recovery, culture, privacy, performance, and UI verification
- finish with full-stack and meta-validation work

This is not about mental-health diagnosis.
This is about UX safety, reliability, and proof under stress.

---

## Phase 1: foundations

Start here if you want the constraints before the tactics.

1. [The Ethics of Simulation](/blog/ethics-of-simulation)
2. [Testing the Untestable](/blog/testing-the-untestable)
3. [The False Positive Problem](/blog/false-positives-calibrating-crisis-detection)

These three posts establish the core rule of the series: test the signals, not the person, and do not pretend a passing test suite is the same thing as understanding distress.

---

## Phase 2: beyond a single crisis model

Once the baseline detector exists, the next problem is that reality refuses to stay neatly categorized.

4. [Cross-Crisis Calibration](/blog/cross-crisis-calibration)
5. [Testing for Co-Occurrence](/blog/testing-co-occurrence)
6. [Testing Recovery](/blog/testing-recovery)

This is where the series stops treating crisis detection as a binary classifier and starts treating it as a messy, layered, longitudinal system.

---

## Phase 3: what the tests still miss if you let them

Good trauma-informed testing has to extend beyond raw detection accuracy.

7. [Internationalization of Trauma](/blog/internationalization-of-trauma)
8. [Testing Privacy-Preserving Analytics](/blog/testing-privacy-preserving-analytics)
9. [Performance Under Pressure](/blog/performance-under-pressure)
10. [Visual Regression for Adaptive Interfaces](/blog/visual-regression-adaptive-interfaces)

These posts cover the defects that are easy to rationalize away if you only test the happy path: cultural mismatch, re-identification risk, slow crisis UI, and adaptive states that technically flip but never become visible.

---

## Phase 4: proving the tests deserve trust

The final layer asks whether the testing system itself is honest.

11. [Testing the Testing](/blog/testing-the-testing)
12. [Testing Across the Stack](/blog/testing-across-the-stack)

This is the capstone end of the series: validate the simulations, then validate the full path from browser input to durable state.

---

## Recommended reading orders

If you want the shortest path:

1. [The Ethics of Simulation](/blog/ethics-of-simulation)
2. [Testing the Untestable](/blog/testing-the-untestable)
3. [The False Positive Problem](/blog/false-positives-calibrating-crisis-detection)
4. [Testing Across the Stack](/blog/testing-across-the-stack)

If you want the full systems path:

1. [The Ethics of Simulation](/blog/ethics-of-simulation)
2. [Testing the Untestable](/blog/testing-the-untestable)
3. [The False Positive Problem](/blog/false-positives-calibrating-crisis-detection)
4. [Cross-Crisis Calibration](/blog/cross-crisis-calibration)
5. [Testing for Co-Occurrence](/blog/testing-co-occurrence)
6. [Testing Recovery](/blog/testing-recovery)
7. [Internationalization of Trauma](/blog/internationalization-of-trauma)
8. [Testing Privacy-Preserving Analytics](/blog/testing-privacy-preserving-analytics)
9. [Performance Under Pressure](/blog/performance-under-pressure)
10. [Visual Regression for Adaptive Interfaces](/blog/visual-regression-adaptive-interfaces)
11. [Testing the Testing](/blog/testing-the-testing)
12. [Testing Across the Stack](/blog/testing-across-the-stack)

---

## Why this series matters

Most software testing assumes the user is calm, consistent, and easy to model.

This series starts from the opposite premise.

The person using the software may be in pain. They may be cognitively overloaded. They may be dissociating. They may be offline. They may be returning after a crisis and trying to understand what the app did.

Testing that kind of system means treating safety, recoverability, performance, privacy, and legibility as one problem.

That is what this series is really about.