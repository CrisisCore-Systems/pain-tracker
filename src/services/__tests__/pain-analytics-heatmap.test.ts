import { describe, it, expect } from 'vitest';
import { PainAnalyticsService } from '../PainAnalyticsService';
import { PainEntry } from '../../types';

describe('PainAnalyticsService - Heatmap', () => {
    const service = new PainAnalyticsService();

    const baseEntryPrompt: Omit<PainEntry, 'id' | 'timestamp' | 'baselineData'> = {
        functionalImpact: { limitedActivities: [], assistanceNeeded: [], mobilityAids: [] },
        medications: { current: [], changes: '', effectiveness: '' },
        treatments: { recent: [], effectiveness: '', planned: [] },
        qualityOfLife: { sleepQuality: 5, moodImpact: 5, socialImpact: [] },
        workImpact: { missedWork: 0, workLimitations: [], modifiedDuties: [] },
        comparison: { worseningSince: '', newLimitations: [] },
        notes: ''
    };

    it('should generate empty heatmap for no data', () => {
        const result = service.generateTimeHeatmap([], 90);
        expect(result).toEqual([]);
    });

    it('should aggregate pain levels by hour and day correctly', () => {
        // Use a fixed date reference to avoid timezeone issues in tests if possible, 
        // but getDay/getHours uses local time of the Date object.
        // We'll construct dates that interpret cleanly.
        
        // Wed Jan 01 2025 12:00:00 GMT
        const baseTime = new Date('2025-01-01T12:00:00Z'); 
        
        const entries: PainEntry[] = [
            {
                ...baseEntryPrompt,
                id: '1',
                timestamp: baseTime.toISOString(), // Wed 12:00
                baselineData: { pain: 5, locations: [], symptoms: [] }
            },
            {
                ...baseEntryPrompt,
                id: '2',
                timestamp: baseTime.toISOString(), // Wed 12:00 (Same slot)
                baselineData: { pain: 7, locations: [], symptoms: [] }
            },
             {
                ...baseEntryPrompt,
                id: '3',
                timestamp: new Date('2025-01-02T14:00:00Z').toISOString(), // Thu 14:00
                baselineData: { pain: 2, locations: [], symptoms: [] }
            }
        ];

        // We need to mock "now" or ensure cutoff covers these dates.
        // Since we pass 'days', let's use a very large number effectively covering everything for this test data.
        // Or better, just ensure the filter works.
        const result = service.generateTimeHeatmap(entries, 3650);
        
        // Wed is day 3. Hour 12. Avg pain (5+7)/2 = 6.
        // Note: Date.getDay() depends on local system time if not careful, but .toISOString() is UTC.
        // new Date('...Z') creates UTC.
        // And getDay() returns local day. 
        // In test environment, usually UTC or specific timezone.
        // Let's rely on the environment being consistent or inspect what day index is returned.
        
        const wedIdx = baseTime.getDay();
        const wedHour = baseTime.getHours();
        
        const wedEntry = result.find(r => r.dayIndex === wedIdx && r.hour === wedHour);
        expect(wedEntry).toBeDefined();
        expect(wedEntry?.avgPain).toBe(6);
        expect(wedEntry?.count).toBe(2);

        const thuDate = new Date('2025-01-02T14:00:00Z');
        const thuIdx = thuDate.getDay();
        const thuHour = thuDate.getHours();

        const thuEntry = result.find(r => r.dayIndex === thuIdx && r.hour === thuHour);
        expect(thuEntry).toBeDefined();
        expect(thuEntry?.avgPain).toBe(2);
        expect(thuEntry?.count).toBe(1);
    });

    it('should filter out entries older than days cutoff', () => {
        const now = new Date();
        const oldDate = new Date(now.getTime() - 100 * 24 * 60 * 60 * 1000); // 100 days ago
        
        const entries: PainEntry[] = [{
             ...baseEntryPrompt,
             id: '1',
             timestamp: oldDate.toISOString(),
             baselineData: { pain: 5, locations: [], symptoms: [] }
        }];

        const result = service.generateTimeHeatmap(entries, 30); // 30 days cutoff
        expect(result).toHaveLength(0);
    });
});
