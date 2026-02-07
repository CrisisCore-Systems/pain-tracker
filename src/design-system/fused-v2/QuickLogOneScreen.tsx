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

/** Returns a Tailwind-friendly severity color set based on pain 0-10 */
function painSeverityColors(pain: number) {
  if (pain === 0) return { text: 'text-emerald-400', bg: 'bg-emerald-500/15', ring: 'ring-emerald-500/40', accent: '#34d399' };
  if (pain <= 2)  return { text: 'text-green-400',   bg: 'bg-green-500/15',   ring: 'ring-green-500/40',   accent: '#4ade80' };
  if (pain <= 4)  return { text: 'text-amber-400',   bg: 'bg-amber-500/15',   ring: 'ring-amber-500/40',   accent: '#fbbf24' };
  if (pain <= 6)  return { text: 'text-orange-400',  bg: 'bg-orange-500/15',  ring: 'ring-orange-500/40',  accent: '#fb923c' };
  if (pain <= 8)  return { text: 'text-red-400',     bg: 'bg-red-500/15',     ring: 'ring-red-500/40',     accent: '#f87171' };
  return              { text: 'text-red-300',     bg: 'bg-red-500/20',     ring: 'ring-red-500/50',     accent: '#fca5a5' };
}

/** Shared styled-range slider classes */
const SLIDER_CLASSES = cn(
  'w-full h-2 cursor-pointer appearance-none bg-transparent rounded-full',
  '[&::-webkit-slider-track]:h-2 [&::-webkit-slider-track]:bg-surface-600 [&::-webkit-slider-track]:rounded-full',
  '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5',
  '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-400 [&::-webkit-slider-thumb]:shadow-lg',
  '[&::-webkit-slider-thumb]:ring-2 [&::-webkit-slider-thumb]:ring-primary-500/50',
  '[&::-webkit-slider-thumb]:transition-shadow [&::-webkit-slider-thumb]:hover:shadow-primary-500/40',
  '[&::-moz-range-track]:h-2 [&::-moz-range-track]:bg-surface-600 [&::-moz-range-track]:rounded-full',
  '[&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full',
  '[&::-moz-range-thumb]:bg-primary-400 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-lg',
  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-surface-900'
);

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
      <div className="sticky top-0 z-10 bg-surface-900/95 backdrop-blur-sm border-b border-surface-700/60">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={onCancel}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-md)]',
              'text-small text-ink-300 hover:text-ink-100 hover:bg-surface-800',
              'transition-colors duration-[var(--duration-fast)]'
            )}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-body-medium text-ink-100 font-semibold">Quick Log</h1>
          <button
            type="button"
            onClick={() => setVoiceMode(prev => !prev)}
            disabled={!voiceSupported}
            aria-pressed={voiceMode}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-md)] text-small',
              'border border-surface-600 transition-colors duration-[var(--duration-fast)]',
              voiceMode
                ? 'bg-primary-500/20 text-primary-400 border-primary-500/40'
                : 'text-ink-400 hover:text-ink-200 hover:border-surface-500',
              !voiceSupported && 'opacity-40 cursor-not-allowed'
            )}
            title={voiceSupported ? (voiceMode ? 'Disable voice mode' : 'Enable voice mode') : 'Voice not available'}
          >
            {voiceMode ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            <span className="hidden sm:inline">{voiceMode ? 'Voice On' : 'Voice'}</span>
          </button>
        </div>

        {/* Voice error banner — only shown when relevant */}
        {voiceError && (
          <div className="px-4 pb-3">
            <div className="max-w-2xl mx-auto bg-red-500/10 border border-red-500/30 rounded-[var(--radius-md)] px-4 py-2">
              <p className="text-small text-red-400" role="alert">{voiceError}</p>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-10">
          {/* Pain */}
          <section className="space-y-5">
            <div>
              <h2 className="text-h2 text-ink-50 mb-1">{painLabel}</h2>
              <p className="text-small text-ink-400">{painHint}</p>
            </div>

            {/* Central pain display — severity-colored */}
            {(() => {
              const sc = painSeverityColors(pain);
              return (
                <div
                  className={cn(
                    'relative rounded-[var(--radius-xl)] border border-surface-700 overflow-hidden',
                    'bg-surface-800 transition-all duration-300'
                  )}
                >
                  {/* Severity accent bar */}
                  <div
                    className="absolute inset-x-0 top-0 h-1 transition-all duration-300"
                    style={{ backgroundColor: sc.accent, width: `${Math.max((pain / 10) * 100, 4)}%` }}
                  />

                  <div className="flex items-center justify-center gap-5 px-6 py-8">
                    <button
                      type="button"
                      onClick={() => handlePainChange(Math.max(0, pain - 1))}
                      aria-label="Decrease pain level"
                      className={cn(
                        'flex items-center justify-center',
                        'w-12 h-12 min-w-[48px] min-h-[48px]',
                        'rounded-full',
                        'bg-surface-700 hover:bg-surface-600 border border-surface-600',
                        'text-ink-200 hover:text-ink-100',
                        'transition-colors text-xl font-medium',
                        'disabled:opacity-40 disabled:cursor-not-allowed'
                      )}
                      disabled={pain === 0}
                    >
                      −
                    </button>

                    <div className="text-center" role="status" aria-live="polite">
                      <div className={cn('text-6xl font-bold tabular-nums mb-1 transition-colors duration-300', sc.text)}>
                        {pain}
                      </div>
                      <div className="text-body-medium text-ink-200">{PAIN_LABELS[pain]}</div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handlePainChange(Math.min(10, pain + 1))}
                      aria-label="Increase pain level"
                      className={cn(
                        'flex items-center justify-center',
                        'w-12 h-12 min-w-[48px] min-h-[48px]',
                        'rounded-full',
                        'bg-surface-700 hover:bg-surface-600 border border-surface-600',
                        'text-ink-200 hover:text-ink-100',
                        'transition-colors text-xl font-medium',
                        'disabled:opacity-40 disabled:cursor-not-allowed'
                      )}
                      disabled={pain === 10}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Slider */}
            <div className="space-y-3 px-1">
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
                style={{ '--thumb-color': painSeverityColors(pain).accent } as React.CSSProperties}
                className={cn(
                  SLIDER_CLASSES,
                  'h-12',
                  '[&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6',
                  '[&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6'
                )}
              />

              {/* Number grid — wraps gracefully on small screens */}
              <div className="grid grid-cols-11 gap-1">
                {Array.from({ length: 11 }, (_, i) => {
                  const isc = painSeverityColors(i);
                  return (
                    <button
                      type="button"
                      key={i}
                      onClick={() => handlePainChange(i)}
                      aria-label={`Set pain level to ${i}, ${PAIN_LABELS[i]}`}
                      className={cn(
                        'aspect-square rounded-[var(--radius-sm)] flex items-center justify-center',
                        'text-small tabular-nums font-medium',
                        'transition-all duration-150',
                        'focus:outline-none focus:ring-2 focus:ring-primary-500',
                        'min-h-[40px]',
                        i === pain
                          ? cn(isc.bg, isc.text, 'ring-2', isc.ring, 'font-bold scale-105')
                          : 'text-ink-400 hover:bg-surface-700 hover:text-ink-200'
                      )}
                    >
                      {i}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Locations & Symptoms */}
          <section className="space-y-6">
            <div>
              <h2 className="text-h2 text-ink-50 mb-1">{locationsLabel}</h2>
              <p className="text-small text-ink-400">{locationsHint}</p>
            </div>

            <div aria-live="polite" aria-atomic="true" className="sr-only">
              {locations.length > 0
                ? `${locations.length} location${locations.length > 1 ? 's' : ''} selected: ${locations.join(', ')}`
                : 'No locations selected'}
            </div>

            {/* Locations card */}
            <div className="rounded-[var(--radius-xl)] border border-surface-700 bg-surface-800 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-body-medium text-ink-200">📍 Where does it hurt?</span>
                {locations.length > 0 && (
                  <span className="text-tiny bg-primary-500/15 text-primary-400 rounded-full px-2 py-0.5 tabular-nums">
                    {locations.length} selected
                  </span>
                )}
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
                        'px-3.5 py-2.5 min-h-[44px] rounded-[var(--radius-full)] text-small',
                        'border transition-all duration-[var(--duration-fast)]',
                        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-surface-900',
                        locations.includes(tag)
                          ? 'bg-primary-500/15 border-primary-500/50 text-primary-300 font-medium shadow-sm'
                          : 'bg-surface-900/50 border-surface-600 text-ink-300 hover:border-primary-500/30 hover:text-ink-200'
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
            </div>

            {/* Symptoms card */}
            <div className="rounded-[var(--radius-xl)] border border-surface-700 bg-surface-800 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-body-medium text-ink-200">🩺 What does it feel like?</span>
                {symptoms.length > 0 && (
                  <span className="text-tiny bg-warn-500/15 text-warn-400 rounded-full px-2 py-0.5 tabular-nums">
                    {symptoms.length} selected
                  </span>
                )}
              </div>
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
                        'px-3.5 py-2.5 min-h-[44px] rounded-[var(--radius-full)] text-small',
                        'border transition-all duration-[var(--duration-fast)]',
                        'focus:outline-none focus:ring-2 focus:ring-warn-500 focus:ring-offset-2 focus:ring-offset-surface-900',
                        symptoms.includes(tag)
                          ? 'bg-warn-500/15 border-warn-500/50 text-warn-400 font-medium shadow-sm'
                          : 'bg-surface-900/50 border-surface-600 text-ink-300 hover:border-warn-500/30 hover:text-ink-200'
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
          <section className="space-y-5">
            <div>
              <h2 className="text-h2 text-ink-50 mb-1">Optional signals</h2>
              <p className="text-small text-ink-400">Help find correlations between pain, sleep, activity &amp; food.</p>
            </div>

            {/* Slider pair: Sleep + Activity */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[var(--radius-xl)] border border-surface-700 bg-surface-800 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <label htmlFor="sleep-quality" className="text-body-medium text-ink-200">
                    💤 Sleep quality
                  </label>
                  <span
                    className={cn(
                      'text-small tabular-nums font-semibold min-w-[2.5rem] text-center rounded-md px-2 py-0.5',
                      sleepSet ? 'bg-indigo-500/15 text-indigo-400' : 'text-ink-500'
                    )}
                    aria-live="polite"
                  >
                    {sleepSet ? `${sleep}/10` : '—'}
                  </span>
                </div>
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
                  className={SLIDER_CLASSES}
                  aria-label="Sleep quality from 0 to 10"
                />
                <div className="flex justify-between text-tiny text-ink-500">
                  <span>Very poor</span>
                  <span>Excellent</span>
                </div>
              </div>

              <div className="rounded-[var(--radius-xl)] border border-surface-700 bg-surface-800 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <label htmlFor="activity-level" className="text-body-medium text-ink-200">
                    🏃 Activity level
                  </label>
                  <span
                    className={cn(
                      'text-small tabular-nums font-semibold min-w-[2.5rem] text-center rounded-md px-2 py-0.5',
                      activityLevelSet ? 'bg-emerald-500/15 text-emerald-400' : 'text-ink-500'
                    )}
                    aria-live="polite"
                  >
                    {activityLevelSet ? `${activityLevel}/10` : '—'}
                  </span>
                </div>
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
                  className={SLIDER_CLASSES}
                  aria-label="Activity level from 0 to 10"
                />
                <div className="flex justify-between text-tiny text-ink-500">
                  <span>Sedentary</span>
                  <span>Very active</span>
                </div>
              </div>
            </div>

            {/* Medication adherence */}
            <div className="rounded-[var(--radius-xl)] border border-surface-700 bg-surface-800 p-5">
              <label htmlFor="med-adherence" className="block text-body-medium text-ink-200 mb-3">
                💊 Medication adherence
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { value: '', label: 'Not logged', icon: '' },
                  { value: 'as_prescribed', label: 'As prescribed', icon: '✅' },
                  { value: 'partial', label: 'Partial', icon: '⚠️' },
                  { value: 'missed', label: 'Missed', icon: '❌' },
                  { value: 'not_applicable', label: 'N/A', icon: '—' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setMedicationAdherence((opt.value || null) as MedicationAdherence | null)}
                    className={cn(
                      'px-3 py-2.5 rounded-[var(--radius-md)] text-small text-center',
                      'border transition-all duration-150',
                      'focus:outline-none focus:ring-2 focus:ring-primary-500',
                      (medicationAdherence ?? '') === opt.value
                        ? 'bg-primary-500/15 border-primary-500/50 text-primary-400 font-medium'
                        : 'border-surface-600 text-ink-300 hover:border-surface-500 hover:text-ink-200'
                    )}
                  >
                    {opt.icon && <span className="mr-1">{opt.icon}</span>}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Text inputs: Activities + Triggers */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[var(--radius-xl)] border border-surface-700 bg-surface-800 p-5">
                <label htmlFor="activities" className="block text-body-medium text-ink-200 mb-2">
                  🚶 Activities / exercise
                </label>
                <textarea
                  id="activities"
                  value={activitiesText}
                  onChange={e => setActivitiesText(e.target.value)}
                  placeholder="e.g., physio, walk, stretching"
                  rows={3}
                  className={cn(
                    'w-full p-3 rounded-[var(--radius-md)]',
                    'bg-surface-900 border border-surface-600',
                    'text-body text-ink-100 placeholder:text-ink-500',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-surface-900 focus:border-transparent',
                    'transition-all duration-[var(--duration-fast)] resize-none'
                  )}
                />
                <p className="text-tiny text-ink-500 mt-1.5">Comma or new-line separated</p>
              </div>

              <div className="rounded-[var(--radius-xl)] border border-surface-700 bg-surface-800 p-5">
                <label htmlFor="diet-triggers" className="block text-body-medium text-ink-200 mb-2">
                  🍽️ Food / diet triggers
                </label>
                <textarea
                  id="diet-triggers"
                  value={dietTriggersText}
                  onChange={e => setDietTriggersText(e.target.value)}
                  placeholder="e.g., caffeine, spicy food, skipped meal"
                  rows={3}
                  className={cn(
                    'w-full p-3 rounded-[var(--radius-md)]',
                    'bg-surface-900 border border-surface-600',
                    'text-body text-ink-100 placeholder:text-ink-500',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-surface-900 focus:border-transparent',
                    'transition-all duration-[var(--duration-fast)] resize-none'
                  )}
                />
                <p className="text-tiny text-ink-500 mt-1.5">Saved as triggers for analytics</p>
              </div>
            </div>
          </section>

          {/* Notes + Voice */}
          <section className="space-y-5">
            <div>
              <h2 className="text-h2 text-ink-50 mb-1">{notesLabel}</h2>
              <p className="text-small text-ink-400">Dictation works with your phone keyboard too.</p>
            </div>

            <div className="rounded-[var(--radius-xl)] border border-surface-700 bg-surface-800 p-5">
              <label htmlFor="pain-notes" className="block text-body-medium text-ink-200 mb-2">
                ✏️ Additional notes
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
                  'w-full h-32 p-3 rounded-[var(--radius-md)]',
                  'bg-surface-900 border border-surface-600',
                  'text-body text-ink-100 placeholder:text-ink-500',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-surface-900 focus:border-transparent',
                  'transition-all duration-[var(--duration-fast)]',
                  'resize-none'
                )}
              />
              <div className="flex justify-between items-center mt-2">
                <span id="notes-hint" className="text-tiny text-ink-400">
                  {notes.length === 0
                    ? 'No notes yet'
                    : `${notes.length} character${notes.length === 1 ? '' : 's'}`}
                </span>
                <span
                  id="notes-remaining"
                  className={cn(
                    'text-tiny tabular-nums',
                    500 - notes.length < 50 ? 'text-warn-400' : 'text-ink-500'
                  )}
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
      <div className="sticky bottom-0 left-0 right-0 border-t border-surface-700/60 bg-surface-900/95 backdrop-blur-sm z-10">
        <div className="max-w-2xl mx-auto flex gap-3 px-4 py-3">
          <button
            type="button"
            onClick={onCancel}
            className={cn(
              'px-5 py-3.5 rounded-[var(--radius-xl)]',
              'min-h-[48px]',
              'bg-surface-800 hover:bg-surface-700 border border-surface-700',
              'text-body-medium text-ink-300 font-medium',
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
              'flex-1 px-6 py-3.5 rounded-[var(--radius-xl)]',
              'min-h-[48px]',
              'bg-primary-500 hover:bg-primary-400',
              'text-body-medium text-ink-900 font-semibold',
              'shadow-lg shadow-primary-500/20',
              'transition-all duration-[var(--duration-fast)]',
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
