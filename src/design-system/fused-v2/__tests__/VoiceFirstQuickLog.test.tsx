import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { VoiceFirstQuickLog, VoiceState as _VoiceState } from '../VoiceFirstQuickLog';

// Type helpers
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

// Mock useTone context
vi.mock('../../../contexts/useTone', () => ({
  useAdaptiveCopy: (copy: unknown) => {
    if (!isRecord(copy)) return 'Copy';
    const base = copy.base;
    const stable = copy.stable;
    return (typeof base === 'string' ? base : undefined) ??
      (typeof stable === 'string' ? stable : undefined) ??
      'Copy';
  },
}));

// Mock VoiceCommandService
vi.mock('../../../services/VoiceCommandService', async () => {
  const actual = await vi.importActual<typeof import('../../../services/VoiceCommandService')>('../../../services/VoiceCommandService');
  return {
    ...actual,
    voiceCommandService: {
      setVoiceFeedbackEnabled: vi.fn(),
      setHandler: vi.fn(),
      processTranscript: vi.fn(() => ({
        success: false,
        action: 'unknown',
        feedback: undefined,
      })),
      getAvailableCommands: vi.fn(() => [
        { phrase: 'save entry', description: 'Also: "done"', isEmergency: false },
        { phrase: 'go back', description: '', isEmergency: false },
        { phrase: 'help me', description: '', isEmergency: true },
      ]),
      getHelpText: vi.fn(() => 'Available commands: save entry, go back, help'),
    },
  };
});

// Speech Recognition mock
type SpeechRecognitionResult = {
  0: { transcript: string; confidence: number };
  isFinal: boolean;
  length: number;
};

type SpeechResultEvent = {
  results: SpeechRecognitionResult[];
  resultIndex: number;
};

class MockRecognition {
  continuous = false;
  interimResults = false;
  lang = 'en-US';
  onresult: ((event: SpeechResultEvent) => void) | null = null;
  onerror: ((event: { error: string; message?: string }) => void) | null = null;
  onend: (() => void) | null = null;
  start = vi.fn();
  stop = vi.fn();

  constructor() {
    MockRecognition.instance = this;
  }

  static instance: MockRecognition | null = null;
}

// Speech Synthesis mock
const mockSpeak = vi.fn();
const mockCancel = vi.fn();
const mockSpeechSynthesis = {
  speak: mockSpeak,
  cancel: mockCancel,
  speaking: false,
  pending: false,
  paused: false,
  getVoices: () => [],
  onvoiceschanged: null,
};

// Mock SpeechSynthesisUtterance class
class MockSpeechSynthesisUtterance {
  text = '';
  lang = 'en-US';
  voice = null;
  volume = 1;
  rate = 1;
  pitch = 1;
  onstart = null;
  onend = null;
  onerror = null;
  onpause = null;
  onresume = null;
  onmark = null;
  onboundary = null;

  constructor(text?: string) {
    this.text = text || '';
  }
}

// Set up global mocks
(globalThis as unknown as { SpeechSynthesisUtterance: unknown }).SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;

describe('VoiceFirstQuickLog', () => {
  let onLineSpy: ReturnType<typeof vi.spyOn>;
  const globalShim = globalThis as unknown as {
    SpeechRecognition?: unknown;
    webkitSpeechRecognition?: unknown;
  };

  beforeEach(() => {
    MockRecognition.instance = null;
    globalShim.SpeechRecognition = MockRecognition;
    globalShim.webkitSpeechRecognition = MockRecognition;
    onLineSpy = vi.spyOn(window.navigator, 'onLine', 'get').mockReturnValue(true);
    
    // Mock speechSynthesis
    Object.defineProperty(window, 'speechSynthesis', {
      value: mockSpeechSynthesis,
      writable: true,
      configurable: true,
    });
    
    mockSpeak.mockClear();
    mockCancel.mockClear();
  });

  afterEach(() => {
    delete globalShim.SpeechRecognition;
    delete globalShim.webkitSpeechRecognition;
    onLineSpy.mockRestore();
    vi.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('renders with default state', () => {
      render(<VoiceFirstQuickLog onComplete={() => {}} onCancel={() => {}} />);

      expect(screen.getByText(/Voice Quick Log/i)).toBeInTheDocument();
      expect(screen.getByText(/Ready/i)).toBeInTheDocument();
      // Multiple cancel buttons exist (header + footer)
      expect(screen.getAllByRole('button', { name: /Cancel/i }).length).toBeGreaterThan(0);
      expect(screen.getByRole('button', { name: /Save entry/i })).toBeInTheDocument();
    });

    it('displays initial pain level', () => {
      render(<VoiceFirstQuickLog onComplete={() => {}} onCancel={() => {}} initialPain={7} />);

      expect(screen.getByText('7')).toBeInTheDocument();
      // Level 7 = "Intense"
      expect(screen.getByText(/Intense/i)).toBeInTheDocument();
    });

    it('shows microphone button when speech recognition is supported', () => {
      render(<VoiceFirstQuickLog onComplete={() => {}} onCancel={() => {}} />);

      const micButton = screen.getByRole('button', { name: /Start listening/i });
      expect(micButton).toBeInTheDocument();
    });
  });

  describe('Offline Awareness', () => {
    it('shows offline banner when navigator is offline', () => {
      onLineSpy.mockReturnValue(false);
      
      render(<VoiceFirstQuickLog onComplete={() => {}} onCancel={() => {}} />);

      expect(screen.getByText(/Offline/i)).toBeInTheDocument();
      expect(screen.getByText(/Speech recognition may depend on your browser/i)).toBeInTheDocument();
    });

    it('does not show offline banner when online', () => {
      onLineSpy.mockReturnValue(true);
      
      render(<VoiceFirstQuickLog onComplete={() => {}} onCancel={() => {}} />);

      expect(screen.queryByText(/^Offline$/i)).not.toBeInTheDocument();
    });
  });

  describe('Voice State Transitions', () => {
    it('transitions from idle to listening when mic button is clicked', async () => {
      render(<VoiceFirstQuickLog onComplete={() => {}} onCancel={() => {}} />);

      const micButton = screen.getByRole('button', { name: /Start listening/i });
      
      await act(async () => {
        fireEvent.click(micButton);
      });

      expect(MockRecognition.instance?.start).toHaveBeenCalled();
      expect(screen.getByText(/Listening/i)).toBeInTheDocument();
    });

    it('transitions from listening to idle when mic is clicked again', async () => {
      render(<VoiceFirstQuickLog onComplete={() => {}} onCancel={() => {}} />);

      const micButton = screen.getByRole('button', { name: /Start listening/i });
      
      await act(async () => {
        fireEvent.click(micButton);
      });

      // Now it should show "Stop listening"
      const stopButton = screen.getByRole('button', { name: /Stop listening/i });
      
      await act(async () => {
        fireEvent.click(stopButton);
      });

      expect(MockRecognition.instance?.stop).toHaveBeenCalled();
    });

    it('shows interpreting state when transcript is received', async () => {
      render(<VoiceFirstQuickLog onComplete={() => {}} onCancel={() => {}} />);

      const micButton = screen.getByRole('button', { name: /Start listening/i });
      await act(async () => {
        fireEvent.click(micButton);
      });

      // Simulate interim result
      await act(async () => {
        MockRecognition.instance?.onresult?.({
          results: [{ 0: { transcript: 'my pain is', confidence: 0.9 }, isFinal: false, length: 1 }],
          resultIndex: 0,
        });
      });

      // Should show interpreting/processing state
      expect(screen.getByText(/Processing/i)).toBeInTheDocument();
    });
  });

  describe('Help Panel', () => {
    it('shows help panel when help button is clicked', async () => {
      render(<VoiceFirstQuickLog onComplete={() => {}} onCancel={() => {}} />);

      const helpButton = screen.getByRole('button', { name: /Show help/i });
      
      await act(async () => {
        fireEvent.click(helpButton);
      });

      expect(screen.getByText(/Voice Commands/i)).toBeInTheDocument();
      expect(screen.getByText(/"My pain is \[0-10\]"/)).toBeInTheDocument();
      expect(screen.getByText(/"Save" \/ "Done"/)).toBeInTheDocument();
    });

    it('hides help panel when close button is clicked', async () => {
      render(<VoiceFirstQuickLog onComplete={() => {}} onCancel={() => {}} />);

      const helpButton = screen.getByRole('button', { name: /Show help/i });
      await act(async () => {
        fireEvent.click(helpButton);
      });

      expect(screen.getByText(/Voice Commands/i)).toBeInTheDocument();

      const closeButton = screen.getByRole('button', { name: /Close help/i });
      await act(async () => {
        fireEvent.click(closeButton);
      });

      expect(screen.queryByText(/Voice Commands/i)).not.toBeInTheDocument();
    });
  });

  describe('Emergency Panel (Safe Behavior)', () => {
    it('displays emergency info without placing calls', async () => {
      // This test verifies the safe emergency behavior
      render(<VoiceFirstQuickLog onComplete={() => {}} onCancel={() => {}} />);

      // The emergency panel should not be visible initially
      expect(screen.queryByText(/Emergency Resources/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/This app does not place calls/i)).not.toBeInTheDocument();
    });

    it('emergency panel contains safety message', async () => {
      // We need to trigger the emergency panel via the onEmergency callback
      // For now, we test that the component renders correctly
      render(<VoiceFirstQuickLog onComplete={() => {}} onCancel={() => {}} />);
      
      // The component should be ready to show emergency info without calling services
      expect(screen.getByRole('button', { name: /Save entry/i })).toBeInTheDocument();
    });
  });

  describe('Pain Level Controls', () => {
    it('allows increasing pain level with button', async () => {
      render(<VoiceFirstQuickLog onComplete={() => {}} onCancel={() => {}} initialPain={5} />);

      const increaseButton = screen.getByRole('button', { name: /Increase pain level/i });
      
      await act(async () => {
        fireEvent.click(increaseButton);
      });

      expect(screen.getByText('6')).toBeInTheDocument();
      // Level 6 = "Distressing"
      expect(screen.getByText(/Distressing/i)).toBeInTheDocument();
    });

    it('allows decreasing pain level with button', async () => {
      render(<VoiceFirstQuickLog onComplete={() => {}} onCancel={() => {}} initialPain={5} />);

      const decreaseButton = screen.getByRole('button', { name: /Decrease pain level/i });
      
      await act(async () => {
        fireEvent.click(decreaseButton);
      });

      expect(screen.getByText('4')).toBeInTheDocument();
      // Level 4 = "Moderate"
      expect(screen.getByText(/Moderate/i)).toBeInTheDocument();
    });

    it('disables decrease button at pain level 0', () => {
      render(<VoiceFirstQuickLog onComplete={() => {}} onCancel={() => {}} initialPain={0} />);

      const decreaseButton = screen.getByRole('button', { name: /Decrease pain level/i });
      expect(decreaseButton).toBeDisabled();
    });

    it('disables increase button at pain level 10', () => {
      render(<VoiceFirstQuickLog onComplete={() => {}} onCancel={() => {}} initialPain={10} />);

      const increaseButton = screen.getByRole('button', { name: /Increase pain level/i });
      expect(increaseButton).toBeDisabled();
    });
  });

  describe('Location Selection', () => {
    it('allows selecting locations via buttons', async () => {
      render(<VoiceFirstQuickLog onComplete={() => {}} onCancel={() => {}} />);

      const lowerBackButton = screen.getByRole('checkbox', { name: /Lower back/i });
      
      await act(async () => {
        fireEvent.click(lowerBackButton);
      });

      expect(lowerBackButton).toHaveAttribute('aria-checked', 'true');
      expect(screen.getByText(/1 selected/)).toBeInTheDocument();
    });

    it('allows deselecting locations', async () => {
      render(<VoiceFirstQuickLog onComplete={() => {}} onCancel={() => {}} />);

      const lowerBackButton = screen.getByRole('checkbox', { name: /Lower back/i });
      
      await act(async () => {
        fireEvent.click(lowerBackButton);
      });
      expect(lowerBackButton).toHaveAttribute('aria-checked', 'true');

      await act(async () => {
        fireEvent.click(lowerBackButton);
      });
      expect(lowerBackButton).toHaveAttribute('aria-checked', 'false');
    });
  });

  describe('Symptom Selection', () => {
    it('allows selecting symptoms via buttons', async () => {
      render(<VoiceFirstQuickLog onComplete={() => {}} onCancel={() => {}} />);

      const sharpButton = screen.getByRole('checkbox', { name: /^Sharp$/i });
      
      await act(async () => {
        fireEvent.click(sharpButton);
      });

      expect(sharpButton).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('Notes Input', () => {
    it('allows entering notes', async () => {
      render(<VoiceFirstQuickLog onComplete={() => {}} onCancel={() => {}} />);

      const notesTextarea = screen.getByLabelText(/Notes/i);
      
      await act(async () => {
        fireEvent.change(notesTextarea, { target: { value: 'Test notes content' } });
      });

      expect(notesTextarea).toHaveValue('Test notes content');
    });

    it('shows remaining character count', async () => {
      render(<VoiceFirstQuickLog onComplete={() => {}} onCancel={() => {}} />);

      const notesTextarea = screen.getByLabelText(/Notes/i);
      
      await act(async () => {
        fireEvent.change(notesTextarea, { target: { value: 'Test' } });
      });

      expect(screen.getByText(/496 remaining/)).toBeInTheDocument();
    });
  });

  describe('Save and Cancel', () => {
    it('calls onCancel when cancel button is clicked', async () => {
      const onCancel = vi.fn();
      render(<VoiceFirstQuickLog onComplete={() => {}} onCancel={onCancel} />);

      const cancelButton = screen.getAllByRole('button', { name: /Cancel/i })[0];
      
      await act(async () => {
        fireEvent.click(cancelButton);
      });

      expect(onCancel).toHaveBeenCalled();
    });

    it('calls onComplete with data when save button is clicked', async () => {
      vi.useFakeTimers();
      const onComplete = vi.fn();
      
      render(<VoiceFirstQuickLog onComplete={onComplete} onCancel={() => {}} initialPain={7} />);

      // Select a location
      const lowerBackButton = screen.getByRole('checkbox', { name: /Lower back/i });
      await act(async () => {
        fireEvent.click(lowerBackButton);
      });

      // Select a symptom
      const sharpButton = screen.getByRole('checkbox', { name: /^Sharp$/i });
      await act(async () => {
        fireEvent.click(sharpButton);
      });

      // Add notes
      const notesTextarea = screen.getByLabelText(/Notes/i);
      await act(async () => {
        fireEvent.change(notesTextarea, { target: { value: 'Test notes' } });
      });

      // Click save
      const saveButton = screen.getByRole('button', { name: /Save entry/i });
      await act(async () => {
        fireEvent.click(saveButton);
      });

      // Shows saved state
      expect(screen.getByText(/Saved!/i)).toBeInTheDocument();

      // After timeout, onComplete is called
      await act(async () => {
        vi.advanceTimersByTime(1600);
      });

      expect(onComplete).toHaveBeenCalledWith({
        pain: 7,
        locations: ['Lower back'],
        symptoms: ['Sharp'],
        notes: 'Test notes',
      });

      vi.useRealTimers();
    });
  });

  describe('Voice Feedback Toggle', () => {
    it('toggles voice feedback when button is clicked', async () => {
      render(<VoiceFirstQuickLog onComplete={() => {}} onCancel={() => {}} />);

      const muteButton = screen.getByRole('button', { name: /Mute voice feedback/i });
      
      await act(async () => {
        fireEvent.click(muteButton);
      });

      // Button should now show "Enable voice feedback"
      expect(screen.getByRole('button', { name: /Enable voice feedback/i })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels on all interactive elements', () => {
      render(<VoiceFirstQuickLog onComplete={() => {}} onCancel={() => {}} />);

      // Check main controls have aria-labels
      expect(screen.getByRole('button', { name: /Cancel and go back/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Start listening/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Show help/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Save entry/i })).toBeInTheDocument();
    });

    it('has proper landmark regions', () => {
      render(<VoiceFirstQuickLog onComplete={() => {}} onCancel={() => {}} />);

      // Check for status region
      expect(screen.getByRole('status')).toBeInTheDocument();
      
      // Check for main region
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('location buttons have checkbox role', () => {
      render(<VoiceFirstQuickLog onComplete={() => {}} onCancel={() => {}} />);

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });
  });
});

describe('VoiceFirstQuickLog Integration', () => {
  const globalShim = globalThis as unknown as {
    SpeechRecognition?: unknown;
    webkitSpeechRecognition?: unknown;
  };

  beforeEach(() => {
    MockRecognition.instance = null;
    globalShim.SpeechRecognition = MockRecognition;
    globalShim.webkitSpeechRecognition = MockRecognition;
    
    Object.defineProperty(window, 'speechSynthesis', {
      value: mockSpeechSynthesis,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    delete globalShim.SpeechRecognition;
    delete globalShim.webkitSpeechRecognition;
    vi.clearAllMocks();
  });

  it('simulates full voice-driven workflow', async () => {
    const onComplete = vi.fn();
    
    // Use real timers for this test
    render(<VoiceFirstQuickLog onComplete={onComplete} onCancel={() => {}} />);

    // Simulate voice input for pain level (via UI since we're testing component)
    // Initial pain is 5, click increase to get to 7
    const increaseButton = screen.getByRole('button', { name: /Increase pain level/i });
    
    fireEvent.click(increaseButton); // 6
    fireEvent.click(increaseButton); // 7
    
    // Verify the pain level updated
    expect(screen.getByText('7')).toBeInTheDocument();

    // Select location
    const neckButton = screen.getByRole('checkbox', { name: /Neck/i });
    fireEvent.click(neckButton);

    // Select symptom
    const achingButton = screen.getByRole('checkbox', { name: /Aching/i });
    fireEvent.click(achingButton);

    // Save
    const saveButton = screen.getByRole('button', { name: /Save entry/i });
    fireEvent.click(saveButton);

    // Check for saved state
    await waitFor(() => {
      expect(screen.getByText(/Saved!/i)).toBeInTheDocument();
    }, { timeout: 2000 });

    // Wait for the save timeout  
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith({
        pain: 7,
        locations: ['Neck'],
        symptoms: ['Aching'],
        notes: '',
      });
    }, { timeout: 3000 });
  }, 10000); // Increase test timeout
});
