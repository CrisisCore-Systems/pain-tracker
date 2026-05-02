import { MODULES, type ModuleId } from '../../config/modules';
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
  private readonly tierRank = {
    free: 0,
    basic: 1,
    pro: 2,
    enterprise: 3,
  } as const;

  private currentTierId(): string {
    // Local-only identity; NOT auth. Used purely for local tier state.
    const userId = getLocalUserId();
    return subscriptionService.getUserTier(userId);
  }

  private tierModules(tierId: string | null | undefined): Set<ModuleId> {
    const resolvedTier =
      tierId === 'basic' || tierId === 'pro' || tierId === 'enterprise' || tierId === 'free'
        ? tierId
        : 'free';

    return new Set<ModuleId>(
      Object.entries(MODULES)
        .filter(([, moduleDefinition]) => {
          if (!moduleDefinition.includedInTier) {
            return false;
          }

          return this.tierRank[resolvedTier] >= this.tierRank[moduleDefinition.includedInTier];
        })
        .map(([moduleId]) => moduleId as ModuleId)
    );
  }

  listEntitledModules(): ModuleId[] {
    return Array.from(this.tierModules(this.currentTierId()));
  }
}
