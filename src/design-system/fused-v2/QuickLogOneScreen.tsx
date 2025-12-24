import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, Check, Mic, MicOff } from 'lucide-react';
import { cn } from '../utils';
import { useAdaptiveCopy } from '../../contexts/useTone';
import { quickLogCopy } from '../../content/microcopy';
import { parseFreeformList } from '../../utils/parseFreeformList';
import type {
  SpeechRecognition,
  SpeechRecognitionConstructor,
  SpeechRecognitionErrorEvent,
  SpeechRecognitionEvent,
} from '../../types/speech';
import '../tokens/fused-v2.css';

type MedicationAdherence = 'as_prescribed' | 'partial' | 'missed' | 'not_applicable';

export type QuickLogOneScreenData = {
  pain: number;
  locations: string[];
  symptoms: string[];
  notes: string;
  sleep?: number;
  activityLevel?: number;
  medicationAdherence?: MedicationAdherence;
  activities?: string[];
  triggers?: string[];
};

interface QuickLogOneScreenProps {
  mode?: 'new' | 'edit';
  initialData?: Partial<QuickLogOneScreenData>;
  onComplete: (data: QuickLogOneScreenData) => void;
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

type SpeechRecognitionWindow = Window & {
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
  SpeechRecognition?: SpeechRecognitionConstructor;
};

function useQuickVoiceNotes() {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const lastTranscriptRef = useRef('');

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
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const resultsArray = Array.from(event.results);
        const finalResults = resultsArray.filter(result => result.isFinal);
        const relevantResults = finalResults.length > 0 ? finalResults : resultsArray;

        const combinedTranscript = relevantResults
          .map(result => result[0])
          .map(r => r?.transcript ?? '')
          .join('')
          .trim();

        if (combinedTranscript === lastTranscriptRef.current) return;
        lastTranscriptRef.current = combinedTranscript;
        setTranscript(combinedTranscript);
      };
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        setIsListening(false);
        const errorMap: Record<string, string> = {
          'not-allowed': 'Microphone permissions were denied.',
          network: 'Speech service not reachable right now.',
          'no-speech': 'No speech detected. Try again when ready.',
        };
        const friendlyMessage =
          (event?.error && errorMap[event.error]) ||
          'Voice input stopped. Please verify microphone permissions.';
        console.warn('Voice recognition error', event);
        setVoiceError(friendlyMessage);
      };
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
      setVoiceError(null);
      lastTranscriptRef.current = '';
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.warn('Voice recognition failed to start', error);
        setVoiceError('Unable to start voice input. Please check microphone permissions.');
        setIsListening(false);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => setTranscript(''), []);
  const clearVoiceError = useCallback(() => setVoiceError(null), []);

  return {
    isSupported,
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    voiceError,
    clearVoiceError,
  };
}

function useAudioNoteRecorder() {
  const [isSupported, setIsSupported] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  useEffect(() => {
    const supported =
      typeof window !== 'undefined' &&
      typeof navigator !== 'undefined' &&
      !!navigator.mediaDevices?.getUserMedia &&
      typeof MediaRecorder !== 'undefined';
    setIsSupported(supported);

    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stop = useCallback(() => {
    if (!recorderRef.current) return;
    try {
      recorderRef.current.stop();
    } catch {
      // ignore
    }
  }, []);

  const start = useCallback(async () => {
    if (!isSupported || isRecording) return;

    try {
      setError(null);
      chunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;

      recorder.ondataavailable = event => {
        if (event.data && event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onerror = () => {
        setError('Audio recording failed. Please try again.');
        setIsRecording(false);
      };

      recorder.onstop = () => {
        setIsRecording(false);
        try {
          stream.getTracks().forEach(t => t.stop());
        } catch {
          // ignore
        }

        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        setAudioBlob(blob);
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(URL.createObjectURL(blob));
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.warn('Audio note recording failed', err);
      setError('Microphone permission is required to record a voice note.');
      setIsRecording(false);
    }
  }, [audioUrl, isRecording, isSupported]);

  const clear = useCallback(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setAudioBlob(null);
    setError(null);
    chunksRef.current = [];
  }, [audioUrl]);

  return {
    isSupported,
    isRecording,
    audioUrl,
    audioBlob,
    error,
    start,
    stop,
    clear,
  };
}

export function QuickLogOneScreen({ initialData, onComplete, onCancel }: QuickLogOneScreenProps) {
  const [pain, setPain] = useState(5);
  const [locations, setLocations] = useState<string[]>([]);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [voiceMode, setVoiceMode] = useState(false);

  const [sleep, setSleep] = useState(5);
  const [sleepSet, setSleepSet] = useState(false);
  const [activityLevel, setActivityLevel] = useState(5);
  const [activityLevelSet, setActivityLevelSet] = useState(false);
  const [medicationAdherence, setMedicationAdherence] = useState<MedicationAdherence | null>(null);
  const [activitiesText, setActivitiesText] = useState('');
  const [dietTriggersText, setDietTriggersText] = useState('');

  useEffect(() => {
    if (!initialData) return;

    if (typeof initialData.pain === 'number') setPain(initialData.pain);
    if (Array.isArray(initialData.locations)) setLocations(initialData.locations);
    if (Array.isArray(initialData.symptoms)) setSymptoms(initialData.symptoms);
    if (typeof initialData.notes === 'string') setNotes(initialData.notes);

    if (typeof initialData.sleep === 'number') {
      setSleep(initialData.sleep);
      setSleepSet(true);
    } else {
      setSleepSet(false);
    }

    if (typeof initialData.activityLevel === 'number') {
      setActivityLevel(initialData.activityLevel);
      setActivityLevelSet(true);
    } else {
      setActivityLevelSet(false);
    }

    if (typeof initialData.medicationAdherence === 'string') {
      setMedicationAdherence(initialData.medicationAdherence);
    } else {
      setMedicationAdherence(null);
    }

    if (Array.isArray(initialData.activities) && initialData.activities.length > 0) {
      setActivitiesText(initialData.activities.join(', '));
    } else {
      setActivitiesText('');
    }

    if (Array.isArray(initialData.triggers) && initialData.triggers.length > 0) {
      setDietTriggersText(initialData.triggers.join(', '));
    } else {
      setDietTriggersText('');
    }
  }, [initialData]);

  // Adaptive copy based on patient state
  const painLabel = useAdaptiveCopy(quickLogCopy.painSliderLabel);
  const painHint = useAdaptiveCopy(quickLogCopy.painSliderHint);
  const locationsLabel = useAdaptiveCopy(quickLogCopy.locationsLabel);
  const locationsHint = useAdaptiveCopy(quickLogCopy.locationsHint);
  const notesLabel = useAdaptiveCopy(quickLogCopy.notesLabel);
  const notesPlaceholder = useAdaptiveCopy(quickLogCopy.notesPlaceholder);
  const saveBtn = useAdaptiveCopy(quickLogCopy.saveButton);

  const {
    isSupported: voiceSupported,
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    voiceError,
    clearVoiceError,
  } = useQuickVoiceNotes();

  const audioRecorder = useAudioNoteRecorder();

  const toggleTag = (tag: string, list: string[], setter: (val: string[]) => void) => {
    if (list.includes(tag)) {
      setter(list.filter(t => t !== tag));
    } else {
      setter([...list, tag]);
    }
  };

  const handlePainChange = (value: number) => setPain(value);

  const hasNavigator = typeof navigator !== 'undefined';
  const isOffline = hasNavigator && navigator.onLine === false;
  const connectionStatus = isOffline
    ? 'Offline: works only if your browser provides local speech.'
    : 'Uses your device speech service. May rely on your browser/OS (not guaranteed offline).';

  useEffect(() => {
    if (!voiceMode && isListening) stopListening();
    if (!voiceMode) clearVoiceError();
  }, [clearVoiceError, isListening, stopListening, voiceMode]);

  const handleInsertTranscript = () => {
    if (!transcript) return;
    setNotes(prev => (prev ? `${prev}\n${transcript}` : transcript));
    resetTranscript();
  };

  const saveDisabledReason = useMemo(() => {
    // Keep Quick Log forgiving: allow saving even without tags/notes.
    // (Pain is always present.)
    return null as string | null;
  }, []);

  const handleSave = useCallback(() => {
    const activities = parseFreeformList(activitiesText);
    const triggers = parseFreeformList(dietTriggersText);

    onComplete({
      pain,
      locations,
      symptoms,
      notes,
      sleep: sleepSet ? sleep : undefined,
      activityLevel: activityLevelSet ? activityLevel : undefined,
      medicationAdherence: medicationAdherence ?? undefined,
      activities: activities.length > 0 ? activities : undefined,
      triggers: triggers.length > 0 ? triggers : undefined,
    });
  }, [activitiesText, activityLevel, activityLevelSet, dietTriggersText, locations, medicationAdherence, notes, onComplete, pain, sleep, sleepSet, symptoms]);

  return (
    <div className="min-h-screen bg-surface-900 text-ink-100 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-surface-900/95 backdrop-blur-sm border-b border-surface-800">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onCancel}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)]',
              'text-small text-ink-300 hover:text-ink-100 hover:bg-surface-800',
              'transition-colors duration-[var(--duration-fast)]'
            )}
          >
            <ChevronLeft className="w-4 h-4" />
            Cancel
          </button>
          <div className="text-small text-ink-400 text-mono">Quick Log</div>
          <div className="w-[88px]" />
        </div>

        <div className="px-4 pb-4">
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
                    : "Voice mode isn't available in this browser. You can still use your operating system's built-in dictation features."}
                </p>
                {voiceError && (
                  <p className="text-small text-danger-400" role="alert">
                    {voiceError}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-tiny text-ink-500">
                {voiceMode ? 'On' : 'Off'} · {voiceSupported ? 'Device speech engine' : 'Unavailable'}
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
                {voiceMode ? 'Disable' : 'Enable'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-10">
          {/* Pain */}
          <section className="space-y-6">
            <div>
              <h2 className="text-h2 text-ink-50 mb-2">{painLabel}</h2>
              <p className="text-small text-ink-400">{painHint}</p>
            </div>

            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => handlePainChange(Math.max(0, pain - 1))}
                aria-label="Decrease pain level"
                className={cn(
                  'flex items-center justify-center',
                  'w-14 h-14 min-w-[56px] min-h-[56px]',
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

              <div
                className={cn(
                  'p-8 rounded-[var(--radius-xl)] text-center flex-1',
                  'bg-surface-800 border border-surface-700'
                )}
                role="status"
                aria-live="polite"
              >
                <div className="text-display text-mono mb-2 text-6xl font-bold text-primary-400">
                  {pain}
                </div>
                <div className="text-body-medium text-ink-100">{PAIN_LABELS[pain]}</div>
              </div>

              <button
                type="button"
                onClick={() => handlePainChange(Math.min(10, pain + 1))}
                aria-label="Increase pain level"
                className={cn(
                  'flex items-center justify-center',
                  'w-14 h-14 min-w-[56px] min-h-[56px]',
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
                className="w-full h-12 cursor-pointer appearance-none bg-transparent
                  [&::-webkit-slider-track]:h-2 [&::-webkit-slider-track]:bg-[color:var(--surface-600)]
                  [&::-webkit-slider-track]:rounded-full
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6
                  [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-[color:var(--primary-500)] [&::-webkit-slider-thumb]:shadow-lg
                  [&::-moz-range-track]:h-2 [&::-moz-range-track]:bg-[color:var(--surface-600)]
                  [&::-moz-range-track]:rounded-full
                  [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6
                  [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[color:var(--primary-500)]
                  [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-lg
                  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-surface-900"
              />

              <div className="flex justify-between text-tiny text-ink-400 text-mono px-1">
                {Array.from({ length: 11 }, (_, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => handlePainChange(i)}
                    aria-label={`Set pain level to ${i}, ${PAIN_LABELS[i]}`}
                    className={cn(
                      'w-10 h-10 min-w-[40px] min-h-[40px] rounded flex items-center justify-center',
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
          </section>

          {/* Locations & Symptoms */}
          <section className="space-y-8">
            <div>
              <h2 className="text-h2 text-ink-50 mb-2">{locationsLabel}</h2>
              <p className="text-small text-ink-400">{locationsHint}</p>
            </div>

            <div aria-live="polite" aria-atomic="true" className="sr-only">
              {locations.length > 0
                ? `${locations.length} location${locations.length > 1 ? 's' : ''} selected: ${locations.join(', ')}`
                : 'No locations selected'}
            </div>

            <fieldset>
              <legend className="sr-only">Pain locations</legend>
              <div className="flex flex-wrap gap-2">
                {LOCATION_TAGS.map(tag => (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag, locations, setLocations)}
                    role="checkbox"
                    aria-checked={locations.includes(tag)}
                    aria-label={`${tag} location`}
                    className={cn(
                      'px-4 py-3 min-w-[56px] min-h-[56px] rounded-[var(--radius-full)] text-small',
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

            <div>
              <h3 className="text-body-medium text-ink-200 mb-3">What does it feel like?</h3>
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
                      type="button"
                      key={tag}
                      onClick={() => toggleTag(tag, symptoms, setSymptoms)}
                      role="checkbox"
                      aria-checked={symptoms.includes(tag)}
                      aria-label={`${tag} symptom`}
                      className={cn(
                        'px-4 py-3 min-w-[56px] min-h-[56px] rounded-[var(--radius-full)] text-small',
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
          </section>

          {/* Optional Signals */}
          <section className="space-y-6">
            <div>
              <h2 className="text-h2 text-ink-50 mb-2">Optional signals</h2>
              <p className="text-small text-ink-400">These help correlations (sleep, activity, food).</p>
            </div>

            <div className="surface-card border border-surface-700 bg-surface-800/70 space-y-4">
              <div>
                <label htmlFor="sleep-quality" className="block text-body-medium text-ink-200 mb-1">
                  Sleep quality
                </label>
                <div className="flex items-center justify-between gap-3">
                  <input
                    id="sleep-quality"
                    type="range"
                    min={0}
                    max={10}
                    step={1}
                    value={sleep}
                    onChange={e => {
                      setSleep(Number(e.target.value));
                      setSleepSet(true);
                    }}
                    className="w-full"
                    aria-label="Sleep quality from 0 to 10"
                  />
                  <span className="text-small text-ink-300 w-16 text-right" aria-live="polite">
                    {sleepSet ? sleep : '—'}
                  </span>
                </div>
                <p className="text-tiny text-ink-500 mt-1">0 = very poor, 10 = excellent</p>
              </div>

              <div>
                <label htmlFor="activity-level" className="block text-body-medium text-ink-200 mb-1">
                  Activity level
                </label>
                <div className="flex items-center justify-between gap-3">
                  <input
                    id="activity-level"
                    type="range"
                    min={0}
                    max={10}
                    step={1}
                    value={activityLevel}
                    onChange={e => {
                      setActivityLevel(Number(e.target.value));
                      setActivityLevelSet(true);
                    }}
                    className="w-full"
                    aria-label="Activity level from 0 to 10"
                  />
                  <span className="text-small text-ink-300 w-16 text-right" aria-live="polite">
                    {activityLevelSet ? activityLevel : '—'}
                  </span>
                </div>
                <p className="text-tiny text-ink-500 mt-1">0 = none, 10 = very active</p>
              </div>

              <div>
                <label htmlFor="med-adherence" className="block text-body-medium text-ink-200 mb-2">
                  Medication adherence
                </label>
                <select
                  id="med-adherence"
                  value={medicationAdherence ?? ''}
                  onChange={e =>
                    setMedicationAdherence((e.target.value || null) as MedicationAdherence | null)
                  }
                  className={cn(
                    'w-full p-3 rounded-[var(--radius-md)]',
                    'bg-surface-900 border border-surface-600',
                    'text-body text-ink-100',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-surface-900 focus:border-transparent'
                  )}
                >
                  <option value="">Not logged</option>
                  <option value="as_prescribed">Taken as prescribed</option>
                  <option value="partial">Partially taken</option>
                  <option value="missed">Missed</option>
                  <option value="not_applicable">Not applicable</option>
                </select>
              </div>

              <div>
                <label htmlFor="activities" className="block text-body-medium text-ink-200 mb-2">
                  Activities/exercise (comma or new line)
                </label>
                <textarea
                  id="activities"
                  value={activitiesText}
                  onChange={e => setActivitiesText(e.target.value)}
                  placeholder="e.g., physio, walk, stretching"
                  className={cn(
                    'w-full h-24 p-3 rounded-[var(--radius-md)]',
                    'bg-surface-900 border border-surface-600',
                    'text-body text-ink-100 placeholder:text-ink-500',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-surface-900 focus:border-transparent',
                    'transition-all duration-[var(--duration-fast)] resize-none'
                  )}
                />
              </div>

              <div>
                <label htmlFor="diet-triggers" className="block text-body-medium text-ink-200 mb-2">
                  Food/diet triggers (comma or new line)
                </label>
                <textarea
                  id="diet-triggers"
                  value={dietTriggersText}
                  onChange={e => setDietTriggersText(e.target.value)}
                  placeholder="e.g., caffeine, spicy food, skipped meal"
                  className={cn(
                    'w-full h-24 p-3 rounded-[var(--radius-md)]',
                    'bg-surface-900 border border-surface-600',
                    'text-body text-ink-100 placeholder:text-ink-500',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-surface-900 focus:border-transparent',
                    'transition-all duration-[var(--duration-fast)] resize-none'
                  )}
                />
                <p className="text-tiny text-ink-500 mt-1">Saved as triggers for analytics.</p>
              </div>
            </div>
          </section>

          {/* Notes + Voice */}
          <section className="space-y-6">
            <div>
              <h2 className="text-h2 text-ink-50 mb-2">{notesLabel}</h2>
              <p className="text-small text-ink-400">Dictation works with your phone keyboard too.</p>
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
                  'w-full h-36 p-4 rounded-[var(--radius-xl)]',
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
                    <div className="text-body-medium text-ink-100">Voice mode (speech-to-text)</div>
                    <p className="text-small text-ink-400">
                      Uses your device speech service. {connectionStatus}
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
                    aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    {isListening ? 'Stop' : 'Start'}
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

            <div className="surface-card border border-surface-700 bg-surface-800/70">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-body-medium text-ink-100">Voice note (audio)</div>
                  <p className="text-small text-ink-400">
                    Records audio on your device. This note is not saved into the entry yet — download if you want to keep it.
                  </p>
                  {audioRecorder.error && (
                    <p className="text-small text-danger-400" role="alert">
                      {audioRecorder.error}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={audioRecorder.isRecording ? audioRecorder.stop : audioRecorder.start}
                    disabled={!audioRecorder.isSupported}
                    className={cn(
                      'px-4 py-2 rounded-[var(--radius-md)] text-small font-medium',
                      'border border-surface-600 transition-colors duration-[var(--duration-fast)] flex items-center gap-2',
                      audioRecorder.isRecording
                        ? 'bg-danger-500 text-ink-900 border-danger-500'
                        : 'bg-primary-500 text-ink-900 border-primary-500',
                      !audioRecorder.isSupported && 'opacity-60 cursor-not-allowed'
                    )}
                    aria-pressed={audioRecorder.isRecording}
                    aria-label={audioRecorder.isRecording ? 'Stop audio recording' : 'Start audio recording'}
                  >
                    {audioRecorder.isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    {audioRecorder.isRecording ? 'Stop' : 'Record'}
                  </button>
                  {audioRecorder.audioUrl && (
                    <button
                      type="button"
                      onClick={audioRecorder.clear}
                      className={cn(
                        'px-4 py-2 rounded-[var(--radius-md)] text-small font-medium',
                        'bg-surface-900 text-ink-200 border border-surface-600 hover:border-primary-500/60 transition-colors'
                      )}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {!audioRecorder.isSupported && (
                <p className="mt-3 text-small text-ink-400">
                  Audio recording isnt supported in this browser. You can still use dictation or Voice Mode.
                </p>
              )}

              {audioRecorder.audioUrl && (
                <div className="mt-4 space-y-3">
                  <audio controls src={audioRecorder.audioUrl} className="w-full" />
                  <div className="flex gap-2 flex-wrap">
                    <a
                      href={audioRecorder.audioUrl}
                      download={`pain-voice-note-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.webm`}
                      className={cn(
                        'px-3 py-2 rounded-[var(--radius-md)] text-small font-medium',
                        'bg-primary-500 text-ink-900 hover:bg-primary-400 transition-colors inline-flex items-center'
                      )}
                    >
                      Download voice note
                    </a>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 left-0 right-0 p-4 border-t border-surface-700 bg-surface-900/95 backdrop-blur-sm z-10">
        <div className="max-w-2xl mx-auto flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className={cn(
              'px-6 py-4 rounded-[var(--radius-xl)]',
              'min-h-[56px] min-w-[56px]',
              'bg-surface-800 hover:bg-surface-700',
              'text-body-medium text-ink-200 font-medium',
              'transition-colors duration-[var(--duration-fast)]',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-surface-900'
            )}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            aria-disabled={!!saveDisabledReason}
            className={cn(
              'flex-1 px-6 py-4 rounded-[var(--radius-xl)]',
              'min-h-[56px]',
              'bg-primary-500 hover:bg-primary-400',
              'text-body-medium text-ink-900 font-semibold',
              'transition-colors duration-[var(--duration-fast)]',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-surface-900'
            )}
          >
            {saveBtn}
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuickLogOneScreen;
