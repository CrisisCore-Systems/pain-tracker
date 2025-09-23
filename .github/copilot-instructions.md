# Pain Tracker - Copilot Instructions

This is a **security-first, offline-first chronic pain tracking application** built with empathy-driven design principles for clinical integration and WorkSafe BC compliance.

## Architecture & Tech Stack

**Frontend**: React 18 + TypeScript in strict mode, Vite build system, Zustand for state management
**Styling**: Tailwind CSS with design system components in `src/design-system/`
**Data**: Local-first with IndexedDB, no cloud dependencies for privacy
**Testing**: Vitest with jsdom, focused coverage on core logic (50%+ threshold)
**Security**: CSP headers, secret scanning, SAST pipelines, enterprise hardening

## Critical Development Patterns

### Empathy Intelligence Engine - Core Architecture (IMPLEMENTED)
This application includes a sophisticated empathy analytics system:

```typescript
// The empathy engine calculates comprehensive empathy metrics from user input
import { EmpathyIntelligenceEngine } from '../services/EmpathyIntelligenceEngine';
const engine = new EmpathyIntelligenceEngine(config);
const metrics = await engine.calculateAdvancedEmpathyMetrics(userId, painEntries, moodEntries);

// Provides insights and recommendations based on heuristic analysis
const insights = await engine.generateAdvancedInsights(userId, metrics, context);
```

**Actually implemented patterns:**
- Heuristic-based algorithms analyze text for empathy indicators
- Wisdom tracking accumulates user insights over time
- Baseline empathy metrics with configurable intelligence engine
- Text analysis for emotional and empathy patterns

### Trauma-Informed Design System (IMPLEMENTED)
Every UI component follows trauma-informed design principles:

```typescript
// Components use trauma-informed accessibility patterns
import { useTraumaInformed } from '../components/accessibility/TraumaInformedHooks';
const { preferences } = useTraumaInformed();

// Conditional rendering based on user needs
{preferences.gentleLanguage && <ComfortPrompt />}
{preferences.simplifiedMode && <ProgressiveDisclosure />}

// Touch-optimized buttons for accessibility
<TouchOptimizedButton variant="primary" size={preferences.touchTargetSize}>
```

**Actually implemented accessibility patterns:**
- `TraumaInformedProvider` context system for preferences
- `AccessibilitySettings` component for user customization
- `CrisisStateAdaptation` for emergency state handling
- `CrisisTestingDashboard` for simulation and testing
- Progressive disclosure components to reduce cognitive load
- Voice input support for motor disabilities
- Auto-save functionality to prevent data loss anxiety

**Planned but not implemented:**
- Advanced crisis detection algorithms
- Real-time emotional monitoring
- Micro-empathy moment tracking

### State Management with Zustand + Empathy Integration
- Single store at `src/stores/pain-tracker-store.ts` with Immer middleware for immutable updates
- UI state separated from data state (`ui` property for form sections, modals, reports)
- Always use store actions, never mutate state directly
- Example: `usePainTrackerStore((state) => state.addEntry)` for typed access

### Validation Technology Integration (DOCUMENTED BUT NOT INTEGRATED)
Complex multi-layered validation system exists as standalone components:

```typescript
// Centralized exports from validation-technology
import { 
  EmotionalValidation, 
  ValidationTechnologyIntegration,
  HolisticProgressTracker,
  UserControlPanel 
} from '../validation-technology';

// Real-time emotional validation
<EmotionalValidation 
  text={userInput} 
  onValidationGenerated={handleValidation} 
  isActive={preferences.realTimeValidation} 
/>

// Integration service coordinates multiple systems
const { validationIntegration } = useValidationTechnology();
await validationIntegration.processUserInput(data);
```

**Implementation status:**
- Validation technology components are implemented in `src/validation-technology/`
- Documentation exists in `docs/VALIDATION_TECHNOLOGY_COMPLETE.md`
- NOT YET INTEGRATED into main pain tracking forms
- Components are isolated and not connected to main application flow
- Requires integration work to connect to existing forms and workflows

### Security Architecture - Multi-Layer Protection
Three-tier security model:

1. **Encryption Service** (`src/services/EncryptionService.ts`)
   - CryptoJS with AES-256 encryption
   - Master key storage with localStorage encryption
   - Never store keys in plain text

2. **HIPAA Compliance Service** (`src/services/HIPAACompliance.ts`)
   - Audit trails with risk scoring (0-100)
   - PHI detection and de-identification
   - Breach assessment and reporting
   - Access request management

3. **Security Service** (`src/services/SecurityService.ts`)
   - Security event logging and monitoring
   - CSP header generation (dev vs prod variants)
   - Automated security auditing with scoring

**Critical security patterns:**
```typescript
// All sensitive data must be encrypted before storage
await securityService.encryptAndStore(key, sensitiveData);

// Audit all data access with context
await hipaaService.logAuditEvent({
  actionType: 'read',
  resourceType: 'PainEntry',
  userId: currentUser.id,
  outcome: 'success'
});

// Never expose encryption keys in development
if (process.env.NODE_ENV !== 'production') {
  // Development only patterns
}
```

## Development Workflow Commands

**Essential commands** (use Makefile for consistency):
```bash
make dev          # Start development server (port 3000)
make check        # Run typecheck + lint + test + build  
make test         # Vitest with coverage focused on core logic
make lint-fix     # Auto-fix ESLint issues
make build        # Production build with CSP security headers
make doctor       # Environment diagnostics and health check
```

**Security workflow**:
```bash
make check-security    # Scan for secrets and security vectors
npm run security-full  # Complete security audit
npm run sbom          # Generate software bill of materials
npm run doctor        # Full environment validation
```

**Debugging and diagnostics**:
```bash
npm run doctor        # Comprehensive environment check
npm run healthcheck   # Application health validation
npm run validate-docs # Documentation drift detection
```

**Badge generation** (auto-updated on main branch):
```bash
npm run badge:all     # Regenerate all dynamic badges
```

## Testing Strategy

**Core focus areas:**
- `EmpathyIntelligenceEngine` - Complex heuristic algorithms
- `EncryptionService` - Security-critical encryption/decryption
- `HIPAACompliance` - Audit trail and compliance logic
- Analytics utilities in `src/utils/pain-tracker/`

**Test setup** (`src/test/setup.ts`):
- Canvas mocking for chart libraries (node-canvas integration)
- localStorage polyfill with encryption key seeding
- Global crypto setup for consistent test encryption
- Trauma-informed preference defaults

**Testing patterns:**
```typescript
// Empathy engine tests focus on heuristic accuracy
const metrics = await empathyEngine.calculateAdvancedEmpathyMetrics('user1', [], moodEntries);
expect(metrics.empathyIntelligence.empathyIQ).toBeGreaterThan(baseline);

// Security tests validate encryption round-trips
const encrypted = await encryptionService.encrypt(sensitiveData);
const decrypted = await encryptionService.decrypt(encrypted);
expect(decrypted).toEqual(sensitiveData);
```

## Data Flow & Complex Integrations

### Pain Entry Lifecycle with Empathy Analysis
1. **Input Processing**: Form data → Zod validation → Emotional analysis
2. **Storage Pipeline**: Zustand store → Encryption → IndexedDB persistence  
3. **Analytics Engine**: Background workers compute empathy metrics
4. **Validation Loop**: Real-time emotional validation provides feedback
5. **Export Generation**: WCB reports, clinical summaries, FHIR bundles

### Empathy Intelligence Data Flow
```typescript
// Complex multi-service coordination
const emotionalState = await emotionalAnalysis.analyzeText(userInput);
const empathyMetrics = await empathyEngine.calculateQuantifiedEmpathy(userId, painEntries, moodEntries);
const insights = await empathyEngine.generateAdvancedInsights(userId, empathyMetrics, context);
const recommendations = await empathyEngine.generatePersonalizedRecommendations(userId, empathyMetrics, insights);

// Real-time monitoring and intervention
const microMoments = await realTimeEmpathyMonitor.trackMicroEmpathyMoment();
```

### Key Service Boundaries
- **Authentication**: Local-only, no external auth providers
- **Analytics**: `src/services/EmpathyDrivenAnalytics.ts` orchestrates multiple AI engines
- **Export**: WCB submission service handles government compliance
- **Workers**: Background processing in `src/workers/health-insights-worker.ts`
- **Compliance**: Continuous HIPAA monitoring and audit trail generation

## Project-Specific Conventions

### Complex Import Patterns
```typescript
// Validation technology (centralized barrel exports)
import { 
  EmotionalValidation, 
  ValidationTechnologyIntegration,
  HolisticProgressTracker 
} from '../validation-technology';

// Empathy intelligence (singleton instances)
import { 
  empathyIntelligenceEngine,
  empathyAnalytics,
  realTimeEmpathyMonitor 
} from '../services/EmpathyDrivenAnalytics';

// Trauma-informed accessibility (hook-based)
import { useTraumaInformed } from '../components/accessibility/TraumaInformedHooks';
import { TraumaInformedProvider } from '../components/accessibility/TraumaInformedContext';

// Security services (direct imports for audit trails)
import { securityService } from '../services/SecurityService';
import { hipaaService } from '../services/HIPAACompliance';
```

### File Organization Patterns
- **Services**: Highly specialized with singleton exports (`empathyAnalytics`, `securityService`)
- **Types**: Centralized in `src/types/` with complex quantified empathy interfaces
- **Workers**: Background processing for intensive analytics operations
- **Validation Technology**: Unified export system for multi-component integration

### Security-First Development
```typescript
// All sensitive operations require audit trails
await hipaaService.logAuditEvent({
  actionType: 'update',
  resourceType: 'PainEntry', 
  userId: user.id,
  outcome: 'success',
  details: { painLevel: entry.baselineData.pain }
});

// Environment-specific CSP configuration
const csp = environment === 'production' ? strictProdCSP : devCSP;
headers['Content-Security-Policy'] = csp;

// Storage keys follow strict naming conventions
const encryptedKey = `key:pain-tracker-${keyType}`;
const dataKey = `pain-tracker-${dataType}-${userId}`;
```

### Empathy-Driven Development Philosophy
- **Emotional validation** triggers automatically based on user context
- **Progressive disclosure** reduces cognitive load for trauma survivors
- **User agency** emphasized - users control their experience completely
- **Gentle language** patterns throughout all user-facing text
- **Crisis detection** algorithms monitor for emotional distress

## Implementation snapshot — 2025-09-22

This project contains a mix of fully implemented systems, partially completed integrations, and well-documented planned work. The table below is a concise, evidence-backed snapshot for contributors and automated agents.

- Empathy Intelligence Engine: Implemented — core engine present at `src/services/EmpathyIntelligenceEngine.ts` with unit and integration tests (Vitest). Produces comprehensive empathy metrics, insights and recommendations.
- Trauma-Informed UI & Accessibility: Implemented — context/provider/hooks and several components live under `src/components/accessibility/` including `CrisisTestingDashboard` and preference-driven rendering.
- Validation Technology: Documented but not integrated — components exist in `src/validation-technology/` and detailed docs in `docs/VALIDATION_TECHNOLOGY_COMPLETE.md`; these are not wired into the main pain-entry forms yet.
- Empathy-Driven Analytics Service: Implemented — `src/services/EmpathyDrivenAnalytics.ts` orchestrates the intelligence engine and offers reporting helpers.
- Secure Storage & Encryption Services: Implemented (partial encryption strategy) — secure storage wrappers in `src/lib/storage/` and `src/services/EncryptionService.ts` exist; an IndexedDB encrypted layer at scale is still planned.
- PWA (service worker + manifest): Partial — service worker and manifest present (`public/sw.js`, `public/manifest.json`) and PWA docs exist, but browser integration testing and some TypeScript/React wiring are pending.
- WorkSafe BC export (CSV/JSON): Implemented — CSV/JSON export and sample in `src/features/reports/worksafebc/`; PDF export generator is partially implemented.
- Analytics visualizations: Partial — trend charts implemented; heatmap/advanced visualizations are work-in-progress under `src/features/analytics/`.
- Testing & CI: Core unit tests for key services (empathy engine, analytics helpers) are implemented and included in Vitest runs; full coverage targets and mutation testing are ongoing.

Notes & next steps:
- Integration work: Wire `src/validation-technology/` components into the pain entry forms and onboarding flows.
- PWA verification: Run in-browser manual smoke tests for offline flows and service worker updates; address TypeScript integration items listed in `PWA-COMPLETE.md`.
- Security hardening: Complete AES-GCM storage for IndexedDB and add automated security checks in the CI pipeline for encryption configuration.
- Documentation: Update `docs/FEATURE_MATRIX.md`, `README.md`, and `docs/IMPLEMENTATION_SUMMARY.md` to reflect this snapshot and avoid overstating completed items.


## Build & Deployment

### Advanced Build Configuration
- **CSP Generation**: Dynamic Content Security Policy per environment
- **Bundle Analysis**: Vite plugin generates `meta.json` for size tracking
- **Security Headers**: Full security header suite (HSTS, Permissions Policy, etc.)
- **Badge Pipeline**: Automated metric badge generation for GitHub

### Deployment Validation
```bash
# Comprehensive pre-deployment checks
npm run deploy:validate     # Configuration validation
npm run deploy:healthcheck  # Health endpoint verification  
npm run security-full       # Complete security audit
npm run docs:validate       # Documentation drift detection
```

When modifying core services (especially empathy engine, security, or validation technology), always run comprehensive test suite and security validation before committing. Use `npm run doctor` for environment debugging.