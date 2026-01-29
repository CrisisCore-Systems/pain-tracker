/**
 * Tests for IdentityDashboard Component
 * 
 * Comprehensive tests covering rendering, journey narrative, patterns, insights, and accessibility.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { IdentityDashboard } from './IdentityDashboard';
import { identityLockInService } from '@pain-tracker/services';
import type { PersonalPattern, JourneyInsight } from '@pain-tracker/services';

// Mock the identity lock-in service
vi.mock('@pain-tracker/services', () => ({
  identityLockInService: {
    initializeJourney: vi.fn(),
    generateJourneyNarrative: vi.fn(),
    discoverPatterns: vi.fn(),
    getIdentity: vi.fn(),
    getIdentityInsights: vi.fn(),
    getIdentityLanguage: vi.fn(),
  },
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Heart: () => <div data-testid="heart-icon">Heart</div>,
  Sparkles: () => <div data-testid="sparkles-icon">Sparkles</div>,
  TrendingUp: () => <div data-testid="trending-up-icon">TrendingUp</div>,
  Award: () => <div data-testid="award-icon">Award</div>,
  Calendar: () => <div data-testid="calendar-icon">Calendar</div>,
}));

describe('IdentityDashboard', () => {
  const mockEntries = [
    { id: '1', timestamp: '2024-01-01T10:00:00Z', painLevel: 5 },
    { id: '2', timestamp: '2024-01-02T10:00:00Z', painLevel: 6 },
    { id: '3', timestamp: '2024-01-03T10:00:00Z', painLevel: 4 },
  ];

  const mockPatterns: PersonalPattern[] = [
    {
      id: 'pattern-1',
      type: 'resilience',
      title: 'Morning Strength',
      description: 'You manage pain better in mornings',
      discoveredDate: '2024-01-03T00:00:00Z',
      significance: 'high',
      personalMeaning: 'This shows your resilience and adaptability',
    },
    {
      id: 'pattern-2',
      type: 'success',
      title: 'Consistent Tracking',
      description: 'You track your pain regularly',
      discoveredDate: '2024-01-02T00:00:00Z',
      significance: 'medium',
      personalMeaning: 'Your commitment to self-care is evident',
    },
  ];

  const mockInsights: JourneyInsight[] = [
    {
      id: 'insight-1',
      category: 'awareness',
      insight: 'You are becoming more aware of your pain patterns',
      context: 'Based on your consistent tracking',
      emotionalTone: 'validating',
    },
    {
      id: 'insight-2',
      category: 'growth',
      insight: 'Your self-understanding is growing',
      context: 'Through regular reflection',
      emotionalTone: 'encouraging',
    },
  ];

  const mockIdentityLanguage = {
    title: 'Your Healing Journey',
    subtitle: 'Every step matters',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mocks
    vi.mocked(identityLockInService.generateJourneyNarrative).mockReturnValue(
      'You started tracking 30 days ago. In 15 days of tracking, you\'re discovering important patterns about yourself.'
    );
    vi.mocked(identityLockInService.discoverPatterns).mockReturnValue(mockPatterns);
    vi.mocked(identityLockInService.getIdentity).mockReturnValue({
      journeyStartDate: '2024-01-01T00:00:00Z',
      totalDaysTracked: 15,
      uniqueInsights: [],
      personalPatterns: mockPatterns,
      identityMilestones: [],
      journeyNarrative: '',
      strengthsIdentified: [],
      selfDefinedGoals: [],
    });
    vi.mocked(identityLockInService.getIdentityInsights).mockReturnValue(mockInsights);
    vi.mocked(identityLockInService.getIdentityLanguage).mockReturnValue(mockIdentityLanguage);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render journey narrative section', () => {
      render(<IdentityDashboard entries={mockEntries} />);
      
      expect(screen.getByText(/your healing journey/i)).toBeInTheDocument();
      expect(screen.getByText(/you started tracking 30 days ago/i)).toBeInTheDocument();
    });

    it('should display identity language title', () => {
      render(<IdentityDashboard entries={mockEntries} />);
      
      expect(screen.getByText('Your Healing Journey')).toBeInTheDocument();
    });

    it('should display identity language subtitle', () => {
      render(<IdentityDashboard entries={mockEntries} />);
      
      expect(screen.getByText('Every step matters')).toBeInTheDocument();
    });

    it('should display discovered patterns section when patterns exist', () => {
      render(<IdentityDashboard entries={mockEntries} />);
      
      expect(screen.getByText('Your Unique Patterns')).toBeInTheDocument();
      expect(screen.getByText('Morning Strength')).toBeInTheDocument();
      expect(screen.getByText('Consistent Tracking')).toBeInTheDocument();
    });

    it('should not display patterns section when no patterns exist', () => {
      vi.mocked(identityLockInService.discoverPatterns).mockReturnValue([]);
      vi.mocked(identityLockInService.getIdentity).mockReturnValue({
        journeyStartDate: '2024-01-01T00:00:00Z',
        totalDaysTracked: 1,
        uniqueInsights: [],
        personalPatterns: [],
        identityMilestones: [],
        journeyNarrative: '',
        strengthsIdentified: [],
        selfDefinedGoals: [],
      });

      render(<IdentityDashboard entries={mockEntries} />);
      
      expect(screen.queryByText('Your Unique Patterns')).not.toBeInTheDocument();
    });

    it('should display journey insights section when insights exist', () => {
      render(<IdentityDashboard entries={mockEntries} />);
      
      expect(screen.getByText('Journey Insights')).toBeInTheDocument();
      expect(screen.getByText(/you are becoming more aware/i)).toBeInTheDocument();
      expect(screen.getByText(/your self-understanding is growing/i)).toBeInTheDocument();
    });

    it('should not display insights section when no insights exist', () => {
      vi.mocked(identityLockInService.getIdentityInsights).mockReturnValue([]);

      render(<IdentityDashboard entries={mockEntries} />);
      
      expect(screen.queryByText('Journey Insights')).not.toBeInTheDocument();
    });

    it('should render pattern icons correctly', () => {
      render(<IdentityDashboard entries={mockEntries} />);
      
      const heartIcons = screen.getAllByTestId('heart-icon');
      const awardIcons = screen.getAllByTestId('award-icon');
      
      expect(heartIcons.length).toBeGreaterThan(0);
      expect(awardIcons.length).toBeGreaterThan(0);
    });

    it('should display pattern descriptions', () => {
      render(<IdentityDashboard entries={mockEntries} />);
      
      expect(screen.getByText('You manage pain better in mornings')).toBeInTheDocument();
      expect(screen.getByText('You track your pain regularly')).toBeInTheDocument();
    });

    it('should display pattern personal meanings', () => {
      render(<IdentityDashboard entries={mockEntries} />);
      
      expect(screen.getByText('This shows your resilience and adaptability')).toBeInTheDocument();
      expect(screen.getByText('Your commitment to self-care is evident')).toBeInTheDocument();
    });
  });

  describe('Journey Narrative', () => {
    it('should generate personalized narrative for new users', () => {
      vi.mocked(identityLockInService.generateJourneyNarrative).mockReturnValue(
        "You're about to begin your pain tracking journey. Every entry you make is an act of self-care and self-advocacy."
      );

      render(<IdentityDashboard entries={[]} />);
      
      expect(screen.getByText(/about to begin your pain tracking journey/i)).toBeInTheDocument();
    });

    it('should show narrative for users with 7 days of tracking', () => {
      vi.mocked(identityLockInService.generateJourneyNarrative).mockReturnValue(
        'You started tracking 10 days ago. After 7 days, you\'re building a foundation of self-awareness.'
      );

      render(<IdentityDashboard entries={mockEntries} />);
      
      expect(screen.getByText(/building a foundation of self-awareness/i)).toBeInTheDocument();
    });

    it('should show narrative for users with 14+ days of tracking', () => {
      vi.mocked(identityLockInService.generateJourneyNarrative).mockReturnValue(
        'You started tracking 20 days ago. In 14 days of tracking, you\'re discovering important patterns about yourself.'
      );

      render(<IdentityDashboard entries={mockEntries} />);
      
      expect(screen.getByText(/discovering important patterns about yourself/i)).toBeInTheDocument();
    });

    it('should show narrative for users with 30+ days of tracking', () => {
      vi.mocked(identityLockInService.generateJourneyNarrative).mockReturnValue(
        'You started tracking 45 days ago. Over 30 days of tracking, you\'ve built a comprehensive understanding of your pain patterns.'
      );

      render(<IdentityDashboard entries={mockEntries} />);
      
      expect(screen.getByText(/comprehensive understanding of your pain patterns/i)).toBeInTheDocument();
    });

    it('should call generateJourneyNarrative with entries', () => {
      render(<IdentityDashboard entries={mockEntries} />);
      
      expect(identityLockInService.generateJourneyNarrative).toHaveBeenCalledWith(mockEntries);
    });

    it('should update narrative when entries change', () => {
      const { rerender } = render(<IdentityDashboard entries={mockEntries} />);
      
      expect(identityLockInService.generateJourneyNarrative).toHaveBeenCalledTimes(1);

      const newEntries = [...mockEntries, { id: '4', timestamp: '2024-01-04T10:00:00Z', painLevel: 7 }];
      rerender(<IdentityDashboard entries={newEntries} />);
      
      expect(identityLockInService.generateJourneyNarrative).toHaveBeenCalledTimes(2);
      expect(identityLockInService.generateJourneyNarrative).toHaveBeenCalledWith(newEntries);
    });

    it('should display default title when identity language not set', () => {
      vi.mocked(identityLockInService.getIdentityLanguage).mockReturnValue({});

      render(<IdentityDashboard entries={mockEntries} />);
      
      expect(screen.getByText('Your Journey')).toBeInTheDocument();
    });

    it('should not display subtitle when not set', () => {
      vi.mocked(identityLockInService.getIdentityLanguage).mockReturnValue({
        title: 'Your Journey',
      });

      render(<IdentityDashboard entries={mockEntries} />);
      
      expect(screen.queryByText('Every step matters')).not.toBeInTheDocument();
    });
  });

  describe('Pattern Discovery', () => {
    it('should list all discovered patterns', () => {
      render(<IdentityDashboard entries={mockEntries} />);
      
      expect(screen.getByText('Morning Strength')).toBeInTheDocument();
      expect(screen.getByText('Consistent Tracking')).toBeInTheDocument();
    });

    it('should show pattern details including description', () => {
      render(<IdentityDashboard entries={mockEntries} />);
      
      expect(screen.getByText('You manage pain better in mornings')).toBeInTheDocument();
      expect(screen.getByText('You track your pain regularly')).toBeInTheDocument();
    });

    it('should call discoverPatterns with entries', () => {
      render(<IdentityDashboard entries={mockEntries} />);
      
      expect(identityLockInService.discoverPatterns).toHaveBeenCalledWith(mockEntries);
    });

    it('should update patterns when new patterns are discovered', () => {
      const { rerender } = render(<IdentityDashboard entries={mockEntries} />);
      
      const newPatterns: PersonalPattern[] = [
        ...mockPatterns,
        {
          id: 'pattern-3',
          type: 'pain',
          title: 'Evening Flare',
          description: 'Pain increases in evening',
          discoveredDate: '2024-01-04T00:00:00Z',
          significance: 'high',
          personalMeaning: 'Understanding this helps you plan ahead',
        },
      ];

      vi.mocked(identityLockInService.discoverPatterns).mockReturnValue(newPatterns);
      vi.mocked(identityLockInService.getIdentity).mockReturnValue({
        journeyStartDate: '2024-01-01T00:00:00Z',
        totalDaysTracked: 15,
        uniqueInsights: [],
        personalPatterns: newPatterns,
        identityMilestones: [],
        journeyNarrative: '',
        strengthsIdentified: [],
        selfDefinedGoals: [],
      });

      const newEntries = [...mockEntries, { id: '4', timestamp: '2024-01-04T10:00:00Z', painLevel: 7 }];
      rerender(<IdentityDashboard entries={newEntries} />);
      
      expect(screen.getByText('Evening Flare')).toBeInTheDocument();
    });

    it('should display correct icon for resilience pattern', () => {
      const resiliencePatterns: PersonalPattern[] = [
        {
          id: 'pattern-resilience',
          type: 'resilience',
          title: 'Resilience Pattern',
          description: 'Shows resilience',
          discoveredDate: '2024-01-03T00:00:00Z',
          significance: 'high',
          personalMeaning: 'Resilient',
        },
      ];

      vi.mocked(identityLockInService.discoverPatterns).mockReturnValue(resiliencePatterns);
      vi.mocked(identityLockInService.getIdentity).mockReturnValue({
        journeyStartDate: '2024-01-01T00:00:00Z',
        totalDaysTracked: 15,
        uniqueInsights: [],
        personalPatterns: resiliencePatterns,
        identityMilestones: [],
        journeyNarrative: '',
        strengthsIdentified: [],
        selfDefinedGoals: [],
      });

      render(<IdentityDashboard entries={mockEntries} />);
      
      expect(screen.getByTestId('heart-icon')).toBeInTheDocument();
    });

    it('should display personal meaning for each pattern', () => {
      render(<IdentityDashboard entries={mockEntries} />);
      
      expect(screen.getByText('This shows your resilience and adaptability')).toBeInTheDocument();
      expect(screen.getByText('Your commitment to self-care is evident')).toBeInTheDocument();
    });
  });

  describe('Identity Insights', () => {
    it('should display all journey insights', () => {
      render(<IdentityDashboard entries={mockEntries} />);
      
      expect(screen.getByText(/you are becoming more aware/i)).toBeInTheDocument();
      expect(screen.getByText(/your self-understanding is growing/i)).toBeInTheDocument();
    });

    it('should show insight context', () => {
      render(<IdentityDashboard entries={mockEntries} />);
      
      expect(screen.getByText('Based on your consistent tracking')).toBeInTheDocument();
      expect(screen.getByText('Through regular reflection')).toBeInTheDocument();
    });

    it('should call getIdentityInsights with entries', () => {
      render(<IdentityDashboard entries={mockEntries} />);
      
      expect(identityLockInService.getIdentityInsights).toHaveBeenCalledWith(mockEntries);
    });

    it('should handle different insight categories', () => {
      const diverseInsights: JourneyInsight[] = [
        {
          id: 'insight-awareness',
          category: 'awareness',
          insight: 'Awareness insight',
          context: 'Context 1',
          emotionalTone: 'validating',
        },
        {
          id: 'insight-growth',
          category: 'growth',
          insight: 'Growth insight',
          context: 'Context 2',
          emotionalTone: 'encouraging',
        },
        {
          id: 'insight-resilience',
          category: 'resilience',
          insight: 'Resilience insight',
          context: 'Context 3',
          emotionalTone: 'celebrating',
        },
        {
          id: 'insight-discovery',
          category: 'discovery',
          insight: 'Discovery insight',
          context: 'Context 4',
          emotionalTone: 'supportive',
        },
      ];

      vi.mocked(identityLockInService.getIdentityInsights).mockReturnValue(diverseInsights);

      render(<IdentityDashboard entries={mockEntries} />);
      
      expect(screen.getByText('Awareness insight')).toBeInTheDocument();
      expect(screen.getByText('Growth insight')).toBeInTheDocument();
      expect(screen.getByText('Resilience insight')).toBeInTheDocument();
      expect(screen.getByText('Discovery insight')).toBeInTheDocument();
    });

    it('should update insights when entries change', () => {
      const { rerender } = render(<IdentityDashboard entries={mockEntries} />);
      
      expect(identityLockInService.getIdentityInsights).toHaveBeenCalledTimes(1);

      const newEntries = [...mockEntries, { id: '4', timestamp: '2024-01-04T10:00:00Z', painLevel: 7 }];
      rerender(<IdentityDashboard entries={newEntries} />);
      
      expect(identityLockInService.getIdentityInsights).toHaveBeenCalledTimes(2);
    });
  });

  describe('User Interactions', () => {
    it('should initialize journey when component mounts', () => {
      render(<IdentityDashboard entries={mockEntries} />);
      
      expect(identityLockInService.initializeJourney).toHaveBeenCalledWith(mockEntries);
    });

    it('should call all service methods with correct parameters', () => {
      render(<IdentityDashboard entries={mockEntries} />);
      
      expect(identityLockInService.initializeJourney).toHaveBeenCalledWith(mockEntries);
      expect(identityLockInService.generateJourneyNarrative).toHaveBeenCalledWith(mockEntries);
      expect(identityLockInService.discoverPatterns).toHaveBeenCalledWith(mockEntries);
      expect(identityLockInService.getIdentityInsights).toHaveBeenCalledWith(mockEntries);
      expect(identityLockInService.getIdentityLanguage).toHaveBeenCalledWith(mockEntries);
    });

    it('should re-initialize when entries prop changes', () => {
      const { rerender } = render(<IdentityDashboard entries={mockEntries} />);
      
      expect(identityLockInService.initializeJourney).toHaveBeenCalledTimes(1);

      const newEntries = [...mockEntries, { id: '4', timestamp: '2024-01-04T10:00:00Z', painLevel: 7 }];
      rerender(<IdentityDashboard entries={newEntries} />);
      
      expect(identityLockInService.initializeJourney).toHaveBeenCalledTimes(2);
      expect(identityLockInService.initializeJourney).toHaveBeenCalledWith(newEntries);
    });
  });

  describe('Accessibility', () => {
    it('should have semantic structure with proper headings', () => {
      render(<IdentityDashboard entries={mockEntries} />);
      
      // Card titles act as headings
      expect(screen.getByText('Your Healing Journey')).toBeInTheDocument();
      expect(screen.getByText('Your Unique Patterns')).toBeInTheDocument();
      expect(screen.getByText('Journey Insights')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(<IdentityDashboard entries={mockEntries} className="custom-class" />);
      
      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass('custom-class');
    });

    it('should have proper spacing between sections', () => {
      const { container } = render(<IdentityDashboard entries={mockEntries} />);
      
      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass('space-y-4');
    });
  });
});
