# Quantified Empathy Metrics Data Flow

This document maps where each portion of the Quantified Empathy Metrics originates, how it is transformed, and any current privacy / consent considerations. It is an architectural traceability companion so we can validate collection integrity and minimize risk.

## High-Level Pipeline

User Inputs (PainEntry, MoodEntry forms) -> Services:

- EmpathyDrivenAnalyticsService (wrapping EmpathyIntelligenceEngine)
- RealTimeEmpathyMonitor (synthetic real‑time state)
- SecurityService / PrivacyAnalyticsService (privacy gating – currently not wired directly to empathy services)

Outputs:

- QuantifiedEmpathyMetrics (composed object)
- EmpathyInsights[]
- EmpathyRecommendations[]

## Primary Data Sources

| Source | File | Provides |
| ------ | ---- | -------- |
| PainEntry | `src/types/index.ts` | Baseline pain, functional impact, notes (text mined for keywords) |
| MoodEntry | `src/types/quantified-empathy.ts` (MoodEntry interface) | Mood + emotional clarity/regulation + notes (keyword mining) |
| RealTimeEmpathyMonitor | `src/services/RealTimeEmpathyMonitor.ts` | Synthetic empathy level snapshots + micro moments |
| EmpathyIntelligenceEngine | `src/services/EmpathyIntelligenceEngine.ts` | Aggregation, scoring, predictive modeling, wisdom extraction |

## Metric Families and Data Inputs

1. emotionalIntelligence
   - Derived only from MoodEntry + PainEntry patterns (frequency, clarity, coping strategies keywords).
2. compassionateProgress
   - MoodEntry notes for self‑compassion or criticism phrases; PainEntry adversity (high pain baseline). Recovery patterns simulated (placeholder logic for now).
3. empathyKPIs
   - MoodEntry notes + socialSupport field; some duplication (validationGiven/Received use same keyword pools). CulturalEmpathy uses mood note keywords ("culture", etc.).
4. humanizedMetrics
   - MoodEntry notes for narrative/insight keywords; PainEntry counts for adversity & consistency. WisdomProfile synthesized from mood note insight keywords.
5. temporalPatterns / predictiveMetrics
   - Current implementation: largely placeholder / simulated using simple trend & variance calculations over PainEntry baselineData.pain and mood counts; does NOT yet use RealTimeEmpathyMonitor history.
6. microEmpathyMoments
   - Currently produced by EmpathyIntelligenceEngine via `trackMicroEmpathyMoments` (synthetic) and RealTimeEmpathyMonitor (actual tracked micro moments if `trackMicroEmpathyMoment` is called by UI layer).

## Real-Time Monitor Specifics

- `captureEmpathySnapshot` synthesizes empathyLevel using prior snapshot + time-of-day adjustments + random noise.
- No direct ingestion of user textual data except through optional future hooks (sentiment analyzer currently simplistic word list).
- Alerts generated based on thresholds (empathyLevel, emotionalContagionRisk, burnoutRisk).

## Privacy / Consent Gaps

- Empathy services do not currently check SecurityService. No explicit consent token or privacy level gating before computing advanced metrics.
- Keyword mining on `notes` fields operates on raw text; no sanitization (PII scrubbing) prior to analysis.
- RealTimeEmpathyMonitor stores per‑user history in memory (Map) without retention purging beyond 24h; acceptable but not coupled to global privacy retention config.
- Predictive models (EmpathyIntelligenceEngine) store userPatterns, wisdomDatabase in memory with no expiration logic.

## Proposed Improvements

1. Introduce a centralized EmpathyMetricsCollector with:
    - `collect(userId, painEntries, moodEntries, options)` that enforces:
       - consent check via SecurityService (if consentRequired && !consentGranted -> abort)
       - text sanitization (basic PII scrub regex & length cap) before passing notes to engine
       - configurable noise addition for differential privacy when privacy level demands
2. Add type-guard & whitelist for exported QuantifiedEmpathyMetrics fields to prevent leakage of raw notes.
3. Persist only hashed userId keys for pattern maps (salted) when privacy level >= advanced.
4. Add unit tests ensuring sanitized pathways.

## Data Lineage Example (validationReceived)

MoodEntry.notes -> keyword scan (understood|supported|validated|heard) -> count ratio -> score -> stored only as number.
No raw phrase persisted beyond in-memory processing.

## Integrity Checks To Implement

- Assert numeric ranges (0-100) post-calculation.
- Assert absence of raw note substrings inside metrics output (no accidental leakage).
- Log (debug) anonymized summary only when analytics enabled and consent true.

## Next Steps

- Implement collector & guards (See tracking issue / relevant code comments).
- Wire RealTimeEmpathyMonitor micro moments into EmpathyIntelligenceEngine temporal patterns (optional phase 2).
- Add configuration surface for retention of wisdom insights with user export/delete pathway.

## Integration Implementation (Update)

Implemented components:

- `EmpathyMetricsCollector` (`src/services/EmpathyMetricsCollector.ts`) centralizes consent enforcement, sanitization (basic PII redaction), optional differential privacy noise, and range clamping.
- `EmpathyConsentProvider` / `useEmpathyConsent` supply runtime consent gating.
- `useEmpathyMetrics` hook orchestrates collection and exposes metrics + insights + recommendations & redaction count.
- Dashboard (`EnhancedQuantifiedEmpathyDashboard`) refactored to gate on consent and consume hook instead of directly instantiating analytics pipeline.
- Tests: `empathy-metrics-collector.test.ts` (core), `empathy-metrics-sanitization.test.ts` (sanitization & ranges) ensure guardrails.

Assurance:

- Numeric metric leaves validated within [0,100].
- Raw emails / phone patterns redacted before engine processing; output artifacts scan-tested.
- Differential privacy flag injects bounded noise (placeholder uniform) without exceeding valid range.

Remaining Opportunities:

- Extend PII regex set (names, addresses, UUIDs).
- Replace uniform noise with true Laplace distribution & track epsilon budget.
- Add retention & deletion API for wisdom/pattern stores.
- Integrate RealTimeEmpathyMonitor feeds into temporal patterns pipeline.

