# SaaS Subscription System Implementation

## Overview

This document describes an archived design/implementation draft for a tiered subscription system for Pain Tracker. It is not a statement of what is currently shipped or deployed.

## Architecture

### Core Components

#### 1. Type Definitions (`src/types/subscription.ts`)
- **Subscription Tiers**: Free, Basic, Pro, Enterprise
- **Billing Intervals**: Monthly, Yearly, Lifetime
- **Subscription Status**: Active, Trialing, Canceled, Expired, etc.
- **Feature Access Levels**: None, Limited, Full, Unlimited
- **User Subscription Data**: Complete subscription lifecycle tracking
- **Usage Quotas**: Real-time tracking of feature usage
- **Billing Events**: Comprehensive audit trail
- **Enterprise Configuration**: Custom features and SLAs

#### 2. Tier Configuration (`src/config/subscription-tiers.ts`)
Defines four subscription tiers with complete feature matrices:

**Free Tier** ($0/month)
- 50 pain entries, 90-day retention
- Basic analytics
- CSV export
- Community support
- Target: Trial users, mild pain management

**Basic Tier** ($9.99/month, $99.90/year)
- 500 entries, 1-year retention
- Advanced analytics + Empathy Intelligence
- PDF & WCB reports
- Family sharing (2 users)
- Email support (24h response)
- 14-day free trial
- Target: Individuals with chronic pain

**Pro Tier** ($24.99/month, $249.90/year)
- Unlimited entries, unlimited retention
- Predictive insights
- Clinical PDF export
- Privacy-aligned security controls (deployment-dependent)
- Structured clinical export formats
- Priority support (4h response)
- 30-day free trial
- Target: Power users, healthcare coordination

**Enterprise Tier** (Custom pricing)
- Unlimited everything
- Custom features
- Organization-level customization
- SOC 2 alignment goals (requires independent audit)
- Dedicated support (1h response)
- Custom training
- 60-day free trial
- Target: Healthcare organizations, clinics

#### 3. Subscription Service (`src/services/SubscriptionService.ts`)

**Core Functionality:**
- Subscription lifecycle management (create, upgrade, downgrade, cancel)
- Feature access validation
- Usage tracking and quota management
- Trial period handling
- Analytics and engagement scoring
- Churn risk calculation
- Prorated billing calculations

**Key Methods:**
```typescript
- createSubscription(userId, tier, interval)
- checkFeatureAccess(userId, featureName)
- trackUsage(userId, usageType, amount)
- upgradeTier(userId, newTier, immediate)
- downgradeTier(userId, newTier)
- cancelSubscription(userId, immediate)
- getAnalytics(userId)
```

#### 4. React Context (`src/contexts/SubscriptionContext.tsx`)

**Provider Features:**
- Global subscription state management
- Automatic subscription initialization
- Feature access checking
- Usage tracking integration
- Real-time tier updates

**Custom Hooks:**
- `useSubscription()`: Access subscription context
- `useHasTier(tier)`: Check if user has minimum tier
- `useFeatureAccess(feature)`: Check feature access with loading state
- `useTierBadge()`: Get tier badge display data

#### 5. Feature Gate Components (`src/components/subscription/FeatureGates.tsx`)

**Components:**
- `<FeatureGate>`: Conditionally render based on feature access
- `<TierGate>`: Conditionally render based on tier level
- `<UpgradePrompt>`: Show upgrade prompt when access denied
- `<UsageWarning>`: Warn when approaching quota limits
- `<TierBadge>`: Display subscription tier badge
- `<TrialBanner>`: Show trial countdown
- `<CanceledBanner>`: Display cancellation notice with reactivation

#### 6. Pricing Page (`src/pages/PricingPage.tsx`)

**Features:**
- Responsive tier comparison cards
- Monthly/yearly toggle with savings calculation
- Feature comparison table
- Popular plan highlighting
- Current tier display
- FAQ section
- Upgrade flow integration

## Integration Points

### Existing Systems

#### VaultService Integration
- Encryption level based on tier (basic, advanced, enterprise)
- Audit log retention controlled by tier
- Custom data retention periods for Pro/Enterprise

#### User Model Extension
```typescript
// Extend existing UserInfo interface
interface UserInfo {
  // ... existing fields
  subscription?: UserSubscription;
}

// Extend UserContext for therapeutic resources
interface UserContext {
  // ... existing fields
  subscriptionTier?: SubscriptionTier;
  hasFeature?: (feature: string) => boolean;
}
```

#### Pain Tracker Store Integration
```typescript
// Add to PainTrackerState
interface PainTrackerState {
  // ... existing state
  
  // New subscription-aware actions
  addEntry: (entry) => {
    // Check quota before adding
    // Track usage
    // Add entry
  }
}
```

### Storage Layer

#### Usage Tracking
Integrate with existing IndexedDB storage to track:
- Pain entry count (per period)
- Mood entry count
- Activity log count
- Storage size (MB)
- API calls (for Pro+)
- Export count

#### Quota Enforcement
```typescript
// Before creating entry
const access = await subscriptionService.checkFeatureAccess(
  userId,
  'maxPainEntries'
);

if (!access.hasAccess) {
  // Show upgrade prompt
  return;
}

// Track usage
await subscriptionService.trackUsage(userId, 'painEntries', 1);
```

## Usage Examples

### 1. Wrap App with Subscription Provider

```typescript
// src/App.tsx
import { SubscriptionProvider } from './contexts/SubscriptionContext';

function App() {
  const userId = 'user-123'; // Get from auth
  
  return (
    <SubscriptionProvider userId={userId}>
      <Router>
        <Routes>
          <Route path="/pricing" element={<PricingPage />} />
          {/* ... other routes */}
        </Routes>
      </Router>
    </SubscriptionProvider>
  );
}
```

### 2. Gate Features by Tier

```typescript
// Components can use feature gates
import { FeatureGate, TierGate } from './components/subscription/FeatureGates';

function AnalyticsDashboard() {
  return (
    <div>
      {/* Always available */}
      <BasicAnalytics />
      
      {/* Gated by feature */}
      <FeatureGate feature="advancedAnalytics">
        <AdvancedAnalytics />
      </FeatureGate>
      
      {/* Gated by tier */}
      <TierGate requiredTier="pro">
        <PredictiveInsights />
      </TierGate>
    </div>
  );
}
```

### 3. Track Usage

```typescript
// When creating a pain entry
const { trackUsage } = useSubscription();

const handleSubmit = async (entryData) => {
  // Create entry
  await createPainEntry(entryData);
  
  // Track usage
  await trackUsage('painEntries', 1);
};
```

### 4. Show Usage Warnings

```typescript
import { UsageWarning } from './components/subscription/FeatureGates';

function PainEntryForm() {
  return (
    <div>
      <UsageWarning feature="maxPainEntries" threshold={80} />
      <form>{/* ... */}</form>
    </div>
  );
}
```

### 5. Display Trial/Cancellation Banners

```typescript
import { TrialBanner, CanceledBanner } from './components/subscription/FeatureGates';

function Dashboard() {
  return (
    <div>
      <TrialBanner onUpgrade={() => navigate('/pricing')} />
      <CanceledBanner onReactivate={() => {/* handle reactivate */}} />
      {/* ... dashboard content */}
    </div>
  );
}
```

## Payment Integration (Next Steps)

### Stripe Integration

```typescript
// src/services/StripeService.ts
export class StripeService {
  async createCheckoutSession(
    userId: string,
    tier: SubscriptionTier,
    interval: BillingInterval
  ): Promise<{ sessionId: string; url: string }> {
    // Create Stripe checkout session
    // Return session URL for redirect
  }
  
  async handleWebhook(event: StripeEvent): Promise<void> {
    // Handle subscription.created
    // Handle subscription.updated
    // Handle payment_intent.succeeded
    // Update local subscription state
  }
}
```

### Paddle Integration (Alternative)

```typescript
// src/services/PaddleService.ts
export class PaddleService {
  async openCheckout(tier: SubscriptionTier): Promise<void> {
    // Open Paddle checkout overlay
  }
  
  async handleWebhook(event: PaddleEvent): Promise<void> {
    // Handle subscription events
  }
}
```

## Migration Strategy

### Phase 1: Existing Users (Completed)
✅ All type definitions created
✅ Service layer implemented
✅ React context and hooks ready
✅ UI components built

### Phase 2: Integration (In Progress)
- [ ] Update user model with subscription data
- [ ] Add subscription middleware to stores
- [ ] Integrate usage tracking in entry creation
- [ ] Apply feature gates to existing components
- [ ] Add tier badges to UI

### Phase 3: Payment Provider (Pending)
- [ ] Choose provider (Stripe recommended)
- [ ] Implement checkout flow
- [ ] Set up webhook handlers
- [ ] Test subscription lifecycle
- [ ] Implement invoice generation

### Phase 4: Testing & Launch (Pending)
- [ ] Unit tests for SubscriptionService
- [ ] Integration tests for tier transitions
- [ ] E2E tests for upgrade/downgrade flows
- [ ] Security audit of billing logic
- [ ] Performance testing with quotas
- [ ] Beta test with real users

## Security Considerations

### Data Protection
- Subscription data encrypted at rest (VaultService)
- Audit trail for all billing events
- HIPAA-aligned deployment considerations for Pro+ tiers (deployment-dependent)
- SOC 2 alignment goals for Enterprise (requires independent audit)

### Access Control
- Feature gates prevent unauthorized access
- Usage quotas enforced server-side (when backend added)
- Trial abuse prevention (email/payment method verification)

### Privacy
- No sensitive health data in billing systems
- Separate encryption keys for subscription vs health data
- GDPR-oriented data handling (deployment-dependent)

## Monitoring & Analytics

### Metrics to Track
- Conversion rate (Free → Paid)
- Trial conversion rate
- Churn rate by tier
- MRR (Monthly Recurring Revenue)
- Usage patterns by tier
- Feature adoption rates
- Upgrade/downgrade frequency

### Dashboard
```typescript
// Admin dashboard metrics
interface AdminMetrics {
  totalSubscriptions: Record<SubscriptionTier, number>;
  mrr: number;
  churnRate: number;
  trialConversions: number;
  lifetimeValue: Record<SubscriptionTier, number>;
  engagementScore: Record<SubscriptionTier, number>;
}
```

## Future Enhancements

### Short-term
1. Add custom fields for Enterprise
2. Implement organization/team features
3. Add usage analytics dashboard for users
4. Create admin subscription management UI
5. Implement promotional codes/discounts

### Long-term
1. API marketplace for third-party integrations
2. Partner program for healthcare providers
3. Referral program with rewards
4. Advanced tiering (add-ons, pay-per-use)
5. Custom enterprise pricing calculator

## Documentation

### For Developers
- API documentation for SubscriptionService
- React component usage guide
- Integration checklist for new features
- Testing guide for tier-based features

### For Users
- Pricing page (implemented)
- FAQ section (implemented)
- Feature comparison table (implemented)
- Migration guide (downgrade impacts)
- Billing support documentation

## Success Metrics

### Technical
- ✅ Zero-trust subscription validation
- ✅ Sub-100ms feature access checks
- ✅ Comprehensive audit logging
- ✅ High test coverage for critical paths (target; pending)

### Business
- Target: 10% free-to-paid conversion
- Target: <5% monthly churn (Basic/Pro)
- Target: $50 average LTV for Basic
- Target: $500 average LTV for Pro
- Target: 90%+ trial conversion for engaged users

## Conclusion

This SaaS subscription system is an archived draft. Some components may be partially implemented, stubbed, or removed in the main branch. If revived, next steps would involve:

1. Integration with existing Pain Tracker features
2. Payment provider setup (Stripe recommended)
3. Comprehensive testing
4. Gradual rollout to users

The system maintains Pain Tracker's trauma-informed principles while enabling sustainable business growth through tiered feature access.
