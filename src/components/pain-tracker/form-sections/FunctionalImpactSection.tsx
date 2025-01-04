import { FUNCTIONAL_ACTIVITIES, MOBILITY_AIDS } from "../../../utils/constants.ts";

interface FunctionalImpactSectionProps {
  limitedActivities: string[];
  assistanceNeeded: string[];
  mobilityAids: string[];
  onChange: (data: Partial<{
    limitedActivities: string[];
    assistanceNeeded: string[];
    mobilityAids: string[];
  }>) => void;
}

export function FunctionalImpactSection({
  limitedActivities,
  assistanceNeeded,
  mobilityAids,
  onChange
}: FunctionalImpactSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Functional Impact</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Limited Activities
        </label>
        <select
          multiple
          value={limitedActivities}
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions, option => option.value);
            onChange({ limitedActivities: values });
          }}
          className="w-full border rounded-md p-2"
          size={4}
        >
          {FUNCTIONAL_ACTIVITIES.map(activity => (
            <option key={activity} value={activity}>
              {activity}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Assistance Needed
        </label>
        <input
          type="text"
          value={assistanceNeeded.join(", ")}
          onChange={(e) => onChange({ assistanceNeeded: e.target.value.split(", ").filter(Boolean) })}
          className="w-full border rounded-md p-2"
          placeholder="Enter types of assistance needed, separated by commas"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mobility Aids Used
        </label>
        <select
          multiple
          value={mobilityAids}
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions, option => option.value);
            onChange({ mobilityAids: values });
          }}
          className="w-full border rounded-md p-2"
          size={4}
        >
          {MOBILITY_AIDS.map(aid => (
            <option key={aid} value={aid}>
              {aid}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
