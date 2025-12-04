import { useCallback, useEffect, useMemo, useState } from 'react';
import type { PainEntry } from '../../types';
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
} from 'lucide-react';
import { useTraumaInformed } from '../accessibility/TraumaInformedHooks';
import type { ValidationResponse } from '../../services/EmotionalValidationService';
import { trackPainEntryLogged } from '../../analytics/ga4-events';
import { trackUsageEvent, incrementSessionAction } from '../../utils/usage-tracking';

// Environment helper for browser (Vite) and Node fallbacks.
// Use Vite's import.meta.env when available, otherwise fall back to process.env if present.
const getEnv = () => {
  try {
    // import.meta is supported in browser bundles built by Vite; cast to any to access env at runtime
    if (typeof (import.meta as any) !== 'undefined' && (import.meta as any).env) {
      return (import.meta as any).env as Record<string, any>;
    }
  } catch (_) {
    // ignore
  }
  if (typeof process !== 'undefined' && (process as any).env) {
    return (process as any).env as Record<string, any>;
  }
  return {} as Record<string, any>;
};

const ENABLE_VALIDATION = (() => {
  const env = getEnv();
  // Enable by default unless explicitly disabled
  // Support both Vite-prefixed and legacy env keys
  return (
    env.VITE_REACT_APP_ENABLE_VALIDATION !== 'false' && env.REACT_APP_ENABLE_VALIDATION !== 'false'
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
    [addValidation, validationIntegration]
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
    [validationIntegration]
  );

  const validationIsActive = useMemo(
    () => ENABLE_VALIDATION && preferences.realTimeValidation,
    [preferences.realTimeValidation]
  );

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
      title: 'Functional Impact',
      description: 'How is pain affecting your daily activities?',
      icon: '??',
      component: (
        <FunctionalImpactSection
          limitedActivities={formData.functionalImpact?.limitedActivities || []}
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
          {...(formData.medications as any)}
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
          {...(formData.treatments as any)}
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
          {...(formData.qualityOfLife as any)}
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
          {...(formData.workImpact as any)}
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
          {...(formData.comparison as any)}
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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(formData);

      // Track pain entry submission
      const locationCount = formData.baselineData.locations?.length ?? 0;
      const symptomCount = formData.baselineData.symptoms?.length ?? 0;
      trackPainEntryLogged({
        painLevel: formData.baselineData.pain,
        hasLocation: locationCount > 0,
        hasNotes: !!formData.notes,
        locationCount,
        symptomCount,
      });
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
    <div className="max-w-4xl mx-auto rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)', border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
      <div className={`h-1 w-full bg-gradient-to-r ${currentColor.gradient}`} style={{ boxShadow: `0 0 20px ${currentColor.bg}` }} />
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl text-2xl" style={{ background: currentColor.bg, border: `1px solid ${currentColor.border}` }}>{sections[currentSection].icon}</div>
            <div>
              <h2 className="text-xl font-bold text-white">{sections[currentSection].title}</h2>
              <p className="text-slate-400 mt-1">{sections[currentSection].description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8' }}><Clock className="h-3 w-3 mr-1" />{sections[currentSection].estimatedTime}</span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${currentColor.text}`} style={{ background: currentColor.bg, border: `1px solid ${currentColor.border}` }}>{currentSection + 1} of {sections.length}</span>
          </div>
        </div>
        <div className="mt-6">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-slate-400">Progress</span>
            <span className={currentColor.text}>{Math.round(((currentSection + 1) / sections.length) * 100)}%</span>
          </div>
          <div className="w-full h-2 rounded-full" style={{ background: 'rgba(51, 65, 85, 0.5)' }}>
            <div className={`h-2 rounded-full transition-all duration-500 bg-gradient-to-r ${currentColor.gradient}`} style={{ width: `${((currentSection + 1) / sections.length) * 100}%`, boxShadow: `0 0 10px ${currentColor.bg}` }} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-5">
          {sections.map((section, index) => {
            const pillColor = sectionColors[index % sectionColors.length];
            const isActive = index === currentSection;
            const isCompleted = index < currentSection;
            return (<button key={index} onClick={() => setCurrentFormSection(index)} className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1" style={{ background: isActive ? `linear-gradient(135deg, ${pillColor.bg}, rgba(30, 41, 59, 0.9))` : isCompleted ? 'rgba(34, 197, 94, 0.15)' : 'rgba(51, 65, 85, 0.4)', border: isActive ? `1px solid ${pillColor.border}` : isCompleted ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)', color: isActive ? 'white' : isCompleted ? '#4ade80' : '#64748b', boxShadow: isActive ? `0 0 15px ${pillColor.bg}` : 'none' }} aria-label={`Go to ${section.title} section`}>{isCompleted ? <Check className="h-3 w-3" /> : <span>{section.icon}</span>}<span className="hidden sm:inline">{section.title}</span><span className="sm:hidden">{index + 1}</span></button>);
          })}
        </div>
      </div>
      <div className="px-6 pb-6">
        <form role="form" aria-label="Pain Entry Form" onSubmit={e => { e.preventDefault(); if (isLastSection && canProceedToNext) { handleSubmit(); } }} className="space-y-6">
          <div className="min-h-[400px] p-5 rounded-xl" style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>{sections[currentSection].component}</div>
          {validationIsActive && (<div className="mt-4 p-4 rounded-xl" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)' }}><EmotionalValidation text={formData.notes || ''} onValidationGenerated={handleValidationGenerated} isActive /></div>)}
          {validationIsActive && validationHistory.length > 0 && showValidationHistory && (<div className="mt-4 p-4 rounded-xl" style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)' }}><div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2 text-sm font-medium text-slate-300"><History className="h-4 w-4 text-violet-400" /><span>Recent validation moments</span></div><button type="button" onClick={() => setShowValidationHistory(false)} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Hide</button></div><ValidationHistory validations={validationHistory} onClear={clearHistory} /></div>)}
          {validationIsActive && !showValidationHistory && validationHistory.length > 0 && (<div className="mt-4"><button type="button" onClick={() => setShowValidationHistory(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-violet-400" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)' }}><History className="h-4 w-4" />Show recent validation messages</button></div>)}
          {!canProceedToNext && (<div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)' }}><AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0" /><span className="text-sm text-amber-300">Please complete the required information in this section before proceeding.</span></div>)}
          <div className="flex justify-between pt-6" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <button type="button" onClick={() => setCurrentFormSection(Math.max(0, currentSection - 1))} disabled={currentSection === 0} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed" style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid rgba(255, 255, 255, 0.1)', color: currentSection === 0 ? '#475569' : '#e2e8f0' }}><ChevronLeft className="h-4 w-4" />Previous</button>
            <div className="flex gap-3">
              {!isLastSection ? (<button type="button" onClick={() => setCurrentFormSection(Math.min(sections.length - 1, currentSection + 1))} disabled={!canProceedToNext} className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed text-white bg-gradient-to-r ${currentColor.gradient}`} style={{ boxShadow: canProceedToNext ? `0 4px 15px ${currentColor.bg}` : 'none' }}>Next<ChevronRight className="h-4 w-4" /></button>) : (<button type="submit" disabled={!canProceedToNext || isSubmitting} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed text-white min-w-[140px] justify-center" style={{ background: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)', boxShadow: canProceedToNext && !isSubmitting ? '0 4px 15px rgba(34, 197, 94, 0.3)' : 'none' }}>{isSubmitting ? (<><Loader2 className="h-4 w-4 animate-spin" />Saving...</>) : (<><Save className="h-4 w-4" />Save Entry</>)}</button>)}
            </div>
          </div>
        </form>
        {preferences.showProgress && (<div className="mt-8 pt-6" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}><div className="flex items-center justify-between mb-4"><div className="flex items-center gap-2"><div className="p-2 rounded-lg" style={{ background: 'rgba(139, 92, 246, 0.15)' }}><BarChart3 className="h-4 w-4 text-violet-400" /></div><p className="text-sm font-semibold text-slate-300">Whole-person progress tracking</p></div><button type="button" onClick={() => setShowProgressTracker(prev => !prev)} className="text-xs text-slate-500 hover:text-slate-300 transition-colors px-3 py-1 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>{showProgressTracker ? 'Hide wellness tools' : 'Show wellness tools'}</button></div>{showProgressTracker ? (<div className="space-y-3 p-4 rounded-xl" style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)' }}><HolisticProgressTracker painEntries={entries} onProgressUpdate={handleProgressUpdate} />{progressStatus === 'saving' && (<div className="flex items-center gap-2 text-xs text-slate-400"><Loader2 className="h-4 w-4 animate-spin text-violet-400" /><span>Saving wellness insights securely...</span></div>)}{progressStatus === 'saved' && (<p className="text-xs text-emerald-400">Progress entry saved with validation technology.</p>)}{progressStatus === 'error' && (<p className="text-xs text-rose-400">We could not save your progress right now. Your notes stay on this device.</p>)}</div>) : (<p className="text-xs text-slate-500">These tools celebrate growth beyond pain scores. You can open them whenever you are ready.</p>)}</div>)}
      </div>
    </div>
  );
}