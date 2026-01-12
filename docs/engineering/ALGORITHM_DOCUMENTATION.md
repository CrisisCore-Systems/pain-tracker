## Mental Health Limitations & Safety Notice

Pain Tracker includes mood, depression (PHQ-9), and anxiety (GAD-7) tracking to support whole-person care. However:

- **This app is not a substitute for therapy, counseling, or crisis intervention.**
- No clinical diagnosis is provided.
- If you are experiencing thoughts of self-harm or suicide, please use the crisis resources provided in the app or contact emergency services.
- All mental health features are optional and designed to be trauma-informed and non-shaming.
- Data is stored locally and never shared unless you choose to export it.

For urgent help, see the in-app resources banner or visit [988lifeline.org](https://988lifeline.org/) or [findahelpline.com](https://findahelpline.com/).
# Pain Tracker Analytics & Confidence Scoring: Methodology

## Overview
This document explains how Pain Tracker calculates analytics, confidence intervals, p-values, and how to interpret insights for both users and clinicians.

---

## Medication Effectiveness Calculation
- **Aggregation:** All medication entries are scanned for effectiveness ratings ("Very Effective", "Moderately Effective", "Somewhat Effective" = effective; "Not Effective" and "Made Things Worse" = not effective/worse).
- **Percent Effective:** Calculated as (number rated effective) / (total rated) × 100.
- **Confidence Interval:** 95% Wald confidence interval for the proportion effective.
- **P-value:** Binomial test (normal approximation) for difference from 50% effectiveness.
- **Sample Size Warning:** If fewer than 5 ratings, a warning is shown and confidence is reduced.

---

## Trigger & Pattern Analytics
- **Trigger Frequency:** Counts and averages pain for each trigger.
- **Confounding Detection:** Triggers that co-occur in >50% of their appearances are flagged as possible confounders.
- **Multiple Comparisons:** Bonferroni correction is applied to p-value thresholds when testing many triggers.

---

## Confidence Scores
- **Definition:** Each insight is assigned a confidence score (0-100%) based on sample size, effect size, and statistical significance.
- **Calculation:**
  - Higher sample size = higher confidence
  - Statistically significant results (p < 0.05, after correction) = higher confidence
  - Small or noisy samples = lower confidence
- **Display:** Confidence is shown as a percentage and/or as a confidence interval in the insight summary.

---

## Limitations & Warnings
- **Small Sample Sizes:** Insights with <5 observations are flagged as unreliable.
- **Confounding:** Highly correlated triggers may not be independent; interpret with caution.
- **No Network/Cloud:** All analytics are local-only; no data leaves your device.

---

## How to Interpret Insights
- **High Confidence:** Large sample, strong effect, low p-value, wide separation from random chance.
- **Low Confidence:** Few data points, overlapping/confounded triggers, or p-value > 0.05.
- **Clinical Use:** Use insights as supportive information, not as sole basis for clinical decisions.

---

For questions or to report issues, see the README or contact the Pain Tracker team.
