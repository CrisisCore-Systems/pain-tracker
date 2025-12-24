import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi } from 'vitest';
import { QuickLogStepper } from '../QuickLogStepper';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

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

type SpeechResultEvent = {
  results: Array<{ 0: { transcript: string } }>;
};

class MockRecognition {
  continuous = false;
  interimResults = false;
  onresult: ((event: SpeechResultEvent) => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;
  onend: (() => void) | null = null;
  start = vi.fn();
  stop = vi.fn();

  constructor() {
    MockRecognition.instance = this;
  }

  static instance: MockRecognition | null = null;
}

describe('QuickLogStepper voice mode', () => {
  let onLineSpy: ReturnType<typeof vi.spyOn>;
  const globalShim = globalThis as unknown as {
    SpeechRecognition?: unknown;
    webkitSpeechRecognition?: unknown;
  };

  beforeEach(() => {
    MockRecognition.instance = null;
    globalShim.SpeechRecognition = MockRecognition;
    globalShim.webkitSpeechRecognition = MockRecognition;
    onLineSpy = vi.spyOn(window.navigator, 'onLine', 'get').mockReturnValue(false);
  });

  afterEach(() => {
    delete globalShim.SpeechRecognition;
    delete globalShim.webkitSpeechRecognition;
    onLineSpy.mockRestore();
  });

  it('shows offline labeling when voice mode is available', () => {
    render(<QuickLogStepper onComplete={() => {}} onCancel={() => {}} />);

    expect(screen.getByText(/^Voice Mode$/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Offline: only works if your browser\/OS provides local speech/i)
    ).toBeInTheDocument();
  });

  it('captures voice dictation and inserts it into the notes field', async () => {
    render(<QuickLogStepper onComplete={() => {}} onCancel={() => {}} />);

    fireEvent.click(screen.getByRole('button', { name: /Enable voice mode/i }));

    fireEvent.click(screen.getByRole('button', { name: /Continue to step 2/i }));
    fireEvent.click(screen.getByRole('button', { name: /Continue to step 3/i }));

    fireEvent.click(screen.getByRole('button', { name: /Start voice dictation/i }));

    await act(async () => {
      MockRecognition.instance?.onresult?.({
        results: [{ 0: { transcript: 'voice dictation captured' } }],
      });
    });

    expect(await screen.findByText(/voice dictation captured/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Insert into notes/i }));

    const notesField = screen.getByLabelText(/Additional Notes/i) as HTMLTextAreaElement;
    expect(notesField.value).toContain('voice dictation captured');
  });
});
