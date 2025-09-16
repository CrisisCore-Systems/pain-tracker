import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Phone, 
  PhoneCall, 
  MessageSquare, 
  MapPin, 
  Clock, 
  Heart, 
  Zap, 
  Shield, 
  User, 
  UserCheck,
  Calendar,
  Pill,
  Thermometer,
  Activity,
  RotateCcw,
  Save,
  Volume2,
  VolumeX,
  Settings,
  Plus,
  Minus,
  Check,
  X,
  ChevronRight,
  Home,
  Hospital,
  Ambulance
} from 'lucide-react';
import { TouchOptimizedButton } from './TraumaInformedUX';

// Emergency types and interfaces
type EmergencyLevel = 'mild' | 'moderate' | 'severe' | 'critical';
type EmergencyType = 'pain_spike' | 'breathing' | 'medication' | 'mental_health' | 'fall' | 'other';

interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  priority: number;
  available247: boolean;
  type: 'personal' | 'medical' | 'emergency';
}

interface EmergencyEntry {
  id: string;
  timestamp: Date;
  level: EmergencyLevel;
  type: EmergencyType;
  painLevel: number;
  symptoms: string[];
  description: string;
  actionsTaken: string[];
  contactsCalled: string[];
  resolved: boolean;
  followUpNeeded: boolean;
}

interface QuickAssessment {
  painLevel: number;
  canMove: boolean;
  breathing: boolean;
  consciousness: boolean;
  medication: boolean;
  assistance: boolean;
}

interface EmergencyModeProps {
  onEmergencyEntry?: (entry: EmergencyEntry) => void;
  onEmergencyContact?: (contact: EmergencyContact) => void;
  emergencyContacts?: EmergencyContact[];
  className?: string;
}

// Pre-defined emergency contacts
const defaultEmergencyContacts: EmergencyContact[] = [
  {
    id: 'emergency-911',
    name: 'Emergency Services',
    relationship: 'Emergency',
    phone: '911',
    priority: 1,
    available247: true,
    type: 'emergency'
  },
  {
    id: 'poison-control',
    name: 'Poison Control',
    relationship: 'Emergency',
    phone: '1-800-222-1222',
    priority: 2,
    available247: true,
    type: 'emergency'
  }
];

// Emergency symptoms
const emergencySymptoms = [
  'Severe chest pain',
  'Difficulty breathing',
  'Severe headache',
  'Confusion or disorientation',
  'Severe nausea/vomiting',
  'High fever',
  'Severe dizziness',
  'Severe weakness',
  'Severe abdominal pain',
  'Severe back pain',
  'Loss of consciousness',
  'Severe anxiety/panic'
];

// Quick actions
const quickActions = [
  { id: 'call-911', label: 'Call 911', icon: Phone, urgent: true },
  { id: 'call-doctor', label: 'Call Doctor', icon: PhoneCall, urgent: false },
  { id: 'take-medication', label: 'Take Medication', icon: Pill, urgent: false },
  { id: 'rest-position', label: 'Rest Position', icon: Heart, urgent: false },
  { id: 'breathing-exercise', label: 'Breathing Exercise', icon: Activity, urgent: false },
  { id: 'ice-heat', label: 'Ice/Heat', icon: Thermometer, urgent: false }
];

export function EmergencyModeInterfaces({
  onEmergencyEntry,
  onEmergencyContact,
  emergencyContacts = defaultEmergencyContacts,
  className = ''
}: EmergencyModeProps) {
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [currentAssessment, setCurrentAssessment] = useState<QuickAssessment>({
    painLevel: 5,
    canMove: true,
    breathing: true,
    consciousness: true,
    medication: true,
    assistance: false
  });
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [emergencyDescription, setEmergencyDescription] = useState('');
  const [actionsTaken, setActionsTaken] = useState<string[]>([]);
  const [contactsCalled, setContactsCalled] = useState<string[]>([]);

  // Auto-activate emergency mode based on pain level
  useEffect(() => {
    if (currentAssessment.painLevel >= 9 || !currentAssessment.breathing || !currentAssessment.consciousness) {
      setIsEmergencyMode(true);
    }
  }, [currentAssessment]);

  const activateEmergencyMode = () => {
    setIsEmergencyMode(true);
    // Clear non-essential UI elements
    document.body.classList.add('emergency-mode');
  };

  const deactivateEmergencyMode = () => {
    setIsEmergencyMode(false);
    document.body.classList.remove('emergency-mode');
  };

  const handleQuickAssessmentChange = (field: keyof QuickAssessment, value: boolean | number) => {
    setCurrentAssessment(prev => ({ ...prev, [field]: value }));
  };

  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleQuickAction = (actionId: string) => {
    if (!actionsTaken.includes(actionId)) {
      setActionsTaken(prev => [...prev, actionId]);
    }

    // Handle specific actions
    switch (actionId) {
      case 'call-911':
        window.open('tel:911');
        break;
      case 'breathing-exercise':
        // Trigger breathing exercise component
        break;
    }
  };

  const handleEmergencyCall = (contact: EmergencyContact) => {
    setContactsCalled(prev => [...prev, contact.id]);
    window.open(`tel:${contact.phone}`);
    
    if (onEmergencyContact) {
      onEmergencyContact(contact);
    }
  };

  const saveEmergencyEntry = () => {
    const entry: EmergencyEntry = {
      id: `emergency-${Date.now()}`,
      timestamp: new Date(),
      level: determineEmergencyLevel(),
      type: determineEmergencyType(),
      painLevel: currentAssessment.painLevel,
      symptoms: selectedSymptoms,
      description: emergencyDescription,
      actionsTaken,
      contactsCalled,
      resolved: false,
      followUpNeeded: true
    };

    if (onEmergencyEntry) {
      onEmergencyEntry(entry);
    }
  };

  const determineEmergencyLevel = (): EmergencyLevel => {
    if (!currentAssessment.breathing || !currentAssessment.consciousness || currentAssessment.painLevel >= 9) {
      return 'critical';
    }
    if (currentAssessment.painLevel >= 7 || selectedSymptoms.length >= 3) {
      return 'severe';
    }
    if (currentAssessment.painLevel >= 5 || selectedSymptoms.length >= 1) {
      return 'moderate';
    }
    return 'mild';
  };

  const determineEmergencyType = (): EmergencyType => {
    if (selectedSymptoms.some(s => s.includes('breathing'))) return 'breathing';
    if (selectedSymptoms.some(s => s.includes('chest'))) return 'pain_spike';
    if (selectedSymptoms.some(s => s.includes('confusion'))) return 'mental_health';
    return 'pain_spike';
  };

  if (isEmergencyMode) {
    return (
      <EmergencyModeInterface
        assessment={currentAssessment}
        onAssessmentChange={handleQuickAssessmentChange}
        selectedSymptoms={selectedSymptoms}
        onSymptomToggle={handleSymptomToggle}
        emergencyContacts={emergencyContacts}
        onEmergencyCall={handleEmergencyCall}
        onQuickAction={handleQuickAction}
        actionsTaken={actionsTaken}
        onDeactivate={deactivateEmergencyMode}
        onSave={saveEmergencyEntry}
        className={className}
      />
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-start space-x-3 mb-6">
        <div className="p-2 bg-red-100 rounded-lg">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Emergency Mode Interfaces
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Quick access to emergency support, contacts, and simplified entry for acute pain episodes.
            Automatically activates when severe symptoms are detected.
          </p>
        </div>
      </div>

      {/* Emergency Activation */}
      <EmergencyActivationPanel
        onActivate={activateEmergencyMode}
        assessment={currentAssessment}
        onAssessmentChange={handleQuickAssessmentChange}
      />

      {/* Emergency Contacts Management */}
      <EmergencyContactsManager
        contacts={emergencyContacts}
        onContactCall={handleEmergencyCall}
        onContactAdd={(contact) => onEmergencyContact && onEmergencyContact(contact)}
      />

      {/* Quick Actions Preview */}
      <QuickActionsPreview
        actions={quickActions}
        onAction={handleQuickAction}
        actionsTaken={actionsTaken}
      />
    </div>
  );
}

// Emergency Mode Interface (Full Screen)
function EmergencyModeInterface({
  assessment,
  onAssessmentChange,
  selectedSymptoms,
  onSymptomToggle,
  emergencyContacts,
  onEmergencyCall,
  onQuickAction,
  actionsTaken,
  onDeactivate,
  onSave,
  className
}: {
  assessment: QuickAssessment;
  onAssessmentChange: (field: keyof QuickAssessment, value: boolean | number) => void;
  selectedSymptoms: string[];
  onSymptomToggle: (symptom: string) => void;
  emergencyContacts: EmergencyContact[];
  onEmergencyCall: (contact: EmergencyContact) => void;
  onQuickAction: (actionId: string) => void;
  actionsTaken: string[];
  onDeactivate: () => void;
  onSave: () => void;
  className?: string;
}) {
  return (
    <div className={`fixed inset-0 bg-red-50 z-50 overflow-auto ${className}`}>
      <div className="min-h-screen p-4">
        {/* Emergency Header */}
        <div className="bg-red-600 text-white rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Emergency Mode</h1>
                <p className="text-red-100">Get help quickly and safely</p>
              </div>
            </div>
            <TouchOptimizedButton
              variant="secondary"
              onClick={onDeactivate}
              className="bg-white text-red-600 hover:bg-red-50"
            >
              <X className="w-5 h-5 mr-1" />
              Exit Emergency
            </TouchOptimizedButton>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Column: Assessment & Actions */}
          <div className="space-y-4">
            {/* Quick Assessment */}
            <EmergencyQuickAssessment
              assessment={assessment}
              onAssessmentChange={onAssessmentChange}
            />

            {/* Emergency Actions */}
            <EmergencyQuickActions
              actions={quickActions}
              onAction={onQuickAction}
              actionsTaken={actionsTaken}
            />

            {/* Symptoms Checklist */}
            <EmergencySymptomsChecklist
              symptoms={emergencySymptoms}
              selectedSymptoms={selectedSymptoms}
              onSymptomToggle={onSymptomToggle}
            />
          </div>

          {/* Right Column: Contacts & Support */}
          <div className="space-y-4">
            {/* Emergency Contacts */}
            <EmergencyContactsList
              contacts={emergencyContacts}
              onContactCall={onEmergencyCall}
            />

            {/* Breathing Support */}
            <EmergencyBreathingSupport />

            {/* Save & Documentation */}
            <EmergencyDocumentation onSave={onSave} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Emergency Activation Panel
function EmergencyActivationPanel({
  onActivate,
  assessment,
  onAssessmentChange
}: {
  onActivate: () => void;
  assessment: QuickAssessment;
  onAssessmentChange: (field: keyof QuickAssessment, value: boolean | number) => void;
}) {
  const shouldAutoActivate = assessment.painLevel >= 9 || !assessment.breathing || !assessment.consciousness;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-center space-x-2 mb-4">
        <Zap className="w-5 h-5 text-red-600" />
        <h3 className="text-lg font-semibold text-red-900">Emergency Activation</h3>
      </div>

      <div className="space-y-4">
        {/* Pain Level Slider */}
        <div>
          <label className="block text-sm font-medium text-red-700 mb-2">
            Current Pain Level: {assessment.painLevel}/10
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={assessment.painLevel}
            onChange={(e) => onAssessmentChange('painLevel', parseInt(e.target.value))}
            className="w-full h-3 bg-red-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Quick Assessment Questions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-red-700">Can you breathe normally?</span>
            <TouchOptimizedButton
              variant={assessment.breathing ? "primary" : "secondary"}
              onClick={() => onAssessmentChange('breathing', !assessment.breathing)}
              className={`px-3 py-1 ${!assessment.breathing ? 'bg-red-600 text-white' : ''}`}
            >
              {assessment.breathing ? 'Yes' : 'No'}
            </TouchOptimizedButton>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-red-700">Are you fully conscious?</span>
            <TouchOptimizedButton
              variant={assessment.consciousness ? "primary" : "secondary"}
              onClick={() => onAssessmentChange('consciousness', !assessment.consciousness)}
              className={`px-3 py-1 ${!assessment.consciousness ? 'bg-red-600 text-white' : ''}`}
            >
              {assessment.consciousness ? 'Yes' : 'No'}
            </TouchOptimizedButton>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-red-700">Do you need assistance?</span>
            <TouchOptimizedButton
              variant={assessment.assistance ? "secondary" : "primary"}
              onClick={() => onAssessmentChange('assistance', !assessment.assistance)}
              className={`px-3 py-1 ${assessment.assistance ? 'bg-red-600 text-white' : ''}`}
            >
              {assessment.assistance ? 'Yes' : 'No'}
            </TouchOptimizedButton>
          </div>
        </div>

        {/* Activation Button */}
        <div className="pt-4 border-t border-red-200">
          {shouldAutoActivate ? (
            <div className="bg-red-100 p-3 rounded border border-red-300 mb-3">
              <div className="flex items-center space-x-2 text-red-800">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">Emergency conditions detected - activation recommended</span>
              </div>
            </div>
          ) : null}
          
          <TouchOptimizedButton
            variant="primary"
            onClick={onActivate}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-lg font-semibold"
          >
            <AlertTriangle className="w-5 h-5 mr-2" />
            Activate Emergency Mode
          </TouchOptimizedButton>
        </div>
      </div>
    </div>
  );
}

// Emergency Quick Assessment
function EmergencyQuickAssessment({
  assessment,
  onAssessmentChange
}: {
  assessment: QuickAssessment;
  onAssessmentChange: (field: keyof QuickAssessment, value: boolean | number) => void;
}) {
  return (
    <div className="bg-white border border-red-200 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-4">
        <Activity className="w-5 h-5 text-red-600" />
        <h3 className="text-lg font-semibold text-red-900">Quick Assessment</h3>
      </div>

      <div className="space-y-4">
        {/* Large Pain Level Display */}
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <div className="text-3xl font-bold text-red-900 mb-2">{assessment.painLevel}/10</div>
          <input
            type="range"
            min="1"
            max="10"
            value={assessment.painLevel}
            onChange={(e) => onAssessmentChange('painLevel', parseInt(e.target.value))}
            className="w-full h-4 bg-red-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="text-sm text-red-700 mt-2">Pain Level</div>
        </div>

        {/* Critical Questions */}
        <div className="space-y-3">
          {[
            { key: 'breathing', label: 'Breathing normally', critical: true },
            { key: 'consciousness', label: 'Fully conscious', critical: true },
            { key: 'canMove', label: 'Can move normally', critical: false },
            { key: 'medication', label: 'Took medication', critical: false }
          ].map(({ key, label, critical }) => (
            <div key={key} className={`flex items-center justify-between p-3 rounded ${critical ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}>
              <span className={`font-medium ${critical ? 'text-red-700' : 'text-gray-700'}`}>
                {critical && <AlertTriangle className="w-4 h-4 inline mr-1" />}
                {label}
              </span>
              <TouchOptimizedButton
                variant={assessment[key as keyof QuickAssessment] ? "primary" : "secondary"}
                onClick={() => onAssessmentChange(key as keyof QuickAssessment, !assessment[key as keyof QuickAssessment])}
                className={`px-4 py-2 ${
                  critical && !assessment[key as keyof QuickAssessment] 
                    ? 'bg-red-600 text-white' 
                    : ''
                }`}
              >
                {assessment[key as keyof QuickAssessment] ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Yes
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4 mr-1" />
                    No
                  </>
                )}
              </TouchOptimizedButton>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Emergency Quick Actions
function EmergencyQuickActions({
  actions,
  onAction,
  actionsTaken
}: {
  actions: typeof quickActions;
  onAction: (actionId: string) => void;
  actionsTaken: string[];
}) {
  return (
    <div className="bg-white border border-red-200 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-4">
        <Zap className="w-5 h-5 text-red-600" />
        <h3 className="text-lg font-semibold text-red-900">Quick Actions</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          const isTaken = actionsTaken.includes(action.id);
          
          return (
            <TouchOptimizedButton
              key={action.id}
              variant={action.urgent ? "primary" : "secondary"}
              onClick={() => onAction(action.id)}
              className={`p-3 text-left border-2 rounded-lg transition-all ${
                action.urgent 
                  ? 'bg-red-600 text-white border-red-600 hover:bg-red-700' 
                  : isTaken
                  ? 'bg-green-100 border-green-300 text-green-800'
                  : 'border-gray-200 hover:border-red-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-5 h-5" />
                <span className="font-medium">{action.label}</span>
                {isTaken && <Check className="w-4 h-4 ml-auto" />}
              </div>
            </TouchOptimizedButton>
          );
        })}
      </div>
    </div>
  );
}

// Emergency Symptoms Checklist
function EmergencySymptomsChecklist({
  symptoms,
  selectedSymptoms,
  onSymptomToggle
}: {
  symptoms: string[];
  selectedSymptoms: string[];
  onSymptomToggle: (symptom: string) => void;
}) {
  return (
    <div className="bg-white border border-red-200 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-red-600" />
        <h3 className="text-lg font-semibold text-red-900">Current Symptoms</h3>
        <span className="text-sm text-red-600">({selectedSymptoms.length} selected)</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
        {symptoms.map((symptom) => {
          const isSelected = selectedSymptoms.includes(symptom);
          
          return (
            <TouchOptimizedButton
              key={symptom}
              variant="secondary"
              onClick={() => onSymptomToggle(symptom)}
              className={`p-2 text-left text-sm border rounded transition-all ${
                isSelected 
                  ? 'bg-red-100 border-red-300 text-red-800' 
                  : 'border-gray-200 hover:border-red-200'
              }`}
            >
              <div className="flex items-center space-x-2">
                {isSelected ? (
                  <Check className="w-3 h-3 text-red-600" />
                ) : (
                  <div className="w-3 h-3 border border-gray-300 rounded" />
                )}
                <span>{symptom}</span>
              </div>
            </TouchOptimizedButton>
          );
        })}
      </div>
    </div>
  );
}

// Emergency Contacts List
function EmergencyContactsList({
  contacts,
  onContactCall
}: {
  contacts: EmergencyContact[];
  onContactCall: (contact: EmergencyContact) => void;
}) {
  const emergencyContacts = contacts.filter(c => c.type === 'emergency');
  const medicalContacts = contacts.filter(c => c.type === 'medical');
  const personalContacts = contacts.filter(c => c.type === 'personal');

  return (
    <div className="bg-white border border-red-200 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-4">
        <Phone className="w-5 h-5 text-red-600" />
        <h3 className="text-lg font-semibold text-red-900">Emergency Contacts</h3>
      </div>

      <div className="space-y-4">
        {/* Emergency Services */}
        {emergencyContacts.length > 0 && (
          <div>
            <h4 className="font-medium text-red-800 mb-2">Emergency Services</h4>
            <div className="space-y-2">
              {emergencyContacts.map((contact) => (
                <TouchOptimizedButton
                  key={contact.id}
                  variant="primary"
                  onClick={() => onContactCall(contact)}
                  className="w-full p-3 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium">{contact.name}</div>
                      <div className="text-sm opacity-90">{contact.phone}</div>
                    </div>
                  </div>
                </TouchOptimizedButton>
              ))}
            </div>
          </div>
        )}

        {/* Medical Contacts */}
        {medicalContacts.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Medical Contacts</h4>
            <div className="space-y-2">
              {medicalContacts.map((contact) => (
                <TouchOptimizedButton
                  key={contact.id}
                  variant="secondary"
                  onClick={() => onContactCall(contact)}
                  className="w-full p-3 border border-gray-300 hover:border-red-300 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <PhoneCall className="w-5 h-5 text-gray-600" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">{contact.name}</div>
                      <div className="text-sm text-gray-600">{contact.relationship}</div>
                      <div className="text-sm text-gray-500">{contact.phone}</div>
                    </div>
                  </div>
                </TouchOptimizedButton>
              ))}
            </div>
          </div>
        )}

        {/* Personal Contacts */}
        {personalContacts.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Personal Support</h4>
            <div className="space-y-2">
              {personalContacts.map((contact) => (
                <TouchOptimizedButton
                  key={contact.id}
                  variant="secondary"
                  onClick={() => onContactCall(contact)}
                  className="w-full p-3 border border-gray-300 hover:border-blue-300 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-600" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">{contact.name}</div>
                      <div className="text-sm text-gray-600">{contact.relationship}</div>
                      <div className="text-sm text-gray-500">{contact.phone}</div>
                    </div>
                    {contact.available247 && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">24/7</span>
                    )}
                  </div>
                </TouchOptimizedButton>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Emergency Breathing Support
function EmergencyBreathingSupport() {
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');

  useEffect(() => {
    if (!isBreathingActive) return;

    const cycle = setInterval(() => {
      setBreathingPhase(current => {
        switch (current) {
          case 'inhale': return 'hold';
          case 'hold': return 'exhale';
          case 'exhale': return 'inhale';
        }
      });
    }, 4000); // 4 seconds per phase

    return () => clearInterval(cycle);
  }, [isBreathingActive]);

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-4">
        <Heart className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-blue-900">Breathing Support</h3>
      </div>

      <div className="text-center">
        <TouchOptimizedButton
          variant={isBreathingActive ? "secondary" : "primary"}
          onClick={() => setIsBreathingActive(!isBreathingActive)}
          className="mb-4"
        >
          {isBreathingActive ? (
            <>
              <Pause className="w-4 h-4 mr-1" />
              Stop Breathing Exercise
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-1" />
              Start Breathing Exercise
            </>
          )}
        </TouchOptimizedButton>

        {isBreathingActive && (
          <div className="space-y-4">
            <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center text-white font-bold text-lg transition-all duration-1000 ${
              breathingPhase === 'inhale' ? 'bg-blue-500 scale-110' :
              breathingPhase === 'hold' ? 'bg-purple-500 scale-105' :
              'bg-green-500 scale-95'
            }`}>
              {breathingPhase === 'inhale' ? 'Breathe In' :
               breathingPhase === 'hold' ? 'Hold' :
               'Breathe Out'}
            </div>
            <p className="text-sm text-blue-700">
              Follow the circle and text prompts. Breathe slowly and deeply.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Emergency Documentation
function EmergencyDocumentation({ onSave }: { onSave: () => void }) {
  return (
    <div className="bg-white border border-green-200 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-4">
        <Save className="w-5 h-5 text-green-600" />
        <h3 className="text-lg font-semibold text-green-900">Save Emergency Record</h3>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-green-700">
          Automatically saving your emergency information for medical records and follow-up care.
        </p>

        <TouchOptimizedButton
          variant="primary"
          onClick={onSave}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
        >
          <Save className="w-5 h-5 mr-2" />
          Save Emergency Entry
        </TouchOptimizedButton>

        <div className="text-xs text-green-600">
          This will be automatically saved and shared with your healthcare providers as configured.
        </div>
      </div>
    </div>
  );
}

// Emergency Contacts Manager
function EmergencyContactsManager({
  contacts,
  onContactCall,
  onContactAdd
}: {
  contacts: EmergencyContact[];
  onContactCall: (contact: EmergencyContact) => void;
  onContactAdd?: (contact: EmergencyContact) => void;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <PhoneCall className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Emergency Contacts</h3>
        </div>
        {onContactAdd && (
          <TouchOptimizedButton
            variant="secondary"
            onClick={() => {/* Implement add contact modal */}}
            className="px-3 py-1"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Contact
          </TouchOptimizedButton>
        )}
      </div>

      <div className="space-y-2">
        {contacts.slice(0, 3).map((contact) => (
          <div key={contact.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div>
              <div className="font-medium text-gray-900">{contact.name}</div>
              <div className="text-sm text-gray-600">{contact.relationship} • {contact.phone}</div>
            </div>
            <TouchOptimizedButton
              variant="primary"
              onClick={() => onContactCall(contact)}
              className="px-3 py-1"
            >
              <Phone className="w-4 h-4" />
            </TouchOptimizedButton>
          </div>
        ))}
      </div>
    </div>
  );
}

// Quick Actions Preview
function QuickActionsPreview({
  actions,
  onAction,
  actionsTaken
}: {
  actions: typeof quickActions;
  onAction: (actionId: string) => void;
  actionsTaken: string[];
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-4">
        <Zap className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {actions.slice(0, 6).map((action) => {
          const Icon = action.icon;
          const isTaken = actionsTaken.includes(action.id);
          
          return (
            <TouchOptimizedButton
              key={action.id}
              variant="secondary"
              onClick={() => onAction(action.id)}
              className={`p-3 text-center border rounded-lg transition-all ${
                action.urgent 
                  ? 'border-red-300 hover:bg-red-50' 
                  : isTaken
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Icon className={`w-5 h-5 mx-auto mb-1 ${
                action.urgent ? 'text-red-600' : isTaken ? 'text-green-600' : 'text-gray-600'
              }`} />
              <div className="text-xs font-medium">{action.label}</div>
            </TouchOptimizedButton>
          );
        })}
      </div>
    </div>
  );
}

export default EmergencyModeInterfaces;
