import type { PainEntry } from '../../types';
import type { Fhir } from '../../types/fhir';

/**
 * Maps internal PainEntry data to FHIR R4 standard resources.
 * This ensures interoperability with clinical systems without exposing
 * internal data structures directly.
 */
export class FhirMapper {
  /**
   * Converts a single PainEntry into a FHIR Bundle containing Observations, Notations, etc.
   * @param entry The internal PainEntry
   * @param patientId The UUID of the patient (if known, otherwise generic)
   */
  static toGenericBundle(entry: PainEntry, patientId: string = 'patient-001'): Fhir.Bundle {
    const resources: Fhir.FhirResource[] = [];
    const timestamp = entry.timestamp || new Date().toISOString();

    // 1. Pain Severity Observation
    const painValue = typeof entry.intensity === 'number' ? entry.intensity : entry.baselineData?.pain;
    if (typeof painValue === 'number') {
      const painObs: Fhir.Observation = {
        resourceType: 'Observation',
        id: `pain-${entry.id}`,
        status: 'final',
        code: {
          coding: [{
            system: 'http://loinc.org',
            code: '72514-3',
            display: 'Pain severity - 0-10 verbal numeric rating [Score] - Reported'
          }]
        },
        subject: { reference: `Patient/${patientId}` },
        effectiveDateTime: timestamp,
        valueInteger: painValue,
        method: {
          text: 'Self-reported 0-10 scale'
        }
      };
      resources.push(painObs);
    }

    // 2. Pain Location (BodySite)
    const locations = entry.baselineData?.locations || [];
    if (locations.length > 0) {
      // Create a separate observation for locations or just list them?
      // Often better as BodySite on the Pain Observation, but strict LOINC mapping might differ.
      // We will create a simplified Observation for "Pain Location"
      locations.forEach((loc, idx) => {
        resources.push({
          resourceType: 'Observation',
          id: `loc-${entry.id}-${idx}`,
          status: 'final',
          code: {
            coding: [{
              system: 'http://snomed.info/sct',
              code: '364564000', // Pain finding at anatomical site
              display: 'Pain finding at anatomical site'
            }]
          },
          bodySite: {
            text: loc
          },
          subject: { reference: `Patient/${patientId}` },
          effectiveDateTime: timestamp
        });
      });
    }

    // 3. Symptoms
    const symptoms = entry.baselineData?.symptoms || [];
    if (symptoms.length > 0) {
        resources.push({
            resourceType: 'Observation',
            id: `sym-${entry.id}`,
            status: 'final',
            code: {
                text: 'Associated Symptoms'
            },
            subject: { reference: `Patient/${patientId}` },
            effectiveDateTime: timestamp,
            note: symptoms.map(s => ({ text: s }))
        });
    }

    // 4. Notes (Annotation)
    // We treat user notes as potentially sensitive, but in a "Clinical Connect" flow
    // we assume the user WANTS to share this specific entry's notes.
    if (entry.notes) {
        resources.push({
            resourceType: 'ClinicalImpression',
            id: `note-${entry.id}`,
            status: 'completed',
            subject: { reference: `Patient/${patientId}` },
            effectiveDateTime: timestamp,
            summary: entry.notes
        });
    }

    // 5. Medications
    if (entry.medications?.current && entry.medications.current.length > 0) {
      entry.medications.current.forEach((med, idx) => {
        resources.push(
          FhirMapper.toMedicationStatement(med, patientId, timestamp)
        );
      });
    }

    // 6. Functional Impact
    const impact = entry.functionalImpact;
    if (impact && (impact.limitedActivities.length > 0 || impact.assistanceNeeded.length > 0)) {
      const limitations = [
        ...impact.limitedActivities.map(a => `Limited: ${a}`),
        ...impact.assistanceNeeded.map(a => `Assistance: ${a}`)
      ].join('; ');

      resources.push({
        resourceType: 'Observation',
        id: `func-${entry.id}`,
        status: 'final',
        code: {
          coding: [{
            system: 'http://loinc.org',
            code: '54506-1', // Activities of daily living [Class] -- generic approximation
            display: 'Functional Assessment'
          }],
          text: 'Functional Impact'
        },
        subject: { reference: `Patient/${patientId}` },
        effectiveDateTime: timestamp,
        valueString: limitations
      });
    }

    // Bundle it up
    return {
      resourceType: 'Bundle',
      type: 'collection',
      timestamp: new Date().toISOString(),
      entry: resources.map(r => ({ resource: r }))
    };
  }

  /**
   * Converts a Medication record to FHIR form
   */
  static toMedicationStatement(
    med: { name: string; dosage: string; frequency: string }, 
    patientId: string,
    timestamp: string
  ): Fhir.MedicationStatement {
    return {
      resourceType: 'MedicationStatement',
      status: 'active',
      subject: { reference: `Patient/${patientId}` },
      dateAsserted: timestamp,
      medicationCodeableConcept: {
        text: med.name
      },
      dosage: [{
        text: `${med.dosage} ${med.frequency}`
      }]
    };
  }
}
