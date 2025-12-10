# Testing the Untestable: How to Simulate Pain Flares and Cognitive Fog in Automated Tests

*Part of the CrisisCore Build Log - quality assurance for systems that need to work when humans can't*

---

How do you write a test for "user is having a breakdown"?

How do you assert that your UI correctly detected cognitive fog, when cognitive fog isn't a Jest matcher?

This is the testing challenge I face with Pain Tracker. The features that matter most—crisis detection, stress-adaptive UI, trauma-informed responses—are triggered by human states that can't be directly simulated in code.

Here's how I approach it.

---

## The Problem: States vs. Signals

Unit tests verify **code behavior**. But trauma-informed features respond to **human behavior patterns**.

You can't write this test:

```typescript
// ❌ This doesn't exist
test('should activate emergency mode when user has cognitive fog', () => {
  const user = simulateCognitiveFog(); // 🤷‍♂️
  expect(screen.getByRole('emergency-ui')).toBeInTheDocument();
});
```

What you *can* test is the signal processing pipeline:

```typescript
// ✅ Test the signals, not the human state
test('should activate emergency mode when error rate exceeds threshold', () => {
  // Simulate the *signals* of cognitive fog, not the fog itself
  for (let i = 0; i < 10; i++) {
    crisisDetection.trackError();
  }
  crisisDetection.trackHelpRequest();
  crisisDetection.trackHelpRequest();
  
  expect(crisisDetection.crisisLevel).toBe('moderate');
});
```

The insight: **you're not testing human experience—you're testing your interpretation of observable signals.**

---

## Strategy 1: Fixture-Based State Injection

Instead of simulating real-time behavior, inject known states through test fixtures:

```typescript
// Test wrapper with configurable preferences
interface TestWrapperProps {
  children: ReactNode;
  preferences?: Partial<TraumaInformedPreferences>;
  updatePreferences?: (updates: Partial<TraumaInformedPreferences>) => void;
}

function TestWrapper({
  children,
  preferences = {},
  updatePreferences = vi.fn(),
}: TestWrapperProps) {
  const value = {
    preferences: { ...defaultPreferences, ...preferences },
    updatePreferences,
  };

  return (
    <TraumaInformedContext.Provider value={value}>
      {children}
    </TraumaInformedContext.Provider>
  );
}
```

Now you can test any combination of preferences:

```typescript
describe('useCrisisSupport', () => {
  it('should adjust thresholds for high sensitivity', () => {
    render(
      <TestWrapper preferences={{ crisisDetectionSensitivity: 'high' }}>
        <CrisisSupportConsumer />
      </TestWrapper>
    );

    expect(screen.getByTestId('pain-threshold').textContent).toBe('7');
  });

  it('should adjust thresholds for low sensitivity', () => {
    render(
      <TestWrapper preferences={{ crisisDetectionSensitivity: 'low' }}>
        <CrisisSupportConsumer />
      </TestWrapper>
    );

    expect(screen.getByTestId('pain-threshold').textContent).toBe('9');
  });
});
```

**The principle**: Don't simulate fog. Inject the preference state that fog would trigger.

---

## Strategy 2: Behavioral Signal Generators

For the crisis detection system, I built test utilities that generate the **signals** a distressed user might produce:

```typescript
// Sample mood entries covering crisis states
export const sampleMoodEntries: MoodEntry[] = [
  {
    id: 1,
    timestamp: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    mood: 3,
    energy: 2,
    anxiety: 8,
    stress: 9,
    hopefulness: 4,
    selfEfficacy: 3,
    context: 'Severe pain flare-up, emergency room visit',
    triggers: ['acute pain', 'medical emergency', 'work absence'],
    copingStrategies: ['breathing exercises', 'pain medication'],
    notes: 'Overwhelmed by sudden pain onset. Anxious about work and recovery.',
  },
  // ... entries showing gradual improvement or deterioration
];
```

And for pain patterns:

```typescript
/**
 * Generate a series of pain entries showing various patterns
 */
export function generatePainSeries(
  startDate: Date,
  days: number,
  pattern: 'improving' | 'worsening' | 'fluctuating' | 'stable' = 'improving'
): PainEntry[] {
  const entries: PainEntry[] = [];
  
  for (let i = 0; i < days; i++) {
    let intensity: number;
    
    switch (pattern) {
      case 'improving':
        intensity = Math.max(1, Math.min(10, 8 - (i / days) * 6));
        break;
      case 'worsening':
        intensity = Math.max(1, Math.min(10, 2 + (i / days) * 6));
        break;
      case 'fluctuating':
        intensity = Math.max(1, Math.min(10, 5 + Math.sin(i / 2) * 3));
        break;
      case 'stable':
      default:
        intensity = 5;
    }
    
    entries.push(makePainEntry({
      timestamp: new Date(startDate.getTime() - (days - i - 1) * 86400000).toISOString(),
      intensity: Math.round(intensity),
    }));
  }
  
  return entries;
}
```

Now you can test how your analytics respond to realistic data patterns:

```typescript
test('should detect worsening trend', () => {
  const entries = generatePainSeries(new Date(), 14, 'worsening');
  const analysis = analyzePatterns(entries);
  
  expect(analysis.trend).toBe('worsening');
  expect(analysis.shouldAlert).toBe(true);
});
```

---

## Strategy 3: The Crisis Testing Dashboard

For integration testing and QA, I built an in-app simulation dashboard:

```typescript
const TEST_SCENARIOS: TestScenario[] = [
  {
    id: 'mild-stress',
    name: 'Mild Stress Response',
    description: 'Tests system response to mild stress indicators',
    duration: 30,
    stressLevel: 'mild',
    simulatedBehaviors: {
      rapidClicks: false,
      erraticMovement: true,
      longPauses: false,
      frustrationIndicators: false,
    },
    expectedOutcomes: [
      'UI slightly enlarges touch targets',
      'Stress indicator appears',
      'Subtle color adaptations',
    ],
  },
  {
    id: 'emergency-crisis',
    name: 'Emergency Crisis Mode',
    description: 'Tests full emergency mode with all crisis features',
    duration: 90,
    stressLevel: 'emergency',
    simulatedBehaviors: {
      rapidClicks: true,
      erraticMovement: true,
      longPauses: true,
      frustrationIndicators: true,
    },
    expectedOutcomes: [
      'Full emergency interface active',
      'All animations disabled',
      'Maximum contrast enabled',
      'Emergency contacts readily accessible',
    ],
  },
];
```

The dashboard dispatches real DOM events to simulate user behavior:

```typescript
const simulateStressBehaviors = useCallback((scenario: TestScenario) => {
  // Simulate rapid clicks
  if (scenario.simulatedBehaviors.rapidClicks) {
    const clickEvents = Math.floor(Math.random() * 5) + 3;
    for (let i = 0; i < clickEvents; i++) {
      setTimeout(() => {
        document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }, i * 100);
    }
  }

  // Simulate frustration indicators
  if (scenario.simulatedBehaviors.frustrationIndicators) {
    ['Escape', 'Escape', 'Backspace'].forEach((key, index) => {
      setTimeout(() => {
        document.dispatchEvent(new KeyboardEvent('keydown', { key }));
      }, index * 100);
    });
  }
}, []);
```

This isn't a unit test—it's a **smoke test for empathy**. You can watch the UI adapt in real-time and verify the experience matches intent.

---

## Strategy 4: Consumer Component Testing

Instead of testing hooks in isolation, test **components that consume** the hooks:

```typescript
function CrisisSupportConsumer() {
  const crisis = useCrisisSupport();
  return (
    <div>
      <div data-testid="crisis-enabled">{String(crisis.crisisDetectionEnabled)}</div>
      <div data-testid="sensitivity">{crisis.sensitivity}</div>
      <div data-testid="pain-threshold">{crisis.thresholds.painLevel}</div>
    </div>
  );
}

describe('useCrisisSupport', () => {
  it('should return crisis support preferences with defaults', () => {
    render(
      <TestWrapper>
        <CrisisSupportConsumer />
      </TestWrapper>
    );

    expect(screen.getByTestId('crisis-enabled').textContent).toBe('true');
    expect(screen.getByTestId('sensitivity').textContent).toBe('medium');
    expect(screen.getByTestId('pain-threshold').textContent).toBe('8');
  });
});
```

This tests the **contract** between hooks and components—the actual integration point where bugs manifest.

---

## Strategy 5: Time-Based Behavior with Fake Timers

Crisis detection involves time: how long between errors? How fast were those clicks? Use fake timers to control temporal behavior:

```typescript
describe('crisis detection timing', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should require sustained stress before activating', () => {
    const { result } = renderHook(() => useCrisisDetection());
    
    // Single error burst shouldn't trigger crisis
    result.current.trackError();
    result.current.trackError();
    result.current.trackError();
    
    vi.advanceTimersByTime(1000);
    expect(result.current.crisisLevel).toBe('none');
    
    // Sustained errors over time should trigger
    for (let i = 0; i < 5; i++) {
      result.current.trackError();
      vi.advanceTimersByTime(10000); // 10 second intervals
    }
    
    expect(result.current.crisisLevel).not.toBe('none');
  });

  it('should reset after recovery period', () => {
    const { result } = renderHook(() => useCrisisDetection());
    
    // Trigger crisis state
    // ... (error injection)
    
    expect(result.current.crisisLevel).toBe('moderate');
    
    // Advance past recovery timeout
    vi.advanceTimersByTime(300000); // 5 minutes of quiet
    
    expect(result.current.crisisLevel).toBe('none');
  });
});
```

---

## Strategy 6: Outcome-Based Assertions

Don't test "is the user stressed?" Test "did the UI adapt correctly?"

```typescript
test('should enable simplified mode in emergency', () => {
  const { result } = renderHook(() => useCrisisDetection());
  const { result: prefsResult } = renderHook(() => useTraumaInformed());
  
  // Force emergency state
  result.current.activateEmergencyMode();
  
  // Assert UI adaptations, not internal state
  expect(prefsResult.current.preferences.simplifiedMode).toBe(true);
  expect(prefsResult.current.preferences.touchTargetSize).toBe('extra-large');
  expect(prefsResult.current.preferences.confirmationLevel).toBe('high');
  expect(prefsResult.current.preferences.showComfortPrompts).toBe(true);
});
```

The test isn't "is this a crisis?" It's "if this were a crisis, would the user be helped?"

---

## Strategy 7: Complete Flow Assertions

Test the complete flow from trigger to resolution:

```typescript
describe('CrisisModeProvider', () => {
  it('should complete full crisis cycle', () => {
    const { result } = renderHook(() => useCrisisMode());
    
    // Initial state
    expect(result.current.isCrisisModeActive).toBe(false);
    
    // Activate
    result.current.activateEmergencyMode();
    expect(result.current.isCrisisModeActive).toBe(true);
    expect(result.current.crisisFeatures.emergencyMode).toBe(true);
    expect(result.current.crisisFeatures.cognitiveFogSupport).toBe(true);
    
    // Deactivate
    result.current.deactivateEmergencyMode();
    expect(result.current.isCrisisModeActive).toBe(false);
    expect(result.current.crisisFeatures.emergencyMode).toBe(false);
    
    // But monitoring stays active
    expect(result.current.crisisFeatures.stressResponsiveUI).toBe(true);
  });
});
```

---

## Common Pitfalls: What Not To Do

After a lot of trial and error, here's what I've learned to avoid:

### ❌ Don't Test for Emotional States Directly

```typescript
// 🚫 WRONG: Testing for internal human state
test('user feels overwhelmed', () => {
  expect(user.emotionalState).toBe('overwhelmed');
});

// ✅ RIGHT: Testing for observable signal patterns
test('system detects overwhelm signals', () => {
  injectSignals({ errorRate: 0.4, backNavigation: 5, helpRequests: 3 });
  expect(crisisDetection.severity).toBe('moderate');
});
```

### ❌ Don't Hardcode Magic Thresholds in Tests

```typescript
// 🚫 WRONG: Brittle test tied to implementation
test('triggers at exactly 7 errors', () => {
  for (let i = 0; i < 7; i++) trackError();
  expect(crisis).toBe(true);
});

// ✅ RIGHT: Test behavior, not magic numbers
test('triggers after sustained error pattern', () => {
  simulateFrustratedSession();
  expect(crisisLevel).not.toBe('none');
});
```

### ❌ Don't Mock the Crisis Detection System Entirely

If you mock away the detection logic, you're not testing whether it works—you're testing whether your mock works.

```typescript
// 🚫 WRONG: Mock defeats the purpose
vi.mock('./useCrisisDetection', () => ({
  useCrisisDetection: () => ({ crisisLevel: 'severe' })
}));

// ✅ RIGHT: Use the real system with controlled inputs
const { result } = renderHook(() => useCrisisDetection());
result.current.updatePainLevel(9);
result.current.trackError();
// Now test the real detection logic
```

### ❌ Don't Assume Synchronous State Updates

Crisis detection involves debouncing, timeouts, and async calculations. Tests that assume immediate state changes will flake.

```typescript
// 🚫 WRONG: Assumes synchronous
trackError();
expect(crisisLevel).toBe('mild'); // May still be 'none'

// ✅ RIGHT: Use waitFor or advance timers
trackError();
await waitFor(() => {
  expect(crisisLevel).toBe('mild');
});
```

### ❌ Don't Test Only Happy Paths

The whole point of trauma-informed design is handling unhappy paths. Your test suite should have more crisis scenarios than calm ones.

### ❌ Don't Forget to Test Recovery

Activation gets all the attention. But **deactivation** is where bugs hide:
- Does the system actually calm down?
- Is there hysteresis to prevent flapping?
- Are preferences restored correctly?

---

## When To Use Each Strategy

| Strategy | Best For | Speed | Coverage | Fidelity |
|----------|----------|-------|----------|----------|
| **1. Fixture Injection** | Testing preference combinations | ⚡ Fast | Narrow | Low |
| **2. Signal Generators** | Analytics, trend detection | ⚡ Fast | Medium | Medium |
| **3. Crisis Dashboard** | Visual QA, integration | 🐢 Slow | Wide | High |
| **4. Consumer Components** | Hook contracts, rendering | ⚡ Fast | Medium | Medium |
| **5. Fake Timers** | Temporal logic, debouncing | ⚡ Fast | Narrow | High |
| **6. Outcome Assertions** | UI adaptation verification | ⚡ Fast | Medium | Medium |
| **7. Flow Assertions** | End-to-end state machines | ⚡ Fast | Wide | High |

**Quick decision guide:**

- "Does this preference change the UI?" → **Strategy 1 + 4**
- "Does this pattern trigger an alert?" → **Strategy 2 + 6**
- "Does the timing feel right?" → **Strategy 5**
- "Does this actually help a real person?" → **Strategy 3** (manual)
- "Does the whole flow work?" → **Strategy 7**

---

## What You Can't Automate

Some things require human QA:

- **Does the simplified interface actually feel simpler?**
- **Is the emergency mode calming or alarming?**
- **Are the touch targets big enough when your hands are shaking?**

For these, I use the Crisis Testing Dashboard in manual review sessions. I've also done hallway testing with people who have chronic pain conditions (with their consent and appropriate support structures in place).

Automated tests catch regressions. Human testing catches failures of empathy.

---

## The Testing Pyramid for Trauma-Informed Features

```
         /\
        /  \  Manual QA with lived-experience testers
       /----\
      /      \  Integration tests (Crisis Testing Dashboard)
     /--------\
    /          \  Component tests (Consumer components)
   /--------------\
  /                \  Unit tests (Signal processing, threshold logic)
 /--------------------\
/                      \  Fixtures (Pain patterns, mood progressions)
```

The base is fixtures—known data patterns that represent real scenarios.

The middle layers test that your code correctly processes those patterns.

The top is human verification that the processed result actually helps.

---

## Sample Test Suite Structure

```
src/test/
├── fixtures/
│   ├── makePainEntry.ts         # Pain entry factory
│   ├── sampleMoodData.ts        # Mood progressions
│   └── index.ts                 # Exports
├── test-utils.tsx               # Providers and render helpers
└── setup.ts                     # Global test configuration

src/components/accessibility/
├── TraumaInformedHooks.ts
├── TraumaInformedHooks.test.tsx # Unit tests for each hook
├── useCrisisDetection.ts
├── useCrisisDetection.test.ts   # Signal processing tests
├── CrisisTestingDashboard.tsx   # Manual testing tool
└── CrisisModeIntegration.tsx    # Full integration
```

---

## The Honest Answer

You can't fully automate testing for human experience.

What you *can* do:

1. **Test signal interpretation** — Does high error rate + back navigation = elevated stress?
2. **Test state transitions** — Does elevated stress → emergency mode?
3. **Test UI adaptations** — Does emergency mode → bigger buttons + simpler language?
4. **Test recovery flows** — Does resolution → gradual deactivation?

The gap between "test passes" and "user is helped" is where empathy lives. Automated tests keep the system mechanically correct. Human review keeps it humanely correct.

Both are required.

---

## Complementary Accessibility Testing Tools

Trauma-informed testing doesn't replace accessibility testing—it builds on top of it. Here's what I use alongside the strategies above:

### axe-core / @axe-core/react

Automated WCAG compliance checking. Catches the mechanical accessibility issues:

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('emergency mode has no accessibility violations', async () => {
  const { container } = render(<EmergencyModeLayout />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Lighthouse CI

Performance + accessibility audits in CI. Critical for ensuring emergency mode doesn't accidentally break accessibility:

```yaml
# .github/workflows/accessibility.yml
- name: Run Lighthouse
  uses: treosh/lighthouse-ci-action@v10
  with:
    urls: |
      http://localhost:3000/
      http://localhost:3000/?crisis=true
```

### @testing-library/jest-dom

Accessibility-focused matchers:

```typescript
// Verify crisis button is keyboard accessible
expect(screen.getByRole('button', { name: /emergency/i })).toBeEnabled();
expect(screen.getByRole('button', { name: /emergency/i })).toHaveFocus();
```

### Playwright Accessibility Snapshots

Full-page accessibility trees for regression testing:

```typescript
test('emergency UI maintains accessibility', async ({ page }) => {
  await page.goto('/?crisis=severe');
  await expect(page).toMatchAriaSnapshot(`
    - banner: Pain Tracker
    - main:
      - heading "Emergency Mode Active" [level=1]
      - button "Call Crisis Line"
  `);
});
```

### Manual Tools

- **NVDA / VoiceOver** — Screen reader testing (can't be automated)
- **High contrast mode** — Windows/macOS built-in
- **Reduced motion** — `prefers-reduced-motion` simulation in DevTools
- **Keyboard-only navigation** — Unplug your mouse

**The relationship:** Accessibility tools verify you're not breaking standards. Trauma-informed tests verify you're exceeding them.

---

## Resources

- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) — For component testing
- [Vitest](https://vitest.dev/) — Fast unit testing with fake timers
- [jest-axe](https://github.com/nickcolley/jest-axe) — Accessibility assertions
- [axe-core](https://github.com/dequelabs/axe-core) — Automated WCAG testing
- [Playwright Accessibility](https://playwright.dev/docs/accessibility-testing) — E2E accessibility snapshots
- Pain Tracker source: [github.com/CrisisCore-Systems/pain-tracker](https://github.com/CrisisCore-Systems/pain-tracker)

---

*Next in the series: "Offline Crisis Support: What Happens When the Network Dies at the Worst Moment"*

---

If your pages look anything like mine:
- In Canada, call or text **9-8-8**
- In the US, call or text **988**

You're not untestable. You're just a system that needs different metrics.
