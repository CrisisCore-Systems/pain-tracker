/**
 * Smart Form Simplifier
 * Automatically adapts forms based on user cognitive state and crisis levels
 */

import React from 'react';
import { Layout } from 'lucide-react';
import { useInterfaceSimplification } from './useInterfaceSimplification';
import { useCognitiveFog } from './useCognitiveFog';

export function SmartFormSimplifier({
  children,
  formComplexity = 'moderate'
}: {
  children: React.ReactNode;
  formComplexity?: 'simple' | 'moderate' | 'complex';
}) {
  const { isSimplified } = useInterfaceSimplification();
  const { hasFog } = useCognitiveFog();
  
  // Determine simplification strategy based on form complexity and user state
  const getSimplificationLevel = (): 'none' | 'minimal' | 'moderate' | 'aggressive' => {
    if (!isSimplified && !hasFog) return 'none';
    
    if (formComplexity === 'complex' && (isSimplified || hasFog)) {
      return 'aggressive';
    }
    
    if (formComplexity === 'moderate' && isSimplified) {
      return 'moderate';
    }
    
    return 'minimal';
  };
  
  const simplificationLevel = getSimplificationLevel();
  
  if (simplificationLevel === 'none') {
    return <>{children}</>;
  }
  
  return (
    <div className={`
      smart-form-simplifier
      ${simplificationLevel === 'aggressive' ? 'form-aggressive-simplification' : ''}
      ${simplificationLevel === 'moderate' ? 'form-moderate-simplification' : ''}
      ${simplificationLevel === 'minimal' ? 'form-minimal-simplification' : ''}
    `}>
      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <Layout className="w-4 h-4 text-green-600" />
          <span className="text-sm text-green-800">
            Form simplified - showing {simplificationLevel === 'aggressive' ? 'essential fields only' : 'most important fields first'}
          </span>
        </div>
      </div>
      
      {children}
    </div>
  );
}
