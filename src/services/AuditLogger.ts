import { secureAuditSink } from './SecureAuditSink';

export interface AuditEvent {
  timestamp: string;
  eventType: string;
  userId?: string;
  details?: Record<string, unknown>;
  // Optional signature added by sink
  signature?: string;
  // Legacy fields for compatibility
  eventId?: string;
  userIdHmac?: string;
}

export interface AuditLogger {
  log(event: AuditEvent): Promise<void>;
}

export class ProductionAuditLogger implements AuditLogger {
  async log(event: AuditEvent) {
    // 1. Log to secure sink (IndexedDB)
    try {
        await secureAuditSink.append(event);
    } catch (e) {
        console.error('Failed to persist audit log', e);
    }

    // 2. Keep console for dev debugging if needed (remove in strict prod if needed)
    if (import.meta.env.DEV) {
        console.debug('[AUDIT]', JSON.stringify(event));
    }
  }
}

export const auditLogger = new ProductionAuditLogger();
