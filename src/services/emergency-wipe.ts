import { clearAllUserData } from '../utils/clear-all-user-data';

export type EmergencyWipeReason = 'vault_failed_attempts' | 'user_initiated';

/**
 * Best-effort emergency wipe.
 *
 * This intentionally avoids returning any sensitive details and uses
 * existing clearing logic that removes state, secureStorage keys, caches,
 * and offline IndexedDB persistence.
 */
export async function performEmergencyWipe(_reason: EmergencyWipeReason): Promise<void> {
  await clearAllUserData();
}
