import { useState } from 'react';
import type { PainEntry } from '../../types';
import { TouchOptimizedSlider } from './TouchOptimizedSlider';
import { MobileFormNavigation, useKeyboardNavigation } from './MobileFormNavigation';
import { SwipeableCards } from './SwipeableCards';
import { BodyMappingSection } from '../body-mapping/BodyMappingSection';
import { Card, CardContent } from '../../design-system';
import {
  BaselineSection,
  ComparisonSection,
  FunctionalImpactSection,
  MedicationsSection,
  QualityOfLifeSection,
  TreatmentsSection,
  WorkImpactSection,
} from '../pain-tracker/form-sections';

interface MobilePainEntryFormProps {
  onSubmit: (entry: Omit<PainEntry, "id" | "timestamp">) => void;
}

export function MobilePainEntryForm({ onSubmit }: MobilePainEntryFormProps) {
  const [currentSection, setCurrentSection] = useState(0);
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

  // Mobile-optimized sections with touch-friendly components
  const sections = [
    {
      id: 'pain-level',
      title: 'Pain Level',
      component: (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">How is your pain right now?</h3>
                <p className="text-muted-foreground">Use the slider or buttons to set your pain level</p>
              </div>
              
              <div className="py-8">
                <TouchOptimizedSlider
                  value={formData.baselineData.pain}
                  onChange={(value) => setFormData(prev => ({
                    ...prev,
                    baselineData: { ...prev.baselineData, pain: value }
                  }))}
                  min={0}
                  max={10}
                  label="Pain Level (0-10)"
                  showValue={true}
                  hapticFeedback={true}
                />
              </div>

              {/* Quick Pain Level Buttons */}
              <div className="grid grid-cols-5 gap-2">
                {[0, 2, 4, 6, 8, 10].map(level => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      baselineData: { ...prev.baselineData, pain: level }
                    }))}
                    className={`py-3 px-2 rounded-lg text-sm font-medium transition-all ${
                      formData.baselineData.pain === level
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>

              {/* Pain Level Description */}
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium">
                  {getPainLevelDescription(formData.baselineData.pain)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    },
    {
      id: 'body-mapping',
      title: 'Pain Locations',
      component: (
        <BodyMappingSection
          selectedLocations={formData.baselineData?.locations || []}
          onChange={(locations) => setFormData(prev => ({
            ...prev,
            baselineData: { ...prev.baselineData, locations }
          }))}
        />
      )
    },
    {
      id: 'symptoms',
      title: 'Symptoms',
      component: (
        <BaselineSection
          pain={formData.baselineData?.pain || 0}
          locations={formData.baselineData?.locations || []}
          symptoms={formData.baselineData?.symptoms || []}
          onChange={(data) => setFormData(prev => ({
            ...prev,
            baselineData: { ...prev.baselineData, ...data }
          }))}
        />
      )
    },
    {
      id: 'quality-of-life',
      title: 'Quality of Life',
      component: (
        <Card>
          <CardContent className="pt-6 space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">How is your sleep quality?</h3>
              <TouchOptimizedSlider
                value={formData.qualityOfLife?.sleepQuality || 0}
                onChange={(value) => setFormData(prev => ({
                  ...prev,
                  qualityOfLife: { ...prev.qualityOfLife, sleepQuality: value, moodImpact: prev.qualityOfLife?.moodImpact || 0, socialImpact: prev.qualityOfLife?.socialImpact || [] }
                }))}
                min={0}
                max={10}
                label="Sleep Quality (0=Poor, 10=Excellent)"
                showValue={true}
              />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">How much is pain affecting your mood?</h3>
              <TouchOptimizedSlider
                value={formData.qualityOfLife?.moodImpact || 0}
                onChange={(value) => setFormData(prev => ({
                  ...prev,
                  qualityOfLife: { ...prev.qualityOfLife, moodImpact: value, sleepQuality: prev.qualityOfLife?.sleepQuality || 0, socialImpact: prev.qualityOfLife?.socialImpact || [] }
                }))}
                min={0}
                max={10}
                label="Mood Impact (0=No impact, 10=Severe impact)"
                showValue={true}
              />
            </div>

            <QualityOfLifeSection
              sleepQuality={formData.qualityOfLife?.sleepQuality || 0}
              moodImpact={formData.qualityOfLife?.moodImpact || 0}
              socialImpact={formData.qualityOfLife?.socialImpact || []}
              onChange={(data) => setFormData(prev => ({
                ...prev,
                qualityOfLife: {
                  sleepQuality: data.sleepQuality ?? prev.qualityOfLife?.sleepQuality ?? 0,
                  moodImpact: data.moodImpact ?? prev.qualityOfLife?.moodImpact ?? 0,
                  socialImpact: data.socialImpact ?? prev.qualityOfLife?.socialImpact ?? []
                }
              }))}
            />
          </CardContent>
        </Card>
      )
    },
    {
      id: 'functional-impact',
      title: 'Daily Activities',
      component: (
        <FunctionalImpactSection
          limitedActivities={formData.functionalImpact?.limitedActivities || []}
          mobilityAids={formData.functionalImpact?.mobilityAids || []}
          onChange={(data) => setFormData(prev => ({
            ...prev,
            functionalImpact: {
              limitedActivities: data.limitedActivities ?? prev.functionalImpact?.limitedActivities ?? [],
              assistanceNeeded: prev.functionalImpact?.assistanceNeeded ?? [],
              mobilityAids: data.mobilityAids ?? prev.functionalImpact?.mobilityAids ?? []
            }
          }))}
        />
      )
    },
    {
      id: 'work-impact',
      title: 'Work Impact',
      component: (
        <WorkImpactSection
          missedWork={formData.workImpact?.missedWork || 0}
          modifiedDuties={formData.workImpact?.modifiedDuties || []}
          workLimitations={formData.workImpact?.workLimitations || []}
          onChange={(data) => setFormData(prev => ({
            ...prev,
            workImpact: {
              missedWork: data.missedWork ?? prev.workImpact?.missedWork ?? 0,
              modifiedDuties: data.modifiedDuties ?? prev.workImpact?.modifiedDuties ?? [],
              workLimitations: data.workLimitations ?? prev.workImpact?.workLimitations ?? []
            }
          }))}
        />
      )
    },
    {
      id: 'medications',
      title: 'Medications',
      component: (
        <MedicationsSection
          current={formData.medications?.current?.map(med => ({
            name: med.name,
            dosage: med.dosage || '',
            frequency: med.frequency || '',
            effectiveness: med.effectiveness || ''
          })) || []}
          changes={formData.medications?.changes || ''}
          effectiveness={formData.medications?.effectiveness || ''}
          onChange={(data) => setFormData(prev => ({
            ...prev,
            medications: {
              current: data.current ?? prev.medications?.current ?? [],
              changes: data.changes ?? prev.medications?.changes ?? '',
              effectiveness: data.effectiveness ?? prev.medications?.effectiveness ?? ''
            }
          }))}
        />
      )
    },
    {
      id: 'treatments',
      title: 'Treatments',
      component: (
        <TreatmentsSection
          recent={formData.treatments?.recent?.map(t => ({
            type: t.type,
            provider: t.provider || '',
            effectiveness: t.effectiveness || '',
            date: t.date || new Date().toISOString()
          })) || []}
          effectiveness={formData.treatments?.effectiveness || ''}
          planned={formData.treatments?.planned || []}
          onChange={(data) => setFormData(prev => ({
            ...prev,
            treatments: {
              recent: data.recent ?? prev.treatments?.recent ?? [],
              effectiveness: data.effectiveness ?? prev.treatments?.effectiveness ?? '',
              planned: data.planned ?? prev.treatments?.planned ?? []
            }
          }))}
        />
      )
    },
    {
      id: 'comparison',
      title: 'Comparison',
      component: (
        <ComparisonSection
          worseningSince={formData.comparison?.worseningSince || ''}
          newLimitations={formData.comparison?.newLimitations || []}
          onChange={(data) => setFormData(prev => ({
            ...prev,
            comparison: {
              worseningSince: data.worseningSince ?? prev.comparison?.worseningSince ?? '',
              newLimitations: data.newLimitations ?? prev.comparison?.newLimitations ?? []
            }
          }))}
        />
      )
    },
    {
      id: 'notes',
      title: 'Additional Notes',
      component: (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Additional Notes</h3>
              <p className="text-sm text-muted-foreground">
                Add any additional information about your pain, triggers, or observations.
              </p>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Describe any additional details about your pain, what might have triggered it, or anything else that might be helpful..."
                className="w-full h-32 p-4 border rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </CardContent>
        </Card>
      )
    }
  ];

  const handleSubmit = () => {
    onSubmit(formData);
    
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
    setCurrentSection(0);
  };

  // Enable keyboard navigation
  useKeyboardNavigation(currentSection, sections.length, setCurrentSection, handleSubmit);

  return (
    <div className="mobile-pain-entry-form h-screen flex flex-col">
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="flex-1 flex flex-col"
      >
        {/* Use SwipeableCards for touch-friendly section navigation */}
        <div className="flex-1">
          <SwipeableCards
            onCardChange={setCurrentSection}
            showIndicators={false}
            showNavigation={false}
          >
            {sections.map((section, index) => (
              <div key={section.id} className="h-full">
                <MobileFormNavigation
                  sections={sections}
                  currentSection={index}
                  onSectionChange={setCurrentSection}
                  onSubmit={handleSubmit}
                  submitLabel="Save Pain Entry"
                />
              </div>
            ))}
          </SwipeableCards>
        </div>
      </form>
    </div>
  );
}

function getPainLevelDescription(level: number): string {
  const descriptions = [
    "No pain - feeling good!",
    "Very mild pain - barely noticeable",
    "Mild pain - noticeable but not distracting", 
    "Mild pain - slightly distracting",
    "Moderate pain - can be ignored if busy",
    "Moderate pain - can't be ignored, affects some activities",
    "Moderately strong pain - interferes with normal activities",
    "Strong pain - interferes with most activities",
    "Very strong pain - difficult to concentrate",
    "Intense pain - unable to engage in normal activities",
    "Excruciating pain - bedridden and possibly delirious"
  ];
  
  return descriptions[level] || "";
}