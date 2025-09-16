// Healthcare Provider API Service
// Implements secure APIs for healthcare institutions and providers

import { FHIRBundle, FHIRPatient } from './FHIRService';
import type { PainEntry } from '../types';
import crypto from 'crypto';

export interface ProviderCredentials {
  providerId: string;
  organizationId: string;
  npi: string;  // National Provider Identifier
  apiKey: string;
  scope: ProviderScope[];
}

export interface ProviderScope {
  resource: 'Patient' | 'Observation' | 'QuestionnaireResponse' | 'Bundle';
  permissions: ('read' | 'write' | 'delete')[];
  constraints?: {
    patientIds?: string[];
    dateRange?: {
      start: string;
      end: string;
    };
  };
}

export interface PatientSummary {
  id: string;
  fhirId?: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  mrn?: string;
  lastEntryDate: string;
  totalEntries: number;
  averagePainLevel: number;
  riskLevel: 'low' | 'medium' | 'high';
  conditions: string[];
  lastSyncDate: string;
}

export interface DataSyncRequest {
  providerId: string;
  patientIds?: string[];
  since?: string;
  format: 'fhir' | 'hl7' | 'ccda';
  includeTypes: ('observations' | 'questionnaires' | 'patient-data')[];
}

export interface DataSyncResponse {
  syncId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  patientCount: number;
  recordsCount: number;
  bundle?: FHIRBundle;
  errorDetails?: string;
  downloadUrl?: string;
  expiresAt: string;
}

export interface WebhookEndpoint {
  url: string;
  events: WebhookEvent[];
  secret: string;
  active: boolean;
}

export type WebhookEvent = 
  | 'patient.created' 
  | 'patient.updated' 
  | 'observation.created' 
  | 'alert.high-risk' 
  | 'sync.completed';

export interface AlertConfiguration {
  patientId: string;
  triggers: {
    painThreshold?: number;
    noDataDays?: number;
    riskLevelChange?: boolean;
    emergencyKeywords?: string[];
  };
  actions: {
    webhook?: string;
    email?: string[];
    escalation?: {
      delay: number;
      contacts: string[];
    };
  };
}

export class HealthcareProviderAPI {
  private baseUrl: string;
  private credentials: Map<string, ProviderCredentials> = new Map();
  private webhooks: Map<string, WebhookEndpoint[]> = new Map();
  private alerts: Map<string, AlertConfiguration[]> = new Map();

  constructor(baseUrl: string = '/api/v1/healthcare') {
    this.baseUrl = baseUrl;
  }

  // Provider Authentication & Registration
  async registerProvider(credentials: ProviderCredentials): Promise<string> {
    // Validate NPI and organization credentials
    await this.validateProviderCredentials(credentials);
    
    const providerId = credentials.providerId;
    this.credentials.set(providerId, credentials);
    
    // Initialize webhook and alert storage
    this.webhooks.set(providerId, []);
    this.alerts.set(providerId, []);
    
    return providerId;
  }

  async authenticateProvider(apiKey: string): Promise<ProviderCredentials | null> {
    for (const [, creds] of this.credentials.entries()) {
      if (creds.apiKey === apiKey) {
        return creds;
      }
    }
    return null;
  }

  private async validateProviderCredentials(credentials: ProviderCredentials): Promise<boolean> {
    // Implement NPI verification against CMS database
    // Validate organization credentials
    // Check licensing status
    console.log('Validating credentials for provider:', credentials.providerId);
    return true; // Simplified for demo
  }

  // Patient Data Access
  async getPatients(providerId: string, filters?: {
    since?: string;
    riskLevel?: string;
    active?: boolean;
  }): Promise<PatientSummary[]> {
    const credentials = this.credentials.get(providerId);
    if (!credentials) {
      throw new Error('Invalid provider credentials');
    }

    this.validateScope(credentials, 'Patient', 'read');

    // Mock patient data - would integrate with actual patient database
    const allPatients = [
      {
        id: 'patient-001',
        fhirId: 'Patient/001',
        name: 'John Doe',
        dateOfBirth: '1975-06-15',
        gender: 'male',
        mrn: 'MRN-12345',
        lastEntryDate: '2025-09-14T10:30:00Z',
        totalEntries: 45,
        averagePainLevel: 5.2,
        riskLevel: 'medium' as const,
        conditions: ['Chronic back pain', 'Arthritis'],
        lastSyncDate: '2025-09-15T08:00:00Z'
      },
      {
        id: 'patient-002',
        fhirId: 'Patient/002', 
        name: 'Jane Smith',
        dateOfBirth: '1982-03-22',
        gender: 'female',
        mrn: 'MRN-67890',
        lastEntryDate: '2025-09-15T09:15:00Z',
        totalEntries: 78,
        averagePainLevel: 7.8,
        riskLevel: 'high' as const,
        conditions: ['Fibromyalgia', 'Migraines'],
        lastSyncDate: '2025-09-15T08:00:00Z'
      }
    ];

    // Apply filters if provided
    let filteredPatients = allPatients;
    
    if (filters?.riskLevel) {
      filteredPatients = filteredPatients.filter(p => p.riskLevel === filters.riskLevel);
    }
    
    if (filters?.since) {
      const sinceDate = new Date(filters.since);
      filteredPatients = filteredPatients.filter(p => new Date(p.lastEntryDate) > sinceDate);
    }
    
    if (filters?.active !== undefined) {
      // For demo purposes, consider all patients active
      // In real implementation, this would check patient active status
      if (!filters.active) {
        filteredPatients = [];
      }
    }

    return filteredPatients;
  }

  async getPatientData(providerId: string, patientId: string, format: 'fhir' | 'summary' = 'fhir'): Promise<FHIRBundle | PatientSummary> {
    const credentials = this.credentials.get(providerId);
    if (!credentials) {
      throw new Error('Invalid provider credentials');
    }

    this.validateScope(credentials, 'Patient', 'read');
    this.validatePatientAccess(credentials, patientId);

    if (format === 'summary') {
      const patients = await this.getPatients(providerId);
      const patient = patients.find(p => p.id === patientId);
      if (!patient) {
        throw new Error('Patient not found');
      }
      return patient;
    }

    // Return FHIR bundle with patient data and related observations
    return this.createPatientBundle(patientId);
  }

  // Data Synchronization
  async requestDataSync(request: DataSyncRequest): Promise<DataSyncResponse> {
    const credentials = this.credentials.get(request.providerId);
    if (!credentials) {
      throw new Error('Invalid provider credentials');
    }

    const syncId = `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Process sync request asynchronously
    setTimeout(() => this.processDataSync(syncId, request), 100);

    return {
      syncId,
      status: 'pending',
      patientCount: request.patientIds?.length || 0,
      recordsCount: 0,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };
  }

  async getSyncStatus(syncId: string): Promise<DataSyncResponse> {
    // In a real implementation, this would check the actual sync status
    return {
      syncId,
      status: 'completed',
      patientCount: 2,
      recordsCount: 123,
      downloadUrl: `/api/v1/healthcare/sync/${syncId}/download`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
  }

  private async processDataSync(syncId: string, request: DataSyncRequest): Promise<void> {
    try {
      // Collect patient data based on request parameters
      const bundle = await this.createSyncBundle(request);
      
      // Store bundle for download
      // In a real implementation, this would be stored in secure cloud storage
      
      // Trigger webhook if configured
      await this.triggerWebhook(request.providerId, 'sync.completed', {
        syncId,
        status: 'completed',
        patientCount: bundle.total || 0
      });
    } catch (error) {
      await this.triggerWebhook(request.providerId, 'sync.completed', {
        syncId,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Real-time Data Streaming
  async subscribeToPatientUpdates(providerId: string, patientIds: string[]): Promise<EventSource> {
    const credentials = this.credentials.get(providerId);
    if (!credentials) {
      throw new Error('Invalid provider credentials');
    }

    // Validate access to all requested patients
    patientIds.forEach(patientId => {
      this.validatePatientAccess(credentials, patientId);
    });

    // Create SSE connection for real-time updates
    const eventSource = new EventSource(`${this.baseUrl}/stream/${providerId}?patients=${patientIds.join(',')}`);
    return eventSource;
  }

  // Webhook Management
  async registerWebhook(providerId: string, endpoint: WebhookEndpoint): Promise<string> {
    const credentials = this.credentials.get(providerId);
    if (!credentials) {
      throw new Error('Invalid provider credentials');
    }

    const webhooks = this.webhooks.get(providerId) || [];
    webhooks.push(endpoint);
    this.webhooks.set(providerId, webhooks);

    return `webhook-${Date.now()}`;
  }

  async triggerWebhook(providerId: string, event: WebhookEvent, data: Record<string, unknown>): Promise<void> {
    const webhooks = this.webhooks.get(providerId) || [];
    
    for (const webhook of webhooks) {
      if (webhook.active && webhook.events.includes(event)) {
        try {
          await fetch(webhook.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Webhook-Signature': this.generateWebhookSignature(data, webhook.secret)
            },
            body: JSON.stringify({
              event,
              data,
              timestamp: new Date().toISOString(),
              providerId
            })
          });
        } catch (error) {
          console.error(`Failed to trigger webhook: ${webhook.url}`, error);
        }
      }
    }
  }

  // Alert Management
  async configureAlert(providerId: string, config: AlertConfiguration): Promise<string> {
    const credentials = this.credentials.get(providerId);
    if (!credentials) {
      throw new Error('Invalid provider credentials');
    }

    this.validatePatientAccess(credentials, config.patientId);

    const alerts = this.alerts.get(providerId) || [];
    alerts.push(config);
    this.alerts.set(providerId, alerts);

    return `alert-${Date.now()}`;
  }

  async processAlerts(patientId: string, painEntry: PainEntry): Promise<void> {
    // Check all configured alerts for this patient
    for (const [providerId, alerts] of this.alerts.entries()) {
      const patientAlerts = alerts.filter(alert => alert.patientId === patientId);
      
      for (const alert of patientAlerts) {
        if (this.shouldTriggerAlert(alert, painEntry)) {
          await this.triggerAlert(providerId, alert, painEntry);
        }
      }
    }
  }

  private shouldTriggerAlert(alert: AlertConfiguration, painEntry: PainEntry): boolean {
    const { triggers } = alert;
    
    if (triggers.painThreshold && painEntry.baselineData.pain >= triggers.painThreshold) {
      return true;
    }
    
    if (triggers.emergencyKeywords && painEntry.notes) {
      const hasEmergencyKeyword = triggers.emergencyKeywords.some(keyword =>
        painEntry.notes?.toLowerCase().includes(keyword.toLowerCase())
      );
      if (hasEmergencyKeyword) {
        return true;
      }
    }
    
    return false;
  }

  private async triggerAlert(providerId: string, alert: AlertConfiguration, painEntry: PainEntry): Promise<void> {
    const alertData = {
      patientId: alert.patientId,
      painLevel: painEntry.baselineData.pain,
      timestamp: painEntry.timestamp,
      notes: painEntry.notes,
      severity: painEntry.baselineData.pain >= 8 ? 'critical' : 'warning'
    };

    if (alert.actions.webhook) {
      await this.triggerWebhook(providerId, 'alert.high-risk', alertData);
    }

    // Handle email notifications and escalation
    // Implementation would include email service integration
  }

  // Utility Methods
  private validateScope(credentials: ProviderCredentials, resource: string, permission: string): void {
    const scope = credentials.scope.find(s => s.resource === resource);
    if (!scope || !scope.permissions.includes(permission as 'read' | 'write' | 'delete')) {
      throw new Error(`Insufficient permissions for ${permission} on ${resource}`);
    }
  }

  private validatePatientAccess(credentials: ProviderCredentials, patientId: string): void {
    const patientScope = credentials.scope.find(s => s.resource === 'Patient');
    if (patientScope?.constraints?.patientIds && 
        !patientScope.constraints.patientIds.includes(patientId)) {
      throw new Error('Access denied for patient');
    }
  }

  private async createPatientBundle(patientId: string): Promise<FHIRBundle> {
    // Create FHIR bundle with patient data and related resources
    const patientResource: FHIRPatient = {
      resourceType: 'Patient',
      id: patientId,
      identifier: [{
        system: 'http://paintracker.app/patient-id',
        value: patientId
      }],
      name: [{
        text: 'Patient Name'
      }],
      gender: 'unknown'
    };

    return {
      resourceType: 'Bundle',
      type: 'searchset',
      timestamp: new Date().toISOString(),
      total: 1,
      entry: [
        {
          fullUrl: `Patient/${patientId}`,
          resource: patientResource
        }
      ]
    };
  }

  private async createSyncBundle(request: DataSyncRequest): Promise<FHIRBundle> {
    // Create comprehensive sync bundle based on request parameters
    console.log('Creating sync bundle for provider:', request.providerId);
    return {
      resourceType: 'Bundle',
      type: 'collection',
      timestamp: new Date().toISOString(),
      total: 0,
      entry: []
    };
  }

  private generateWebhookSignature(data: Record<string, unknown>, secret: string): string {
    // Implement HMAC signature generation for webhook security
    const payload = JSON.stringify(data);
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }
}

// Export singleton instance
export const healthcareProviderAPI = new HealthcareProviderAPI();
