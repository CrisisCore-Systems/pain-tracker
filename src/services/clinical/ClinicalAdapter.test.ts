import { describe, it, expect } from 'vitest';
import { ClinicalAdapter } from './ClinicalAdapter';
import type { PainEntry } from '../../types';

describe('ClinicalAdapter', () => {
    const mockEntries: PainEntry[] = [
        {
            id: 1,
            timestamp: '2025-01-01T12:00:00Z',
            baselineData: { pain: 5, locations: [], symptoms: [] },
            functionalImpact: { limitedActivities: [], assistanceNeeded: [], mobilityAids: [] },
            medications: { current: [], changes: '', effectiveness: '' },
            treatments: { recent: [], effectiveness: '', planned: [] },
            qualityOfLife: { sleepQuality: 0, moodImpact: 0, socialImpact: [] },
            workImpact: { missedWork: 0, modifiedDuties: [], workLimitations: [] },
            comparison: { worseningSince: '', newLimitations: [] },
            notes: 'Sensitive Note 1'
        },
        {
            id: 2,
            timestamp: '2025-01-02T12:00:00Z',
            baselineData: { pain: 8, locations: [], symptoms: [] },
            functionalImpact: { limitedActivities: [], assistanceNeeded: [], mobilityAids: [] },
            medications: { current: [], changes: '', effectiveness: '' },
            treatments: { recent: [], effectiveness: '', planned: [] },
            qualityOfLife: { sleepQuality: 0, moodImpact: 0, socialImpact: [] },
            workImpact: { missedWork: 0, modifiedDuties: [], workLimitations: [] },
            comparison: { worseningSince: '', newLimitations: [] },
            notes: 'Sensitive Note 2'
        }
    ];

    it('generates a valid master bundle JSON', () => {
        const json = ClinicalAdapter.generateFhirExport(mockEntries, { includeNotes: true });
        const bundle = JSON.parse(json);

        expect(bundle.resourceType).toBe('Bundle');
        expect(bundle.type).toBe('collection');
        // 2 entries * (1 Pain Obs + 1 ClinicalImpression) = 4 resources
        // But mock entries have no locations/symptoms, so just Pain + Note.
        expect(bundle.entry.length).toBe(4);
    });

    it('respects privacy options by stripping notes when requested', () => {
        const json = ClinicalAdapter.generateFhirExport(mockEntries, { includeNotes: false });
        const bundle = JSON.parse(json);

        // Should only contain Observation resources, no ClinicalImpression
        const impressions = bundle.entry.filter((e: any) => e.resource.resourceType === 'ClinicalImpression');
        const observations = bundle.entry.filter((e: any) => e.resource.resourceType === 'Observation');

        expect(impressions.length).toBe(0);
        expect(observations.length).toBe(2);
    });
});
