// Minimal FHIR types and service used by other services
import type { PainEntry } from './types';

export interface FHIRResource { resourceType: string; id?: string; }
export interface FHIRObservation extends FHIRResource { resourceType: 'Observation'; }
export interface FHIRBundle extends FHIRResource { resourceType: 'Bundle'; type?: string; entry?: any[]; }

export class FHIRService {
  painEntryToFHIRObservation(_entry: PainEntry, _patientId?: string): FHIRObservation {
    return { resourceType: 'Observation' };
  }
  painEntriesToFHIRBundle(entries: PainEntry[], _patientId?: string): FHIRBundle {
    return { resourceType: 'Bundle', type: 'collection', entry: entries.map(e => ({ resource: this.painEntryToFHIRObservation(e) })) };
  }
  async createResource(resource: FHIRResource) { return resource; }
  async updateResource(resource: FHIRResource) { return resource; }
  async getResource(_resourceType: string, _id: string) { return { resourceType: 'Resource' } as FHIRResource; }
  async searchResources(_resourceType: string, _params: Record<string,string>) { return { resourceType: 'Bundle', type: 'searchset', entry: [] } as FHIRBundle; }
  async deleteResource(_resourceType: string, _id: string) { /* noop */ }
  async submitBundle(bundle: FHIRBundle) { return bundle; }
  async validateResource(_resource: FHIRResource) { return { resourceType: 'OperationOutcome', issue: [] }; }
}

export const fhirService = new FHIRService();
