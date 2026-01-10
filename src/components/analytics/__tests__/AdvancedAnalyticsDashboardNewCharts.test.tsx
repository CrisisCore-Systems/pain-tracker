import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../../test/test-utils';
import { AdvancedAnalyticsDashboard } from '../AdvancedAnalyticsDashboard';
import { painAnalyticsService } from '../../../services/PainAnalyticsService';
import type { PainEntry } from '../../../types';
import { makePainEntry } from '../../../utils/pain-entry-factory';

describe('AdvancedAnalyticsDashboard with new Integration Charts', () => {
  it('renders MedicationEffectivenessChart and ActivityCorrelationChart when enough data is present', () => {
    // Mock the analytics service response
    const mockCorrelationAnalysis = {
      symptomCorrelations: [],
      activityCorrelations: [
        { activity: 'Walking', painImpact: 6.5, frequency: 5 },
        { activity: 'Sleeping', painImpact: 3.0, frequency: 5 },
      ],
      medicationEffectiveness: [
        { medication: 'Tylenol', effectivenessScore: 4.0, painReduction: 2.5 },
      ],
    };

    const analyzeSpy = vi.spyOn(painAnalyticsService, 'analyzeCorrelations')
      .mockReturnValue(mockCorrelationAnalysis);
    
    // We need "enough data" because the components have a check: if (entries.length < 5) return [];
    // So let's provide 10 dummy entries.
    const entries: PainEntry[] = Array.from({ length: 10 }, (_, i) => 
      makePainEntry({ id: `e${i}`, timestamp: new Date().toISOString() })
    );

    render(<AdvancedAnalyticsDashboard entries={entries} />);

    // Check for titles
    expect(screen.getByText('Medication Effectiveness')).toBeInTheDocument();
    expect(screen.getByText('Activity Impact Correlation')).toBeInTheDocument();

    // Check for some content
    expect(screen.getByText('Comparison of reported effectiveness vs observed pain reduction')).toBeInTheDocument();
    
    // Cleanup
    analyzeSpy.mockRestore();
  });

  it('hides charts when data is insufficient', () => {
    const entries: PainEntry[] = Array.from({ length: 2 }, (_, i) => 
        makePainEntry({ id: `e${i}`, timestamp: new Date().toISOString() })
      );
  
      render(<AdvancedAnalyticsDashboard entries={entries} />);
  
      // Should NOT be in the document
      expect(screen.queryByText('Medication Effectiveness')).not.toBeInTheDocument();
      expect(screen.queryByText('Activity Impact Correlation')).not.toBeInTheDocument();
  });
});
