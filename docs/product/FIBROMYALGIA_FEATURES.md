# 🩺 Fibromyalgia Features Guide

> **Pain Tracker's fibromyalgia support system**  
> WPI/SSS scoring + threshold helpers with trauma-informed design

---

## 🎯 Overview

Pain Tracker offers specialized tools and analytics for people with fibromyalgia—a chronic pain condition characterized by widespread pain, fatigue, and complex symptoms. This guide documents what is implemented in the codebase and how it maps to common tracking workflows.

---

## ✅ Core Fibromyalgia Features

### 1. **Multi-Dimensional Symptom Tracking**

#### 📍 **Anatomical Location Tracking**
Pain Tracker supports detailed location tracking via:

- **General pain locations** (`src/utils/constants.ts`) — a detailed list (including legacy compatibility entries)
- **Fibromyalgia WPI regions** (`src/types/fibromyalgia.ts`) — region-based selection used for WPI-style scoring

#### 🔍 **Symptom Descriptor Types**
Symptom descriptor options beyond simple pain intensity are defined in `src/utils/constants.ts`.

1. Sharp
2. Dull
3. Dull ache
3. Aching
4. Burning
5. Tingling
6. Numbness
7. Stiffness
8. Weakness
9. Spasm
10. Swelling
11. Radiating
12. Throbbing
13. Pins and needles
14. Electric shock sensation
15. Hypersensitivity
16. Reduced sensation
17. Muscle weakness
18. Loss of reflexes
19. Cramping

These descriptors are intended to support personal tracking and communication with clinicians.

#### 📊 **Severity Gradients & Time Logging**

**Symptom Severity Scale (SSS)**: 0-12 total score (`src/types/fibromyalgia.ts`)
- **Fatigue**: 0-3 scale (none to severe)
- **Waking Unrefreshed**: 0-3 scale
- **Cognitive Symptoms** (Fibro Fog): 0-3 scale
- **Somatic Symptoms** (headaches, IBS): 0-3 scale

**Quality of Life Impact**: 0-5 scales for:
- Sleep quality
- Mood rating
- Anxiety level
- Functional ability (full function to bedbound)

**Temporal Tracking**:
- Timestamp for every entry
- Flare duration tracking
- Pattern progression over time
- Historical trend analysis

---

### 2. **Fibro-Specific Analytics**

#### 🧠 **Pattern Recognition System**

**Empathy Intelligence Engine** (`src/services/EmpathyIntelligenceEngine.ts`):
- Heuristic-based pain pattern analysis
- Emotional metrics integration
- Personalized insight generation

**Fibromyalgia Analytics Interface** (`src/types/fibromyalgia.ts`):
```typescript
interface FibromyalgiaAnalytics {
  // WPI/SSS Scoring
  wpiScore: number;                    // 0-18 (as implemented)
  sssScore: number;                    // 0-12
  meetsDiagnosticCriteria: boolean;    // Threshold helper (not a diagnosis)
  
  // Pattern Analysis
  mostAffectedRegions: Array<{
    region: string;
    frequency: number;
    percentage: number;
  }>;
  
  commonTriggers: Array<{
    trigger: string;
    frequency: number;
  }>;
  
  symptomTrends: {
    fatigue: { current, trend, average };
    cognition: { current, trend, average };
    sleep: { current, trend, average };
  };
  
  // Flare Tracking
  flareFrequency: number;              // Per month
  averageFlareDuration: number;        // Days
  flareIntensity: 'mild' | 'moderate' | 'severe';
  
  // Effective Interventions
  effectiveInterventions: Array<{
    intervention: string;
    correlationWithImprovement: number;
  }>;
}
```

**Pattern Detection Capabilities**:
- Migratory pain patterns (pain moving between body regions)
- Flare-up triggers and duration
- Fibro fog episode tracking
- Sleep-pain correlations
- Activity-symptom relationships

#### 📈 **Trend Visualizations**

**Implementation** (`src/components/analytics/`, `src/utils/pain-tracker/`):
- **Pattern Engine**: Advanced trend detection algorithms
- **Trending Module**: Time-series analysis of symptom progression
- **Interactive Charts**: Recharts and Chart.js visualizations
- **Correlation Graphs**: Multi-variate analysis showing:
  - Sleep quality vs pain levels
  - Activity impact on symptoms
  - Medication effectiveness
  - Mood-pain relationships

**Fibromyalgia-Specific Visualizations**:
- WPI heatmap showing widespread pain distribution
- SSS trend lines over time
- Flare frequency calendars
- Trigger correlation matrices

---

### 3. **Empathy & Trauma-Informed Design**

#### 💝 **Trauma-Informed Architecture**

**Design Philosophy**: Recognizing that fibromyalgia patients often face:
- Chronic illness trauma
- Medical invalidation and dismissal
- Complex PTSD from long diagnostic journeys
- Anxiety around symptom tracking and medical encounters

**Implementation** (`src/components/accessibility/`):
- **TraumaInformedProvider**: Global preference management
- **Crisis Detection System**: Automatic identification of distress patterns
- **Progressive Disclosure**: Stepwise information presentation to reduce cognitive load
- **Gentle Language Mode**: Context-sensitive, empathetic UI copy
- **User Agency**: Full control over data visibility and tracking depth

#### 📝 **Quality of Life Beyond Pain**

**Comprehensive Tracking** (`src/types/fibromyalgia.ts`):
```typescript
interface FibromyalgiaEntry {
  // Quality of Life Impact
  impact: {
    sleepQuality: 0-5;        // Crucial for fibromyalgia management
    moodRating: 0-5;          // Depression/anxiety comorbidity
    anxietyLevel: 0-5;        // Stress-symptom relationship
    functionalAbility: 0-5;   // Daily living capacity
  };
  
  // Pacing & Activity
  activity: {
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'high';
    restPeriods: number;
    overexerted: boolean;
    paybackPeriod: boolean;   // Post-exertional malaise tracking
  };
  
  // Environmental & Lifestyle Triggers
  triggers: {
    weather?: 'humidity' | 'barometric_pressure' | 'cold' | 'heat';
    stress?: boolean;
    poorSleep?: boolean;
    overexertion?: boolean;
    underActivity?: boolean;
    foodSensitivity?: string[];
    hormonalChanges?: boolean;
  };
}
```

**Mood-Pain Integration**:
- Bidirectional tracking: pain affects mood, mood affects pain perception
- Empathy metrics for emotional validation
- Anxiety level correlation with symptom severity

---

### 4. **Clinical Integration & Export Features**

#### 🏥 **WorkSafeBC-Oriented Exports**

**Export & Reporting Utilities** (`src/utils/pain-tracker/export.ts`, `src/utils/pain-tracker/wcb-export.ts`):
- **CSV Export**: Structured data export
- **JSON Export**: Machine-readable format
- **PDF Export**: Printable reports for sharing (user-controlled)

Note: Export templates are designed to support real workflows, but this documentation does not claim official compliance with any specific form or regulatory requirement.

#### 📋 **Evidence-Based Assessment Scales**

**WPI/SSS Scoring & Threshold Helpers** (`src/types/fibromyalgia.ts`, `src/utils/pain-tracker/fibroDiagnostic.ts`):

**Widespread Pain Index (WPI)**:
- Region-based selection used to compute a WPI-style score

**Symptom Severity Scale (SSS)**:
- Scale: 0-12 total
- 4 symptom domains (0-3 each)
- Commonly used clinical assessment scale

**Diagnostic Threshold Calculation (as implemented)**:
```typescript
// Meets fibromyalgia criteria if:
(wpiScore >= 7 && sssScore >= 5) || 
(wpiScore >= 4 && wpiScore <= 6 && sssScore >= 9)
```

**Real-Time Feedback**: UI indicates when entries meet diagnostic thresholds, helping users understand symptom severity in clinical context.

#### 🔬 **Clinical Data Formats**

**Export Capabilities** (`src/components/pain-tracker/clinician-export/`):
- **Visit Summaries**: Condensed reports for medical appointments
- **Trend Reports**: Longitudinal data for treatment evaluation
- **Intervention Analysis**: Effectiveness tracking for medications, therapies
- **FHIR-Compatible Structure**: Aligned with healthcare data standards

---

### 5. **Offline-First Convenience**

#### 💾 **Local-First Architecture**

**Implementation**:
- **IndexedDB Storage**: Data persists locally (`src/utils/pain-tracker/storage.ts`)
- **Offline-Capable Core**: Core tracking works without internet; some integrations require network
- **Selective Encryption**: Sensitive data encrypted at rest (AES-GCM helpers)
- **Sync-Free by Default**: No account required for core tracking

**Benefits for Fibromyalgia Patients**:
- Track symptoms during flares without connectivity stress
- No service interruptions affecting critical health tracking
- Maximum privacy for sensitive health information
- Accessible in remote areas or during hospitalization

#### 📱 **Progressive Web App (PWA)**

**Status**: In testing phase (`PWA-COMPLETE.md`)
- Service worker implementation
- Offline caching strategies
- Install to home screen capability
- Background sync for future cloud features (opt-in)

---

### 6. **Security for Vulnerable Populations**

#### 🔒 **Privacy-First Design**

**Multi-Layer Security Architecture**:

1. **Data Storage Layer** (`src/services/EncryptionService.ts`):
  - Encryption helpers for sensitive fields
  - Local-first storage

2. **HIPAA-Aligned Controls** (`src/services/HIPAACompliance.ts`):
  - Compliance-oriented controls and documentation (not a compliance claim)

3. **Security Service** (`src/services/SecurityService.ts`):
   - Event logging and monitoring
   - CSP (Content Security Policy) headers
   - XSS and injection protection
   - Automated security scanning

**Why This Matters for Fibromyalgia Patients**:
- **Stigma Protection**: Fibromyalgia is often dismissed or stigmatized; local storage prevents data leaks
- **Insurance Concerns**: Health tracking data could affect insurance; no external access
- **Intimate Details**: Tracking includes personal triggers, mental health, intimate symptoms
- **Medical Mistrust**: Many fibro patients have experienced medical gaslighting; full data control builds trust

#### 🛡️ **Zero-Trust Model**

- No accounts or authentication required
- No default transmission of Class A health data
- Optional anonymous usage analytics may be enabled by deploy/build configuration (for example, `VITE_ENABLE_ANALYTICS`)
- No advertisement or data monetization
- User-controlled export/sharing by default

---

### 7. **Roadmap: Advanced Fibromyalgia Features**

#### 🤖 **Machine Learning Pattern Recognition** (Planned)

**Planned Capabilities**:
- Flare prediction 48-72 hours in advance
- Personalized trigger identification
- Optimal activity level recommendations
- Treatment response prediction

**Approach**:
- Local ML models (TBD)
- Privacy-preserving training on device
- Federated learning for community insights (opt-in, if ever added)
- No data leaves device without explicit consent

#### 📊 **Advanced Correlation Analysis** (In Development)

**Current State**: Basic correlation tracking implemented

**Planned Enhancements**:
- Multi-variate analysis (3+ factors simultaneously)
- Temporal lag correlation (e.g., activity today → pain tomorrow)
- Weather API integration for barometric pressure tracking
- Hormonal cycle correlation for menstruating users
- Food diary integration with symptom tracking

#### 🗺️ **Enhanced Body Heatmaps** (Partial Implementation)

**Current**: Basic body region selection implemented

**Planned**:
- Temporal progression animations (pain migration over days/weeks)
- Intensity gradients (visual representation of pain severity)
- 3D body model with rotation
- Comparison view (good day vs flare day)
- Export to share with healthcare providers

---

## 📊 Feature Comparison: Fibromyalgia-Specific Tools

| Feature | Pain Tracker | Generic Pain Apps | Notes |
|---------|--------------|-------------------|-------|
| **WPI Region Tracking** | ✅ Full 18-region implementation | ❌ Not available | Scoring support (not a diagnosis) |
| **SSS Assessment** | ✅ 0-12 scale, 4 domains | ❌ Generic severity only | Severity tracking support |
| **Fibro Fog Tracking** | ✅ Dedicated cognitive metrics | 🟡 Generic "concentration" | Fibromyalgia-specific symptom |
| **Flare Prediction** | 🟡 Basic pattern detection | ❌ Not available | ML enhancement planned |
| **Pacing Tools** | ✅ Activity budgeting, rest tracking | 🟡 Basic activity log | Energy envelope management |
| **Trigger Correlation** | ✅ Weather, stress, sleep, activity | 🟡 Manual note-taking | Automated analysis |
| **Trauma-Informed UI** | ✅ Comprehensive system | ❌ Standard medical UI | Addresses chronic illness trauma |
| **Offline Functionality** | ✅ Core tracking works offline | 🟡 Limited offline | Helpful during flares |
| **Privacy (Local-First)** | ✅ Local-first by default | ❌ Cloud-required sync | Addresses stigma concerns |
| **WorkSafeBC Exports** | ✅ Export/report utilities | ❌ Manual reporting | Workflow-oriented templates |

---

## 🧪 Implementation Evidence

### Code References

**Fibromyalgia Types & Constants**:
- `src/types/fibromyalgia.ts` - Complete type definitions
- `src/utils/constants.ts` - Pain locations and symptom types

**UI Components**:
- `src/components/fibromyalgia/FibromyalgiaTracker.tsx` - Dedicated fibro tracker interface
- `src/components/accessibility/TraumaInformedProvider.tsx` - Trauma-informed design system

**Analytics & Intelligence**:
- `src/services/EmpathyIntelligenceEngine.ts` - Pattern recognition heuristics
- `src/utils/pain-tracker/pattern-engine.ts` - Trend detection algorithms
- `src/utils/pain-tracker/trending.ts` - Time-series analysis

**Export & Compliance**:
- `src/utils/pain-tracker/export.ts` - Export functionality
- `src/components/pain-tracker/WCBReportPreview.tsx` - WorkSafe BC integration
- `src/services/HIPAACompliance.ts` - Privacy compliance

**Security Architecture**:
- `src/services/SecurityService.ts` - Multi-layer security
- `src/services/EncryptionService.ts` - Data encryption

---

## 🎯 User Journey: Fibromyalgia Tracking

### Daily Tracking Workflow

1. **Open App** (offline, no login required)
2. **Select WPI Regions**: Tap all areas with pain in past week
3. **Rate SSS Symptoms**: Fatigue, sleep, cognition, somatic (0-3 each)
4. **Document Triggers**: Weather, stress, activity level
5. **Log Interventions**: Medications, therapies, self-care
6. **Rate Impact**: Sleep, mood, anxiety, function (0-5 scales)
7. **Save Entry**: Auto-encrypted, stored locally with timestamp

### Analytics Review Workflow

1. **View Trends**: Pain patterns over weeks/months
2. **Identify Triggers**: Common flare precipitants highlighted
3. **Assess Progress**: WPI/SSS trends improving/worsening
4. **Effective Interventions**: Correlation analysis shows what helps
5. **Flare Prediction**: Pattern engine alerts to potential upcoming flares

### Clinical Export Workflow

1. **Generate Report**: Select date range for medical appointment
2. **Choose Format**: CSV (claims), JSON (digital), PDF (printable)
3. **Review Summary**: WPI averages, SSS trends, symptom highlights
4. **Export Data**: Save to device, email to provider, print
5. **WorkSafeBC-Oriented Reports**: Export/report templates for claims/report workflows

---

## 🌟 What Makes This Fibromyalgia Support Unique

### 1. **Clinical Usefulness**
- Implements WPI/SSS scoring and threshold helpers to support consistent tracking
- Designed for sharing summaries with clinicians (not a diagnostic tool)

### 2. **Emotional Intelligence**
- Recognizes fibromyalgia as a **biopsychosocial condition**
- Tracks cognitive and emotional dimensions, not just physical pain
- Validates patient experience through empathy-driven analytics

### 3. **Practical Privacy**
- No "sync to see your data" gatekeeping
- No corporate access to intimate health information
- No insurance or employer concerns about tracked data

### 4. **Accessibility First**
- Designed for **fibro fog**: simplified modes, progressive disclosure
- Designed for **pain flares**: touch-friendly, high contrast options
- Designed for **fatigue**: quick entry modes, saved templates

### 5. **Regulatory Awareness**
- **WorkSafeBC-oriented exports**: Designed to support Canadian workplace injury reporting workflows
- Accessibility is built toward a WCAG 2.2 AA target
- Privacy/security controls are HIPAA-aligned in intent (not a compliance claim)

---

## 📚 Educational Resources Integration

### Fibromyalgia Knowledge Base (Planned)

**Categories** (`src/types/fibromyalgia.ts` - `FibromyalgiaEducation` interface):
- **Diagnosis**: Understanding common criteria and clinical workflows
- **Symptoms**: Comprehensive symptom education, validation
- **Management**: Pacing strategies, energy envelope theory
- **Research**: Latest clinical trials, treatment developments
- **Support**: Community tips, coping strategies

**Delivery**:
- Contextual education during tracking (non-intrusive)
- Resource library for on-demand learning
- Evidence-based content with source citations

---

## 🤝 Community & Support Features

### Validation & Shared Experiences (Planned)

**Community Tips** (`src/components/fibromyalgia/FibromyalgiaTracker.tsx` - Community Support tab):
- Peer-validated pacing strategies
- Weather sensitivity management
- Boom-bust cycle avoidance
- Baseline activity level finding

**Privacy-Preserving**:
- No user accounts or forums (privacy risk)
- Curated tips from fibromyalgia community
- Anonymous contribution system (future)

---

## 🔬 Technical Architecture

### Fibromyalgia Data Model

```typescript
// Complete fibromyalgia entry structure
interface FibromyalgiaEntry {
  id: number;
  timestamp: string;
  userId?: string;
  
  // WPI/SSS Components
  wpi: { /* 18 body regions */ };
  sss: { /* 4 symptom domains, 0-3 each */ };
  
  // Extended Fibromyalgia Symptoms
  symptoms: {
    // Comorbidities
    headache, migraine, ibs, tmj, rls,
    // Sensitivities
    light, sound, temperature, chemical,
    // Allodynia
    clothingSensitivity, touchSensitivity,
    // Cognitive
    brainfog, memoryProblems, concentrationDifficulty
  };
  
  // Triggers & Context
  triggers: { weather, stress, sleep, activity, food, hormonal };
  
  // Quality of Life
  impact: { sleepQuality, moodRating, anxietyLevel, functionalAbility };
  
  // Activity & Pacing
  activity: { activityLevel, restPeriods, overexerted, paybackPeriod };
  
  // Interventions
  interventions: { medications, therapies, self-care };
  
  notes?: string;
}
```

### Analytics Processing Pipeline

```
Fibromyalgia Entry (User Input)
  ↓
WPI/SSS Calculation (Implemented thresholds)
  ↓
Pattern Engine (Trend Detection)
  ↓
Empathy Intelligence (Emotional Context)
  ↓
Analytics Store (Insights Generation)
  ↓
Visualization Layer (Charts, Heatmaps)
  ↓
Export Pipeline (Clinical reports, WCB-oriented exports)
```

---

## 📈 Validation & Testing

### Quality Assurance

**Test Coverage**:
- Pattern engine: Comprehensive test suite (`src/utils/pain-tracker/pattern-engine.test.ts`)
- Trending algorithms: Multiple test scenarios
- Export functionality: Validated output formats
- Security: Automated scanning

**Accessibility Testing**:
- Automated: Axe-core Playwright integration
- Manual: Screen reader compatibility
- User Testing: Fibromyalgia community feedback (ongoing)

---

## 💡 Getting Started with Fibromyalgia Tracking

### Quick Start Guide

1. **Install Pain Tracker**: Visit [deployment URL] or run locally
2. **Navigate to Fibromyalgia Hub**: Dedicated fibro interface
3. **Complete First Entry**: 
   - Select painful body regions (WPI)
   - Rate symptom severity (SSS)
   - Log triggers and interventions
4. **Review Thresholds**: See whether the entry meets the implemented WPI/SSS thresholds
5. **Track Consistently**: Daily or per-flare tracking recommended
6. **Analyze Patterns**: Review insights after 2+ weeks of data
7. **Export for Providers**: Generate clinical reports for appointments

### Best Practices

- **Track Baseline**: Log symptoms on "good days" to establish baseline
- **Consistent Timing**: Track at same time daily for trend accuracy
- **Trigger Awareness**: Always log suspected triggers, even if uncertain
- **Intervention Logging**: Record all treatments to identify what helps
- **Regular Review**: Check analytics weekly to spot emerging patterns

---

## 🎓 For Healthcare Providers

### Clinical Integration

**Pain Tracker provides**:
- WPI/SSS-style scoring and threshold helpers (not a diagnosis)
- Longitudinal symptom data for treatment evaluation
- Trigger identification for patient education
- Intervention effectiveness tracking
- Exportable reports for EMR documentation

**Use Cases**:
- Initial diagnostic assessment (WPI/SSS tracking)
- Treatment response monitoring
- Medication titration guidance
- Referral documentation
- Disability claim evidence

**Data Export Formats**:
- CSV: Spreadsheet import for analysis
- JSON: EMR integration (FHIR-aligned structure)
- PDF: Printable patient summaries

---

## 📞 Support & Resources

### For Users
- **Documentation**: This guide + README.md
- **GitHub Issues**: Bug reports, feature requests
- **Security**: See SECURITY.md for vulnerability reporting

### For Developers
- **Contributing**: See CONTRIBUTING.md
- **Architecture**: See ARCHITECTURE_DEEP_DIVE.md
- **API Docs**: Inline TypeScript documentation

---

## 📜 Disclaimer

**Medical Device Status**: Pain Tracker is a wellness and tracking tool, not a medical device. It does not diagnose, treat, or prevent any disease.

**Clinical Use**: Pain Tracker is a tracking and scoring aid; it does not replace professional medical evaluation or establish a diagnosis.

**Data Privacy**: Data is stored locally by default and shared only via user-controlled exports. Some optional features may make network requests when enabled/configured.

---

## 🙏 Acknowledgments

- **ACR (American College of Rheumatology)**: For evidence-based diagnostic criteria
- **Fibromyalgia Community**: For insights, validation, and feature requests
- **Healthcare Professionals**: For clinical guidance and feedback
- **Privacy Advocates**: For security best practices and threat modeling

---

**Version**: 1.1.3  
**Last Updated**: January 17, 2026  
**Status**: Feature documentation (implementation-based; claims are conservative)

**Built with ❤️ for the fibromyalgia community**
