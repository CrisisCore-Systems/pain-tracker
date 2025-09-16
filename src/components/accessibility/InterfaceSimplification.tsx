/**
 * Interface Simplification System
 * Automatically simplifies interfaces during crisis states or cognitive overload
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Minimize2, 
  Maximize2, 
  EyeOff, 
  Settings, 
  Brain,
  Shield,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { useCrisisDetection } from './useCrisisDetection';
import { useTraumaInformed } from './TraumaInformedHooks';
import { useCognitiveFog } from './useCognitiveFog';
import { TouchOptimizedButton } from './TraumaInformedUX';

interface SimplificationConfig {
  enabled: boolean;
  autoActivate: boolean;
  level: 'minimal' | 'moderate' | 'aggressive';
  preserveEssential: boolean;
  hideDecorative: boolean;
  increaseTouchTargets: boolean;
  reduceColors: boolean;
  simplifyLanguage: boolean;
  removeAnimations: boolean;
  consolidateActions: boolean;
}

interface InterfaceSimplifierProps {
  children: React.ReactNode;
  triggerLevel?: 'crisis' | 'cognitive-overload' | 'user-request';
  preserveElements?: string[];
  onSimplificationChange?: (isSimplified: boolean) => void;
}

const defaultConfig: SimplificationConfig = {
  enabled: true,
  autoActivate: true,
  level: 'moderate',
  preserveEssential: true,
  hideDecorative: true,
  increaseTouchTargets: true,
  reduceColors: true,
  simplifyLanguage: false,
  removeAnimations: true,
  consolidateActions: true
};

export function InterfaceSimplifier({
  children,
  triggerLevel = 'crisis',
  onSimplificationChange
}: InterfaceSimplifierProps) {
  const { crisisLevel } = useCrisisDetection();
  const { preferences, updatePreferences } = useTraumaInformed();
  const { hasFog, isSevere } = useCognitiveFog();
  const [config, setConfig] = useState<SimplificationConfig>(defaultConfig);
  const [isManuallySimplified, setIsManuallySimplified] = useState(false);
  const [showControls, setShowControls] = useState(false);

  // Determine if simplification should be active
  const shouldSimplify = useCallback(() => {
    if (isManuallySimplified) return true;
    if (!config.enabled || !config.autoActivate) return false;
    
    // Crisis-based simplification
    if (triggerLevel === 'crisis' && (crisisLevel === 'severe' || crisisLevel === 'emergency')) {
      return true;
    }
    
    // Cognitive overload simplification
    if (triggerLevel === 'cognitive-overload' && (hasFog && isSevere)) {
      return true;
    }
    
    // User preference based
    return preferences.simplifiedMode;
  }, [isManuallySimplified, config, triggerLevel, crisisLevel, hasFog, isSevere, preferences.simplifiedMode]);

  const isSimplified = shouldSimplify();

  // Apply simplification effects
  useEffect(() => {
    if (onSimplificationChange) {
      onSimplificationChange(isSimplified);
    }

    if (isSimplified) {
      applySimplificationStyles(config);
    } else {
      removeSimplificationStyles();
    }

    return () => removeSimplificationStyles();
  }, [isSimplified, config, onSimplificationChange]);

  const handleManualToggle = () => {
    setIsManuallySimplified(!isManuallySimplified);
    
    // Update user preferences
    updatePreferences({
      simplifiedMode: !isManuallySimplified,
      showMemoryAids: !isManuallySimplified,
      autoSave: !isManuallySimplified
    });
  };

  const updateConfig = (updates: Partial<SimplificationConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className={`interface-simplifier ${isSimplified ? 'simplified' : ''}`}>
      {/* Simplification Controls */}
      <SimplificationControls
        isSimplified={isSimplified}
        config={config}
        onToggle={handleManualToggle}
        onConfigUpdate={updateConfig}
        showAdvanced={showControls}
        onShowAdvanced={setShowControls}
      />

      {/* Main Content with Conditional Simplification */}
      <div className={`
        interface-content transition-all duration-300
        ${isSimplified ? 'simplified-layout' : ''}
      `}>
        {isSimplified ? (
          <SimplifiedContentWrapper 
            config={config}
          >
            {children}
          </SimplifiedContentWrapper>
        ) : (
          children
        )}
      </div>

      {/* Emergency Simplification Banner */}
      {isSimplified && (crisisLevel === 'severe' || crisisLevel === 'emergency') && (
        <EmergencySimplificationBanner onDisable={() => setIsManuallySimplified(false)} />
      )}
    </div>
  );
}

// Simplification control panel
function SimplificationControls({
  isSimplified,
  config,
  onToggle,
  onConfigUpdate,
  showAdvanced,
  onShowAdvanced
}: {
  isSimplified: boolean;
  config: SimplificationConfig;
  onToggle: () => void;
  onConfigUpdate: (updates: Partial<SimplificationConfig>) => void;
  showAdvanced: boolean;
  onShowAdvanced: (show: boolean) => void;
}) {
  return (
    <div className={`
      simplification-controls fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg border transition-all duration-200
      ${isSimplified ? 'bg-blue-50 border-blue-200' : 'border-gray-200'}
    `}>
      <div className="p-3">
        <div className="flex items-center space-x-3">
          <TouchOptimizedButton
            variant={isSimplified ? "primary" : "secondary"}
            onClick={onToggle}
            className={`
              flex items-center space-x-2 text-sm
              ${isSimplified ? 'bg-blue-600 text-white' : ''}
            `}
          >
            {isSimplified ? (
              <>
                <Minimize2 className="w-4 h-4" />
                <span>Simplified</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4" />
                <span>Simplify</span>
              </>
            )}
          </TouchOptimizedButton>

          <TouchOptimizedButton
            variant="secondary"
            onClick={() => onShowAdvanced(!showAdvanced)}
            className="text-sm"
          >
            <Settings className="w-4 h-4" />
          </TouchOptimizedButton>
        </div>

        {showAdvanced && (
          <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
            <SimplificationSettings
              config={config}
              onUpdate={onConfigUpdate}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Advanced simplification settings
function SimplificationSettings({
  config,
  onUpdate
}: {
  config: SimplificationConfig;
  onUpdate: (updates: Partial<SimplificationConfig>) => void;
}) {
  return (
    <div className="space-y-3 text-sm">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Simplification Level
        </label>
        <select
          value={config.level}
          onChange={(e) => onUpdate({ level: e.target.value as SimplificationConfig['level'] })}
          className="w-full text-xs p-1 border border-gray-300 rounded"
        >
          <option value="minimal">Minimal</option>
          <option value="moderate">Moderate</option>
          <option value="aggressive">Aggressive</option>
        </select>
      </div>

      <div className="space-y-1">
        <SimplificationToggle
          label="Auto-activate"
          enabled={config.autoActivate}
          onChange={(enabled) => onUpdate({ autoActivate: enabled })}
        />
        
        <SimplificationToggle
          label="Hide decorative elements"
          enabled={config.hideDecorative}
          onChange={(enabled) => onUpdate({ hideDecorative: enabled })}
        />
        
        <SimplificationToggle
          label="Increase touch targets"
          enabled={config.increaseTouchTargets}
          onChange={(enabled) => onUpdate({ increaseTouchTargets: enabled })}
        />
        
        <SimplificationToggle
          label="Reduce colors"
          enabled={config.reduceColors}
          onChange={(enabled) => onUpdate({ reduceColors: enabled })}
        />
        
        <SimplificationToggle
          label="Remove animations"
          enabled={config.removeAnimations}
          onChange={(enabled) => onUpdate({ removeAnimations: enabled })}
        />
      </div>
    </div>
  );
}

// Toggle component for settings
function SimplificationToggle({
  label,
  enabled,
  onChange
}: {
  label: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-700">{label}</span>
      <TouchOptimizedButton
        variant="secondary"
        onClick={() => onChange(!enabled)}
        className="p-0 border-0"
      >
        {enabled ? (
          <ToggleRight className="w-4 h-4 text-blue-600" />
        ) : (
          <ToggleLeft className="w-4 h-4 text-gray-400" />
        )}
      </TouchOptimizedButton>
    </div>
  );
}

// Wrapper for simplified content
function SimplifiedContentWrapper({
  children,
  config
}: {
  children: React.ReactNode;
  config: SimplificationConfig;
}) {
  return (
    <div className={`
      simplified-content-wrapper
      ${config.hideDecorative ? 'hide-decorative' : ''}
      ${config.increaseTouchTargets ? 'large-touch-targets' : ''}
      ${config.reduceColors ? 'reduced-colors' : ''}
      ${config.removeAnimations ? 'no-animations' : ''}
    `}>
      {/* Simplification indicator */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">
              Simplified Interface Active
            </h3>
            <p className="text-xs text-blue-600">
              Interface complexity reduced for easier use. Essential functions highlighted.
            </p>
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}

// Emergency simplification banner
function EmergencySimplificationBanner({ onDisable }: { onDisable: () => void }) {
  return (
    <div className="fixed bottom-4 left-4 right-4 bg-red-100 border border-red-300 rounded-lg p-4 z-40">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Shield className="w-6 h-6 text-red-600" />
          <div>
            <h3 className="font-medium text-red-800">Emergency Simplification Active</h3>
            <p className="text-sm text-red-700">
              Interface automatically simplified due to detected crisis state
            </p>
          </div>
        </div>
        
        <TouchOptimizedButton
          variant="secondary"
          onClick={onDisable}
          className="text-red-600"
        >
          <EyeOff className="w-4 h-4 mr-1" />
          Disable
        </TouchOptimizedButton>
      </div>
    </div>
  );
}

// CSS class application functions
function applySimplificationStyles(config: SimplificationConfig) {
  const root = document.documentElement;
  
  if (config.hideDecorative) {
    root.classList.add('hide-decorative-elements');
  }
  
  if (config.increaseTouchTargets) {
    root.classList.add('large-touch-targets');
  }
  
  if (config.reduceColors) {
    root.classList.add('reduced-color-palette');
  }
  
  if (config.removeAnimations) {
    root.classList.add('no-animations');
  }
  
  root.classList.add('interface-simplified');
}

function removeSimplificationStyles() {
  const root = document.documentElement;
  const classesToRemove = [
    'hide-decorative-elements',
    'large-touch-targets',
    'reduced-color-palette',
    'no-animations',
    'interface-simplified'
  ];
  
  classesToRemove.forEach(className => {
    root.classList.remove(className);
  });
}
