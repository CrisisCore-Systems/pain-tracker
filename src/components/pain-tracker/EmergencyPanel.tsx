import { useState, useEffect } from 'react';
import {
  PhoneIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { EmergencyPanelData, EmergencyContact, EmergencyProtocol } from '../../types';

interface EmergencyPanelProps {
  data: EmergencyPanelData;
  onChange: (data: EmergencyPanelData) => void;
}

export default function EmergencyPanel({ data, onChange }: EmergencyPanelProps) {
  const [showEmergencyAlert, setShowEmergencyAlert] = useState(false);
  const [newContact, setNewContact] = useState<Partial<EmergencyContact>>({});
  const [activeProtocol, setActiveProtocol] = useState<EmergencyProtocol | null>(null);

  // Monitor pain level and activate emergency protocols if needed
  useEffect(() => {
    const shouldShowAlert = data.protocols.some(
      protocol => data.currentPainLevel >= protocol.painThreshold
    );

    if (shouldShowAlert) {
      const highestPriorityProtocol = data.protocols
        .filter(p => data.currentPainLevel >= p.painThreshold)
        .sort((a, b) => b.painThreshold - a.painThreshold)[0];

      setActiveProtocol(highestPriorityProtocol);
      setShowEmergencyAlert(true);
    } else {
      setActiveProtocol(null);
      setShowEmergencyAlert(false);
    }
  }, [data.currentPainLevel, data.protocols]);

  const addContact = () => {
    if (!newContact.name || !newContact.phoneNumber) return;

    const contact: EmergencyContact = {
      id: Date.now(),
      name: newContact.name || '',
      relationship: newContact.relationship || '',
      phoneNumber: newContact.phoneNumber || '',
      email: newContact.email,
      isHealthcareProvider: newContact.isHealthcareProvider || false,
      specialty: newContact.specialty,
      address: newContact.address,
      notes: newContact.notes,
    };

    onChange({
      ...data,
      contacts: [...data.contacts, contact],
    });

    setNewContact({});
  };

  const removeContact = (id: number) => {
    onChange({
      ...data,
      contacts: data.contacts.filter(c => c.id !== id),
      protocols: data.protocols.map(p => ({
        ...p,
        contactPriority: p.contactPriority.filter(cId => cId !== id),
      })),
    });
  };

  const handleCall = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  return (
    <div className="space-y-6">
      {/* Emergency Alert */}
      {showEmergencyAlert && activeProtocol && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4" role="alert">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-400 mr-2" />
            <div>
              <h3 className="text-lg font-medium text-red-800">Emergency Protocol Activated</h3>
              <p className="text-sm text-red-700">
                Pain level exceeds threshold ({activeProtocol.painThreshold})
              </p>
            </div>
          </div>
          <div className="mt-4">
            <h4 className="font-medium text-red-800">Immediate Actions:</h4>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              {activeProtocol.immediateActions.map((action, index) => (
                <li key={index} className="text-red-700">
                  {action}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4">
            <h4 className="font-medium text-red-800">Emergency Medications:</h4>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              {activeProtocol.medications.map((med, index) => (
                <li key={index} className="text-red-700">
                  {med.name} - {med.dosage}
                  <br />
                  <span className="text-sm">{med.instructions}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Emergency Contacts */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Emergency Contacts
        </h3>
        <div className="space-y-4">
          {data.contacts.map(contact => (
            <div
              key={contact.id}
              className="flex items-start justify-between bg-gray-50 dark:bg-gray-900 p-4 rounded-md"
            >
              <div className="flex-1">
                <div className="flex items-center">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {contact.name}
                  </h4>
                  {contact.isHealthcareProvider && (
                    <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      Healthcare Provider
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{contact.relationship}</p>
                <div className="mt-2 flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => handleCall(contact.phoneNumber)}
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    <PhoneIcon className="h-4 w-4 mr-1" />
                    {contact.phoneNumber}
                  </button>
                  {contact.email && (
                    <a
                      href={`mailto:${contact.email}`}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {contact.email}
                    </a>
                  )}
                </div>
                {contact.notes && (
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{contact.notes}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeContact(contact.id)}
                className="ml-4 text-red-600 hover:text-red-800"
              >
                <TrashIcon className="h-5 w-5" aria-hidden="true" />
                <span className="sr-only">Remove contact</span>
              </button>
            </div>
          ))}
        </div>

        {/* Add New Contact Form */}
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={newContact.name || ''}
              onChange={e => setNewContact({ ...newContact, name: e.target.value })}
              placeholder="Name"
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
            <input
              type="text"
              value={newContact.relationship || ''}
              onChange={e => setNewContact({ ...newContact, relationship: e.target.value })}
              placeholder="Relationship"
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
            <input
              type="tel"
              value={newContact.phoneNumber || ''}
              onChange={e => setNewContact({ ...newContact, phoneNumber: e.target.value })}
              placeholder="Phone Number"
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
            <input
              type="email"
              value={newContact.email || ''}
              onChange={e => setNewContact({ ...newContact, email: e.target.value })}
              placeholder="Email (optional)"
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={newContact.isHealthcareProvider || false}
              onChange={e =>
                setNewContact({ ...newContact, isHealthcareProvider: e.target.checked })
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
            />
            <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Healthcare Provider
            </label>
          </div>
          {newContact.isHealthcareProvider && (
            <input
              type="text"
              value={newContact.specialty || ''}
              onChange={e => setNewContact({ ...newContact, specialty: e.target.value })}
              placeholder="Medical Specialty"
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          )}
          <textarea
            value={newContact.notes || ''}
            onChange={e => setNewContact({ ...newContact, notes: e.target.value })}
            placeholder="Additional Notes"
            rows={2}
            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          <button
            type="button"
            onClick={addContact}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" aria-hidden="true" />
            Add Contact
          </button>
        </div>
      </div>

      {/* Medical History */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Medical History
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Medical Conditions
            </h4>
            <ul className="mt-2 list-disc pl-5">
              {data.medicalHistory.conditions.map((condition, index) => (
                <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                  {condition}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Allergies</h4>
            <ul className="mt-2 list-disc pl-5">
              {data.medicalHistory.allergies.map((allergy, index) => (
                <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                  {allergy}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Previous Incidents
            </h4>
            <div className="mt-2 space-y-2">
              {data.medicalHistory.previousIncidents.map((incident, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {new Date(incident.date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{incident.description}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Outcome: {incident.outcome}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-500 dark:text-gray-400 text-right">
        Last updated: {new Date(data.lastUpdated).toLocaleString()}
      </div>
    </div>
  );
}
