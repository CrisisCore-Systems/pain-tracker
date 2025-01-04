interface Treatment {
  type: string;
  provider: string;
  date: string;
  effectiveness: string;
}

interface TreatmentsSectionProps {
  recent: Treatment[];
  effectiveness: string;
  planned: string[];
  onChange: (data: Partial<{
    recent: Treatment[];
    effectiveness: string;
    planned: string[];
  }>) => void;
}

export function TreatmentsSection({
  recent,
  effectiveness,
  planned,
  onChange
}: TreatmentsSectionProps) {
  const handleTreatmentChange = (index: number, field: keyof Treatment, value: string) => {
    const updatedTreatments = [...recent];
    updatedTreatments[index] = {
      ...updatedTreatments[index],
      [field]: value
    };
    onChange({ recent: updatedTreatments });
  };

  const addTreatment = () => {
    onChange({
      recent: [
        ...recent,
        { type: "", provider: "", date: "", effectiveness: "" }
      ]
    });
  };

  const removeTreatment = (index: number) => {
    onChange({
      recent: recent.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Treatments</h3>
      
      <div className="space-y-4">
        {recent.map((treatment, index) => (
          <div key={index} className="p-4 border rounded-md space-y-2">
            <div className="flex justify-between">
              <h4 className="font-medium">Treatment #{index + 1}</h4>
              <button
                onClick={() => removeTreatment(index)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <input
                  type="text"
                  value={treatment.type}
                  onChange={(e) => handleTreatmentChange(index, "type", e.target.value)}
                  className="w-full border rounded-md p-2"
                  placeholder="e.g., Physical Therapy, Massage"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provider
                </label>
                <input
                  type="text"
                  value={treatment.provider}
                  onChange={(e) => handleTreatmentChange(index, "provider", e.target.value)}
                  className="w-full border rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={treatment.date}
                  onChange={(e) => handleTreatmentChange(index, "date", e.target.value)}
                  className="w-full border rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Effectiveness
                </label>
                <select
                  value={treatment.effectiveness}
                  onChange={(e) => handleTreatmentChange(index, "effectiveness", e.target.value)}
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
          onClick={addTreatment}
          className="w-full py-2 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-gray-400 hover:text-gray-700"
        >
          Add Treatment
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Overall Treatment Effectiveness
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Planned Treatments
        </label>
        <textarea
          value={planned.join("\n")}
          onChange={(e) => onChange({ planned: e.target.value.split("\n").filter(Boolean) })}
          className="w-full border rounded-md p-2"
          rows={3}
          placeholder="Enter each planned treatment on a new line"
        />
      </div>
    </div>
  );
}
