import { ACTIVITIES } from '../../../utils/constants';

interface FunctionalImpactSectionProps {
  limitedActivities: string[];
  mobilityAids: string[];
  onChange: (
    data: Partial<{
      limitedActivities: string[];
      mobilityAids: string[];
    }>
  ) => void;
}

export function FunctionalImpactSection({
  limitedActivities,
  mobilityAids,
  onChange,
}: FunctionalImpactSectionProps) {
  const allActivities = [
    ...ACTIVITIES.BASIC,
    ...ACTIVITIES.HOUSEHOLD,
    ...ACTIVITIES.WORK_RELATED,
    ...ACTIVITIES.SOCIAL,
  ];

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="limited-activities"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Limited Activities
        </label>
        <select
          id="limited-activities"
          multiple
          value={limitedActivities}
          onChange={e => {
            const selected = Array.from(
              e.target.selectedOptions,
              (option: HTMLOptionElement) => option.value
            );
            onChange({ limitedActivities: selected });
          }}
          className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          size={4}
        >
          {allActivities.map((activity: string) => (
            <option key={activity} value={activity}>
              {activity}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="mobility-aids"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Mobility Aids Used
        </label>
        <select
          id="mobility-aids"
          multiple
          value={mobilityAids}
          onChange={e => {
            const selected = Array.from(
              e.target.selectedOptions,
              (option: HTMLOptionElement) => option.value
            );
            onChange({ mobilityAids: selected });
          }}
          className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          size={4}
        >
          {ACTIVITIES.MOBILITY_AIDS?.map((aid: string) => (
            <option key={aid} value={aid}>
              {aid}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
