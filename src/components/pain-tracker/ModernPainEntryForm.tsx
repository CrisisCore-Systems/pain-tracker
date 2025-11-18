/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { useState, useCallback } from 'react';
import {
  Activity,
  Heart,
  Pill,
  Stethoscope,
  Moon,
  Briefcase,
  TrendingUp,
  Save,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  X,
} from 'lucide-react';
import { cn } from '../../design-system/utils';
import { Button, Badge } from '../../design-system';
import type { PainEntry } from '../../types';
import {
  BaselineSection,
  ComparisonSection,
  FunctionalImpactSection,
  MedicationsSection,
  QualityOfLifeSection,
  TreatmentsSection,
  WorkImpactSection,
} from './form-sections';

interface ModernPainEntryFormProps {
  onSubmit: (entry: Omit<PainEntry, 'id' | 'timestamp'>) => void;
  onCancel?: () => void;
}

const sections = [
  {
    id: 'baseline',
    title: 'Pain Level',
    subtitle: 'How are you feeling right now?',
    icon: Activity,
    color: 'from-red-500 to-orange-500',
    bgColor: 'bg-red-50 dark:bg-red-950/20',
    borderColor: 'border-red-200 dark:border-red-800',
    required: true,
  },
  {
    id: 'functional',
    title: 'Daily Activities',
    subtitle: 'What activities are affected?',
    icon: Heart,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    required: false,
  },
  {
    id: 'medications',
    title: 'Medications',
    subtitle: 'Current treatments & effectiveness',
    icon: Pill,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    required: false,
  },
  {
    id: 'treatments',
    title: 'Treatments',
    subtitle: 'Recent appointments & therapies',
    icon: Stethoscope,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
    borderColor: 'border-green-200 dark:border-green-800',
    required: false,
  },
  {
    id: 'quality',
    title: 'Quality of Life',
    subtitle: 'Sleep, mood, and social impact',
    icon: Moon,
    color: 'from-indigo-500 to-purple-500',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/20',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
    required: false,
  },
  {
    id: 'work',
    title: 'Work Impact',
    subtitle: 'How pain affects your work',
    icon: Briefcase,
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-50 dark:bg-amber-950/20',
    borderColor: 'border-amber-200 dark:border-amber-800',
    required: false,
  },
  {
    id: 'comparison',
    title: 'Changes',
    subtitle: 'Notable changes since last entry',
    icon: TrendingUp,
    color: 'from-teal-500 to-cyan-500',
    bgColor: 'bg-teal-50 dark:bg-teal-950/20',
    borderColor: 'border-teal-200 dark:border-teal-800',
    required: false,
  },
];

export function ModernPainEntryForm({ onSubmit, onCancel }: ModernPainEntryFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

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

  const currentSection = sections[currentStep];

  const handleNext = useCallback(() => {
    setCompletedSteps(prev => new Set(prev).add(currentStep));
    if (currentStep < sections.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSection = () => {
    switch (sections[currentStep].id) {
      case 'baseline':
        return (
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
        );
      case 'functional':
        return (
          <FunctionalImpactSection
            limitedActivities={formData.functionalImpact.limitedActivities}
            assistanceNeeded={formData.functionalImpact.assistanceNeeded}
            mobilityAids={formData.functionalImpact.mobilityAids}
            onChange={data =>
              setFormData(prev => ({
                ...prev,
                functionalImpact: { ...prev.functionalImpact, ...data },
              }))
            }
          />
        );
      case 'medications':
        return (
          <MedicationsSection
            current={formData.medications.current}
            changes={formData.medications.changes}
            effectiveness={formData.medications.effectiveness}
            onChange={data =>
              setFormData(prev => ({
                ...prev,
                medications: { ...prev.medications, ...data },
              }))
            }
          />
        );
      case 'treatments':
        return (
          <TreatmentsSection
            recent={formData.treatments.recent}
            effectiveness={formData.treatments.effectiveness}
            planned={formData.treatments.planned}
            onChange={data =>
              setFormData(prev => ({
                ...prev,
                treatments: { ...prev.treatments, ...data },
              }))
            }
          />
        );
      case 'quality':
        return (
          <QualityOfLifeSection
            sleepQuality={formData.qualityOfLife.sleepQuality}
            moodImpact={formData.qualityOfLife.moodImpact}
            socialImpact={formData.qualityOfLife.socialImpact}
            onChange={data =>
              setFormData(prev => ({
                ...prev,
                qualityOfLife: { ...prev.qualityOfLife, ...data },
              }))
            }
          />
        );
      case 'work':
        return (
          <WorkImpactSection
            missedWork={formData.workImpact.missedWork}
            modifiedDuties={formData.workImpact.modifiedDuties}
            workLimitations={formData.workImpact.workLimitations}
            onChange={data =>
              setFormData(prev => ({
                ...prev,
                workImpact: { ...prev.workImpact, ...data },
              }))
            }
          />
        );
      case 'comparison':
        return (
          <ComparisonSection
            worseningSince={formData.comparison.worseningSince}
            newLimitations={formData.comparison.newLimitations}
            onChange={data =>
              setFormData(prev => ({
                ...prev,
                comparison: { ...prev.comparison, ...data },
              }))
            }
          />
        );
      default:
        return null;
    }
  };

  const progress = ((currentStep + 1) / sections.length) * 100;

  return (
    <div className="relative">
      {/* Progress Header */}
      <div className="mb-8">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Step {currentStep + 1} of {sections.length}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {Math.round(progress)}% complete
            </span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
          {sections.map((section, index) => {
            const Icon = section.icon;
            const isActive = index === currentStep;
            const isCompleted = completedSteps.has(index);

            return (
              <button
                key={section.id}
                onClick={() => setCurrentStep(index)}
                className={cn(
                  'flex flex-col items-center gap-1 p-2 rounded-xl transition-all min-w-[80px]',
                  isActive && 'bg-white dark:bg-gray-800 shadow-lg',
                  !isActive && 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                )}
              >
                <div
                  className={cn(
                    'relative p-2 rounded-lg transition-all',
                    isActive && `bg-gradient-to-br ${section.color} shadow-lg`,
                    !isActive && isCompleted && 'bg-green-100 dark:bg-green-950/30',
                    !isActive && !isCompleted && 'bg-gray-100 dark:bg-gray-800'
                  )}
                >
                  {isCompleted && !isActive ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <Icon
                      className={cn(
                        'h-4 w-4',
                        isActive && 'text-white',
                        !isActive && isCompleted && 'text-green-600 dark:text-green-400',
                        !isActive && !isCompleted && 'text-gray-400'
                      )}
                    />
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs font-medium text-center',
                    isActive && 'text-gray-900 dark:text-white',
                    !isActive && 'text-gray-500 dark:text-gray-400'
                  )}
                >
                  {section.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Section */}
      <div
        className={cn(
          'rounded-2xl border-2 p-6 mb-6 transition-all',
          currentSection.bgColor,
          currentSection.borderColor
        )}
      >
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-xl bg-gradient-to-br ${currentSection.color}`}>
              {(() => {
                const Icon = currentSection.icon;
                return <Icon className="h-5 w-5 text-white" />;
              })()}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {currentSection.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{currentSection.subtitle}</p>
            </div>
            {currentSection.required && (
              <Badge variant="destructive" className="ml-auto rounded-full">
                Required
              </Badge>
            )}
          </div>
        </div>

        {/* Section Content */}
        <div className="bg-white dark:bg-gray-900/50 rounded-xl p-6 shadow-sm">
          {renderSection()}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2">
          {currentStep > 0 && (
            <Button onClick={handleBack} variant="outline" className="rounded-xl">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}

          {onCancel && (
            <Button onClick={onCancel} variant="ghost" className="rounded-xl">
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          {currentStep < sections.length - 1 ? (
            <Button
              onClick={handleNext}
              className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30"
            >
              <span>Continue</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/30"
            >
              {isSubmitting ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  <span>Save Entry</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Quick Skip Option */}
      {!currentSection.required && currentStep < sections.length - 1 && (
        <div className="mt-4 text-center">
          <button
            onClick={handleNext}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            Skip this section →
          </button>
        </div>
      )}
    </div>
  );
}

export default ModernPainEntryForm;
