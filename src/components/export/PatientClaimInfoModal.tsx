import React, { useState } from 'react';
import { X } from 'lucide-react';

export interface PatientClaimInfo {
  patientName: string;
  patientDOB: string;
  patientAddress: string;
  patientPhone: string;
  claimNumber: string;
  injuryDate: string;
  employerName: string;
  physicianName: string;
  physicianPhone: string;
}

interface PatientClaimInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (info: PatientClaimInfo) => void;
  initialData?: Partial<PatientClaimInfo>;
}

/**
 * Patient and Claim Information Form
 * 
 * Collects WorkSafe BC required information for clinical PDF export.
 * Trauma-informed design with gentle validation and clear labels.
 */
export const PatientClaimInfoModal: React.FC<PatientClaimInfoModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = {},
}) => {
  const [formData, setFormData] = useState<PatientClaimInfo>({
    patientName: initialData.patientName || '',
    patientDOB: initialData.patientDOB || '',
    patientAddress: initialData.patientAddress || '',
    patientPhone: initialData.patientPhone || '',
    claimNumber: initialData.claimNumber || '',
    injuryDate: initialData.injuryDate || '',
    employerName: initialData.employerName || '',
    physicianName: initialData.physicianName || '',
    physicianPhone: initialData.physicianPhone || '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof PatientClaimInfo, string>>>({});

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof PatientClaimInfo, string>> = {};

    if (!formData.patientName.trim()) {
      newErrors.patientName = 'Patient name is required';
    }

    if (!formData.claimNumber.trim()) {
      newErrors.claimNumber = 'Claim number is required for WorkSafe BC';
    }

    if (!formData.injuryDate) {
      newErrors.injuryDate = 'Injury date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
      onClose();
    }
  };

  const handleChange = (field: keyof PatientClaimInfo, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-labelledby="patient-info-title"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg flex items-center justify-between">
          <div>
            <h2 id="patient-info-title" className="text-xl font-bold">
              Patient & Claim Information
            </h2>
            <p className="text-sm text-blue-100 mt-1">
              Required for WorkSafe BC clinical report
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            aria-label="Close dialog"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Patient Information Section */}
          <fieldset>
            <legend className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">👤</span> Patient Information
            </legend>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="patientName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="patientName"
                  value={formData.patientName}
                  onChange={(e) => handleChange('patientName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.patientName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="John Doe"
                  aria-invalid={!!errors.patientName}
                  aria-describedby={errors.patientName ? 'patientName-error' : undefined}
                />
                {errors.patientName && (
                  <p id="patientName-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.patientName}
                  </p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="patientDOB"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    id="patientDOB"
                    value={formData.patientDOB}
                    onChange={(e) => handleChange('patientDOB', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="patientPhone"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="patientPhone"
                    value={formData.patientPhone}
                    onChange={(e) => handleChange('patientPhone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="patientAddress"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Address
                </label>
                <textarea
                  id="patientAddress"
                  value={formData.patientAddress}
                  onChange={(e) => handleChange('patientAddress', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="123 Main St, City, Province, Postal Code"
                />
              </div>
            </div>
          </fieldset>

          {/* WorkSafe BC Claim Information */}
          <fieldset className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <legend className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">📋</span> WorkSafe BC Claim
            </legend>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="claimNumber"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Claim Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="claimNumber"
                    value={formData.claimNumber}
                    onChange={(e) => handleChange('claimNumber', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.claimNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="WCB-2025-12345"
                    aria-invalid={!!errors.claimNumber}
                    aria-describedby={errors.claimNumber ? 'claimNumber-error' : undefined}
                  />
                  {errors.claimNumber && (
                    <p id="claimNumber-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.claimNumber}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="injuryDate"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Date of Injury <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="injuryDate"
                    value={formData.injuryDate}
                    onChange={(e) => handleChange('injuryDate', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.injuryDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                    aria-invalid={!!errors.injuryDate}
                    aria-describedby={errors.injuryDate ? 'injuryDate-error' : undefined}
                  />
                  {errors.injuryDate && (
                    <p id="injuryDate-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.injuryDate}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="employerName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Employer Name
                </label>
                <input
                  type="text"
                  id="employerName"
                  value={formData.employerName}
                  onChange={(e) => handleChange('employerName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Company Name"
                />
              </div>
            </div>
          </fieldset>

          {/* Healthcare Provider Information */}
          <fieldset className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <legend className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">🩺</span> Healthcare Provider
            </legend>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="physicianName"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Physician Name
                  </label>
                  <input
                    type="text"
                    id="physicianName"
                    value={formData.physicianName}
                    onChange={(e) => handleChange('physicianName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Dr. Jane Smith"
                  />
                </div>

                <div>
                  <label
                    htmlFor="physicianPhone"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Physician Phone
                  </label>
                  <input
                    type="tel"
                    id="physicianPhone"
                    value={formData.physicianPhone}
                    onChange={(e) => handleChange('physicianPhone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="(555) 987-6543"
                  />
                </div>
              </div>
            </div>
          </fieldset>

          {/* Help Text */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-300 flex items-start gap-2">
              <span className="text-lg">💡</span>
              <span>
                <strong>Privacy Notice:</strong> This information is used only to generate your
                clinical report. All data remains on your device and is encrypted. Fields marked
                with * are required for WorkSafe BC compliance.
              </span>
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg"
            >
              Generate Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
