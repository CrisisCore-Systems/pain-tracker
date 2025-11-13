/**
 * Screenshot Showcase Page
 * Provides clean, demonstration-ready views for screenshot capture
 */

import React from 'react';
import { DataExportModal } from '../components/export/DataExportModal';
import { InteractiveBodyMap } from '../components/body-mapping/InteractiveBodyMap';
import { CrisisTestingDashboard } from '../components/accessibility/CrisisTestingDashboard';
import { Card, CardHeader, CardTitle, CardContent } from '../design-system';
import { Lock, Zap, DollarSign, Heart } from 'lucide-react';
import type { PainEntry } from '../types';

// Demo data for screenshots
const DEMO_PAIN_ENTRIES: PainEntry[] = [
  {
    id: '1',
    timestamp: new Date().toISOString(),
    baselineData: {
      pain: 7,
      locations: ['lower-back', 'right-knee'],
      symptoms: ['sharp', 'throbbing']
    },
    notes: 'Demo pain entry for screenshot purposes'
  }
];

/**
 * Clean export modal view for screenshots
 */
export function ExportModalShowcase() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-8">
      <DataExportModal
        isOpen={true}
        onClose={() => {}}
        entries={DEMO_PAIN_ENTRIES}
        title="Export to WorkSafe BC Forms"
      />
    </div>
  );
}

/**
 * Body map interaction showcase
 */
export function BodyMapShowcase() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">
          Pinpoint Your Pain Locations
        </h1>
        <InteractiveBodyMap
          entries={DEMO_PAIN_ENTRIES}
          selectedRegions={['lower-back', 'right-knee']}
          onRegionSelect={() => {}}
          mode="selection"
        />
      </div>
    </div>
  );
}

/**
 * Privacy and security settings showcase
 */
export function PrivacySettingsShowcase() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-8">
      <Card className="max-w-2xl w-full shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
          <CardTitle className="text-2xl">Privacy & Security</CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg border-2 border-green-200">
            <Lock className="w-8 h-8 text-green-600 mt-1" />
            <div>
              <h3 className="font-semibold text-lg text-gray-900">Local Storage Only</h3>
              <p className="text-gray-700 mt-2">
                Your data is stored locally on your device using encrypted IndexedDB. 
                We cannot access your information even if we wanted to.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
            <Lock className="w-8 h-8 text-blue-600 mt-1" />
            <div>
              <h3 className="font-semibold text-lg text-gray-900">AES-256 Encryption</h3>
              <p className="text-gray-700 mt-2">
                All sensitive pain data is encrypted using military-grade AES-256 encryption 
                before storage.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4 p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
            <Lock className="w-8 h-8 text-purple-600 mt-1" />
            <div>
              <h3 className="font-semibold text-lg text-gray-900">HIPAA Aligned</h3>
              <p className="text-gray-700 mt-2">
                Built with HIPAA compliance in mind, including audit trails and 
                data protection measures.
              </p>
            </div>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-600">
              <strong>Unlike cloud-based competitors,</strong> your medical data 
              never leaves your device.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Benefits grid showcase for social media
 */
export function BenefitsGridShowcase() {
  const benefits = [
    {
      icon: Lock,
      title: 'Privacy First',
      description: 'Local-only storage',
      color: 'green'
    },
    {
      icon: Zap,
      title: 'One-Click Forms',
      description: 'WorkSafe BC ready',
      color: 'blue'
    },
    {
      icon: DollarSign,
      title: 'Free Forever',
      description: 'No subscriptions',
      color: 'purple'
    },
    {
      icon: Heart,
      title: 'Clinical Grade',
      description: 'Evidence-based',
      color: 'red'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <h1 className="text-4xl font-bold text-center mb-12 text-white">
          Why Pain Tracker?
        </h1>
        <div className="grid grid-cols-2 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card key={index} className="bg-white shadow-xl">
                <CardContent className="p-8 text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-${benefit.color}-100 mb-4`}>
                    <Icon className={`w-8 h-8 text-${benefit.color}-600`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * Comparison grid showcase
 */
export function ComparisonGridShowcase() {
  const features = [
    { feature: 'Local Storage', us: true, competitor1: false, competitor2: false },
    { feature: 'WorkSafe BC Forms', us: true, competitor1: false, competitor2: true },
    { feature: 'Free Forever', us: true, competitor1: false, competitor2: false },
    { feature: 'Offline Mode', us: true, competitor1: true, competitor2: false },
    { feature: 'Trauma-Informed UI', us: true, competitor1: false, competitor2: false },
    { feature: 'No Subscription', us: true, competitor1: false, competitor2: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center p-8">
      <Card className="max-w-4xl w-full shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardTitle className="text-3xl text-center">Why Pay for Less?</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-4 px-4 text-gray-900">Feature</th>
                <th className="text-center py-4 px-4 text-blue-600 font-bold">Pain Tracker</th>
                <th className="text-center py-4 px-4 text-gray-600">Competitor A</th>
                <th className="text-center py-4 px-4 text-gray-600">Competitor B</th>
              </tr>
            </thead>
            <tbody>
              {features.map((item, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="py-4 px-4 text-gray-900">{item.feature}</td>
                  <td className="text-center py-4 px-4">
                    {item.us ? (
                      <span className="text-green-600 text-2xl">✓</span>
                    ) : (
                      <span className="text-red-400 text-2xl">✗</span>
                    )}
                  </td>
                  <td className="text-center py-4 px-4">
                    {item.competitor1 ? (
                      <span className="text-green-600 text-2xl">✓</span>
                    ) : (
                      <span className="text-red-400 text-2xl">✗</span>
                    )}
                  </td>
                  <td className="text-center py-4 px-4">
                    {item.competitor2 ? (
                      <span className="text-green-600 text-2xl">✓</span>
                    ) : (
                      <span className="text-red-400 text-2xl">✗</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-center mt-8">
            <p className="text-2xl font-bold text-blue-600">
              Get More for Free
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Crisis support showcase
 */
export function CrisisSupportShowcase() {
  return (
    <div className="min-h-screen bg-white">
      <CrisisTestingDashboard />
    </div>
  );
}

/**
 * Main showcase router component
 */
export function ScreenshotShowcase() {
  const hash = window.location.hash;

  // Route to appropriate showcase based on hash
  switch (hash) {
    case '#demo-export':
    case '#demo-export-modal':
      return <ExportModalShowcase />;
    case '#demo-body-map':
      return <BodyMapShowcase />;
    case '#demo-settings':
      return <PrivacySettingsShowcase />;
    case '#demo-comparison':
      return <ComparisonGridShowcase />;
    case '#demo-crisis':
      return <CrisisSupportShowcase />;
    case '#demo-benefits':
      return <BenefitsGridShowcase />;
    default:
      return null;
  }
}
