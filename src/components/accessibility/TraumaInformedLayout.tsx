/**
 * Trauma-Informed Layout
 * Main layout component that applies trauma-informed design patterns
 */

import React, { useState } from 'react';
import { TraumaInformedProvider } from './TraumaInformedContext';
import { useTraumaInformed } from './TraumaInformedHooks';
import { AccessibilitySettingsPanel } from './AccessibilitySettings';
import { ProgressiveDisclosure, ComfortPrompt, MemoryAid } from './TraumaInformedUX';
import { TouchOptimizedButton } from './TraumaInformedUX';
import { Settings, X, Heart, HelpCircle } from 'lucide-react';

interface TraumaInformedLayoutProps {
  children: React.ReactNode;
  title?: string;
  showComfortPrompts?: boolean;
  showMemoryAids?: boolean;
}

// Main layout wrapper with provider
export function TraumaInformedLayout({ 
  children, 
  title = "Pain Tracker",
  showComfortPrompts = true,
  showMemoryAids = true
}: TraumaInformedLayoutProps) {
  return (
    <TraumaInformedProvider>
      <TraumaInformedLayoutInner 
        title={title}
        showComfortPrompts={showComfortPrompts}
        showMemoryAids={showMemoryAids}
      >
        {children}
      </TraumaInformedLayoutInner>
    </TraumaInformedProvider>
  );
}

// Inner layout component that uses the context
function TraumaInformedLayoutInner({ 
  children, 
  title,
  showComfortPrompts,
  showMemoryAids
}: TraumaInformedLayoutProps & { title: string }) {
  const { preferences } = useTraumaInformed();
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="trauma-informed-layout min-h-screen bg-gray-50">
      {/* Skip to main content link for screen readers */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50"
      >
        Skip to main content
      </a>

      {/* Header with trauma-informed navigation */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Title and logo */}
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-semibold text-gray-900">
                {title}
              </h1>
              {preferences.showProgress && (
                <div className="text-sm text-gray-500">
                  Welcome back
                </div>
              )}
            </div>

            {/* Header actions */}
            <div className="flex items-center space-x-2">
              {/* Help button */}
              <TouchOptimizedButton
                variant="secondary"
                onClick={() => setShowHelp(!showHelp)}
                aria-label="Get help"
                aria-expanded={showHelp}
              >
                <HelpCircle className="w-5 h-5" />
                <span className="sr-only">Help</span>
              </TouchOptimizedButton>

              {/* Settings button */}
              <TouchOptimizedButton
                variant="secondary"
                onClick={() => setShowSettings(!showSettings)}
                aria-label="Open accessibility settings"
                aria-expanded={showSettings}
              >
                <Settings className="w-5 h-5" />
                <span className="sr-only">Settings</span>
              </TouchOptimizedButton>
            </div>
          </div>
        </div>
      </header>

      {/* Settings panel overlay */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setShowSettings(false)}
              aria-hidden="true"
            />

            {/* Settings panel */}
            <div className="inline-block w-full max-w-5xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  Accessibility Settings
                </h2>
                <TouchOptimizedButton
                  variant="secondary"
                  onClick={() => setShowSettings(false)}
                  aria-label="Close settings"
                >
                  <X className="w-5 h-5" />
                </TouchOptimizedButton>
              </div>
              
              <AccessibilitySettingsPanel />
            </div>
          </div>
        </div>
      )}

      {/* Help panel */}
      {showHelp && (
        <div className="fixed top-20 right-4 z-40 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">Need Help?</h3>
            <TouchOptimizedButton
              variant="secondary"
              onClick={() => setShowHelp(false)}
              aria-label="Close help"
            >
              <X className="w-4 h-4" />
            </TouchOptimizedButton>
          </div>
          
          <div className="space-y-3 text-sm text-gray-600">
            <p>This interface is designed to be gentle and supportive.</p>
            <ul className="space-y-2">
              <li>• Your data is automatically saved as you go</li>
              <li>• Use the settings button to customize your experience</li>
              <li>• Take breaks whenever you need them</li>
              <li>• You're in control of what information you share</li>
            </ul>
            
            {preferences.gentleLanguage && (
              <div className="mt-3 p-3 bg-blue-50 rounded-md">
                <p className="text-blue-800 text-sm">
                  Remember: You're doing great by taking care of your health. 
                  Go at your own pace.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main content area */}
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Comfort prompt */}
        {showComfortPrompts && preferences.showComfortPrompts && (
          <div className="mb-6">
            <ComfortPrompt />
          </div>
        )}

        {/* Memory aids */}
        {showMemoryAids && preferences.showMemoryAids && (
          <div className="mb-6">
            <MemoryAid
              text="Tracking Your Pain: Record how you're feeling today. This information helps you and your healthcare team understand patterns in your symptoms."
              type="tip"
            />
          </div>
        )}

        {/* Progressive disclosure wrapper for main content */}
        {preferences.simplifiedMode ? (
          <ProgressiveDisclosure
            title="Your Pain Information"
            level="essential"
            memoryAid="Record and track your pain levels, symptoms, and treatments"
            defaultOpen={true}
          >
            <div className="bg-white rounded-lg shadow-sm p-6">
              {children}
            </div>
          </ProgressiveDisclosure>
        ) : (
          <div className="bg-white rounded-lg shadow-sm">
            {children}
          </div>
        )}
      </main>

      {/* Footer with supportive messaging */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {preferences.gentleLanguage ? (
                "Your health journey matters. Take it one step at a time."
              ) : (
                "Pain Tracker - Manage your health information"
              )}
            </div>
            
            {preferences.showComfortPrompts && (
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Heart className="w-4 h-4 text-red-400" />
                <span>Self-care is healthcare</span>
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

// Trauma-informed page wrapper for individual pages
export function TraumaInformedPage({ 
  children, 
  title, 
  description,
  showBackButton = false,
  onBack
}: {
  children: React.ReactNode;
  title: string;
  description?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}) {
  const { preferences } = useTraumaInformed();

  return (
    <div className="trauma-informed-page">
      {/* Page header */}
      <div className="mb-6">
        {showBackButton && onBack && (
          <div className="mb-4">
            <TouchOptimizedButton
              variant="secondary"
              onClick={onBack}
              size="normal"
            >
              ← Back
            </TouchOptimizedButton>
          </div>
        )}
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {title}
        </h1>
        
        {description && (
          <p className="text-gray-600">
            {description}
          </p>
        )}
      </div>

      {/* Page content with progressive disclosure if simplified mode */}
      {preferences.simplifiedMode ? (
        <ProgressiveDisclosure
          title="Page Content"
          level="essential"
          memoryAid={description || "Click to view content"}
          defaultOpen={true}
        >
          {children}
        </ProgressiveDisclosure>
      ) : (
        children
      )}
    </div>
  );
}

// Trauma-informed section wrapper
export function TraumaInformedSection({ 
  children, 
  title, 
  description,
  importance = 'normal',
  canCollapse = true
}: {
  children: React.ReactNode;
  title: string;
  description?: string;
  importance?: 'low' | 'normal' | 'high';
  canCollapse?: boolean;
}) {
  const { preferences } = useTraumaInformed();

  if (preferences.simplifiedMode && canCollapse && importance === 'low') {
    return (
      <ProgressiveDisclosure
        title={title}
        level="advanced"
        memoryAid={description || "Optional information"}
        defaultOpen={false}
      >
        <div className="mb-6">
          {children}
        </div>
      </ProgressiveDisclosure>
    );
  }

  return (
    <section className="trauma-informed-section mb-6">
      <div className="mb-4">
        <h2 className="text-lg font-medium text-gray-900 mb-1">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-gray-600">
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}
