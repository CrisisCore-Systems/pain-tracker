import { useState, useEffect } from 'react';
import { PainTrackerIcon } from './BrandedLogo';

interface BrandedLoadingScreenProps {
  message?: string;
  progress?: number;
  showProgress?: boolean;
  className?: string;
}

export function BrandedLoadingScreen({ 
  message = 'Loading Pain Tracker Pro...', 
  progress,
  showProgress = false,
  className = ''
}: BrandedLoadingScreenProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  
  useEffect(() => {
    if (progress !== undefined) {
      const timer = setTimeout(() => {
        setAnimatedProgress(progress);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 ${className}`}>
      <div className="text-center space-y-8">
        {/* Animated Logo */}
        <div className="relative">
          <div className="animate-pulse">
            <PainTrackerIcon size={96} className="mx-auto" />
          </div>
          
          {/* Ripple Effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full border-4 border-blue-200 animate-ping opacity-75"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full border-2 border-green-200 animate-ping opacity-50 animation-delay-150"></div>
          </div>
        </div>

        {/* Brand Name */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Pain Tracker
            <span className="inline-flex items-center ml-2 px-2 py-1 rounded-full text-xs bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold">
              PRO
            </span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 font-medium">AI-Powered Pain Management</p>
        </div>

        {/* Loading Message */}
        <div className="space-y-4">
          <p className="text-slate-700 dark:text-slate-300 font-medium">{message}</p>
          
          {/* Progress Bar */}
          {showProgress && (
            <div className="w-64 mx-auto">
              <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
                <span>Loading...</span>
                <span>{Math.round(animatedProgress)}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${animatedProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Loading Dots Animation */}
          {!showProgress && (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce animation-delay-100"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce animation-delay-200"></div>
            </div>
          )}
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          <div className="text-center space-y-1">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <span>FHIR Compliant</span>
          </div>
          <div className="text-center space-y-1">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
              </svg>
            </div>
            <span>AI Analytics</span>
          </div>
          <div className="text-center space-y-1">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
              </svg>
            </div>
            <span>Offline Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Minimal loading spinner for inline use
export function BrandedSpinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <div className={`${sizeClasses[size]} rounded-full border-2 border-slate-200 dark:border-slate-700 animate-spin`}>
        <div className={`${sizeClasses[size]} rounded-full border-t-2 border-blue-600`}></div>
      </div>
    </div>
  );
}

// Success screen after loading
export function BrandedSuccessScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <div className="text-center space-y-8 max-w-md mx-auto px-4">
        {/* Success Icon */}
        <div className="relative">
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
            </svg>
          </div>
          
          {/* Success Ripple */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full border-4 border-green-300 animate-ping opacity-75"></div>
          </div>
        </div>

        {/* Success Message */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Ready to Go!</h2>
          <p className="text-slate-600 dark:text-slate-400">Pain Tracker Pro is loaded and ready to help you manage your pain with AI-powered insights.</p>
        </div>

        {/* Continue Button */}
        <button
          onClick={onContinue}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-green-700 transition-all duration-300 transform hover:scale-105"
        >
          Start Tracking Pain
        </button>
      </div>
    </div>
  );
}

// CSS for animation delays
const styles = `
.animation-delay-100 {
  animation-delay: 0.1s;
}
.animation-delay-150 {
  animation-delay: 0.15s;
}
.animation-delay-200 {
  animation-delay: 0.2s;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}