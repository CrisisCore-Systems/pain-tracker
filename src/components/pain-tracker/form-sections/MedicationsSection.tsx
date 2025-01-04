interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  effectiveness: string;
}

interface MedicationsSectionProps {
  current: Medication[];
  changes: string;
  effectiveness: string;
  onChange: (data: Partial<{
    current: Medication[];
    changes: string;
    effectiveness: string;
  }>) => void;
}

export function MedicationsSection({
  current,
  changes,
  effectiveness,
  onChange
}: MedicationsSectionProps) {
  const handleMedicationChange = (index: number, field: keyof Medication, value: string) => {
    const updatedMedications = [...current];
    updatedMedications[index] = {
      ...updatedMedications[index],
      [field]: value
    };
    onChange({ current: updatedMedications });
  };

  const addMedication = () => {
    onChange({
      current: [
        ...current,
        { name: "", dosage: "", frequency: "", effectiveness: "" }
      ]
    });
  };

  const removeMedication = (index: number) => {
    onChange({
      current: current.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Medications</h3>
      
      <div className="space-y-4">
        {current.map((medication, index) => (
          <div key={index} className="p-4 border rounded-md space-y-2">
            <div className="flex justify-between">
              <h4 className="font-medium">Medication #{index + 1}</h4>
              <button
                onClick={() => removeMedication(index)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={medication.name}
                  onChange={(e) => handleMedicationChange(index, "name", e.target.value)}
                  className="w-full border rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dosage
                </label>
                <input
                  type="text"
                  value={medication.dosage}
                  onChange={(e) => handleMedicationChange(index, "dosage", e.target.value)}
                  className="w-full border rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequency
                </label>
                <input
                  type="text"
                  value={medication.frequency}
                  onChange={(e) => handleMedicationChange(index, "frequency", e.target.value)}
                  className="w-full border rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Effectiveness
                </label>
                <select
                  value={medication.effectiveness}
                  onChange={(e) => handleMedicationChange(index, "effectiveness", e.target.value)}
                  className="w-full border rounded-md p-2"
                >
                  <option value="">Select effectiveness</option>
                  <option value="Very Effective">Very Effective</option>
                  <option value="Somewhat Effective">Somewhat Effective</option>
                  <option value="Not Effective">Not Effective</option>
                  <option value="Made Things Worse">Made Things Worse</option>
                </select>
              </div>
            </div>
          </div>
        ))}
        
        <button
          type="button"
          onClick={addMedication}
          className="w-full py-2 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-gray-400 hover:text-gray-700"
        >
          Add Medication
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Recent Changes in Medications
        </label>
        <textarea
          value={changes}
          onChange={(e) => onChange({ changes: e.target.value })}
          className="w-full border rounded-md p-2"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Overall Medication Effectiveness
        </label>
        <select
          value={effectiveness}
          onChange={(e) => onChange({ effectiveness: e.target.value })}
          className="w-full border rounded-md p-2"
        >
          <option value="">Select overall effectiveness</option>
          <option value="Very Effective">Very Effective</option>
          <option value="Somewhat Effective">Somewhat Effective</option>
          <option value="Not Effective">Not Effective</option>
          <option value="Mixed Results">Mixed Results</option>
        </select>
      </div>
    </div>
  );
}
