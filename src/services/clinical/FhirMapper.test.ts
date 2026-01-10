import { describe, it, expect } from 'vitest';
import { FhirMapper } from './FhirMapper';
import type { PainEntry } from '../../types';

describe('FhirMapper', () => {
  const mockEntry: PainEntry = {
    id: 123,
    timestamp: '2025-01-01T12:00:00Z',
    baselineData: {
      pain: 7,
      locations: ['Lower Back', 'Neck'],
      symptoms: ['Nausea']
    },
    // Minimally populated fields for the rest
    functionalImpact: { limitedActivities: [], assistanceNeeded: [], mobilityAids: [] },
    medications: { current: [], changes: '', effectiveness: '' },
    treatments: { recent: [], effectiveness: '', planned: [] },
    qualityOfLife: { sleepQuality: 5, moodImpact: 5, socialImpact: [] },
    workImpact: { missedWork: 0, modifiedDuties: [], workLimitations: [] },
    comparison: { worseningSince: '', newLimitations: [] },
    notes: 'Feeling worse after lifting boxes.'
  };

  it('generates a valid FHIR Bundle', () => {
    const bundle = FhirMapper.toGenericBundle(mockEntry, 'patient-123');

    expect(bundle.resourceType).toBe('Bundle');
    expect(bundle.type).toBe('collection');
    expect(bundle.entry).toBeDefined();
    expect(bundle.entry?.length).toBeGreaterThan(0);
  });

  it('includes Pain Severity Observation', () => {
    const bundle = FhirMapper.toGenericBundle(mockEntry, 'patient-123');
    const painObs = bundle.entry?.find(e => 
      e.resource.resourceType === 'Observation' && 
      (e.resource as any).code?.coding?.[0]?.code === '72514-3'
    );

    expect(painObs).toBeDefined();
    expect((painObs?.resource as any).valueInteger).toBe(7);
  });

  it('includes Body Sites via Observations', () => {
    const bundle = FhirMapper.toGenericBundle(mockEntry, 'patient-123');
    const locationObs = bundle.entry?.filter(e => 
      e.resource.resourceType === 'Observation' && 
      (e.resource as any).bodySite?.text
    );

    expect(locationObs?.length).toBe(2); // Lower Back + Neck
    expect((locationObs?.[0].resource as any).bodySite.text).toBe('Lower Back');
  });

  it('includes Notes as ClinicalImpression', () => {
    const bundle = FhirMapper.toGenericBundle(mockEntry, 'patient-123');
    const impression = bundle.entry?.find(e => e.resource.resourceType === 'ClinicalImpression');

    expect(impression).toBeDefined();
    expect((impression?.resource as any).summary).toBe('Feeling worse after lifting boxes.');
  });

  it('includes Medications as MedicationStatement', () => {
    const complexEntry: PainEntry = {
      ...mockEntry,
      medications: {
        ...mockEntry.medications,
        current: [{ name: 'Ibuprofen', dosage: '400mg', frequency: 'Every 4h', effectiveness: 'moderate' }]
      }
    };

    const bundle = FhirMapper.toGenericBundle(complexEntry, 'patient-123');
    const medStmt = bundle.entry?.find(e => e.resource.resourceType === 'MedicationStatement');

    expect(medStmt).toBeDefined();
    expect((medStmt?.resource as any).medicationCodeableConcept.text).toBe('Ibuprofen');
    expect((medStmt?.resource as any).dosage[0].text).toContain('400mg Every 4h');
  });

  it('includes Functional Impact as Observation', () => {
    const complexEntry: PainEntry = {
      ...mockEntry,
      functionalImpact: {
        ...mockEntry.functionalImpact,
        limitedActivities: ['Walking', 'Lifting'],
        assistanceNeeded: []
      }
    };

    const bundle = FhirMapper.toGenericBundle(complexEntry, 'patient-123');
    const funcObs = bundle.entry?.find(e => 
      e.resource.resourceType === 'Observation' && 
      (e.resource as any).code?.text === 'Functional Impact'
    );

    expect(funcObs).toBeDefined();
    expect((funcObs?.resource as any).valueString).toContain('Limited: Walking');
    expect((funcObs?.resource as any).valueString).toContain('Limited: Lifting');
  });
});
