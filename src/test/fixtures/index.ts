/**
 * Test Fixtures Index
 * Central export for all comprehensive test data
 */

// Pain data
export { makePainEntry, generatePainSeries, samplePainLocations, samplePainDescriptions } from './makePainEntry';
export type { PainEntry } from './makePainEntry';

// Mood and empathy data
export {
  sampleMoodEntries,
  extremeMoodEntries,
  empathyRichMoodEntries,
  makeMoodEntry,
  generateMoodProgression,
} from './sampleMoodData';

/**
 * Helper function to get all sample data in one object
 */
export function getAllSampleData() {
  return {
    moods: require('./sampleMoodData'),
  };
}
