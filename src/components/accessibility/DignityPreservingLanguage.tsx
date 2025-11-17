import React, { useState } from 'react';
import {
  MessageCircle,
  Heart,
  Users,
  BookOpen,
  Lightbulb,
  Star,
  Sparkles,
  ChevronRight,
  Check,
} from 'lucide-react';
import { TouchOptimizedButton } from './TraumaInformedUX';

// Language preference types
interface LanguagePreference {
  id: string;
  label: string;
  description: string;
  example: string;
  category: 'tone' | 'perspective' | 'formality' | 'focus';
}

interface DignityPreservingLanguageProps {
  onLanguagePreferenceChange?: (preference: LanguagePreference) => void;
  onLanguageCustomization?: (setting: string, value: string) => void;
  currentLanguageSettings?: Record<string, string>;
  className?: string;
}

// Dignified language alternatives
const languageTransformations = {
  // Person-first language
  clinical: {
    'pain level': "how you're feeling",
    symptoms: "what you're experiencing",
    condition: 'situation',
    patient: 'person',
    case: 'your experience',
    compliance: 'your choices',
    'non-compliant': 'choosing different approaches',
    'failed treatment': "treatment that didn't work for you",
    'chronic pain': 'ongoing pain',
    'suffering from': 'living with',
    'victim of': 'person experiencing',
    burden: 'challenge',
    disability: 'different ability',
  },

  // Empowering alternatives
  empowering: {
    'you failed to': "this approach didn't work",
    'you should': 'you might consider',
    'you must': 'it could be helpful to',
    'you need to': 'you have the option to',
    required: 'recommended',
    mandatory: 'suggested',
    orders: 'suggestions',
    instructions: 'guidance',
    rules: 'helpful approaches',
    wrong: 'different',
    bad: 'challenging',
    'good patient': 'taking care of yourself',
    'poor compliance': 'exploring what works for you',
  },

  // Strength-based language
  strengthBased: {
    'struggling with': 'working through',
    "can't handle": 'finding ways to manage',
    broken: 'healing',
    damaged: 'recovering',
    'limited by': 'adapting to',
    'prevented from': 'finding new ways to',
    'unable to': 'learning different approaches to',
    weak: 'building strength',
    failure: 'learning experience',
    setback: 'temporary challenge',
    relapse: 'part of the journey',
    'lost progress': 'exploring different paths',
  },
};

// Language preference options
const languagePreferences: LanguagePreference[] = [
  {
    id: 'warm-supportive',
    label: 'Warm & Supportive',
    description: 'Caring, encouraging language that feels like talking to a trusted friend',
    example: '"You\'re doing such important work taking care of yourself today."',
    category: 'tone',
  },
  {
    id: 'professional-respectful',
    label: 'Professional & Respectful',
    description: 'Courteous, dignified language that maintains appropriate boundaries',
    example: '"Thank you for sharing this information to help guide your care."',
    category: 'tone',
  },
  {
    id: 'gentle-nurturing',
    label: 'Gentle & Nurturing',
    description: 'Soft, comforting language that provides emotional safety',
    example: '"Take your time. There\'s no rush, and whatever you\'re feeling is valid."',
    category: 'tone',
  },
  {
    id: 'person-first',
    label: 'Person-First Language',
    description: 'Language that sees you as a whole person, not defined by pain or condition',
    example: '"Person experiencing chronic pain" rather than "chronic pain patient"',
    category: 'perspective',
  },
  {
    id: 'strength-focused',
    label: 'Strength-Focused',
    description: 'Language that highlights your resilience, capabilities, and growth',
    example: '"You\'re building new skills in pain management" vs "You\'re struggling with pain"',
    category: 'perspective',
  },
  {
    id: 'collaborative',
    label: 'Collaborative Partnership',
    description: 'Language that positions you as the expert on your own experience',
    example: '"What approach feels right for you?" rather than "You should do this"',
    category: 'perspective',
  },
  {
    id: 'conversational',
    label: 'Conversational',
    description: 'Relaxed, everyday language that feels natural and accessible',
    example: '"How are you feeling today?" instead of "Rate your pain level"',
    category: 'formality',
  },
  {
    id: 'mindful-precise',
    label: 'Mindful & Precise',
    description: 'Thoughtfully chosen words that honor the complexity of your experience',
    example: '"The pain you\'re experiencing" rather than "your pain problem"',
    category: 'formality',
  },
  {
    id: 'hope-oriented',
    label: 'Hope-Oriented',
    description: 'Language that acknowledges challenges while maintaining optimism',
    example: '"This is a difficult time, and you\'re finding ways to move forward"',
    category: 'focus',
  },
  {
    id: 'present-focused',
    label: 'Present-Focused',
    description: 'Language that stays grounded in the current moment without judgment',
    example: '"Right now, in this moment, you\'re taking steps to care for yourself"',
    category: 'focus',
  },
];

export function DignityPreservingLanguage({
  onLanguagePreferenceChange,
  className = '',
}: DignityPreservingLanguageProps) {
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [showLanguageExamples, setShowLanguageExamples] = useState(false);

  const handlePreferenceSelect = (preference: LanguagePreference) => {
    const isSelected = selectedPreferences.includes(preference.id);
    const updatedPreferences = isSelected
      ? selectedPreferences.filter(id => id !== preference.id)
      : [...selectedPreferences, preference.id];

    setSelectedPreferences(updatedPreferences);

    if (onLanguagePreferenceChange) {
      onLanguagePreferenceChange(preference);
    }
  };

  return (
    <div
      className={`bg-white border border-gray-200 dark:border-gray-700 rounded-lg p-6 ${className}`}
    >
      <div className="flex items-start space-x-3 mb-6">
        <div className="p-2 bg-purple-100 rounded-lg">
          <MessageCircle className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Dignity-Preserving Language
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Choose language that honors your whole person, not just your pain. These settings help
            ensure all communication feels respectful, empowering, and humanizing.
          </p>
        </div>
      </div>

      {/* Language Tone Preferences */}
      <LanguagePreferenceSection
        title="Communication Tone"
        icon={Heart}
        preferences={languagePreferences.filter(p => p.category === 'tone')}
        selectedPreferences={selectedPreferences}
        onPreferenceSelect={handlePreferenceSelect}
      />

      {/* Perspective Preferences */}
      <LanguagePreferenceSection
        title="Perspective & Approach"
        icon={Users}
        preferences={languagePreferences.filter(p => p.category === 'perspective')}
        selectedPreferences={selectedPreferences}
        onPreferenceSelect={handlePreferenceSelect}
      />

      {/* Formality Preferences */}
      <LanguagePreferenceSection
        title="Communication Style"
        icon={BookOpen}
        preferences={languagePreferences.filter(p => p.category === 'formality')}
        selectedPreferences={selectedPreferences}
        onPreferenceSelect={handlePreferenceSelect}
      />

      {/* Focus Preferences */}
      <LanguagePreferenceSection
        title="Focus & Framing"
        icon={Lightbulb}
        preferences={languagePreferences.filter(p => p.category === 'focus')}
        selectedPreferences={selectedPreferences}
        onPreferenceSelect={handlePreferenceSelect}
      />

      {/* Language Examples Toggle */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <TouchOptimizedButton
          variant="secondary"
          onClick={() => setShowLanguageExamples(!showLanguageExamples)}
          className="w-full flex items-center justify-between p-4"
        >
          <span className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5" />
            <span>View Language Transformation Examples</span>
          </span>
          <ChevronRight
            className={`w-5 h-5 transition-transform ${showLanguageExamples ? 'rotate-90' : ''}`}
          />
        </TouchOptimizedButton>

        {showLanguageExamples && (
          <LanguageExamplesPanel transformations={languageTransformations} />
        )}
      </div>

      {/* Applied Language Settings Summary */}
      {selectedPreferences.length > 0 && (
        <LanguageSettingsSummary
          selectedPreferences={selectedPreferences}
          languagePreferences={languagePreferences}
        />
      )}
    </div>
  );
}

// Language preference section component
function LanguagePreferenceSection({
  title,
  icon: Icon,
  preferences,
  selectedPreferences,
  onPreferenceSelect,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  preferences: LanguagePreference[];
  selectedPreferences: string[];
  onPreferenceSelect: (preference: LanguagePreference) => void;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center space-x-2 mb-4">
        <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      </div>

      <div className="grid gap-3">
        {preferences.map(preference => {
          const isSelected = selectedPreferences.includes(preference.id);

          return (
            <TouchOptimizedButton
              key={preference.id}
              variant={isSelected ? 'primary' : 'secondary'}
              onClick={() => onPreferenceSelect(preference)}
              className={`
                w-full p-4 text-left border-2 rounded-lg transition-all
                ${
                  isSelected
                    ? 'border-purple-300 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-200'
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4
                      className={`font-medium ${isSelected ? 'text-purple-900' : 'text-gray-900 dark:text-gray-100'}`}
                    >
                      {preference.label}
                    </h4>
                    {isSelected && <Check className="w-4 h-4 text-purple-600" />}
                  </div>
                  <p
                    className={`text-sm mb-2 ${isSelected ? 'text-purple-700' : 'text-gray-600 dark:text-gray-400'}`}
                  >
                    {preference.description}
                  </p>
                  <div
                    className={`text-xs italic p-2 rounded ${isSelected ? 'bg-purple-100 text-purple-700' : 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400'}`}
                  >
                    Example: {preference.example}
                  </div>
                </div>
              </div>
            </TouchOptimizedButton>
          );
        })}
      </div>
    </div>
  );
}

// Language examples panel
function LanguageExamplesPanel({
  transformations,
}: {
  transformations: Record<string, Record<string, string>>;
}) {
  const [activeCategory, setActiveCategory] = useState<string>('clinical');

  return (
    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
      <div className="flex items-center space-x-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-600" />
        <h4 className="font-semibold text-gray-900 dark:text-gray-100">Language Transformations</h4>
      </div>

      {/* Category tabs */}
      <div className="flex space-x-2 mb-4">
        {Object.keys(transformations).map(category => (
          <TouchOptimizedButton
            key={category}
            variant={activeCategory === category ? 'primary' : 'secondary'}
            onClick={() => setActiveCategory(category)}
            className="px-3 py-1 text-sm capitalize"
          >
            {category.replace(/([A-Z])/g, ' $1').toLowerCase()}
          </TouchOptimizedButton>
        ))}
      </div>

      {/* Language examples */}
      <div className="space-y-3">
        {Object.entries(transformations[activeCategory] || {}).map(([original, alternative]) => (
          <div key={original} className="bg-white p-3 rounded border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-medium text-red-600 mb-1">Instead of:</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{original}"</p>
              </div>
              <div>
                <p className="text-xs font-medium text-green-600 mb-1">We use:</p>
                <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                  "{alternative}"
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Language settings summary
function LanguageSettingsSummary({
  selectedPreferences,
  languagePreferences,
}: {
  selectedPreferences: string[];
  languagePreferences: LanguagePreference[];
}) {
  const selectedPrefs = languagePreferences.filter(p => selectedPreferences.includes(p.id));

  return (
    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-2 mb-4">
        <Star className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Your Language Preferences
        </h3>
      </div>

      <div className="bg-purple-50 p-4 rounded-lg">
        <p className="text-sm text-purple-700 mb-3">Your communication will feel:</p>
        <div className="flex flex-wrap gap-2">
          {selectedPrefs.map(pref => (
            <span
              key={pref.id}
              className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full"
            >
              {pref.label}
            </span>
          ))}
        </div>
        <p className="text-xs text-purple-600 mt-3">
          These preferences are applied throughout your pain tracking experience to ensure all
          language feels respectful and empowering.
        </p>
      </div>
    </div>
  );
}

export default DignityPreservingLanguage;
