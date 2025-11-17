interface ComparisonSectionProps {
  worseningSince: string;
  newLimitations: string[];
  onChange: (data: Partial<{
    worseningSince: string;
    newLimitations: string[];
  }>) => void;
}

export function ComparisonSection({
  worseningSince,
  newLimitations,
  onChange
}: ComparisonSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Comparison to Previous</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Pain Worsening Since
        </label>
        <input
          type="date"
          value={worseningSince}
          onChange={(e) => onChange({ worseningSince: e.target.value })}
          className="w-full border rounded-md p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          New Limitations
        </label>
        <textarea
          value={newLimitations.join("\n")}
          onChange={(e) => onChange({ newLimitations: e.target.value.split("\n").filter(Boolean) })}
          className="w-full border rounded-md p-2"
          rows={3}
          placeholder="Enter each new limitation on a new line"
        />
      </div>
    </div>
  );
}
