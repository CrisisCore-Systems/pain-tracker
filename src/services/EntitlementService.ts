/**
 * Entitlement Service
 *
 * Internal spine for module-driven monetization.
 * - Premium checks are one function: hasEntitlement(moduleId)
 * - No accounts required for core tracking
 * - No network required
 * - Composed via entitlement providers to prevent tier/network recoupling
 */

import type { ModuleId } from '../config/modules';
import type { EntitlementProvider } from './entitlements/EntitlementProvider';
import { LocalEntitlementsProvider } from './entitlements/LocalEntitlementsProvider';
import { TierEntitlementsProvider } from './entitlements/TierEntitlementsProvider';

export class EntitlementService {
  private readonly localProvider = new LocalEntitlementsProvider();
  private readonly providers: ReadonlyArray<EntitlementProvider> = [
    new TierEntitlementsProvider(),
    this.localProvider,
  ];

  private moduleSet(): Set<ModuleId> {
    const set = new Set<ModuleId>();
    for (const provider of this.providers) {
      for (const moduleId of provider.listEntitledModules()) {
        set.add(moduleId);
      }
    }
    return set;
  }

  /**
   * Single check used everywhere in premium feature gating.
   * Must be deterministic and offline-capable.
   */
  hasEntitlement(moduleId: ModuleId): boolean {
    return this.moduleSet().has(moduleId);
  }

  /**
   * Dev/testing helper.
   * Future: license import writes the same storage shape.
   */
  grantLocal(moduleId: ModuleId) {
    this.localProvider.grant(moduleId);
  }

  revokeLocal(moduleId: ModuleId) {
    this.localProvider.revoke(moduleId);
  }

  clearLocal() {
    this.localProvider.clear();
  }

  listEntitlements(): ModuleId[] {
    return Array.from(this.moduleSet());
  }
}

export const entitlementService = new EntitlementService();
