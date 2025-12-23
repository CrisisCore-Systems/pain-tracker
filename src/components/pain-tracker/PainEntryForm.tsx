import { useCallback, useEffect, useState } from 'react';
import { PHQ9Screen, PHQ9Response } from '../mental-health/PHQ9Screen';
import { GAD7Screen, GAD7Response } from '../mental-health/GAD7Screen';
import type { PainEntry } from '../../types';
import { CreatePainEntrySchema } from '../../types';
import { usePainTrackerStore } from '../../stores/pain-tracker-store';
import {
  BaselineSection,
  ComparisonSection,
  FunctionalImpactSection,
  MedicationsSection,
  QualityOfLifeSection,
  TreatmentsSection,
  WorkImpactSection,
} from './form-sections';
// Optional validation technology integration (feature-flagged)
import {
  EmotionalValidation,
  HolisticProgressTracker,
  ValidationHistory,
  useEmotionalValidation,
  validationIntegration,
  type ProgressEntry,
} from '../../validation-technology';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Save,
  Clock,
  AlertCircle,
  BarChart3,
  History,
  Loader2,
  X,
} from 'lucide-react';
import { useTraumaInformed } from '../accessibility/TraumaInformedHooks';
import type { ValidationResponse } from '../../services/EmotionalValidationService';
import { trackPainEntryLogged } from '../../analytics/ga4-events';
import { trackUsageEvent, incrementSessionAction } from '../../utils/usage-tracking';
import { analyticsLogger } from '../../lib/debug-logger';

// Environment helper for browser (Vite) and Node fallbacks.
// Use Vite's import.meta.env when available, otherwise fall back to process.env if present.
type EnvRecord = Record<string, unknown>;

const getEnv = (): EnvRecord => {
  try {
    const metaEnv = (import.meta as unknown as { env?: unknown }).env;
    if (metaEnv && typeof metaEnv === 'object') {
      return metaEnv as EnvRecord;
    }
  } catch {
    // ignore
  }

  const processEnv = (globalThis as unknown as { process?: { env?: unknown } }).process?.env;
  if (processEnv && typeof processEnv === 'object') {
    return processEnv as EnvRecord;
  }

  return {};
};

const getEnvValue = (env: EnvRecord, key: string): string | undefined => {
  const value = env[key];
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  return undefined;
};

const ENABLE_VALIDATION = (() => {
  const env = getEnv();
  // Enable by default unless explicitly disabled
  // Support both Vite-prefixed and legacy env keys
  return (
    getEnvValue(env, 'VITE_REACT_APP_ENABLE_VALIDATION') !== 'false' &&
    getEnvValue(env, 'REACT_APP_ENABLE_VALIDATION') !== 'false'
  );
})();

interface PainEntryFormProps {
  onSubmit: (entry: Omit<PainEntry, 'id' | 'timestamp'>) => void;
}

export function PainEntryForm({ onSubmit }: PainEntryFormProps) {
  const { ui, setCurrentFormSection } = usePainTrackerStore();
  const entries = usePainTrackerStore(state => state.entries);
  const currentSection = ui.currentFormSection;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { preferences } = useTraumaInformed();
  const { validationHistory, addValidation, clearHistory } = useEmotionalValidation();
  const [showValidationHistory, setShowValidationHistory] = useState(true);
  const [showProgressTracker, setShowProgressTracker] = useState(preferences.showProgress);
  const [progressStatus, setProgressStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>(
    'idle'
  );
  const [formData, setFormData] = useState<Omit<PainEntry, 'id' | 'timestamp'>>({
    baselineData: {
      pain: 0,
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
      sleepQuality: 0,
      moodImpact: 0,
      socialImpact: [],
    },
    mood: 5, // Default to neutral mood (1-10 scale)
    phq9: null, // Add PHQ-9 result to form data
      // Mood scale section (direct mood rating, not mood impact)
      const MoodSection = () => (
        <div className="space-y-6" role="group" aria-labelledby="mood-section-title">
          <div className="flex items-center space-x-3">
            <span className="text-2xl" role="img" aria-label="mood">
              🙂
            </span>
            <h3 id="mood-section-title" className="text-xl font-semibold text-foreground">
              Mood (How are you feeling?)
            </h3>
          </div>
          <div className="p-6 rounded-xl bg-slate-800/60">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="mood-scale" className="text-sm font-medium text-foreground">
                  Mood
                </label>
                <span className="text-sm text-muted-foreground">
                  {formData.mood}/10 - {formData.mood <= 3 ? 'Low' : formData.mood <= 7 ? 'Neutral' : 'Good'}
                </span>
              </div>
              <div className="space-y-3">
                <input
                  id="mood-scale"
                  type="range"
                  min="1"
                  max="10"
                  value={formData.mood}
                  onChange={e => setFormData(prev => ({ ...prev, mood: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                  aria-label={`Mood: ${formData.mood} out of 10`}
                />
                <div className="flex justify-between text-xs text-muted-foreground px-1">
                  <span>
                    1<br />Very low
                  </span>
                  <span>
                    5<br />Neutral
                  </span>
                  <span>
                    10<br />Very good
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
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
  });

  useEffect(() => {
    setShowProgressTracker(preferences.showProgress);
  }, [preferences.showProgress]);

  const handleValidationGenerated = useCallback(
    async (validation: ValidationResponse) => {
      addValidation(validation);
      try {
        await validationIntegration.saveValidation(validation);
      } catch (error) {
        console.error('Failed to persist validation message', error);
      }
    },
    [addValidation]
  );

  const handleProgressUpdate = useCallback(
    async (entry: ProgressEntry) => {
      try {
        setProgressStatus('saving');
        await validationIntegration.saveProgressEntry(entry);
        setProgressStatus('saved');
        setTimeout(() => setProgressStatus('idle'), 6000);
      } catch (error) {
        console.error('Failed to persist progress entry', error);
        setProgressStatus('error');
        setTimeout(() => setProgressStatus('idle'), 6000);
      }
    },
    []
  );

  const validationIsActive = ENABLE_VALIDATION && preferences.realTimeValidation;

  const sections = [
    {
      title: 'Pain Assessment',
      description: 'Rate your current pain and identify affected areas',
      icon: '??',
      component: (
        <BaselineSection
          {...formData.baselineData}
          locations={formData.baselineData.locations || []}
          symptoms={formData.baselineData.symptoms || []}
          onChange={data =>
            setFormData(prev => ({
              ...prev,
              baselineData: { ...prev.baselineData, ...data },
            }))
          }
        />
      ),
      required: true,
      estimatedTime: '2 min',
    },
    {
      title: 'Mood',
      description: 'How is your mood right now? (1-10)',
      icon: '🙂',
      component: <MoodSection />,
      required: false,
      estimatedTime: '1 min',
    },
    {
      title: 'Functional Impact',
      description: 'How is pain affecting your daily activities?',
      icon: '??',
      component: (
        <FunctionalImpactSection
          limitedActivities={formData.functionalImpact?.limitedActivities || []}
          assistanceNeeded={formData.functionalImpact?.assistanceNeeded || []}
          mobilityAids={formData.functionalImpact?.mobilityAids || []}
          onChange={data =>
            setFormData(
              prev =>
                ({
                  ...prev,
                  functionalImpact: { ...prev.functionalImpact, ...data },
                }) as Omit<PainEntry, 'id' | 'timestamp'>
            )
          }
        />
      ),
      required: false,
      estimatedTime: '3 min',
    },
    {
      title: 'Medications',
      description: 'Track your current medications and their effectiveness',
      icon: '??',
      component: (
        <MedicationsSection
          {...formData.medications}
          onChange={data =>
            setFormData(
              prev =>
                ({
                  ...prev,
                  medications: { ...prev.medications, ...data },
                }) as Omit<PainEntry, 'id' | 'timestamp'>
            )
          }
        />
      ),
      required: false,
      estimatedTime: '2 min',
    },
    {
      title: 'Treatments',
      description: 'Document recent treatments and their outcomes',
      icon: '??',
      component: (
        <TreatmentsSection
          {...formData.treatments}
          onChange={data =>
            setFormData(
              prev =>
                ({
                  ...prev,
                  treatments: { ...prev.treatments, ...data },
                }) as Omit<PainEntry, 'id' | 'timestamp'>
            )
          }
        />
      ),
      required: false,
      estimatedTime: '3 min',
    },
    {
      title: 'Quality of Life',
      description: 'How is pain affecting your sleep, mood, and social life?',
      icon: '??',
      component: (
        <QualityOfLifeSection
          {...formData.qualityOfLife}
          onChange={data =>
            setFormData(
              prev =>
                ({
                  ...prev,
                  qualityOfLife: { ...prev.qualityOfLife, ...data },
                }) as Omit<PainEntry, 'id' | 'timestamp'>
            )
          }
        />
      ),
      required: false,
      estimatedTime: '2 min',
    },
    {
      title: 'Work Impact',
      description: 'How has pain affected your work and productivity?',
      icon: '??',
      component: (
        <WorkImpactSection
          {...formData.workImpact}
          onChange={data =>
            setFormData(
              prev =>
                ({
                  ...prev,
                  workImpact: { ...prev.workImpact, ...data },
                }) as Omit<PainEntry, 'id' | 'timestamp'>
            )
          }
        />
      ),
      required: false,
      estimatedTime: '2 min',
    },
    {
      title: 'Comparison',
      description: 'Compare your current condition to previous assessments',
      icon: '??',
      component: (
        <ComparisonSection
          {...formData.comparison}
          onChange={data =>
            setFormData(
              prev =>
                ({
                  ...prev,
                  comparison: { ...prev.comparison, ...data },
                }) as Omit<PainEntry, 'id' | 'timestamp'>
            )
          }
        />
      ),
      required: false,
      estimatedTime: '2 min',
    },
  ];

  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async () => {
          const [showPHQ9, setShowPHQ9] = useState(false);
            const [showGAD7, setShowGAD7] = useState(false);
            const [gad7Result, setGAD7Result] = useState<GAD7Response | null>(null);
          const [phq9Result, setPHQ9Result] = useState<PHQ9Response | null>(null);
          // Show PHQ-9 if mood is low (<=3) and not already shown
          useEffect(() => {
            if (formData.mood !== undefined && formData.mood <= 3 && !showPHQ9) {
              setShowPHQ9(true);
            } else if (formData.mood > 3 && showPHQ9) {
              setShowPHQ9(false);
              setPHQ9Result(null);
            }
          }, [formData.mood, showPHQ9]);
    setIsSubmitting(true);
    setValidationError(null);

    try {
      // Validate form data using Zod schema before submission
      const validationResult = CreatePainEntrySchema.safeParse(formData);

      if (!validationResult.success) {
        // Extract first error message for user display
        const firstError = validationResult.error.issues[0];
        const errorPath = firstError.path.join('.');
        const errorMessage = `${errorPath}: ${firstError.message}`;
        setValidationError(errorMessage);
        analyticsLogger.warn('Form validation failed', {
          errors: validationResult.error.issues,
          formData: { painLevel: formData.baselineData.pain },
        });
        setIsSubmitting(false);
        return;
      }

      await onSubmit(formData);

      // Track pain entry submission
      const locationCount = formData.baselineData.locations?.length ?? 0;
      const symptomCount = formData.baselineData.symptoms?.length ?? 0;
      try {
        trackPainEntryLogged({
          painLevel: formData.baselineData.pain,
          hasLocation: locationCount > 0,
          hasNotes: !!formData.notes,
          locationCount,
          symptomCount,
        });
      } catch (err) {
        analyticsLogger.swallowed('trackPainEntryLogged', err);
      }

      trackUsageEvent('pain_entry_logged', 'pain_tracking', {
        painLevel: formData.baselineData.pain,
        locationCount,
        symptomCount,
      });
      incrementSessionAction();

      // Reset form
      setFormData({
        baselineData: { pain: 0, locations: [], symptoms: [] },
        functionalImpact: { limitedActivities: [], assistanceNeeded: [], mobilityAids: [] },
        medications: { current: [], changes: '', effectiveness: '' },
        treatments: { recent: [], effectiveness: '', planned: [] },
        qualityOfLife: { sleepQuality: 0, moodImpact: 0, socialImpact: [] },
        workImpact: { missedWork: 0, modifiedDuties: [], workLimitations: [] },
        comparison: { worseningSince: '', newLimitations: [] },
        notes: '',
      });
      setCurrentFormSection(0);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSectionValid = (sectionIndex: number) => {
    if (sectionIndex === 0) {
      // Baseline section validation
      return formData.baselineData.pain >= 0 && formData.baselineData.pain <= 10;
    }
    return true; // Other sections are optional
  };

  const canProceedToNext = isSectionValid(currentSection);
  const isLastSection = currentSection === sections.length - 1;

  // Section color schemes for visual variety  
  const sectionColors = [
    { gradient: 'from-sky-500 to-cyan-500', bg: 'rgba(14, 165, 233, 0.15)', text: 'text-sky-400', border: 'rgba(14, 165, 233, 0.3)' },
    { gradient: 'from-emerald-500 to-teal-500', bg: 'rgba(16, 185, 129, 0.15)', text: 'text-emerald-400', border: 'rgba(16, 185, 129, 0.3)' },
    { gradient: 'from-violet-500 to-purple-500', bg: 'rgba(139, 92, 246, 0.15)', text: 'text-violet-400', border: 'rgba(139, 92, 246, 0.3)' },
    { gradient: 'from-rose-500 to-pink-500', bg: 'rgba(244, 63, 94, 0.15)', text: 'text-rose-400', border: 'rgba(244, 63, 94, 0.3)' },
    { gradient: 'from-amber-500 to-orange-500', bg: 'rgba(245, 158, 11, 0.15)', text: 'text-amber-400', border: 'rgba(245, 158, 11, 0.3)' },
    { gradient: 'from-indigo-500 to-blue-500', bg: 'rgba(99, 102, 241, 0.15)', text: 'text-indigo-400', border: 'rgba(99, 102, 241, 0.3)' },
    { gradient: 'from-cyan-500 to-teal-500', bg: 'rgba(6, 182, 212, 0.15)', text: 'text-cyan-400', border: 'rgba(6, 182, 212, 0.3)' },
  ];
  const currentColor = sectionColors[currentSection % sectionColors.length];

  return (
    <div className="max-w-4xl mx-auto rounded-2xl overflow-hidden pain-form-container">
      {/* PHQ-9 Depression Screening Modal/Section */}
            {/* GAD-7 Anxiety Screening Modal/Section */}
            {showGAD7 && !gad7Result && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl p-6 max-w-lg w-full">
                  <GAD7Screen onComplete={result => { setGAD7Result(result); setShowGAD7(false); }} />
                  <button
                    className="mt-4 px-4 py-2 rounded bg-slate-700 text-white font-semibold"
                    onClick={() => setShowGAD7(false)}
                    aria-label="Skip GAD-7"
                  >
                    Skip
                  </button>
                </div>
              </div>
            )}
      {showPHQ9 && !phq9Result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl p-6 max-w-lg w-full">
            <PHQ9Screen onComplete={result => { setPHQ9Result(result); setShowPHQ9(false); }} />
            <button
              className="mt-4 px-4 py-2 rounded bg-slate-700 text-white font-semibold"
              onClick={() => setShowPHQ9(false)}
              aria-label="Skip PHQ-9"
            >
              Skip
            </button>
          </div>
        </div>
      )}
        // Attach PHQ-9 result if present
        const entryWithPHQ9 = phq9Result ? { ...formData, phq9: phq9Result.answers } : formData;
        await onSubmit(entryWithPHQ9);
      {/* Progress bar */}
      <div 
        className={`h-1 w-full bg-gradient-to-r ${currentColor.gradient}`} 
        style={{ boxShadow: `0 0 20px ${currentColor.bg}` }} 
        role="progressbar"
        aria-valuenow={currentSection + 1}
        aria-valuemin={1}
        aria-valuemax={sections.length}
        aria-label={`Step ${currentSection + 1} of ${sections.length}`}
      />
      
      {/* Header section */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div 
              className="p-3 rounded-xl text-2xl" 
              style={{ background: currentColor.bg, border: `1px solid ${currentColor.border}` }}
              aria-hidden="true"
            >
              {sections[currentSection].icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white" id="form-section-title">
                {sections[currentSection].title}
              </h2>
              <p className="text-slate-400 mt-1" id="form-section-description">
                {sections[currentSection].description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium pain-form-time-badge">
              <Clock className="h-3 w-3 mr-1" aria-hidden="true" />
              <span aria-label={`Estimated time: ${sections[currentSection].estimatedTime}`}>
                {sections[currentSection].estimatedTime}
              </span>
            </span>
            <span 
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${currentColor.text}`} 
              style={{ background: currentColor.bg, border: `1px solid ${currentColor.border}` }}
              aria-label={`Section ${currentSection + 1} of ${sections.length}`}
            >
              {currentSection + 1} of {sections.length}
            </span>
          </div>
        </div>
        
        {/* Progress indicator */}
        <div className="mt-6">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-slate-400">Progress</span>
            <span className={currentColor.text}>{Math.round(((currentSection + 1) / sections.length) * 100)}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-700/50">
            <div 
              className={`h-2 rounded-full transition-all duration-500 bg-gradient-to-r ${currentColor.gradient}`} 
              style={{ width: `${((currentSection + 1) / sections.length) * 100}%`, boxShadow: `0 0 10px ${currentColor.bg}` }} 
            />
          </div>
          </div>
        
        {/* Section navigation pills */}
        <nav className="flex flex-wrap gap-2 mt-5" aria-label="Form sections">
          {sections.map((section, index) => {
            const pillColor = sectionColors[index % sectionColors.length];
            const isActive = index === currentSection;
            const isCompleted = index < currentSection;
            return (
              <button 
                key={index} 
                onClick={() => setCurrentFormSection(index)} 
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1 min-h-[32px] ${
                  isCompleted ? 'pain-form-pill-completed' : isActive ? '' : 'pain-form-pill'
                }`}
                style={isActive ? { 
                  background: `linear-gradient(135deg, ${pillColor.bg}, rgba(30, 41, 59, 0.9))`,
                  border: `1px solid ${pillColor.border}`,
                  color: 'white',
                  boxShadow: `0 0 15px ${pillColor.bg}`
                } : undefined}
                aria-label={`Go to ${section.title} section${isCompleted ? ' (completed)' : ''}`}
                aria-current={isActive ? 'step' : undefined}
              >
                {isCompleted ? <Check className="h-3 w-3" aria-hidden="true" /> : <span aria-hidden="true">{section.icon}</span>}
                <span className="hidden sm:inline">{section.title}</span>
                <span className="sm:hidden">{index + 1}</span>
              </button>
            );
          })}
        </nav>
      </div>
      
      {/* Form content */}
      <div className="px-6 pb-6">
        <form 
          role="form" 
          aria-label="Pain Entry Form"
          aria-describedby="form-section-description"
          onSubmit={e => { e.preventDefault(); if (isLastSection && canProceedToNext) { handleSubmit(); } }} 
          className="space-y-6"
        >
          {/* Current section content */}
          <div className="min-h-[400px] p-5 rounded-xl pain-form-section-inner">
                        {sections[currentSection].component}
                        {/* GAD-7 trigger button (optional anxiety screening) */}
                        {!showGAD7 && !gad7Result && (
                          <div className="mt-6 flex flex-col items-start">
                            <button
                              type="button"
                              className="px-4 py-2 rounded bg-cyan-700 text-white font-semibold"
                              onClick={() => setShowGAD7(true)}
                              aria-label="Open GAD-7 Anxiety Screening"
                            >
                              Take Anxiety (GAD-7) Screening
                            </button>
                            <span className="text-xs text-muted-foreground mt-2">
                              Optional: Track anxiety symptoms for a more complete picture.
                            </span>
                          </div>
                        )}
                        {gad7Result && (
                          <div className="mt-4 text-green-500 text-sm">GAD-7 completed and saved for this entry.</div>
                        )}
              // Attach PHQ-9 and GAD-7 results if present
              let entryWithMentalHealth = { ...formData };
              if (phq9Result) entryWithMentalHealth = { ...entryWithMentalHealth, phq9: phq9Result.answers };
              if (gad7Result) entryWithMentalHealth = { ...entryWithMentalHealth, gad7: gad7Result.answers };
              await onSubmit(entryWithMentalHealth);
            {sections[currentSection].component}
          </div>
          
          {/* Emotional validation section */}
          {validationIsActive && (
            <div className="mt-4 p-4 rounded-xl pain-form-validation-section">
              <EmotionalValidation 
                text={formData.notes || ''} 
                onValidationGenerated={handleValidationGenerated} 
                isActive 
              />
            </div>
          )}
          
          {/* Validation history */}
          {validationIsActive && validationHistory.length > 0 && showValidationHistory && (
            <div className="mt-4 p-4 rounded-xl pain-form-history-section">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                  <History className="h-4 w-4 text-violet-400" aria-hidden="true" />
                  <span>Recent validation moments</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => setShowValidationHistory(false)} 
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Hide
                </button>
              </div>
              <ValidationHistory validations={validationHistory} onClear={clearHistory} />
            </div>
          )}
          
          {/* Show validation history toggle */}
          {validationIsActive && !showValidationHistory && validationHistory.length > 0 && (
            <div className="mt-4">
              <button 
                type="button" 
                onClick={() => setShowValidationHistory(true)} 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-violet-400 pain-form-validation-section"
              >
                <History className="h-4 w-4" aria-hidden="true" />
                Show recent validation messages
              </button>
            </div>
          )}
          
          {/* Validation warning */}
          {!canProceedToNext && (
            <div 
              className="flex items-center gap-3 p-4 rounded-xl pain-form-warning" 
              role="alert"
            >
              <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0" aria-hidden="true" />
              <span className="text-sm text-amber-300">
                Please complete the required information in this section before proceeding.
              </span>
            </div>
          )}
          
          {/* Validation error */}
          {validationError && (
            <div 
              className="flex items-center gap-3 p-4 rounded-xl pain-form-error" 
              role="alert"
              aria-live="assertive"
            >
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" aria-hidden="true" />
              <div className="flex-1">
                <span className="text-sm text-red-300 font-medium">Validation Error</span>
                <p className="text-xs text-red-400 mt-1">{validationError}</p>
              </div>
              <button 
                type="button" 
                onClick={() => setValidationError(null)} 
                className="text-red-400 hover:text-red-300 transition-colors p-1 min-h-[44px] min-w-[44px] flex items-center justify-center" 
                aria-label="Dismiss error"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          
          {/* Navigation buttons */}
          <div className="flex justify-between pt-6 pain-form-divider">
            <button 
              type="button" 
              onClick={() => setCurrentFormSection(Math.max(0, currentSection - 1))} 
              disabled={currentSection === 0} 
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed pain-form-nav-button min-h-[44px]"
              style={{ color: currentSection === 0 ? '#475569' : '#e2e8f0' }}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              Previous
            </button>
            
            <div className="flex gap-3">
              {!isLastSection ? (
                <button 
                  type="button" 
                  onClick={() => setCurrentFormSection(Math.min(sections.length - 1, currentSection + 1))} 
                  disabled={!canProceedToNext} 
                  className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed text-white bg-gradient-to-r ${currentColor.gradient} min-h-[44px]`}
                  style={{ boxShadow: canProceedToNext ? `0 4px 15px ${currentColor.bg}` : 'none' }}
                >
                  Next
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              ) : (
                <button 
                  type="submit" 
                  disabled={!canProceedToNext || isSubmitting} 
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed text-white min-w-[140px] justify-center pain-form-submit-button min-h-[44px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" aria-hidden="true" />
                      <span>Save Entry</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
        
        {/* Progress tracker section */}
        {preferences.showProgress && (
          <div className="mt-8 pt-6 pain-form-divider">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg pain-form-progress-section">
                  <BarChart3 className="h-4 w-4 text-violet-400" aria-hidden="true" />
                </div>
                <p className="text-sm font-semibold text-slate-300">
                  Whole-person progress tracking
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowProgressTracker(prev => !prev)} 
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors px-3 py-1 rounded-lg pain-form-toggle-button"
                aria-expanded={showProgressTracker}
              >
                {showProgressTracker ? 'Hide wellness tools' : 'Show wellness tools'}
              </button>
            </div>
            
            {showProgressTracker ? (
              <div className="space-y-3 p-4 rounded-xl pain-form-section-inner">
                <HolisticProgressTracker 
                  painEntries={entries} 
                  onProgressUpdate={handleProgressUpdate} 
                />
                {progressStatus === 'saving' && (
                  <div className="flex items-center gap-2 text-xs text-slate-400" role="status" aria-live="polite">
                    <Loader2 className="h-4 w-4 animate-spin text-violet-400" aria-hidden="true" />
                    <span>Saving wellness insights securely...</span>
                  </div>
                )}
                {progressStatus === 'saved' && (
                  <p className="text-xs text-emerald-400" role="status" aria-live="polite">
                    Progress entry saved with validation technology.
                  </p>
                )}
                {progressStatus === 'error' && (
                  <p className="text-xs text-rose-400" role="alert">
                    We could not save your progress right now. Your notes stay on this device.
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                These tools celebrate growth beyond pain scores. You can open them whenever you are ready.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}