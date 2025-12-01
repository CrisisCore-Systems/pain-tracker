/**
 * SaaS Subscription Tiers Configuration
 * Defines the specific features, limits, and pricing for each tier
 */

import type {
  SubscriptionPlan,
  TierFeatures,
  PricingInfo,
  SubscriptionTier,
} from '../types/subscription';

/**
 * Free Tier Features
 * Perfect for individuals trying out pain tracking
 * Core tracking is unlimited - upgrade for advanced analytics and exports
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
  jsonExport: false,
  pdfReports: false,
  wcbReports: false,
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
 * Basic Tier Features
 * For individuals committed to chronic pain management
 * Includes advanced analytics and exports
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
  scheduledReports: false,
  maxExportsPerMonth: 50,

  // Integration Features
  healthcareProviderAPI: false,
  fhirIntegration: false,
  calendarSync: true,
  wearableDevices: false,

  // Collaboration
  multiUser: false,
  familySharing: true,
  caregiverAccess: true,
  maxSharedUsers: 2,

  // Security & Privacy
  encryption: 'advanced',
  twoFactorAuth: true,
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
 * Pro Tier Features
 * For power users, caregivers, and healthcare coordination
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
  healthcareProviderAPI: true,
  fhirIntegration: true,
  calendarSync: true,
  wearableDevices: true,

  // Collaboration
  multiUser: true,
  familySharing: true,
  caregiverAccess: true,
  maxSharedUsers: 5,

  // Security & Privacy
  encryption: 'advanced',
  twoFactorAuth: true,
  auditLogs: true,
  hipaaCompliance: true,
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
  healthcareProviderAPI: true,
  fhirIntegration: true,
  calendarSync: true,
  wearableDevices: true,

  // Collaboration
  multiUser: true,
  familySharing: true,
  caregiverAccess: true,
  maxSharedUsers: -1, // Unlimited

  // Security & Privacy
  encryption: 'enterprise',
  twoFactorAuth: true,
  auditLogs: true,
  hipaaCompliance: true,
  soc2Compliance: true,
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
    tagline: 'Unlimited pain tracking, forever free',
    description:
      'Complete pain, mood, and activity tracking with no entry limits. Upgrade for advanced analytics, AI insights, and clinical reports.',
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
    tagline: 'Comprehensive pain management',
    description:
      'For individuals committed to understanding and managing chronic pain. Includes advanced analytics, PDF reports, and family sharing.',
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
    tagline: 'Professional-grade pain tracking',
    description:
      'Power users and healthcare coordination. Unlimited entries, predictive insights, clinical PDF exports, and HIPAA compliance.',
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
    tagline: 'Healthcare organization solution',
    description:
      'For clinics, healthcare organizations, and large-scale deployments. Custom features, white-label options, SOC2 compliance, and dedicated support.',
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
    category: 'Storage & Data',
    items: [
      {
        name: 'Pain Entries',
        free: 'Unlimited',
        basic: 'Unlimited',
        pro: 'Unlimited',
        enterprise: 'Unlimited',
      },
      {
        name: 'Data Retention',
        free: 'Unlimited',
        basic: 'Unlimited',
        pro: 'Unlimited',
        enterprise: 'Unlimited + Custom',
      },
      {
        name: 'Storage Space',
        free: '100 MB',
        basic: '500 MB',
        pro: '5 GB',
        enterprise: 'Unlimited',
      },
    ],
  },
  analytics: {
    category: 'Analytics & Insights',
    items: [
      {
        name: 'Basic Analytics',
        free: true,
        basic: true,
        pro: true,
        enterprise: true,
      },
      {
        name: 'Advanced Analytics',
        free: false,
        basic: true,
        pro: true,
        enterprise: true,
      },
      {
        name: 'Predictive Insights',
        free: false,
        basic: false,
        pro: true,
        enterprise: true,
      },
      {
        name: 'Empathy Intelligence',
        free: false,
        basic: true,
        pro: true,
        enterprise: true,
      },
    ],
  },
  export: {
    category: 'Reports & Export',
    items: [
      {
        name: 'CSV Export',
        free: true,
        basic: true,
        pro: true,
        enterprise: true,
      },
      {
        name: 'PDF Reports',
        free: false,
        basic: true,
        pro: true,
        enterprise: true,
      },
      {
        name: 'WorkSafe BC Reports',
        free: false,
        basic: true,
        pro: true,
        enterprise: true,
      },
      {
        name: 'Clinical PDF Export',
        free: false,
        basic: false,
        pro: true,
        enterprise: true,
      },
    ],
  },
  collaboration: {
    category: 'Sharing & Collaboration',
    items: [
      {
        name: 'Family Sharing',
        free: false,
        basic: true,
        pro: true,
        enterprise: true,
      },
      {
        name: 'Shared Users',
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
    category: 'Security & Compliance',
    items: [
      {
        name: 'Encryption',
        free: 'Basic',
        basic: 'Advanced',
        pro: 'Advanced',
        enterprise: 'Enterprise',
      },
      {
        name: 'Two-Factor Auth',
        free: false,
        basic: true,
        pro: true,
        enterprise: true,
      },
      {
        name: 'HIPAA Compliance',
        free: false,
        basic: false,
        pro: true,
        enterprise: true,
      },
      {
        name: 'SOC2 Compliance',
        free: false,
        basic: false,
        pro: false,
        enterprise: true,
      },
    ],
  },
  support: {
    category: 'Support',
    items: [
      {
        name: 'Support Level',
        free: 'Community',
        basic: 'Email',
        pro: 'Priority',
        enterprise: 'Dedicated',
      },
      {
        name: 'Response Time',
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
