import type { ModuleId } from '../../config/modules';
import type { EntitlementProvider } from './EntitlementProvider';
import { subscriptionService } from '../SubscriptionService';
import { getLocalUserId } from '../../utils/user-identity';

/**
 * Tier-based entitlements.
 *
 * IMPORTANT: this is a mapping from marketing tiers -> module set.
 * Keep it isolated here so pricing/bundles can change without touching feature code.
 */
export class TierEntitlementsProvider implements EntitlementProvider {
  private currentTierId(): string {
    // Local-only identity; NOT auth. Used purely for local tier state.
    const userId = getLocalUserId();
    return subscriptionService.getUserTier(userId);
  }

  private tierModules(tierId: string | null | undefined): Set<ModuleId> {
    switch (tierId) {
      case 'pro':
        return new Set<ModuleId>([
          'reports_clinical_pdf',
          'reports_wcb_forms',
          'analytics_advanced',
          // sync intentionally separate (ongoing cost)
        ]);
      case 'basic':
        return new Set<ModuleId>(['reports_clinical_pdf']);
      default:
        return new Set<ModuleId>([]);
    }
  }

  listEntitledModules(): ModuleId[] {
    return Array.from(this.tierModules(this.currentTierId()));
  }
}
