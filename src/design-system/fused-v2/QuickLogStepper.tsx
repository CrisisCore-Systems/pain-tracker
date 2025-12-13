import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, Check, Mic, MicOff } from 'lucide-react';
import { cn } from '../utils';
import { useAdaptiveCopy } from '../../contexts/useTone';
import { quickLogCopy } from '../../content/microcopy';
import '../tokens/fused-v2.css';

interface QuickLogStepperProps {
  onComplete: (data: {
    pain: number;
    locations: string[];
    symptoms: string[];
    notes: string;
  }) => void;
  onCancel: () => void;
}

const PAIN_LABELS = [
  'No pain',
  'Very mild',
  'Mild',
  'Uncomfortable',
  'Moderate',
  'Distracting',
  'Distressing',
  'Intense',
  'Very intense',
  'Severe',
  'Unbearable',
];

const LOCATION_TAGS = [
  'Lower back',
  'Upper back',
  'Neck',
  'Shoulder (L)',
  'Shoulder (R)',
  'Hip (L)',
  'Hip (R)',
  'Knee (L)',
  'Knee (R)',
  'Head',
  'Abdomen',
];

const SYMPTOM_TAGS = [
  'Aching',
  'Sharp',
  'Burning',
  'Throbbing',
  'Stabbing',
  'Tingling',
  'Numbness',
  'Stiffness',
  'Weakness',
];

type SpeechRecognitionConstructorLike = new () => SpeechRecognitionLike;

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror?: (() => void) | null;
  onend?: (() => void) | null;
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<{ 0: { transcript: string } }>;
}

interface SpeechRecognitionWindow extends Window {
  webkitSpeechRecognition?: SpeechRecognitionConstructorLike;
  SpeechRecognition?: SpeechRecognitionConstructorLike;
}

function useQuickVoiceNotes() {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const speechWindow = window as unknown as SpeechRecognitionWindow;
    const SpeechRecognitionCtor =
      speechWindow.webkitSpeechRecognition || speechWindow.SpeechRecognition;

    if (SpeechRecognitionCtor) {
      setIsSupported(true);
      const recognition = new SpeechRecognitionCtor();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = event => {
        const combinedTranscript = Array.from(event.results)
          .map(result => result[0])
          .map(r => r.transcript)
          .join('')
          .trim();
        setTranscript(combinedTranscript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }

    return () => {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
    };
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => setTranscript(''), []);

  return { isSupported, isListening, transcript, startListening, stopListening, resetTranscript };
}

export function QuickLogStepper({ onComplete, onCancel }: QuickLogStepperProps) {
  const [step, setStep] = useState(1);
  const [pain, setPain] = useState(5);
  const [locations, setLocations] = useState<string[]>([]);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [voiceMode, setVoiceMode] = useState(false);

  // Adaptive copy based on patient state
  const painLabel = useAdaptiveCopy(quickLogCopy.painSliderLabel);
  const painHint = useAdaptiveCopy(quickLogCopy.painSliderHint);
  const locationsLabel = useAdaptiveCopy(quickLogCopy.locationsLabel);
  const locationsHint = useAdaptiveCopy(quickLogCopy.locationsHint);
  const bodyMapToggle = useAdaptiveCopy(quickLogCopy.bodyMapToggle);
  const notesLabel = useAdaptiveCopy(quickLogCopy.notesLabel);
  const notesPlaceholder = useAdaptiveCopy(quickLogCopy.notesPlaceholder);
  const continueBtn = useAdaptiveCopy(quickLogCopy.continueButton);
  const saveBtn = useAdaptiveCopy(quickLogCopy.saveButton);
  const keyboardHintText = useAdaptiveCopy(quickLogCopy.keyboardHint);

  const {
    isSupported: voiceSupported,
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
  } = useQuickVoiceNotes();

  const handlePainChange = (value: number) => {
    setPain(value);
  };

  const toggleTag = (tag: string, list: string[], setter: (val: string[]) => void) => {
    if (list.includes(tag)) {
      setter(list.filter(t => t !== tag));
    } else {
      setter([...list, tag]);
    }
  };

  const handleNext = useCallback(() => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      onComplete({ pain, locations, symptoms, notes });
    }
  }, [step, pain, locations, symptoms, notes, onComplete]);

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onCancel();
    }
  };

  const getSeverityColor = (level: number) => {
    return `hsl(220, ${20 + level * 5}%, ${95 - level * 6}%)`;
  };

  const connectionStatus =
    typeof navigator !== 'undefined' && navigator.onLine === false
      ? 'Offline: works only if your browser provides local speech.'
      : 'Uses your device speech service. May rely on your browser/OS (not guaranteed offline).';

  useEffect(() => {
    if (!voiceMode && isListening) {
      stopListening();
    }
  }, [isListening, voiceMode, stopListening]);

  const handleInsertTranscript = () => {
    if (!transcript) return;
    setNotes(prev => (prev ? `${prev}\n${transcript}` : transcript));
    resetTranscript();
  };

  // Keyboard shortcuts for navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Enter to continue
      if (e.key === 'Enter' && !e.shiftKey) {
        // Don't trigger if user is typing in textarea
        if (document.activeElement?.tagName === 'TEXTAREA') return;
        e.preventDefault();
        handleNext();
      }
      // Escape to go back
      if (e.key === 'Escape') {
        e.preventDefault();
        if (step > 1) {
          setStep(step - 1);
        } else {
          onCancel();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [step, handleNext, onCancel]);

  return (
    <div className="min-h-screen bg-surface-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-surface-700">
        <button
          onClick={handleBack}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)]',
            'text-small text-ink-300 hover:text-ink-100 hover:bg-surface-800',
            'transition-colors duration-[var(--duration-fast)]'
          )}
        >
          <ChevronLeft className="w-4 h-4" />
          {step === 1 ? 'Cancel' : 'Back'}
        </button>

        <div className="flex items-center gap-2">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-[var(--duration-normal)]',
                s === step && 'w-6 bg-primary-500',
                s < step && 'bg-good-500',
                s > step && 'bg-surface-600'
              )}
            />
          ))}
        </div>

        <div className="text-small text-ink-400 text-mono w-16 text-right">{step}/3</div>
      </div>

      <div className="p-4 pb-0">
        <div className="max-w-2xl mx-auto bg-surface-800 border border-surface-700 rounded-[var(--radius-lg)] p-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="flex gap-3 items-start">
            {voiceSupported ? (
              <Mic className="w-5 h-5 text-primary-400 mt-0.5" aria-hidden="true" />
            ) : (
              <MicOff className="w-5 h-5 text-ink-500 mt-0.5" aria-hidden="true" />
            )}
            <div>
              <div className="text-body-medium text-ink-100">Voice Mode</div>
              <p className="text-small text-ink-400">
                {voiceSupported
                  ? connectionStatus
                  : 'Voice mode uses your device microphone. Your browser does not expose speech recognition, but you can use your keyboard mic for dictation.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-tiny text-ink-500">
              {voiceMode ? 'On' : 'Off'} ·{' '}
              {voiceSupported ? 'Device speech engine' : 'Unavailable in this browser'}
            </span>
            <button
              type="button"
              onClick={() => setVoiceMode(prev => !prev)}
              disabled={!voiceSupported}
              aria-pressed={voiceMode}
              className={cn(
                'px-4 py-2 rounded-[var(--radius-md)] text-small font-medium',
                'border border-surface-600 transition-colors duration-[var(--duration-fast)]',
                voiceMode
                  ? 'bg-primary-500 text-ink-900 border-primary-500'
                  : 'bg-surface-900 text-ink-200 hover:border-primary-500/60',
                !voiceSupported && 'opacity-60 cursor-not-allowed'
              )}
            >
              {voiceMode ? 'Disable voice mode' : 'Enable voice mode'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {step === 1 && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h2 className="text-h2 text-ink-50 mb-2">{painLabel}</h2>
              <p className="text-small text-ink-400">{painHint}</p>
            </div>

            {/* Direct Numeric Entry with Steppers (Accessibility Enhancement) */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <button
                onClick={() => handlePainChange(Math.max(0, pain - 1))}
                aria-label="Decrease pain level"
                className={cn(
                  'flex items-center justify-center',
                  'w-12 h-12 min-w-[48px] min-h-[48px]',
                  'rounded-[var(--radius-md)]',
                  'bg-surface-700 hover:bg-surface-600 border border-surface-600',
                  'text-ink-200 hover:text-ink-100',
                  'transition-colors duration-[var(--duration-fast)]',
                  'text-h2 font-medium',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
                disabled={pain === 0}
              >
                −
              </button>

              <input
                type="number"
                min="0"
                max="10"
                value={pain}
                onChange={e => {
                  const val = Math.max(0, Math.min(10, Number(e.target.value)));
                  handlePainChange(val);
                }}
                aria-label="Pain level numeric entry"
                className={cn(
                  'w-24 h-16 text-center',
                  'text-4xl font-bold text-mono',
                  'bg-surface-800 border-2 border-surface-600',
                  'text-ink-50 rounded-[var(--radius-md)]',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                  '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                )}
              />

              <button
                onClick={() => handlePainChange(Math.min(10, pain + 1))}
                aria-label="Increase pain level"
                className={cn(
                  'flex items-center justify-center',
                  'w-12 h-12 min-w-[48px] min-h-[48px]',
                  'rounded-[var(--radius-md)]',
                  'bg-surface-700 hover:bg-surface-600 border border-surface-600',
                  'text-ink-200 hover:text-ink-100',
                  'transition-colors duration-[var(--duration-fast)]',
                  'text-h2 font-medium',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
                disabled={pain === 10}
              >
                +
              </button>
            </div>

            {/* Large Pain Display */}
            <div
              className={cn(
                'p-8 rounded-[var(--radius-xl)] text-center',
                'transition-all duration-[var(--duration-normal)]'
              )}
              style={{
                backgroundColor: getSeverityColor(pain),
                color: pain > 5 ? 'var(--ink-50)' : 'var(--ink-900)',
              }}
              role="status"
              aria-live="polite"
            >
              <div className="text-display text-mono mb-2 text-6xl font-bold">{pain}</div>
              <div className="text-body-medium">{PAIN_LABELS[pain]}</div>
            </div>

            {/* Slider with Ladder */}
            <div className="space-y-2">
              <label htmlFor="pain-slider" className="sr-only">
                Pain intensity slider. Use arrow keys or swipe to adjust.
              </label>
              <input
                id="pain-slider"
                type="range"
                min="0"
                max="10"
                value={pain}
                onChange={e => handlePainChange(Number(e.target.value))}
                onKeyDown={e => {
                  if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
                    e.preventDefault();
                    handlePainChange(Math.min(10, pain + 1));
                  } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
                    e.preventDefault();
                    handlePainChange(Math.max(0, pain - 1));
                  }
                }}
                aria-label="Pain intensity"
                aria-valuemin={0}
                aria-valuemax={10}
                aria-valuenow={pain}
                aria-valuetext={`${pain} of 10, ${PAIN_LABELS[pain]}`}
                aria-describedby="pain-slider-help"
                className="w-full h-12 cursor-pointer appearance-none bg-transparent
                  [&::-webkit-slider-track]:h-2 [&::-webkit-slider-track]:bg-gray-300 
                  [&::-webkit-slider-track]:rounded-full
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 
                  [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full 
                  [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:shadow-lg
                  [&::-moz-range-track]:h-2 [&::-moz-range-track]:bg-gray-300 
                  [&::-moz-range-track]:rounded-full
                  [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 
                  [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-600 
                  [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              />
              <div id="pain-slider-help" className="sr-only">
                Use arrow keys to adjust pain level, or click the plus and minus buttons above for
                precise control.
              </div>

              {/* Number Ladder */}
              <div className="flex justify-between text-tiny text-ink-400 text-mono px-1">
                {Array.from({ length: 11 }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePainChange(i)}
                    aria-label={`Set pain level to ${i}, ${PAIN_LABELS[i]}`}
                    className={cn(
                      'w-8 h-8 min-w-[32px] min-h-[32px] rounded flex items-center justify-center',
                      'hover:bg-surface-700 transition-colors',
                      'focus:outline-none focus:ring-2 focus:ring-primary-500',
                      i === pain && 'bg-primary-500 text-ink-900 font-bold'
                    )}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h2 className="text-h2 text-ink-50 mb-2">{locationsLabel}</h2>
              <p className="text-small text-ink-400">{locationsHint}</p>
            </div>

            {/* Screen Reader Summary */}
            <div aria-live="polite" aria-atomic="true" className="sr-only">
              {locations.length > 0
                ? `${locations.length} location${locations.length > 1 ? 's' : ''} selected: ${locations.join(', ')}`
                : 'No locations selected'}
            </div>

            {/* Location Tags */}
            <fieldset>
              <legend className="sr-only">Pain locations</legend>
              <div className="flex flex-wrap gap-2">
                {LOCATION_TAGS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag, locations, setLocations)}
                    role="checkbox"
                    aria-checked={locations.includes(tag)}
                    aria-label={`${tag} location`}
                    className={cn(
                      'px-4 py-2 min-w-[48px] min-h-[48px] rounded-[var(--radius-full)] text-small',
                      'border-2 transition-all duration-[var(--duration-fast)]',
                      'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-surface-900',
                      locations.includes(tag)
                        ? 'bg-primary-500 border-primary-500 text-ink-900 font-medium'
                        : 'bg-surface-800 border-surface-600 text-ink-200 hover:border-primary-500/50'
                    )}
                  >
                    {locations.includes(tag) && (
                      <Check className="w-3 h-3 inline mr-1" aria-hidden="true" />
                    )}
                    {tag}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Symptoms */}
            <div className="mt-8">
              <h3 className="text-body-medium text-ink-200 mb-3">What does it feel like?</h3>

              {/* Screen Reader Summary */}
              <div aria-live="polite" aria-atomic="true" className="sr-only">
                {symptoms.length > 0
                  ? `${symptoms.length} symptom${symptoms.length > 1 ? 's' : ''} selected: ${symptoms.join(', ')}`
                  : 'No symptoms selected'}
              </div>

              <fieldset>
                <legend className="sr-only">Pain symptoms</legend>
                <div className="flex flex-wrap gap-2">
                  {SYMPTOM_TAGS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag, symptoms, setSymptoms)}
                      role="checkbox"
                      aria-checked={symptoms.includes(tag)}
                      aria-label={`${tag} symptom`}
                      className={cn(
                        'px-4 py-2 min-w-[48px] min-h-[48px] rounded-[var(--radius-full)] text-small',
                        'border-2 transition-all duration-[var(--duration-fast)]',
                        'focus:outline-none focus:ring-2 focus:ring-warn-500 focus:ring-offset-2 focus:ring-offset-surface-900',
                        symptoms.includes(tag)
                          ? 'bg-warn-500 border-warn-500 text-ink-900 font-medium'
                          : 'bg-surface-800 border-surface-600 text-ink-200 hover:border-warn-500/50'
                      )}
                    >
                      {symptoms.includes(tag) && (
                        <Check className="w-3 h-3 inline mr-1" aria-hidden="true" />
                      )}
                      {tag}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h2 className="text-h2 text-ink-50 mb-2">{notesLabel}</h2>
              <p className="text-small text-ink-400">Context helps identify patterns</p>
            </div>

            <div>
              <label htmlFor="pain-notes" className="block text-body-medium text-ink-200 mb-2">
                Additional Notes
              </label>
              <textarea
                id="pain-notes"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder={notesPlaceholder}
                inputMode="text"
                autoComplete="on"
                autoCorrect="on"
                autoCapitalize="sentences"
                enterKeyHint="done"
                aria-label="Additional notes about pain"
                aria-describedby="notes-hint notes-remaining"
                maxLength={500}
                className={cn(
                  'w-full h-32 p-4 rounded-[var(--radius-xl)]',
                  'bg-surface-800 border border-surface-600',
                  'text-body text-ink-100 placeholder:text-ink-500',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-surface-900 focus:border-transparent',
                  'transition-all duration-[var(--duration-fast)]',
                  'resize-none'
                )}
              />
              <div className="flex justify-between items-center mt-2">
                <span id="notes-hint" className="text-small text-ink-400">
                  {notes.length === 0
                    ? 'No notes yet'
                    : `${notes.length} character${notes.length === 1 ? '' : 's'}`}
                </span>
                <span
                  id="notes-remaining"
                  className="text-small text-ink-500"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {500 - notes.length} remaining
                </span>
              </div>
            </div>

            {voiceMode && voiceSupported && (
              <div className="surface-card border border-surface-700 bg-surface-800/70">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-body-medium text-ink-100">Voice note</div>
                    <p className="text-small text-ink-400">
                      Records with your device speech service. {connectionStatus}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={isListening ? stopListening : startListening}
                    className={cn(
                      'px-4 py-2 rounded-[var(--radius-md)] text-small font-medium',
                      'border border-surface-600 transition-colors duration-[var(--duration-fast)] flex items-center gap-2',
                      isListening
                        ? 'bg-danger-500 text-ink-900 border-danger-500'
                        : 'bg-primary-500 text-ink-900 border-primary-500'
                    )}
                    aria-pressed={isListening}
                    aria-label={isListening ? 'Stop voice note recording' : 'Start voice note recording'}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    {isListening ? 'Stop voice note' : 'Start voice note'}
                  </button>
                </div>

                {transcript && (
                  <div className="mt-3 p-3 rounded-[var(--radius-md)] bg-surface-900 border border-surface-700">
                    <div className="text-small text-ink-300 mb-1">Heard</div>
                    <p className="text-body text-ink-100 mb-3" aria-live="polite">
                      {transcript}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={handleInsertTranscript}
                        className={cn(
                          'px-3 py-2 rounded-[var(--radius-md)] text-small font-medium',
                          'bg-primary-500 text-ink-900 hover:bg-primary-400 transition-colors'
                        )}
                      >
                        Insert into notes
                      </button>
                      <button
                        type="button"
                        onClick={resetTranscript}
                        className={cn(
                          'px-3 py-2 rounded-[var(--radius-md)] text-small font-medium',
                          'bg-surface-900 text-ink-200 border border-surface-600 hover:border-primary-500/60 transition-colors'
                        )}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Summary */}
            <div className="surface-card">
              <div className="text-small text-ink-400 mb-3">Summary</div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-ink-300">Pain level:</span>
                  <span className="text-mono text-ink-50 font-medium">{pain}/10</span>
                  <span className="text-ink-400">({PAIN_LABELS[pain]})</span>
                </div>
                {locations.length > 0 && (
                  <div className="flex items-start gap-2">
                    <span className="text-ink-300">Locations:</span>
                    <span className="text-ink-50">{locations.join(', ')}</span>
                  </div>
                )}
                {symptoms.length > 0 && (
                  <div className="flex items-start gap-2">
                    <span className="text-ink-300">Symptoms:</span>
                    <span className="text-ink-50">{symptoms.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer - Sticky for One-Handed Operation */}
      <div className="sticky bottom-0 left-0 right-0 p-4 border-t border-surface-700 bg-surface-900/95 backdrop-blur-sm z-10">
        <div className="max-w-2xl mx-auto flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className={cn(
                'px-6 py-4 rounded-[var(--radius-xl)]',
                'min-h-[56px] min-w-[56px]',
                'bg-surface-800 hover:bg-surface-700',
                'text-body-medium text-ink-200 font-medium',
                'transition-colors duration-[var(--duration-fast)]',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-surface-900',
                'flex-shrink-0'
              )}
              aria-label="Go back to previous step"
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            className={cn(
              'flex-1 py-4 rounded-[var(--radius-xl)]',
              'min-h-[56px]',
              'bg-primary-500 hover:bg-primary-400',
              'text-body-medium text-ink-900 font-medium',
              'transition-colors duration-[var(--duration-fast)]',
              'shadow-[var(--elevation-2)]',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-surface-900'
            )}
            aria-label={step === 3 ? 'Save pain entry' : `Continue to step ${step + 1}`}
          >
            {step === 3 ? saveBtn : continueBtn}
          </button>
        </div>
        {/* Keyboard Hint */}
        <div className="max-w-2xl mx-auto mt-2 text-center">
          <p className="text-xs text-ink-500">
            {keyboardHintText}
            {step > 1 && (
              <>
                {' '}
                or <kbd className="px-2 py-1 bg-surface-800 rounded text-ink-400">Esc</kbd> to go
                back
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
