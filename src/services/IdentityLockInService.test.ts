/**
 * Tests for IdentityLockInService
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { IdentityLockInService } from '@pain-tracker/services';
import type { PainEntry } from '../types';

describe('IdentityLockInService', () => {
  let service: IdentityLockInService;

  beforeEach(() => {
    service = new IdentityLockInService();
    service.resetIdentity();
  });

  describe('Identity Management', () => {
    it('should initialize with default identity', () => {
      const identity = service.getIdentity();
      
      expect(identity.totalDaysTracked).toBe(0);
      expect(identity.uniqueInsights).toEqual([]);
      expect(identity.personalPatterns).toEqual([]);
      expect(identity.identityMilestones).toEqual([]);
    });

    it('should initialize journey with entries', () => {
      const entries: Partial<PainEntry>[] = [
        { id: 1, timestamp: '2024-01-15T08:00:00Z' },
        { id: 2, timestamp: '2024-01-16T08:00:00Z' },
        { id: 3, timestamp: '2024-01-17T08:00:00Z' },
      ];
      
      service.initializeJourney(entries as PainEntry[]);
      
      const identity = service.getIdentity();
      // Should set to oldest entry timestamp
      expect(identity.journeyStartDate).toBe('2024-01-15T08:00:00Z');
      expect(identity.totalDaysTracked).toBe(3);
    });
  });

  describe('Journey Narrative', () => {
    it('should generate narrative for new users', () => {
      const narrative = service.generateJourneyNarrative([]);
      
      expect(narrative).toBeTruthy();
      expect(narrative).toContain('about to begin');
    });

    it('should generate narrative for early users', () => {
      const entries: Partial<PainEntry>[] = [
        { id: 1, timestamp: '2024-01-15T08:00:00Z' },
        { id: 2, timestamp: '2024-01-16T08:00:00Z' },
      ];
      
      service.initializeJourney(entries as PainEntry[]);
      const narrative = service.generateJourneyNarrative(entries as PainEntry[]);
      
      expect(narrative).toBeTruthy();
      expect(narrative).toContain('days tracked');
    });

    it('should reference personal patterns in narrative', () => {
      const entries: Partial<PainEntry>[] = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        timestamp: `2024-01-${(i + 1).toString().padStart(2, '0')}T08:00:00Z`,
      }));
      
      service.initializeJourney(entries as PainEntry[]);
      service.discoverPatterns(entries as PainEntry[]);
      
      const narrative = service.generateJourneyNarrative(entries as PainEntry[]);
      expect(narrative).toContain('pattern');
    });

    it('should acknowledge consistency in narrative', () => {
      const entries: Partial<PainEntry>[] = Array.from({ length: 30 }, (_, i) => ({
        id: i + 1,
        timestamp: `2024-01-${(i + 1).toString().padStart(2, '0')}T08:00:00Z`,
      }));
      
      service.initializeJourney(entries as PainEntry[]);
      const narrative = service.generateJourneyNarrative(entries as PainEntry[]);
      
      expect(narrative).toContain('comprehensive');
    });
  });

  describe('Pattern Discovery', () => {
    it('should discover commitment pattern', () => {
      const entries: Partial<PainEntry>[] = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        timestamp: `2024-01-${(i + 1).toString().padStart(2, '0')}T08:00:00Z`,
      }));
      
      const patterns = service.discoverPatterns(entries as PainEntry[]);
      
      const commitmentPattern = patterns.find(p => p.id === 'commitment-pattern');
      expect(commitmentPattern).toBeTruthy();
      expect(commitmentPattern?.type).toBe('resilience');
    });

    it('should discover reflection pattern from detailed notes', () => {
      const entries: Partial<PainEntry>[] = Array.from({ length: 6 }, (_, i) => ({
        id: i + 1,
        timestamp: `2024-01-${(i + 1).toString().padStart(2, '0')}T08:00:00Z`,
        notes: 'This is a detailed note with more than 50 characters describing my experience today.',
      }));
      
      const patterns = service.discoverPatterns(entries as PainEntry[]);
      
      const reflectionPattern = patterns.find(p => p.id === 'reflection-pattern');
      expect(reflectionPattern).toBeTruthy();
      expect(reflectionPattern?.type).toBe('success');
    });

    it('should discover medication management pattern', () => {
      const entries: Partial<PainEntry>[] = Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        timestamp: `2024-01-${(i + 1).toString().padStart(2, '0')}T08:00:00Z`,
        medications: {
          current: [
            { name: 'Ibuprofen', dosage: '200mg', frequency: 'twice daily', effectiveness: 'moderate' }
          ],
          changes: '',
          effectiveness: 'moderate',
        },
      }));
      
      const patterns = service.discoverPatterns(entries as PainEntry[]);
      
      const medPattern = patterns.find(p => p.id === 'medication-pattern');
      expect(medPattern).toBeTruthy();
      expect(medPattern?.type).toBe('success');
    });

    it('should not duplicate patterns', () => {
      const entries: Partial<PainEntry>[] = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        timestamp: `2024-01-${(i + 1).toString().padStart(2, '0')}T08:00:00Z`,
      }));
      
      service.discoverPatterns(entries as PainEntry[]);
      const patterns2 = service.discoverPatterns(entries as PainEntry[]);
      
      expect(patterns2.length).toBe(0);
    });

    it('should return empty array for insufficient data', () => {
      const entries: Partial<PainEntry>[] = [
        { id: 1, timestamp: '2024-01-15T08:00:00Z' },
      ];
      
      const patterns = service.discoverPatterns(entries as PainEntry[]);
      
      expect(patterns).toEqual([]);
    });
  });

  describe('Identity Milestones', () => {
    it('should add milestone', () => {
      service.addMilestone({
        id: 'first-week',
        title: 'First Week Complete',
        description: '7 days of tracking',
        personalSignificance: 'Building a habit',
        celebrationMessage: 'Great progress!',
      });
      
      const identity = service.getIdentity();
      expect(identity.identityMilestones.length).toBe(1);
      expect(identity.identityMilestones[0].id).toBe('first-week');
    });

    it('should not duplicate milestones', () => {
      const milestone = {
        id: 'first-week',
        title: 'First Week Complete',
        description: '7 days of tracking',
        personalSignificance: 'Building a habit',
        celebrationMessage: 'Great progress!',
      };
      
      service.addMilestone(milestone);
      service.addMilestone(milestone);
      
      const identity = service.getIdentity();
      expect(identity.identityMilestones.length).toBe(1);
    });

    it('should set achieved date', () => {
      service.addMilestone({
        id: 'test',
        title: 'Test',
        description: 'Test',
        personalSignificance: 'Test',
        celebrationMessage: 'Test',
      });
      
      const identity = service.getIdentity();
      expect(identity.identityMilestones[0].achievedDate).toBeTruthy();
    });
  });

  describe('Identity Insights', () => {
    it('should provide first-step insight for first entry', () => {
      const entries: Partial<PainEntry>[] = [
        { id: 1, timestamp: '2024-01-15T08:00:00Z' },
      ];
      
      const insights = service.getIdentityInsights(entries as PainEntry[]);
      
      const firstStep = insights.find(i => i.id === 'first-step');
      expect(firstStep).toBeTruthy();
      expect(firstStep?.category).toBe('awareness');
    });

    it('should provide emerging identity insight for 7+ entries', () => {
      const entries: Partial<PainEntry>[] = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        timestamp: `2024-01-${(i + 1).toString().padStart(2, '0')}T08:00:00Z`,
      }));
      
      const insights = service.getIdentityInsights(entries as PainEntry[]);
      
      const emerging = insights.find(i => i.id === 'emerging-identity');
      expect(emerging).toBeTruthy();
      expect(emerging?.category).toBe('discovery');
    });

    it('should provide pattern expert insight', () => {
      const entries: Partial<PainEntry>[] = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        timestamp: `2024-01-${(i + 1).toString().padStart(2, '0')}T08:00:00Z`,
        notes: 'Detailed notes about my experience today with more than 50 characters.',
        medications: {
          current: [{ name: 'Med', dosage: '100mg', frequency: 'daily', effectiveness: 'good' }],
          changes: '',
          effectiveness: 'good',
        },
      }));
      
      service.discoverPatterns(entries as PainEntry[]);
      const insights = service.getIdentityInsights(entries as PainEntry[]);
      
      const patternExpert = insights.find(i => i.id === 'pattern-expert');
      expect(patternExpert).toBeTruthy();
    });
  });

  describe('Identity Language', () => {
    it('should provide begin journey language for new users', () => {
      const language = service.getIdentityLanguage([]);
      
      expect(language.title).toContain('Begin');
      expect(language.action).toContain('First Entry');
    });

    it('should provide building story language for early users', () => {
      const entries: Partial<PainEntry>[] = [
        { id: 1, timestamp: '2024-01-15T08:00:00Z' },
        { id: 2, timestamp: '2024-01-16T08:00:00Z' },
      ];
      
      const language = service.getIdentityLanguage(entries as PainEntry[]);
      
      expect(language.title).toContain('Building');
    });

    it('should provide 30-day story language for established users', () => {
      const entries: Partial<PainEntry>[] = Array.from({ length: 30 }, (_, i) => ({
        id: i + 1,
        timestamp: `2024-01-${(i + 1).toString().padStart(2, '0')}T08:00:00Z`,
      }));
      
      const language = service.getIdentityLanguage(entries as PainEntry[]);
      
      expect(language.title).toContain('30-Day');
    });
  });

  describe('Strengths and Goals', () => {
    it('should add strength', () => {
      service.addStrength('Consistency');
      
      const identity = service.getIdentity();
      expect(identity.strengthsIdentified).toContain('Consistency');
    });

    it('should not duplicate strengths', () => {
      service.addStrength('Consistency');
      service.addStrength('Consistency');
      
      const identity = service.getIdentity();
      expect(identity.strengthsIdentified.length).toBe(1);
    });

    it('should add goal', () => {
      service.addGoal('Track daily for 30 days');
      
      const identity = service.getIdentity();
      expect(identity.selfDefinedGoals).toContain('Track daily for 30 days');
    });

    it('should not duplicate goals', () => {
      service.addGoal('Track daily for 30 days');
      service.addGoal('Track daily for 30 days');
      
      const identity = service.getIdentity();
      expect(identity.selfDefinedGoals.length).toBe(1);
    });
  });
});
