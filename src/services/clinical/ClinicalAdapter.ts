import { FhirMapper } from './FhirMapper';
import type { PainEntry } from '../../types';
import type { Fhir } from '../../types/fhir';

export interface ExportOptions {
  includeNotes: boolean;
  patientId?: string;
}

/**
 * Clinical Adapter Service
 * 
 * Orchestrates the conversion of local Pain Tracker data into clinical formats.
 * Enforces scope limitations based on permissions (e.g., stripping notes if not allowed).
 */
export class ClinicalAdapter {
  /**
   * Generates a FHIR JSON string representing the provided entries.
   * Can be used for generating QR payloads or file downloads.
   */
  static generateFhirExport(entries: PainEntry[], options: ExportOptions): string {
    const { includeNotes, patientId = 'patient-generic' } = options;

    const allResources: Array<{ resource: Fhir.FhirResource }> = [];

    entries.forEach(entry => {
      // 1. Convert to Bundle
      const bundle = FhirMapper.toGenericBundle(entry, patientId);

      // 2. Filter based on permissions/scope
      if (bundle.entry) {
        bundle.entry.forEach(item => {
          // If notes are not included, filter out ClinicalImpression (which carries the notes)
          if (!includeNotes && item.resource.resourceType === 'ClinicalImpression') {
            return;
          }
          allResources.push(item);
        });
      }
    });

    // 3. Wrap in master collection
    const masterBundle: Fhir.Bundle = {
      resourceType: 'Bundle',
      type: 'collection',
      timestamp: new Date().toISOString(),
      entry: allResources
    };

    return JSON.stringify(masterBundle, null, 2);
  }
}
