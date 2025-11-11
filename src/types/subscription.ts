/**
 * SaaS Subscription System - Type Definitions
 * Defines subscription tiers, features, and billing models for Pain Tracker
 */

/**
 * Subscription Tier Levels
 */
export type SubscriptionTier = 'free' | 'basic' | 'pro' | 'enterprise';

/**
 * Billing Intervals
 */
export type BillingInterval = 'monthly' | 'yearly' | 'lifetime';

/**
 * Subscription Status
 */
export type SubscriptionStatus = 
  | 'active'           // Currently active and paid
  | 'trialing'         // In trial period
  | 'past_due'         // Payment failed but still accessible
  | 'canceled'         // Canceled but still valid until period end
  | 'expired'          // Subscription has ended
  | 'paused'           // Temporarily paused
  | 'incomplete'       // Payment incomplete
  | 'incomplete_expired'; // Payment incomplete and expired

/**
 * Feature Categories
 */
export type FeatureCategory =
  | 'storage'          // Data storage limits
  | 'analytics'        // Analytics and insights
  | 'export'           // Export capabilities
  | 'integration'      // Third-party integrations
  | 'support'          // Support level
  | 'customization'    // Customization options
  | 'collaboration'    // Multi-user features
  | 'security'         // Advanced security features
  | 'ai'               // AI-powered features
  | 'compliance';      // Compliance features

/**
 * Feature Access Levels
 */
export type FeatureAccessLevel = 'none' | 'limited' | 'full' | 'unlimited';

/**
 * Individual Feature Definition
 */
export interface Feature {
  id: string;
  name: string;
  description: string;
  category: FeatureCategory;
  tier: SubscriptionTier;
  accessLevel: FeatureAccessLevel;
  limit?: number;               // Numeric limit (e.g., storage MB, entries per month)
  enabled: boolean;
  betaAccess?: boolean;
  traumaInformed?: boolean;     // Special trauma-informed features
}

/**
 * Tier Feature Set
 */
export interface TierFeatures {
  // Storage Limits
  maxPainEntries: number;        // -1 = unlimited
  maxMoodEntries: number;
  maxActivityLogs: number;
  maxStorageMB: number;
  dataRetentionDays: number;     // -1 = unlimited
  
  // Analytics & Insights
  basicAnalytics: boolean;
  advancedAnalytics: boolean;
  predictiveInsights: boolean;
  customReports: boolean;
  empathyIntelligence: boolean;
  
  // Export Capabilities
  csvExport: boolean;
  jsonExport: boolean;
  pdfReports: boolean;
  wcbReports: boolean;
  clinicalPDFExport: boolean;
  scheduledReports: boolean;
  
  // Integration Features
  healthcareProviderAPI: boolean;
  fhirIntegration: boolean;
  calendarSync: boolean;
  wearableDevices: boolean;
  
  // Collaboration
  multiUser: boolean;
  familySharing: boolean;
  caregiverAccess: boolean;
  maxSharedUsers: number;
  
  // Security & Privacy
  encryption: 'basic' | 'advanced' | 'enterprise';
  twoFactorAuth: boolean;
  auditLogs: boolean;
  hipaaCompliance: boolean;
  soc2Compliance: boolean;
  customDataRetention: boolean;
  
  // Support
  supportLevel: 'community' | 'email' | 'priority' | 'dedicated';
  responseTime: string;         // e.g., "48h", "24h", "4h", "1h"
  onboarding: boolean;
  customTraining: boolean;
  
  // AI & Automation
  aiInsights: boolean;
  automatedReminders: boolean;
  smartSuggestions: boolean;
  patternRecognition: boolean;
  
  // Customization
  customThemes: boolean;
  customDashboard: boolean;
  customFields: boolean;
  branding: boolean;            // For enterprise
  whiteLabel: boolean;
  
  // Advanced Features
  offlineMode: boolean;
  mobileApp: boolean;
  apiAccess: boolean;
  webhooks: boolean;
  customIntegrations: boolean;
}

/**
 * Pricing Information
 */
export interface PricingInfo {
  tier: SubscriptionTier;
  monthly: {
    amount: number;              // In cents
    currency: string;
    display: string;
  };
  yearly: {
    amount: number;
    currency: string;
    display: string;
    savings: number;             // Percentage saved vs monthly
  };
  lifetime?: {
    amount: number;
    currency: string;
    display: string;
  };
  trial: {
    enabled: boolean;
    days: number;
  };
}

/**
 * User Subscription Data
 */
export interface UserSubscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  
  // Billing Information
  billingInterval: BillingInterval;
  currentPeriodStart: string;   // ISO date
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  
  // Trial Information
  trialStart?: string;
  trialEnd?: string;
  
  // Payment Information
  paymentProvider?: 'stripe' | 'paddle' | 'manual';
  paymentMethodId?: string;
  customerId?: string;          // Provider customer ID
  subscriptionId?: string;      // Provider subscription ID
  
  // Usage Tracking
  usage: {
    painEntries: number;
    moodEntries: number;
    activityLogs: number;
    storageMB: number;
    apiCalls: number;
    exportCount: number;
  };
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  lastBillingDate?: string;
  nextBillingDate?: string;
  
  // Upgrade/Downgrade
  scheduledChange?: {
    newTier: SubscriptionTier;
    effectiveDate: string;
    reason: 'upgrade' | 'downgrade' | 'plan_change';
  };
  
  // Discounts & Credits
  discounts?: Array<{
    code: string;
    percentage: number;
    expiresAt?: string;
  }>;
  credits?: number;              // In cents
  
  // Compliance & Security
  dataRegion?: string;           // e.g., "us", "eu", "ca"
  complianceLevel?: 'standard' | 'hipaa' | 'soc2';
}

/**
 * Subscription Plan Definition
 */
export interface SubscriptionPlan {
  tier: SubscriptionTier;
  name: string;
  tagline: string;
  description: string;
  features: TierFeatures;
  pricing: PricingInfo;
  popular?: boolean;             // Highlight as popular
  recommended?: boolean;
  limits: {
    softLimits: boolean;         // Allow temporary overages
    gracePeriodDays: number;     // Days before enforcement
  };
  targeting?: {
    userType: string[];          // e.g., ["individual", "caregiver", "patient"]
    painLevel?: string;          // e.g., "chronic", "acute", "mild"
  };
}

/**
 * Usage Quota Information
 */
export interface UsageQuota {
  feature: string;
  limit: number;                 // -1 = unlimited
  current: number;
  remaining: number;
  percentage: number;            // 0-100
  resetDate?: string;            // For monthly limits
  overage?: {
    allowed: boolean;
    currentOverage: number;
    maxOverage: number;
    cost?: number;               // Per unit cost
  };
}

/**
 * Feature Access Check Result
 */
export interface FeatureAccessResult {
  hasAccess: boolean;
  reason?: string;
  upgradeRequired?: SubscriptionTier;
  quota?: UsageQuota;
  alternativeFeature?: string;
  gracePeriod?: {
    active: boolean;
    expiresAt: string;
  };
}

/**
 * Billing Event
 */
export interface BillingEvent {
  id: string;
  type: 
    | 'subscription_created'
    | 'subscription_updated'
    | 'subscription_canceled'
    | 'payment_succeeded'
    | 'payment_failed'
    | 'trial_started'
    | 'trial_ended'
    | 'tier_upgraded'
    | 'tier_downgraded'
    | 'refund_issued';
  subscriptionId: string;
  userId: string;
  timestamp: string;
  amount?: number;
  currency?: string;
  metadata?: Record<string, unknown>;
  webhookId?: string;
}

/**
 * Invoice
 */
export interface Invoice {
  id: string;
  subscriptionId: string;
  userId: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  
  // Amounts
  subtotal: number;              // In cents
  tax: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  
  // Dates
  createdAt: string;
  dueDate: string;
  paidAt?: string;
  voidedAt?: string;
  
  // Line Items
  items: Array<{
    description: string;
    quantity: number;
    unitAmount: number;
    amount: number;
  }>;
  
  // Payment Info
  paymentMethod?: string;
  receiptUrl?: string;
  invoicePdf?: string;
}

/**
 * Upgrade/Downgrade Options
 */
export interface TierChangeOption {
  fromTier: SubscriptionTier;
  toTier: SubscriptionTier;
  type: 'upgrade' | 'downgrade';
  
  // Pricing
  immediateCharge?: number;      // Prorated amount
  nextBillingChange: number;
  
  // Feature Changes
  featuresGained: string[];
  featuresLost: string[];
  
  // Data Migration
  requiresMigration: boolean;
  dataImpact?: {
    entriesAffected: number;
    storageReduction?: number;
    retentionChange?: number;
  };
  
  // Timing
  effectiveImmediately: boolean;
  effectiveDate?: string;
  
  // Warnings
  warnings?: string[];
  confirmationRequired: boolean;
}

/**
 * Subscription Analytics
 */
export interface SubscriptionAnalytics {
  userId: string;
  tier: SubscriptionTier;
  
  // Usage Metrics
  dailyActive: boolean;
  weeklyActive: boolean;
  monthlyActive: boolean;
  
  // Feature Usage
  mostUsedFeatures: Array<{
    feature: string;
    count: number;
    lastUsed: string;
  }>;
  
  // Value Metrics
  entriesCreated: number;
  reportsGenerated: number;
  insightsViewed: number;
  exportsMade: number;
  
  // Engagement Score
  engagementScore: number;       // 0-100
  churnRisk: 'low' | 'medium' | 'high';
  
  // Recommendations
  recommendedTier?: SubscriptionTier;
  recommendedFeatures?: string[];
}

/**
 * Trial Configuration
 */
export interface TrialConfig {
  tier: SubscriptionTier;
  duration: number;              // Days
  requiresPaymentMethod: boolean;
  autoConvert: boolean;          // Auto-convert to paid at end
  features: TierFeatures;
  limitations?: string[];
  conversionIncentive?: {
    discount: number;            // Percentage
    validDays: number;
  };
}

/**
 * Enterprise Custom Configuration
 */
export interface EnterpriseConfig {
  subscriptionId: string;
  
  // Custom Limits
  customLimits?: {
    [key: string]: number;
  };
  
  // Custom Features
  customFeatures?: string[];
  
  // Branding
  branding?: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
    customDomain?: string;
  };
  
  // SLA
  sla?: {
    uptime: number;              // Percentage
    supportResponseTime: number; // Hours
    dataBackupFrequency: string;
    dedicatedSupport: boolean;
  };
  
  // Compliance
  compliance?: {
    hipaa: boolean;
    soc2: boolean;
    gdpr: boolean;
    customAgreements?: string[];
  };
  
  // Integration
  sso?: {
    enabled: boolean;
    provider: string;
    metadata?: Record<string, unknown>;
  };
  
  // Billing
  customBilling?: {
    invoiceFrequency: string;
    paymentTerms: number;        // Days
    poRequired: boolean;
  };
}
