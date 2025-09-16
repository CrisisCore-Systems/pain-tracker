// HIPAA Compliance and Data Validation Service
// Ensures healthcare data handling meets HIPAA requirements and validates data integrity

import { FHIRResource, FHIRBundle } from './FHIRService';

export interface HIPAAComplianceConfig {
  organizationId: string;
  privacyOfficer: ContactInfo;
  securityOfficer: ContactInfo;
  complianceOfficer: ContactInfo;
  businessAssociates: BusinessAssociate[];
  policies: CompliancePolicy[];
  technicalSafeguards: TechnicalSafeguards;
  physicalSafeguards: PhysicalSafeguards;
  administrativeSafeguards: AdministrativeSafeguards;
}

export interface ContactInfo {
  name: string;
  title: string;
  email: string;
  phone: string;
  address?: string;
}

export interface BusinessAssociate {
  id: string;
  name: string;
  serviceType: string;
  contractDate: string;
  expirationDate: string;
  contactInfo: ContactInfo;
  dataTypes: string[];
  safeguardRequirements: string[];
  status: 'active' | 'suspended' | 'terminated';
}

export interface CompliancePolicy {
  id: string;
  name: string;
  category: 'privacy' | 'security' | 'breach' | 'access' | 'training';
  description: string;
  requirements: string[];
  procedures: string[];
  lastReview: string;
  nextReview: string;
  approvedBy: string;
  version: string;
}

export interface TechnicalSafeguards {
  accessControl: {
    uniqueUserIdentification: boolean;
    automaticLogoff: boolean;
    encryptionDecryption: boolean;
  };
  auditControls: {
    hardwareSystemsAccess: boolean;
    softwareSystemsAccess: boolean;
    activityReviews: boolean;
  };
  integrity: {
    protectionFromAlteration: boolean;
    protectionFromDestruction: boolean;
  };
  personOrEntityAuthentication: {
    verifyUserIdentity: boolean;
  };
  transmissionSecurity: {
    guardAgainstUnauthorizedAccess: boolean;
    dataIntegrityControls: boolean;
    encryptionStandards: string[];
  };
}

export interface PhysicalSafeguards {
  facilityAccessControls: {
    limitPhysicalAccess: boolean;
    workstationAccess: boolean;
    mediaControls: boolean;
  };
  workstationUse: {
    limitedAccess: boolean;
    physicalAttributes: string[];
  };
  deviceMediaControls: {
    disposalProcedures: boolean;
    reuseProtocols: boolean;
    accountabilityMeasures: boolean;
    dataBackupStorage: boolean;
  };
}

export interface AdministrativeSafeguards {
  securityManagement: {
    securityOfficerAssigned: boolean;
    managementResponsibilities: string[];
  };
  workforceTraining: {
    privacyTraining: boolean;
    securityTraining: boolean;
    trainingFrequency: string;
    lastCompleted: string;
  };
  accessManagement: {
    accessAuthorizationProcedures: boolean;
    accessEstablishmentModification: boolean;
    accessTerminationProcedures: boolean;
  };
  contingencyPlan: {
    dataBackupPlan: boolean;
    disasterRecoveryPlan: boolean;
    emergencyModeOperationPlan: boolean;
    dataRecoveryPlan: boolean;
  };
  businessAssociateContracts: {
    writtenContracts: boolean;
    safeguardRequirements: boolean;
  };
}

export interface PHIIdentifier {
  type: 'name' | 'address' | 'date' | 'phone' | 'fax' | 'email' | 'ssn' | 'mrn' | 'account' | 'certificate' | 'vehicle' | 'device' | 'url' | 'ip' | 'biometric' | 'photo' | 'other';
  value: string;
  location: string;
  confidence: number;
}

export interface DeidentificationResult {
  originalData: unknown;
  deidentifiedData: unknown;
  identifiersRemoved: PHIIdentifier[];
  method: 'safe-harbor' | 'expert-determination' | 'limited-dataset';
  timestamp: string;
  processedBy: string;
}

export interface BreachAssessment {
  incidentId: string;
  reportedDate: string;
  discoveredDate: string;
  description: string;
  phiInvolved: {
    recordCount: number;
    patientCount: number;
    dataTypes: string[];
  };
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  containmentMeasures: string[];
  notificationRequired: boolean;
  authoritiesNotified: boolean;
  patientsNotified: boolean;
  investigationStatus: 'open' | 'pending' | 'closed';
  remedialActions: string[];
}

export interface AccessRequest {
  requestId: string;
  requesterId: string;
  requesterRole: string;
  patientId: string;
  dataTypes: string[];
  purpose: string;
  urgency: 'routine' | 'urgent' | 'emergency';
  requestDate: string;
  approvalStatus: 'pending' | 'approved' | 'denied' | 'conditionally-approved';
  approvedBy?: string;
  approvalDate?: string;
  conditions?: string[];
  expirationDate?: string;
}

export interface AuditTrail {
  eventId: string;
  timestamp: string;
  userId: string;
  userRole: string;
  actionType: 'create' | 'read' | 'update' | 'delete' | 'export' | 'print' | 'access' | 'login' | 'logout';
  resourceType: string;
  resourceId?: string;
  patientId?: string;
  ipAddress: string;
  userAgent: string;
  outcome: 'success' | 'failure' | 'warning';
  details?: Record<string, unknown>;
  riskScore: number;
}

export class HIPAAComplianceService {
  private config: HIPAAComplianceConfig;
  private auditTrails: AuditTrail[] = [];
  private accessRequests: Map<string, AccessRequest> = new Map();
  private breachAssessments: Map<string, BreachAssessment> = new Map();

  constructor(config: HIPAAComplianceConfig) {
    this.config = config;
  }

  // Data Validation and Sanitization
  async validateFHIRResource(resource: FHIRResource): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
    complianceScore: number;
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate required FHIR fields
    if (!resource.resourceType) {
      errors.push('Missing required field: resourceType');
    }

    // Validate data integrity
    if (resource.id && !this.isValidId(resource.id)) {
      errors.push('Invalid resource ID format');
    }

    // Check for potential PHI in inappropriate fields
    const phiCheck = await this.scanForPHI(resource);
    if (phiCheck.identifiers.length > 0) {
      warnings.push(`Potential PHI detected in ${phiCheck.identifiers.length} fields`);
    }

    // Validate timestamps
    if (resource.meta?.lastUpdated && !this.isValidTimestamp(resource.meta.lastUpdated)) {
      errors.push('Invalid lastUpdated timestamp');
    }

    const complianceScore = this.calculateComplianceScore(errors, warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      complianceScore
    };
  }

  async validateFHIRBundle(bundle: FHIRBundle): Promise<{
    isValid: boolean;
    resourceResults: Array<{ resourceId?: string; isValid: boolean; errors: string[]; warnings: string[] }>;
    overallErrors: string[];
    complianceScore: number;
  }> {
    const overallErrors: string[] = [];
    const resourceResults = [];

    // Validate bundle structure
    if (!bundle.type) {
      overallErrors.push('Bundle missing required type field');
    }

    if (bundle.entry) {
      for (let i = 0; i < bundle.entry.length; i++) {
        const entry = bundle.entry[i];
        if (entry.resource) {
          const validation = await this.validateFHIRResource(entry.resource);
          resourceResults.push({
            resourceId: entry.resource.id,
            isValid: validation.isValid,
            errors: validation.errors,
            warnings: validation.warnings
          });
        }
      }
    }

    const totalErrors = overallErrors.length + resourceResults.reduce((sum, r) => sum + r.errors.length, 0);
    const complianceScore = Math.max(0, 100 - (totalErrors * 10));

    return {
      isValid: overallErrors.length === 0 && resourceResults.every(r => r.isValid),
      resourceResults,
      overallErrors,
      complianceScore
    };
  }

  // PHI Detection and De-identification
  async scanForPHI(data: unknown): Promise<{ identifiers: PHIIdentifier[]; riskLevel: 'low' | 'medium' | 'high' }> {
    const identifiers: PHIIdentifier[] = [];
    const dataStr = JSON.stringify(data);

    // Regular expressions for common PHI patterns
    const patterns = {
      ssn: /\b\d{3}-?\d{2}-?\d{4}\b/g,
      phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
      email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      ipAddress: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
      creditCard: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
      zipCode: /\b\d{5}(?:-\d{4})?\b/g
    };

    // Scan for patterns
    for (const [type, pattern] of Object.entries(patterns)) {
      const matches = dataStr.match(pattern);
      if (matches) {
        matches.forEach(match => {
          identifiers.push({
            type: type as PHIIdentifier['type'],
            value: match,
            location: 'data',
            confidence: 0.8
          });
        });
      }
    }

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (identifiers.length > 10) {
      riskLevel = 'high';
    } else if (identifiers.length > 3) {
      riskLevel = 'medium';
    }

    return { identifiers, riskLevel };
  }

  async deidentifyData(data: unknown, method: 'safe-harbor' | 'expert-determination' | 'limited-dataset' = 'safe-harbor'): Promise<DeidentificationResult> {
    const originalData = JSON.parse(JSON.stringify(data));
    const deidentifiedData = JSON.parse(JSON.stringify(data));
    const identifiersRemoved: PHIIdentifier[] = [];

    // Apply de-identification based on method
    if (method === 'safe-harbor') {
      const scanResult = await this.scanForPHI(deidentifiedData);
      identifiersRemoved.push(...scanResult.identifiers);

      // Remove or mask identified PHI
      let dataStr = JSON.stringify(deidentifiedData);
      scanResult.identifiers.forEach(identifier => {
        dataStr = dataStr.replace(new RegExp(this.escapeRegExp(identifier.value), 'g'), '[REDACTED]');
      });

      try {
        Object.assign(deidentifiedData, JSON.parse(dataStr));
      } catch {
        // Handle JSON parsing errors
      }
    }

    return {
      originalData,
      deidentifiedData,
      identifiersRemoved,
      method,
      timestamp: new Date().toISOString(),
      processedBy: 'hipaa-compliance-service'
    };
  }

  // Access Control and Authorization
  async requestDataAccess(request: Omit<AccessRequest, 'requestId' | 'requestDate' | 'approvalStatus'>): Promise<string> {
    const requestId = `ar-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const accessRequest: AccessRequest = {
      ...request,
      requestId,
      requestDate: new Date().toISOString(),
      approvalStatus: 'pending'
    };

    // Auto-approve emergency requests with appropriate logging
    if (request.urgency === 'emergency') {
      accessRequest.approvalStatus = 'approved';
      accessRequest.approvedBy = 'emergency-protocol';
      accessRequest.approvalDate = new Date().toISOString();
      accessRequest.expirationDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours
      
      await this.logAuditEvent({
        actionType: 'access',
        userId: request.requesterId,
        userRole: request.requesterRole,
        resourceType: 'patient-data',
        patientId: request.patientId,
        outcome: 'success',
        details: { emergency: true, autoApproved: true }
      });
    }

    this.accessRequests.set(requestId, accessRequest);
    return requestId;
  }

  async approveAccessRequest(requestId: string, approverInfo: { userId: string; conditions?: string[] }): Promise<void> {
    const request = this.accessRequests.get(requestId);
    if (!request) {
      throw new Error('Access request not found');
    }

    request.approvalStatus = 'approved';
    request.approvedBy = approverInfo.userId;
    request.approvalDate = new Date().toISOString();
    request.conditions = approverInfo.conditions;
    request.expirationDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

    this.accessRequests.set(requestId, request);

    await this.logAuditEvent({
      actionType: 'access',
      userId: approverInfo.userId,
      userRole: 'supervisor',
      resourceType: 'access-request',
      resourceId: requestId,
      outcome: 'success',
      details: { action: 'approved', conditions: approverInfo.conditions }
    });
  }

  // Audit Logging
  async logAuditEvent(event: Omit<AuditTrail, 'eventId' | 'timestamp' | 'ipAddress' | 'userAgent' | 'riskScore'>): Promise<void> {
    const auditEvent: AuditTrail = {
      ...event,
      eventId: `ae-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ipAddress: '0.0.0.0', // Would be populated from request context
      userAgent: 'system', // Would be populated from request context
      riskScore: this.calculateRiskScore(event)
    };

    this.auditTrails.push(auditEvent);

    // Check for suspicious activity
    if (auditEvent.riskScore > 80) {
      await this.flagSuspiciousActivity(auditEvent);
    }
  }

  async getAuditTrail(filters: {
    userId?: string;
    patientId?: string;
    startDate?: string;
    endDate?: string;
    actionType?: string;
  }): Promise<AuditTrail[]> {
    return this.auditTrails.filter(event => {
      if (filters.userId && event.userId !== filters.userId) return false;
      if (filters.patientId && event.patientId !== filters.patientId) return false;
      if (filters.actionType && event.actionType !== filters.actionType) return false;
      
      if (filters.startDate) {
        const eventDate = new Date(event.timestamp);
        const startDate = new Date(filters.startDate);
        if (eventDate < startDate) return false;
      }
      
      if (filters.endDate) {
        const eventDate = new Date(event.timestamp);
        const endDate = new Date(filters.endDate);
        if (eventDate > endDate) return false;
      }
      
      return true;
    });
  }

  // Breach Management
  async reportBreach(breach: Omit<BreachAssessment, 'incidentId' | 'reportedDate' | 'investigationStatus'>): Promise<string> {
    const incidentId = `br-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const breachAssessment: BreachAssessment = {
      ...breach,
      incidentId,
      reportedDate: new Date().toISOString(),
      investigationStatus: 'open'
    };

    this.breachAssessments.set(incidentId, breachAssessment);

    // Determine notification requirements
    if (breach.phiInvolved.patientCount >= 500) {
      breachAssessment.notificationRequired = true;
      breachAssessment.authoritiesNotified = true;
      // Would trigger actual notifications in real implementation
    }

    await this.logAuditEvent({
      actionType: 'create',
      userId: 'system',
      userRole: 'security-officer',
      resourceType: 'breach-report',
      resourceId: incidentId,
      outcome: 'success',
      details: { patientCount: breach.phiInvolved.patientCount, riskLevel: breach.riskLevel }
    });

    return incidentId;
  }

  async getBreachAssessment(incidentId: string): Promise<BreachAssessment | null> {
    return this.breachAssessments.get(incidentId) || null;
  }

  // Compliance Reporting
  async generateComplianceReport(period: { start: string; end: string }): Promise<{
    period: { start: string; end: string };
    summary: {
      totalAuditEvents: number;
      breachReports: number;
      accessRequests: number;
      dataValidations: number;
      complianceScore: number;
    };
    riskAnalysis: {
      highRiskEvents: number;
      suspiciousActivity: number;
      recommendations: string[];
    };
    generatedAt: string;
  }> {
    const startDate = new Date(period.start);
    const endDate = new Date(period.end);

    const periodEvents = this.auditTrails.filter(event => {
      const eventDate = new Date(event.timestamp);
      return eventDate >= startDate && eventDate <= endDate;
    });

    const highRiskEvents = periodEvents.filter(event => event.riskScore > 70).length;
    const suspiciousActivity = periodEvents.filter(event => event.riskScore > 80).length;

    const recommendations = this.generateComplianceRecommendations(periodEvents);
    const complianceScore = this.calculateOverallComplianceScore(periodEvents);

    return {
      period,
      summary: {
        totalAuditEvents: periodEvents.length,
        breachReports: Array.from(this.breachAssessments.values()).filter(b => {
          const reportDate = new Date(b.reportedDate);
          return reportDate >= startDate && reportDate <= endDate;
        }).length,
        accessRequests: Array.from(this.accessRequests.values()).filter(r => {
          const requestDate = new Date(r.requestDate);
          return requestDate >= startDate && requestDate <= endDate;
        }).length,
        dataValidations: periodEvents.filter(e => e.actionType === 'read').length,
        complianceScore
      },
      riskAnalysis: {
        highRiskEvents,
        suspiciousActivity,
        recommendations
      },
      generatedAt: new Date().toISOString()
    };
  }

  // Utility Methods
  private isValidId(id: string): boolean {
    return /^[A-Za-z0-9\-.]{1,64}$/.test(id);
  }

  private isValidTimestamp(timestamp: string): boolean {
    const date = new Date(timestamp);
    return !isNaN(date.getTime());
  }

  private calculateComplianceScore(errors: string[], warnings: string[]): number {
    const errorPenalty = errors.length * 20;
    const warningPenalty = warnings.length * 5;
    return Math.max(0, 100 - errorPenalty - warningPenalty);
  }

  private calculateRiskScore(event: Omit<AuditTrail, 'eventId' | 'timestamp' | 'ipAddress' | 'userAgent' | 'riskScore'>): number {
    let score = 0;

    // Base risk by action type
    const riskByAction = {
      'delete': 40,
      'export': 30,
      'print': 25,
      'update': 20,
      'read': 10,
      'create': 15,
      'access': 20,
      'login': 5,
      'logout': 0
    };

    score += riskByAction[event.actionType] || 10;

    // Increase risk for failed actions
    if (event.outcome === 'failure') {
      score += 30;
    }

    // Higher risk for patient data access
    if (event.patientId) {
      score += 10;
    }

    return Math.min(100, score);
  }

  private async flagSuspiciousActivity(event: AuditTrail): Promise<void> {
    // Flag suspicious activity for review
    console.warn('Suspicious activity detected:', {
      eventId: event.eventId,
      userId: event.userId,
      riskScore: event.riskScore,
      actionType: event.actionType
    });

    // In a real implementation, this would trigger alerts to security officers
  }

  private generateComplianceRecommendations(events: AuditTrail[]): string[] {
    const recommendations: string[] = [];

    const failureRate = events.filter(e => e.outcome === 'failure').length / events.length;
    if (failureRate > 0.1) {
      recommendations.push('High failure rate detected - review access controls');
    }

    const highRiskEvents = events.filter(e => e.riskScore > 70).length;
    if (highRiskEvents > 10) {
      recommendations.push('Multiple high-risk events - enhance monitoring');
    }

    const uniqueUsers = new Set(events.map(e => e.userId)).size;
    const avgEventsPerUser = events.length / uniqueUsers;
    if (avgEventsPerUser > 100) {
      recommendations.push('High activity per user - consider additional training');
    }

    return recommendations;
  }

  private calculateOverallComplianceScore(events: AuditTrail[]): number {
    if (events.length === 0) return 100;

    const avgRiskScore = events.reduce((sum, e) => sum + e.riskScore, 0) / events.length;
    return Math.max(0, 100 - avgRiskScore);
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

// Export singleton instance
export const hipaaComplianceService = new HIPAAComplianceService({
  organizationId: 'pain-tracker-org',
  privacyOfficer: {
    name: 'Privacy Officer',
    title: 'Chief Privacy Officer',
    email: 'privacy@paintracker.app',
    phone: '+1-555-0100'
  },
  securityOfficer: {
    name: 'Security Officer',
    title: 'Chief Security Officer',
    email: 'security@paintracker.app',
    phone: '+1-555-0101'
  },
  complianceOfficer: {
    name: 'Compliance Officer',
    title: 'Chief Compliance Officer',
    email: 'compliance@paintracker.app',
    phone: '+1-555-0102'
  },
  businessAssociates: [],
  policies: [],
  technicalSafeguards: {
    accessControl: {
      uniqueUserIdentification: true,
      automaticLogoff: true,
      encryptionDecryption: true
    },
    auditControls: {
      hardwareSystemsAccess: true,
      softwareSystemsAccess: true,
      activityReviews: true
    },
    integrity: {
      protectionFromAlteration: true,
      protectionFromDestruction: true
    },
    personOrEntityAuthentication: {
      verifyUserIdentity: true
    },
    transmissionSecurity: {
      guardAgainstUnauthorizedAccess: true,
      dataIntegrityControls: true,
      encryptionStandards: ['TLS-1.3', 'AES-256']
    }
  },
  physicalSafeguards: {
    facilityAccessControls: {
      limitPhysicalAccess: true,
      workstationAccess: true,
      mediaControls: true
    },
    workstationUse: {
      limitedAccess: true,
      physicalAttributes: ['locked-room', 'secure-access']
    },
    deviceMediaControls: {
      disposalProcedures: true,
      reuseProtocols: true,
      accountabilityMeasures: true,
      dataBackupStorage: true
    }
  },
  administrativeSafeguards: {
    securityManagement: {
      securityOfficerAssigned: true,
      managementResponsibilities: ['policy-enforcement', 'incident-response']
    },
    workforceTraining: {
      privacyTraining: true,
      securityTraining: true,
      trainingFrequency: 'annually',
      lastCompleted: '2025-01-01'
    },
    accessManagement: {
      accessAuthorizationProcedures: true,
      accessEstablishmentModification: true,
      accessTerminationProcedures: true
    },
    contingencyPlan: {
      dataBackupPlan: true,
      disasterRecoveryPlan: true,
      emergencyModeOperationPlan: true,
      dataRecoveryPlan: true
    },
    businessAssociateContracts: {
      writtenContracts: true,
      safeguardRequirements: true
    }
  }
});
