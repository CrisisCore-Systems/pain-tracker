import { defineConfig } from 'vitest/config';

const isCI = !!process.env.CI;
const coverageEnabled = process.env.VITEST_COVERAGE !== 'false';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['src/test/setup.ts'],
    globals: true,
    // Include tests across the repo, not just under src/test
    include: [
      'src/**/*.test.ts',
      'src/**/*.test.tsx'
    ],
    coverage: {
      enabled: coverageEnabled, // toggle coverage collection via VITEST_COVERAGE env var
      provider: 'v8',
      reportsDirectory: 'coverage',
      reporter: ['text','html','json-summary'],
      // Focus coverage on core logic areas; exclude massive UI surface until component tests added
      include: [
        // Focus on core heuristic/engine/encryption logic currently covered by tests
        'src/services/EmpathyIntelligenceEngine.ts',
        'src/services/EmpathyMetricsCollector.ts',
        'src/services/EncryptionService.ts',
        'src/lib/analytics/heuristics.ts',
  'src/utils/pain-tracker/**/*.ts',
  // Gradually expanding to simple presentational logic
  'src/design-system/components/Button.tsx',
  'src/design-system/components/Card.tsx'
      ],
      exclude: [
        'public/**',
        'scripts/**',
        'coverage/**',
        'dist/**',
        '*.config.{js,ts,cjs,mjs}',
        '**/vite.config.{js,ts,cjs,mjs}',
        '**/tailwind.config.{js,ts,cjs,mjs}',
        '**/postcss.config.{js,ts,cjs,mjs}',
        '**/eslint.config.{js,ts,cjs,mjs}',
        '**/node_modules/**',
        '**/assets/**',
        '**/index.html',
        '**/types/**',
        '**/i18n/**',
        // Very large demo/preview components (treat as integration examples for now)
        '**/components/**/Demo*/**',
        '**/components/**/demo*/**'
      ],
      thresholds: isCI
        ? {
            lines: 50,
            statements: 50,
            branches: 40,
            functions: 50,
          }
        : undefined,
    }
  }
});
