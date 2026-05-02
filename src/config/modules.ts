import type { SubscriptionTier } from '../types/subscription';

export type ModuleId =
  | 'reports_clinical_pdf'
  | 'reports_wcb_forms'
  | 'analytics_advanced'
  | 'sync_encrypted';

// Convention: module ids are snake_case.
export type ModuleAccountRequirement = 'none' | 'optional' | 'required';

export type ModuleDefinition = {
  label: string;
  description: string;
  includedInTier?: Extract<SubscriptionTier, 'basic' | 'pro' | 'enterprise'>;
  /**
   * Whether unlocking/using this module requires an external identity.
   * Core tracking remains accountless regardless.
   */
  accountRequirement: ModuleAccountRequirement;
};

export const MODULES: Record<ModuleId, ModuleDefinition> = {
  reports_clinical_pdf: {
    label: 'Clinical Report Pack',
    description: 'Physician-ready PDF exports and visit summaries.',
    includedInTier: 'pro',
    accountRequirement: 'none',
  },
  reports_wcb_forms: {
    label: 'Insurance & WCB Forms Pack',
    description: 'Structured form templates and claim-ready exports.',
    includedInTier: 'basic',
    accountRequirement: 'none',
  },
  analytics_advanced: {
    label: 'Advanced Analytics',
    description: 'Correlation overlays and deeper pattern views (local).',
    includedInTier: 'basic',
    accountRequirement: 'none',
  },
  sync_encrypted: {
    label: 'Encrypted Multi-Device Sync',
    description: 'Optional cloud transport with encryption (separate system).',
    accountRequirement: 'optional',
  },
};
