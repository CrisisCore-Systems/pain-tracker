import { useCallback, useEffect, useMemo, useState } from "react";
import type { PainEntry } from "../../types";
import { usePainTrackerStore } from "../../stores/pain-tracker-store";
import {
  BaselineSection,
  ComparisonSection,
  FunctionalImpactSection,
  MedicationsSection,
  QualityOfLifeSection,
  TreatmentsSection,
  WorkImpactSection,
} from "./form-sections";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Loading } from '../../design-system';
// Optional validation technology integration (feature-flagged)
import {
  EmotionalValidation,
  HolisticProgressTracker,
  ValidationHistory,
  useEmotionalValidation,
  validationIntegration,
  type ProgressEntry,
} from '../../validation-technology';
import { ChevronLeft, ChevronRight, Check, Save, Clock, AlertCircle, BarChart3, History, Loader2 } from 'lucide-react';
import { useTraumaInformed } from '../accessibility/TraumaInformedHooks';
import type { ValidationResponse } from '../../services/EmotionalValidationService';

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
  return env.VITE_REACT_APP_ENABLE_VALIDATION !== 'false' && env.REACT_APP_ENABLE_VALIDATION !== 'false';
})();

interface PainEntryFormProps {
  onSubmit: (entry: Omit<PainEntry, "id" | "timestamp">) => void;
}

export function PainEntryForm({ onSubmit }: PainEntryFormProps) {
  const { ui, setCurrentFormSection } = usePainTrackerStore();
  const entries = usePainTrackerStore((state) => state.entries);
  const currentSection = ui.currentFormSection;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { preferences } = useTraumaInformed();
  const { validationHistory, addValidation, clearHistory } = useEmotionalValidation();
  const [showValidationHistory, setShowValidationHistory] = useState(true);
  const [showProgressTracker, setShowProgressTracker] = useState(preferences.showProgress);
  const [progressStatus, setProgressStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [formData, setFormData] = useState<Omit<PainEntry, "id" | "timestamp">>({
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
      changes: "",
      effectiveness: "",
    },
    treatments: {
      recent: [],
      effectiveness: "",
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
      worseningSince: "",
      newLimitations: [],
    },
    notes: "",
  });

  useEffect(() => {
    setShowProgressTracker(preferences.showProgress);
  }, [preferences.showProgress]);

  const handleValidationGenerated = useCallback(async (validation: ValidationResponse) => {
    addValidation(validation);
    try {
      await validationIntegration.saveValidation(validation);
    } catch (error) {
      console.error('Failed to persist validation message', error);
    }
  }, [addValidation, validationIntegration]);

  const handleProgressUpdate = useCallback(async (entry: ProgressEntry) => {
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
  }, [validationIntegration]);

  const validationIsActive = useMemo(() => ENABLE_VALIDATION && preferences.realTimeValidation, [preferences.realTimeValidation]);

  const sections = [
    {
      title: "Pain Assessment",
      description: "Rate your current pain and identify affected areas",
      icon: "🎯",
      component: (
        <BaselineSection
          {...formData.baselineData}
          locations={formData.baselineData.locations || []}
          symptoms={formData.baselineData.symptoms || []}
          onChange={(data) => setFormData(prev => ({
            ...prev,
            baselineData: { ...prev.baselineData, ...data }
          }))}
        />
      ),
      required: true,
      estimatedTime: "2 min",
    },
    {
      title: "Functional Impact",
      description: "How is pain affecting your daily activities?",
      icon: "🏃",
      component: (
        <FunctionalImpactSection
          limitedActivities={formData.functionalImpact?.limitedActivities || []}
          mobilityAids={formData.functionalImpact?.mobilityAids || []}
          onChange={(data) => setFormData(prev => ({
            ...prev,
            functionalImpact: { ...prev.functionalImpact, ...data }
          } as Omit<PainEntry, "id" | "timestamp">))}
        />
      ),
      required: false,
      estimatedTime: "3 min",
    },
    {
      title: "Medications",
      description: "Track your current medications and their effectiveness",
      icon: "💊",
      component: (
        <MedicationsSection
          {...(formData.medications as any)}
          onChange={(data) => setFormData(prev => ({
            ...prev,
            medications: { ...prev.medications, ...data }
          } as Omit<PainEntry, "id" | "timestamp">))}
        />
      ),
      required: false,
      estimatedTime: "2 min",
    },
    {
      title: "Treatments",
      description: "Document recent treatments and their outcomes",
      icon: "🏥",
      component: (
        <TreatmentsSection
          {...(formData.treatments as any)}
          onChange={(data) => setFormData(prev => ({
            ...prev,
            treatments: { ...prev.treatments, ...data }
          } as Omit<PainEntry, "id" | "timestamp">))}
        />
      ),
      required: false,
      estimatedTime: "3 min",
    },
    {
      title: "Quality of Life",
      description: "How is pain affecting your sleep, mood, and social life?",
      icon: "😴",
      component: (
        <QualityOfLifeSection
          {...(formData.qualityOfLife as any)}
          onChange={(data) => setFormData(prev => ({
            ...prev,
            qualityOfLife: { ...prev.qualityOfLife, ...data }
          } as Omit<PainEntry, "id" | "timestamp">))}
        />
      ),
      required: false,
      estimatedTime: "2 min",
    },
    {
      title: "Work Impact",
      description: "How has pain affected your work and productivity?",
      icon: "💼",
      component: (
        <WorkImpactSection
          {...(formData.workImpact as any)}
          onChange={(data) => setFormData(prev => ({
            ...prev,
            workImpact: { ...prev.workImpact, ...data }
          } as Omit<PainEntry, "id" | "timestamp">))}
        />
      ),
      required: false,
      estimatedTime: "2 min",
    },
    {
      title: "Comparison",
      description: "Compare your current condition to previous assessments",
      icon: "📊",
      component: (
        <ComparisonSection
          {...(formData.comparison as any)}
          onChange={(data) => setFormData(prev => ({
            ...prev,
            comparison: { ...prev.comparison, ...data }
          } as Omit<PainEntry, "id" | "timestamp">))}
        />
      ),
      required: false,
      estimatedTime: "2 min",
    },
  ];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(formData);

      // Reset form
      setFormData({
        baselineData: { pain: 0, locations: [], symptoms: [] },
        functionalImpact: { limitedActivities: [], assistanceNeeded: [], mobilityAids: [] },
        medications: { current: [], changes: "", effectiveness: "" },
        treatments: { recent: [], effectiveness: "", planned: [] },
        qualityOfLife: { sleepQuality: 0, moodImpact: 0, socialImpact: [] },
        workImpact: { missedWork: 0, modifiedDuties: [], workLimitations: [] },
        comparison: { worseningSince: "", newLimitations: [] },
        notes: "",
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

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <span className="text-2xl">{sections[currentSection].icon}</span>
              <span>{sections[currentSection].title}</span>
            </CardTitle>
            <p className="text-muted-foreground mt-1">
              {sections[currentSection].description}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {sections[currentSection].estimatedTime}
            </Badge>
            <Badge variant="secondary">
              {currentSection + 1} of {sections.length}
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Progress</span>
            <span>{Math.round(((currentSection + 1) / sections.length) * 100)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Section Navigation Pills */}
        <div className="flex flex-wrap gap-2 mt-4">
          {sections.map((section, index) => (
            <button
              key={index}
              onClick={() => setCurrentFormSection(index)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                index === currentSection
                  ? 'bg-primary text-primary-foreground'
                  : index < currentSection
                  ? 'bg-success text-success-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
              aria-label={`Go to ${section.title} section`}
            >
              {index < currentSection ? (
                <Check className="h-3 w-3 inline mr-1" />
              ) : (
                <span className="mr-1">{section.icon}</span>
              )}
              <span className="hidden sm:inline">{section.title}</span>
              <span className="sm:hidden">{index + 1}</span>
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <form
          role="form"
          aria-label="Pain Entry Form"
          onSubmit={(e) => {
            e.preventDefault();
            if (isLastSection && canProceedToNext) {
              handleSubmit();
            }
          }}
          className="space-y-6"
        >
          {/* Current Section Content */}
          <div className="min-h-[400px]">
            {sections[currentSection].component}
          </div>

          {/* Emotional validation panel (read-only, feature-flagged) */}
          {validationIsActive && (
            <div className="mt-4">
              <EmotionalValidation
                text={formData.notes || ''}
                onValidationGenerated={handleValidationGenerated}
                isActive
              />
            </div>
          )}

          {validationIsActive && validationHistory.length > 0 && showValidationHistory && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                  <History className="h-4 w-4" />
                  <span>Recent validation moments</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowValidationHistory(false)}
                >
                  Hide
                </Button>
              </div>
              <ValidationHistory validations={validationHistory} onClear={clearHistory} />
            </div>
          )}

          {validationIsActive && !showValidationHistory && validationHistory.length > 0 && (
            <div className="mt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowValidationHistory(true)}
                leftIcon={<History className="h-4 w-4" />}
              >
                Show recent validation messages
              </Button>
            </div>
          )}

          {/* Validation Message */}
          {!canProceedToNext && (
            <div className="flex items-center space-x-2 p-3 bg-warning/10 border border-warning/20 rounded-lg">
              <AlertCircle className="h-4 w-4 text-warning" />
              <span className="text-sm text-warning">
                Please complete the required information in this section before proceeding.
              </span>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentFormSection(Math.max(0, currentSection - 1))}
              disabled={currentSection === 0}
              leftIcon={<ChevronLeft className="h-4 w-4" />}
            >
              Previous
            </Button>

            <div className="flex space-x-3">
              {!isLastSection ? (
                <Button
                  type="button"
                  onClick={() => setCurrentFormSection(Math.min(sections.length - 1, currentSection + 1))}
                  disabled={!canProceedToNext}
                  rightIcon={<ChevronRight className="h-4 w-4" />}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={!canProceedToNext || isSubmitting}
                  leftIcon={isSubmitting ? undefined : <Save className="h-4 w-4" />}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loading size="sm" className="mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Save Entry'
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>

        {preferences.showProgress && (
          <div className="mt-8 border-t pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold text-muted-foreground">Whole-person progress tracking</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowProgressTracker((prev) => !prev)}
              >
                {showProgressTracker ? 'Hide wellness tools' : 'Show wellness tools'}
              </Button>
            </div>

            {showProgressTracker ? (
              <div className="space-y-3">
                <HolisticProgressTracker
                  painEntries={entries}
                  onProgressUpdate={handleProgressUpdate}
                />
                {progressStatus === 'saving' && (
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving wellness insights securely…</span>
                  </div>
                )}
                {progressStatus === 'saved' && (
                  <p className="text-xs text-success">Progress entry saved with validation technology.</p>
                )}
                {progressStatus === 'error' && (
                  <p className="text-xs text-destructive">We couldn’t save your progress right now. Your notes stay on this device.</p>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                These tools celebrate growth beyond pain scores. You can open them whenever you’re ready.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
