import type { ModuleId } from '../../config/modules';

/**
 * An entitlement provider is a pure, offline-capable source of module grants.
 *
 * Examples:
 * - Local license file import (future)
 * - Tier/subscription state (local)
 * - Store receipt validation (future mobile)
 */
export interface EntitlementProvider {
  listEntitledModules(): ModuleId[];
}
