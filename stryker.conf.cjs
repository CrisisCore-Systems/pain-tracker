/**
 * Conservative Stryker configuration for focused mutation testing.
 * This file uses CommonJS so it runs under projects with "type": "module".
 */
module.exports = {
  mutate: [
    'src/utils/**/*.ts',
    'src/services/**/*.ts',
    'src/lib/analytics/**/*.ts',
    'src/utils/**/*.js',
    'src/services/**/*.js',
    'src/lib/analytics/**/*.js'
  ],
  testRunner: 'vitest',
  reporters: ['clear-text', 'html', 'progress', 'json-summary'],
  coverageAnalysis: 'perTest',
  timeoutMS: 600000,
  concurrency: 2,
  thresholds: {
    high: 80,
    low: 60,
    break: 50
  },
  maxConcurrentTestRunners: 2,
  logLevel: 'info'
};
/** @type {import('@stryker-mutator/api/core').StrykerOptions} */
module.exports = {
  mutate: [
    'src/lib/**/*.ts',
    'src/utils/**/*.ts',
    'src/components/pain-tracker/WCBReport.tsx',
    '!src/**/__tests__/**',
    '!src/**/test/**'
  ],
  testRunner: 'command',
  commandRunner: { command: 'npx vitest run --reporter=json --passWithNoTests' },
  reporters: ['clear-text', 'html', 'json'],
  timeoutMS: 10000,
  concurrency: 4,
  thresholds: { high: 80, low: 65, break: 50 },
  coverageAnalysis: 'disabled'
};
