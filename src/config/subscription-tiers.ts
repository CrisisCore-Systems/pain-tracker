/**
 * Subscription tier configuration
 * Defines the specific capabilities, limits, and pricing for each tier
 */

import type {
  SubscriptionPlan,
  TierFeatures,
  PricingInfo,
  SubscriptionTier,
} from '../types/subscription';

/**
 * Free tier features
 * Core tracking stays available without turning the free plan into a trial
 */
const FREE_FEATURES: TierFeatures = {
  // Storage Limits - Unlimited core tracking
  maxPainEntries: -1, // Unlimited
  maxMoodEntries: -1, // Unlimited
  maxActivityLogs: -1, // Unlimited
  maxStorageMB: 100,
  dataRetentionDays: -1, // Unlimited

  // Analytics & Insights
  basicAnalytics: true,
  advancedAnalytics: false,
  predictiveInsights: false,
  customReports: false,
  empathyIntelligence: false,

  // Export Capabilities
  csvExport: true,
  jsonExport: true,
  pdfReports: true,
  wcbReports: true,
  clinicalPDFExport: false,
  scheduledReports: false,
  maxExportsPerMonth: 5,

  // Integration Features
  healthcareProviderAPI: false,
  fhirIntegration: false,
  calendarSync: false,
  wearableDevices: false,

  // Collaboration
  multiUser: false,
  familySharing: false,
  caregiverAccess: false,
  maxSharedUsers: 0,

  // Security & Privacy
  encryption: 'basic',
  twoFactorAuth: false,
  auditLogs: false,
  hipaaCompliance: false,
  soc2Compliance: false,
  customDataRetention: false,

  // Support
  supportLevel: 'community',
  responseTime: '72h',
  onboarding: false,
  customTraining: false,

  // AI & Automation
  aiInsights: false,
  automatedReminders: true,
  smartSuggestions: false,
  patternRecognition: false,

  // Customization
  customThemes: false,
  customDashboard: false,
  customFields: false,
  branding: false,
  whiteLabel: false,

  // Advanced Features
  offlineMode: true,
  mobileApp: true,
  apiAccess: false,
  webhooks: false,
  customIntegrations: false,
};

/**
 * Basic tier features
 * Adds cleaner summaries and easier preparation for appointments and reviews
 */
const BASIC_FEATURES: TierFeatures = {
  // Storage Limits - Unlimited entries, more storage
  maxPainEntries: -1, // Unlimited
  maxMoodEntries: -1, // Unlimited
  maxActivityLogs: -1, // Unlimited
  maxStorageMB: 500,
  dataRetentionDays: -1, // Unlimited

  // Analytics & Insights
  basicAnalytics: true,
  advancedAnalytics: true,
  predictiveInsights: false,
  customReports: true,
  empathyIntelligence: true,

  // Export Capabilities
  csvExport: true,
  jsonExport: true,
  pdfReports: true,
  wcbReports: true,
  clinicalPDFExport: false,
  scheduledReports: true, // Scheduled reports fully shipped and available
  maxExportsPerMonth: 50,

  // Integration Features
  healthcareProviderAPI: false, // Roadmap: read-only dashboard only, no provider API yet
  fhirIntegration: false, // Roadmap: FHIR export service exists but no UI exposure yet
  calendarSync: true,
  wearableDevices: false,

  // Collaboration
  multiUser: false,
  familySharing: false, // Roadmap: local-first architecture deprioritizes cloud sync
  caregiverAccess: false, // Roadmap: not yet implemented
  maxSharedUsers: 0,

  // Security & Privacy
  encryption: 'advanced',
  twoFactorAuth: false, // Roadmap: archived provider-API code; not in local-first app
  auditLogs: false,
  hipaaCompliance: false,
  soc2Compliance: false,
  customDataRetention: false,

  // Support
  supportLevel: 'email',
  responseTime: '24h',
  onboarding: true,
  customTraining: false,

  // AI & Automation
  aiInsights: true,
  automatedReminders: true,
  smartSuggestions: true,
  patternRecognition: true,

  // Customization
  customThemes: true,
  customDashboard: true,
  customFields: true,
  branding: false,
  whiteLabel: false,

  // Advanced Features
  offlineMode: true,
  mobileApp: true,
  apiAccess: false,
  webhooks: false,
  customIntegrations: false,
};

/**
 * Pro tier features
 * Supports heavier documentation and coordination workflows
 */
const PRO_FEATURES: TierFeatures = {
  // Storage Limits
  maxPainEntries: -1, // Unlimited
  maxMoodEntries: -1,
  maxActivityLogs: -1,
  maxStorageMB: 5000, // 5GB
  dataRetentionDays: -1, // Unlimited

  // Analytics & Insights
  basicAnalytics: true,
  advancedAnalytics: true,
  predictiveInsights: true,
  customReports: true,
  empathyIntelligence: true,

  // Export Capabilities
  csvExport: true,
  jsonExport: true,
  pdfReports: true,
  wcbReports: true,
  clinicalPDFExport: true,
  scheduledReports: true,
  maxExportsPerMonth: 200,

  // Integration Features
  healthcareProviderAPI: false, // Roadmap: read-only dashboard only; provider API not yet available
  fhirIntegration: false, // Roadmap: FHIR export available; no provider/clinic portal integration yet
  calendarSync: true,
  wearableDevices: false,

  // Collaboration
  multiUser: false,
  familySharing: false, // Roadmap: local-first design deprioritizes cloud-based sharing
  caregiverAccess: false, // Roadmap: not yet implemented
  maxSharedUsers: 0,

  // Security & Privacy
  encryption: 'advanced',
  twoFactorAuth: false, // Roadmap: archived provider-API code; not in local-first app
  auditLogs: true,
  hipaaCompliance: false, // Privacy-aligned controls; not HIPAA-certified. See PRIVACY.md for architecture details.
  soc2Compliance: false,
  customDataRetention: true,

  // Support
  supportLevel: 'priority',
  responseTime: '4h',
  onboarding: true,
  customTraining: false,

  // AI & Automation
  aiInsights: true,
  automatedReminders: true,
  smartSuggestions: true,
  patternRecognition: true,

  // Customization
  customThemes: true,
  customDashboard: true,
  customFields: true,
  branding: false,
  whiteLabel: false,

  // Advanced Features
  offlineMode: true,
  mobileApp: true,
  apiAccess: true,
  webhooks: true,
  customIntegrations: false,
};

/**
 * Enterprise Tier Features
 * For healthcare organizations, clinics, and large-scale deployments
 */
const ENTERPRISE_FEATURES: TierFeatures = {
  // Storage Limits
  maxPainEntries: -1,
  maxMoodEntries: -1,
  maxActivityLogs: -1,
  maxStorageMB: -1, // Unlimited
  dataRetentionDays: -1,

  // Analytics & Insights
  basicAnalytics: true,
  advancedAnalytics: true,
  predictiveInsights: true,
  customReports: true,
  empathyIntelligence: true,

  // Export Capabilities
  csvExport: true,
  jsonExport: true,
  pdfReports: true,
  wcbReports: true,
  clinicalPDFExport: true,
  scheduledReports: true,
  maxExportsPerMonth: -1,

  // Integration Features
  healthcareProviderAPI: false, // Roadmap: read-only dashboard only; provider API not yet available
  fhirIntegration: false, // Roadmap: FHIR export available; no provider/clinic portal integration yet
  calendarSync: true,
  wearableDevices: false,

  // Collaboration
  multiUser: false,
  familySharing: false, // Roadmap: local-first design deprioritizes cloud-based sharing
  caregiverAccess: false, // Roadmap: not yet implemented
  maxSharedUsers: 0,

  // Security & Privacy
  encryption: 'enterprise',
  twoFactorAuth: false, // Roadmap: archived provider-API code; not in local-first app
  auditLogs: true,
  hipaaCompliance: false, // Privacy-aligned controls; not HIPAA-certified. See PRIVACY.md for architecture details.
  soc2Compliance: false,
  customDataRetention: true,

  // Support
  supportLevel: 'dedicated',
  responseTime: '1h',
  onboarding: true,
  customTraining: true,

  // AI & Automation
  aiInsights: true,
  automatedReminders: true,
  smartSuggestions: true,
  patternRecognition: true,

  // Customization
  customThemes: true,
  customDashboard: true,
  customFields: true,
  branding: true,
  whiteLabel: true,

  // Advanced Features
  offlineMode: true,
  mobileApp: true,
  apiAccess: true,
  webhooks: true,
  customIntegrations: true,
};

/**
 * Pricing Configuration
 */
const FREE_PRICING: PricingInfo = {
  tier: 'free',
  monthly: {
    amount: 0,
    currency: 'USD',
    display: '$0',
  },
  yearly: {
    amount: 0,
    currency: 'USD',
    display: '$0',
    savings: 0,
  },
  trial: {
    enabled: false,
    days: 0,
  },
};

const BASIC_PRICING: PricingInfo = {
  tier: 'basic',
  monthly: {
    amount: 999, // $9.99/month
    currency: 'USD',
    display: '$9.99',
  },
  yearly: {
    amount: 9990, // $99.90/year (2 months free)
    currency: 'USD',
    display: '$99.90',
    savings: 17, // 17% savings
  },
  trial: {
    enabled: true,
    days: 14,
  },
};

const PRO_PRICING: PricingInfo = {
  tier: 'pro',
  monthly: {
    amount: 2499, // $24.99/month
    currency: 'USD',
    display: '$24.99',
  },
  yearly: {
    amount: 24990, // $249.90/year (2.5 months free)
    currency: 'USD',
    display: '$249.90',
    savings: 21, // 21% savings
  },
  lifetime: {
    amount: 49900, // $499 one-time
    currency: 'USD',
    display: '$499',
  },
  trial: {
    enabled: true,
    days: 30,
  },
};

const ENTERPRISE_PRICING: PricingInfo = {
  tier: 'enterprise',
  monthly: {
    amount: 0, // Custom pricing
    currency: 'USD',
    display: 'Custom',
  },
  yearly: {
    amount: 0,
    currency: 'USD',
    display: 'Custom',
    savings: 0,
  },
  trial: {
    enabled: true,
    days: 60,
  },
};

/**
 * Complete Subscription Plans
 */
export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, SubscriptionPlan> = {
  free: {
    tier: 'free',
    name: 'Free',
    tagline: 'For starting and staying consistent',
    description:
      'Use PainTracker privately without needing to upgrade first. Track pain, build the habit, and keep control of your records.',
    features: FREE_FEATURES,
    pricing: FREE_PRICING,
    limits: {
      softLimits: false,
      gracePeriodDays: 0,
    },
    targeting: {
      userType: ['individual', 'patient', 'caregiver'],
      painLevel: 'any',
    },
  },

  basic: {
    tier: 'basic',
    name: 'Basic',
    tagline: 'For turning your pain history into cleaner summaries',
    description:
      'Basic is for people who already track pain and want less manual work before appointments, personal reviews, or support conversations.',
    features: BASIC_FEATURES,
    pricing: BASIC_PRICING,
    popular: true,
    limits: {
      softLimits: true,
      gracePeriodDays: 7,
    },
    targeting: {
      userType: ['individual', 'caregiver'],
      painLevel: 'chronic',
    },
  },

  pro: {
    tier: 'pro',
    name: 'Pro',
    tagline: 'For serious documentation workflows',
    description:
      'Pro is for people using pain records around disability notes, WorkSafeBC preparation, medication response, functional impact, or long-term care conversations.',
    features: PRO_FEATURES,
    pricing: PRO_PRICING,
    recommended: true,
    limits: {
      softLimits: true,
      gracePeriodDays: 14,
    },
    targeting: {
      userType: ['power_user', 'healthcare_coordinator', 'professional'],
      painLevel: 'chronic',
    },
  },

  enterprise: {
    tier: 'enterprise',
    name: 'Enterprise',
    tagline: 'Organization workflows without weakening trust',
    description:
      'For clinics and organizations that need structured deployment, custom workflows, and dedicated support while preserving the product\'s local-first posture.',
    features: ENTERPRISE_FEATURES,
    pricing: ENTERPRISE_PRICING,
    limits: {
      softLimits: true,
      gracePeriodDays: 30,
    },
    targeting: {
      userType: ['organization', 'clinic', 'healthcare_provider'],
    },
  },
};

/**
 * Feature Comparison Matrix
 * Useful for pricing page and upgrade prompts
 */
export const FEATURE_COMPARISON = {
  storage: {
    category: 'Your Record',
    items: [
      {
        name: 'Daily tracking entries',
        free: 'Unlimited',
        basic: 'Unlimited',
        pro: 'Unlimited',
        enterprise: 'Unlimited',
      },
      {
        name: 'Record retention',
        free: 'Unlimited',
        basic: 'Unlimited',
        pro: 'Unlimited',
        enterprise: 'Unlimited + Custom',
      },
      {
        name: 'Attachment and storage space',
        free: '100 MB',
        basic: '500 MB',
        pro: '5 GB',
        enterprise: 'Unlimited',
      },
    ],
  },
  analytics: {
    category: 'Pattern Review & Summaries',
    items: [
      {
        name: 'Basic pattern review',
        free: true,
        basic: true,
        pro: true,
        enterprise: true,
      },
      {
        name: 'Deeper pattern review',
        free: false,
        basic: true,
        pro: true,
        enterprise: true,
      },
      {
        name: 'Pattern alerts',
        free: false,
        basic: false,
        pro: true,
        enterprise: true,
      },
      {
        name: 'Summary insights',
        free: false,
        basic: true,
        pro: true,
        enterprise: true,
      },
    ],
  },
  export: {
    category: 'Exports & Documentation',
    items: [
      {
        name: 'CSV export',
        free: true,
        basic: true,
        pro: true,
        enterprise: true,
      },
      {
        name: 'PDF summaries',
        free: true,
        basic: true,
        pro: true,
        enterprise: true,
      },
      {
        name: 'WorkSafeBC reports',
        free: true,
        basic: true,
        pro: true,
        enterprise: true,
      },
      {
        name: 'Clinician-friendly PDF export',
        free: false,
        basic: false,
        pro: true,
        enterprise: true,
      },
    ],
  },
  collaboration: {
    category: 'Shared Review',
    items: [
      {
        name: 'Family Sharing',
        free: false,
        basic: true,
        pro: true,
        enterprise: true,
      },
      {
        name: 'Shared access seats',
        free: '0',
        basic: '2',
        pro: '5',
        enterprise: 'Unlimited',
      },
      {
        name: 'Caregiver Access',
        free: false,
        basic: true,
        pro: true,
        enterprise: true,
      },
    ],
  },
  security: {
    category: 'Privacy & Protection',
    items: [
      {
        name: 'At-rest protection',
        free: 'Basic',
        basic: 'Advanced',
        pro: 'Advanced',
        enterprise: 'Enterprise',
      },
      {
        name: 'Two-factor sign-in',
        free: false,
        basic: true,
        pro: true,
        enterprise: true,
      },
      {
        name: 'Privacy-aligned security controls',
        free: false,
        basic: false,
        pro: true,
        enterprise: true,
      },
    ],
  },
  support: {
    category: 'Support',
    items: [
      {
        name: 'Support route',
        free: 'Community',
        basic: 'Email',
        pro: 'Priority',
        enterprise: 'Dedicated',
      },
      {
        name: 'Response target',
        free: '72 hours',
        basic: '24 hours',
        pro: '4 hours',
        enterprise: '1 hour',
      },
      {
        name: 'Custom Training',
        free: false,
        basic: false,
        pro: false,
        enterprise: true,
      },
    ],
  },
};

/**
 * Tier Upgrade Paths
 * Defines logical upgrade flows
 */
export const UPGRADE_PATHS: Record<SubscriptionTier, SubscriptionTier[]> = {
  free: ['basic', 'pro', 'enterprise'],
  basic: ['pro', 'enterprise'],
  pro: ['enterprise'],
  enterprise: [],
};

/**
 * Tier Downgrade Paths
 */
export const DOWNGRADE_PATHS: Record<SubscriptionTier, SubscriptionTier[]> = {
  enterprise: ['pro', 'basic', 'free'],
  pro: ['basic', 'free'],
  basic: ['free'],
  free: [],
};

/**
 * Feature Usage Limits by Tier
 * Used for soft limit warnings and usage tracking
 * Note: Core tracking (entries) is unlimited for all tiers
 */
export const USAGE_LIMITS = {
  free: {
    // Entries are unlimited - no painEntries limit
    storageMB: { limit: 100, warningAt: 80, unit: 'MB' },
    exportCount: { limit: 5, warningAt: 4, unit: 'exports/month', resetMonthly: true },
  },
  basic: {
    // Entries are unlimited
    storageMB: { limit: 500, warningAt: 450, unit: 'MB' },
    exportCount: { limit: 50, warningAt: 45, unit: 'exports/month', resetMonthly: true },
  },
  pro: {
    storageMB: { limit: 5000, warningAt: 4500, unit: 'MB' },
    apiCalls: { limit: 10000, warningAt: 9000, unit: 'calls/month', resetMonthly: true },
  },
  enterprise: {
    // Custom limits set per organization
  },
};

/**
 * Trial Configurations
 */
export const TRIAL_CONFIGS = {
  basic: {
    tier: 'basic' as SubscriptionTier,
    duration: 14,
    requiresPaymentMethod: false,
    autoConvert: false,
    features: BASIC_FEATURES,
    conversionIncentive: {
      discount: 20, // 20% off first month
      validDays: 7, // Valid for 7 days after trial
    },
  },
  pro: {
    tier: 'pro' as SubscriptionTier,
    duration: 30,
    requiresPaymentMethod: false,
    autoConvert: false,
    features: PRO_FEATURES,
    conversionIncentive: {
      discount: 25,
      validDays: 14,
    },
  },
  enterprise: {
    tier: 'enterprise' as SubscriptionTier,
    duration: 60,
    requiresPaymentMethod: false,
    autoConvert: false,
    features: ENTERPRISE_FEATURES,
  },
};
