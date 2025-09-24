const TAG_KEYWORDS: Record<string, string[]> = {
  exercise: ['run', 'walk', 'yoga', 'exercise', 'gym', 'workout', 'stretch'],
  weather: ['rain', 'pressure', 'wind', 'cold', 'hot', 'humid', 'barometer'],
  stress: ['stress', 'anx', 'anxiety', 'stressed', 'worry'],
  sleep: ['sleep', 'insomnia', 'rest', 'tired'],
  medication: ['pill', 'tablet', 'med', 'ibuprofen', 'paracetamol', 'opioid']
};

export function suggestTagsForText(text: string, max = 3): string[] {
  if (!text) return [];
  const lowered = text.toLowerCase();
  const scores: Record<string, number> = {};
  Object.keys(TAG_KEYWORDS).forEach(tag => scores[tag] = 0);
  Object.entries(TAG_KEYWORDS).forEach(([tag, kws]) => {
    kws.forEach(k => {
      if (lowered.includes(k)) scores[tag] += 1;
    });
  });
  const sorted = Object.entries(scores).sort((a,b) => b[1] - a[1]).filter(([_,v]) => v>0).slice(0, max).map(([k]) => k);
  return sorted;
}
