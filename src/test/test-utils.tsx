import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from '../design-system/ThemeProvider';
import { ToneProvider } from '../contexts/ToneContext';
import { ToastProvider } from '../components/feedback';
import type { PainEntry } from '../types';

/**
 * Default pain entry structure for testing
 * All required fields are populated with sensible defaults
 */
const defaultPainEntry: PainEntry = {
  id: 1,
  timestamp: new Date().toISOString(),
  baselineData: {
    pain: 5,
    locations: [],
    symptoms: [],
  },
  functionalImpact: {
    limitedActivities: [],
    assistanceNeeded: [],
    mobilityAids: [],
  },
  medications: {
    current: [],
    changes: '',
    effectiveness: '',
  },
  treatments: {
    recent: [],
    effectiveness: '',
    planned: [],
  },
  qualityOfLife: {
    sleepQuality: 5,
    moodImpact: 5,
    socialImpact: [],
  },
  workImpact: {
    missedWork: 0,
    modifiedDuties: [],
    workLimitations: [],
  },
  comparison: {
    worseningSince: '',
    newLimitations: [],
  },
  notes: '',
};

/**
 * Create a mock PainEntry for testing with optional overrides
 * @param overrides - Partial PainEntry to merge with defaults
 * @returns Complete PainEntry object
 */
export function createMockPainEntry(overrides: Partial<PainEntry> = {}): PainEntry {
  return {
    ...defaultPainEntry,
    ...overrides,
    // Deep merge nested objects
    baselineData: {
      ...defaultPainEntry.baselineData,
      ...overrides.baselineData,
    },
    functionalImpact: {
      ...defaultPainEntry.functionalImpact,
      ...overrides.functionalImpact,
    },
    medications: {
      ...defaultPainEntry.medications,
      ...overrides.medications,
    },
    treatments: {
      ...defaultPainEntry.treatments,
      ...overrides.treatments,
    },
    qualityOfLife: {
      ...defaultPainEntry.qualityOfLife,
      ...overrides.qualityOfLife,
    },
    workImpact: {
      ...defaultPainEntry.workImpact,
      ...overrides.workImpact,
    },
    comparison: {
      ...defaultPainEntry.comparison,
      ...overrides.comparison,
    },
  };
}

// Add all required providers for testing
const AllTheProviders = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeProvider defaultMode="light">
      <ToneProvider>
        <ToastProvider>{children}</ToastProvider>
      </ToneProvider>
    </ThemeProvider>
  );
};

// Custom render that wraps with ThemeProvider and ToneProvider by default
// but allows additional wrapper to be passed in
const customRender = (ui: ReactElement, options?: RenderOptions) => {
  const { wrapper: AdditionalWrapper, ...restOptions } = options || {};

  const Wrapper = ({ children }: { children: ReactNode }) => {
    const content = <AllTheProviders>{children}</AllTheProviders>;
    return AdditionalWrapper ? <AdditionalWrapper>{content}</AdditionalWrapper> : content;
  };

  return render(ui, { wrapper: Wrapper, ...restOptions });
};

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render };
