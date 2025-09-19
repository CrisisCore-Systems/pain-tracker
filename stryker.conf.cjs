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
