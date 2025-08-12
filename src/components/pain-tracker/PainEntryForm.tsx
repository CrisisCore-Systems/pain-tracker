import { useState, useEffect } from "react";
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
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0])); // First section expanded by default
  const [isMobile, setIsMobile] = useState(false);
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

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const sections = [
    {
      title: "Pain Assessment",
      icon: "🩹",
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
      icon: "🚶",
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
      icon: "💊",
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
      icon: "🏥",
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
      icon: "😊",
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
      icon: "💼",
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
      icon: "📊",
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

  const toggleSection = (index: number) => {
    if (isMobile) {
      // On mobile, use accordion behavior
      const newExpanded = new Set(expandedSections);
      if (newExpanded.has(index)) {
        newExpanded.delete(index);
      } else {
        newExpanded.add(index);
      }
      setExpandedSections(newExpanded);
      setCurrentSection(index);
    } else {
      // On desktop, use tab behavior
      setCurrentSection(index);
    }
  };

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
    setExpandedSections(new Set([0]));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Form header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900" id="form-title">
              Record Pain Entry
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Track your pain levels and symptoms
            </p>
          </div>
          <div className="text-sm text-gray-500" aria-live="polite">
            {isMobile ? (
              `${expandedSections.size} of ${sections.length} sections active`
            ) : (
              `Step ${currentSection + 1} of ${sections.length}`
            )}
          </div>
        </div>
        
        {/* Progress bar - hidden on mobile accordion view */}
        {!isMobile && (
          <div className="mt-4">
            <div 
              className="overflow-hidden h-2 text-xs flex rounded bg-gray-200"
              role="progressbar"
              aria-valuenow={((currentSection + 1) / sections.length) * 100}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Form completion progress"
            >
              <div
                style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
              />
            </div>
          </div>
        )}
      </div>

      <form 
        role="form"
        aria-label="Pain Entry Form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="w-full"
      >
        {isMobile ? (
          // Mobile accordion layout
          <div className="divide-y divide-gray-200">
            {sections.map((section, index) => {
              const isExpanded = expandedSections.has(index);
              return (
                <div key={index} className="accordion-mobile">
                  <button
                    type="button"
                    onClick={() => toggleSection(index)}
                    className="accordion-mobile-header w-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset transition-colors"
                    aria-expanded={isExpanded}
                    aria-controls={`mobile-section-${index}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg" role="img" aria-hidden="true">
                        {section.icon}
                      </span>
                      <span className="font-medium text-gray-900 text-left">
                        {section.title}
                      </span>
                    </div>
                    <svg 
                      className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {isExpanded && (
                    <div 
                      id={`mobile-section-${index}`}
                      className="accordion-mobile-content"
                      role="tabpanel"
                      aria-labelledby={`mobile-section-${index}-tab`}
                    >
                      {section.component}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          // Desktop tab layout
          <div className="p-6">
            <div className="mb-6">
              <div className="flex overflow-x-auto pb-2 mb-4 scroll-mobile" role="tablist">
                {sections.map((section, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSection(index)}
                    role="tab"
                    aria-selected={currentSection === index}
                    aria-controls={`desktop-section-${index}`}
                    className={`touch-target px-4 py-2 whitespace-nowrap mx-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                      currentSection === index
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span role="img" aria-hidden="true">{section.icon}</span>
                      {section.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div 
              className="min-h-[400px]" 
              role="tabpanel" 
              id={`desktop-section-${currentSection}`} 
              aria-labelledby={`desktop-section-${currentSection}-tab`}
            >
              {sections[currentSection].component}
            </div>
          </div>
        )}

        {/* Form actions */}
        <div className="bg-gray-50 px-4 py-4 sm:px-6 border-t border-gray-200">
          {isMobile ? (
            // Mobile: Single submit button
            <div className="space-y-3">
              <button
                type="submit"
                className="touch-target-lg w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-sm"
                aria-label="Submit pain entry"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Submit Entry
                </span>
              </button>
              
              <p className="text-xs text-gray-500 text-center">
                Expand sections above to complete your pain entry
              </p>
            </div>
          ) : (
            // Desktop: Navigation buttons
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => setCurrentSection(prev => Math.max(0, prev - 1))}
                className={`touch-target px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  currentSection === 0
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900"
                }`}
                disabled={currentSection === 0}
                aria-label="Previous section"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </span>
              </button>
              
              {currentSection < sections.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentSection(prev => Math.min(sections.length - 1, prev + 1))}
                  className="touch-target bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                  aria-label="Next section"
                >
                  <span className="flex items-center gap-2">
                    Next
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </button>
              ) : (
                <button
                  type="submit"
                  className="touch-target bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-sm"
                  aria-label="Submit pain entry"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Submit Entry
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
