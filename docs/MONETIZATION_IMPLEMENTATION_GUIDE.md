# 💰 Monetization Implementation Guide

**Version:** 1.0  
**Last Updated:** 2025-11-12  
**Status:** Planning Phase  
**Target Launch:** Q1 2026 (Professional Tier)

---

## 🎯 Overview

This document provides the complete technical implementation guide for Pain Tracker's "Fortress Model" monetization strategy. It covers architecture, code structure, payment integration, security, and rollout procedures.

**Related Documents:**
- `docs/COMPETITIVE_AUDIT_2025-11-12.md` - Strategy and market positioning
- `docs/PRIVACY_POLICY.md` - Legal privacy commitments
- `docs/TERMS_OF_SERVICE.md` - User agreements (to be created)

---

## 📐 Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Pain Tracker Frontend                    │
│                    (React + TypeScript)                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Feature     │  │ Entitlement  │  │   Payment    │      │
│  │   Flags      │→ │   Service    │→ │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         ↓                  ↓                  ↓              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   UI/UX      │  │   Local      │  │   Stripe     │      │
│  │  Components  │  │  Storage     │  │   Webhooks   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
              ┌─────────────────────────┐
              │   Stripe Payment API    │
              │  (PCI-compliant)        │
              └─────────────────────────┘
```

### Data Separation Principle

**CRITICAL:** Health data and payment data MUST remain completely separate.

- **Health Data:** IndexedDB (encrypted, local-first)
- **Payment Data:** Stripe (hosted, PCI-compliant)
- **Entitlements:** Cached locally, refreshed from Stripe

**Never store payment information in the same database as health data.**

---

## 🚀 Phase 1: Foundation (Q4 2025)

### 1.1 Feature Flag System

**File:** `src/utils/featureFlags.ts`

```typescript
/**
 * Feature flag system for monetization tiers
 * 
 * - true = Free for everyone
 * - 'professional' = Requires Professional Tier
 * - 'clinical' = Requires Clinical Tier
 * - 'enterprise' = Requires Enterprise Tier
 */

export type FeatureTier = true | 'professional' | 'clinical' | 'enterprise';
export type FeatureFlag = keyof typeof FEATURE_FLAGS;

export const FEATURE_FLAGS = {
  // ========================================
  // FREE TIER (Always Enabled)
  // ========================================
  CORE_TRACKING: true,
  PAIN_INTENSITY_SLIDER: true,
  LOCATION_TRACKING: true,
  SYMPTOM_TRACKING: true,
  UNLIMITED_HISTORY: true,
  BASIC_ANALYTICS: true,
  PAIN_TREND_CHARTS: true,
  PATTERN_RECOGNITION: true,
  EMPATHY_INTELLIGENCE: true,
  LOCATION_HEATMAP: true,
  WORKSAFEBC_FORM_6: true,
  WORKSAFEBC_FORM_7: true,
  PDF_EXPORT: true,
  CSV_EXPORT: true,
  OFFLINE_MODE: true,
  TRAUMA_INFORMED_UX: true,
  CRISIS_DETECTION: true,
  DARK_MODE: true,
  ACCESSIBILITY_FEATURES: true,

  // ========================================
  // PROFESSIONAL TIER ($4.99/month)
  // ========================================
  WORKSAFEBC_FORM_8_11: 'professional' as const,
  APPEAL_LETTER_ASSISTANT: 'professional' as const,
  CLAIM_TIMELINE_GENERATOR: 'professional' as const,
  CASE_MANAGER_REPORTS: 'professional' as const,
  RTW_PLANNER: 'professional' as const,
  CLOUD_SYNC: 'professional' as const,
  CUSTOM_EXPORT_TEMPLATES: 'professional' as const,
  ADVANCED_REPORT_SCHEDULING: 'professional' as const,
  PRIORITY_FEATURE_REQUESTS: 'professional' as const,
  EXTENDED_ANALYTICS: 'professional' as const, // 2-year trends

  // ========================================
  // CLINICAL TIER ($19.99/month)
  // ========================================
  MULTI_PATIENT_DASHBOARD: 'clinical' as const,
  FHIR_HL7_EXPORT: 'clinical' as const,
  TREATMENT_OUTCOME_TRACKING: 'clinical' as const,
  CLINICAL_NOTE_TEMPLATES: 'clinical' as const,
  BULK_REPORTING: 'clinical' as const,
  CLINIC_BRANDING: 'clinical' as const,
  PATIENT_PROGRESS_MONITORING: 'clinical' as const,
  COMPLIANCE_DASHBOARD: 'clinical' as const,
  HIPAA_BAAS: 'clinical' as const,
  ENHANCED_AUDIT_TRAILS: 'clinical' as const,
  DEIDENTIFICATION_TOOLS: 'clinical' as const,
  API_ACCESS: 'clinical' as const,
  SSO_SUPPORT: 'clinical' as const,
  TEAM_COLLABORATION: 'clinical' as const,

  // ========================================
  // ENTERPRISE TIER (Custom Pricing)
  // ========================================
  WORKSAFEBC_COMPLIANCE_DASHBOARD: 'enterprise' as const,
  AGGREGATE_DATA_ANALYTICS: 'enterprise' as const,
  PREDICTIVE_RISK_MODELING: 'enterprise' as const,
  RTW_ANALYTICS: 'enterprise' as const,
  COST_IMPACT_ANALYSIS: 'enterprise' as const,
  ENTERPRISE_SSO: 'enterprise' as const,
  CUSTOM_API_INTEGRATION: 'enterprise' as const,
  DATA_WAREHOUSE_EXPORT: 'enterprise' as const,
  MULTI_TENANT_ARCHITECTURE: 'enterprise' as const,
  SLA_GUARANTEES: 'enterprise' as const,
  MASTER_SERVICE_AGREEMENTS: 'enterprise' as const,
  CUSTOM_BAAS: 'enterprise' as const,
  ON_PREMISE_DEPLOYMENT: 'enterprise' as const,
  DEDICATED_ACCOUNT_MANAGER: 'enterprise' as const,
} as const;

export default FEATURE_FLAGS;
```

---

### 1.2 Entitlement Service

**File:** `src/services/EntitlementService.ts`

```typescript
import { secureStorage } from '../lib/storage/secureStorage';
import { FEATURE_FLAGS, FeatureTier, FeatureFlag } from '../utils/featureFlags';

export type UserTier = 'free' | 'professional' | 'clinical' | 'enterprise';

export interface Subscription {
  tier: UserTier;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid';
  stripeSubscriptionId?: string;
  currentPeriodEnd: string; // ISO date
  cancelAtPeriodEnd: boolean;
  trialEndsAt?: string; // ISO date
}

export interface EntitlementCache {
  tier: UserTier;
  subscription: Subscription | null;
  cachedAt: string; // ISO date
  expiresAt: string; // ISO date (24 hours from cached)
}

class EntitlementService {
  private readonly CACHE_KEY = 'entitlement_cache';
  private readonly CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
  
  /**
   * Tier hierarchy for access checks
   * Higher number = higher tier
   */
  private readonly tierHierarchy: Record<UserTier, number> = {
    free: 0,
    professional: 1,
    clinical: 2,
    enterprise: 3,
  };

  /**
   * Check if user has access to a specific feature
   * 
   * @param feature - Feature flag to check
   * @returns true if user has access, false otherwise
   */
  async checkAccess(feature: FeatureFlag): Promise<boolean> {
    const requiredTier = FEATURE_FLAGS[feature];
    
    // Free features are always accessible
    if (requiredTier === true) {
      return true;
    }
    
    const userTier = await this.getUserTier();
    
    // Check if user's tier meets or exceeds required tier
    return this.tierHierarchy[userTier] >= this.tierHierarchy[requiredTier as UserTier];
  }

  /**
   * Get the user's current tier
   * 
   * Checks local cache first, then fetches from Stripe if stale
   */
  async getUserTier(): Promise<UserTier> {
    const cache = await this.getEntitlementCache();
    
    // Return cached tier if still valid
    if (cache && this.isCacheValid(cache)) {
      return cache.tier;
    }
    
    // Refresh from Stripe
    const subscription = await this.fetchSubscriptionFromStripe();
    const tier = this.subscriptionToTier(subscription);
    
    // Update cache
    await this.updateEntitlementCache(tier, subscription);
    
    return tier;
  }

  /**
   * Get full subscription details
   */
  async getSubscription(): Promise<Subscription | null> {
    const cache = await this.getEntitlementCache();
    
    if (cache && this.isCacheValid(cache)) {
      return cache.subscription;
    }
    
    // Refresh from Stripe
    const subscription = await this.fetchSubscriptionFromStripe();
    const tier = this.subscriptionToTier(subscription);
    await this.updateEntitlementCache(tier, subscription);
    
    return subscription;
  }

  /**
   * Force refresh entitlements from Stripe
   * Call this after successful payment or subscription change
   */
  async refreshEntitlements(): Promise<void> {
    const subscription = await this.fetchSubscriptionFromStripe();
    const tier = this.subscriptionToTier(subscription);
    await this.updateEntitlementCache(tier, subscription);
  }

  /**
   * Clear local entitlement cache
   * Use when user logs out or cancels subscription
   */
  async clearCache(): Promise<void> {
    await secureStorage.removeItem(this.CACHE_KEY);
  }

  // ========================================
  // Private Helper Methods
  // ========================================

  private async getEntitlementCache(): Promise<EntitlementCache | null> {
    try {
      const cached = await secureStorage.getItem(this.CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Failed to read entitlement cache:', error);
      return null;
    }
  }

  private isCacheValid(cache: EntitlementCache): boolean {
    const now = new Date();
    const expiresAt = new Date(cache.expiresAt);
    return now < expiresAt;
  }

  private async updateEntitlementCache(
    tier: UserTier,
    subscription: Subscription | null
  ): Promise<void> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.CACHE_DURATION_MS);
    
    const cache: EntitlementCache = {
      tier,
      subscription,
      cachedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };
    
    await secureStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
  }

  /**
   * Fetch subscription from Stripe
   * 
   * In production, this would call your backend API which queries Stripe
   * For MVP, we'll use a simplified local-first approach
   */
  private async fetchSubscriptionFromStripe(): Promise<Subscription | null> {
    // TODO: Implement Stripe integration
    // For now, return free tier
    return null;
  }

  /**
   * Convert Stripe subscription to user tier
   */
  private subscriptionToTier(subscription: Subscription | null): UserTier {
    if (!subscription) {
      return 'free';
    }
    
    if (subscription.status !== 'active' && subscription.status !== 'trialing') {
      return 'free';
    }
    
    return subscription.tier;
  }
}

// Singleton instance
export const entitlementService = new EntitlementService();
export default entitlementService;
```

---

### 1.3 Feature Gate React Hook

**File:** `src/hooks/useFeatureAccess.ts`

```typescript
import { useState, useEffect } from 'react';
import { entitlementService, UserTier } from '../services/EntitlementService';
import { FeatureFlag } from '../utils/featureFlags';

export interface FeatureAccessResult {
  hasAccess: boolean;
  isLoading: boolean;
  userTier: UserTier | null;
  requiresUpgrade: boolean;
  requiredTier?: UserTier;
}

/**
 * React hook to check if user has access to a feature
 * 
 * Usage:
 * ```tsx
 * const { hasAccess, requiresUpgrade, requiredTier } = useFeatureAccess('WORKSAFEBC_FORM_8_11');
 * 
 * if (!hasAccess) {
 *   return <UpgradePrompt requiredTier={requiredTier} />;
 * }
 * 
 * return <Form811Component />;
 * ```
 */
export function useFeatureAccess(feature: FeatureFlag): FeatureAccessResult {
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userTier, setUserTier] = useState<UserTier | null>(null);

  useEffect(() => {
    let mounted = true;

    async function checkAccess() {
      try {
        const [access, tier] = await Promise.all([
          entitlementService.checkAccess(feature),
          entitlementService.getUserTier(),
        ]);

        if (mounted) {
          setHasAccess(access);
          setUserTier(tier);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to check feature access:', error);
        if (mounted) {
          setHasAccess(false);
          setIsLoading(false);
        }
      }
    }

    checkAccess();

    return () => {
      mounted = false;
    };
  }, [feature]);

  const requiresUpgrade = !hasAccess && !isLoading;
  const requiredTier = requiresUpgrade ? entitlementService.getRequiredTier(feature) : undefined;

  return {
    hasAccess,
    isLoading,
    userTier,
    requiresUpgrade,
    requiredTier,
  };
}

/**
 * Hook to get user's current subscription details
 */
export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    async function fetchSubscription() {
      try {
        const sub = await entitlementService.getSubscription();
        if (mounted) {
          setSubscription(sub);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to fetch subscription:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    fetchSubscription();

    return () => {
      mounted = false;
    };
  }, []);

  return { subscription, isLoading };
}
```

---

### 1.4 Upgrade Prompt Component

**File:** `src/components/monetization/UpgradePrompt.tsx`

```typescript
import React from 'react';
import { UserTier } from '../../services/EntitlementService';

export interface UpgradePromptProps {
  /** Required tier to access the feature */
  requiredTier: UserTier;
  
  /** Feature being gated */
  featureName: string;
  
  /** Custom message (optional) */
  message?: string;
  
  /** Trigger context for analytics */
  trigger?: string;
  
  /** Tone of the prompt */
  tone?: 'gentle' | 'professional' | 'clinical';
  
  /** Can user dismiss? */
  dismissible?: boolean;
  
  /** Callback when dismissed */
  onDismiss?: () => void;
}

const TIER_NAMES: Record<UserTier, string> = {
  free: 'Free',
  professional: 'Professional',
  clinical: 'Clinical',
  enterprise: 'Enterprise',
};

const TIER_PRICES: Record<UserTier, string> = {
  free: 'Free',
  professional: '$4.99/month',
  clinical: '$19.99/month',
  enterprise: 'Custom Pricing',
};

export function UpgradePrompt({
  requiredTier,
  featureName,
  message,
  trigger,
  tone = 'gentle',
  dismissible = true,
  onDismiss,
}: UpgradePromptProps) {
  const defaultMessages = {
    gentle: `Hi there! The "${featureName}" feature is available in our ${TIER_NAMES[requiredTier]} Tier. Would you like to learn more?`,
    professional: `"${featureName}" requires a ${TIER_NAMES[requiredTier]} Tier subscription (${TIER_PRICES[requiredTier]}).`,
    clinical: `This feature is available in the ${TIER_NAMES[requiredTier]} Tier at ${TIER_PRICES[requiredTier]}.`,
  };

  const displayMessage = message || defaultMessages[tone];

  return (
    <div
      className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-blue-600 dark:text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <div className="flex-1">
          <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
            Upgrade to {TIER_NAMES[requiredTier]} Tier
          </h3>
          <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
            {displayMessage}
          </p>

          <div className="mt-3 flex gap-3">
            <button
              type="button"
              className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600"
              onClick={() => {
                // TODO: Navigate to upgrade page
                console.log('[Upgrade] Feature:', featureName, 'Tier:', requiredTier, 'Trigger:', trigger);
              }}
            >
              Learn More
            </button>

            {dismissible && (
              <button
                type="button"
                className="rounded px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:text-blue-300 dark:hover:bg-blue-900"
                onClick={onDismiss}
              >
                Maybe Later
              </button>
            )}
          </div>
        </div>

        {dismissible && (
          <button
            type="button"
            className="flex-shrink-0 text-blue-400 hover:text-blue-500 dark:text-blue-500 dark:hover:text-blue-400"
            onClick={onDismiss}
            aria-label="Dismiss"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
```

---

### 1.5 Feature Gate Component

**File:** `src/components/monetization/FeatureGate.tsx`

```typescript
import React from 'react';
import { FeatureFlag } from '../../utils/featureFlags';
import { useFeatureAccess } from '../../hooks/useFeatureAccess';
import { UpgradePrompt } from './UpgradePrompt';

export interface FeatureGateProps {
  /** Feature to gate */
  feature: FeatureFlag;
  
  /** Children to render if access granted */
  children: React.ReactNode;
  
  /** Fallback to render if access denied (optional) */
  fallback?: React.ReactNode;
  
  /** Feature name for upgrade prompt */
  featureName?: string;
  
  /** Custom upgrade message */
  upgradeMessage?: string;
  
  /** Trigger context for analytics */
  trigger?: string;
}

/**
 * Component that gates access to features based on user tier
 * 
 * Usage:
 * ```tsx
 * <FeatureGate
 *   feature="WORKSAFEBC_FORM_8_11"
 *   featureName="WorkSafeBC Form 8/11 Generator"
 *   trigger="wcb-export-page"
 * >
 *   <Form811Generator />
 * </FeatureGate>
 * ```
 */
export function FeatureGate({
  feature,
  children,
  fallback,
  featureName,
  upgradeMessage,
  trigger,
}: FeatureGateProps) {
  const { hasAccess, isLoading, requiresUpgrade, requiredTier } = useFeatureAccess(feature);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        <span className="sr-only">Checking access...</span>
      </div>
    );
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (requiresUpgrade && requiredTier) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <UpgradePrompt
        requiredTier={requiredTier}
        featureName={featureName || feature}
        message={upgradeMessage}
        trigger={trigger}
      />
    );
  }

  // Should never reach here, but failsafe to free content
  return <>{children}</>;
}
```

---

## 🔐 Security Considerations

### Data Separation

**Health Data Storage:**
- Location: IndexedDB (encrypted)
- Encryption: AES-256-GCM
- Access: Local-only, no network

**Payment Data Storage:**
- Location: Stripe (PCI-compliant)
- Encryption: Stripe-managed
- Access: API-only, tokenized

**Entitlement Storage:**
- Location: localStorage (non-sensitive)
- Content: Tier level, subscription status (no payment info)
- Refresh: Every 24 hours from Stripe

### Privacy Guarantees

1. **Never mix databases:** Health data MUST NOT be in same database as payment data
2. **Minimal payment data:** Only store `customerId` and `subscriptionId` (tokens)
3. **Audit trails:** Log all tier changes, feature access denials (for debugging)

---

## 📊 Analytics & Metrics

### Key Metrics to Track

**Conversion Funnel:**
1. Free users (total)
2. Trial starts (Professional, Clinical)
3. Trial → Paid conversions
4. Churn rate (monthly)
5. LTV (Lifetime Value)

**Feature Usage:**
- Which paid features drive most upgrades?
- Which free features are most popular?
- Where do users hit upgrade prompts?

**Behavioral Cohorts:**
- WorkSafeBC claimants vs general users
- Clinicians vs patients
- Enterprise inquiries

---

## ✅ Phase 1 Checklist

- [ ] Implement feature flag system (`src/utils/featureFlags.ts`)
- [ ] Build entitlement service (`src/services/EntitlementService.ts`)
- [ ] Create React hooks (`src/hooks/useFeatureAccess.ts`)
- [ ] Design upgrade prompt component (`src/components/monetization/UpgradePrompt.tsx`)
- [ ] Build feature gate component (`src/components/monetization/FeatureGate.tsx`)
- [ ] Add settings page section for subscription management
- [ ] Create waitlist landing pages (external website)
- [ ] Legal review: Terms of Service, Privacy Policy updates
- [ ] Set up Stripe account (test mode)
- [ ] Design pricing page (external marketing site)

---

## 🚀 Next Steps

See `docs/COMPETITIVE_AUDIT_2025-11-12.md` for full rollout roadmap (Phases 2-5).

**Immediate Actions:**
1. Legal review of monetization strategy
2. Create waitlist landing pages
3. Set up Stripe test environment
4. Build Phase 1 infrastructure (above)

---

**Document Version:** 1.0  
**Last Updated:** 2025-11-12  
**Next Review:** Q1 2026 (pre-launch)
