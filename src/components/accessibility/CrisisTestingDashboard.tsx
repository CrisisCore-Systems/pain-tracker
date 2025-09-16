/**
 * Crisis Testing Components
 * Testing and validation components to ensure crisis features work properly under stress conditions
 */

import { useState, useCallback, useRef } from 'react';
import { useCrisisDetection } from './useCrisisDetection';
import { useCrisisMode } from './CrisisModeIntegration';
import { StressAdaptiveButton, StressResponsiveCard, StressResponsiveText } from './StressResponsiveUI';
import { Play, Pause, RotateCcw, CheckCircle, AlertTriangle, Info } from 'lucide-react';

// Test Scenario Types
interface TestScenario {
  id: string;
  name: string;
  description: string;
  duration: number; // in seconds
  stressLevel: 'mild' | 'moderate' | 'severe' | 'emergency';
  simulatedBehaviors: {
    rapidClicks: boolean;
    erraticMovement: boolean;
    longPauses: boolean;
    frustrationIndicators: boolean;
  };
  expectedOutcomes: string[];
}

interface TestResult {
  scenarioId: string;
  startTime: Date;
  endTime?: Date;
  passed: boolean;
  issues: string[];
  metrics: {
    responseTime: number;
    adaptationSpeed: number;
    userExperience: 'poor' | 'fair' | 'good' | 'excellent';
  };
}

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
      frustrationIndicators: false
    },
    expectedOutcomes: [
      'UI slightly enlarges touch targets',
      'Stress indicator appears',
      'Subtle color adaptations'
    ]
  },
  {
    id: 'moderate-stress',
    name: 'Moderate Stress Adaptation',
    description: 'Tests adaptive UI for moderate stress levels',
    duration: 45,
    stressLevel: 'moderate',
    simulatedBehaviors: {
      rapidClicks: true,
      erraticMovement: true,
      longPauses: true,
      frustrationIndicators: true
    },
    expectedOutcomes: [
      'Larger buttons and touch targets',
      'Cognitive fog navigation activates',
      'Color scheme adapts to warmer tones',
      'Animation speeds reduce'
    ]
  },
  {
    id: 'severe-stress',
    name: 'Severe Crisis Response',
    description: 'Tests emergency mode activation and crisis features',
    duration: 60,
    stressLevel: 'severe',
    simulatedBehaviors: {
      rapidClicks: true,
      erraticMovement: true,
      longPauses: true,
      frustrationIndicators: true
    },
    expectedOutcomes: [
      'Emergency mode interface appears',
      'Multi-modal input system activates',
      'Crisis alert banner shows',
      'Simplified navigation enabled'
    ]
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
      frustrationIndicators: true
    },
    expectedOutcomes: [
      'Full emergency interface active',
      'All animations disabled',
      'Maximum contrast enabled',
      'Emergency contacts readily accessible',
      'Voice commands working'
    ]
  }
];

// Crisis Testing Dashboard
export function CrisisTestingDashboard() {
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [currentScenario, setCurrentScenario] = useState<TestScenario | null>(null);
  const [testProgress, setTestProgress] = useState(0);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [simulationActive, setSimulationActive] = useState(false);
  
  const { crisisLevel, resetCrisisDetection } = useCrisisDetection();
  const { isCrisisModeActive, crisisFeatures } = useCrisisMode();
  
  const testIntervalRef = useRef<NodeJS.Timeout>();
  const currentTestRef = useRef<TestResult | null>(null);

  // Simulate stress behaviors
  const simulateStressBehaviors = useCallback((scenario: TestScenario) => {
    if (!simulationActive) return;

    // Simulate rapid clicks
    if (scenario.simulatedBehaviors.rapidClicks) {
      const clickEvents = Math.floor(Math.random() * 5) + 3;
      for (let i = 0; i < clickEvents; i++) {
        setTimeout(() => {
          document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        }, i * 100);
      }
    }

    // Simulate erratic movement
    if (scenario.simulatedBehaviors.erraticMovement) {
      const moveEvents = Math.floor(Math.random() * 10) + 5;
      for (let i = 0; i < moveEvents; i++) {
        setTimeout(() => {
          document.dispatchEvent(new MouseEvent('mousemove', {
            clientX: Math.random() * window.innerWidth,
            clientY: Math.random() * window.innerHeight,
            bubbles: true
          }));
        }, i * 200);
      }
    }

    // Simulate long pauses (no activity)
    if (scenario.simulatedBehaviors.longPauses) {
      setTimeout(() => {
        // Intentional pause - no events dispatched
      }, 3000);
    }

    // Simulate frustration indicators
    if (scenario.simulatedBehaviors.frustrationIndicators) {
      setTimeout(() => {
        // Rapid key presses
        ['Escape', 'Escape', 'Backspace'].forEach((key, index) => {
          setTimeout(() => {
            document.dispatchEvent(new KeyboardEvent('keydown', { key }));
          }, index * 100);
        });
      }, 1000);
    }
  }, [simulationActive]);

  // Complete test and evaluate results
  const completeTest = useCallback((testResult: TestResult) => {
    testResult.endTime = new Date();
    
    // Evaluate test outcomes
    const issues: string[] = [];
    let passed = true;

    // Check if crisis level matches expected
    const scenario = TEST_SCENARIOS.find(s => s.id === testResult.scenarioId);
    if (scenario) {
      if (crisisLevel !== scenario.stressLevel) {
        issues.push(`Crisis level mismatch: expected ${scenario.stressLevel}, got ${crisisLevel}`);
        passed = false;
      }

      // Check crisis mode activation
      if (scenario.stressLevel === 'severe' || scenario.stressLevel === 'emergency') {
        if (!isCrisisModeActive) {
          issues.push('Crisis mode should be active but is not');
          passed = false;
        }
      }

      // Check specific features
      if (scenario.stressLevel === 'moderate' && !crisisFeatures.cognitiveFogSupport) {
        issues.push('Cognitive fog support should be active');
        passed = false;
      }

      if (scenario.stressLevel === 'severe' && !crisisFeatures.emergencyMode) {
        issues.push('Emergency mode should be active');
        passed = false;
      }

      if (scenario.stressLevel === 'emergency' && !crisisFeatures.multiModalInput) {
        issues.push('Multi-modal input should be active');
        passed = false;
      }
    }

    // Calculate metrics
    const responseTime = testResult.endTime.getTime() - testResult.startTime.getTime();
    testResult.metrics = {
      responseTime: responseTime / 1000,
      adaptationSpeed: passed ? 5 : 2, // Simplified metric
      userExperience: passed ? (issues.length === 0 ? 'excellent' : 'good') : 'poor'
    };

    testResult.passed = passed;
    testResult.issues = issues;

    setTestResults(prev => [...prev, testResult]);
    setIsTestRunning(false);
    setCurrentScenario(null);
    setTestProgress(0);
    setSimulationActive(false);

  }, [crisisLevel, isCrisisModeActive, crisisFeatures]);

  // Run test scenario
  const runTestScenario = useCallback(async (scenario: TestScenario) => {
    setIsTestRunning(true);
    setCurrentScenario(scenario);
    setTestProgress(0);
    setSimulationActive(true);

    const testResult: TestResult = {
      scenarioId: scenario.id,
      startTime: new Date(),
      passed: false,
      issues: [],
      metrics: {
        responseTime: 0,
        adaptationSpeed: 0,
        userExperience: 'poor'
      }
    };

    currentTestRef.current = testResult;

    // Reset crisis detection before starting
    resetCrisisDetection();

    // Start progress tracking
    const startTime = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = Math.min((elapsed / scenario.duration) * 100, 100);
      setTestProgress(progress);

      if (progress >= 100) {
        clearInterval(progressInterval);
        completeTest(testResult);
      }
    }, 100);

    // Simulate behaviors throughout test
    const behaviorInterval = setInterval(() => {
      simulateStressBehaviors(scenario);
    }, 2000);

    // Store intervals for cleanup
    testIntervalRef.current = behaviorInterval;

    // Set timeout to end test
    setTimeout(() => {
      clearInterval(progressInterval);
      clearInterval(behaviorInterval);
      setSimulationActive(false);
    }, scenario.duration * 1000);

  }, [simulateStressBehaviors, resetCrisisDetection, completeTest]);

  // Stop current test
  const stopTest = useCallback(() => {
    if (testIntervalRef.current) {
      clearInterval(testIntervalRef.current);
    }
    setIsTestRunning(false);
    setCurrentScenario(null);
    setTestProgress(0);
    setSimulationActive(false);
    resetCrisisDetection();
  }, [resetCrisisDetection]);

  // Run all tests
  const runAllTests = useCallback(async () => {
    for (const scenario of TEST_SCENARIOS) {
      await new Promise<void>((resolve) => {
        runTestScenario(scenario);
        
        const checkComplete = () => {
          if (!isTestRunning) {
            resolve();
          } else {
            setTimeout(checkComplete, 1000);
          }
        };
        setTimeout(checkComplete, (scenario.duration + 2) * 1000);
      });
      
      // Wait between tests
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }, [runTestScenario, isTestRunning]);

  // Clear all test results
  const clearResults = useCallback(() => {
    setTestResults([]);
    resetCrisisDetection();
  }, [resetCrisisDetection]);

  return (
    <div className="crisis-testing-dashboard p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Crisis Feature Testing Dashboard</h1>
        <p className="text-gray-600">
          Test and validate crisis-responsive features under simulated stress conditions
        </p>
      </div>

      {/* Test Controls */}
      <StressResponsiveCard title="Test Controls" className="mb-6">
        <div className="flex flex-wrap gap-3">
          <StressAdaptiveButton
            onClick={runAllTests}
            disabled={isTestRunning}
            urgency="medium"
          >
            <Play className="w-4 h-4 mr-2" />
            Run All Tests
          </StressAdaptiveButton>
          
          <StressAdaptiveButton
            onClick={stopTest}
            disabled={!isTestRunning}
            urgency="low"
          >
            <Pause className="w-4 h-4 mr-2" />
            Stop Test
          </StressAdaptiveButton>
          
          <StressAdaptiveButton
            onClick={clearResults}
            disabled={isTestRunning}
            urgency="low"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Clear Results
          </StressAdaptiveButton>
        </div>
      </StressResponsiveCard>

      {/* Current Test Status */}
      {isTestRunning && currentScenario && (
        <StressResponsiveCard title="Current Test" priority="high" className="mb-6">
          <div className="space-y-3">
            <div>
              <StressResponsiveText level="subheading" emphasis="medium">
                {currentScenario.name}
              </StressResponsiveText>
              <StressResponsiveText level="body">
                {currentScenario.description}
              </StressResponsiveText>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-gray-600">{Math.round(testProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${testProgress}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Target Stress Level:</strong> {currentScenario.stressLevel}
              </div>
              <div>
                <strong>Current Level:</strong> {crisisLevel}
              </div>
              <div>
                <strong>Crisis Mode:</strong> {isCrisisModeActive ? 'Active' : 'Inactive'}
              </div>
              <div>
                <strong>Duration:</strong> {currentScenario.duration}s
              </div>
            </div>
          </div>
        </StressResponsiveCard>
      )}

      {/* Individual Test Scenarios */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {TEST_SCENARIOS.map((scenario) => (
          <StressResponsiveCard
            key={scenario.id}
            title={scenario.name}
            priority={scenario.stressLevel === 'emergency' ? 'emergency' : 
                    scenario.stressLevel === 'severe' ? 'high' : 'medium'}
            className="h-full"
          >
            <div className="space-y-3">
              <StressResponsiveText level="body">
                {scenario.description}
              </StressResponsiveText>
              
              <div className="text-sm space-y-1">
                <div><strong>Duration:</strong> {scenario.duration}s</div>
                <div><strong>Stress Level:</strong> {scenario.stressLevel}</div>
              </div>

              <div className="text-sm">
                <strong>Expected Outcomes:</strong>
                <ul className="mt-1 ml-4 list-disc">
                  {scenario.expectedOutcomes.map((outcome, index) => (
                    <li key={index}>{outcome}</li>
                  ))}
                </ul>
              </div>

              <StressAdaptiveButton
                onClick={() => runTestScenario(scenario)}
                disabled={isTestRunning}
                size="normal"
                urgency="low"
                className="w-full mt-3"
              >
                <Play className="w-4 h-4 mr-2" />
                Run Test
              </StressAdaptiveButton>
            </div>
          </StressResponsiveCard>
        ))}
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <StressResponsiveCard title="Test Results" className="mb-6">
          <div className="space-y-4">
            {testResults.map((result, index) => {
              const scenario = TEST_SCENARIOS.find(s => s.id === result.scenarioId);
              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${
                    result.passed 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium flex items-center">
                      {result.passed ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                      )}
                      {scenario?.name || result.scenarioId}
                    </h3>
                    <span className={`text-sm font-medium ${
                      result.passed ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {result.passed ? 'PASSED' : 'FAILED'}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <strong>Response Time:</strong> {result.metrics.responseTime.toFixed(1)}s
                    </div>
                    <div>
                      <strong>Adaptation Speed:</strong> {result.metrics.adaptationSpeed}/5
                    </div>
                    <div>
                      <strong>User Experience:</strong> {result.metrics.userExperience}
                    </div>
                  </div>

                  {result.issues.length > 0 && (
                    <div className="mt-3">
                      <strong className="text-red-600">Issues Found:</strong>
                      <ul className="mt-1 ml-4 list-disc text-red-600">
                        {result.issues.map((issue, issueIndex) => (
                          <li key={issueIndex}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </StressResponsiveCard>
      )}

      {/* Testing Guidelines */}
      <StressResponsiveCard title="Testing Guidelines" priority="low">
        <div className="space-y-3 text-sm">
          <div className="flex items-start">
            <Info className="w-4 h-4 mt-0.5 mr-2 text-blue-600" />
            <div>
              <strong>Automated Testing:</strong> Tests simulate user behaviors associated with stress and crisis states
            </div>
          </div>
          <div className="flex items-start">
            <Info className="w-4 h-4 mt-0.5 mr-2 text-blue-600" />
            <div>
              <strong>Manual Validation:</strong> Observe UI changes, feature activation, and overall responsiveness
            </div>
          </div>
          <div className="flex items-start">
            <Info className="w-4 h-4 mt-0.5 mr-2 text-blue-600" />
            <div>
              <strong>Expected Behavior:</strong> System should adapt progressively as stress levels increase
            </div>
          </div>
          <div className="flex items-start">
            <Info className="w-4 h-4 mt-0.5 mr-2 text-blue-600" />
            <div>
              <strong>Performance:</strong> Adaptations should occur within 2-3 seconds of stress detection
            </div>
          </div>
        </div>
      </StressResponsiveCard>
    </div>
  );
}

export default CrisisTestingDashboard;
