# Feature Gate Integration Guide

## Overview
This guide explains how to apply subscription-based feature gates throughout the Pain Tracker application. All advanced features (analytics, exports, enterprise features) should be gated by subscription tier.

## Quick Start

### 1. Wrap Your App with SubscriptionProvider

```tsx
// src/App.tsx
import { SubscriptionProvider } from './contexts/SubscriptionContext';

function App() {
  return (
    <SubscriptionProvider>
      {/* Your app components */}
    </SubscriptionProvider>
  );
}
```

### 2. Gate UI Components

```tsx
import { FeatureGate, TierGate } from './components/subscription/FeatureGates';

// Feature-based gating
<FeatureGate feature="advancedAnalytics" showUpgradePrompt>
  <AdvancedAnalyticsDashboard />
</FeatureGate>

// Tier-based gating
<TierGate requiredTier="pro" showUpgradePrompt>
  <PredictiveInsights />
</TierGate>
```

### 3. Use Subscription-Aware Entry Creation

```tsx
import { useSubscriptionEntry } from './hooks/useSubscriptionEntry';
import { UsageWarning } from './components/subscription/FeatureGates';

function PainEntryForm({ userId }: { userId: string }) {
  const { addPainEntry, isQuotaExceeded, quotaMessage } = useSubscriptionEntry(userId);

  const handleSubmit = async (data) => {
    try {
      await addPainEntry(data);
      // Success!
    } catch (error) {
      // Show quota exceeded message
      alert(quotaMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Usage warning when approaching limit */}
      <UsageWarning feature="maxPainEntries" threshold={80} />
      
      {isQuotaExceeded && (
        <div className="text-red-600 mb-4">
          {quotaMessage}
        </div>
      )}
      
      {/* Form fields */}
    </form>
  );
}
```

## Component-by-Component Integration

### Analytics Components

#### Advanced Analytics (Basic Tier+)
```tsx
import { GatedAdvancedAnalytics } from './components/analytics/GatedAnalytics';

<GatedAdvancedAnalytics 
  painEntries={entries}
  userId={userId}
/>
```

#### Empathy Intelligence (Basic Tier+)
```tsx
import { GatedEmpathyAnalytics } from './components/analytics/GatedAnalytics';

<GatedEmpathyAnalytics 
  entries={entries}
  userId={userId}
  onCelebrate={(achievement) => console.log('Achievement unlocked:', achievement)}
  onShare={(message) => console.log('Share:', message)}
/>
```

#### Predictive Insights (Pro Tier)
```tsx
import { PredictiveInsightsGate } from './components/analytics/GatedAnalytics';

<PredictiveInsightsGate userId={userId}>
  <YourPredictiveComponent />
</PredictiveInsightsGate>
```

### Export Components

#### CSV/JSON Export (All Tiers)
```tsx
import { GatedSavePanel } from './components/subscription/GatedExport';

<GatedSavePanel 
  entries={entries}
  userId={userId}
  onClearData={handleClearData}
/>
```

#### WCB Reports (Basic Tier+)
```tsx
import { GatedWCBReport } from './components/subscription/GatedExport';

<GatedWCBReport 
  entries={entries}
  userId={userId}
/>
```

#### PDF Reports (Basic Tier+)
```tsx
import { GatedPDFReport } from './components/subscription/GatedExport';

<GatedPDFReport 
  entries={entries}
  userId={userId}
/>
```

#### Clinical PDF Export (Pro Tier)
```tsx
import { GatedClinicalPDFExport } from './components/subscription/GatedExport';

<GatedClinicalPDFExport 
  entries={entries}
  userId={userId}
/>
```

### Form Components

#### Pain Entry Form
```tsx
// Replace this:
const store = usePainTrackerStore();
const handleSubmit = (data) => {
  store.addEntry(data);
};

// With this:
import { useSubscriptionEntry } from './hooks/useSubscriptionEntry';

const { addPainEntry, isQuotaExceeded, quotaMessage } = useSubscriptionEntry(userId);
const handleSubmit = async (data) => {
  try {
    await addPainEntry(data);
    // Success handling
  } catch (error) {
    // Error handling
  }
};
```

#### Mood Entry Form
```tsx
import { useSubscriptionEntry } from './hooks/useSubscriptionEntry';

const { addMoodEntry } = useSubscriptionEntry(userId);
const handleSubmit = async (data) => {
  await addMoodEntry(data);
};
```

#### Activity Log Form
```tsx
import { useSubscriptionEntry } from './hooks/useSubscriptionEntry';

const { addActivityLog } = useSubscriptionEntry(userId);
const handleSubmit = async (data) => {
  await addActivityLog(data);
};
```

## Advanced Patterns

### Conditional Rendering Based on Tier

```tsx
import { useHasTier } from './contexts/SubscriptionContext';

function MyComponent() {
  const hasPro = useHasTier('pro');

  return (
    <div>
      {hasPro ? (
        <AdvancedFeature />
      ) : (
        <BasicFeature />
      )}
    </div>
  );
}
```

### Feature Access Checking

```tsx
import { useFeatureAccess } from './contexts/SubscriptionContext';

function MyComponent() {
  const { hasAccess, isLoading } = useFeatureAccess('advancedAnalytics');

  if (isLoading) return <Loading />;

  if (!hasAccess) {
    return <UpgradePrompt feature="advancedAnalytics" />;
  }

  return <AdvancedAnalyticsDashboard />;
}
```

### Manual Quota Checking

```tsx
import { checkPainEntryQuota } from './stores/subscription-actions';

async function handleAction(userId: string) {
  const quotaCheck = await checkPainEntryQuota(userId);
  
  if (!quotaCheck.allowed) {
    alert(quotaCheck.message);
    return;
  }

  // Perform action
}
```

### Usage Warnings

```tsx
import { UsageWarning } from './components/subscription/FeatureGates';

<UsageWarning 
  feature="maxPainEntries" 
  threshold={80}  // Show warning at 80% usage
/>

<UsageWarning 
  feature="maxExportsPerMonth" 
  threshold={90}
/>
```

### Trial Banners

```tsx
import { TrialBanner } from './components/subscription/FeatureGates';

<TrialBanner />  // Shows countdown when on trial
```

### Canceled Subscription Banners

```tsx
import { CanceledBanner } from './components/subscription/FeatureGates';

<CanceledBanner />  // Shows reactivation option if canceled
```

## Feature-to-Tier Mapping

| Feature Name | Required Tier | Description |
|--------------|---------------|-------------|
| `csvExport` | Free | Basic CSV export |
| `jsonExport` | Basic+ | JSON data export |
| `pdfReports` | Basic+ | PDF report generation |
| `wcbReports` | Basic+ | WorkSafe BC reports |
| `advancedAnalytics` | Basic+ | Advanced analytics dashboards |
| `empathyIntelligence` | Basic+ | Empathy-driven insights |
| `customReports` | Basic+ | Customizable report templates |
| `goalTracking` | Basic+ | Goal setting and tracking |
| `clinicalPDFExport` | Pro | HIPAA-compliant clinical exports |
| `predictiveInsights` | Pro | Machine learning predictions |
| `multiUserCollaboration` | Pro | Family/caregiver sharing |
| `apiAccess` | Pro | REST API access |
| `fhirIntegration` | Pro | FHIR healthcare integration |
| `hipaaCompliance` | Pro | Full HIPAA compliance features |
| `whiteLabel` | Enterprise | Custom branding |
| `sso` | Enterprise | Single sign-on |
| `customIntegrations` | Enterprise | Custom API integrations |
| `dedicatedSupport` | Enterprise | 24/7 priority support |

## Quota Limits by Tier

| Quota | Free | Basic | Pro | Enterprise |
|-------|------|-------|-----|------------|
| Pain Entries | 50 | 500 | Unlimited | Unlimited |
| Mood Entries | 30 | 300 | Unlimited | Unlimited |
| Activity Logs | 30 | 300 | Unlimited | Unlimited |
| Exports/Month | 5 | 25 | 100 | Unlimited |
| Storage (MB) | 10 | 100 | 1000 | Unlimited |
| Data Retention | 90 days | 1 year | 5 years | Unlimited |

## Testing Feature Gates

### Test with Different Tiers

```tsx
// In your tests
import { SubscriptionProvider } from './contexts/SubscriptionContext';

// Test as Free tier
<SubscriptionProvider>
  <YourComponent />
</SubscriptionProvider>

// Mock subscription service to return specific tier
jest.mock('./services/SubscriptionService', () => ({
  getUserSubscription: jest.fn().mockResolvedValue({
    tier: 'pro',
    status: 'active',
    // ... other fields
  })
}));
```

### Verify Quota Enforcement

```tsx
// Test quota exceeded scenario
jest.mock('./stores/subscription-actions', () => ({
  checkPainEntryQuota: jest.fn().mockResolvedValue({
    allowed: false,
    message: 'Quota exceeded',
    usage: { current: 50, limit: 50 }
  })
}));

// Your test
const { addPainEntry } = useSubscriptionEntry('user123');
await expect(addPainEntry(data)).rejects.toThrow('Quota exceeded');
```

## Common Patterns

### 1. Page-Level Gating
Gate entire pages or sections:
```tsx
<TierGate requiredTier="pro" showUpgradePrompt>
  <EntireProFeaturePage />
</TierGate>
```

### 2. Button-Level Gating
Disable buttons for unavailable features:
```tsx
import { useFeatureAccess } from './contexts/SubscriptionContext';

const { hasAccess } = useFeatureAccess('advancedAnalytics');

<button 
  disabled={!hasAccess}
  onClick={handleClick}
>
  Advanced Analytics
</button>
```

### 3. Progressive Disclosure
Show upgrade prompts inline:
```tsx
<FeatureGate feature="predictiveInsights" showUpgradePrompt>
  <PredictiveInsightsChart />
</FeatureGate>
// Shows upgrade prompt when feature is locked
```

## Migration Strategy

### For Existing Deployments

1. **Phase 1: Add Subscription Infrastructure**
   - Deploy SubscriptionProvider at app root
   - Existing features continue working (no gates yet)

2. **Phase 2: Grandfather Existing Users**
   - Assign existing users to "Pro" tier
   - New users start on "Free" tier
   - No disruption to current users

3. **Phase 3: Apply Feature Gates**
   - Gradually wrap components with feature gates
   - Monitor usage metrics
   - Adjust tier boundaries based on data

4. **Phase 4: Enable Payment Processing**
   - Connect Stripe backend
   - Enable upgrade flows
   - Start accepting payments

### For New Deployments

1. Deploy with full subscription system active
2. All users start on Free tier with 14-day Basic trial
3. Feature gates active from day one

## Best Practices

### DO ✅
- Always check quota before creating entries
- Track usage after successful operations (async)
- Show upgrade prompts when features are locked
- Display usage warnings at 80%+ quota
- Provide clear tier benefits in upgrade prompts
- Test with different subscription tiers

### DON'T ❌
- Don't block quota checks (use fire-and-forget for tracking)
- Don't show upgrade prompts for Free tier features
- Don't hard-code tier names (use config)
- Don't skip error handling for quota checks
- Don't forget to add loading states
- Don't gate critical accessibility features

## Troubleshooting

### Feature gate not working
1. Verify SubscriptionProvider wraps your component tree
2. Check that SubscriptionService is returning correct tier
3. Ensure feature name matches config exactly

### Quota not enforcing
1. Check that useSubscriptionEntry is used instead of direct store access
2. Verify SubscriptionService.trackUsage is being called
3. Check userId is correctly passed to hooks

### Upgrade prompt not showing
1. Set `showUpgradePrompt={true}` on FeatureGate
2. Check that user's tier actually lacks the feature
3. Verify UpgradePrompt component is imported

## Next Steps

1. **Apply Gates to Remaining Components**: CustomizableDashboard, GoalManager, etc.
2. **Backend Integration**: Connect Stripe service to actual backend API
3. **Usage Metrics**: Track which features drive upgrades
4. **A/B Testing**: Test different pricing and tier boundaries
5. **Documentation**: Update user-facing docs with tier comparisons

---

*For questions or issues, refer to the main SaaS implementation documentation: `docs/SAAS_IMPLEMENTATION.md`*
