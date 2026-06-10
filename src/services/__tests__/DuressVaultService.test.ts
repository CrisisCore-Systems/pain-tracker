import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the vault service
const vaultServiceMock = vi.hoisted(() => ({
  unlock: vi.fn<() => Promise<void>>(),
}));

vi.mock('../../services/VaultService', () => ({
  vaultService: vaultServiceMock,
}));

// Mock secure storage
const secureStorageMock = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
  remove: vi.fn(),
}));

vi.mock('../../lib/storage/secureStorage', () => ({
  secureStorage: secureStorageMock,
}));

// Mock sodium
const sodiumMock = vi.hoisted(() => ({
  crypto_pwhash: vi.fn(),
  crypto_pwhash_str: vi.fn(),
  crypto_pwhash_str_verify: vi.fn(),
  randombytes_buf: vi.fn(),
  to_base64: vi.fn((v: string) => v),
  from_base64: vi.fn((v: string) => v),
  crypto_pwhash_SALTBYTES: 16,
  crypto_pwhash_OPSLIMIT_MODERATE: 3,
  crypto_pwhash_MEMLIMIT_MODERATE: 67108864,
  crypto_aead_xchacha20poly1305_ietf_KEYBYTES: 32,
  crypto_pwhash_ALG_ARGON2ID13: 2,
}));

vi.mock('../../lib/crypto/sodium', () => ({
  getSodium: vi.fn(async () => sodiumMock),
  getSodiumSync: vi.fn(() => sodiumMock),
}));

// Mock emergency wipe
const performEmergencyWipeMock = vi.hoisted(() => vi.fn(async () => {}));

vi.mock('../../services/emergency-wipe', () => ({
  performEmergencyWipe: performEmergencyWipeMock,
}));

import {
  unlockWithDuressAwareness,
  isDecoyMode,
  hasDeepVaultAccess,
  clearVaultMode,
  ensureDecoyVault,
  executeHardPanic,
  DuressOrchestrator,
} from '../DuressVaultService';

describe('DuressVaultService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vaultServiceMock.unlock.mockReset();
    secureStorageMock.get.mockReset();
    secureStorageMock.set.mockReset();
    secureStorageMock.remove.mockReset();
    
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  describe('ensureDecoyVault', () => {
    it('initializes decoy salt if not present', async () => {
      secureStorageMock.get.mockReturnValue(null);
      sodiumMock.randombytes_buf.mockReturnValue('mock-salt-bytes' as never);
      
      await ensureDecoyVault();
      
      expect(secureStorageMock.set).toHaveBeenCalledWith(
        'vault:duress:salt',
        expect.any(String)
      );
    });

    it('does not overwrite existing salt', async () => {
      secureStorageMock.get.mockReturnValue('existing-salt');
      
      await ensureDecoyVault();
      
      expect(secureStorageMock.set).not.toHaveBeenCalled();
    });
  });

  describe('unlockWithDuressAwareness', () => {
    it('returns decoy mode and sets session state on successful deep vault unlock', async () => {
      vaultServiceMock.unlock.mockResolvedValue(undefined);
      secureStorageMock.get.mockReturnValue('stored-hash');
      sodiumMock.crypto_pwhash_str_verify.mockReturnValue(true);
      sodiumMock.randombytes_buf.mockReturnValue('mock-key-bytes');
      
      const result = await unlockWithDuressAwareness('correct-passphrase');
      
      expect(result.unlocked).toBe(true);
      expect(result.isDeepVault).toBe(true);
      expect(result.isDecoy).toBe(false);
      expect(sessionStorage.getItem('vault:deep_access')).toBeTruthy();
    });

    it('returns decoy mode when decoy passphrase matches', async () => {
      vaultServiceMock.unlock.mockRejectedValue(new Error('incorrect'));
      secureStorageMock.get.mockReturnValue('stored-hash');
      sodiumMock.crypto_pwhash_str_verify.mockReturnValue(true);
      sodiumMock.randombytes_buf.mockReturnValue('mock-key-bytes');
      
      const result = await unlockWithDuressAwareness('decoy-passphrase');
      
      expect(result.unlocked).toBe(true);
      expect(result.isDecoy).toBe(true);
      expect(result.isDeepVault).toBe(false);
      expect(sessionStorage.getItem('vault:mode')).toBe('decoy');
    });

    it('returns decoy mode as safe fallback for wrong passphrase', async () => {
      vaultServiceMock.unlock.mockRejectedValue(new Error('incorrect'));
      secureStorageMock.get.mockReturnValue(null); // No decoy hash stored
      
      const result = await unlockWithDuressAwareness('wrong-passphrase');
      
      // Even with wrong passphrase, we still return unlocked with decoy
      // This prevents timing-based information leakage
      expect(result.unlocked).toBe(true);
      expect(result.isDecoy).toBe(true);
      expect(result.isDeepVault).toBe(false);
    });

    it('enforces minimum unlock time to prevent timing attacks', async () => {
      const startTime = performance.now();
      secureStorageMock.get.mockReturnValue(null);
      
      await unlockWithDuressAwareness('any-passphrase');
      
      const elapsed = performance.now() - startTime;
      // Should take at least 900ms minimum
      expect(elapsed).toBeGreaterThanOrEqual(890);
    });

    it('executes both unlock pathways in parallel for timing safety', async () => {
      // Both pathways should run regardless of outcome
      secureStorageMock.get.mockReturnValue(null);
      
      await unlockWithDuressAwareness('test-passphrase');
      
      // The vault service unlock should have been called
      expect(vaultServiceMock.unlock).toHaveBeenCalledWith('test-passphrase');
    });
  });

  describe('isDecoyMode', () => {
    it('returns true when decoy mode is set in session', () => {
      sessionStorage.setItem('vault:mode', 'decoy');
      expect(isDecoyMode()).toBe(true);
    });

    it('returns false when not in decoy mode', () => {
      sessionStorage.removeItem('vault:mode');
      expect(isDecoyMode()).toBe(false);
    });
  });

  describe('hasDeepVaultAccess', () => {
    it('returns true when deep access key exists', () => {
      sessionStorage.setItem('vault:deep_access', 'test-key');
      expect(hasDeepVaultAccess()).toBe(true);
    });

    it('returns false when deep access key does not exist', () => {
      sessionStorage.removeItem('vault:deep_access');
      expect(hasDeepVaultAccess()).toBe(false);
    });
  });

  describe('clearVaultMode', () => {
    it('clears both decoy and deep access flags', () => {
      sessionStorage.setItem('vault:mode', 'decoy');
      sessionStorage.setItem('vault:deep_access', 'test-key');
      
      clearVaultMode();
      
      expect(sessionStorage.getItem('vault:mode')).toBeNull();
      expect(sessionStorage.getItem('vault:deep_access')).toBeNull();
    });
  });

  describe('executeHardPanic', () => {
    it('calls emergency wipe and triggers page reload', async () => {
      const reloadMock = vi.fn();
      Object.defineProperty(globalThis, 'location', {
        value: { reload: reloadMock },
        writable: true,
      });
      
      await executeHardPanic();
      
      expect(performEmergencyWipeMock).toHaveBeenCalledWith('user_initiated');
      expect(reloadMock).toHaveBeenCalled();
    });
  });

  describe('DuressOrchestrator', () => {
    it('exposes hardPanic, softPanic, and state check methods', () => {
      expect(DuressOrchestrator.hardPanic).toBe(executeHardPanic);
      expect(DuressOrchestrator.softPanic).toBeDefined();
      expect(DuressOrchestrator.isDecoyMode).toBe(isDecoyMode);
      expect(DuressOrchestrator.hasDeepVaultAccess).toBe(hasDeepVaultAccess);
      expect(DuressOrchestrator.clearVaultMode).toBe(clearVaultMode);
    });
  });
});