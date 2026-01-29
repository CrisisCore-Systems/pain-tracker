/**
 * Tests for RitualSetup Component
 * 
 * Comprehensive tests covering multi-step wizard flow, ritual configuration,
 * user interactions, form validation, and accessibility.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RitualSetup } from './RitualSetup';
import { dailyRitualService } from '@pain-tracker/services';
import type { RitualTemplate, TimingSuggestion } from '@pain-tracker/services';

// Mock the daily ritual service
vi.mock('@pain-tracker/services', () => ({
  dailyRitualService: {
    getTimingSuggestions: vi.fn(),
    getRitualTemplates: vi.fn(),
    setupRitual: vi.fn(),
  },
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Clock: () => <div data-testid="clock-icon">Clock</div>,
  Moon: () => <div data-testid="moon-icon">Moon</div>,
  Sun: () => <div data-testid="sun-icon">Sun</div>,
  Zap: () => <div data-testid="zap-icon">Zap</div>,
  Settings: () => <div data-testid="settings-icon">Settings</div>,
}));

// Mock design system components
vi.mock('../../design-system', () => ({
  Card: ({ children, className }: any) => <div data-testid="card" className={className}>{children}</div>,
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <h2 data-testid="card-title">{children}</h2>,
  Button: ({ children, onClick, variant, className }: any) => (
    <button data-testid="button" onClick={onClick} data-variant={variant} className={className}>
      {children}
    </button>
  ),
}));

describe('RitualSetup', () => {
  const mockEntries = [
    { id: '1', timestamp: new Date('2024-01-01T08:00:00').toISOString(), painLevel: 5 },
    { id: '2', timestamp: new Date('2024-01-01T20:00:00').toISOString(), painLevel: 4 },
  ];

  const mockTimingSuggestions: TimingSuggestion[] = [
    { time: '20:00', confidence: 0.85, reason: 'You typically check in around this time', basedOn: 'history' },
    { time: '08:00', confidence: 0.75, reason: 'Morning check-ins have been consistent', basedOn: 'history' },
  ];

  const mockTemplates: RitualTemplate[] = [
    {
      id: 'morning',
      name: 'Morning Check-In',
      type: 'morning',
      description: 'A short morning check-in',
      estimatedDuration: 5,
      steps: [],
    },
    {
      id: 'evening',
      name: 'Evening Reflection',
      type: 'evening',
      description: 'A brief evening reflection',
      estimatedDuration: 5,
      steps: [],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.mocked(dailyRitualService.getTimingSuggestions).mockReturnValue(mockTimingSuggestions);
    vi.mocked(dailyRitualService.getRitualTemplates).mockReturnValue(mockTemplates);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ============================================================
  // Rendering Tests (12 cases)
  // ============================================================

  describe('Rendering', () => {
    it('should render the ritual setup card with title', () => {
      render(<RitualSetup entries={mockEntries} />);
      
      expect(screen.getByTestId('card')).toBeInTheDocument();
      expect(screen.getByTestId('card-title')).toHaveTextContent('Set Up Your Daily Ritual');
    });

    it('should start on type selection step by default', () => {
      render(<RitualSetup entries={mockEntries} />);
      
      expect(screen.getByText('When would you like to check in?')).toBeInTheDocument();
    });

    it('should display all four ritual type options', () => {
      render(<RitualSetup entries={mockEntries} />);
      
      expect(screen.getByText('Morning Check-In')).toBeInTheDocument();
      expect(screen.getByText('Evening Reflection')).toBeInTheDocument();
      expect(screen.getByText('Morning & Evening')).toBeInTheDocument();
      expect(screen.getByText('Custom Times')).toBeInTheDocument();
    });

    it('should display correct icons for each ritual type', () => {
      render(<RitualSetup entries={mockEntries} />);
      
      expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
      expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
      expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
      expect(screen.getByTestId('settings-icon')).toBeInTheDocument();
    });

    it('should display descriptions for each ritual type', () => {
      render(<RitualSetup entries={mockEntries} />);
      
      expect(screen.getByText('Start your day with intention')).toBeInTheDocument();
      expect(screen.getByText('Process your day before bed')).toBeInTheDocument();
      expect(screen.getByText('Full daily practice')).toBeInTheDocument();
      expect(screen.getByText('Set your own schedule')).toBeInTheDocument();
    });

    it('should render time selection step when navigated to', async () => {
      const user = userEvent.setup({ delay: null });
      render(<RitualSetup entries={mockEntries} />);
      
      const continueButtons = screen.getAllByTestId('button');
      const continueButton = continueButtons.find(btn => btn.textContent === 'Continue');
      await user.click(continueButton!);
      
      await waitFor(() => {
        expect(screen.getByText('What time works best?')).toBeInTheDocument();
      });
    });

    it('should display timing suggestions on time selection step', async () => {
      const user = userEvent.setup({ delay: null });
      render(<RitualSetup entries={mockEntries} />);
      
      const continueButtons = screen.getAllByTestId('button');
      await user.click(continueButtons.find(btn => btn.textContent === 'Continue')!);
      
      await waitFor(() => {
        expect(screen.getByText('Based on your tracking history:')).toBeInTheDocument();
        expect(screen.getByText('20:00')).toBeInTheDocument();
        expect(screen.getByText('85% match')).toBeInTheDocument();
      });
    });

    it('should display custom time input', async () => {
      const user = userEvent.setup({ delay: null });
      render(<RitualSetup entries={mockEntries} />);
      
      const continueButtons = screen.getAllByTestId('button');
      await user.click(continueButtons.find(btn => btn.textContent === 'Continue')!);
      
      await waitFor(() => {
        const timeInput = screen.getByDisplayValue('20:00');
        expect(timeInput).toBeInTheDocument();
        expect(timeInput).toHaveAttribute('type', 'time');
      });
    });

    it('should render tone selection step', async () => {
      const user = userEvent.setup({ delay: null });
      render(<RitualSetup entries={mockEntries} />);
      
      // Navigate to time step
      const firstContinue = screen.getAllByTestId('button').find(btn => btn.textContent === 'Continue');
      await user.click(firstContinue!);
      
      // Navigate to tone step
      await waitFor(() => screen.getByText('What time works best?'));
      const secondContinue = screen.getAllByTestId('button').find(btn => btn.textContent === 'Continue');
      await user.click(secondContinue!);
      
      await waitFor(() => {
        expect(screen.getByText('How should we remind you?')).toBeInTheDocument();
      });
    });

    it('should display all four tone options', async () => {
      const user = userEvent.setup({ delay: null });
      render(<RitualSetup entries={mockEntries} />);
      
      // Navigate to tone step
      const buttons = screen.getAllByTestId('button');
      await user.click(buttons.find(btn => btn.textContent === 'Continue')!);
      await waitFor(() => screen.getByText('What time works best?'));
      await user.click(screen.getAllByTestId('button').find(btn => btn.textContent === 'Continue')!);
      
      await waitFor(() => {
        expect(screen.getByText('Gentle & Supportive')).toBeInTheDocument();
        expect(screen.getByText('Encouraging & Uplifting')).toBeInTheDocument();
        expect(screen.getByText('Structured & Clear')).toBeInTheDocument();
        expect(screen.getByText('Minimal')).toBeInTheDocument();
      });
    });

    it('should display completion screen after setup', async () => {
      const user = userEvent.setup({ delay: null });
      render(<RitualSetup entries={mockEntries} />);
      
      // Navigate through all steps
      const buttons1 = screen.getAllByTestId('button');
      await user.click(buttons1.find(btn => btn.textContent === 'Continue')!);
      
      await waitFor(() => screen.getByText('What time works best?'));
      const buttons2 = screen.getAllByTestId('button');
      await user.click(buttons2.find(btn => btn.textContent === 'Continue')!);
      
      await waitFor(() => screen.getByText('How should we remind you?'));
      const buttons3 = screen.getAllByTestId('button');
      await user.click(buttons3.find(btn => btn.textContent === 'Complete Setup')!);
      
      await waitFor(() => {
        expect(screen.getByText("You're all set! 🎉")).toBeInTheDocument();
        expect(screen.getByTestId('zap-icon')).toBeInTheDocument();
      });
    });

    it('should apply custom className to card', () => {
      render(<RitualSetup entries={mockEntries} className="custom-class" />);
      
      expect(screen.getByTestId('card')).toHaveClass('custom-class');
    });
  });

  // ============================================================
  // Template/Type Selection Tests (8 cases)
  // ============================================================

  describe('Template Selection', () => {
    it('should default to evening ritual type', () => {
      render(<RitualSetup entries={mockEntries} />);
      
      const eveningButton = screen.getByText('Evening Reflection').closest('button');
      expect(eveningButton).toHaveClass('border-blue-500');
    });

    it('should select morning ritual when clicked', async () => {
      const user = userEvent.setup({ delay: null });
      render(<RitualSetup entries={mockEntries} />);
      
      const morningButton = screen.getByText('Morning Check-In').closest('button');
      await user.click(morningButton!);
      
      expect(morningButton).toHaveClass('border-blue-500');
    });

    it('should select both rituals when clicked', async () => {
      const user = userEvent.setup({ delay: null });
      render(<RitualSetup entries={mockEntries} />);
      
      const bothButton = screen.getByText('Morning & Evening').closest('button');
      await user.click(bothButton!);
      
      expect(bothButton).toHaveClass('border-blue-500');
    });

    it('should select custom ritual when clicked', async () => {
      const user = userEvent.setup({ delay: null });
      render(<RitualSetup entries={mockEntries} />);
      
      const customButton = screen.getByText('Custom Times').closest('button');
      await user.click(customButton!);
      
      expect(customButton).toHaveClass('border-blue-500');
    });

    it('should update selection styling when different type selected', async () => {
      const user = userEvent.setup({ delay: null });
      render(<RitualSetup entries={mockEntries} />);
      
      const eveningButton = screen.getByText('Evening Reflection').closest('button');
      const morningButton = screen.getByText('Morning Check-In').closest('button');
      
      // Initially evening is selected
      expect(eveningButton).toHaveClass('border-blue-500');
      
      // Click morning
      await user.click(morningButton!);
      
      // Morning should now be selected, evening should not
      expect(morningButton).toHaveClass('border-blue-500');
      expect(eveningButton).not.toHaveClass('border-blue-500');
    });

    it('should call getTimingSuggestions with entries on mount', () => {
      render(<RitualSetup entries={mockEntries} />);
      
      expect(dailyRitualService.getTimingSuggestions).toHaveBeenCalledWith(mockEntries);
    });

    it('should call getRitualTemplates on mount', () => {
      render(<RitualSetup entries={mockEntries} />);
      
      expect(dailyRitualService.getRitualTemplates).toHaveBeenCalled();
    });

    it('should update when entries prop changes', () => {
      const { rerender } = render(<RitualSetup entries={mockEntries} />);
      
      const newEntries = [...mockEntries, { id: '3', timestamp: new Date().toISOString(), painLevel: 6 }];
      rerender(<RitualSetup entries={newEntries} />);
      
      expect(dailyRitualService.getTimingSuggestions).toHaveBeenCalledWith(newEntries);
    });
  });

  // ============================================================
  // Form Validation Tests (10 cases)
  // ============================================================

  describe('Form Validation', () => {
    it('should navigate to time step when continue clicked on type step', async () => {
      const user = userEvent.setup({ delay: null });
      render(<RitualSetup entries={mockEntries} />);
      
      const continueButton = screen.getAllByTestId('button').find(btn => btn.textContent === 'Continue');
      await user.click(continueButton!);
      
      await waitFor(() => {
        expect(screen.getByText('What time works best?')).toBeInTheDocument();
      });
    });

    it('should navigate to tone step when continue clicked on time step', async () => {
      const user = userEvent.setup({ delay: null });
      render(<RitualSetup entries={mockEntries} />);
      
      // Navigate to time step
      await user.click(screen.getAllByTestId('button').find(btn => btn.textContent === 'Continue')!);
      await waitFor(() => screen.getByText('What time works best?'));
      
      // Navigate to tone step
      await user.click(screen.getAllByTestId('button').find(btn => btn.textContent === 'Continue')!);
      
      await waitFor(() => {
        expect(screen.getByText('How should we remind you?')).toBeInTheDocument();
      });
    });

    it('should navigate back to type step when back clicked on time step', async () => {
      const user = userEvent.setup({ delay: null });
      render(<RitualSetup entries={mockEntries} />);
      
      // Navigate to time step
      await user.click(screen.getAllByTestId('button').find(btn => btn.textContent === 'Continue')!);
      await waitFor(() => screen.getByText('What time works best?'));
      
      // Click back
      const backButton = screen.getAllByTestId('button').find(btn => btn.textContent === 'Back');
      await user.click(backButton!);
      
      await waitFor(() => {
        expect(screen.getByText('When would you like to check in?')).toBeInTheDocument();
      });
    });

    it('should navigate back to time step when back clicked on tone step', async () => {
      const user = userEvent.setup({ delay: null });
      render(<RitualSetup entries={mockEntries} />);
      
      // Navigate to tone step
      await user.click(screen.getAllByTestId('button').find(btn => btn.textContent === 'Continue')!);
      await waitFor(() => screen.getByText('What time works best?'));
      await user.click(screen.getAllByTestId('button').find(btn => btn.textContent === 'Continue')!);
      await waitFor(() => screen.getByText('How should we remind you?'));
      
      // Click back
      const backButton = screen.getAllByTestId('button').find(btn => btn.textContent === 'Back');
      await user.click(backButton!);
      
      await waitFor(() => {
        expect(screen.getByText('What time works best?')).toBeInTheDocument();
      });
    });

    it('should update selected time when timing suggestion clicked', async () => {
      const user = userEvent.setup({ delay: null });
      render(<RitualSetup entries={mockEntries} />);
      
      // Navigate to time step
      await user.click(screen.getAllByTestId('button').find(btn => btn.textContent === 'Continue')!);
      await waitFor(() => screen.getByText('What time works best?'));
      
      // Click first suggestion (20:00)
      const suggestionButton = screen.getByText('20:00').closest('button');
      await user.click(suggestionButton!);
      
      expect(suggestionButton).toHaveClass('border-blue-500');
    });

    it('should update selected time when custom time input changed', async () => {
      const user = userEvent.setup({ delay: null });
      render(<RitualSetup entries={mockEntries} />);
      
      // Navigate to time step
      await user.click(screen.getAllByTestId('button').find(btn => btn.textContent === 'Continue')!);
      await waitFor(() => screen.getByText('What time works best?'));
      
      // Change custom time
      const timeInput = screen.getByDisplayValue('20:00');
      await user.clear(timeInput);
      await user.type(timeInput, '09:30');
      
      expect(timeInput).toHaveValue('09:30');
    });

    it('should update selected tone when tone option clicked', async () => {
      const user = userEvent.setup({ delay: null });
      render(<RitualSetup entries={mockEntries} />);
      
      // Navigate to tone step
      await user.click(screen.getAllByTestId('button').find(btn => btn.textContent === 'Continue')!);
      await waitFor(() => screen.getByText('What time works best?'));
      await user.click(screen.getAllByTestId('button').find(btn => btn.textContent === 'Continue')!);
      await waitFor(() => screen.getByText('How should we remind you?'));
      
      // Click encouraging tone
      const encouragingButton = screen.getByText('Encouraging & Uplifting').closest('button');
      await user.click(encouragingButton!);
      
      expect(encouragingButton).toHaveClass('border-blue-500');
    });

    it('should maintain state when navigating back and forth', async () => {
      const user = userEvent.setup({ delay: null });
      render(<RitualSetup entries={mockEntries} />);
      
      // Select morning ritual
      await user.click(screen.getByText('Morning Check-In').closest('button')!);
      
      // Navigate forward
      await user.click(screen.getAllByTestId('button').find(btn => btn.textContent === 'Continue')!);
      await waitFor(() => screen.getByText('What time works best?'));
      
      // Navigate back
      await user.click(screen.getAllByTestId('button').find(btn => btn.textContent === 'Back')!);
      
      // Check morning is still selected
      const morningButton = screen.getByText('Morning Check-In').closest('button');
      expect(morningButton).toHaveClass('border-blue-500');
    });

    it('should show no timing suggestions when array is empty', () => {
      vi.mocked(dailyRitualService.getTimingSuggestions).mockReturnValue([]);
      render(<RitualSetup entries={[]} />);
      
      // Navigate to time step
      const continueButton = screen.getAllByTestId('button').find(btn => btn.textContent === 'Continue');
      continueButton?.click();
      
      // Should not show suggestions section
      expect(screen.queryByText('Based on your tracking history:')).not.toBeInTheDocument();
    });

    it('should display all tone example texts', async () => {
      const user = userEvent.setup({ delay: null });
      render(<RitualSetup entries={mockEntries} />);
      
      // Navigate to tone step
      await user.click(screen.getAllByTestId('button').find(btn => btn.textContent === 'Continue')!);
      await waitFor(() => screen.getByText('What time works best?'));
      await user.click(screen.getAllByTestId('button').find(btn => btn.textContent === 'Continue')!);
      
      await waitFor(() => {
        expect(screen.getByText('"Taking a moment to check in. How are you feeling?"')).toBeInTheDocument();
        expect(screen.getByText('"You\'re doing great! Ready to check in?"')).toBeInTheDocument();
        expect(screen.getByText('"Time for your daily check-in."')).toBeInTheDocument();
        expect(screen.getByText('"Check-in time"')).toBeInTheDocument();
      });
    });
  });

  // ============================================================
  // Submission Tests (6 cases)
  // ============================================================

  describe('Submission', () => {
    it('should call setupRitual with correct config for evening ritual', async () => {
      const user = userEvent.setup({ delay: null });
      render(<RitualSetup entries={mockEntries} />);
      
      // Navigate through steps (evening is default, time is 20:00, tone is gentle)
      await user.click(screen.getAllByTestId('button').find(btn => btn.textContent === 'Continue')!);
      await waitFor(() => screen.getByText('What time works best?'));
      await user.click(screen.getAllByTestId('button').find(btn => btn.textContent === 'Continue')!);
      await waitFor(() => screen.getByText('How should we remind you?'));
      await user.click(screen.getAllByTestId('button').find(btn => btn.textContent === 'Complete Setup')!);
      
      expect(dailyRitualService.setupRitual).toHaveBeenCalledWith({
        ritualEnabled: true,
        ritualType: 'evening',
        morningTime: null,
        eveningTime: '20:00',
        ritualTone: 'gentle',
      });
    });

    it('should call setupRitual with correct config for morning ritual', async () => {
      const user = userEvent.setup({ delay: null });
      render(<RitualSetup entries={mockEntries} />);
      
      // Select morning
      await user.click(screen.getByText('Morning Check-In').closest('button')!);
      
      // Navigate through steps
      await user.click(screen.getAllByTestId('button').find(btn => btn.textContent === 'Continue')!);
      await waitFor(() => screen.getByText('What time works best?'));
      await user.click(screen.getAllByTestId('button').find(btn => btn.textContent === 'Continue')!);
      await waitFor(() => screen.getByText('How should we remind you?'));
      await user.click(screen.getAllByTestId('button').find(btn => btn.textContent === 'Complete Setup')!);
      
      expect(dailyRitualService.setupRitual).toHaveBeenCalledWith({
        ritualEnabled: true,
        ritualType: 'morning',
        morningTime: '08:00',
        eveningTime: null,
        ritualTone: 'gentle',
      });
    });

    it('should call setupRitual with correct config for both rituals', async () => {
      const user = userEvent.setup({ delay: null });
      render(<RitualSetup entries={mockEntries} />);
      
      // Select both
      await user.click(screen.getByText('Morning & Evening').closest('button')!);
      
      // Navigate through steps
      await user.click(screen.getAllByTestId('button').find(btn => btn.textContent === 'Continue')!);
      await waitFor(() => screen.getByText('What time works best?'));
      await user.click(screen.getAllByTestId('button').find(btn => btn.textContent === 'Continue')!);
      await waitFor(() => screen.getByText('How should we remind you?'));
      await user.click(screen.getAllByTestId('button').find(btn => btn.textContent === 'Complete Setup')!);
      
      expect(dailyRitualService.setupRitual).toHaveBeenCalledWith({
        ritualEnabled: true,
        ritualType: 'both',
        morningTime: '08:00',
        eveningTime: '20:00',
        ritualTone: 'gentle',
      });
    });

    it('should show completion screen after setup', async () => {
      const user = userEvent.setup({ delay: null });
      render(<RitualSetup entries={mockEntries} />);
      
      // Complete setup
      await user.click(screen.getAllByTestId('button').find(btn => btn.textContent === 'Continue')!);
      await waitFor(() => screen.getByText('What time works best?'));
      await user.click(screen.getAllByTestId('button').find(btn => btn.textContent === 'Continue')!);
      await waitFor(() => screen.getByText('How should we remind you?'));
      await user.click(screen.getAllByTestId('button').find(btn => btn.textContent === 'Complete Setup')!);
      
      await waitFor(() => {
        expect(screen.getByText("You're all set! 🎉")).toBeInTheDocument();
        expect(screen.getByText(/Your daily ritual is ready/)).toBeInTheDocument();
      });
    });

    it('should call onComplete callback after timeout', async () => {
      const onComplete = vi.fn();
      const user = userEvent.setup({ delay: null });
      render(<RitualSetup entries={mockEntries} onComplete={onComplete} />);
      
      // Complete setup
      await user.click(screen.getAllByTestId('button').find(btn => btn.textContent === 'Continue')!);
      await waitFor(() => screen.getByText('What time works best?'));
      await user.click(screen.getAllByTestId('button').find(btn => btn.textContent === 'Continue')!);
      await waitFor(() => screen.getByText('How should we remind you?'));
      await user.click(screen.getAllByTestId('button').find(btn => btn.textContent === 'Complete Setup')!);
      
      // Fast-forward time
      vi.advanceTimersByTime(2000);
      
      await waitFor(() => {
        expect(onComplete).toHaveBeenCalled();
      });
    });

    it('should display selected time in completion message', async () => {
      const user = userEvent.setup({ delay: null });
      render(<RitualSetup entries={mockEntries} />);
      
      // Navigate to time step and set custom time
      await user.click(screen.getAllByTestId('button').find(btn => btn.textContent === 'Continue')!);
      await waitFor(() => screen.getByText('What time works best?'));
      
      const timeInput = screen.getByDisplayValue('20:00');
      await user.clear(timeInput);
      await user.type(timeInput, '21:30');
      
      // Complete setup
      await user.click(screen.getAllByTestId('button').find(btn => btn.textContent === 'Continue')!);
      await waitFor(() => screen.getByText('How should we remind you?'));
      await user.click(screen.getAllByTestId('button').find(btn => btn.textContent === 'Complete Setup')!);
      
      await waitFor(() => {
        expect(screen.getByText(/21:30/)).toBeInTheDocument();
      });
    });
  });

  // ============================================================
  // User Interactions Tests (5 cases)
  // ============================================================

  describe('User Interactions', () => {
    it('should handle multiple type selections', async () => {
      const user = userEvent.setup({ delay: null });
      render(<RitualSetup entries={mockEntries} />);
      
      // Click different options
      await user.click(screen.getByText('Morning Check-In').closest('button')!);
      expect(screen.getByText('Morning Check-In').closest('button')).toHaveClass('border-blue-500');
      
      await user.click(screen.getByText('Morning & Evening').closest('button')!);
      expect(screen.getByText('Morning & Evening').closest('button')).toHaveClass('border-blue-500');
      expect(screen.getByText('Morning Check-In').closest('button')).not.toHaveClass('border-blue-500');
    });

    it('should handle multiple timing suggestion selections', async () => {
      const user = userEvent.setup({ delay: null });
      render(<RitualSetup entries={mockEntries} />);
      
      // Navigate to time step
      await user.click(screen.getAllByTestId('button').find(btn => btn.textContent === 'Continue')!);
      await waitFor(() => screen.getByText('What time works best?'));
      
      // Click different suggestions
      const suggestion1 = screen.getByText('20:00').closest('button');
      const suggestion2 = screen.getByText('08:00').closest('button');
      
      await user.click(suggestion1!);
      expect(suggestion1).toHaveClass('border-blue-500');
      
      await user.click(suggestion2!);
      expect(suggestion2).toHaveClass('border-blue-500');
      expect(suggestion1).not.toHaveClass('border-blue-500');
    });

    it('should handle multiple tone selections', async () => {
      const user = userEvent.setup({ delay: null });
      render(<RitualSetup entries={mockEntries} />);
      
      // Navigate to tone step
      await user.click(screen.getAllByTestId('button').find(btn => btn.textContent === 'Continue')!);
      await waitFor(() => screen.getByText('What time works best?'));
      await user.click(screen.getAllByTestId('button').find(btn => btn.textContent === 'Continue')!);
      await waitFor(() => screen.getByText('How should we remind you?'));
      
      // Click different tones
      await user.click(screen.getByText('Encouraging & Uplifting').closest('button')!);
      expect(screen.getByText('Encouraging & Uplifting').closest('button')).toHaveClass('border-blue-500');
      
      await user.click(screen.getByText('Minimal').closest('button')!);
      expect(screen.getByText('Minimal').closest('button')).toHaveClass('border-blue-500');
      expect(screen.getByText('Encouraging & Uplifting').closest('button')).not.toHaveClass('border-blue-500');
    });

    it('should handle rapid navigation between steps', async () => {
      const user = userEvent.setup({ delay: null });
      render(<RitualSetup entries={mockEntries} />);
      
      // Forward
      await user.click(screen.getAllByTestId('button').find(btn => btn.textContent === 'Continue')!);
      await waitFor(() => screen.getByText('What time works best?'));
      
      // Back
      await user.click(screen.getAllByTestId('button').find(btn => btn.textContent === 'Back')!);
      await waitFor(() => screen.getByText('When would you like to check in?'));
      
      // Forward again
      await user.click(screen.getAllByTestId('button').find(btn => btn.textContent === 'Continue')!);
      await waitFor(() => screen.getByText('What time works best?'));
      
      // Forward to tone
      await user.click(screen.getAllByTestId('button').find(btn => btn.textContent === 'Continue')!);
      await waitFor(() => screen.getByText('How should we remind you?'));
      
      // Back twice
      await user.click(screen.getAllByTestId('button').find(btn => btn.textContent === 'Back')!);
      await waitFor(() => screen.getByText('What time works best?'));
      await user.click(screen.getAllByTestId('button').find(btn => btn.textContent === 'Back')!);
      await waitFor(() => screen.getByText('When would you like to check in?'));
    });

    it('should not call onComplete if not provided', async () => {
      const user = userEvent.setup({ delay: null });
      render(<RitualSetup entries={mockEntries} />);
      
      // Complete setup without onComplete prop
      await user.click(screen.getAllByTestId('button').find(btn => btn.textContent === 'Continue')!);
      await waitFor(() => screen.getByText('What time works best?'));
      await user.click(screen.getAllByTestId('button').find(btn => btn.textContent === 'Continue')!);
      await waitFor(() => screen.getByText('How should we remind you?'));
      await user.click(screen.getAllByTestId('button').find(btn => btn.textContent === 'Complete Setup')!);
      
      vi.advanceTimersByTime(2000);
      
      // Should not error
      expect(screen.getByText("You're all set! 🎉")).toBeInTheDocument();
    });
  });

  // ============================================================
  // Accessibility Tests (4 cases)
  // ============================================================

  describe('Accessibility', () => {
    it('should have proper semantic structure with headings', () => {
      render(<RitualSetup entries={mockEntries} />);
      
      const heading = screen.getByText('When would you like to check in?');
      expect(heading.tagName).toBe('H3');
    });

    it('should have proper form labels for time input', async () => {
      const user = userEvent.setup({ delay: null });
      render(<RitualSetup entries={mockEntries} />);
      
      // Navigate to time step
      await user.click(screen.getAllByTestId('button').find(btn => btn.textContent === 'Continue')!);
      await waitFor(() => screen.getByText('What time works best?'));
      
      expect(screen.getByText('Or choose a custom time:')).toBeInTheDocument();
      const timeInput = screen.getByDisplayValue('20:00');
      expect(timeInput.closest('div')?.querySelector('label')).toBeInTheDocument();
    });

    it('should have proper button roles and accessible text', () => {
      render(<RitualSetup entries={mockEntries} />);
      
      const buttons = screen.getAllByTestId('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      // Continue button should have clear text
      const continueButton = buttons.find(btn => btn.textContent === 'Continue');
      expect(continueButton).toBeInTheDocument();
    });

    it('should apply custom className for styling flexibility', () => {
      const customClass = 'my-custom-ritual-setup';
      render(<RitualSetup entries={mockEntries} className={customClass} />);
      
      expect(screen.getByTestId('card')).toHaveClass(customClass);
    });
  });
});
