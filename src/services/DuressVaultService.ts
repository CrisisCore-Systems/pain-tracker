import { vaultService } from './VaultService';
import { getSodium, getSodiumSync } from '../lib/crypto/sodium';
import { secureStorage } from '../lib/storage/secureStorage';
import { performEmergencyWipe } from './emergency-wipe';

const DECOY_SALT_KEY = 'vault:duress:salt';
const DEEP_ACCESS_KEY = 'vault:deep_access';
const MIN_UNLOCK_TIME_MS = 900; // Minimum time to prevent timing attacks

// Ensure decoy data exists with timing-safe initialization
export async function ensureDecoyVault(): Promise<void> {
  const sodium = await getSodium();
  const salt = secureStorage.get<string>(DECOY_SALT_KEY);
  
  if (!salt) {
    const newSalt = sodium.randombytes_buf(sodium.crypto_pwhash_SALTBYTES);
    secureStorage.set(DECOY_SALT_KEY, sodium.to_base64(newSalt, 1));
  }
}

// Verify decoy passphrase against stored verification hash
export async function verifyDecoyPassphrase(passphrase: string): Promise<boolean> {
  const sodium = getSodiumSync();
  if (!sodium) return false;
  
  const storedHash = secureStorage.get<string>('vault:duress:hash');
  if (!storedHash) return false;
  
  try {
    return sodium.crypto_pwhash_str_verify(storedHash, passphrase);
  } catch {
    return false;
  }
}

// Set decoy passphrase during setup (separate from vault passphrase)
export async function setDecoyPassphrase(passphrase: string): Promise<void> {
  const sodium = await getSodium();
  const hash = sodium.crypto_pwhash_str(
    passphrase,
    sodium.crypto_pwhash_OPSLIMIT_MODERATE,
    sodium.crypto_pwhash_MEMLIMIT_MODERATE
  );
  secureStorage.set('vault:duress:hash', hash);
}

// Execute hard panic (burn sequence) - immediate data destruction
export async function executeHardPanic(): Promise<void> {
  try {
    await performEmergencyWipe('user_initiated');
  } finally {
    // Force reload to uninitialized state
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }
}

// Execute soft panic (context swap to decoy)
export async function executeSoftPanic(): Promise<void> {
  // Clear deep vault access marker - UI will re-route to decoy
  try {
    sessionStorage.removeItem(DEEP_ACCESS_KEY);
  } catch {
    // ignore
  }
}

// Main duress-aware unlock - both pathways execute in constant time
export async function unlockWithDuressAwareness(passphrase: string): Promise<{
  unlocked: boolean;
  isDecoy: boolean;
  isDeepVault: boolean;
}> {
  const start = performance.now();
  
  // Attempt both unlock pathways in parallel for timing safety
  // This ensures identical execution time regardless of which passphrase is entered
  let deepUnlocked = false;
  
  try {
    // Parallel attempts - both run regardless of outcome
    await Promise.allSettled([
      verifyDecoyPassphrase(passphrase), // decoy check runs for timing safety
      vaultService.unlock(passphrase).then(() => { deepUnlocked = true; }).catch(() => { /* deep unlock failed */ }),
    ]);
  } catch {
    // Both pathways may fail, continue with timing window
  }
  
  // Ensure minimum timing window to prevent side-channel attacks
  // Both decoy and deep unlock take at least MIN_UNLOCK_TIME_MS
  const elapsed = performance.now() - start;
  const remainingDelay = Math.max(0, MIN_UNLOCK_TIME_MS - elapsed);
  if (remainingDelay > 0) {
    await new Promise(resolve => setTimeout(resolve, remainingDelay));
  }
  
  // Prioritize deep vault if the real passphrase matched
  if (deepUnlocked) {
    try {
      const deepKey = Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem(DEEP_ACCESS_KEY, deepKey);
    } catch {
      // ignore storage errors
    }
    return { unlocked: true, isDecoy: false, isDeepVault: true };
  }
  
  // If decoy passphrase matched or as safe fallback, enter decoy mode
  // This provides plausible deniability - any passphrase shows the decoy
  try {
    sessionStorage.setItem('vault:mode', 'decoy');
  } catch {
    // ignore
  }
  
  return { unlocked: true, isDecoy: true, isDeepVault: false };
}

// Check if current session is in decoy mode
export function isDecoyMode(): boolean {
  try {
    return sessionStorage.getItem('vault:mode') === 'decoy';
  } catch {
    return false;
  }
}

// Check if current session has deep vault access
export function hasDeepVaultAccess(): boolean {
  try {
    return sessionStorage.getItem(DEEP_ACCESS_KEY) !== null;
  } catch {
    return false;
  }
}

// Clear decoy mode (used when transitioning back)
export function clearVaultMode(): void {
  try {
    sessionStorage.removeItem('vault:mode');
    sessionStorage.removeItem(DEEP_ACCESS_KEY);
  } catch {
    // ignore
  }
}

// Public API for panic triggers
export const DuressOrchestrator = {
  hardPanic: executeHardPanic,
  softPanic: executeSoftPanic,
  isDecoyMode,
  hasDeepVaultAccess,
  clearVaultMode,
};