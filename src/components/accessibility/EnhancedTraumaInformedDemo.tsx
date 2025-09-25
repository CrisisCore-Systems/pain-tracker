/**
 * Enhanced Trauma-Informed Design Demo
 * Demonstrates the improved trauma-informed features with deeper cognitive load awareness,
 * crisis-state adaptations, content warnings, and progressive disclosure patterns
 */

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../design-system';
import { 
  CognitiveLoadWrapper,
  CognitiveLoadMonitor,
  CrisisStateAdaptation,
  ContentWarning,
  InlineContentWarning,
  AutoContentWarning,
  LayeredDisclosure,
  AdaptiveDisclosure,
  useCrisisDetection,
  useTraumaInformed
} from './index';
import { TouchOptimizedButton } from './TraumaInformedUX';
import { Brain, AlertTriangle, Shield, Layers, Target } from 'lucide-react';

export function EnhancedTraumaInformedDemo() {
  const { crisisLevel, resetCrisisDetection } = useCrisisDetection();
  const [currentDemo, setCurrentDemo] = useState<string>('overview');

  // Map crisis levels to component expectations
  const mappedCrisisLevel = crisisLevel === 'critical' || crisisLevel === 'acute' ? 'emergency' : crisisLevel;

  return (
    <CrisisStateAdaptation
      crisisLevel={mappedCrisisLevel}
      onCrisisHelp={() => alert('Crisis help would be provided here')}
      onTakeBreak={() => alert('Break features would be activated')}
      onSimplifyInterface={() => alert('Interface would be simplified')}
    >
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Enhanced Trauma-Informed Design
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Experience the enhanced trauma-informed design features including cognitive load indicators,
            crisis-state adaptations, content warnings, and progressive disclosure patterns.
          </p>
          
          {crisisLevel !== 'none' && (
            <div className="mt-4">
              <TouchOptimizedButton
                variant="secondary"
                onClick={() => resetCrisisDetection('resolved')}
                className="text-sm"
              >
                Reset Crisis Detection (Current: {crisisLevel})
              </TouchOptimizedButton>
            </div>
          )}
        </div>

        <DemoNavigation 
          currentDemo={currentDemo}
          onDemoChange={setCurrentDemo}
        />

        <div className="mt-8">
          {currentDemo === 'overview' && <OverviewDemo />}
          {currentDemo === 'cognitive-load' && <CognitiveLoadDemo />}
          {currentDemo === 'crisis-adaptation' && <CrisisAdaptationDemo />}
          {currentDemo === 'content-warnings' && <ContentWarningsDemo />}
          {currentDemo === 'progressive-disclosure' && <ProgressiveDisclosureDemo />}
        </div>
      </div>
    </CrisisStateAdaptation>
  );
}

function DemoNavigation({
  currentDemo,
  onDemoChange
}: {
  currentDemo: string;
  onDemoChange: (demo: string) => void;
}) {
  const demos = [
    { id: 'overview', title: 'Overview', icon: Target },
    { id: 'cognitive-load', title: 'Cognitive Load', icon: Brain },
    { id: 'crisis-adaptation', title: 'Crisis Adaptation', icon: AlertTriangle },
    { id: 'content-warnings', title: 'Content Warnings', icon: Shield },
    { id: 'progressive-disclosure', title: 'Progressive Disclosure', icon: Layers }
  ];

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {demos.map(demo => {
        const Icon = demo.icon;
        return (
          <TouchOptimizedButton
            key={demo.id}
            variant={currentDemo === demo.id ? 'primary' : 'secondary'}
            onClick={() => onDemoChange(demo.id)}
            className="flex items-center space-x-2"
          >
            <Icon className="w-4 h-4" />
            <span>{demo.title}</span>
          </TouchOptimizedButton>
        );
      })}
    </div>
  );
}

function OverviewDemo() {
  const { preferences } = useTraumaInformed();
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-green-600" />
            <span>Enhanced Trauma-Informed Features</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            The enhanced trauma-informed design system now includes four major improvements
            to better support users who may be experiencing trauma, cognitive challenges, or crisis states.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FeatureCard
              icon={<Brain className="w-6 h-6 text-purple-600" />}
              title="Cognitive Load Indicators"
              description="Visual indicators show complexity levels and provide suggestions for reducing cognitive burden"
            />
            
            <FeatureCard
              icon={<AlertTriangle className="w-6 h-6 text-orange-600" />}
              title="Crisis-State Adaptations"
              description="Interface automatically adapts when crisis behaviors are detected, offering immediate support"
            />
            
            <FeatureCard
              icon={<Shield className="w-6 h-6 text-red-600" />}
              title="Content Warnings"
              description="Trauma-aware warnings for potentially triggering content with progressive disclosure options"
            />
            
            <FeatureCard
              icon={<Layers className="w-6 h-6 text-blue-600" />}
              title="Progressive Disclosure"
              description="Smart information layering that adapts to user preferences and cognitive capacity"
            />
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Your Current Settings</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Simplified Mode: {preferences.simplifiedMode ? 'On' : 'Off'}</div>
              <div>Memory Aids: {preferences.showMemoryAids ? 'On' : 'Off'}</div>
              <div>Gentle Language: {preferences.gentleLanguage ? 'On' : 'Off'}</div>
              <div>Comfort Prompts: {preferences.showComfortPrompts ? 'On' : 'Off'}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex items-start space-x-3">
        {icon}
        <div>
          <h3 className="font-medium text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  );
}

function CognitiveLoadDemo() {
  const [complexityLevel, setComplexityLevel] = useState<'simple' | 'moderate' | 'complex'>('simple');
  const formRef = useRef<HTMLFormElement>(null);
  const [loadLevel, setLoadLevel] = useState<'minimal' | 'moderate' | 'high' | 'overwhelming'>('minimal');

  const complexityConfigs = {
    simple: {
      fields: 3,
      required: 1,
      complex: false,
      description: 'A simple form with basic fields'
    },
    moderate: {
      fields: 8,
      required: 3,
      complex: true,
      description: 'A moderate form with multiple sections'
    },
    complex: {
      fields: 15,
      required: 7,
      complex: true,
      description: 'A complex form with many fields and interactions'
    }
  };

  const config = complexityConfigs[complexityLevel];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <span>Cognitive Load Indicators</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Cognitive load indicators help users understand the complexity of forms and sections,
            providing guidance and simplification options when needed.
          </p>

          <div className="flex space-x-2 mb-4">
            {Object.entries(complexityConfigs).map(([key]) => (
              <TouchOptimizedButton
                key={key}
                variant={complexityLevel === key ? 'primary' : 'secondary'}
                onClick={() => setComplexityLevel(key as 'simple' | 'moderate' | 'complex')}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)} Form
              </TouchOptimizedButton>
            ))}
          </div>

          <CognitiveLoadWrapper
            fieldsCount={config.fields}
            requiredFields={config.required}
            hasComplexInteractions={config.complex}
            showIndicator={true}
            onSimplify={() => alert('Interface would be simplified')}
          >
            <form ref={formRef} className="space-y-4">
              <h3 className="text-lg font-medium">{config.description}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: config.fields }, (_, i) => (
                  <div key={i}>
                    <label className="block text-sm font-medium text-gray-700">
                      Field {i + 1} {i < config.required ? '*' : ''}
                    </label>
                    <input
                      type="text"
                      required={i < config.required}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      {...(config.complex && i % 3 === 0 ? { 'data-complex': true } : {})}
                    />
                  </div>
                ))}
              </div>
            </form>
          </CognitiveLoadWrapper>

          <CognitiveLoadMonitor
            formElement={formRef}
            onLoadChange={setLoadLevel}
          />

          <div className="mt-4 p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">
              Current detected load level: <strong>{loadLevel}</strong>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CrisisAdaptationDemo() {
  const [simulatedCrisis, setSimulatedCrisis] = useState<'none' | 'mild' | 'moderate' | 'severe' | 'emergency'>('none');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <span>Crisis-State Interface Adaptations</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            The interface automatically detects crisis behaviors and adapts to provide appropriate support.
            Crisis levels are detected through user behavior patterns like rapid clicking, frequent navigation, or errors.
          </p>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Simulate Crisis Level:
            </label>
            <div className="flex space-x-2">
              {(['none', 'mild', 'moderate', 'severe', 'emergency'] as const).map(level => (
                <TouchOptimizedButton
                  key={level}
                  variant={simulatedCrisis === level ? 'primary' : 'secondary'}
                  onClick={() => setSimulatedCrisis(level)}
                  className="capitalize"
                >
                  {level}
                </TouchOptimizedButton>
              ))}
            </div>
          </div>

          <CrisisStateAdaptation
            crisisLevel={simulatedCrisis}
            onCrisisHelp={() => alert('Crisis support resources would be provided')}
            onTakeBreak={() => alert('Break and self-care suggestions would be offered')}
            onSimplifyInterface={() => alert('Interface would switch to simplified mode')}
          >
            <div className="p-6 bg-white rounded-lg border">
              <h3 className="text-lg font-medium mb-4">Sample Content Area</h3>
              <p className="text-gray-600 mb-4">
                This content area shows how the interface adapts based on crisis level.
                Notice how the background, borders, and available actions change.
              </p>
              
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Sample form field"
                  className="w-full p-2 border rounded"
                />
                <textarea
                  placeholder="Sample text area"
                  className="w-full p-2 border rounded h-20"
                />
                <TouchOptimizedButton variant="primary">
                  Sample Action Button
                </TouchOptimizedButton>
              </div>
            </div>
          </CrisisStateAdaptation>
        </CardContent>
      </Card>
    </div>
  );
}

function ContentWarningsDemo() {
  const [selectedLevel, setSelectedLevel] = useState<'mild' | 'moderate' | 'severe'>('moderate');

  const sampleTriggers = {
    mild: ['Pain descriptions', 'Medical terminology'],
    moderate: ['Detailed pain descriptions', 'Medical procedures', 'Disability discussion'],
    severe: ['Severe pain experiences', 'Trauma discussion', 'Mental health struggles', 'Medical emergencies']
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-red-600" />
            <span>Trauma-Aware Content Warnings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Content warnings provide gentle, informative alerts about potentially triggering content
            with options to proceed, skip, or customize warning preferences.
          </p>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Warning Level:
            </label>
            <div className="flex space-x-2">
              {(['mild', 'moderate', 'severe'] as const).map(level => (
                <TouchOptimizedButton
                  key={level}
                  variant={selectedLevel === level ? 'primary' : 'secondary'}
                  onClick={() => setSelectedLevel(level)}
                  className="capitalize"
                >
                  {level}
                </TouchOptimizedButton>
              ))}
            </div>
          </div>

          <ContentWarning
            level={selectedLevel}
            triggerTypes={sampleTriggers[selectedLevel]}
            title={`${selectedLevel.charAt(0).toUpperCase() + selectedLevel.slice(1)} Content Warning`}
            description={`This demonstrates a ${selectedLevel} level content warning with appropriate trigger types.`}
            onProceed={() => alert('User chose to proceed with content')}
            onSkip={() => alert('User chose to skip this content')}
          >
            <div className="p-6 bg-white rounded-lg border">
              <h3 className="text-lg font-medium mb-4">Protected Content Area</h3>
              <p className="text-gray-600 mb-4">
                This content would normally be hidden behind the warning. It might contain
                sensitive information related to pain experiences, medical procedures, or
                other potentially triggering topics.
              </p>
              
              <div className="space-y-2">
                <p>Sample potentially sensitive content...</p>
                <InlineContentWarning triggerType="detailed medical information">
                  <span className="text-red-600">This specific text contains medical details</span>
                </InlineContentWarning>
              </div>
            </div>
          </ContentWarning>

          <div className="mt-6">
            <h4 className="font-medium mb-2">Automatic Content Analysis</h4>
            <AutoContentWarning
              analysisText="This content discusses severe chronic pain, emergency surgery, and mental health challenges including depression and anxiety."
              customTriggers={['Custom trigger example']}
            >
              <div className="p-4 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">
                  This content was automatically analyzed and flagged based on keywords and context.
                </p>
              </div>
            </AutoContentWarning>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProgressiveDisclosureDemo() {
  const sampleSections = [
    {
      id: 'basic-info',
      title: 'Basic Pain Information',
      level: 'essential' as const,
      content: (
        <div className="space-y-3">
          <p>Essential information about tracking your pain levels and basic symptoms.</p>
          <div className="grid grid-cols-2 gap-3">
            <input type="number" placeholder="Pain level (0-10)" className="p-2 border rounded" />
            <input type="text" placeholder="Location" className="p-2 border rounded" />
          </div>
        </div>
      ),
      memoryAid: 'Start here - this is the most important information',
      estimatedTime: 2,
      cognitiveLoad: 'minimal' as const
    },
    {
      id: 'detailed-symptoms',
      title: 'Detailed Symptom Description',
      level: 'helpful' as const,
      content: (
        <div className="space-y-3">
          <p>Additional details about your symptoms that can help with tracking patterns.</p>
          <textarea 
            placeholder="Describe your symptoms in detail..." 
            className="w-full p-2 border rounded h-24"
          />
          <div className="grid grid-cols-3 gap-2">
            <select className="p-2 border rounded"><option>Pain Type</option></select>
            <select className="p-2 border rounded"><option>Severity</option></select>
            <select className="p-2 border rounded"><option>Duration</option></select>
          </div>
        </div>
      ),
      memoryAid: 'Details help identify patterns over time',
      estimatedTime: 5,
      cognitiveLoad: 'moderate' as const
    },
    {
      id: 'medications',
      title: 'Medications and Treatments',
      level: 'advanced' as const,
      content: (
        <div className="space-y-3">
          <p>Comprehensive medication and treatment tracking.</p>
          <div className="space-y-2">
            <input type="text" placeholder="Medication name" className="w-full p-2 border rounded" />
            <div className="grid grid-cols-3 gap-2">
              <input type="text" placeholder="Dosage" className="p-2 border rounded" />
              <input type="time" className="p-2 border rounded" />
              <select className="p-2 border rounded"><option>Effectiveness</option></select>
            </div>
          </div>
        </div>
      ),
      memoryAid: 'Important for healthcare provider discussions',
      estimatedTime: 8,
      cognitiveLoad: 'high' as const
    },
    {
      id: 'data-analysis',
      title: 'Advanced Data Analysis',
      level: 'expert' as const,
      content: (
        <div className="space-y-3">
          <p>Expert-level data analysis and reporting features.</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium">Report Period</label>
              <select className="w-full p-2 border rounded">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Custom range</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Analysis Type</label>
              <select className="w-full p-2 border rounded">
                <option>Trend Analysis</option>
                <option>Pattern Recognition</option>
                <option>Correlation Study</option>
              </select>
            </div>
          </div>
        </div>
      ),
      memoryAid: 'Advanced features for detailed health insights',
      estimatedTime: 15,
      cognitiveLoad: 'overwhelming' as const
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <span>Progressive Disclosure Patterns</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Progressive disclosure organizes information by importance and complexity,
            allowing users to access only what they need when they need it.
          </p>

          <LayeredDisclosure
            title="Pain Tracking Information"
            sections={sampleSections}
            showAllLevels={false}
          />

          <div className="mt-8">
            <h4 className="font-medium mb-4">Adaptive Disclosure Example</h4>
            <AdaptiveDisclosure
              title="Smart Content Section"
              adaptToUserBehavior={true}
            >
              <div className="p-4 bg-gray-50 rounded">
                <p className="text-sm text-gray-600 mb-3">
                  This section adapts its complexity level based on your interaction patterns
                  and current preferences. The more you interact with the interface, the more
                  detailed options become available.
                </p>
                
                <div className="space-y-2">
                  <TouchOptimizedButton variant="secondary">Basic Action</TouchOptimizedButton>
                  <TouchOptimizedButton variant="secondary">Intermediate Option</TouchOptimizedButton>
                  <TouchOptimizedButton variant="secondary">Advanced Feature</TouchOptimizedButton>
                </div>
              </div>
            </AdaptiveDisclosure>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
