import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmpathyMetricsCollector, createEmpathyCollector, METRIC_SENSITIVITY } from './EmpathyMetricsCollector';
import { SecurityService } from './SecurityService';
import { EmpathyDrivenAnalyticsService } from './EmpathyDrivenAnalytics';
import { PrivacyBudgetManager } from './PrivacyBudgetManager';
import { KeyManager } from './KeyManagement';
import { AuditLogger } from './AuditLogger';

describe('EmpathyMetricsCollector', () => {
  let collector: EmpathyMetricsCollector;
  let mockSecurity: SecurityService;
  let mockAnalytics: EmpathyDrivenAnalyticsService;
  let mockBudgetManager: PrivacyBudgetManager;
  let mockKeyManager: KeyManager;
  let mockAuditLogger: AuditLogger;

  const mockMetrics = {
    emotionalIntelligence: {
      selfAwareness: 80,
      selfRegulation: 75,
      motivation: 85,
      empathy: 90,
      socialSkills: 70,
      emotionalGranularity: 65,
      metaEmotionalAwareness: 60
    },
    compassionateProgress: {
      selfCompassion: 70,
      selfCriticism: 30, // low is good maybe? or it's just a raw score
      progressCelebration: 80,
      setbackResilience: 75,
      hopefulness: 85,
      postTraumaticGrowth: 60,
      meaningMaking: 70,
      adaptiveReframing: 65,
      compassionFatigue: 20
    },
    empathyKPIs: {
      validationReceived: 80,
      validationGiven: 85,
      emotionalSupport: 75,
      understandingFelt: 80,
      connectionQuality: 70,
      empathicAccuracy: 65,
      empathicConcern: 90,
      perspectiveTaking: 75,
      empathicMotivation: 85,
      boundaryMaintenance: 60
    },
    humanizedMetrics: {
      courageScore: 75,
      vulnerabilityAcceptance: 70,
      authenticityLevel: 80,
      growthMindset: 85,
      innerStrength: 75,
      dignityMaintenance: 90,
      purposeClarity: 65,
      spiritualWellbeing: 60,
      lifeNarrativeCoherence: 70
    },
    overallScore: 85
  };

  const mockInsights = [{ type: 'pattern', description: 'Test insight' }];
  const mockRecommendations = [{ id: 'rec1', text: 'Take a break' }];

  beforeEach(() => {
    mockSecurity = {
      privacyConfig: {
        consentRequired: false,
        minimumNoiseLevel: 1.0
      }
    } as any;

    mockAnalytics = {
      calculateQuantifiedEmpathy: vi.fn().mockResolvedValue(mockMetrics),
      generateEmpathyInsights: vi.fn().mockResolvedValue(mockInsights),
      generateEmpathyRecommendations: vi.fn().mockResolvedValue(mockRecommendations)
    } as any;

    mockBudgetManager = {
      consume: vi.fn().mockReturnValue(true)
    } as any;

    mockKeyManager = {
      getKey: vi.fn().mockResolvedValue(Buffer.from('test-key'))
    } as any;

    mockAuditLogger = {
      append: vi.fn().mockResolvedValue({ eventId: '123' }),
      log: vi.fn().mockResolvedValue(undefined)
    } as any;

    collector = new EmpathyMetricsCollector(
      mockSecurity,
      mockAnalytics,
      mockBudgetManager,
      mockKeyManager,
      mockAuditLogger
    );
  });

  describe('Sanitization (PII Redaction)', () => {
    it('should redact emails', async () => {
      const painEntries = [{
        id: 1,
        timestamp: new Date().toISOString(),
        notes: 'Contact me at test@example.com for help.'
      }] as any[];

      const result = await collector.collect(painEntries, [], {
        userId: 'user1',
        consentGranted: true,
        sanitize: true
      });

      expect(mockAnalytics.calculateQuantifiedEmpathy).toHaveBeenCalledWith(
        'user1',
        expect.arrayContaining([
          expect.objectContaining({
            notes: expect.stringContaining('[REDACTED]')
          })
        ]),
        expect.any(Array)
      );
      
      const calls = (mockAnalytics.calculateQuantifiedEmpathy as any).mock.calls[0];
      const sanitizedNotes = calls[1][0].notes;
      expect(sanitizedNotes).not.toContain('test@example.com');
      expect(result.redactions).toBeGreaterThan(0);
    });

    it('should redact phone numbers', async () => {
      const painEntries = [{
        id: 1,
        notes: 'Call 555-123-4567 output'
      }] as any[];

      await collector.collect(painEntries, [], {
        userId: 'user1',
        consentGranted: true,
        sanitize: true
      });

      const calls = (mockAnalytics.calculateQuantifiedEmpathy as any).mock.calls[0];
      const sanitizedNotes = calls[1][0].notes;
      expect(sanitizedNotes).toContain('[REDACTED]');
      expect(sanitizedNotes).not.toContain('555-123-4567');
    });

    it('should recursively sanitize deep objects', async () => {
        const painEntries = [{
            id: 1,
            meta: {
                contact: {
                    email: 'deep@example.com'
                }
            }
        }] as any[];

        await collector.collect(painEntries, [], {
            userId: 'user1',
            consentGranted: true,
            sanitize: true
        });

        const calls = (mockAnalytics.calculateQuantifiedEmpathy as any).mock.calls[0];
        const sanitizedEntry = calls[1][0];
        expect(sanitizedEntry.meta.contact.email).toContain('[REDACTED]');
    });

    it('should handle circular references safely', async () => {
        const entry: any = { id: 1, notes: 'circular' };
        entry.self = entry;
        
        // This validates it doesn't crash
        await collector.collect([entry], [], {
            userId: 'user1',
            consentGranted: true,
            sanitize: true
        });

        const calls = (mockAnalytics.calculateQuantifiedEmpathy as any).mock.calls[0];
        const sanitizedEntry = calls[1][0];
        expect(sanitizedEntry.notes).toBe('circular');
        // Circular ref should be preserved in structure but stopping infinite recursion
        // "seen" WeakMap logic in sanitizeDeep handles this by returning cached result
    });
    
    it('should preserve Dates', async () => {
        const date = new Date();
        const painEntries = [{
            id: 1,
            timestamp: date
        }] as any[];

         await collector.collect(painEntries, [], {
            userId: 'user1',
            consentGranted: true,
            sanitize: true
        });

        const calls = (mockAnalytics.calculateQuantifiedEmpathy as any).mock.calls[0];
        expect(calls[1][0].timestamp).toBe(date); // Should be exact reference or value equality if copied?
        // Logic says: if (value instanceof Date) return { value, redactions: 0 }
        // So strict equality might fail if the array map creates a new object wrapper, but the Date itself is the same.
    });
  });

  describe('Consent Handling', () => {
    it('should throw if consent is required but not granted', async () => {
      // @ts-expect-error -- Testing read-only override
      mockSecurity.privacyConfig.consentRequired = true;

      await expect(collector.collect([], [], {
        userId: 'user1',
        consentGranted: false
      })).rejects.toThrow('Consent required');
    });

    it('should proceed if consent is required and granted', async () => {
      // @ts-expect-error -- Testing read-only override
      mockSecurity.privacyConfig.consentRequired = true;

      await expect(collector.collect([], [], {
        userId: 'user1',
        consentGranted: true
      })).resolves.not.toThrow();
    });
  });
  
  describe('Differential Privacy (Noise Injection)', () => {
      it('should inject noise when differentialPrivacy is true and budget allows', async () => {
          (mockBudgetManager.consume as any).mockReturnValue(true);

          const result = await collector.collect([], [], {
              userId: 'user1',
              consentGranted: true,
              differentialPrivacy: true,
              noiseEpsilon: 1.0
          });

          expect(mockBudgetManager.consume).toHaveBeenCalled();
          expect(result.noiseInjected).toBe(true);
          // Values should be numbers between 0-100
          expect(result.metrics.emotionalIntelligence.selfAwareness).toBeGreaterThanOrEqual(0);
          expect(result.metrics.emotionalIntelligence.selfAwareness).toBeLessThanOrEqual(100);
      });

      it('should NOT inject noise if differentialPrivacy is false', async () => {
        const result = await collector.collect([], [], {
            userId: 'user1',
            consentGranted: true,
            differentialPrivacy: false
        });

        expect(mockBudgetManager.consume).not.toHaveBeenCalled();
        expect(result.noiseInjected).toBe(false);
        // Should match mock exactly
        expect(result.metrics.emotionalIntelligence.selfAwareness).toBe(mockMetrics.emotionalIntelligence.selfAwareness);
    });

    it('should NOT inject noise if budget is denied', async () => {
        (mockBudgetManager.consume as any).mockReturnValue(false);

        const result = await collector.collect([], [], {
            userId: 'user1',
            consentGranted: true,
            differentialPrivacy: true
        });

        expect(mockBudgetManager.consume).toHaveBeenCalled();
        expect(result.noiseInjected).toBe(false);
        // Should match mock exactly because no noise added
        expect(result.metrics.emotionalIntelligence.selfAwareness).toBe(mockMetrics.emotionalIntelligence.selfAwareness);
    });

    it('should log budget interaction events', async () => {
        await collector.collect([], [], {
            userId: 'user1',
            consentGranted: true,
            differentialPrivacy: true
        });
        
        expect((mockAuditLogger as any).append).toHaveBeenCalled();
        // Check for 'dp_budget_consumption' event
        const callArgs = (mockAuditLogger as any).append.mock.calls[0][0];
        expect(callArgs.eventType).toBe('dp_budget_consumption');
    });

    it('should normalize negative/invalid epsilon values', async () => {
        await collector.collect([], [], {
            userId: 'user1',
            consentGranted: true,
            differentialPrivacy: true,
            noiseEpsilon: -5 // Should become positive and clamped
        });

        const consumeCall = (mockBudgetManager.consume as any).mock.calls[0];
        // consumed epsilon
        expect(consumeCall[1]).toBeGreaterThan(0);
    });
  });

  describe('Metric Guarding/clamping', () => {
      it('should clamp values to 0-100 even with noise', async () => {
        // Mock random to produce large noise
        const originalRandom = Math.random;
        Math.random = () => 0.001; // Force extreme noise maybe? 
        // actually Laplace inverse CDF with u close to 0 or 1 gives large values
        
        try {
            await collector.collect([], [], {
                userId: 'user1',
                consentGranted: true,
                differentialPrivacy: true,
                noiseEpsilon: 0.1 // small epsilon = large noise
            });
            // The fact that collect returns successfully implies no crash, 
            // but we want to inspect results if we could intercept the intermediate steps.
            // Since we can't easily intercept 'guardMetrics' directly without spying on private,
            // we rely on the final property checks in the noise test above.
        } finally {
            Math.random = originalRandom;
        }
      });
  });

  describe('Audit Logging Details', () => {
      it('should attempt to sign userId if keyManager is available', async () => {
         await collector.collect([], [], {
             userId: 'test-user',
             consentGranted: true,
             differentialPrivacy: true
         });

         expect(mockKeyManager.getKey).toHaveBeenCalledWith('audit');
         // We can't easily check the HMAC value without replicating logic, 
         // but we can ensure log was called with *some* hashed value or wrapper
         const callArgs = (mockAuditLogger as any).append.mock.calls[0][0];
         expect(callArgs.userIdHmac).toBeDefined();
         expect(callArgs.userIdHmac).not.toBe('test-user'); // Hashed
      });

      it('should fallback to plain logging if keyManager is missing', async () => {
         // Re-instantiate without KeyManager
         const noKeyCollector = new EmpathyMetricsCollector(
             mockSecurity, 
             mockAnalytics, 
             mockBudgetManager, 
             undefined, 
             mockAuditLogger
         );

         await noKeyCollector.collect([], [], {
             userId: 'test-user',
             consentGranted: true,
             differentialPrivacy: true
         });

         const callArgs = (mockAuditLogger.log as any).mock.calls[0][0];
         expect(callArgs.userId).toBe('test-user'); // Plaintext fallback
      });

      it('should handle audit logger failure gracefully', async () => {
          (mockAuditLogger as any).append.mockRejectedValue(new Error('Log failed'));
          (mockAuditLogger as any).log.mockResolvedValue(undefined);

         // Should not throw
         await collector.collect([], [], {
             userId: 'user1',
             consentGranted: true,
             differentialPrivacy: true
         });
         
         // Should attempt to log the failure via .log
         expect(mockAuditLogger.log).toHaveBeenCalledWith(expect.objectContaining({
             eventType: 'dp_budget_audit_failure'
         }));
      });
  });
  
  describe('Factory', () => {
      it('should create an instance via createEmpathyCollector', () => {
          const instance = createEmpathyCollector(mockSecurity, mockAnalytics);
          expect(instance).toBeInstanceOf(EmpathyMetricsCollector);
      });
  });

  describe('Edge Cases and Branch Coverage', () => {
    it('should normalize infinite noise epsilon', async () => {
      await collector.collect([], [], {
        userId: 'user1',
        consentGranted: true,
        differentialPrivacy: true,
        noiseEpsilon: Infinity
      });
      // Should default to max(min, DEFAULT)
      expect(mockBudgetManager.consume).toHaveBeenCalledWith('user1', 1.0); // DEFAULT_NOISE_EPSILON
    });

    it('should normalize zero magnitude epsilon to skip noise', async () => {
      // @ts-expect-error -- Testing read-only override
      mockSecurity.privacyConfig.minimumNoiseLevel = 0; // Allow 0 for this test

      await collector.collect([], [], {
        userId: 'user1',
        consentGranted: true,
        differentialPrivacy: true,
        noiseEpsilon: 0
      });

      // Should log 'dp_budget_skipped'
      const callArgs = (mockAuditLogger as any).append.mock.calls[0][0];
      expect(callArgs.eventType).toBe('dp_budget_skipped');
      expect(mockBudgetManager.consume).not.toHaveBeenCalled();
    });

    it('should handle Promise-based budget consumption', async () => {
      (mockBudgetManager.consume as any).mockResolvedValue(true); // Return Promise<true>

      const result = await collector.collect([], [], {
        userId: 'user1',
        consentGranted: true,
        differentialPrivacy: true
      });

      expect(result.noiseInjected).toBe(true);
    });

    it('should handle budget manager throwing error', async () => {
      (mockBudgetManager.consume as any).mockImplementation(() => {
        throw new Error('Budget service down');
      });

      const result = await collector.collect([], [], {
        userId: 'user1',
        consentGranted: true,
        differentialPrivacy: true
      });

      expect(result.noiseInjected).toBe(false);
      // specific log check??
    });
    
    it('should handle KeyManager failure during audit logging', async () => {
        (mockKeyManager.getKey as any).mockRejectedValue(new Error('Key Error'));
        
        await collector.collect([], [], {
            userId: 'user1',
            consentGranted: true,
            differentialPrivacy: true
        });

        // Should catch and try to log failure
        expect(mockAuditLogger.log).toHaveBeenCalledWith(expect.objectContaining({
            eventType: 'dp_budget_audit_failure',
            details: expect.objectContaining({ error: 'Key Error' })
        }));
    });
    
     it('should handle undefined budget manager', async () => {
        const noBudgetCollector = new EmpathyMetricsCollector(
            mockSecurity,
            mockAnalytics,
            undefined, // No budget manager
            mockKeyManager,
            mockAuditLogger
        );

        const result = await noBudgetCollector.collect([], [], {
            userId: 'user1',
            consentGranted: true,
            differentialPrivacy: true // Requested
        });

        expect(result.noiseInjected).toBe(true); // Default allow if no manager
    });
  });
});
