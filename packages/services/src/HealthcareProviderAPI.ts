import type { PainEntry } from '../../src/types';
import { FHIRBundle } from './FHIRService';

export class HealthcareProviderAPI {
  async getPatients(_providerId: string) { return []; }
  async getPatientData(_providerId: string, _patientId: string, _format: 'fhir' | 'summary' = 'fhir'): Promise<FHIRBundle | any> {
    return { resourceType: 'Bundle', type: 'collection', entry: [] } as FHIRBundle;
  }
  async requestDataSync(_request: any) { return { syncId: 'sync-1', status: 'pending' }; }
  async getSyncStatus(_syncId: string) { return { syncId: _syncId, status: 'completed' }; }
  async processAlerts(_patientId: string, _painEntry: PainEntry) { /* noop */ }
}

export const healthcareProviderAPI = new HealthcareProviderAPI();
