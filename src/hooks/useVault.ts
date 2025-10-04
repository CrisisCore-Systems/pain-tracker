import { useEffect } from 'react';
import { useSyncExternalStore } from 'react';
import { vaultService, type VaultStatus } from '../services/VaultService';

function subscribe(listener: () => void) {
  return vaultService.onChange(() => listener());
}

function getSnapshot(): VaultStatus {
  return vaultService.getStatus();
}

export function useVaultStatus(): VaultStatus {
  const status = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    void vaultService.initialize();
  }, []);

  return status;
}

export function useVault(): {
  status: VaultStatus;
  setupPassphrase: (passphrase: string) => Promise<void>;
  unlock: (passphrase: string) => Promise<void>;
  lock: () => void;
  clearAll: () => void;
} {
  const status = useVaultStatus();

  return {
    status,
    setupPassphrase: (passphrase: string) => vaultService.setupPassphrase(passphrase),
    unlock: (passphrase: string) => vaultService.unlock(passphrase),
    lock: () => vaultService.lock(),
    clearAll: () => vaultService.clearAll()
  };
}
