# 🩺 Fibromyalgia Quick Reference

> **For Users, Developers, and Healthcare Providers**

## 📍 Quick Feature Access

### For Users

**Start Fibromyalgia Tracking**:
- Navigate to Fibromyalgia Hub (dedicated interface)
- Complete WPI (Widespread Pain Index) selection
- Rate SSS (Symptom Severity Scale) symptoms
- Track triggers, interventions, and quality of life

**View Your Patterns**:
- Check WPI/SSS trends over time
- Identify common triggers
- See effective interventions
- Monitor flare frequency

**Export for Medical Appointments**:
- Generate clinical summaries
- Export WorkSafe BC forms (if applicable)
- Print or email reports to providers

### For Developers

**Key Files**:
```
src/types/fibromyalgia.ts           - Type definitions
src/components/fibromyalgia/        - UI components
src/services/EmpathyIntelligenceEngine.ts - Analytics
src/utils/pain-tracker/pattern-engine.ts  - Pattern detection
```

**Data Model**:
```typescript
interface FibromyalgiaEntry {
  wpi: { /* 18 body regions */ };
  sss: { fatigue, waking_unrefreshed, cognitive_symptoms, somatic_symptoms };
  symptoms: { /* fibro-specific symptoms */ };
  triggers: { weather, stress, sleep, activity, food, hormonal };
  impact: { sleepQuality, moodRating, anxietyLevel, functionalAbility };
  activity: { activityLevel, restPeriods, overexerted, paybackPeriod };
  interventions: { medications, therapies, self-care };
}
```

**Adding Fibro Features**:
1. Import types: `import type { FibromyalgiaEntry } from '../types/fibromyalgia';`
2. Use ACR criteria: WPI 0-19, SSS 0-12
3. Follow trauma-informed patterns
4. Ensure offline-first functionality

### For Healthcare Providers

**Clinical Standards**:
- ACR 2016 Revised Diagnostic Criteria
- WPI (Widespread Pain Index): 0-19 scale
- SSS (Symptom Severity Scale): 0-12 scale
- Diagnostic threshold: (WPI ≥7 AND SSS ≥5) OR (WPI 4-6 AND SSS ≥9)

**Data Export Formats**:
- CSV: Spreadsheet-compatible
- JSON: EMR/EHR integration (FHIR-aligned)
- PDF: Printable summaries (planned)

**What's Tracked**:
- Pain distribution across 18 ACR regions
- Fatigue, sleep, cognitive function
- Mood, anxiety, functional capacity
- Triggers (weather, stress, activity)
- Treatment effectiveness

---

## 🎯 Feature Verification Checklist

| Feature | Status | Location |
|---------|--------|----------|
| WPI (18 regions) | ✅ | `src/types/fibromyalgia.ts` |
| SSS (0-12 scale) | ✅ | `src/types/fibromyalgia.ts` |
| ACR criteria calculator | ✅ | `src/components/fibromyalgia/FibromyalgiaTracker.tsx` |
| Fibro fog tracking | ✅ | SSS cognitive_symptoms |
| Flare pattern detection | ✅ | `FibromyalgiaAnalytics` interface |
| Trigger correlation | ✅ | `triggers` object in entry |
| Energy envelope tools | ✅ | `activity` object in entry |
| Trauma-informed UI | ✅ | `src/components/accessibility/` |
| WorkSafe BC export | ✅ | `src/utils/pain-tracker/export.ts` |
| Privacy (local storage) | ✅ | IndexedDB, no cloud |

---

## 📊 Data Points Tracked

### Pain Assessment
- **44+ Anatomical Locations**:
  - 26 general pain locations
  - 18 fibromyalgia WPI regions
- **19 Symptom Quality Types**: sharp, burning, tingling, etc.

### Fibromyalgia Severity
- **WPI Score**: 0-19 (painful body regions)
- **SSS Score**: 0-12 total
  - Fatigue: 0-3
  - Waking unrefreshed: 0-3
  - Cognitive symptoms: 0-3
  - Somatic symptoms: 0-3

### Quality of Life
- Sleep quality: 0-5
- Mood rating: 0-5
- Anxiety level: 0-5
- Functional ability: 0-5

### Triggers
- Weather conditions
- Stress levels
- Sleep quality
- Activity/overexertion
- Food sensitivities
- Hormonal changes

### Interventions
- Medications
- Physical therapy
- Meditation/mindfulness
- Heat/cold therapy
- Massage
- Yoga/Tai Chi
- Aqua therapy
- Supplements

---

## 🔬 Technical Specifications

### ACR 2016 Compliance

**Widespread Pain Index (WPI)**:
```
Upper body: shoulders, upper arms, lower arms (bilateral)
Lower body: hips, upper legs, lower legs (bilateral)
Axial: jaw, chest, abdomen, upper back, lower back, neck
Total: 18 regions
```

**Symptom Severity Scale (SSS)**:
```
Fatigue:              0 (none) to 3 (severe)
Waking unrefreshed:   0 (none) to 3 (severe)
Cognitive symptoms:   0 (none) to 3 (severe)
Somatic symptoms:     0 (none) to 3 (severe)
Total SSS: Sum of above (0-12)
```

**Diagnostic Criteria**:
```
Fibromyalgia if:
  (WPI ≥ 7 AND SSS ≥ 5) OR
  (WPI 4-6 AND SSS ≥ 9)
AND
  Symptoms present ≥ 3 months
  No other explanation for symptoms
```

### Data Structure

**Storage**: IndexedDB (local, encrypted)  
**Format**: TypeScript interfaces with Zod validation  
**Export**: CSV, JSON (FHIR-aligned structure)

---

## 📚 Additional Resources

- **[Complete Features Guide](FIBROMYALGIA_FEATURES.md)**: In-depth documentation
- **[Claims Verification](FIBROMYALGIA_CLAIMS_VERIFICATION.md)**: Evidence-based verification
- **[Main README](../README.md)**: Project overview
- **[Architecture Guide](ARCHITECTURE_DEEP_DIVE.md)**: Technical details

---

## 🤝 Support

**Questions?**
- GitHub Issues: [Report bugs or request features](https://github.com/CrisisCore-Systems/pain-tracker/issues)
- Security: See [SECURITY.md](../SECURITY.md) for vulnerability reporting

**Contributing**:
- See [CONTRIBUTING.md](../CONTRIBUTING.md)
- Focus areas: ML pattern recognition, advanced heatmaps, mobile optimization

---

## ✅ Verification Summary

**All fibromyalgia claims verified** as of November 16, 2024:

- ✅ 44+ anatomical locations (exceeds "25+" claim)
- ✅ 19 symptom quality types (exact match)
- ✅ ACR 2016 diagnostic criteria implementation
- ✅ Fibro-specific analytics (WPI, SSS, flare tracking)
- ✅ Pattern recognition (heuristic-based)
- ✅ Trauma-informed design (comprehensive system)
- ✅ WorkSafe BC exports (production-ready)
- ✅ Offline-first architecture
- ✅ Privacy-first security (local storage only)

**Planned enhancements** (Q1-Q2 2025):
- 🔄 Machine learning flare prediction
- 🔄 Advanced correlation analysis
- 🔄 Enhanced body heatmaps

---

**Version**: 1.0  
**Last Updated**: November 16, 2024  
**Status**: All core features verified and documented
