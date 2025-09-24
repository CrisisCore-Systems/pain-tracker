# 🤖 Pain Tracker - AI Agent Instructions

> **Version 2.0** | Last Updated: 2025-09-24 | **Confidence Level**: High

## 🎯 Executive Summary

**What**: A security-first, offline-first chronic pain tracking application built with empathy-driven design for clinical integration and WorkSafe BC compliance.

**Why**: Bridges the gap between patient experience and clinical understanding through secure, accessible pain tracking technology.

**How**: React 18 + TypeScript + Zustand + IndexedDB with multi-layered security and trauma-informed UX.

**Critical**: This is healthcare software - security, privacy, and accessibility are non-negotiable. Always prioritize user safety and data protection.

---

## 🚀 Quick Start for AI Agents

### ⚡ Immediate Action Items
1. **Read this entire document** before making any changes
2. **Run `make doctor`** to validate your environment
3. **Never modify security-critical code** without human review
4. **Always run tests** after changes: `make test`

### 🔍 Decision Framework
```
New Feature/Task?
├── Is it security-related? → STOP, require human review
├── Affects user data? → Audit trail required
├── Changes UI/UX? → Trauma-informed patterns required
├── Modifies core logic? → Comprehensive testing required
└── Everything else → Follow patterns below
```

### 🚨 Red Flags (Stop and Ask Human)
- Any encryption/security modifications
- Changes to empathy algorithms
- HIPAA compliance alterations
- User data handling changes
- Breaking API changes

---

## 🏗️ Architecture & Mental Models

### Core Architectural Principles

**1. Security-First Design**
- **Zero-Trust Model**: All data access requires explicit permission and audit trails
- **Defense in Depth**: Multiple security layers (encryption, validation, CSP, etc.)
- **Privacy by Design**: Local-first architecture, no cloud dependencies

**2. Empathy-Driven Development**
- **User-Centered**: Every decision considers trauma survivors and accessibility needs
- **Progressive Enhancement**: Core functionality works without advanced features
- **Emotional Safety**: Gentle language, crisis detection, user agency

**3. Clinical Integration**
- **Evidence-Based**: Validated pain assessment scales and clinical workflows
- **Regulatory Compliance**: WorkSafe BC, HIPAA-aligned, WCAG 2.1 AA
- **Data Integrity**: Immutable updates, comprehensive validation, audit trails

### Technology Stack Deep Dive

| Layer | Technology | Purpose | Critical Patterns |
|-------|------------|---------|-------------------|
| **UI/UX** | React 18 + TypeScript | Component architecture | Trauma-informed hooks, accessibility-first |
| **State** | Zustand + Immer | Predictable state | Immutable updates, UI/data separation |
| **Data** | IndexedDB + Encryption | Local persistence | AES-GCM encryption, selective storage |
| **Validation** | Zod + Custom Validators | Data integrity | Multi-layer validation, emotional validation |
| **Security** | CryptoJS + CSP | Data protection | Audit trails, key management |
| **Testing** | Vitest + Playwright | Quality assurance | 90%+ coverage, accessibility testing |
| **Build** | Vite + Makefile | Development workflow | Environment-specific builds, security headers |

### Data Flow Architecture

```
User Input
    ↓ (Zod Validation)
PainEntry Object
    ↓ (Emotional Analysis)
Empathy Metrics + Validation
    ↓ (Zustand Store)
Immutable State Update
    ↓ (Encryption Layer)
IndexedDB Persistence
    ↓ (Background Workers)
Analytics Processing
    ↓ (Export Pipeline)
WCB Reports / Clinical Data
```

---

## 🛠️ Development Workflows

### Environment Setup
```bash
# First-time setup (use Makefile for consistency)
make setup          # Complete environment setup
make doctor         # Validate environment health

# Development workflow
make dev           # Start dev server (port 3000)
make test          # Run test suite
make check         # Full validation (lint + test + build)
```

### Code Quality Gates
```bash
# Pre-commit checks (automatic via husky)
make check-pre-commit  # Runs before every commit

# Manual quality checks
make lint-fix         # Auto-fix linting issues
make typecheck        # TypeScript validation
npm run security-full # Security audit
```

### Testing Strategy
```bash
# Unit tests (core logic)
make test                    # Run all tests
npm run test:coverage       # With coverage report

# Integration tests
npm run e2e                 # End-to-end tests
npm run accessibility:scan  # Accessibility validation

# Mutation testing (code quality)
npm run mutate              # Stryker mutation testing
```

### Deployment Pipeline
```bash
# Build variants
make build          # Production build with CSP
make build-dev      # Development build

# Deployment commands
npm run deploy      # GitHub Pages deployment
make deploy-status  # Check deployment status

# Pre-deployment validation
make deploy-validate # Configuration checks
make deploy-healthcheck # Health validation
```

---

## 📋 Implementation Patterns

### State Management (Zustand + Immer)

**✅ DO Pattern:**
```typescript
// Correct: Use actions, never mutate state directly
export const usePainTrackerStore = create<PainTrackerState>()(
  immer((set) => ({
    addEntry: (entryData) => set((state) => {
      state.entries.push({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...entryData
      });
    })
  }))
);

// Usage in components
const addEntry = usePainTrackerStore((state) => state.addEntry);
await addEntry(formData);
```

**❌ AVOID Pattern:**
```typescript
// Wrong: Direct state mutation
const store = usePainTrackerStore.getState();
store.entries.push(newEntry); // NEVER DO THIS
```

### Security Implementation

**Audit Trail Required:**
```typescript
// Always log sensitive operations
await hipaaService.logAuditEvent({
  actionType: 'create' | 'read' | 'update' | 'delete',
  resourceType: 'PainEntry' | 'UserData' | 'Report',
  userId: currentUser.id,
  outcome: 'success' | 'failure',
  details: { /* relevant context */ }
});
```

**Encryption Pattern:**
```typescript
// All sensitive data must be encrypted
const encrypted = await encryptionService.encrypt(sensitiveData);
await secureStorage.save('key', encrypted);

// Retrieval requires decryption
const encrypted = await secureStorage.retrieve('key');
const data = await encryptionService.decrypt(encrypted);
```

### Component Architecture

**Trauma-Informed Components:**
```typescript
// Always use trauma-informed patterns
import { useTraumaInformed } from '../components/accessibility/TraumaInformedHooks';

function MyComponent() {
  const { preferences } = useTraumaInformed();

  return (
    <div>
      {preferences.gentleLanguage && <ComfortPrompt />}
      {preferences.simplifiedMode && <SimplifiedView />}
      <Button size={preferences.touchTargetSize}>
        {preferences.gentleLanguage ? 'Save Gently' : 'Save'}
      </Button>
    </div>
  );
}
```

### Error Handling

**Comprehensive Error Pattern:**
```typescript
try {
  // Operation that might fail
  await sensitiveOperation(data);
} catch (error) {
  // Always update UI state
  setError(error.message);

  // Log security events
  await securityService.logEvent({
    type: 'error',
    level: 'error',
    message: error.message,
    metadata: { operation: 'sensitiveOperation' }
  });

  // Audit trail for data operations
  if (isDataOperation) {
    await hipaaService.logAuditEvent({
      actionType: 'operation',
      resourceType: 'Data',
      outcome: 'failure',
      details: { error: error.message }
    });
  }
}
```

---

## 🔬 Critical Systems Deep Dive

### Empathy Intelligence Engine

**Core Purpose**: Analyzes user input for emotional patterns and provides personalized insights.

**Key Components**:
- `EmpathyIntelligenceEngine.ts` - Main engine with heuristic algorithms
- `EmpathyDrivenAnalytics.ts` - Orchestration service
- `WisdomModule.ts` - Learning and insight accumulation

**Usage Pattern**:
```typescript
const engine = new EmpathyIntelligenceEngine({
  learningRate: 0.1,
  predictionHorizon: 7, // days
  personalizationDepth: 'deep'
});

const metrics = await engine.calculateAdvancedEmpathyMetrics(
  userId,
  painEntries,
  moodEntries
);
```

**⚠️ Critical Notes**:
- Algorithms are heuristic-based, not AI/ML models
- Requires extensive testing when modified
- Performance-critical for user experience

### Trauma-Informed Accessibility System

**Core Components**:
- `TraumaInformedProvider.tsx` - Global preference management
- `CrisisTestingDashboard.tsx` - Emergency simulation
- `ProgressiveDisclosure/` - Cognitive load management

**Implementation Pattern**:
```typescript
// Provider wraps entire app
<TraumaInformedProvider>
  <App />
</TraumaInformedProvider>

// Components use preferences
const { preferences, updatePreferences } = useTraumaInformed();

// Crisis detection
const { crisisState, triggerCrisisMode } = useCrisisDetection();
```

### Validation Technology Integration

**Current Status**: Components exist but not fully integrated.

**Enable Pattern**:
```bash
# Environment variable controls integration
REACT_APP_ENABLE_VALIDATION=true npm run dev
```

**Integration Points**:
- `src/components/pain-tracker/PainEntryForm.tsx` - Conditionally renders validation
- `src/validation-technology/index.ts` - Centralized exports
- `docs/VALIDATION_TECHNOLOGY_COMPLETE.md` - Detailed documentation

### Security Architecture

**Three-Tier Model**:

1. **Encryption Service** (`src/services/EncryptionService.ts`)
   - AES-256 encryption with CryptoJS
   - Key management and rotation
   - Secure localStorage for keys

2. **HIPAA Compliance Service** (`src/services/HIPAACompliance.ts`)
   - Audit trails with risk scoring
   - PHI detection and de-identification
   - Breach assessment and reporting

3. **Security Service** (`src/services/SecurityService.ts`)
   - Event logging and monitoring
   - CSP header generation
   - Automated security auditing

---

## 🚨 Troubleshooting & Gotchas

### Common Issues

**❌ Problem**: Tests failing due to encryption key mismatches
**✅ Solution**: Run `npm run test` with proper setup, ensure `src/test/setup.ts` crypto mocks

**❌ Problem**: Trauma-informed preferences not applying
**✅ Solution**: Ensure `TraumaInformedProvider` wraps component tree

**❌ Problem**: Validation technology not showing
**✅ Solution**: Set `REACT_APP_ENABLE_VALIDATION=true` in environment

**❌ Problem**: Security audit failures
**✅ Solution**: Check `npm run security-full` output, address high-priority issues

### Performance Issues

**Memory Leaks**: Always clean up Zustand subscriptions
```typescript
useEffect(() => {
  const unsubscribe = useStore.subscribe(/* ... */);
  return unsubscribe;
}, []);
```

**Bundle Size**: Monitor with `npm run build` and check `meta.json`

### Development Environment Issues

**Canvas Dependencies (Windows)**: Follow `docs/CANVAS_WINDOWS_PREREQS.md`

**Node Version**: Requires Node 20+, use `.nvmrc`

**Legacy Peer Deps**: Use `--legacy-peer-deps` flag during npm install

---

## 📊 Implementation Status & Roadmap

### Current Implementation Snapshot (2025-09-24)

| System | Status | Confidence | Notes |
|--------|--------|------------|-------|
| **Empathy Intelligence Engine** | ✅ Implemented | High | Core heuristics working, extensive test coverage |
| **Trauma-Informed UI** | ✅ Implemented | High | Comprehensive accessibility system |
| **Validation Technology** | 🟡 Partial | Medium | Components ready, integration pending |
| **Security Architecture** | ✅ Implemented | High | Multi-layer protection active |
| **WorkSafe BC Export** | ✅ Implemented | High | CSV/JSON working, PDF partial |
| **PWA Features** | 🟡 Partial | Low | Service worker present, testing pending |
| **Analytics Visualizations** | 🟡 Partial | Medium | Charts working, advanced viz WIP |

### Recent Changes (2025-09-22 to 2025-09-24)
- ✅ Validation UI integration in forms
- ✅ PDF export test coverage added
- ✅ AES-GCM encrypted IndexedDB helpers
- ✅ Enhanced accessibility testing
- ✅ Design system component expansion

### Next Priority Items
1. **Integration Work**: Connect validation technology to main forms
2. **PWA Completion**: Browser testing and service worker validation
3. **Security Hardening**: Full AES-GCM storage implementation
4. **Testing Expansion**: Reach 90%+ coverage targets

---

## 🔧 Maintenance & Updates

### Version Control
- **Major Version**: Breaking changes to architecture or security model
- **Minor Version**: New features or significant enhancements
- **Patch Version**: Bug fixes, documentation updates, minor improvements

### Change Tracking
```markdown
## Version 2.0 (2025-09-24)
- ✨ Structural reorganization for better AI agent experience
- 📚 Added troubleshooting sections and decision frameworks
- 🎯 Enhanced prescriptive guidance throughout
- 🔍 Added confidence levels and red flags

## Version 1.1 (2025-09-24)
- 📊 Updated implementation snapshot
- 🧪 Added recent development changes
- 📖 Enhanced code examples

## Version 1.0 (2025-09-22)
- 🎯 Initial comprehensive documentation
- 🏗️ Core architecture and patterns documented
```

### Validation Checklist
- [ ] All file paths verified and exist
- [ ] Code examples tested and working
- [ ] Commands validated in environment
- [ ] Security patterns reviewed by human
- [ ] Accessibility guidelines confirmed

---

## 🤝 Working with Human Developers

### When to Ask for Help
- **High Confidence**: Implement and test thoroughly
- **Medium Confidence**: Implement with extra testing, consider asking
- **Low Confidence**: Stop and ask human immediately

### Communication Guidelines
- **Be Specific**: Reference exact files, functions, and line numbers
- **Explain Reasoning**: Show your decision-making process
- **Highlight Risks**: Flag any potential security or UX concerns
- **Provide Options**: When uncertain, present multiple approaches

### Code Review Preparation
- Always run `make check` before presenting changes
- Include test coverage for new code
- Document any security implications
- Explain complex algorithmic changes

---

*This document is maintained by the development team. For questions or suggestions, please create an issue or PR.*