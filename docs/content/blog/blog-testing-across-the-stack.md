# Testing Across the Stack: From Frontend UI to Local Database Resilience

*Crisis features span multiple layers. How do you test the entire stack under simulated distress?*

---

Our crisis detection starts in the DOM—a click event, a navigation action, an input pattern. It flows through React state, into Zustand stores, through analysis engines, into IndexedDB for persistence, and back up through service workers for offline support.

A bug anywhere in this chain could mean a missed crisis.

We once had a user whose crisis was detected correctly, but a race condition in IndexedDB meant their crisis history wasn't saved. When they opened the app the next day, it was as if the crisis never happened. No record. No insights. No learning.

This is why we test the entire stack under simulated distress conditions.

## The Full Stack Signal Flow

Before testing, we map the complete signal path:

```typescript
interface FullStackSignalFlow {
  layers: {
    dom: {
      inputs: ['click events', 'navigation events', 'form inputs', 'scroll events'];
      timing: 'real-time';
      failure_modes: ['event listener detachment', 'event coalescing', 'throttling loss'];
    };
    
    react: {
      inputs: ['synthetic events', 'state updates', 'effect triggers'];
      timing: 'batched';
      failure_modes: ['stale closures', 'missed updates', 'concurrent mode race conditions'];
    };
    
    state_management: {
      inputs: ['actions', 'selectors'];
      timing: 'synchronous with middleware';
      failure_modes: ['middleware errors', 'selector memoization bugs', 'subscription leaks'];
    };
    
    analysis_engine: {
      inputs: ['normalized signals', 'historical context'];
      timing: 'async/batched';
      failure_modes: ['worker crashes', 'memory leaks', 'algorithm errors'];
    };
    
    persistence: {
      inputs: ['state snapshots', 'entry data'];
      timing: 'async with retries';
      failure_modes: ['IndexedDB quota', 'transaction aborts', 'encryption failures'];
    };
    
    service_worker: {
      inputs: ['fetch events', 'sync events', 'push events'];
      timing: 'background/async';
      failure_modes: ['registration failure', 'cache corruption', 'sync race conditions'];
    };
  };
}
```

## End-to-End Signal Flow Testing

We test the complete path from user interaction to persisted insight:

```typescript
describe('End-to-End Signal Flow', () => {
  it('tracks signal from DOM event to persisted crisis record', async () => {
    // Instrument all layers
    const flowTracker = new SignalFlowTracker();
    flowTracker.instrumentAll();
    
    // Simulate panic attack pattern at DOM level
    await simulatePanicNavigationPattern();
    
    // Wait for full propagation
    await waitFor(() => {
      expect(flowTracker.getCompletedLayers()).toContain('persistence');
    }, { timeout: 5000 });
    
    // Verify signal reached each layer
    const flow = flowTracker.getFlow();
    
    expect(flow.dom.received).toBe(true);
    expect(flow.dom.signalCount).toBeGreaterThan(5);
    
    expect(flow.react.received).toBe(true);
    expect(flow.react.stateUpdates).toBeGreaterThan(0);
    
    expect(flow.stateManagement.received).toBe(true);
    expect(flow.stateManagement.actionsDispatched).toContain('crisis/detected');
    
    expect(flow.analysisEngine.received).toBe(true);
    expect(flow.analysisEngine.crisisType).toBe('panic_attack');
    
    expect(flow.persistence.received).toBe(true);
    expect(flow.persistence.recordId).toBeDefined();
    
    // Verify data integrity end-to-end
    const persistedRecord = await indexedDB.get('crisisHistory', flow.persistence.recordId);
    expect(persistedRecord.type).toBe('panic_attack');
    expect(persistedRecord.signals).toHaveLength(flow.dom.signalCount);
  });
  
  it('handles signal loss at each layer gracefully', async () => {
    const layers = ['dom', 'react', 'stateManagement', 'analysisEngine', 'persistence'];
    
    for (const failingLayer of layers) {
      // Inject failure at specific layer
      const failureInjector = new LayerFailureInjector();
      failureInjector.injectFailure(failingLayer, 'timeout');
      
      // Simulate crisis
      await simulatePanicNavigationPattern();
      
      // System should handle gracefully
      await waitFor(() => {
        const errorState = getErrorState();
        expect(errorState.userFacing).toBe(false); // Don't show error to distressed user
        expect(errorState.logged).toBe(true);      // But log for debugging
        expect(errorState.recovered).toBe(true);   // Automatic recovery attempted
      });
      
      failureInjector.restore();
    }
  });
});

class SignalFlowTracker {
  private flow: Map<string, LayerFlow> = new Map();
  
  instrumentAll(): void {
    // DOM layer
    this.instrumentDOM();
    // React layer
    this.instrumentReact();
    // State management
    this.instrumentZustand();
    // Analysis engine
    this.instrumentAnalysisEngine();
    // Persistence
    this.instrumentIndexedDB();
    // Service worker
    this.instrumentServiceWorker();
  }
  
  private instrumentDOM(): void {
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    const tracker = this;
    
    EventTarget.prototype.addEventListener = function(type, listener, options) {
      const wrappedListener = function(event: Event) {
        tracker.recordDOMEvent(type, event);
        return (listener as EventListener).call(this, event);
      };
      return originalAddEventListener.call(this, type, wrappedListener, options);
    };
  }
  
  private instrumentZustand(): void {
    const stores = [usePainTrackerStore, useCrisisStore];
    
    for (const store of stores) {
      const originalSetState = store.setState;
      const tracker = this;
      
      store.setState = function(partial, replace) {
        tracker.recordStateUpdate(partial);
        return originalSetState.call(this, partial, replace);
      };
    }
  }
}
```

## Database Resilience Testing

IndexedDB must survive chaotic usage patterns:

```typescript
describe('IndexedDB Resilience Under Crisis', () => {
  it('survives rapid write/read cycles during panic', async () => {
    const db = await openCrisisDatabase();
    const operations: Promise<void>[] = [];
    
    // Simulate panic: rapid, chaotic database operations
    for (let i = 0; i < 100; i++) {
      // Mix of writes and reads, no waiting
      operations.push(db.put('signals', { id: i, type: 'nav', timestamp: Date.now() }));
      operations.push(db.get('signals', Math.floor(Math.random() * i) || 0));
      operations.push(db.put('state', { id: 'current', data: { iteration: i } }));
    }
    
    // All operations should complete without error
    await expect(Promise.all(operations)).resolves.toBeDefined();
    
    // Data should be consistent
    const allSignals = await db.getAll('signals');
    expect(allSignals.length).toBe(100);
  });
  
  it('recovers from quota exceeded errors', async () => {
    const db = await openCrisisDatabase();
    
    // Fill up storage to near quota
    const largeData = new Array(1000000).fill('x').join('');
    let quotaExceeded = false;
    
    try {
      for (let i = 0; i < 100; i++) {
        await db.put('largeData', { id: i, data: largeData });
      }
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        quotaExceeded = true;
      }
    }
    
    // Even if quota exceeded, critical crisis data should still work
    const criticalWrite = await db.put('crisisHistory', { 
      id: 'critical-1', 
      type: 'panic_attack', 
      timestamp: Date.now() 
    });
    
    expect(criticalWrite).toBeDefined();
    
    // Verify critical data store has reserved space
    const criticalData = await db.get('crisisHistory', 'critical-1');
    expect(criticalData).toBeDefined();
  });
  
  it('handles transaction aborts gracefully', async () => {
    const db = await openCrisisDatabase();
    
    // Simulate transaction abort (e.g., from tab closing)
    const abortController = new AbortController();
    
    const transaction = db.transaction(['signals', 'state'], 'readwrite', {
      signal: abortController.signal
    });
    
    // Start write
    const writePromise = transaction.objectStore('signals').put({ id: 1, data: 'test' });
    
    // Abort mid-transaction
    abortController.abort();
    
    // Should not throw, should handle gracefully
    await expect(writePromise).rejects.toThrow('AbortError');
    
    // System should recover and allow new transactions
    const recoveryWrite = await db.put('signals', { id: 2, data: 'recovered' });
    expect(recoveryWrite).toBeDefined();
  });
  
  it('maintains data integrity during browser crash simulation', async () => {
    const db = await openCrisisDatabase();
    
    // Write critical data
    await db.put('crisisHistory', { 
      id: 'pre-crash', 
      type: 'pain_flare', 
      timestamp: Date.now() 
    });
    
    // Simulate crash by closing connection without cleanup
    db.close();
    
    // Reopen (simulating browser restart)
    const recoveredDb = await openCrisisDatabase();
    
    // Data should persist
    const data = await recoveredDb.get('crisisHistory', 'pre-crash');
    expect(data).toBeDefined();
    expect(data.type).toBe('pain_flare');
  });
});
```

## Service Worker Reliability Testing

Offline crisis support is critical:

```typescript
describe('Service Worker Reliability', () => {
  it('caches crisis resources on first visit', async () => {
    const sw = await navigator.serviceWorker.ready;
    
    // Check critical resources are cached
    const cache = await caches.open('crisis-resources-v1');
    const cachedResources = await cache.keys();
    
    const criticalResources = [
      '/crisis-support.html',
      '/breathing-exercise.html',
      '/grounding-technique.html',
      '/emergency-contacts.html',
      '/offline-crisis.js'
    ];
    
    for (const resource of criticalResources) {
      expect(cachedResources.map(r => r.url)).toContainEqual(
        expect.stringContaining(resource)
      );
    }
  });
  
  it('serves crisis pages offline', async () => {
    // Go offline
    await setNetworkCondition('offline');
    
    // Try to access crisis page
    const response = await fetch('/crisis-support.html');
    
    expect(response.ok).toBe(true);
    expect(response.headers.get('x-served-from')).toBe('cache');
    
    const content = await response.text();
    expect(content).toContain('Crisis Support');
    
    // Restore network
    await setNetworkCondition('online');
  });
  
  it('queues crisis reports for sync when offline', async () => {
    await setNetworkCondition('offline');
    
    // User reports crisis while offline
    await reportCrisis({
      type: 'panic_attack',
      severity: 8,
      timestamp: Date.now()
    });
    
    // Check sync queue
    const registration = await navigator.serviceWorker.ready;
    const tags = await registration.sync.getTags();
    
    expect(tags).toContain('crisis-report-sync');
    
    // Go online - should sync automatically
    await setNetworkCondition('online');
    
    await waitFor(async () => {
      const pendingSync = await registration.sync.getTags();
      expect(pendingSync).not.toContain('crisis-report-sync');
    }, { timeout: 5000 });
    
    // Verify synced
    const serverRecords = await fetchServerCrisisRecords();
    expect(serverRecords).toContainEqual(
      expect.objectContaining({ type: 'panic_attack', severity: 8 })
    );
  });
  
  it('handles service worker update during crisis', async () => {
    // Start crisis detection
    const crisisPromise = detectCrisis(mockPanicSession);
    
    // Trigger service worker update mid-detection
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
    
    // Crisis detection should complete despite update
    const result = await crisisPromise;
    expect(result.detected).toBe(true);
    expect(result.interrupted).toBe(false);
  });
  
  it('preserves crisis state across service worker restarts', async () => {
    // Set crisis state
    await setCrisisState({
      activeCrisis: 'pain_flare',
      startTime: Date.now() - 300000,
      adaptationsApplied: ['reduced_complexity', 'larger_touch_targets']
    });
    
    // Force service worker restart
    const registration = await navigator.serviceWorker.ready;
    await registration.unregister();
    await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;
    
    // State should persist
    const restoredState = await getCrisisState();
    expect(restoredState.activeCrisis).toBe('pain_flare');
    expect(restoredState.adaptationsApplied).toContain('reduced_complexity');
  });
});
```

## Encryption Under Duress Testing

Data must stay encrypted even during system stress:

```typescript
describe('Encryption Under Duress', () => {
  it('encrypts all writes even during rapid operations', async () => {
    const encryptionSpy = vi.spyOn(encryptionService, 'encrypt');
    
    // Rapid writes (simulating panic navigation with state saves)
    for (let i = 0; i < 50; i++) {
      await saveState({ navigationEvent: i, timestamp: Date.now() });
    }
    
    // Every write should have been encrypted
    expect(encryptionSpy).toHaveBeenCalledTimes(50);
  });
  
  it('never stores plaintext even on encryption failure', async () => {
    // Force encryption to fail
    vi.spyOn(encryptionService, 'encrypt').mockRejectedValue(new Error('Encryption failed'));
    
    // Attempt to save sensitive data
    const sensitiveData = { crisisType: 'panic_attack', notes: 'sensitive content' };
    
    await expect(saveState(sensitiveData)).rejects.toThrow('Encryption failed');
    
    // Verify nothing was stored in plaintext
    const allData = await getAllStoredData();
    
    for (const record of allData) {
      // Should not contain any plaintext sensitive data
      const recordString = JSON.stringify(record);
      expect(recordString).not.toContain('panic_attack');
      expect(recordString).not.toContain('sensitive content');
    }
  });
  
  it('maintains encryption key integrity during concurrent access', async () => {
    const operations: Promise<void>[] = [];
    
    // Concurrent encrypt/decrypt operations
    for (let i = 0; i < 20; i++) {
      operations.push(
        encryptionService.encrypt({ data: `encrypt-${i}` }).then(async (encrypted) => {
          const decrypted = await encryptionService.decrypt(encrypted);
          expect(decrypted.data).toBe(`encrypt-${i}`);
        })
      );
    }
    
    // All should complete successfully
    await expect(Promise.all(operations)).resolves.toBeDefined();
  });
  
  it('handles key rotation during active crisis', async () => {
    // Start crisis
    const crisis = await startCrisis({ type: 'pain_flare' });
    
    // Trigger key rotation mid-crisis
    await encryptionService.rotateKeys();
    
    // Crisis data should still be accessible
    const crisisData = await getCrisisData(crisis.id);
    expect(crisisData).toBeDefined();
    expect(crisisData.type).toBe('pain_flare');
    
    // New writes should use new key
    await updateCrisis(crisis.id, { severity: 7 });
    
    const updatedData = await getCrisisData(crisis.id);
    expect(updatedData.severity).toBe(7);
  });
});
```

## Cross-Tab Synchronization Testing

Users might have multiple tabs open during crisis:

```typescript
describe('Cross-Tab Synchronization', () => {
  it('synchronizes crisis state across tabs', async () => {
    // Open second "tab" (simulated with BroadcastChannel)
    const tab1 = new TabSimulator('tab-1');
    const tab2 = new TabSimulator('tab-2');
    
    // Detect crisis in tab 1
    await tab1.detectCrisis({ type: 'sensory_overload' });
    
    // Tab 2 should receive update
    await waitFor(() => {
      expect(tab2.getCrisisState().type).toBe('sensory_overload');
    });
    
    // UI adaptations should apply in both tabs
    expect(tab1.getUIMode()).toBe('simplified');
    expect(tab2.getUIMode()).toBe('simplified');
  });
  
  it('handles conflicting updates from multiple tabs', async () => {
    const tab1 = new TabSimulator('tab-1');
    const tab2 = new TabSimulator('tab-2');
    
    // Simultaneous updates
    const update1 = tab1.updateCrisis({ severity: 7 });
    const update2 = tab2.updateCrisis({ severity: 9 });
    
    await Promise.all([update1, update2]);
    
    // Should resolve to consistent state (last-write-wins or merge)
    const state1 = tab1.getCrisisState();
    const state2 = tab2.getCrisisState();
    
    expect(state1.severity).toBe(state2.severity); // Must be consistent
    expect([7, 9]).toContain(state1.severity);     // One of the updates won
  });
  
  it('maintains lock for crisis resolution', async () => {
    const tab1 = new TabSimulator('tab-1');
    const tab2 = new TabSimulator('tab-2');
    
    // Both tabs have same crisis
    await tab1.detectCrisis({ type: 'panic_attack' });
    await tab2.syncState();
    
    // Tab 1 starts resolution
    const resolution1 = tab1.startResolution();
    
    // Tab 2 should be blocked from simultaneous resolution
    const resolution2 = tab2.startResolution();
    
    await expect(resolution2).rejects.toThrow('Resolution in progress in another tab');
    
    // Complete resolution in tab 1
    await resolution1;
    
    // Now tab 2 can proceed if needed
    expect(tab2.getCrisisState().resolved).toBe(true);
  });
  
  it('survives tab crash during crisis', async () => {
    const tab1 = new TabSimulator('tab-1');
    const tab2 = new TabSimulator('tab-2');
    
    // Crisis in tab 1
    await tab1.detectCrisis({ type: 'dissociation' });
    
    // Tab 1 "crashes" (closes without cleanup)
    tab1.simulateCrash();
    
    // Tab 2 should maintain crisis state
    expect(tab2.getCrisisState().type).toBe('dissociation');
    
    // Tab 2 should be able to continue crisis handling
    await tab2.updateCrisis({ notes: 'Continued from crashed tab' });
    
    expect(tab2.getCrisisState().notes).toBe('Continued from crashed tab');
  });
});

class TabSimulator {
  private channel: BroadcastChannel;
  private state: CrisisState = {};
  
  constructor(private id: string) {
    this.channel = new BroadcastChannel('crisis-sync');
    this.channel.onmessage = this.handleMessage.bind(this);
  }
  
  async detectCrisis(crisis: Partial<CrisisState>): Promise<void> {
    this.state = { ...this.state, ...crisis, detectedAt: Date.now() };
    this.channel.postMessage({ type: 'crisis-detected', state: this.state, source: this.id });
    await this.persistState();
  }
  
  private handleMessage(event: MessageEvent): void {
    if (event.data.source === this.id) return; // Ignore own messages
    
    switch (event.data.type) {
      case 'crisis-detected':
      case 'crisis-updated':
        this.state = event.data.state;
        break;
      case 'resolution-lock':
        this.state.resolutionLockedBy = event.data.source;
        break;
    }
  }
  
  simulateCrash(): void {
    // Close channel without sending cleanup message
    this.channel.close();
  }
}
```

## Full Stack Integration Tests

Bringing it all together:

```typescript
describe('Full Stack Integration Under Distress', () => {
  it('completes full crisis lifecycle under simulated distress', async () => {
    const tracker = new FullStackTracker();
    
    // Phase 1: Crisis Onset
    console.log('Phase 1: Simulating crisis onset...');
    await simulateDistressedBehavior({
      navigationEntropy: 0.9,
      inputChaos: 0.8,
      duration: 30000
    });
    
    // Verify detection propagated through stack
    expect(tracker.layersReached).toContain('dom');
    expect(tracker.layersReached).toContain('react');
    expect(tracker.layersReached).toContain('zustand');
    expect(tracker.layersReached).toContain('analysisEngine');
    expect(tracker.layersReached).toContain('indexedDB');
    
    // Verify crisis was detected
    expect(tracker.crisisDetected).toBe(true);
    expect(tracker.crisisType).toBe('panic_attack');
    
    // Phase 2: Crisis Active
    console.log('Phase 2: Testing during active crisis...');
    
    // Verify UI adapted
    expect(screen.getByTestId('simplified-interface')).toBeVisible();
    
    // Verify offline support available
    await setNetworkCondition('offline');
    expect(await fetch('/crisis-support.html').then(r => r.ok)).toBe(true);
    await setNetworkCondition('online');
    
    // Verify data encrypted
    const storedData = await getStoredCrisisData();
    expect(storedData.encrypted).toBe(true);
    
    // Phase 3: Crisis Resolution
    console.log('Phase 3: Simulating crisis resolution...');
    await simulateCalming({
      navigationEntropy: 0.2,
      inputChaos: 0.1,
      duration: 60000
    });
    
    // Verify resolution detected
    expect(tracker.resolutionDetected).toBe(true);
    
    // Verify history recorded
    const history = await getCrisisHistory();
    expect(history).toContainEqual(
      expect.objectContaining({
        type: 'panic_attack',
        resolved: true,
        duration: expect.any(Number)
      })
    );
    
    // Phase 4: Post-Crisis
    console.log('Phase 4: Verifying post-crisis state...');
    
    // UI should gradually restore
    await waitFor(() => {
      expect(screen.queryByTestId('simplified-interface')).not.toBeInTheDocument();
    }, { timeout: 10000 });
    
    // Insights should be generated
    const insights = await getGeneratedInsights();
    expect(insights.recentCrisis).toBeDefined();
    expect(insights.patterns).toBeDefined();
  });
  
  it('maintains system stability under sustained distress', async () => {
    const startMetrics = await getSystemMetrics();
    
    // Sustained distress simulation (5 minutes simulated)
    await simulateDistressedBehavior({
      navigationEntropy: 0.85,
      inputChaos: 0.7,
      duration: 300000 // 5 minutes
    });
    
    const endMetrics = await getSystemMetrics();
    
    // Memory should not leak significantly
    expect(endMetrics.heapUsed - startMetrics.heapUsed).toBeLessThan(50 * 1024 * 1024); // <50MB growth
    
    // No uncaught errors
    expect(endMetrics.uncaughtErrors).toBe(0);
    
    // All subscriptions cleaned up
    expect(endMetrics.activeSubscriptions).toBeLessThanOrEqual(startMetrics.activeSubscriptions + 5);
    
    // IndexedDB connections not leaking
    expect(endMetrics.indexedDBConnections).toBeLessThanOrEqual(5);
  });
  
  it('recovers from cascading failures', async () => {
    // Inject failures at multiple layers simultaneously
    const failureInjector = new MultiLayerFailureInjector();
    
    failureInjector.injectFailures({
      'network': { type: 'intermittent', failureRate: 0.5 },
      'indexedDB': { type: 'timeout', delay: 5000 },
      'serviceWorker': { type: 'crash', afterOperations: 10 }
    });
    
    // System should still function
    await simulateDistressedBehavior({
      navigationEntropy: 0.8,
      duration: 60000
    });
    
    // Crisis should still be detected (even if some layers failed)
    expect(await getCrisisState()).toBeDefined();
    
    // User should never see error UI during crisis
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/failed/i)).not.toBeInTheDocument();
    
    failureInjector.restore();
    
    // System should recover fully
    await waitFor(async () => {
      const health = await getSystemHealth();
      expect(health.allLayersHealthy).toBe(true);
    }, { timeout: 30000 });
  });
});
```

## Conclusion

Testing crisis features across the full stack isn't optional—it's where the real bugs hide. A perfectly working detection algorithm means nothing if IndexedDB drops the record or the service worker fails to cache crisis resources.

Key takeaways:

1. **Map the signal flow**: Document every layer a crisis signal passes through.

2. **Test at each layer**: Unit test components, but also test the handoffs between layers.

3. **Simulate realistic failures**: Network drops, quota limits, transaction aborts—they all happen.

4. **Verify offline resilience**: Crisis support must work without connectivity.

5. **Protect encryption under stress**: Rapid operations shouldn't bypass encryption.

6. **Handle multi-tab chaos**: Users in crisis might have multiple tabs open.

7. **Test sustained distress**: 30-second tests don't catch memory leaks that appear after 5 minutes.

When someone reaches for help during their worst moment, every layer of our stack needs to work perfectly. End-to-end testing under simulated distress is how we make sure it does.

---

*This is the final post in our series on building trauma-informed healthcare applications. The full series covered [crisis detection](/blog/false-positives-calibrating-crisis-detection), [testing strategies](/blog/testing-the-untestable), [visual regression](/blog/visual-regression-adaptive-interfaces), [ethics of simulation](/blog/ethics-of-simulation), [performance](/blog/performance-under-pressure), [cross-crisis calibration](/blog/cross-crisis-calibration), [recovery testing](/blog/testing-recovery), [cultural contexts](/blog/internationalization-of-trauma), [validation](/blog/testing-the-testing), [co-occurrence](/blog/testing-co-occurrence), and [privacy](/blog/testing-privacy-preserving-analytics).*

Thank you for reading. Build with empathy. Test with rigor. Ship with confidence.

---

**Tags**: #integration-testing #full-stack #indexeddb #service-worker #encryption #healthcare #trauma-informed #offline-first #testing
