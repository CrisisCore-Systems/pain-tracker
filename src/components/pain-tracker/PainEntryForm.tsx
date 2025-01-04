import { useState } from "react";
import type { PainEntry } from "../../types";
import {
  BaselineSection,
  ComparisonSection,
  FunctionalImpactSection,
  MedicationsSection,
  QualityOfLifeSection,
  TreatmentsSection,
  WorkImpactSection,
} from "./form-sections";

interface PainEntryFormProps {
  onSubmit: (entry: Omit<PainEntry, "id" | "timestamp">) => void;
}

export function PainEntryForm({ onSubmit }: PainEntryFormProps) {
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

  const sections = [
    {
      title: "Pain Assessment",
      component: (
        <BaselineSection
          {...formData.baselineData}
          onChange={(data) => setFormData(prev => ({
            ...prev,
            baselineData: { ...prev.baselineData, ...data }
          }))}
        />
      ),
    },
    {
      title: "Functional Impact",
      component: (
        <FunctionalImpactSection
          {...formData.functionalImpact}
          onChange={(data) => setFormData(prev => ({
            ...prev,
            functionalImpact: { ...prev.functionalImpact, ...data }
          }))}
        />
      ),
    },
    {
      title: "Medications",
      component: (
        <MedicationsSection
          {...formData.medications}
          onChange={(data) => setFormData(prev => ({
            ...prev,
            medications: { ...prev.medications, ...data }
          }))}
        />
      ),
    },
    {
      title: "Treatments",
      component: (
        <TreatmentsSection
          {...formData.treatments}
          onChange={(data) => setFormData(prev => ({
            ...prev,
            treatments: { ...prev.treatments, ...data }
          }))}
        />
      ),
    },
    {
      title: "Quality of Life",
      component: (
        <QualityOfLifeSection
          {...formData.qualityOfLife}
          onChange={(data) => setFormData(prev => ({
            ...prev,
            qualityOfLife: { ...prev.qualityOfLife, ...data }
          }))}
        />
      ),
    },
    {
      title: "Work Impact",
      component: (
        <WorkImpactSection
          {...formData.workImpact}
          onChange={(data) => setFormData(prev => ({
            ...prev,
            workImpact: { ...prev.workImpact, ...data }
          }))}
        />
      ),
    },
    {
      title: "Comparison",
      component: (
        <ComparisonSection
          {...formData.comparison}
          onChange={(data) => setFormData(prev => ({
            ...prev,
            comparison: { ...prev.comparison, ...data }
          }))}
        />
      ),
    },
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

  return (
    <form 
      role="form"
      aria-label="Pain Entry Form"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className="bg-white p-6 rounded-lg shadow-md"
    >
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold" id="form-title">Record Pain Entry</h2>
          <div className="text-sm text-gray-500" aria-live="polite">
            Step {currentSection + 1} of {sections.length}
          </div>
        </div>
        
        <div className="relative mb-4">
          <div 
            className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200"
            role="progressbar"
            aria-valuenow={((currentSection + 1) / sections.length) * 100}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Form completion progress"
          >
            <div
              style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
            />
          </div>
        </div>

        <div className="flex overflow-x-auto pb-2 mb-4" role="tablist">
          {sections.map((section, index) => (
            <button
              key={index}
              onClick={() => setCurrentSection(index)}
              role="tab"
              aria-selected={currentSection === index}
              aria-controls={`section-${index}`}
              className={`px-4 py-2 whitespace-nowrap mx-1 rounded-full text-sm ${
                currentSection === index
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {section.title}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6" role="tabpanel" id={`section-${currentSection}`} aria-labelledby={`section-${currentSection}-tab`}>
        {sections[currentSection].component}
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => setCurrentSection(prev => Math.max(0, prev - 1))}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            currentSection === 0
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          disabled={currentSection === 0}
          aria-label="Previous section"
        >
          Previous
        </button>
        
        {currentSection < sections.length - 1 ? (
          <button
            type="button"
            onClick={() => setCurrentSection(prev => Math.min(sections.length - 1, prev + 1))}
            className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 ml-auto"
            aria-label="Next section"
          >
            Next
          </button>
        ) : (
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-md hover:bg-green-600 ml-auto"
            aria-label="Submit pain entry"
          >
            Submit Entry
          </button>
        )}
      </div>
    </form>
  );
}
