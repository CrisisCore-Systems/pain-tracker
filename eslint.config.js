import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default [
  {
    ignores: [
      '**/dist/**',
      '**/.next/**',
      'node_modules/**',
      '*.config.cjs',
      '**/*.config.cjs',
      '**/*.min.js',
      'coverage/**',
      'scripts/db/**',
      'e2e/results/**',
      'test-results/**',
      'playwright-report/**',
      'archive/**',
      'security-reports/**',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.serviceworker,
        React: 'readonly',
        NodeJS: 'readonly',
        RequestInit: 'readonly',
        NotificationPermission: 'readonly',
        NodeListOf: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...typescript.configs.recommended.rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-undef': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    files: ['**/*.{js,jsx,mjs,cjs}'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': 'off',
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    files: ['**/*.cjs'],
    languageOptions: {
      parserOptions: {
        sourceType: 'script',
      },
    },
  },
  {
    // Special config for Service Worker
    files: ['public/sw.js'],
    languageOptions: {
      globals: {
        ...globals.serviceworker,
      }
    }
  },
  {
    // Special config for test files
    files: ['**/*.test.{ts,tsx}', '**/__tests__/**/*.{ts,tsx}', '**/test/**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly',
        jest: 'readonly',
        console: 'readonly',
      }
    },
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    // Playwright specs are not part of Vite/React Fast Refresh.
    files: ['e2e/**/*.{ts,tsx,js,jsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    // Next.js App Router files commonly export non-component route metadata.
    // React Refresh lint rule is not applicable here and creates noisy warnings.
    files: ['packages/blog/src/app/**/*.{ts,tsx,js,jsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  }
]; 