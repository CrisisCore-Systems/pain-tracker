import React, { useState } from 'react';
import type { PainEntry } from '../../types';

interface TemplateLibraryProps {
  onApplyTemplate: (template: Partial<PainEntry>) => void;
}

interface Template {
  id: string;
  name: string;
  category: 'worksafe-bc' | 'clinic' | 'general';
  description: string;
  icon: string;
  data: Partial<PainEntry>;
}

const WORKSAFE_BC_TEMPLATES: Template[] = [
  {
    id: 'wsbc-back-injury',
    name: 'Back Injury Assessment',
    category: 'worksafe-bc',
    description: 'Standard template for workplace back injuries',
    icon: '🏢',
    data: {
      baselineData: {
        pain: 0,
        locations: ['Lower Back', 'Upper Back'],
        symptoms: ['Muscle stiffness', 'Sharp pain', 'Limited mobility']
      },
      functionalImpact: {
        limitedActivities: ['Heavy lifting', 'Bending', 'Prolonged sitting'],
        assistanceNeeded: [],
        mobilityAids: []
      },
      workImpact: {
        missedWork: 0,
        modifiedDuties: ['No heavy lifting', 'Frequent breaks', 'Ergonomic workstation'],
        workLimitations: ['Cannot lift over 10 lbs', 'Limited bending and twisting']
      },
      comparison: {
        worseningSince: 'Work incident',
        newLimitations: ['Cannot perform usual job duties']
      }
    }
  },
  {
    id: 'wsbc-repetitive-strain',
    name: 'Repetitive Strain Injury',
    category: 'worksafe-bc',
    description: 'Template for repetitive motion workplace injuries',
    icon: '🔄',
    data: {
      baselineData: {
        pain: 0,
        locations: ['Right Arm', 'Right Hand', 'Right Shoulder'],
        symptoms: ['Tingling', 'Numbness', 'Burning sensation', 'Muscle fatigue']
      },
      functionalImpact: {
        limitedActivities: ['Typing', 'Gripping', 'Fine motor tasks'],
        assistanceNeeded: [],
        mobilityAids: ['Wrist brace', 'Ergonomic keyboard']
      },
      workImpact: {
        missedWork: 0,
        modifiedDuties: ['Reduced computer time', 'Regular breaks', 'Alternative input methods'],
        workLimitations: ['Limited typing duration', 'Cannot perform repetitive tasks']
      }
    }
  },
  {
    id: 'wsbc-head-injury',
    name: 'Head/Concussion Assessment',
    category: 'worksafe-bc',
    description: 'Template for workplace head injuries and concussions',
    icon: '🧠',
    data: {
      baselineData: {
        pain: 0,
        locations: ['Head/Neck'],
        symptoms: ['Headache', 'Dizziness', 'Nausea', 'Light sensitivity', 'Confusion']
      },
      functionalImpact: {
        limitedActivities: ['Concentration tasks', 'Screen time', 'Driving'],
        assistanceNeeded: ['Transportation', 'Task reminders'],
        mobilityAids: []
      },
      qualityOfLife: {
        sleepQuality: 0,
        moodImpact: 0,
        socialImpact: ['Avoiding social activities', 'Difficulty with conversations']
      }
    }
  }
];

const CLINIC_TEMPLATES: Template[] = [
  {
    id: 'clinic-chronic-pain',
    name: 'Chronic Pain Follow-up',
    category: 'clinic',
    description: 'Standard follow-up for chronic pain patients',
    icon: '🏥',
    data: {
      baselineData: {
        pain: 0,
        locations: [],
        symptoms: ['Chronic pain', 'Fatigue']
      },
      medications: {
        current: [],
        changes: '',
        effectiveness: ''
      },
      treatments: {
        recent: [],
        effectiveness: '',
        planned: ['Pain management consultation', 'Physical therapy assessment']
      },
      qualityOfLife: {
        sleepQuality: 0,
        moodImpact: 0,
        socialImpact: []
      }
    }
  },
  {
    id: 'clinic-post-surgery',
    name: 'Post-Surgical Recovery',
    category: 'clinic',
    description: 'Template for post-operative pain assessment',
    icon: '⚕️',
    data: {
      baselineData: {
        pain: 0,
        locations: [],
        symptoms: ['Surgical site pain', 'Swelling', 'Limited mobility']
      },
      functionalImpact: {
        limitedActivities: ['Physical activity', 'Heavy lifting'],
        assistanceNeeded: ['Daily activities', 'Transportation'],
        mobilityAids: []
      },
      treatments: {
        recent: [],
        effectiveness: '',
        planned: ['Surgical follow-up', 'Physical therapy']
      }
    }
  },
  {
    id: 'clinic-arthritis',
    name: 'Arthritis Management',
    category: 'clinic',
    description: 'Template for arthritis pain tracking',
    icon: '🦴',
    data: {
      baselineData: {
        pain: 0,
        locations: ['Joints'],
        symptoms: ['Joint stiffness', 'Swelling', 'Morning stiffness']
      },
      functionalImpact: {
        limitedActivities: ['Fine motor tasks', 'Walking', 'Stairs'],
        assistanceNeeded: [],
        mobilityAids: []
      },
      qualityOfLife: {
        sleepQuality: 0,
        moodImpact: 0,
        socialImpact: ['Reduced social activities']
      }
    }
  }
];

const GENERAL_TEMPLATES: Template[] = [
  {
    id: 'general-headache',
    name: 'Headache/Migraine',
    category: 'general',
    description: 'General template for headache tracking',
    icon: '🤕',
    data: {
      baselineData: {
        pain: 0,
        locations: ['Head/Neck'],
        symptoms: ['Headache', 'Light sensitivity', 'Nausea']
      },
      qualityOfLife: {
        sleepQuality: 0,
        moodImpact: 0,
        socialImpact: ['Avoiding bright lights', 'Cancelled activities']
      }
    }
  },
  {
    id: 'general-sports-injury',
    name: 'Sports Injury',
    category: 'general',
    description: 'Template for sports-related injuries',
    icon: '⚽',
    data: {
      baselineData: {
        pain: 0,
        locations: [],
        symptoms: ['Acute pain', 'Swelling', 'Limited range of motion']
      },
      functionalImpact: {
        limitedActivities: ['Sports activities', 'Exercise'],
        assistanceNeeded: [],
        mobilityAids: []
      },
      treatments: {
        recent: [],
        effectiveness: '',
        planned: ['RICE protocol', 'Physical therapy assessment']
      }
    }
  }
];

type CategoryType = 'all' | 'worksafe-bc' | 'clinic' | 'general';

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({ onApplyTemplate }) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const allTemplates = [...WORKSAFE_BC_TEMPLATES, ...CLINIC_TEMPLATES, ...GENERAL_TEMPLATES];
  const filteredTemplates = selectedCategory === 'all' 
    ? allTemplates 
    : allTemplates.filter(t => t.category === selectedCategory);

  const handleApplyTemplate = (template: Template) => {
    onApplyTemplate(template.data);
    setSelectedTemplate(null);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'worksafe-bc': return 'bg-blue-100 text-blue-800';
      case 'clinic': return 'bg-green-100 text-green-800';
      case 'general': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <span role="img" aria-label="templates">📋</span>
        Template Library
      </h2>

      <div className="space-y-6">
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Category
          </label>
          <div className="flex flex-wrap gap-2">
            {([
              { value: 'all', label: 'All Templates' },
              { value: 'worksafe-bc', label: 'WorkSafe BC' },
              { value: 'clinic', label: 'Clinical' },
              { value: 'general', label: 'General' }
            ] as Array<{ value: CategoryType; label: string }>).map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-3 py-1 rounded-full text-sm border ${
                  selectedCategory === category.value
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedTemplate(template)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl" role="img" aria-hidden="true">
                    {template.icon}
                  </span>
                  <h3 className="font-medium text-gray-900">{template.name}</h3>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(template.category)}`}>
                  {template.category === 'worksafe-bc' ? 'WorkSafe BC' : 
                   template.category === 'clinic' ? 'Clinical' : 'General'}
                </span>
              </div>
              <p className="text-sm text-gray-600">{template.description}</p>
            </div>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No templates found in this category.
          </div>
        )}
      </div>

      {/* Template Preview Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl" role="img" aria-hidden="true">
                    {selectedTemplate.icon}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold">{selectedTemplate.name}</h3>
                    <p className="text-sm text-gray-600">{selectedTemplate.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Template Preview */}
              <div className="space-y-4 mb-6">
                <h4 className="font-medium">Template includes:</h4>
                <div className="space-y-3 text-sm">
                  {selectedTemplate.data.baselineData && (
                    <div>
                      <div className="font-medium text-gray-700">Pain Assessment:</div>
                      <div className="ml-4">
                        {selectedTemplate.data.baselineData.locations?.length > 0 && (
                          <div>• Locations: {selectedTemplate.data.baselineData.locations.join(', ')}</div>
                        )}
                        {selectedTemplate.data.baselineData.symptoms?.length > 0 && (
                          <div>• Symptoms: {selectedTemplate.data.baselineData.symptoms.join(', ')}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedTemplate.data.functionalImpact && (
                    <div>
                      <div className="font-medium text-gray-700">Functional Impact:</div>
                      <div className="ml-4">
                        {selectedTemplate.data.functionalImpact.limitedActivities?.length > 0 && (
                          <div>• Limited activities: {selectedTemplate.data.functionalImpact.limitedActivities.join(', ')}</div>
                        )}
                        {selectedTemplate.data.functionalImpact.mobilityAids?.length > 0 && (
                          <div>• Mobility aids: {selectedTemplate.data.functionalImpact.mobilityAids.join(', ')}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedTemplate.data.workImpact && (
                    <div>
                      <div className="font-medium text-gray-700">Work Impact:</div>
                      <div className="ml-4">
                        {selectedTemplate.data.workImpact.modifiedDuties?.length > 0 && (
                          <div>• Modified duties: {selectedTemplate.data.workImpact.modifiedDuties.join(', ')}</div>
                        )}
                        {selectedTemplate.data.workImpact.workLimitations?.length > 0 && (
                          <div>• Work limitations: {selectedTemplate.data.workImpact.workLimitations.join(', ')}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleApplyTemplate(selectedTemplate)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Apply Template
                </button>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
