/**
 * Test data and constants for e2e tests
 */

export const TEST_PAIN_LOCATIONS = [
  'Back',
  'Neck',
  'Knee',
  'Shoulder',
  'Head',
  'Wrist',
  'Ankle',
  'Hip'
];

export const TEST_SYMPTOMS = [
  'Aching',
  'Sharp',
  'Burning',
  'Throbbing',
  'Stabbing',
  'Cramping',
  'Tingling',
  'Numbness'
];

export const SAMPLE_PAIN_ENTRIES = [
  {
    intensity: 7,
    locations: ['Back', 'Neck'],
    symptoms: ['Sharp', 'Aching'],
    description: 'Lower back pain after lifting'
  },
  {
    intensity: 4,
    locations: ['Knee'],
    symptoms: ['Throbbing'],
    description: 'Knee pain from running'
  },
  {
    intensity: 9,
    locations: ['Head'],
    symptoms: ['Sharp', 'Throbbing'],
    description: 'Severe migraine headache'
  }
];

export const TEST_TIMEOUTS = {
  FORM_SUBMISSION: 2000,
  PAGE_LOAD: 5000,
  ANIMATION: 500,
  NETWORK_REQUEST: 3000
};

export const TEST_VIEWPORTS = {
  MOBILE: { width: 375, height: 667 },
  TABLET: { width: 768, height: 1024 },
  DESKTOP: { width: 1280, height: 720 },
  DESKTOP_LARGE: { width: 1920, height: 1080 }
};

export const ERROR_MESSAGES = {
  REQUIRED_FIELD: /required|must be|cannot be empty/i,
  INVALID_VALUE: /invalid|out of range|not valid/i,
  NETWORK_ERROR: /network|connection|failed to load/i,
  SAVE_ERROR: /failed to save|save error|could not save/i
};