import { useState, useCallback, useRef } from 'react';
import {
  unlockWithDuressAwareness,
  ensureDecoyVault,
} from '../../services/DuressVaultService';
import { usePainTrackerStore } from '../../stores/pain-tracker-store';

export type GatekeeperState = 'IDLE' | 'DERIVING' | 'DECOY_MOUNTING' | 'VAULT_MOUNTING' | 'FAILED';

interface UseGatekeeperRouterOptions {
  readonly fixedExecutionWindowMs?: number;
  readonly onDecoyMounted?: () => void;
  readonly onVaultMounted?: () => void;
}

interface GatekeeperResult {
  type: 'DECOY' | 'VAULT' | 'INVALID';
  keys?: unknown;
}

function createCryptoDerivationEngine() {
  return async (passphrase: string): Promise<GatekeeperResult> => {
    const result = await unlockWithDuressAwareness(passphrase);
    
    if (result.isDeepVault) {
      return { type: 'VAULT', keys: { unlocked: true } };
    }
    
    return { type: 'DECOY' };
  };
}

export function useGatekeeperRouter(options?: UseGatekeeperRouterOptions): {
  state: GatekeeperState;
  error: string | null;
  executeUnlock: (passphrase: string) => Promise<void>;
  isProcessing: boolean;
  isDecoyMode: boolean;
  isVaultMode: boolean;
} {
  const fixedExecutionWindowMs = options?.fixedExecutionWindowMs ?? 1500;
  
  const [state, setState] = useState<GatekeeperState>('IDLE');
  const [error, setError] = useState<string | null>(null);
  const operationLock = useRef<boolean>(false);

  const executeUnlock = useCallback(async (passphrase: string) => {
    if (operationLock.current) return;
    operationLock.current = true;
    
    setState('DERIVING');
    setError(null);
    
    const startTime = performance.now();
    let routingResult: 'DECOY' | 'VAULT' | 'INVALID' = 'INVALID';
    let payloadKeys: unknown = null;

    try {
      const cryptoDerivationEngine = createCryptoDerivationEngine();
      const outcome = await cryptoDerivationEngine(passphrase);
      routingResult = outcome.type;
      payloadKeys = outcome.keys;
    } catch {
      // Absorb errors silently to preserve identical exception timing
      routingResult = 'INVALID';
    }

    // Calculate remaining padding time to meet the execution window exactly
    const endTime = performance.now();
    const processingDuration = endTime - startTime;
    const remainingPadding = Math.max(0, fixedExecutionWindowMs - processingDuration);

    // Artificial delay to guarantee side-channel resistance
    await new Promise((resolve) => setTimeout(resolve, remainingPadding));

    // Deterministic state branching based on result
    try {
      if (routingResult === 'VAULT' && payloadKeys) {
        setState('VAULT_MOUNTING');
        await ensureDecoyVault(); // Pre-warm decoy for next potential soft panic
        options?.onVaultMounted?.();
      } else if (routingResult === 'DECOY') {
        setState('DECOY_MOUNTING');
        // Load decoy entries into the store
        usePainTrackerStore.getState().loadDecoyEntries();
        options?.onDecoyMounted?.();
      } else {
        // Invalid passphrase - default to decoy mounting for plausible deniability
        setState('DECOY_MOUNTING');
        usePainTrackerStore.getState().loadDecoyEntries();
        options?.onDecoyMounted?.();
      }
    } catch {
      setState('FAILED');
      setError('Initialization configuration exception.');
    } finally {
      operationLock.current = false;
    }
  }, [fixedExecutionWindowMs, options?.onDecoyMounted, options?.onVaultMounted]);

  return {
    state,
    error,
    executeUnlock,
    isProcessing: state === 'DERIVING' || state === 'DECOY_MOUNTING' || state === 'VAULT_MOUNTING',
    isDecoyMode: state === 'DECOY_MOUNTING',
    isVaultMode: state === 'VAULT_MOUNTING',
  };
}