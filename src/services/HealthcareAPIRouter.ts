// Healthcare Integration API Router
// Central API endpoints for healthcare provider integration

import { healthcareProviderAPI } from './HealthcareProviderAPI';
import type { DataSyncRequest } from './HealthcareProviderAPI';
import { dataSharingProtocols } from './DataSharingProtocols';
import { healthcareOAuthProvider } from './HealthcareOAuth';
import { hipaaComplianceService } from './HIPAACompliance';
import { fhirService } from './FHIRService';
import type { FHIRResource } from './FHIRService';
import type { AuthenticationRequest, TokenRequest } from './HealthcareOAuth';
import type { DataExchangeRequest, DataSharingAgreement } from './DataSharingProtocols';

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
    };
    timestamp: string;
    requestId: string;
  };
}

export interface APIRequest {
  headers: Record<string, string>;
  params: Record<string, string>;
  query: Record<string, string>;
  body?: unknown;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  user?: {
    id: string;
    role: string;
    permissions: string[];
    organizationId?: string;
  };
}

export class HealthcareAPIRouter {
  private rateLimiter: Map<string, { count: number; resetTime: number }> = new Map();

  // Authentication Middleware
  async authenticateRequest(request: APIRequest): Promise<APIRequest> {
    const authHeader = request.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);
    const tokenInfo = await healthcareOAuthProvider.validateAccessToken(token);

    if (!tokenInfo) {
      throw new Error('Invalid or expired access token');
    }

    // Get user info
    const userInfo = await healthcareOAuthProvider.getUserInfo(token);

    request.user = {
      id: tokenInfo.userId,
      role: userInfo?.role || 'unknown',
      permissions: this.getPermissionsFromScope(tokenInfo.scope),
      organizationId: userInfo?.organizationId,
    };

    return request;
  }

  // Rate Limiting
  async checkRateLimit(request: APIRequest): Promise<void> {
    const clientId = request.user?.id || request.headers['x-client-id'] || 'anonymous';
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window
    const maxRequests = 100; // requests per minute

    const current = this.rateLimiter.get(clientId);
    if (!current || now > current.resetTime) {
      this.rateLimiter.set(clientId, { count: 1, resetTime: now + windowMs });
      return;
    }

    if (current.count >= maxRequests) {
      throw new Error('Rate limit exceeded');
    }

    current.count++;
    this.rateLimiter.set(clientId, current);
  }

  // FHIR API Endpoints
  async handleFHIRRequest(request: APIRequest): Promise<APIResponse> {
    try {
      await this.authenticateRequest(request);
      await this.checkRateLimit(request);

      const { method, path, body, query } = request;
      const pathParts = path.split('/').filter(p => p);

      // Log audit event
      await hipaaComplianceService.logAuditEvent({
        actionType: method.toLowerCase() as 'create' | 'read' | 'update' | 'delete',
        userId: request.user!.id,
        userRole: request.user!.role,
        resourceType: 'fhir-resource',
        outcome: 'success',
      });

      // Handle different FHIR operations
      if (method === 'GET' && pathParts.length === 1) {
        // Search resources: GET /Patient?name=John
        const resourceType = pathParts[0];
        const searchParams = query;
        const bundle = await fhirService.searchResources(resourceType, searchParams);

        return {
          success: true,
          data: bundle,
          meta: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
          },
        };
      }

      if (method === 'GET' && pathParts.length === 2) {
        // Read resource: GET /Patient/123
        const [resourceType, id] = pathParts;
        const resource = await fhirService.getResource(resourceType, id);

        return {
          success: true,
          data: resource,
          meta: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
          },
        };
      }

      if (method === 'POST' && pathParts.length === 1) {
        // Create resource: POST /Patient
        const _resourceType = pathParts[0];
        if (!body || typeof body !== 'object') {
          throw new Error('Invalid request body');
        }

        // Validate HIPAA compliance
        const validation = await hipaaComplianceService.validateFHIRResource(body as unknown as FHIRResource);
        if (!validation.isValid) {
          return {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Resource validation failed',
              details: validation.errors,
            },
            meta: {
              timestamp: new Date().toISOString(),
              requestId: this.generateRequestId(),
            },
          };
        }

        const createdResource = await fhirService.createResource(body as unknown as FHIRResource);

        return {
          success: true,
          data: createdResource,
          meta: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
          },
        };
      }

      if (method === 'PUT' && pathParts.length === 2) {
        // Update resource: PUT /Patient/123
        const [, id] = pathParts;
        if (!body || typeof body !== 'object') {
          throw new Error('Invalid request body');
        }

        const resourceWithId = { ...(body as Record<string, unknown>), id } as unknown as FHIRResource;
        const validation = await hipaaComplianceService.validateFHIRResource(resourceWithId);
        if (!validation.isValid) {
          return {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Resource validation failed',
              details: validation.errors,
            },
            meta: {
              timestamp: new Date().toISOString(),
              requestId: this.generateRequestId(),
            },
          };
        }

        const updatedResource = await fhirService.updateResource(resourceWithId);

        return {
          success: true,
          data: updatedResource,
          meta: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
          },
        };
      }

      if (method === 'DELETE' && pathParts.length === 2) {
        // Delete resource: DELETE /Patient/123
        const [resourceType, id] = pathParts;
        await fhirService.deleteResource(resourceType, id);

        return {
          success: true,
          meta: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
          },
        };
      }

      throw new Error('Unsupported FHIR operation');
    } catch (error) {
      await hipaaComplianceService.logAuditEvent({
        actionType: 'access',
        userId: request.user?.id || 'anonymous',
        userRole: request.user?.role || 'unknown',
        resourceType: 'fhir-resource',
        outcome: 'failure',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      });

      return {
        success: false,
        error: {
          code: 'OPERATION_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
        },
      };
    }
  }

  // Provider API Endpoints
  async handleProviderRequest(request: APIRequest): Promise<APIResponse> {
    try {
      await this.authenticateRequest(request);
      await this.checkRateLimit(request);

      const { method, path, body, query } = request;
      const pathParts = path.split('/').filter(p => p);

      if (method === 'GET' && pathParts[0] === 'patients') {
        const patients = await healthcareProviderAPI.getPatients(
          request.user!.id,
          query as unknown as { since?: string; riskLevel?: string; active?: boolean }
        );

        return {
          success: true,
          data: patients,
          meta: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
          },
        };
      }

      if (method === 'GET' && pathParts[0] === 'patients' && pathParts[1]) {
        const patientData = await healthcareProviderAPI.getPatientData(
          request.user!.id,
          pathParts[1],
          query.format as 'fhir' | 'summary'
        );

        return {
          success: true,
          data: patientData,
          meta: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
          },
        };
      }

      if (method === 'POST' && pathParts[0] === 'sync') {
        if (!body || typeof body !== 'object') {
          throw new Error('Invalid request body');
        }

        const candidate = body as Record<string, unknown>;
        const format = candidate.format;
        const includeTypes = candidate.includeTypes;

        if (format !== 'fhir' && format !== 'hl7' && format !== 'ccda') {
          throw new Error('Invalid sync format');
        }
        if (!Array.isArray(includeTypes)) {
          throw new Error('Invalid includeTypes');
        }

        const allowedTypes: DataSyncRequest['includeTypes'][number][] = [
          'observations',
          'questionnaires',
          'patient-data',
        ];
        if (!includeTypes.every(t => allowedTypes.includes(t as DataSyncRequest['includeTypes'][number]))) {
          throw new Error('Invalid includeTypes values');
        }

        const patientIdsRaw = candidate.patientIds;
        const patientIds = Array.isArray(patientIdsRaw) && patientIdsRaw.every(p => typeof p === 'string')
          ? (patientIdsRaw as string[])
          : undefined;

        const sinceRaw = candidate.since;
        const since = typeof sinceRaw === 'string' ? sinceRaw : undefined;

        const syncRequest: DataSyncRequest = {
          providerId: request.user!.id,
          format,
          includeTypes: includeTypes as DataSyncRequest['includeTypes'],
          patientIds,
          since,
        };

        const syncResponse = await healthcareProviderAPI.requestDataSync(syncRequest);

        return {
          success: true,
          data: syncResponse,
          meta: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
          },
        };
      }

      if (method === 'GET' && pathParts[0] === 'sync' && pathParts[1]) {
        const syncStatus = await healthcareProviderAPI.getSyncStatus(pathParts[1]);

        return {
          success: true,
          data: syncStatus,
          meta: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
          },
        };
      }

      throw new Error('Unsupported provider operation');
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'OPERATION_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
        },
      };
    }
  }

  // Data Sharing Endpoints
  async handleDataSharingRequest(request: APIRequest): Promise<APIResponse> {
    try {
      await this.authenticateRequest(request);
      await this.checkRateLimit(request);

      const { method, path, body } = request;
      const pathParts = path.split('/').filter(p => p);

      if (method === 'POST' && pathParts[0] === 'agreements') {
        if (!body || typeof body !== 'object') {
          throw new Error('Invalid request body');
        }

        const agreementId = await dataSharingProtocols.createAgreement(
          body as unknown as Omit<DataSharingAgreement, 'id' | 'status' | 'lastModified'>
        );

        return {
          success: true,
          data: { agreementId },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
          },
        };
      }

      if (method === 'POST' && pathParts[0] === 'exchange') {
        if (!body || typeof body !== 'object') {
          throw new Error('Invalid request body');
        }

        const requestId = await dataSharingProtocols.requestDataExchange(
          body as unknown as DataExchangeRequest
        );

        return {
          success: true,
          data: { requestId },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
          },
        };
      }

      throw new Error('Unsupported data sharing operation');
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'OPERATION_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
        },
      };
    }
  }

  // OAuth Endpoints
  async handleOAuthRequest(request: APIRequest): Promise<APIResponse> {
    try {
      const { method, path, body, query } = request;
      const pathParts = path.split('/').filter(p => p);

      if (method === 'POST' && pathParts[0] === 'token') {
        if (!body || typeof body !== 'object') {
          throw new Error('Invalid request body');
        }

        const tokenResponse = await healthcareOAuthProvider.exchangeCodeForToken(
          body as unknown as TokenRequest
        );

        return {
          success: true,
          data: tokenResponse,
          meta: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
          },
        };
      }

      if (method === 'GET' && pathParts[0] === 'authorize') {
        const authUrl = await healthcareOAuthProvider.createAuthorizationUrl(
          query as unknown as AuthenticationRequest
        );

        return {
          success: true,
          data: { authUrl },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
          },
        };
      }

      if (method === 'POST' && pathParts[0] === 'introspect') {
        if (!body || typeof body !== 'object') {
          throw new Error('Invalid request body');
        }

        const tokenInfo = await healthcareOAuthProvider.introspectToken(
          (body as Record<string, unknown>).token as string
        );

        return {
          success: true,
          data: tokenInfo,
          meta: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
          },
        };
      }

      if (method === 'GET' && pathParts[0] === 'userinfo') {
        await this.authenticateRequest(request);

        const authHeader = request.headers['authorization'];
        const token = authHeader!.substring(7);
        const userInfo = await healthcareOAuthProvider.getUserInfo(token);

        return {
          success: true,
          data: userInfo,
          meta: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
          },
        };
      }

      if (method === 'GET' && pathParts[0] === 'jwks') {
        const jwks = await healthcareOAuthProvider.getJWKS();

        return {
          success: true,
          data: jwks,
          meta: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
          },
        };
      }

      throw new Error('Unsupported OAuth operation');
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'OPERATION_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
        },
      };
    }
  }

  // Main Router
  async route(request: APIRequest): Promise<APIResponse> {
    const pathParts = request.path.split('/').filter(p => p);

    if (!pathParts.length) {
      return {
        success: false,
        error: {
          code: 'INVALID_PATH',
          message: 'Invalid API path',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
        },
      };
    }

    try {
      // Route to appropriate handler based on first path segment
      switch (pathParts[0]) {
        case 'fhir':
          request.path = '/' + pathParts.slice(1).join('/');
          return await this.handleFHIRRequest(request);

        case 'provider':
          request.path = '/' + pathParts.slice(1).join('/');
          return await this.handleProviderRequest(request);

        case 'data-sharing':
          request.path = '/' + pathParts.slice(1).join('/');
          return await this.handleDataSharingRequest(request);

        case 'oauth':
          request.path = '/' + pathParts.slice(1).join('/');
          return await this.handleOAuthRequest(request);

        default:
          return {
            success: false,
            error: {
              code: 'UNKNOWN_ENDPOINT',
              message: `Unknown API endpoint: ${pathParts[0]}`,
            },
            meta: {
              timestamp: new Date().toISOString(),
              requestId: this.generateRequestId(),
            },
          };
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Internal server error',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
        },
      };
    }
  }

  // Utility Methods
  private getPermissionsFromScope(scope: string): string[] {
    const scopes = scope.split(' ');
    const permissions: string[] = [];

    scopes.forEach(s => {
      if (s.includes('read')) permissions.push('read');
      if (s.includes('write')) permissions.push('write');
      if (s.includes('delete')) permissions.push('delete');
    });

    return permissions;
  }

  private generateRequestId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const healthcareAPIRouter = new HealthcareAPIRouter();

// Export API Documentation
export const API_DOCUMENTATION = {
  version: '1.0.0',
  title: 'Pain Tracker Healthcare Integration API',
  description: 'FHIR-compliant API for healthcare provider integration',
  baseUrl: '/api/v1/healthcare',
  endpoints: {
    fhir: {
      description: 'FHIR R4 compliant endpoints for clinical data exchange',
      examples: [
        'GET /fhir/Patient - Search patients',
        'GET /fhir/Patient/123 - Get specific patient',
        'POST /fhir/Observation - Create observation',
        'PUT /fhir/Patient/123 - Update patient',
      ],
    },
    provider: {
      description: 'Healthcare provider specific endpoints',
      examples: [
        'GET /provider/patients - Get provider patients',
        'POST /provider/sync - Request data synchronization',
        'GET /provider/sync/123 - Check sync status',
      ],
    },
    'data-sharing': {
      description: 'Data sharing agreement and exchange endpoints',
      examples: [
        'POST /data-sharing/agreements - Create data sharing agreement',
        'POST /data-sharing/exchange - Request data exchange',
      ],
    },
    oauth: {
      description: 'OAuth2/OIDC authentication endpoints',
      examples: [
        'GET /oauth/authorize - Authorization endpoint',
        'POST /oauth/token - Token exchange',
        'GET /oauth/userinfo - User information',
        'GET /oauth/jwks - JSON Web Key Set',
      ],
    },
  },
  authentication: {
    type: 'OAuth2',
    flows: ['authorization_code', 'client_credentials'],
    scopes: [
      'openid - OpenID Connect',
      'fhirUser - FHIR user access',
      'patient/*.read - Read patient data',
      'patient/*.write - Write patient data',
      'system/*.read - System level read access',
      'system/*.write - System level write access',
    ],
  },
  compliance: {
    standards: ['FHIR R4', 'HIPAA', 'OAuth2', 'OIDC'],
    features: [
      'End-to-end encryption',
      'Audit logging',
      'Access controls',
      'Data validation',
      'Rate limiting',
    ],
  },
};
