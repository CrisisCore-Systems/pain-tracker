export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: 'admin' | 'physician' | 'nurse' | 'system';
  action: 'view' | 'create' | 'update' | 'delete' | 'export' | 'login' | 'logout' | 'access_phi';
  resourceType: 'patient' | 'report' | 'appointment' | 'system' | 'compliance_log';
  resourceId?: string;
  details: string;
  ipAddress: string;
  status: 'success' | 'failure' | 'warning';
  metadata?: Record<string, unknown>;
}
