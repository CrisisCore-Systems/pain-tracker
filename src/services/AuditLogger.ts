export interface AuditEvent {
  timestamp: string;
  eventType: string;
  userId?: string;
  details?: Record<string, any>;
}

export interface AuditLogger {
  log(event: AuditEvent): Promise<void>;
}

export class ConsoleAuditLogger implements AuditLogger {
  async log(event: AuditEvent) {
    // Minimal: use console.debug for local dev; replace with secure sink in production
    console.debug('[AUDIT]', JSON.stringify(event));
  }
}
