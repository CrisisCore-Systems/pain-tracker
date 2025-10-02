// ...existing code...
import { createHmac } from 'crypto';

export interface AuditEvent {
  eventId: string;
  timestamp: string;
  eventType: string;
  userIdHmac: string;
  details: Record<string, any>;
  signature?: string;
}

export interface AuditSink {
  append(event: Omit<AuditEvent, 'signature'>): Promise<AuditEvent>;
}

export class InMemoryAuditSink implements AuditSink {
  private events: AuditEvent[] = [];
  private auditKey: string;

  constructor(auditKey: string) {
    this.auditKey = auditKey;
  }

  async append(event: Omit<AuditEvent, 'signature'>): Promise<AuditEvent> {
    const serialized = JSON.stringify(event);
    const signature = createHmac('sha256', this.auditKey).update(serialized).digest('base64');
    const signed: AuditEvent = { ...event, signature };
    // append-only behaviour: push only, never allow edits
    this.events.push(signed);
    return signed;
  }

  // Helper for tests
  getEvents() {
    return [...this.events];
  }
}

export class FileAuditSink implements AuditSink {
  // Dev-only: simple append to file with signature per line.
  // Production: prefer cloud sink with object immutability.
  private path: string;
  private auditKey: string;
  private fs = require('fs');

  constructor(path: string, auditKey: string) {
    this.path = path;
    this.auditKey = auditKey;
    // ensure file exists
    if (!this.fs.existsSync(this.path)) this.fs.writeFileSync(this.path, '');
  }

  async append(event: Omit<AuditEvent, 'signature'>): Promise<AuditEvent> {
    const serialized = JSON.stringify(event);
    const signature = createHmac('sha256', this.auditKey).update(serialized).digest('base64');
    const signed: AuditEvent = { ...event, signature };
    // append as newline-delimited JSON
    this.fs.appendFileSync(this.path, JSON.stringify(signed) + '\n');
    return signed;
  }
}
