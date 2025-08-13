// Commitlint configuration for conventional commits
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Enforce conventional commit format
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New features
        'fix',      // Bug fixes
        'docs',     // Documentation changes
        'style',    // Code style changes (formatting, etc.)
        'refactor', // Code refactoring
        'perf',     // Performance improvements
        'test',     // Test additions or modifications
        'chore',    // Maintenance tasks
        'ci',       // CI/CD changes
        'build',    // Build system changes
        'revert',   // Revert previous commits
        'security', // Security fixes
        'deps',     // Dependency updates
        'config',   // Configuration changes
        'wip'       // Work in progress (use sparingly)
      ]
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'subject-case': [2, 'always', 'sentence-case'],
    'subject-max-length': [2, 'always', 72],
    'body-leading-blank': [1, 'always'],
    'body-max-line-length': [2, 'always', 100],
    'footer-leading-blank': [1, 'always'],
    'footer-max-line-length': [2, 'always', 100],
    
    // Custom rules for our workflow
    'scope-case': [1, 'always', 'kebab-case'],
    'scope-max-length': [2, 'always', 20]
  },
  
  // Help text for developers
  helpUrl: 'https://github.com/conventional-changelog/commitlint/#what-is-commitlint',
  
  // Custom message for developers
  formatter: '@commitlint/format',
  
  // Allow empty commits (for git hooks testing)
  defaultIgnores: true,
  
  // Ignore merge commits
  ignores: [
    (message) => message.startsWith('Merge '),
    (message) => message.startsWith('Revert '),
    (message) => message.includes('Co-authored-by:')
  ]
};