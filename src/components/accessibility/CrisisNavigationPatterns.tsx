/**
 * Crisis-State Navigation Patterns
 * Navigation components that adapt to crisis states with simplified paths and emergency support
 */

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Home, 
  Phone, 
  Shield, 
  AlertTriangle, 
  Navigation, 
  MapPin,
  Compass,
  ChevronRight,
  X,
  Save,
  HelpCircle
} from 'lucide-react';
import { useCrisisDetection } from './useCrisisDetection';
import { useTraumaInformed } from './TraumaInformedHooks';
import { TouchOptimizedButton } from './TraumaInformedUX';

interface CrisisNavigationProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  emergencyContacts?: EmergencyContact[];
  essentialPaths?: NavigationPath[];
  showBreadcrumbs?: boolean;
}

interface NavigationPath {
  id: string;
  path: string;
  title: string;
  isEssential: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
  cognitiveLoad: 'minimal' | 'moderate' | 'high';
}

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isHealthcareProvider: boolean;
}

const defaultEssentialPaths: NavigationPath[] = [
  {
    id: 'home',
    path: '/',
    title: 'Home',
    isEssential: true,
    icon: Home,
    description: 'Return to main page',
    cognitiveLoad: 'minimal'
  },
  {
    id: 'pain-tracker',
    path: '/pain-tracker',
    title: 'Log Pain',
    isEssential: true,
    icon: MapPin,
    description: 'Quick pain tracking',
    cognitiveLoad: 'minimal'
  },
  {
    id: 'emergency',
    path: '/emergency',
    title: 'Emergency',
    isEssential: true,
    icon: AlertTriangle,
    description: 'Emergency resources',
    cognitiveLoad: 'minimal'
  }
];

export function CrisisNavigationBar({
  currentPath,
  onNavigate,
  emergencyContacts = [],
  essentialPaths = defaultEssentialPaths,
  showBreadcrumbs = true
}: CrisisNavigationProps) {
  const { crisisLevel } = useCrisisDetection();
  const { preferences } = useTraumaInformed();
  const [showEmergencyPanel, setShowEmergencyPanel] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-show emergency panel for severe crisis
  useEffect(() => {
    if (crisisLevel === 'severe' || crisisLevel === 'emergency') {
      setShowEmergencyPanel(true);
    }
  }, [crisisLevel]);

  // Auto-save indicator
  useEffect(() => {
    if (preferences.autoSave) {
      const interval = setInterval(() => {
        setLastSaved(new Date());
      }, 30000); // Auto-save every 30 seconds

      return () => clearInterval(interval);
    }
  }, [preferences.autoSave]);

  const isCrisisMode = crisisLevel !== 'none';
  const isHighCrisis = crisisLevel === 'severe' || crisisLevel === 'emergency';

  return (
    <div className={`
      crisis-navigation-bar border-b transition-all duration-200
      ${isCrisisMode ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-200'}
      ${isHighCrisis ? 'bg-red-50 border-red-300' : ''}
    `}>
      {/* Crisis Alert Banner */}
      {isCrisisMode && <CrisisAlertBanner crisisLevel={crisisLevel} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Back button and breadcrumbs */}
          <div className="flex items-center space-x-4">
            <CrisisBackButton currentPath={currentPath} onNavigate={onNavigate} />
            
            {showBreadcrumbs && !isHighCrisis && (
              <CrisisBreadcrumbs currentPath={currentPath} />
            )}
          </div>

          {/* Center: Crisis indicator and save status */}
          <div className="flex items-center space-x-4">
            {preferences.autoSave && lastSaved && (
              <div className="flex items-center text-sm text-gray-600">
                <Save className="w-4 h-4 mr-1 text-green-500" />
                <span>Saved {formatTime(lastSaved)}</span>
              </div>
            )}
            
            {isCrisisMode && (
              <CrisisIndicator level={crisisLevel} />
            )}
          </div>

          {/* Right: Emergency actions */}
          <div className="flex items-center space-x-2">
            <TouchOptimizedButton
              variant="secondary"
              onClick={() => setShowEmergencyPanel(!showEmergencyPanel)}
              className={`
                ${isHighCrisis ? 'bg-red-100 border-red-300 text-red-700' : ''}
              `}
            >
              <Shield className="w-4 h-4 mr-2" />
              Help
            </TouchOptimizedButton>

            <CrisisEscapeButton onNavigate={onNavigate} />
          </div>
        </div>

        {/* Essential Navigation (Crisis Mode) */}
        {isCrisisMode && (
          <div className="pb-4">
            <EssentialNavigationLinks
              paths={essentialPaths}
              currentPath={currentPath}
              onNavigate={onNavigate}
              crisisLevel={crisisLevel}
            />
          </div>
        )}
      </div>

      {/* Emergency Panel */}
      {showEmergencyPanel && (
        <EmergencyNavigationPanel
          contacts={emergencyContacts}
          onClose={() => setShowEmergencyPanel(false)}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
}

// Crisis alert banner
function CrisisAlertBanner({ crisisLevel }: { crisisLevel: string }) {
  if (crisisLevel === 'none') return null;

  const getMessage = () => {
    switch (crisisLevel) {
      case 'mild':
        return 'We notice you might need some support. Take your time.';
      case 'moderate':
        return 'Support mode activated. Interface simplified for easier use.';
      case 'severe':
        return 'Crisis support available. Essential functions highlighted.';
      case 'emergency':
        return 'Emergency mode active. Help resources readily available.';
      default:
        return '';
    }
  };

  const getBgColor = () => {
    switch (crisisLevel) {
      case 'mild':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'moderate':
        return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'severe':
      case 'emergency':
        return 'bg-red-100 border-red-300 text-red-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  return (
    <div className={`px-4 py-2 text-sm text-center border-b ${getBgColor()}`}>
      <div className="flex items-center justify-center space-x-2">
        <AlertTriangle className="w-4 h-4" />
        <span>{getMessage()}</span>
      </div>
    </div>
  );
}

// Smart back button that provides context
function CrisisBackButton({
  currentPath,
  onNavigate
}: {
  currentPath: string;
  onNavigate: (path: string) => void;
}) {
  const getBackPath = () => {
    const pathSegments = currentPath.split('/').filter(Boolean);
    if (pathSegments.length <= 1) return '/';
    
    pathSegments.pop();
    return '/' + pathSegments.join('/');
  };

  const getBackLabel = () => {
    const backPath = getBackPath();
    if (backPath === '/') return 'Home';
    
    const pathSegments = backPath.split('/').filter(Boolean);
    return pathSegments[pathSegments.length - 1] || 'Back';
  };

  return (
    <TouchOptimizedButton
      variant="secondary"
      onClick={() => onNavigate(getBackPath())}
      className="flex items-center space-x-2"
    >
      <ArrowLeft className="w-4 h-4" />
      <span className="hidden sm:inline">
        {getBackLabel()}
      </span>
    </TouchOptimizedButton>
  );
}

// Simplified breadcrumbs for crisis state
function CrisisBreadcrumbs({ currentPath }: { currentPath: string }) {
  const pathSegments = currentPath.split('/').filter(Boolean);
  
  if (pathSegments.length <= 1) return null;

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600">
      <Home className="w-4 h-4" />
      {pathSegments.map((segment, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-3 h-3" />
          <span className={index === pathSegments.length - 1 ? 'font-medium text-gray-900' : ''}>
            {segment.replace('-', ' ')}
          </span>
        </React.Fragment>
      ))}
    </nav>
  );
}

// Crisis level indicator
function CrisisIndicator({ level }: { level: string }) {
  const getColor = () => {
    switch (level) {
      case 'mild':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'moderate':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'severe':
      case 'emergency':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className={`
      px-3 py-1 rounded-full text-xs font-medium border
      ${getColor()}
    `}>
      Support Mode: {level}
    </div>
  );
}

// Essential navigation links for crisis mode
function EssentialNavigationLinks({
  paths,
  currentPath,
  onNavigate,
  crisisLevel
}: {
  paths: NavigationPath[];
  currentPath: string;
  onNavigate: (path: string) => void;
  crisisLevel: string;
}) {
  // Filter paths based on crisis level
  const visiblePaths = paths.filter(path => {
    if (crisisLevel === 'emergency' || crisisLevel === 'severe') {
      return path.isEssential && path.cognitiveLoad === 'minimal';
    }
    return path.isEssential;
  });

  return (
    <div className="flex flex-wrap gap-2">
      {visiblePaths.map((path) => {
        const Icon = path.icon || Navigation;
        const isActive = currentPath === path.path;
        
        return (
          <TouchOptimizedButton
            key={path.id}
            variant={isActive ? "primary" : "secondary"}
            onClick={() => onNavigate(path.path)}
            className={`
              flex items-center space-x-2 text-sm
              ${isActive ? 'bg-blue-600 text-white' : ''}
            `}
          >
            <Icon className="w-4 h-4" />
            <span>{path.title}</span>
          </TouchOptimizedButton>
        );
      })}
    </div>
  );
}

// Emergency escape button
function CrisisEscapeButton({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <TouchOptimizedButton
      variant="primary"
      onClick={() => onNavigate('/')}
      className="bg-green-600 hover:bg-green-700 text-white"
      aria-label="Quick escape to home page"
    >
      <Home className="w-4 h-4" />
      <span className="sr-only">Escape to Home</span>
    </TouchOptimizedButton>
  );
}

// Emergency navigation panel
function EmergencyNavigationPanel({
  contacts,
  onClose,
  onNavigate
}: {
  contacts: EmergencyContact[];
  onClose: () => void;
  onNavigate: (path: string) => void;
}) {
  return (
    <div className="bg-red-50 border-t border-red-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-red-800">Emergency Support</h3>
        <TouchOptimizedButton
          variant="secondary"
          onClick={onClose}
          className="text-red-600"
        >
          <X className="w-4 h-4" />
        </TouchOptimizedButton>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Emergency Contacts */}
        {contacts.slice(0, 2).map((contact) => (
          <TouchOptimizedButton
            key={contact.id}
            variant="primary"
            className="bg-red-600 hover:bg-red-700 text-white h-16 flex items-center space-x-3"
            onClick={() => window.open(`tel:${contact.phone}`, '_self')}
          >
            <Phone className="w-5 h-5" />
            <div className="text-left">
              <div className="font-semibold">{contact.name}</div>
              <div className="text-sm opacity-90">{contact.relationship}</div>
            </div>
          </TouchOptimizedButton>
        ))}

        {/* Crisis Resources */}
        <TouchOptimizedButton
          variant="primary"
          className="bg-blue-600 hover:bg-blue-700 text-white h-16 flex items-center space-x-3"
          onClick={() => onNavigate('/crisis-resources')}
        >
          <HelpCircle className="w-5 h-5" />
          <div className="text-left">
            <div className="font-semibold">Crisis Resources</div>
            <div className="text-sm opacity-90">Get immediate help</div>
          </div>
        </TouchOptimizedButton>

        {/* Emergency Services */}
        <TouchOptimizedButton
          variant="primary"
          className="bg-red-600 hover:bg-red-700 text-white h-16 flex items-center space-x-3"
          onClick={() => window.open('tel:911', '_self')}
        >
          <AlertTriangle className="w-5 h-5" />
          <div className="text-left">
            <div className="font-semibold">Emergency: 911</div>
            <div className="text-sm opacity-90">Medical emergency</div>
          </div>
        </TouchOptimizedButton>

        {/* Crisis Hotline */}
        <TouchOptimizedButton
          variant="primary"
          className="bg-green-600 hover:bg-green-700 text-white h-16 flex items-center space-x-3"
          onClick={() => window.open('tel:988', '_self')}
        >
          <Phone className="w-5 h-5" />
          <div className="text-left">
            <div className="font-semibold">Crisis Hotline: 988</div>
            <div className="text-sm opacity-90">Mental health support</div>
          </div>
        </TouchOptimizedButton>
      </div>
    </div>
  );
}

// Simplified compass navigation for severe crisis states
export function CrisisCompassNavigation({
  onNavigate
}: {
  onNavigate: (path: string) => void;
}) {
  const destinations = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/pain-tracker', label: 'Log Pain', icon: MapPin },
    { path: '/emergency', label: 'Emergency', icon: AlertTriangle },
    { path: '/help', label: 'Get Help', icon: HelpCircle }
  ];

  return (
    <div className="crisis-compass-nav bg-white rounded-xl shadow-lg p-6 max-w-sm mx-auto">
      <div className="text-center mb-6">
        <Compass className="w-12 h-12 mx-auto text-blue-600 mb-2" />
        <h2 className="text-xl font-semibold text-gray-800">Where do you need to go?</h2>
        <p className="text-sm text-gray-600">Choose your destination</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {destinations.map((dest) => {
          const Icon = dest.icon;
          return (
            <TouchOptimizedButton
              key={dest.path}
              variant="secondary"
              onClick={() => onNavigate(dest.path)}
              className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-blue-50"
            >
              <Icon className="w-6 h-6 text-blue-600" />
              <span className="text-sm font-medium">{dest.label}</span>
            </TouchOptimizedButton>
          );
        })}
      </div>
    </div>
  );
}

// Utility function to format time
function formatTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  return date.toLocaleDateString();
}
