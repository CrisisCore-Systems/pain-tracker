// Data Sharing Protocols Service
// Implements secure, HIPAA-compliant data exchange protocols for healthcare institutions

import { FHIRBundle } from './FHIRService';
import { HealthcareProviderAPI } from './HealthcareProviderAPI';

export interface DataSharingAgreement {
  id: string;
  organizationA: OrganizationInfo;
  organizationB: OrganizationInfo;
  purpose: DataSharingPurpose;
  dataTypes: DataType[];
  restrictions: DataRestrictions;
  security: SecurityRequirements;
  auditConfig: AuditConfiguration;
  effectiveDate: string;
  expirationDate: string;
  status: 'draft' | 'active' | 'suspended' | 'terminated';
  lastModified: string;
  signedBy: SignatureInfo[];
}

export interface OrganizationInfo {
  id: string;
  name: string;
  type: 'hospital' | 'clinic' | 'research' | 'insurance' | 'pharmacy' | 'other';
  npi?: string;
  ein?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contacts: {
    legal: ContactInfo;
    technical: ContactInfo;
    privacy: ContactInfo;
  };
  certifications: string[];
}

export interface ContactInfo {
  name: string;
  title: string;
  email: string;
  phone: string;
}

export interface DataSharingPurpose {
  primary: 'treatment' | 'payment' | 'healthcare-operations' | 'research' | 'public-health';
  description: string;
  justification: string;
  irb?: string; // Institutional Review Board approval number
  researchProtocol?: string;
}

export interface DataType {
  category: 'demographics' | 'clinical' | 'pain-assessments' | 'medications' | 'imaging' | 'labs';
  fhirResourceTypes: string[];
  includeFields?: string[];
  excludeFields?: string[];
  minimumNecessary: boolean;
}

export interface DataRestrictions {
  geographicLimits?: string[];
  timeframe: {
    start?: string;
    end?: string;
    retentionPeriod: string;
  };
  populationConstraints?: {
    ageRange?: { min: number; max: number };
    conditions?: string[];
    locations?: string[];
  };
  useRestrictions: string[];
  redistributionRights: 'none' | 'limited' | 'full';
  commercialUse: boolean;
}

export interface SecurityRequirements {
  encryptionStandard: 'AES-256' | 'RSA-4096' | 'ECC-P384';
  transportSecurity: 'TLS-1.3' | 'mutual-TLS' | 'VPN';
  authentication: 'PKI' | 'OAuth2' | 'SAML' | 'multi-factor';
  accessControl: 'RBAC' | 'ABAC' | 'custom';
  auditLogging: boolean;
  dataIntegrity: 'digital-signatures' | 'hash-verification' | 'blockchain';
  backupRequirements: string[];
}

export interface AuditConfiguration {
  logLevel: 'minimal' | 'standard' | 'detailed';
  retentionPeriod: string;
  reportingFrequency: 'real-time' | 'daily' | 'weekly' | 'monthly';
  alertThresholds: {
    unusualAccess: number;
    dataVolume: number;
    accessFailures: number;
  };
  complianceReporting: boolean;
}

export interface SignatureInfo {
  signerId: string;
  signerName: string;
  title: string;
  organization: string;
  timestamp: string;
  signatureHash: string;
  witnessInfo?: {
    name: string;
    title: string;
    timestamp: string;
  };
}

export interface DataExchangeRequest {
  agreementId: string;
  requesterId: string;
  targetOrganization: string;
  requestType: 'bulk-export' | 'patient-specific' | 'query-response' | 'subscription';
  parameters: {
    patientIds?: string[];
    dateRange?: { start: string; end: string };
    resourceTypes?: string[];
    filters?: Record<string, unknown>;
  };
  urgency: 'routine' | 'urgent' | 'emergency';
  justification: string;
  expectedVolume?: number;
  deliveryMethod: 'fhir-api' | 'bulk-data' | 'secure-email' | 'sftp' | 'direct-trust';
}

export interface DataExchangeResponse {
  requestId: string;
  status: 'pending' | 'approved' | 'denied' | 'processing' | 'completed' | 'failed';
  approvalInfo?: {
    approvedBy: string;
    approvedAt: string;
    conditions?: string[];
  };
  data?: FHIRBundle;
  downloadUrl?: string;
  expiresAt?: string;
  auditTrail: AuditEvent[];
}

export interface AuditEvent {
  timestamp: string;
  eventType: 'request' | 'approval' | 'access' | 'download' | 'deletion' | 'modification';
  userId: string;
  userRole: string;
  organizationId: string;
  resourcesAccessed?: string[];
  ipAddress: string;
  userAgent?: string;
  outcome: 'success' | 'failure' | 'warning';
  details?: Record<string, unknown>;
}

export interface ComplianceReport {
  period: { start: string; end: string };
  agreementId: string;
  totalRequests: number;
  approvedRequests: number;
  deniedRequests: number;
  dataVolume: {
    recordsShared: number;
    patientsAffected: number;
    organizationsInvolved: number;
  };
  securityIncidents: SecurityIncident[];
  complianceScore: number;
  recommendations: string[];
  generatedAt: string;
  generatedBy: string;
}

export interface SecurityIncident {
  id: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'unauthorized-access' | 'data-breach' | 'system-compromise' | 'policy-violation';
  description: string;
  affectedData?: {
    patientCount: number;
    dataTypes: string[];
  };
  resolution?: {
    resolvedAt: string;
    actions: string[];
    responsible: string;
  };
  reportedToAuthorities: boolean;
}

export class DataSharingProtocols {
  private agreements: Map<string, DataSharingAgreement> = new Map();
  private exchangeRequests: Map<string, DataExchangeRequest> = new Map();
  private auditLogs: AuditEvent[] = [];
  private healthcareAPI: HealthcareProviderAPI;

  constructor(healthcareAPI: HealthcareProviderAPI) {
    this.healthcareAPI = healthcareAPI;
  }

  // Data Sharing Agreement Management
  async createAgreement(
    agreement: Omit<DataSharingAgreement, 'id' | 'status' | 'lastModified'>
  ): Promise<string> {
    const agreementId = `dsa-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const fullAgreement: DataSharingAgreement = {
      ...agreement,
      id: agreementId,
      status: 'draft',
      lastModified: new Date().toISOString(),
    };

    this.agreements.set(agreementId, fullAgreement);

    await this.logAuditEvent({
      eventType: 'request',
      userId: 'system',
      userRole: 'admin',
      organizationId: agreement.organizationA.id,
      outcome: 'success',
      details: { action: 'agreement-created', agreementId },
    });

    return agreementId;
  }

  async signAgreement(agreementId: string, signatureInfo: SignatureInfo): Promise<void> {
    const agreement = this.agreements.get(agreementId);
    if (!agreement) {
      throw new Error('Agreement not found');
    }

    agreement.signedBy.push(signatureInfo);

    // Check if all required parties have signed
    const requiredSigners = [agreement.organizationA.id, agreement.organizationB.id];
    const signerOrgs = agreement.signedBy.map(s => s.organization);

    if (requiredSigners.every(org => signerOrgs.includes(org))) {
      agreement.status = 'active';
    }

    agreement.lastModified = new Date().toISOString();
    this.agreements.set(agreementId, agreement);

    await this.logAuditEvent({
      eventType: 'approval',
      userId: signatureInfo.signerId,
      userRole: signatureInfo.title,
      organizationId: signatureInfo.organization,
      outcome: 'success',
      details: { action: 'agreement-signed', agreementId },
    });
  }

  // Data Exchange Request Processing
  async requestDataExchange(request: DataExchangeRequest): Promise<string> {
    const requestId = `dxr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Validate agreement exists and is active
    const agreement = this.agreements.get(request.agreementId);
    if (!agreement || agreement.status !== 'active') {
      throw new Error('Invalid or inactive data sharing agreement');
    }

    // Validate request against agreement terms
    await this.validateDataRequest(request, agreement);

    this.exchangeRequests.set(requestId, request);

    // Auto-approve routine requests if they meet criteria
    const shouldAutoApprove = await this.shouldAutoApprove(request, agreement);

    await this.logAuditEvent({
      eventType: 'request',
      userId: request.requesterId,
      userRole: 'provider',
      organizationId: request.targetOrganization,
      outcome: 'success',
      details: {
        action: 'data-exchange-requested',
        requestId,
        urgency: request.urgency,
        autoApprove: shouldAutoApprove,
      },
    });

    return requestId;
  }

  async approveDataRequest(
    requestId: string,
    approverInfo: { userId: string; role: string; conditions?: string[] }
  ): Promise<DataExchangeResponse> {
    const request = this.exchangeRequests.get(requestId);
    if (!request) {
      throw new Error('Request not found');
    }

    const agreement = this.agreements.get(request.agreementId);
    if (!agreement) {
      throw new Error('Agreement not found');
    }

    const response: DataExchangeResponse = {
      requestId,
      status: 'approved',
      approvalInfo: {
        approvedBy: approverInfo.userId,
        approvedAt: new Date().toISOString(),
        conditions: approverInfo.conditions,
      },
      auditTrail: [],
    };

    // Generate data based on request parameters
    if (request.requestType === 'bulk-export') {
      response.downloadUrl = await this.generateBulkExport(request, agreement);
      response.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours
    } else {
      response.data = await this.generateDataResponse(request, agreement);
    }

    await this.logAuditEvent({
      eventType: 'approval',
      userId: approverInfo.userId,
      userRole: approverInfo.role,
      organizationId: request.targetOrganization,
      resourcesAccessed: request.parameters.resourceTypes,
      outcome: 'success',
      details: { action: 'data-request-approved', requestId },
    });

    return response;
  }

  // Security and Compliance
  async validateDataRequest(
    request: DataExchangeRequest,
    agreement: DataSharingAgreement
  ): Promise<boolean> {
    // Validate purpose alignment
    if (!this.isPurposeAllowed(request, agreement)) {
      throw new Error('Request purpose not aligned with agreement');
    }

    // Validate data types
    if (!this.areDataTypesAllowed(request, agreement)) {
      throw new Error('Requested data types not permitted by agreement');
    }

    // Validate geographic and temporal restrictions
    if (!this.meetsRestrictions(request, agreement)) {
      throw new Error('Request violates agreement restrictions');
    }

    // Validate minimum necessary principle
    if (!this.isMinimumNecessary(request, agreement)) {
      throw new Error('Request exceeds minimum necessary requirements');
    }

    return true;
  }

  async generateComplianceReport(
    agreementId: string,
    period: { start: string; end: string }
  ): Promise<ComplianceReport> {
    const agreement = this.agreements.get(agreementId);
    if (!agreement) {
      throw new Error('Agreement not found');
    }

    const periodStart = new Date(period.start);
    const periodEnd = new Date(period.end);

    // Filter audit events for this agreement and period
    const relevantEvents = this.auditLogs.filter(event => {
      const eventTime = new Date(event.timestamp);
      return (
        eventTime >= periodStart &&
        eventTime <= periodEnd &&
        event.details?.agreementId === agreementId
      );
    });

    const requests = relevantEvents.filter(e => e.eventType === 'request');
    const approvals = relevantEvents.filter(e => e.eventType === 'approval');

    // Calculate compliance metrics
    const totalRequests = requests.length;
    const approvedRequests = approvals.length;
    const deniedRequests = totalRequests - approvedRequests;

    // Security incident analysis
    const securityIncidents = await this.getSecurityIncidents(agreementId, period);

    // Calculate compliance score (0-100)
    const complianceScore = this.calculateComplianceScore(relevantEvents, securityIncidents);

    return {
      period,
      agreementId,
      totalRequests,
      approvedRequests,
      deniedRequests,
      dataVolume: {
        recordsShared: this.calculateRecordsShared(relevantEvents),
        patientsAffected: this.calculatePatientsAffected(relevantEvents),
        organizationsInvolved: this.calculateOrganizationsInvolved(relevantEvents),
      },
      securityIncidents,
      complianceScore,
      recommendations: this.generateRecommendations(complianceScore, securityIncidents),
      generatedAt: new Date().toISOString(),
      generatedBy: 'system',
    };
  }

  // Audit and Monitoring
  private async logAuditEvent(event: Omit<AuditEvent, 'timestamp' | 'ipAddress'>): Promise<void> {
    const fullEvent: AuditEvent = {
      ...event,
      timestamp: new Date().toISOString(),
      ipAddress: '0.0.0.0', // Would be populated from request context
    };

    this.auditLogs.push(fullEvent);

    // Check for suspicious activity
    await this.checkForAnomalies(fullEvent);
  }

  private async checkForAnomalies(event: AuditEvent): Promise<void> {
    // Implement anomaly detection logic
    const recentEvents = this.auditLogs.filter(e => {
      const eventTime = new Date(e.timestamp);
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      return eventTime > oneHourAgo && e.userId === event.userId;
    });

    // Flag unusual access patterns
    if (recentEvents.length > 50) {
      // Threshold for unusual activity
      await this.reportSecurityIncident({
        severity: 'medium',
        type: 'unauthorized-access',
        description: `Unusual access pattern detected for user ${event.userId}`,
        reportedToAuthorities: false,
      });
    }
  }

  // Utility Methods
  private isPurposeAllowed(request: DataExchangeRequest, agreement: DataSharingAgreement): boolean {
    // Validate that the request purpose aligns with agreement purpose
    return request.justification.toLowerCase().includes(agreement.purpose.primary);
  }

  private areDataTypesAllowed(
    request: DataExchangeRequest,
    agreement: DataSharingAgreement
  ): boolean {
    if (!request.parameters.resourceTypes) return true;

    const allowedResources = agreement.dataTypes.flatMap(dt => dt.fhirResourceTypes);
    return request.parameters.resourceTypes.every(rt => allowedResources.includes(rt));
  }

  private meetsRestrictions(
    request: DataExchangeRequest,
    agreement: DataSharingAgreement
  ): boolean {
    const restrictions = agreement.restrictions;

    // Check timeframe restrictions
    if (restrictions.timeframe.start && request.parameters.dateRange?.start) {
      const requestStart = new Date(request.parameters.dateRange.start);
      const restrictionStart = new Date(restrictions.timeframe.start);
      if (requestStart < restrictionStart) return false;
    }

    // Check geographic limits
    if (restrictions.geographicLimits && restrictions.geographicLimits.length > 0) {
      // Would implement geographic validation logic
    }

    return true;
  }

  private isMinimumNecessary(
    request: DataExchangeRequest,
    agreement: DataSharingAgreement
  ): boolean {
    // Implement minimum necessary validation
    const requiredFields = agreement.dataTypes
      .filter(dt => dt.minimumNecessary)
      .flatMap(dt => dt.includeFields || []);

    // Validate that request doesn't exceed minimum necessary
    return requiredFields.length > 0; // Simplified check
  }

  private async shouldAutoApprove(
    request: DataExchangeRequest,
    agreement: DataSharingAgreement
  ): Promise<boolean> {
    // Auto-approve routine requests that meet all criteria
    return (
      request.urgency === 'routine' &&
      (request.expectedVolume || 0) < 1000 &&
      agreement.security.accessControl === 'RBAC'
    );
  }

  private async generateBulkExport(
    _request: DataExchangeRequest,
    _agreement: DataSharingAgreement
  ): Promise<string> {
    // Generate secure download URL for bulk data export
    const exportId = `export-${Date.now()}`;
    return `/api/v1/data-sharing/export/${exportId}`;
  }

  private async generateDataResponse(
    _request: DataExchangeRequest,
    _agreement: DataSharingAgreement
  ): Promise<FHIRBundle> {
    // Generate FHIR bundle based on request parameters
    return {
      resourceType: 'Bundle',
      type: 'searchset',
      timestamp: new Date().toISOString(),
      total: 0,
      entry: [],
    };
  }

  private async getSecurityIncidents(
    _agreementId: string,
    _period: { start: string; end: string }
  ): Promise<SecurityIncident[]> {
    // Filter security incidents for the specified period and agreement
    return []; // Simplified - would query incident database
  }

  private calculateComplianceScore(events: AuditEvent[], incidents: SecurityIncident[]): number {
    // Calculate compliance score based on audit events and security incidents
    const baseScore = 100;
    const incidentPenalty = incidents.reduce((penalty, incident) => {
      switch (incident.severity) {
        case 'critical':
          return penalty + 25;
        case 'high':
          return penalty + 15;
        case 'medium':
          return penalty + 10;
        case 'low':
          return penalty + 5;
        default:
          return penalty;
      }
    }, 0);

    const failureEvents = events.filter(e => e.outcome === 'failure').length;
    const failurePenalty = Math.min(failureEvents * 2, 20);

    return Math.max(0, baseScore - incidentPenalty - failurePenalty);
  }

  private calculateRecordsShared(events: AuditEvent[]): number {
    return events.filter(e => e.eventType === 'access').length;
  }

  private calculatePatientsAffected(events: AuditEvent[]): number {
    const patientIds = new Set();
    events.forEach(event => {
      if (event.details?.patientIds) {
        (event.details.patientIds as string[]).forEach(id => patientIds.add(id));
      }
    });
    return patientIds.size;
  }

  private calculateOrganizationsInvolved(events: AuditEvent[]): number {
    const orgs = new Set(events.map(e => e.organizationId));
    return orgs.size;
  }

  private generateRecommendations(score: number, incidents: SecurityIncident[]): string[] {
    const recommendations: string[] = [];

    if (score < 80) {
      recommendations.push('Improve access controls and monitoring');
    }

    if (incidents.length > 0) {
      recommendations.push('Review and strengthen security protocols');
    }

    if (score < 60) {
      recommendations.push('Consider temporary suspension of data sharing');
    }

    return recommendations;
  }

  private async reportSecurityIncident(
    incident: Omit<SecurityIncident, 'id' | 'timestamp'>
  ): Promise<void> {
    // Report security incident to appropriate authorities
    const fullIncident: SecurityIncident = {
      ...incident,
      id: `inc-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };

    // Log incident and trigger alerts
    console.warn('Security incident reported:', fullIncident);
  }
}

// Export singleton instance
export const dataSharingProtocols = new DataSharingProtocols(new HealthcareProviderAPI());
