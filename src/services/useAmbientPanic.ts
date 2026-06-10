import { useEffect, useRef, useCallback } from 'react';
import { executeSoftPanic, hasDeepVaultAccess } from './DuressVaultService';

interface AmbientPanicOptions {
  readonly isVaultUnlocked: boolean;
  readonly faceDownThresholdDegrees?: number;
}

export function useAmbientPanic({
  isVaultUnlocked,
  faceDownThresholdDegrees = 15,
}: AmbientPanicOptions): { isActive: boolean; error: string | null } {
  const isUnlockedRef = useRef<boolean>(isVaultUnlocked);
  const errorRef = useRef<string | null>(null);

  useEffect(() => {
    isUnlockedRef.current = isVaultUnlocked;
  }, [isVaultUnlocked]);

  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === 'hidden' && isUnlockedRef.current && hasDeepVaultAccess()) {
      executeSoftPanic();
    }
  }, []);

  const handleOrientation = useCallback(
    (event: DeviceOrientationEvent) => {
      if (!isUnlockedRef.current || !hasDeepVaultAccess()) return;

      const { beta, gamma } = event;
      if (beta === null || gamma === null) return;

      const isBetaFlat =
        Math.abs(beta) < faceDownThresholdDegrees ||
        Math.abs(Math.abs(beta) - 180) < faceDownThresholdDegrees;
      const isGammaFlat = Math.abs(gamma) < faceDownThresholdDegrees;

      if (isBetaFlat && isGammaFlat) {
        executeSoftPanic();
      }
    },
    [faceDownThresholdDegrees]
  );

  useEffect(() => {
    if (typeof DeviceOrientationEvent === 'undefined') {
      (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> })
        .requestPermission?.()
        .catch(() => {
          errorRef.current = 'Device orientation permission denied';
        });
      return;
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('deviceorientation', handleOrientation);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [handleVisibilityChange, handleOrientation]);

  return { isActive: isUnlockedRef.current, error: errorRef.current };
}