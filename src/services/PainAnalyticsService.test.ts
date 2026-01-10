import { describe, it, expect, beforeEach } from 'vitest';
import { painAnalyticsService } from './PainAnalyticsService';
import { makePainEntry } from '../utils/pain-entry-factory';
import type { PainEntry } from '../types';

describe('PainAnalyticsService', () => {
    describe('generateLocationHeatmap', () => {
        it('should return empty result for empty entries', () => {
            const result = painAnalyticsService.generateLocationHeatmap([]);
            expect(result.locations).toHaveLength(0);
            expect(result.bucket.keys).toHaveLength(0);
        });

        it('should aggregate pain by location correctly', () => {
            const entry1 = makePainEntry({
                timestamp: '2024-01-01T10:00:00Z',
                baselineData: { pain: 5, locations: ['Back', 'Neck'], symptoms: [] }
            });
            const entry2 = makePainEntry({
                timestamp: '2024-01-01T14:00:00Z',
                baselineData: { pain: 7, locations: ['Back', 'Knees'], symptoms: [] }
            });

            const result = painAnalyticsService.generateLocationHeatmap([entry1, entry2]);

            // Back: 2 entries, total pain 5+7=12
            const backStat = result.locations.find(l => l.key === 'back');
            expect(backStat).toBeDefined();
            expect(backStat?.count).toBe(2);
            expect(backStat?.totalPain).toBe(12);

            // Neck: 1 entry, pain 5
            const neckStat = result.locations.find(l => l.key === 'neck');
            expect(neckStat).toBeDefined();
            expect(neckStat?.count).toBe(1);
            expect(neckStat?.totalPain).toBe(5);

            // Knees: 1 entry, pain 7
            const kneeStat = result.locations.find(l => l.key === 'knees');
            expect(kneeStat).toBeDefined();
            expect(kneeStat?.count).toBe(1);
            expect(kneeStat?.totalPain).toBe(7);
        });

        it('should bucket by day correctly', () => {
            const entry1 = makePainEntry({
                timestamp: '2024-01-01T10:00:00Z',
                baselineData: { pain: 5, locations: ['Back'], symptoms: [] }
            });
            const entry2 = makePainEntry({
                timestamp: '2024-01-02T10:00:00Z',
                baselineData: { pain: 6, locations: ['Back'], symptoms: [] }
            });

            const result = painAnalyticsService.generateLocationHeatmap([entry1, entry2]);

            expect(result.bucket.mode).toBe('day');
            expect(result.bucket.keys).toContain('2024-01-01');
            expect(result.bucket.keys).toContain('2024-01-02');

            const backStat = result.locations.find(l => l.key === 'back');
            expect(backStat?.byBucket['2024-01-01'].totalPain).toBe(5);
            expect(backStat?.byBucket['2024-01-02'].totalPain).toBe(6);
        });
        
        it('should handle location normalization', () => {
             const entry1 = makePainEntry({
                timestamp: '2024-01-01T10:00:00Z',
                baselineData: { pain: 5, locations: [' Lower  Back '], symptoms: [] }
            });
             const entry2 = makePainEntry({
                timestamp: '2024-01-01T12:00:00Z',
                baselineData: { pain: 5, locations: ['lower back'], symptoms: [] }
            });
            
            const result = painAnalyticsService.generateLocationHeatmap([entry1, entry2]);
            const location = result.locations[0];
            
            expect(location.key).toBe('lower back');
            // Label is capitalized
            expect(location.label).toBe('Lower Back');
            expect(location.count).toBe(2);
        });
    });
});
