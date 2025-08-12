import React, { useState } from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  effectiveness: string;
}

interface MedicationsProps {
  medications: {
    current: Medication[];
    changes: string;
    effectiveness: string;
  };
  onChange: (medications: {
    current: Medication[];
    changes: string;
    effectiveness: string;
  }) => void;
}

const effectivenessOptions = [
  'Very Effective',
  'Moderately Effective',
  'Slightly Effective',
  'Not Effective',
  'Made Things Worse',
];

export default function Medications({ medications, onChange }: MedicationsProps) {
  const [newMedication, setNewMedication] = useState<Medication>({
    name: '',
    dosage: '',
    frequency: '',
    effectiveness: 'Not Rated',
  });

  const addMedication = () => {
    if (!newMedication.name) return;

    onChange({
      ...medications,
      current: [...medications.current, newMedication],
    });

    setNewMedication({
      name: '',
      dosage: '',
      frequency: '',
      effectiveness: 'Not Rated',
    });
  };

  const removeMedication = (index: number) => {
    const updatedMedications = medications.current.filter((_, i) => i !== index);
    onChange({
      ...medications,
      current: updatedMedications,
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Current Medications</h3>

        {/* Current Medications List */}
        <div className="space-y-4 mb-6">
          {medications.current.map((med, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-50 p-4 rounded-md"
            >
              <div className="flex-1 grid grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">{med.name}</p>
                  <p className="text-xs text-gray-500">Name</p>
                </div>
                <div>
                  <p className="text-sm text-gray-900">{med.dosage}</p>
                  <p className="text-xs text-gray-500">Dosage</p>
                </div>
                <div>
                  <p className="text-sm text-gray-900">{med.frequency}</p>
                  <p className="text-xs text-gray-500">Frequency</p>
                </div>
                <div>
                  <p className="text-sm text-gray-900">{med.effectiveness}</p>
                  <p className="text-xs text-gray-500">Effectiveness</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeMedication(index)}
                className="ml-4 text-red-600 hover:text-red-800"
              >
                <TrashIcon className="h-5 w-5" aria-hidden="true" />
                <span className="sr-only">Remove medication</span>
              </button>
            </div>
          ))}
        </div>

        {/* Add New Medication Form */}
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <input
                type="text"
                value={newMedication.name}
                onChange={e => setNewMedication({ ...newMedication, name: e.target.value })}
                placeholder="Medication name"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <input
                type="text"
                value={newMedication.dosage}
                onChange={e => setNewMedication({ ...newMedication, dosage: e.target.value })}
                placeholder="Dosage"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <input
                type="text"
                value={newMedication.frequency}
                onChange={e => setNewMedication({ ...newMedication, frequency: e.target.value })}
                placeholder="Frequency"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <select
                value={newMedication.effectiveness}
                onChange={e =>
                  setNewMedication({ ...newMedication, effectiveness: e.target.value })
                }
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="Not Rated">Select Effectiveness</option>
                {effectivenessOptions.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={addMedication}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" aria-hidden="true" />
            Add Medication
          </button>
        </div>
      </div>

      {/* Recent Changes */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Medication Changes</h3>
        <textarea
          value={medications.changes}
          onChange={e => onChange({ ...medications, changes: e.target.value })}
          rows={3}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="Describe any recent changes to your medications..."
        />
      </div>

      {/* Overall Effectiveness */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Overall Effectiveness</h3>
        <select
          value={medications.effectiveness}
          onChange={e => onChange({ ...medications, effectiveness: e.target.value })}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="">Select Overall Effectiveness</option>
          {effectivenessOptions.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
