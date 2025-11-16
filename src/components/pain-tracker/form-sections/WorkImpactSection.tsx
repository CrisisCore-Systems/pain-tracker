interface WorkImpactSectionProps {
  missedWork: number;
  modifiedDuties: string[];
  workLimitations: string[];
  onChange: (data: Partial<{
    missedWork: number;
    modifiedDuties: string[];
    workLimitations: string[];
  }>) => void;
}

export function WorkImpactSection({
  missedWork,
  modifiedDuties,
  workLimitations,
  onChange
}: WorkImpactSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Work Impact</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Days of Missed Work
        </label>
        <input
          type="number"
          min="0"
          value={missedWork}
          onChange={(e) => onChange({ missedWork: parseInt(e.target.value) })}
          className="w-full border rounded-md p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Modified Duties
        </label>
        <textarea
          value={modifiedDuties.join("\n")}
          onChange={(e) => onChange({ modifiedDuties: e.target.value.split("\n").filter(Boolean) })}
          className="w-full border rounded-md p-2"
          rows={3}
          placeholder="Enter each modified duty on a new line"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Work Limitations
        </label>
        <textarea
          value={workLimitations.join("\n")}
          onChange={(e) => onChange({ workLimitations: e.target.value.split("\n").filter(Boolean) })}
          className="w-full border rounded-md p-2"
          rows={3}
          placeholder="Enter each work limitation on a new line"
        />
      </div>
    </div>
  );
}
