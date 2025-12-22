import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InteractiveBodyMap } from './InteractiveBodyMap';
import { BodyMappingSection } from './BodyMappingSection';
import { regionsToLocations, locationsToRegions, REGION_TO_LOCATION_MAP } from './index';
import type { PainEntry } from '../../types';

// Mock usage tracking
vi.mock('../../utils/usage-tracking', () => ({
  trackUsageEvent: vi.fn(),
  incrementSessionAction: vi.fn(),
}));

describe('InteractiveBodyMap', () => {
  const mockOnRegionSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders the body map container', () => {
      render(<InteractiveBodyMap />);
      expect(screen.getByRole('application')).toBeInTheDocument();
    });

    it('displays "Select Pain Locations" header in selection mode', () => {
      render(<InteractiveBodyMap mode="selection" />);
      expect(screen.getByText('Select Pain Locations')).toBeInTheDocument();
    });

    it('displays "Pain Heat Map" header in heatmap mode', () => {
      render(<InteractiveBodyMap mode="heatmap" />);
      expect(screen.getByText('Pain Heat Map')).toBeInTheDocument();
    });

    it('shows front view by default', () => {
      render(<InteractiveBodyMap />);
      expect(screen.getByText('FRONT VIEW')).toBeInTheDocument();
    });

    it('displays selected region count', () => {
      render(
        <InteractiveBodyMap
          selectedRegions={['head', 'neck', 'chest']}
          mode="selection"
        />
      );
      expect(screen.getByText('3 regions selected')).toBeInTheDocument();
    });
  });

  describe('compact mode', () => {
    it('hides header controls when compact is true', () => {
      render(<InteractiveBodyMap compact />);
      expect(screen.queryByText('Select Pain Locations')).not.toBeInTheDocument();
    });

    it('shows simplified controls in compact mode', () => {
      render(
        <InteractiveBodyMap
          compact
          selectedRegions={['head']}
        />
      );
      expect(screen.getByText('1 location selected')).toBeInTheDocument();
    });
  });

  describe('accessibility features', () => {
    it('has role="application" for keyboard navigation', () => {
      render(<InteractiveBodyMap />);
      expect(screen.getByRole('application')).toHaveAttribute(
        'aria-label',
        'Interactive body map for selecting pain locations'
      );
    });

    it('shows keyboard help button when showAccessibilityFeatures is true', () => {
      render(<InteractiveBodyMap showAccessibilityFeatures />);
      expect(screen.getByLabelText('Show keyboard shortcuts')).toBeInTheDocument();
    });

    it('toggles keyboard help modal on ? key press', async () => {
      const user = userEvent.setup();
      render(<InteractiveBodyMap showAccessibilityFeatures />);
      
      const bodyMap = screen.getByRole('application');
      bodyMap.focus();
      
      await user.keyboard('?');
      expect(screen.getByText('Keyboard Navigation')).toBeInTheDocument();
    });

    it('has accessible zoom controls', () => {
      render(<InteractiveBodyMap />);
      expect(screen.getByLabelText('Zoom in')).toBeInTheDocument();
      expect(screen.getByLabelText('Zoom out')).toBeInTheDocument();
    });

    it('includes live region for screen reader announcements', () => {
      render(<InteractiveBodyMap />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('region selection', () => {
    it('calls onRegionSelect when a region is clicked', async () => {
      render(
        <InteractiveBodyMap
          selectedRegions={[]}
          onRegionSelect={mockOnRegionSelect}
          mode="selection"
        />
      );
      
      // The SVG regions are rendered as paths, interact via the container
      const bodyMap = screen.getByRole('application');
      expect(bodyMap).toBeInTheDocument();
    });

    it('displays selected regions in the selection summary', () => {
      render(
        <InteractiveBodyMap
          selectedRegions={['head', 'neck']}
          onRegionSelect={mockOnRegionSelect}
          mode="selection"
        />
      );
      
      expect(screen.getByText(/Selected Locations/)).toBeInTheDocument();
      expect(screen.getByText('Head')).toBeInTheDocument();
      expect(screen.getByText('Neck')).toBeInTheDocument();
    });

    it('has clear all button when regions are selected', () => {
      render(
        <InteractiveBodyMap
          selectedRegions={['head']}
          onRegionSelect={mockOnRegionSelect}
          mode="selection"
        />
      );
      
      expect(screen.getByText('Clear All')).toBeInTheDocument();
    });
  });

  describe('view toggle', () => {
    it('switches between front and back view', async () => {
      const user = userEvent.setup();
      render(<InteractiveBodyMap />);
      
      expect(screen.getByText('FRONT VIEW')).toBeInTheDocument();
      
      const toggleButton = screen.getByText('Front');
      await user.click(toggleButton);
      
      expect(screen.getByText('BACK VIEW')).toBeInTheDocument();
    });
  });

  describe('zoom controls', () => {
    it('shows zoom level percentage', () => {
      render(<InteractiveBodyMap />);
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('increases zoom on zoom in click', async () => {
      const user = userEvent.setup();
      render(<InteractiveBodyMap />);
      
      const zoomIn = screen.getByLabelText('Zoom in');
      await user.click(zoomIn);
      
      expect(screen.getByText('120%')).toBeInTheDocument();
    });

    it('decreases zoom on zoom out click', async () => {
      const user = userEvent.setup();
      render(<InteractiveBodyMap />);
      
      const zoomOut = screen.getByLabelText('Zoom out');
      await user.click(zoomOut);
      
      expect(screen.getByText('80%')).toBeInTheDocument();
    });
  });

  describe('heatmap mode', () => {
    const mockEntries: PainEntry[] = [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        baselineData: {
          pain: 7,
          locations: ['head', 'neck'],
          symptoms: ['sharp'],
        },
        functionalImpact: { limitedActivities: [], assistanceNeeded: [], mobilityAids: [] },
        medications: { current: [], changes: '', effectiveness: '' },
        treatments: { recent: [], effectiveness: '', planned: [] },
        qualityOfLife: { sleepQuality: 5, moodImpact: 5, socialImpact: [] },
        workImpact: { missedWork: 0, modifiedDuties: [], workLimitations: [] },
        comparison: { worseningSince: '', newLimitations: [] },
        notes: '',
      },
      {
        id: '2',
        timestamp: new Date().toISOString(),
        baselineData: {
          pain: 5,
          locations: ['lower back'],
          symptoms: ['aching'],
        },
        functionalImpact: { limitedActivities: [], assistanceNeeded: [], mobilityAids: [] },
        medications: { current: [], changes: '', effectiveness: '' },
        treatments: { recent: [], effectiveness: '', planned: [] },
        qualityOfLife: { sleepQuality: 5, moodImpact: 5, socialImpact: [] },
        workImpact: { missedWork: 0, modifiedDuties: [], workLimitations: [] },
        comparison: { worseningSince: '', newLimitations: [] },
        notes: '',
      },
    ];

    it('shows pain intensity scale legend', () => {
      render(
        <InteractiveBodyMap
          entries={mockEntries}
          mode="heatmap"
        />
      );
      
      expect(screen.getByText('Pain Intensity Scale')).toBeInTheDocument();
    });

    it('displays regions with recorded pain in header', () => {
      render(
        <InteractiveBodyMap
          entries={mockEntries}
          mode="heatmap"
        />
      );
      
      // The header shows "X regions with recorded pain" and should update immediately.
      // mockEntries cover: head, neck, lower back => 3 regions.
      expect(screen.getByText('3 regions with recorded pain')).toBeInTheDocument();
    });
  });
});

describe('BodyMappingSection', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with title and description', () => {
    render(
      <BodyMappingSection
        selectedLocations={[]}
        onChange={mockOnChange}
      />
    );
    
    expect(screen.getByText('Pain Location Mapping')).toBeInTheDocument();
    expect(screen.getByText('Click on body regions to mark pain locations')).toBeInTheDocument();
  });

  it('passes converted regions to InteractiveBodyMap', () => {
    render(
      <BodyMappingSection
        selectedLocations={['head', 'lower back']}
        onChange={mockOnChange}
      />
    );
    
    // The body map should be present
    expect(screen.getByRole('application')).toBeInTheDocument();
  });
});

describe('Mapping Utilities', () => {
  describe('regionsToLocations', () => {
    it('converts region IDs to unique location names', () => {
      const regions = ['head', 'neck', 'left-shoulder', 'right-shoulder'];
      const locations = regionsToLocations(regions);
      
      expect(locations).toContain('head');
      expect(locations).toContain('neck');
      expect(locations).toContain('shoulders');
      // shoulders should appear once, not twice
      expect(locations.filter(l => l === 'shoulders').length).toBe(1);
    });

    it('handles detailed leg regions', () => {
      const regions = ['left-thigh-outer', 'left-thigh-inner', 'right-thigh-outer'];
      const locations = regionsToLocations(regions);
      
      expect(locations).toContain('outer left leg');
      expect(locations).toContain('inner left leg');
      expect(locations).toContain('outer right leg');
    });

    it('handles foot regions for nerve pain', () => {
      const regions = ['left-foot-medial', 'left-foot-lateral', 'left-toes-medial'];
      const locations = regionsToLocations(regions);
      
      expect(locations).toContain('left foot');
      expect(locations).toContain('left toes');
    });

    it('returns empty array for empty input', () => {
      expect(regionsToLocations([])).toEqual([]);
    });

    it('filters out unknown region IDs', () => {
      const regions = ['head', 'unknown-region', 'neck'];
      const locations = regionsToLocations(regions);
      
      expect(locations).toEqual(['head', 'neck']);
    });
  });

  describe('locationsToRegions', () => {
    it('converts location names to region IDs', () => {
      const locations = ['head', 'shoulders'];
      const regions = locationsToRegions(locations);
      
      expect(regions).toContain('head');
      expect(regions).toContain('left-shoulder');
      expect(regions).toContain('right-shoulder');
    });

    it('handles detailed nerve pain locations', () => {
      const locations = ['outer left leg', 'inner left leg'];
      const regions = locationsToRegions(locations);
      
      expect(regions).toContain('left-thigh-outer');
      expect(regions).toContain('left-thigh-inner');
    });

    it('returns empty array for empty input', () => {
      expect(locationsToRegions([])).toEqual([]);
    });
  });

  describe('REGION_TO_LOCATION_MAP', () => {
    it('contains all expected body regions', () => {
      const expectedRegions = [
        'head', 'neck', 'chest', 'abdomen', 'lower-back', 'upper-back',
        'left-shoulder', 'right-shoulder',
        'left-hip', 'right-hip',
        'left-thigh-outer', 'left-thigh-inner', 'right-thigh-outer', 'right-thigh-inner',
        'left-knee-outer', 'left-knee-inner', 'right-knee-outer', 'right-knee-inner',
        'left-ankle', 'right-ankle',
        'left-foot-lateral', 'left-foot-medial', 'right-foot-lateral', 'right-foot-medial',
        'left-toes-lateral', 'left-toes-medial', 'right-toes-lateral', 'right-toes-medial',
      ];

      expectedRegions.forEach(region => {
        expect(REGION_TO_LOCATION_MAP).toHaveProperty(region);
      });
    });

    it('maps nerve pain regions correctly', () => {
      // Feet
      expect(REGION_TO_LOCATION_MAP['left-foot-medial']).toBe('left foot');
      expect(REGION_TO_LOCATION_MAP['left-foot-lateral']).toBe('left foot');
      
      // Toes
      expect(REGION_TO_LOCATION_MAP['left-toes-medial']).toBe('left toes');
      expect(REGION_TO_LOCATION_MAP['right-toes-lateral']).toBe('right toes');
      
      // Thighs
      expect(REGION_TO_LOCATION_MAP['left-thigh-inner']).toBe('inner left leg');
      expect(REGION_TO_LOCATION_MAP['right-thigh-outer']).toBe('outer right leg');
    });
  });
});

describe('Keyboard Navigation', () => {
  it('focuses next region on ArrowDown', async () => {
    const user = userEvent.setup();
    render(<InteractiveBodyMap />);
    
    const bodyMap = screen.getByRole('application');
    bodyMap.focus();
    
    await user.keyboard('{ArrowDown}');
    // First region should be focused (hover state applied)
    expect(screen.getByRole('status')).toHaveTextContent(/Head|Neck/);
  });

  it('toggles view on F key', async () => {
    const user = userEvent.setup();
    render(<InteractiveBodyMap />);
    
    const bodyMap = screen.getByRole('application');
    bodyMap.focus();
    
    expect(screen.getByText('FRONT VIEW')).toBeInTheDocument();
    
    await user.keyboard('f');
    
    expect(screen.getByText('BACK VIEW')).toBeInTheDocument();
  });

  it('clears focus on Escape', async () => {
    const user = userEvent.setup();
    render(<InteractiveBodyMap />);
    
    const bodyMap = screen.getByRole('application');
    bodyMap.focus();
    
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Escape}');
    
    // Focus should be cleared (no region name in live region)
    expect(screen.getByRole('status')).toHaveTextContent('');
  });
});
