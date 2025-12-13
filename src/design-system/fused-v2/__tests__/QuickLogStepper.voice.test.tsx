import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi } from 'vitest';
import { QuickLogStepper } from '../QuickLogStepper';

vi.mock('../../../contexts/useTone', () => ({
  useAdaptiveCopy: (copy: any) => copy?.base ?? copy?.stable ?? 'Copy',
}));

class MockRecognition {
  continuous = false;
  interimResults = false;
  onresult: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;
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

  beforeEach(() => {
    MockRecognition.instance = null;
    (global as any).SpeechRecognition = MockRecognition;
    (global as any).webkitSpeechRecognition = MockRecognition;
    onLineSpy = vi.spyOn(window.navigator, 'onLine', 'get').mockReturnValue(false);
  });

  afterEach(() => {
    delete (global as any).SpeechRecognition;
    delete (global as any).webkitSpeechRecognition;
    onLineSpy.mockRestore();
  });

  it('shows offline labeling when voice mode is available', () => {
    render(<QuickLogStepper onComplete={() => {}} onCancel={() => {}} />);

    expect(screen.getByText(/^Voice Mode$/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Offline: works only if your browser provides local speech/i)
    ).toBeInTheDocument();
  });

  it('records a voice note and inserts it into the notes field', async () => {
    render(<QuickLogStepper onComplete={() => {}} onCancel={() => {}} />);

    fireEvent.click(screen.getByRole('button', { name: /Enable voice mode/i }));

    fireEvent.click(screen.getByRole('button', { name: /Continue to step 2/i }));
    fireEvent.click(screen.getByRole('button', { name: /Continue to step 3/i }));

    fireEvent.click(screen.getByRole('button', { name: /Start voice note/i }));

    await act(async () => {
      MockRecognition.instance?.onresult?.({
        results: [{ 0: { transcript: 'voice note captured' } }],
      } as any);
    });

    expect(await screen.findByText(/voice note captured/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Insert into notes/i }));

    const notesField = screen.getByLabelText(/Additional Notes/i) as HTMLTextAreaElement;
    expect(notesField.value).toContain('voice note captured');
  });
});
