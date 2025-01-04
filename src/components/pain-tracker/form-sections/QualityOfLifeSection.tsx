interface QualityOfLifeSectionProps {
  sleepQuality: number;
  moodImpact: number;
  socialImpact: string[];
  onChange: (data: Partial<{
    sleepQuality: number;
    moodImpact: number;
    socialImpact: string[];
  }>) => void;
}

export function QualityOfLifeSection({
  sleepQuality,
  moodImpact,
  socialImpact,
  onChange
}: QualityOfLifeSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Quality of Life Impact</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sleep Quality (0-10): {sleepQuality}
        </label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="10"
            value={sleepQuality}
            onChange={(e) => onChange({ sleepQuality: parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="grid grid-cols-11 w-full text-xs text-gray-500 px-1">
            {[...Array(11)].map((_, i) => (
              <div key={i} className="text-center">{i}</div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mood Impact (0-10): {moodImpact}
        </label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="10"
            value={moodImpact}
            onChange={(e) => onChange({ moodImpact: parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="grid grid-cols-11 w-full text-xs text-gray-500 px-1">
            {[...Array(11)].map((_, i) => (
              <div key={i} className="text-center">{i}</div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Social Impact
        </label>
        <textarea
          value={socialImpact.join("\n")}
          onChange={(e) => onChange({ socialImpact: e.target.value.split("\n").filter(Boolean) })}
          className="w-full border rounded-md p-2"
          rows={3}
          placeholder="Enter each social impact on a new line (e.g., 'Unable to attend social gatherings')"
        />
      </div>
    </div>
  );
}
