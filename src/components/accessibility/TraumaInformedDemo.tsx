/**
 * Trauma-Informed UX Integration Demo
 * Demonstrates how to integrate trauma-informed components with existing pain tracker
 */

import React from 'react';
import { TraumaInformedLayout } from './TraumaInformedLayout';
import { TraumaInformedPainEntryForm } from './TraumaInformedPainForm';
import { AccessibilitySettingsPanel } from './AccessibilitySettings';
import { Card, CardContent, CardHeader, CardTitle } from '../../design-system';
import { ProgressiveDisclosure, MemoryAid, ComfortPrompt } from './TraumaInformedUX';
import { useTraumaInformed } from './TraumaInformedHooks';
import { Heart, Shield, Brain, Eye } from 'lucide-react';

export function TraumaInformedDemo() {
  return (
    <TraumaInformedLayout title="Pain Tracker - Trauma-Informed Version">
      <div className="space-y-6">
        {/* Welcome section with trauma-informed messaging */}
        <WelcomeSection />
        
        {/* Main pain entry form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <TraumaInformedPainEntryForm 
            onSubmit={(entry) => {
              console.log('Pain entry submitted:', entry);
              // In demo mode, just log the submission
            }}
          />
        </div>
        
        {/* Feature showcase */}
        <FeatureShowcase />
      </div>
    </TraumaInformedLayout>
  );
}

function WelcomeSection() {
  const { preferences } = useTraumaInformed();
  
  return (
    <div className="text-center space-y-4">
      <h1 className="text-3xl font-bold text-gray-900">
        Welcome to Your Pain Tracker
      </h1>
      
      {preferences.gentleLanguage ? (
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          This is your safe space to track and understand your pain. 
          You're in complete control of what you share and when. 
          Take your time, and remember - you're taking an important step in your health journey.
        </p>
      ) : (
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Track your pain levels, symptoms, and treatments to better understand your health patterns.
        </p>
      )}
      
      <ComfortPrompt />
    </div>
  );
}

function FeatureShowcase() {
  const { preferences } = useTraumaInformed();
  
  const features = [
    {
      icon: <Brain className="w-8 h-8 text-purple-500" />,
      title: "Cognitive Support",
      description: "Memory aids, simplified interface, and gentle guidance reduce cognitive load",
      enabled: preferences.showMemoryAids || preferences.simplifiedMode
    },
    {
      icon: <Eye className="w-8 h-8 text-blue-500" />,
      title: "Visual Accommodations", 
      description: "Adjustable text size, contrast, and reduced motion for comfortable viewing",
      enabled: preferences.fontSize !== 'medium' || preferences.contrast !== 'normal'
    },
    {
      icon: <Heart className="w-8 h-8 text-red-500" />,
      title: "Emotional Safety",
      description: "Gentle language, comfort prompts, and trauma-informed interaction patterns",
      enabled: preferences.gentleLanguage || preferences.showComfortPrompts
    },
    {
      icon: <Shield className="w-8 h-8 text-green-500" />,
      title: "Privacy & Control",
      description: "You control what information to share and can take breaks anytime",
      enabled: true
    }
  ];
  
  if (preferences.simplifiedMode) {
    return (
      <ProgressiveDisclosure
        title="Trauma-Informed Features"
        level="helpful"
        memoryAid="See how this interface adapts to support your needs"
        defaultOpen={false}
      >
        <div className="bg-white rounded-lg shadow-sm p-6">
          <FeatureGrid features={features} />
        </div>
      </ProgressiveDisclosure>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Trauma-Informed Features</CardTitle>
        <p className="text-gray-600">
          This interface includes accommodations designed to support people with various needs
        </p>
      </CardHeader>
      <CardContent>
        <FeatureGrid features={features} />
      </CardContent>
    </Card>
  );
}

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
}

function FeatureGrid({ features }: { features: Feature[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {features.map((feature, index) => (
        <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex-shrink-0">
            {feature.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-medium text-gray-900">{feature.title}</h3>
              {feature.enabled && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">{feature.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// Integration examples for existing components
export function IntegratedPainTracker() {
  return (
    <TraumaInformedLayout>
      <div className="space-y-6">
        <MemoryAid
          text="Start by rating your current pain level, then add details about location and symptoms. Your information is saved automatically."
          type="tip"
        />
        
        {/* Your existing pain tracker components would go here */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Pain Entry</h2>
          <TraumaInformedPainEntryForm 
            onSubmit={(data) => console.log('Pain data:', data)}
          />
        </div>
      </div>
    </TraumaInformedLayout>
  );
}

// Settings integration example
export function SettingsIntegration() {
  return (
    <TraumaInformedLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Accessibility & Comfort Settings
          </h1>
          <p className="text-gray-600">
            Customize your experience to work best for your needs
          </p>
        </div>
        
        <AccessibilitySettingsPanel />
      </div>
    </TraumaInformedLayout>
  );
}
