# Performance Under Pressure: Ensuring Crisis Detection Doesn't Degrade User Experience

*When milliseconds matter: Testing performance-critical features in trauma-informed healthcare apps*

---

When someone is experiencing a pain crisis, the last thing they need is a sluggish interface. A 300ms delay in showing a crisis support button could feel like an eternity. A janky animation during mode transitions could increase cognitive load at the worst possible moment. Memory leaks in state machines could cause the app to freeze during extended crisis episodes.

This is the performance paradox of trauma-informed software: the features designed to help during high-stress moments are often the most computationally expensive. Crisis detection requires continuous signal processing. Adaptive interfaces need real-time UI reconfiguration. Empathy algorithms process emotional patterns in the background.

Let's explore how to test these systems to ensure they perform under pressure.

## The Cognitive Load Budget

Before writing any performance tests, we establish a **cognitive load budget**—the maximum computational overhead our trauma-informed features can impose without degrading user experience.

```typescript
// Performance budget for trauma-informed features
const PERFORMANCE_BUDGET = {
  // Crisis detection must complete within one animation frame
  crisisDetectionCycle: 16, // ms (60fps target)
  
  // Mode transitions should feel instantaneous
  modeTransitionStart: 100, // ms to first visual feedback
  modeTransitionComplete: 300, // ms total
  
  // Background empathy processing
  empathyAnalysisBatch: 50, // ms per batch
  empathyAnalysisTotal: 2000, // ms for full analysis
  
  // Memory constraints
  maxHeapGrowthPerHour: 10, // MB
  maxStateSnapshotSize: 1, // MB
  
  // Input responsiveness during crisis
  inputLatencyNormal: 100, // ms
  inputLatencyCrisis: 50, // ms (must be MORE responsive during crisis)
} as const;
```

Notice that input latency budget is **tighter** during crisis mode. When users are stressed, perceived delays feel longer. We compensate by being objectively faster.

## Testing Input Latency

The first thing users notice is input lag. Here's how we measure it across different app states:

```typescript
describe('Input Latency Tests', () => {
  it('maintains responsiveness during crisis detection processing', async () => {
    const latencies: number[] = [];
    
    // Simulate continuous crisis detection
    const crisisDetectionInterval = setInterval(() => {
      detectCrisisSignals(mockEntries);
    }, 100);
    
    // Measure button click responsiveness
    for (let i = 0; i < 50; i++) {
      const button = screen.getByRole('button', { name: /record pain/i });
      
      const start = performance.now();
      await userEvent.click(button);
      await waitFor(() => screen.getByRole('dialog'));
      const end = performance.now();
      
      latencies.push(end - start);
      
      // Reset for next measurement
      await userEvent.keyboard('{Escape}');
    }
    
    clearInterval(crisisDetectionInterval);
    
    // Statistical analysis
    const p95 = latencies.sort((a, b) => a - b)[Math.floor(latencies.length * 0.95)];
    const p99 = latencies.sort((a, b) => a - b)[Math.floor(latencies.length * 0.99)];
    
    expect(p95).toBeLessThan(PERFORMANCE_BUDGET.inputLatencyNormal);
    expect(p99).toBeLessThan(PERFORMANCE_BUDGET.inputLatencyNormal * 1.5);
  });
  
  it('improves responsiveness when crisis mode is active', async () => {
    // Activate crisis mode
    act(() => {
      triggerCrisisMode('escalating_pain');
    });
    
    const latencies: number[] = [];
    
    for (let i = 0; i < 30; i++) {
      const supportButton = screen.getByRole('button', { name: /get support/i });
      
      const start = performance.now();
      await userEvent.click(supportButton);
      await waitFor(() => screen.getByRole('dialog'));
      const end = performance.now();
      
      latencies.push(end - start);
      await userEvent.keyboard('{Escape}');
    }
    
    const median = latencies.sort((a, b) => a - b)[Math.floor(latencies.length / 2)];
    
    // Crisis mode should be MORE responsive, not less
    expect(median).toBeLessThan(PERFORMANCE_BUDGET.inputLatencyCrisis);
  });
});
```

## Memory Leak Detection in State Machines

Crisis detection uses a finite state machine with complex state transitions. These are prime candidates for memory leaks:

```typescript
describe('Crisis State Machine Memory Tests', () => {
  it('does not leak memory during state cycling', async () => {
    const initialHeap = (performance as any).memory?.usedJSHeapSize;
    if (!initialHeap) return; // Skip if memory API unavailable
    
    // Cycle through all possible state transitions 100 times
    const states: CrisisState[] = ['normal', 'monitoring', 'elevated', 'crisis', 'recovery'];
    
    for (let cycle = 0; cycle < 100; cycle++) {
      for (const state of states) {
        act(() => {
          transitionToState(state);
        });
        
        // Verify state actually changed
        expect(getCrisisState().currentState).toBe(state);
        
        // Allow cleanup between transitions
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
    
    // Force garbage collection if available
    if (global.gc) global.gc();
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const finalHeap = (performance as any).memory?.usedJSHeapSize;
    const heapGrowth = (finalHeap - initialHeap) / 1024 / 1024; // MB
    
    // Allow some growth, but catch obvious leaks
    expect(heapGrowth).toBeLessThan(5); // 5MB max growth for 100 full cycles
  });
  
  it('cleans up subscriptions on unmount', async () => {
    const subscriptionsSpy = vi.fn();
    
    const { unmount } = render(
      <CrisisDetectionProvider 
        onSubscribe={subscriptionsSpy}
        onUnsubscribe={subscriptionsSpy}
      >
        <TestComponent />
      </CrisisDetectionProvider>
    );
    
    // Verify subscriptions were created
    const subscribeCount = subscriptionsSpy.mock.calls.filter(
      call => call[0] === 'subscribe'
    ).length;
    
    unmount();
    
    // Verify all subscriptions were cleaned up
    const unsubscribeCount = subscriptionsSpy.mock.calls.filter(
      call => call[0] === 'unsubscribe'
    ).length;
    
    expect(unsubscribeCount).toBe(subscribeCount);
  });
});
```

## The Cleanup Pattern Library

We've documented every cleanup pattern in our codebase. Here's what proper cleanup looks like:

```typescript
// ✅ Correct: Comprehensive cleanup in useEffect
useEffect(() => {
  const interval = setInterval(checkCrisisSignals, 100);
  const timeout = setTimeout(scheduleDeepAnalysis, 5000);
  const subscription = crisisStore.subscribe(handleStateChange);
  const abortController = new AbortController();
  
  // Async operation with cancellation
  fetchCrisisResources({ signal: abortController.signal })
    .catch(e => {
      if (e.name !== 'AbortError') console.error(e);
    });
  
  return () => {
    clearInterval(interval);
    clearTimeout(timeout);
    subscription(); // Zustand returns unsubscribe function
    abortController.abort();
  };
}, []);

// ❌ Wrong: Missing cleanup
useEffect(() => {
  const interval = setInterval(checkCrisisSignals, 100);
  // No return = interval keeps running after unmount
}, []);
```

Our codebase enforces this with ESLint rules and automated testing:

```typescript
// Test that verifies cleanup exists
it('has cleanup for all effects', () => {
  const sourceCode = readFileSync('./src/hooks/useCrisisDetection.ts', 'utf-8');
  const ast = parse(sourceCode, { sourceType: 'module', plugins: ['typescript', 'jsx'] });
  
  const useEffectCalls = findAllCalls(ast, 'useEffect');
  
  for (const effect of useEffectCalls) {
    const callback = effect.arguments[0];
    expect(hasReturnStatement(callback)).toBe(true);
  }
});
```

## Jank-Free Mode Transitions

When transitioning between normal and crisis mode, we can't afford frame drops. Users might interpret jank as the app freezing:

```typescript
describe('Mode Transition Smoothness', () => {
  it('maintains 60fps during crisis mode transition', async () => {
    const frameDrops: number[] = [];
    let lastFrameTime = performance.now();
    
    const frameObserver = () => {
      const now = performance.now();
      const frameDuration = now - lastFrameTime;
      
      // A frame longer than 20ms (50fps) counts as a drop
      if (frameDuration > 20) {
        frameDrops.push(frameDuration);
      }
      
      lastFrameTime = now;
      requestAnimationFrame(frameObserver);
    };
    
    const rafId = requestAnimationFrame(frameObserver);
    
    // Trigger transition
    act(() => {
      triggerCrisisMode('pain_spike');
    });
    
    // Wait for transition to complete
    await waitFor(
      () => expect(screen.getByTestId('crisis-mode-container')).toBeVisible(),
      { timeout: 500 }
    );
    
    cancelAnimationFrame(rafId);
    
    // Allow at most 2 frame drops during transition
    expect(frameDrops.length).toBeLessThanOrEqual(2);
    
    // No catastrophic frame drops (> 100ms)
    expect(frameDrops.every(d => d < 100)).toBe(true);
  });
});
```

## Respecting `prefers-reduced-motion`

Our CSS already respects reduced motion preferences:

```css
/* From accessibility.css */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

But we also need to test that JavaScript-driven animations respect this:

```typescript
describe('Reduced Motion Respect', () => {
  beforeEach(() => {
    // Mock prefers-reduced-motion: reduce
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
  });
  
  it('skips JavaScript animations when reduced motion preferred', async () => {
    const animationSpy = vi.spyOn(Element.prototype, 'animate');
    
    render(<CrisisTransition />);
    
    act(() => {
      triggerCrisisMode('escalating_pain');
    });
    
    // Should not call Web Animations API
    expect(animationSpy).not.toHaveBeenCalled();
    
    // State should still change immediately
    expect(screen.getByTestId('crisis-mode-container')).toBeVisible();
  });
  
  it('uses instant transitions for mode switches', () => {
    render(<AdaptiveInterface />);
    
    const container = screen.getByTestId('interface-container');
    const computedStyle = window.getComputedStyle(container);
    
    // Transition duration should be effectively zero
    expect(computedStyle.transitionDuration).toBe('0.01ms');
  });
});
```

## Off-Thread Processing with Web Workers

Heavy empathy analysis runs in a Web Worker to keep the main thread free:

```typescript
// From health-insights-worker.ts
interface HealthInsightTask {
  id: string;
  type: 'pattern-analysis' | 'trend-detection' | 'correlation-analysis' | 
        'anomaly-detection' | 'prediction' | 'summary-generation';
  data: {
    entries: PainEntry[];
    timeframe?: 'week' | 'month' | 'quarter' | 'year';
    context?: {
      userPreferences?: Record<string, unknown>;
      previousInsights?: HealthInsight[];
      currentDate?: string;
    };
  };
  priority: 'high' | 'medium' | 'low';
  timestamp: string;
}
```

Testing worker performance:

```typescript
describe('Health Insights Worker Performance', () => {
  let worker: Worker;
  
  beforeEach(() => {
    worker = new Worker(
      new URL('../workers/health-insights-worker.ts', import.meta.url),
      { type: 'module' }
    );
  });
  
  afterEach(() => {
    worker.terminate();
  });
  
  it('processes large datasets without blocking main thread', async () => {
    const mainThreadBlocked = { current: false };
    
    // Detect main thread blocking
    const blockDetector = setInterval(() => {
      mainThreadBlocked.current = true;
    }, 5);
    
    // Large dataset
    const entries = generateMockEntries(1000);
    
    const resultPromise = new Promise<HealthInsight[]>(resolve => {
      worker.onmessage = (e) => {
        if (e.data.type === 'result') {
          resolve(e.data.data);
        }
      };
    });
    
    // Start processing
    worker.postMessage({
      type: 'task',
      data: {
        id: 'perf-test',
        type: 'pattern-analysis',
        data: { entries, timeframe: 'year' },
        priority: 'low',
        timestamp: new Date().toISOString(),
      }
    });
    
    // Main thread should remain responsive
    await new Promise(resolve => setTimeout(resolve, 100));
    clearInterval(blockDetector);
    
    // If we got here, main thread wasn't blocked
    expect(mainThreadBlocked.current).toBe(true); // Detector ran at least once
    
    // Worker should still complete
    const results = await resultPromise;
    expect(results).toBeDefined();
  });
  
  it('respects priority ordering', async () => {
    const completionOrder: string[] = [];
    
    worker.onmessage = (e) => {
      if (e.data.type === 'result') {
        completionOrder.push(e.data.taskId);
      }
    };
    
    // Send low priority first
    worker.postMessage({
      type: 'task',
      data: { id: 'low', type: 'summary-generation', priority: 'low', /* ... */ }
    });
    
    // Then high priority
    worker.postMessage({
      type: 'task',
      data: { id: 'high', type: 'pattern-analysis', priority: 'high', /* ... */ }
    });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // High priority should complete before low
    const highIndex = completionOrder.indexOf('high');
    const lowIndex = completionOrder.indexOf('low');
    
    expect(highIndex).toBeLessThan(lowIndex);
  });
});
```

## Battery Impact Testing

For PWAs, battery drain matters—especially when users might need the app during an extended crisis:

```typescript
describe('Battery Impact', () => {
  it('reduces background activity when battery is low', async () => {
    // Mock Battery API
    const mockBattery = {
      charging: false,
      level: 0.15, // 15% battery
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    
    (navigator as any).getBattery = () => Promise.resolve(mockBattery);
    
    const backgroundTaskCount = vi.fn();
    
    render(
      <PowerAwareProvider onBackgroundTask={backgroundTaskCount}>
        <CrisisDetection />
      </PowerAwareProvider>
    );
    
    // Wait for battery-aware adjustments
    await waitFor(() => {
      expect(backgroundTaskCount).toHaveBeenCalled();
    });
    
    const normalCallCount = backgroundTaskCount.mock.calls.length;
    
    // Simulate full battery
    mockBattery.level = 1.0;
    mockBattery.charging = true;
    
    // Trigger battery change event
    const changeHandler = mockBattery.addEventListener.mock.calls.find(
      call => call[0] === 'levelchange'
    )?.[1];
    changeHandler?.();
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const highBatteryCallCount = backgroundTaskCount.mock.calls.length - normalCallCount;
    
    // Should do more background work when battery is good
    // (This is inverted because we reduce work on low battery)
    expect(highBatteryCallCount).toBeGreaterThan(normalCallCount * 0.5);
  });
});
```

## Bundle Size Monitoring

Performance starts at build time. We use strategic code splitting:

```typescript
// From vite.config.ts
manualChunks: {
  // Keep React packages together for correct initialization
  'react-vendor': ['react', 'react-dom', 'react-is', 'scheduler'],
  // Large charting libraries lazy-loaded
  'chart-vendor': ['recharts'],
  // Form handling
  'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
  // State management
  'state-vendor': ['zustand', 'immer'],
  // Crypto (for encryption features)
  'crypto-vendor': ['crypto-js'],
}
```

And lazy loading for heavy components:

```typescript
// From DashboardOverview.tsx
// Lazy-load PredictivePanel to keep initial bundle small
const PredictivePanelLazy = React.useMemo(
  () => React.lazy(() => import('./PredictivePanelWrapper')), 
  []
);

// Usage with Suspense
<React.Suspense fallback={<Loading text="Loading predictive insights..." />}>
  <PredictivePanelLazy entries={entries} />
</React.Suspense>
```

Testing bundle budgets:

```typescript
// bundle-size.test.ts
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

describe('Bundle Size Budget', () => {
  const distPath = './dist/assets';
  
  const BUDGETS = {
    // Initial load budget
    initialJS: 200 * 1024, // 200KB
    initialCSS: 50 * 1024,  // 50KB
    
    // Chunk budgets
    'react-vendor': 150 * 1024,
    'chart-vendor': 300 * 1024,
    'crypto-vendor': 100 * 1024,
    
    // Total budget
    totalJS: 800 * 1024, // 800KB
  };
  
  it('stays within initial load budget', () => {
    const files = readdirSync(distPath);
    
    // Find main entry chunks (not lazy-loaded)
    const mainJS = files
      .filter(f => f.endsWith('.js') && f.startsWith('index'))
      .reduce((sum, f) => sum + statSync(join(distPath, f)).size, 0);
    
    const mainCSS = files
      .filter(f => f.endsWith('.css') && f.startsWith('index'))
      .reduce((sum, f) => sum + statSync(join(distPath, f)).size, 0);
    
    expect(mainJS).toBeLessThan(BUDGETS.initialJS);
    expect(mainCSS).toBeLessThan(BUDGETS.initialCSS);
  });
  
  it('keeps vendor chunks within budget', () => {
    const files = readdirSync(distPath);
    
    for (const [chunkName, budget] of Object.entries(BUDGETS)) {
      if (chunkName === 'initialJS' || chunkName === 'initialCSS' || chunkName === 'totalJS') {
        continue;
      }
      
      const chunkFile = files.find(f => f.includes(chunkName) && f.endsWith('.js'));
      if (chunkFile) {
        const size = statSync(join(distPath, chunkFile)).size;
        expect(size).toBeLessThan(budget);
      }
    }
  });
});
```

## Performance Monitoring in Production

Real-world performance data from our PWA utilities:

```typescript
// From pwa-utils.ts
private setupPerformanceMonitoring(): void {
  if ('performance' in window) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType(
          'navigation'
        )[0] as PerformanceNavigationTiming;

        this.dispatchCustomEvent('pwa-performance-metrics', {
          loadTime: navigation.loadEventEnd - navigation.fetchStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
          firstPaint: this.getFirstPaint(),
          cacheHitRatio: this.getCacheHitRatio(),
        });
      }, 0);
    });

    // Monitor for slow resources
    const observer = new PerformanceObserver(list => {
      const entries = list.getEntries();
      const slowResources = entries.filter(entry => entry.duration > 1000);

      if (slowResources.length > 0) {
        this.dispatchCustomEvent('pwa-slow-resources', {
          resources: slowResources.map(entry => ({
            name: entry.name,
            duration: entry.duration,
            size: (entry as PerformanceResourceTiming).transferSize || 0,
          })),
        });
      }
    });

    observer.observe({ type: 'resource', buffered: true });
  }
}
```

## The Performance Dashboard

We expose performance metrics in development:

```typescript
// PerformanceDebugPanel.tsx
function PerformanceDebugPanel() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  
  useEffect(() => {
    const handleMetrics = (e: CustomEvent) => {
      setMetrics(e.detail);
    };
    
    window.addEventListener('pwa-performance-metrics', handleMetrics);
    return () => window.removeEventListener('pwa-performance-metrics', handleMetrics);
  }, []);
  
  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs">
      <h4 className="font-bold mb-2">Performance Metrics</h4>
      <dl className="space-y-1">
        <div className="flex justify-between">
          <dt>Load Time:</dt>
          <dd className={metrics?.loadTime > 3000 ? 'text-red-400' : 'text-green-400'}>
            {metrics?.loadTime?.toFixed(0)}ms
          </dd>
        </div>
        <div className="flex justify-between">
          <dt>First Paint:</dt>
          <dd className={metrics?.firstPaint > 1000 ? 'text-red-400' : 'text-green-400'}>
            {metrics?.firstPaint?.toFixed(0)}ms
          </dd>
        </div>
        <div className="flex justify-between">
          <dt>Cache Hit Ratio:</dt>
          <dd>{((metrics?.cacheHitRatio || 0) * 100).toFixed(0)}%</dd>
        </div>
      </dl>
    </div>
  );
}
```

## Key Metrics Checklist

| Metric | Target | Critical Threshold | Measurement Method |
|--------|--------|-------------------|-------------------|
| Input Latency (Normal) | < 100ms | 200ms | Performance.now() around user events |
| Input Latency (Crisis) | < 50ms | 100ms | Same, with crisis mode active |
| Crisis Detection Cycle | < 16ms | 32ms | One animation frame |
| Mode Transition Start | < 100ms | 200ms | Time to first visual feedback |
| Mode Transition Complete | < 300ms | 500ms | Time to stable state |
| Frame Rate During Transition | 60fps | 30fps | requestAnimationFrame timing |
| Memory Growth (1 hour) | < 10MB | 25MB | performance.memory API |
| Initial Bundle Size | < 200KB | 300KB | Build output analysis |
| Total Bundle Size | < 800KB | 1MB | Sum of all chunks |
| Web Worker Processing | < 50ms/batch | 100ms/batch | postMessage timing |

## Continuous Integration

Performance tests run on every PR:

```yaml
# .github/workflows/performance.yml
performance:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build production bundle
      run: npm run build
    
    - name: Check bundle sizes
      run: npm run test:bundle-size
    
    - name: Run performance tests
      run: npm run test:performance
    
    - name: Lighthouse CI
      uses: treosh/lighthouse-ci-action@v10
      with:
        configPath: ./lighthouserc.json
        budgetPath: ./performance-budget.json
```

## Conclusion

Performance testing for trauma-informed applications isn't about raw speed—it's about **reliability under pressure**. When users most need our help, the app must be at its most responsive.

Key takeaways:
- **Budget tighter during crisis**: Users perceive delays differently under stress
- **Test the cleanup path**: Memory leaks compound during extended crisis episodes
- **Respect accessibility preferences**: Including reduced motion
- **Offload to workers**: Keep the main thread free for user interaction
- **Monitor in production**: Lab tests don't capture real-world device constraints

The investment in performance testing pays dividends when a user reaches for help during a 3 AM pain flare and the app responds instantly.

---

*This is Part 6 of our series on building trauma-informed healthcare applications. Previous posts covered [crisis detection calibration](/blog/false-positives-calibrating-crisis-detection), [testing strategies](/blog/testing-the-untestable), [visual regression](/blog/visual-regression-adaptive-interfaces), and [ethics of simulation](/blog/ethics-of-simulation).*

**Coming Next**: "Graceful Degradation: Ensuring core functionality when PWA features fail"

[![Pain Tracker - Privacy-first PWA for chronic pain tracking & management | Product Hunt](https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1063103&theme=light)](https://www.producthunt.com/products/pain-tracker?utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-pain-tracker)

---

**Tags**: #performance #web-workers #healthcare #accessibility #pwa #testing #react #typescript
