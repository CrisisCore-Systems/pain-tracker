# Testing Privacy-Preserving Analytics: Verifying That Insights Don't Leak Identity

*How do you test that your crisis detection analytics are truly anonymous and can't be reverse-engineered to identify users?*

---

We collect behavioral signals to detect crises. Navigation patterns. Input timing. Feature usage. Preference changes. Each signal is innocuous alone. Together, they form a fingerprint.

A researcher demonstrated this to us: "I can identify 87% of your users from their navigation patterns alone, even without any explicit identifiers." 

Our privacy policy said "anonymous analytics." Our implementation said otherwise.

This is the story of how we learned to test that our analytics actually preserve privacy—and don't just claim to.

## The Re-identification Problem

Even without names or emails, behavioral patterns can identify individuals:

```typescript
interface ReidentificationRisk {
  // What data might identify someone?
  potentialIdentifiers: {
    explicit: string[];     // Things obviously identifying (email, name)
    quasiIdentifiers: string[];  // Things that combine to identify
    behavioral: string[];   // Patterns unique enough to fingerprint
  };
  
  // How attacks work
  attackVectors: {
    linkageAttack: 'Combining our data with external datasets';
    fingerprintAttack: 'Unique behavioral patterns identify individuals';
    inferenceAttack: 'Deriving sensitive info from non-sensitive data';
    temporalAttack: 'Tracking changes over time reveals identity';
  };
}

// Our data contains quasi-identifiers we didn't initially recognize
const QUASI_IDENTIFIERS_DISCOVERED = [
  'time_of_day_usage_pattern',      // 3am user is distinctive
  'session_duration_distribution',   // Very consistent users stand out
  'feature_adoption_sequence',       // Order of feature discovery is unique
  'pain_location_combination',       // Rare pain combinations identify
  'language_patterns_in_notes',      // Writing style is a fingerprint
  'navigation_entropy_signature',    // How someone moves through app
  'crisis_frequency_pattern',        // Personal crisis rhythm
  'recovery_trajectory_shape'        // Individual recovery patterns
];
```

## k-Anonymity Testing

We test that any record is indistinguishable from at least k-1 other records:

```typescript
describe('k-Anonymity Validation', () => {
  it('ensures minimum k=5 anonymity for all released data', async () => {
    const analyticsData = await getReleasableAnalytics();
    const k = 5; // Minimum group size
    
    // Group by quasi-identifier combinations
    const groups = groupByQuasiIdentifiers(analyticsData, [
      'age_bucket',
      'region',
      'condition_category',
      'usage_frequency_bucket'
    ]);
    
    for (const [groupKey, records] of groups) {
      expect(records.length).toBeGreaterThanOrEqual(k);
      
      if (records.length < k) {
        console.error(`k-anonymity violation: group ${groupKey} has only ${records.length} records`);
      }
    }
  });
  
  it('generalizes data to achieve k-anonymity', async () => {
    const rawData = await getRawAnalytics();
    const anonymizer = new KAnonymizer({ k: 5 });
    const anonymizedData = anonymizer.anonymize(rawData);
    
    // Verify generalization happened
    expect(anonymizedData[0].age).toMatch(/^\d{2}-\d{2}$/); // Age range, not exact
    expect(anonymizedData[0].region).not.toContain('Street'); // Generalized location
    
    // Verify k-anonymity holds
    const groups = groupByQuasiIdentifiers(anonymizedData, 
      anonymizer.getQuasiIdentifiers()
    );
    
    const violations = [...groups.values()].filter(g => g.length < 5);
    expect(violations.length).toBe(0);
  });
  
  it('suppresses outliers that cannot be anonymized', async () => {
    const rawData = await getRawAnalytics();
    
    // Include a very unique user
    rawData.push({
      id: 'unique-user',
      age: 99,                        // Very rare
      region: 'remote-island',        // Very rare
      condition: 'rare-syndrome',     // Very rare
      usage: 'pattern-xyz'            // Unique
    });
    
    const anonymizer = new KAnonymizer({ k: 5, suppressionThreshold: 0.1 });
    const result = anonymizer.anonymize(rawData);
    
    // Unique user should be suppressed (not included)
    expect(result.anonymizedData.find(r => r.originalId === 'unique-user')).toBeUndefined();
    expect(result.suppressedCount).toBeGreaterThan(0);
    expect(result.suppressionReason).toContain('k-anonymity');
  });
});

class KAnonymizer {
  private k: number;
  private quasiIdentifiers: string[];
  private generalizationHierarchies: Map<string, GeneralizationHierarchy>;
  
  anonymize(data: AnalyticsRecord[]): AnonymizationResult {
    let current = [...data];
    let suppressed: AnalyticsRecord[] = [];
    
    // Iteratively generalize until k-anonymity achieved
    while (!this.checkKAnonymity(current, this.k)) {
      // Find the quasi-identifier causing most violations
      const problematicQI = this.findMostProblematicQI(current);
      
      // Generalize it one level
      current = this.generalizeAttribute(current, problematicQI);
      
      // If max generalization reached, suppress remaining violations
      if (this.isMaxGeneralization(problematicQI)) {
        const { kept, removed } = this.suppressViolations(current);
        current = kept;
        suppressed = [...suppressed, ...removed];
      }
    }
    
    return {
      anonymizedData: current,
      suppressedCount: suppressed.length,
      generalizationLevels: this.getGeneralizationLevels()
    };
  }
  
  private checkKAnonymity(data: AnalyticsRecord[], k: number): boolean {
    const groups = this.groupByQIs(data);
    return [...groups.values()].every(group => group.length >= k);
  }
}
```

## Differential Privacy Testing

We add calibrated noise to prevent individual record inference:

```typescript
describe('Differential Privacy Validation', () => {
  const EPSILON = 0.1; // Privacy budget - smaller = more privacy
  
  it('query results are stable regardless of any single individual', async () => {
    const fullData = await getAnalyticsData();
    
    // Remove one random individual
    const withoutOneUser = fullData.filter((_, i) => i !== Math.floor(Math.random() * fullData.length));
    
    const dpEngine = new DifferentialPrivacyEngine({ epsilon: EPSILON });
    
    // Run same query on both datasets
    const query = { type: 'count', filter: { crisisType: 'panic_attack' } };
    
    const resultFull = dpEngine.query(fullData, query);
    const resultWithout = dpEngine.query(withoutOneUser, query);
    
    // Results should be similar (within noise bounds)
    const expectedNoiseBound = Math.ceil(1 / EPSILON);
    expect(Math.abs(resultFull - resultWithout)).toBeLessThan(expectedNoiseBound * 2);
  });
  
  it('prevents membership inference attacks', async () => {
    const data = await getAnalyticsData();
    const dpEngine = new DifferentialPrivacyEngine({ epsilon: EPSILON });
    
    // Attacker has auxiliary information about a target
    const targetProfile = {
      ageRange: '30-40',
      region: 'Pacific Northwest',
      conditionCategory: 'chronic_pain'
    };
    
    // Query that might reveal if target is in dataset
    const attackQuery = {
      type: 'count',
      filter: targetProfile
    };
    
    // Run attack many times
    const attackResults: number[] = [];
    for (let i = 0; i < 100; i++) {
      attackResults.push(dpEngine.query(data, attackQuery));
    }
    
    // Variance should be high enough to prevent confident inference
    const variance = calculateVariance(attackResults);
    expect(variance).toBeGreaterThan(0.5);
    
    // Attacker's confidence should be limited
    const inferenceConfidence = calculateInferenceConfidence(attackResults);
    expect(inferenceConfidence).toBeLessThan(0.7); // Less than 70% confidence
  });
  
  it('tracks and enforces privacy budget', async () => {
    const data = await getAnalyticsData();
    const dpEngine = new DifferentialPrivacyEngine({ 
      epsilon: 1.0,  // Total budget
      budgetPerQuery: 0.1 
    });
    
    // Run 10 queries (exhausts budget)
    for (let i = 0; i < 10; i++) {
      dpEngine.query(data, { type: 'count' });
    }
    
    // 11th query should fail
    expect(() => {
      dpEngine.query(data, { type: 'count' });
    }).toThrow('Privacy budget exhausted');
  });
  
  it('adds appropriate noise for different query sensitivities', () => {
    const dpEngine = new DifferentialPrivacyEngine({ epsilon: EPSILON });
    
    // Count query: sensitivity = 1
    const countNoise = dpEngine.calculateNoise({ type: 'count' });
    
    // Sum query on bounded value: sensitivity = max_value
    const sumNoise = dpEngine.calculateNoise({ type: 'sum', maxValue: 100 });
    
    // Sum should have more noise than count
    expect(sumNoise).toBeGreaterThan(countNoise);
    expect(sumNoise / countNoise).toBeCloseTo(100, 0); // ~100x more noise
  });
});

class DifferentialPrivacyEngine {
  private epsilon: number;
  private budgetUsed: number = 0;
  private budgetPerQuery: number;
  
  query(data: AnalyticsRecord[], query: DPQuery): number {
    // Check budget
    if (this.budgetUsed + this.budgetPerQuery > this.epsilon) {
      throw new Error('Privacy budget exhausted');
    }
    
    // Calculate true answer
    const trueAnswer = this.executeQuery(data, query);
    
    // Calculate sensitivity based on query type
    const sensitivity = this.calculateSensitivity(query);
    
    // Add Laplace noise
    const noise = this.laplaceSample(sensitivity / this.budgetPerQuery);
    
    // Track budget
    this.budgetUsed += this.budgetPerQuery;
    
    return Math.round(trueAnswer + noise);
  }
  
  private laplaceSample(scale: number): number {
    // Sample from Laplace distribution
    const u = Math.random() - 0.5;
    return -scale * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
  }
  
  private calculateSensitivity(query: DPQuery): number {
    switch (query.type) {
      case 'count': return 1;
      case 'sum': return query.maxValue || 1;
      case 'average': return (query.maxValue || 1) / (query.minGroupSize || 1);
      default: return 1;
    }
  }
}
```

## Behavioral Fingerprinting Prevention

Even with k-anonymity and differential privacy, behavioral patterns can fingerprint:

```typescript
describe('Behavioral Fingerprinting Prevention', () => {
  it('prevents re-identification from navigation patterns', async () => {
    const userPatterns = generateUniqueUserPatterns(1000);
    const anonymizer = new BehavioralAnonymizer();
    const anonymized = anonymizer.anonymize(userPatterns);
    
    // Attempt re-identification
    const attacker = new FingerprintAttacker();
    const reidentificationAttempts = attacker.attemptReidentification(
      anonymized, 
      userPatterns
    );
    
    // Should have very low success rate
    expect(reidentificationAttempts.successRate).toBeLessThan(0.01); // <1%
    expect(reidentificationAttempts.confidenceDistribution.high).toBeLessThan(0.05); // <5% high confidence
  });
  
  it('aggregates behavioral signals to prevent fingerprinting', () => {
    const rawSession: SessionData = {
      navigationSequence: ['home', 'pain-entry', 'analytics', 'settings', 'home'],
      timingPattern: [0, 1200, 5400, 8900, 12000],
      clickPattern: { x: [120, 340, 560], y: [200, 400, 100] }
    };
    
    const anonymizer = new BehavioralAnonymizer();
    const anonymized = anonymizer.anonymizeSession(rawSession);
    
    // Navigation should be bucketed, not sequenced
    expect(anonymized.navigationSummary).toBeDefined();
    expect(anonymized.navigationSequence).toBeUndefined();
    expect(anonymized.navigationSummary).toEqual({
      pagesVisited: 4,          // Just count
      categories: ['tracking', 'analysis', 'settings'], // Categories, not exact pages
      sessionType: 'exploration' // Classification, not pattern
    });
    
    // Timing should be bucketed
    expect(anonymized.timingPattern).toBeUndefined();
    expect(anonymized.sessionDuration).toBe('10-15min'); // Bucket, not exact
    
    // No click coordinates
    expect(anonymized.clickPattern).toBeUndefined();
  });
  
  it('adds noise to usage timestamps to prevent temporal fingerprinting', () => {
    const rawTimestamps = [
      '2024-01-15T03:15:23.456Z', // Very specific
      '2024-01-15T03:45:12.789Z',
      '2024-01-15T04:02:45.123Z'
    ];
    
    const anonymizer = new BehavioralAnonymizer();
    const anonymized = anonymizer.anonymizeTimestamps(rawTimestamps);
    
    // Should only preserve hour-level granularity
    for (const ts of anonymized) {
      expect(ts).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:00:00.000Z$/);
    }
    
    // Should add random offset (±30 min) to prevent exact time inference
    const originalHour = new Date(rawTimestamps[0]).getHours();
    const anonymizedHours = anonymized.map(ts => new Date(ts).getHours());
    
    // At least some should be different (random offset applied)
    // This is probabilistic - run multiple times if needed
    expect(anonymizedHours.some(h => h !== originalHour)).toBe(true);
  });
});

class FingerprintAttacker {
  attemptReidentification(
    anonymized: AnonymizedPattern[],
    original: UserPattern[]
  ): ReidentificationResult {
    let successCount = 0;
    const confidences: number[] = [];
    
    for (const anonPattern of anonymized) {
      // Try to match to original users
      const matches = original.map(orig => ({
        user: orig.userId,
        similarity: this.calculateSimilarity(anonPattern, orig)
      })).sort((a, b) => b.similarity - a.similarity);
      
      const bestMatch = matches[0];
      const secondMatch = matches[1];
      
      // Confidence based on margin between best and second match
      const confidence = bestMatch.similarity - secondMatch.similarity;
      confidences.push(confidence);
      
      // Check if attack succeeded
      if (bestMatch.user === anonPattern.originalUserId && confidence > 0.5) {
        successCount++;
      }
    }
    
    return {
      successRate: successCount / anonymized.length,
      confidenceDistribution: {
        high: confidences.filter(c => c > 0.7).length / confidences.length,
        medium: confidences.filter(c => c > 0.3 && c <= 0.7).length / confidences.length,
        low: confidences.filter(c => c <= 0.3).length / confidences.length
      }
    };
  }
  
  private calculateSimilarity(anon: AnonymizedPattern, orig: UserPattern): number {
    // Use multiple signals to attempt fingerprinting
    const signals = [
      this.compareTiming(anon, orig),
      this.compareNavigation(anon, orig),
      this.compareFeatureUsage(anon, orig)
    ];
    
    return signals.reduce((a, b) => a + b, 0) / signals.length;
  }
}
```

## Data Minimization Testing

We verify we only collect what we need:

```typescript
describe('Data Minimization Verification', () => {
  it('collects only signals necessary for crisis detection', () => {
    const collectedSignals = getAllCollectedSignals();
    const requiredSignals = getCrisisDetectionRequiredSignals();
    
    // Every collected signal should be justified
    for (const signal of collectedSignals) {
      expect(requiredSignals).toContain(signal);
      expect(getSignalJustification(signal)).toBeDefined();
    }
    
    // Should not collect these explicitly unnecessary signals
    const unnecessarySignals = [
      'exact_click_coordinates',
      'keystroke_timing',
      'device_fingerprint',
      'ip_address',
      'precise_location',
      'contact_list_access'
    ];
    
    for (const unnecessary of unnecessarySignals) {
      expect(collectedSignals).not.toContain(unnecessary);
    }
  });
  
  it('implements automatic data expiration', async () => {
    const storage = new PrivacyAwareStorage();
    
    // Store some analytics data
    await storage.store('session_data', { test: 'data' }, { 
      retention: '30days' 
    });
    
    // Fast-forward 31 days
    await advanceTime(31 * 24 * 60 * 60 * 1000);
    
    // Data should be gone
    const retrieved = await storage.retrieve('session_data');
    expect(retrieved).toBeNull();
  });
  
  it('provides data inventory for transparency', () => {
    const inventory = getDataInventory();
    
    // Every data type should be documented
    for (const dataType of inventory) {
      expect(dataType.name).toBeDefined();
      expect(dataType.purpose).toBeDefined();
      expect(dataType.retention).toBeDefined();
      expect(dataType.legalBasis).toBeDefined();
      expect(dataType.userControl).toBeDefined(); // Can user delete?
    }
    
    // Should be exportable for user transparency
    const userFriendlyInventory = generateUserDataReport();
    expect(userFriendlyInventory.readabilityScore).toBeGreaterThan(0.7);
  });
});
```

## Local-Only Analytics Testing

We verify analytics stay on device:

```typescript
describe('Local-Only Analytics Verification', () => {
  it('performs all crisis detection locally', async () => {
    const networkSpy = vi.spyOn(global, 'fetch');
    
    // Run full crisis detection workflow
    const detector = new CrisisDetector();
    await detector.analyzeSession(mockSession);
    
    // Should not have made any network calls
    expect(networkSpy).not.toHaveBeenCalled();
  });
  
  it('stores insights only in local IndexedDB', async () => {
    const insights = await generateUserInsights(mockEntries);
    
    // Should be stored locally
    const localData = await indexedDB.get('insights');
    expect(localData).toEqual(insights);
    
    // Should not exist on any server
    const serverCheck = await checkServerForData('insights');
    expect(serverCheck.exists).toBe(false);
  });
  
  it('exports data only when user explicitly requests', async () => {
    const networkSpy = vi.spyOn(global, 'fetch');
    
    // Normal app usage - no exports
    await normalAppUsageSimulation(60 * 60 * 1000); // 1 hour
    expect(networkSpy).not.toHaveBeenCalled();
    
    // User explicitly exports to provider
    await userEvent.click(screen.getByRole('button', { name: /export to provider/i }));
    await userEvent.click(screen.getByRole('button', { name: /confirm export/i }));
    
    // Now network call is appropriate
    expect(networkSpy).toHaveBeenCalledTimes(1);
    expect(networkSpy).toHaveBeenCalledWith(
      expect.stringContaining('/export'),
      expect.objectContaining({ method: 'POST' })
    );
  });
  
  it('never sends raw crisis signals to analytics services', async () => {
    // Mock analytics service
    const analyticsSpy = vi.spyOn(analyticsService, 'track');
    
    // Trigger crisis detection
    await triggerCrisisScenario('panic_attack');
    
    // Check what was sent to analytics
    const analyticsCallls = analyticsSpy.mock.calls;
    
    for (const [eventName, eventData] of analyticsCallls) {
      // Should only send aggregate/anonymized events
      expect(eventName).not.toContain('raw_');
      expect(eventData).not.toHaveProperty('navigationSequence');
      expect(eventData).not.toHaveProperty('inputPattern');
      expect(eventData).not.toHaveProperty('timestamp'); // Exact timestamps
      
      // Allowed: aggregated, anonymized metrics
      if (eventData.crisisType) {
        expect(eventData.crisisType).toBe('detected'); // Not specific type
      }
    }
  });
});
```

## Privacy Attack Simulation

We simulate attackers to verify our defenses:

```typescript
describe('Privacy Attack Simulations', () => {
  describe('Linkage Attack', () => {
    it('resists linkage with external health datasets', async () => {
      // Our anonymized data
      const ourData = await getAnonymizedAnalytics();
      
      // Simulated external dataset (e.g., public health records)
      const externalData = generateExternalHealthDataset();
      
      const attacker = new LinkageAttacker();
      const linkageResult = attacker.attemptLinkage(ourData, externalData);
      
      // Should be unable to link records
      expect(linkageResult.linkedRecords).toBe(0);
      expect(linkageResult.partialMatches).toBeLessThan(ourData.length * 0.01);
    });
  });
  
  describe('Inference Attack', () => {
    it('resists inference of sensitive attributes', async () => {
      const data = await getAnonymizedAnalytics();
      
      const attacker = new InferenceAttacker();
      
      // Try to infer crisis severity from non-sensitive data
      const severityInference = attacker.attemptInference(data, {
        targetAttribute: 'crisis_severity',
        knownAttributes: ['session_duration', 'pages_visited', 'time_of_day']
      });
      
      // Inference accuracy should be no better than random
      expect(severityInference.accuracy).toBeLessThan(0.35); // 3 categories = 33% random
      
      // Try to infer condition type
      const conditionInference = attacker.attemptInference(data, {
        targetAttribute: 'condition_type',
        knownAttributes: ['feature_usage', 'session_pattern']
      });
      
      expect(conditionInference.accuracy).toBeLessThan(0.3);
    });
  });
  
  describe('Temporal Correlation Attack', () => {
    it('resists correlation of sessions over time', async () => {
      // Get sessions that belong to same user (for testing)
      const userSessions = await getUserSessions('test-user');
      const anonymizedSessions = anonymizeSessions(userSessions);
      
      const attacker = new TemporalAttacker();
      const correlationResult = attacker.attemptCorrelation(anonymizedSessions);
      
      // Should not be able to determine these sessions are from same user
      expect(correlationResult.confidenceScore).toBeLessThan(0.5);
      expect(correlationResult.linkedSessions).toBe(0);
    });
  });
});

class LinkageAttacker {
  attemptLinkage(
    targetData: AnonymizedRecord[],
    externalData: ExternalRecord[]
  ): LinkageResult {
    let linkedCount = 0;
    let partialMatchCount = 0;
    
    for (const target of targetData) {
      for (const external of externalData) {
        const matchScore = this.calculateMatchScore(target, external);
        
        if (matchScore > 0.9) {
          linkedCount++;
        } else if (matchScore > 0.5) {
          partialMatchCount++;
        }
      }
    }
    
    return {
      linkedRecords: linkedCount,
      partialMatches: partialMatchCount,
      attackSuccess: linkedCount > 0
    };
  }
  
  private calculateMatchScore(target: AnonymizedRecord, external: ExternalRecord): number {
    // Try to match on quasi-identifiers
    let score = 0;
    let weights = 0;
    
    // Age range match
    if (target.ageRange && external.ageRange) {
      score += this.ageRangeOverlap(target.ageRange, external.ageRange) * 0.2;
      weights += 0.2;
    }
    
    // Region match
    if (target.region && external.region) {
      score += (target.region === external.region ? 1 : 0) * 0.3;
      weights += 0.3;
    }
    
    // Condition category match
    if (target.conditionCategory && external.conditionCategory) {
      score += (target.conditionCategory === external.conditionCategory ? 1 : 0) * 0.3;
      weights += 0.3;
    }
    
    return weights > 0 ? score / weights : 0;
  }
}
```

## Privacy Dashboard

We surface privacy metrics for continuous monitoring:

```typescript
function PrivacyDashboard() {
  const [privacyMetrics, setPrivacyMetrics] = useState<PrivacyMetrics | null>(null);
  
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Privacy Protection Status</h1>
      
      {/* k-Anonymity Status */}
      <section>
        <h2 className="text-lg font-semibold mb-4">k-Anonymity Status</h2>
        <div className="grid grid-cols-3 gap-4">
          <MetricCard 
            label="Current k value"
            value={privacyMetrics?.kAnonymity.currentK}
            target={5}
            status={privacyMetrics?.kAnonymity.currentK >= 5 ? 'good' : 'warning'}
          />
          <MetricCard 
            label="Suppression Rate"
            value={`${(privacyMetrics?.kAnonymity.suppressionRate * 100).toFixed(1)}%`}
            target="<5%"
            status={privacyMetrics?.kAnonymity.suppressionRate < 0.05 ? 'good' : 'warning'}
          />
          <MetricCard 
            label="Smallest Group"
            value={privacyMetrics?.kAnonymity.smallestGroup}
            target="≥5"
            status={privacyMetrics?.kAnonymity.smallestGroup >= 5 ? 'good' : 'error'}
          />
        </div>
      </section>
      
      {/* Differential Privacy Budget */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Differential Privacy Budget</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Budget Used</span>
            <span>{privacyMetrics?.diffPrivacy.budgetUsed.toFixed(2)} / {privacyMetrics?.diffPrivacy.totalBudget}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className={`h-4 rounded-full ${
                privacyMetrics?.diffPrivacy.budgetUsed / privacyMetrics?.diffPrivacy.totalBudget < 0.7 
                  ? 'bg-green-500' 
                  : 'bg-yellow-500'
              }`}
              style={{ 
                width: `${(privacyMetrics?.diffPrivacy.budgetUsed / privacyMetrics?.diffPrivacy.totalBudget) * 100}%` 
              }}
            />
          </div>
          <p className="text-sm text-gray-600">
            Budget resets: {privacyMetrics?.diffPrivacy.resetDate}
          </p>
        </div>
      </section>
      
      {/* Attack Simulation Results */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Latest Attack Simulation Results</h2>
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left">Attack Type</th>
              <th className="text-left">Success Rate</th>
              <th className="text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {privacyMetrics?.attackSimulations.map(sim => (
              <tr key={sim.attackType}>
                <td>{sim.attackType}</td>
                <td>{(sim.successRate * 100).toFixed(2)}%</td>
                <td>
                  <StatusBadge 
                    status={sim.successRate < 0.01 ? 'protected' : 'vulnerable'} 
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      
      {/* Data Inventory */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Data Inventory</h2>
        <DataInventoryTable data={privacyMetrics?.dataInventory} />
      </section>
    </div>
  );
}
```

## Conclusion

Privacy testing isn't about checking a compliance box. It's about building systems that users can trust with their most vulnerable moments.

Key takeaways:

1. **k-Anonymity is baseline**: Every record should be indistinguishable from at least k-1 others.

2. **Differential privacy for queries**: Add calibrated noise so no individual's presence affects results.

3. **Prevent behavioral fingerprinting**: Aggregate and generalize patterns that could identify individuals.

4. **Minimize by default**: Only collect what you absolutely need, and prove it.

5. **Keep analytics local**: Crisis detection should never require sending sensitive data to servers.

6. **Simulate attacks**: If you don't test your defenses, you don't have defenses.

Users trust us with data about their worst moments. That trust is sacred. Our privacy testing exists to ensure we deserve it.

---

*This is Part 12 of our series on building trauma-informed healthcare applications. Previous posts covered [crisis detection](/blog/false-positives-calibrating-crisis-detection), [testing strategies](/blog/testing-the-untestable), [recovery testing](/blog/testing-recovery), [cultural contexts](/blog/internationalization-of-trauma), [validation](/blog/testing-the-testing), and [co-occurrence](/blog/testing-co-occurrence).*

**Coming Next**: "Testing Across the Stack: From Frontend UI to Local Database Resilience"

---

**Tags**: #privacy #security #differential-privacy #k-anonymity #healthcare #testing #HIPAA #GDPR #analytics
