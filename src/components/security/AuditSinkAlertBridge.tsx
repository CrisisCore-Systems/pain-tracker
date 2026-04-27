import { useEffect } from 'react';
import { useToast } from '../feedback/useToast';
import type {
  AuditSinkDegradedEventDetail,
  AuditSinkDegradedReasonCode,
} from '../../services/SecureAuditSink';

const degradedAdviceByReason: Record<AuditSinkDegradedReasonCode, string> = {
  INDEXEDDB_UNAVAILABLE:
    'This browsing mode/device does not currently allow secure IndexedDB audit persistence.',
  INIT_OPEN_FAILED:
    'Audit storage is temporarily unavailable. The app will retry automatically.',
  INIT_LOCKOUT:
    'Audit storage is in cooldown after repeated failures. Retry will resume shortly.',
  SIGNING_KEY_UNAVAILABLE:
    'The local audit signing key is unavailable. Restarting the app may restore signing.',
  QUOTA_RECOVERY_FAILED:
    'Device storage is full and audit recovery failed. Free local space to resume full audit integrity.',
  WRITE_FAILED:
    'A secure audit write failed unexpectedly. Core tracking still works locally.',
  UNKNOWN:
    'Audit persistence is degraded for an unknown local storage reason.',
};

export function AuditSinkAlertBridge() {
  const toast = useToast();

  useEffect(() => {
    const onDegraded = (event: Event) => {
      const customEvent = event as CustomEvent<AuditSinkDegradedEventDetail>;
      const reasonCode = customEvent.detail?.reasonCode || 'UNKNOWN';
      const message = degradedAdviceByReason[reasonCode] || degradedAdviceByReason.UNKNOWN;

      toast.warning(
        'Audit Logging Degraded',
        `${message} Local tracking still works, but audit integrity verification is reduced until this recovers.`
      );
    };

    const onRecovered = () => {
      toast.success('Audit Logging Recovered', 'Cryptographic audit persistence is available again.');
    };

    globalThis.addEventListener('audit-sink-degraded', onDegraded as EventListener);
    globalThis.addEventListener('audit-sink-recovered', onRecovered);

    return () => {
      globalThis.removeEventListener('audit-sink-degraded', onDegraded as EventListener);
      globalThis.removeEventListener('audit-sink-recovered', onRecovered);
    };
  }, [toast]);

  return null;
}
