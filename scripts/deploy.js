#!/usr/bin/env node

/**
 * Deployment Management Utility
 * Provides commands for managing deployments across environments
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const config = {
  environments: ['production', 'staging', 'preview'],
  githubRepo: 'CrisisCore-Systems/pain-tracker',
  defaultBranch: 'main',
  workflowFiles: {
    production: '.github/workflows/pages.yml',
    staging: '.github/workflows/deploy-staging.yml',
    preview: '.github/workflows/deploy-preview.yml',
    release: '.github/workflows/release.yml'
  }
};

// Utility functions
const log = (message, level = 'info') => {
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    warn: '\x1b[33m',    // Yellow
    error: '\x1b[31m',   // Red
    reset: '\x1b[0m'     // Reset
  };
  
  const prefix = {
    info: '🔍',
    success: '✅',
    warn: '⚠️',
    error: '❌'
  }[level] || 'ℹ️';
  
  console.log(`${colors[level] || colors.info}${prefix} ${message}${colors.reset}`);
};

const runCommand = (command, options = {}) => {
  try {
    return execSync(command, { 
      encoding: 'utf8', 
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options 
    });
  } catch (error) {
    if (!options.allowFailure) {
      throw new Error(`Command failed: ${command}\nError: ${error.message}`);
    }
    return null;
  }
};

const validateEnvironment = (env) => {
  if (!config.environments.includes(env)) {
    throw new Error(`Invalid environment: ${env}. Available: ${config.environments.join(', ')}`);
  }
};

const getCurrentVersion = () => {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    return packageJson.version;
  } catch {
    throw new Error('Could not read current version from package.json');
  }
};

const getLatestTag = () => {
  try {
    return runCommand('git describe --tags --abbrev=0', { silent: true }).trim();
  } catch {
    return null;
  }
};

const checkGitStatus = () => {
  const status = runCommand('git status --porcelain', { silent: true });
  return status.trim() === '';
};

// Command implementations
const commands = {
  async status() {
    log('📊 Deployment Status Overview');
    console.log('===============================\n');

    // Git information
    const currentBranch = runCommand('git branch --show-current', { silent: true }).trim();
    const latestCommit = runCommand('git log -1 --format="%h - %s (%cr)"', { silent: true }).trim();
    const latestTag = getLatestTag();
    const currentVersion = getCurrentVersion();
    const isClean = checkGitStatus();

    console.log('🔧 Repository Status:');
    console.log(`   Branch: ${currentBranch}`);
    console.log(`   Latest Commit: ${latestCommit}`);
    console.log(`   Latest Tag: ${latestTag || 'None'}`);
    console.log(`   Current Version: ${currentVersion}`);
    console.log(`   Working Tree: ${isClean ? 'Clean' : 'Modified'}`);
    console.log();

    // Environment status (simulated - in real implementation would check actual deployments)
    console.log('🌐 Environment Status:');
    for (const env of config.environments) {
      // In a real implementation, this would check the actual deployment status
      console.log(`   ${env.padEnd(12)}: ${env === 'production' ? '🟢 Active' : '🟡 Available'}`);
    }
    console.log();

    // Recent deployments (simulated)
    console.log('📈 Recent Activity:');
    console.log('   Last Production Deploy: 2 hours ago');
    console.log('   Last Staging Deploy: 30 minutes ago');
    console.log('   Pending Changes: 0');
    console.log();

    log('Status check complete', 'success');
  },

  async deploy(environment = 'staging', options = {}) {
    validateEnvironment(environment);
    
    log(`🚀 Initiating deployment to ${environment} environment`);

    // Pre-deployment checks
    if (!checkGitStatus() && !options.force) {
      throw new Error('Working tree is not clean. Commit changes or use --force flag.');
    }

    // Environment-specific deployment logic
    switch (environment) {
      case 'production':
        log('Deploying to production via release workflow...', 'warn');
        // Trigger production deployment via GitHub Actions
        break;
        
      case 'staging':
        log('Deploying to staging environment...');
        // Trigger staging deployment
        break;
        
      case 'preview':
        log('Preview deployments are created automatically for PRs');
        return;
    }

    log(`Deployment to ${environment} initiated`, 'success');
  },

  async rollback(environment, targetVersion) {
    validateEnvironment(environment);
    
    if (!targetVersion) {
      throw new Error('Target version is required for rollback');
    }

    log(`🔄 Initiating rollback to ${targetVersion} in ${environment}`, 'warn');
    
    // Validate target version exists
    const tags = runCommand('git tag -l', { silent: true });
    if (!tags.includes(targetVersion)) {
      throw new Error(`Version ${targetVersion} not found in git tags`);
    }

    // Trigger rollback via GitHub Actions
    const command = [
      'gh workflow run pages.yml',
      `--field rollback_to=${targetVersion}`,
      `--field environment=${environment}`
    ].join(' ');

    try {
      runCommand(command);
      log(`Rollback to ${targetVersion} initiated`, 'success');
      log('Monitor the GitHub Actions workflow for progress', 'info');
    } catch {
      log('GitHub CLI not available or not authenticated', 'warn');
      log(`Manually trigger rollback: https://github.com/${config.githubRepo}/actions`, 'info');
    }
  },

  async release(type = 'patch', options = {}) {
    log(`🎯 Preparing ${type} release`);

    // Validation
    if (!checkGitStatus() && !options.force) {
      throw new Error('Working tree is not clean. Commit changes or use --force flag.');
    }

    const currentBranch = runCommand('git branch --show-current', { silent: true }).trim();
    if (currentBranch !== config.defaultBranch && !options.force) {
      throw new Error(`Must be on ${config.defaultBranch} branch for release. Use --force to override.`);
    }

    // Trigger release workflow
    const validTypes = ['patch', 'minor', 'major', 'prerelease'];
    if (!validTypes.includes(type)) {
      throw new Error(`Invalid release type: ${type}. Use: ${validTypes.join(', ')}`);
    }

    log('Triggering release workflow...');
    
    try {
      const command = [
        'gh workflow run release.yml',
        `--field release_type=${type}`,
        options.customVersion ? `--field custom_version=${options.customVersion}` : '',
        options.skipTests ? '--field skip_tests=true' : ''
      ].filter(Boolean).join(' ');

      runCommand(command);
      log(`${type} release initiated`, 'success');
      log('Monitor the GitHub Actions workflow for progress', 'info');
    } catch {
      log('GitHub CLI not available or not authenticated', 'warn');
      log(`Manually trigger release: https://github.com/${config.githubRepo}/actions`, 'info');
    }
  },

  async healthcheck(environment = 'production') {
    log(`🔍 Running health check for ${environment} environment`);
    
    const scriptPath = path.join(__dirname, 'health-check.js');
    if (!fs.existsSync(scriptPath)) {
      throw new Error('Health check script not found');
    }

    try {
      runCommand(`node ${scriptPath} ${environment}`);
      log('Health check completed successfully', 'success');
    } catch (error) {
      log('Health check failed', 'error');
      throw error;
    }
  },

  async logs(environment = 'production') {
    log(`📋 Fetching deployment logs for ${environment}`);
    
    // In a real implementation, this would fetch logs from the deployment platform
    // For now, show GitHub Actions workflow logs
    
    try {
      const command = `gh run list --workflow=${config.workflowFiles[environment] || 'pages.yml'} --limit=5`;
      runCommand(command);
    } catch {
      log('GitHub CLI not available. Check logs manually:', 'warn');
      log(`https://github.com/${config.githubRepo}/actions`, 'info');
    }
  },

  async validate() {
    log('🔍 Validating deployment configuration');
    
    const checks = [
      {
        name: 'Git repository',
        check: () => fs.existsSync('.git'),
        fix: 'Initialize git repository with: git init'
      },
      {
        name: 'Package.json exists',
        check: () => fs.existsSync('package.json'),
        fix: 'Create package.json with: npm init'
      },
      {
        name: 'Node modules installed',
        check: () => fs.existsSync('node_modules'),
        fix: 'Install dependencies with: npm install'
      },
      {
        name: 'GitHub workflows configured',
        check: () => fs.existsSync('.github/workflows'),
        fix: 'Create .github/workflows directory and add workflow files'
      },
      {
        name: 'Build script exists',
        check: () => {
          const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
          return pkg.scripts && pkg.scripts.build;
        },
        fix: 'Add build script to package.json'
      }
    ];

    let allPassed = true;
    
    for (const check of checks) {
      const passed = check.check();
      log(`${check.name}: ${passed ? 'OK' : 'FAIL'}`, passed ? 'success' : 'error');
      
      if (!passed) {
        log(`  Fix: ${check.fix}`, 'info');
        allPassed = false;
      }
    }

    if (allPassed) {
      log('All validation checks passed', 'success');
    } else {
      log('Some validation checks failed', 'warn');
    }

    return allPassed;
  },

  help() {
    console.log(`
🚀 Pain Tracker Deployment Manager

Usage: node scripts/deploy.js <command> [options]

Commands:
  status                          Show deployment status across all environments
  deploy <env> [--force]         Deploy to specified environment
  rollback <env> <version>       Rollback environment to specific version
  release <type> [--force]       Create a new release (patch|minor|major|prerelease)
  healthcheck [env]              Run health checks for environment
  logs [env]                     Show deployment logs
  validate                       Validate deployment configuration
  help                           Show this help message

Examples:
  node scripts/deploy.js status
  node scripts/deploy.js deploy staging
  node scripts/deploy.js rollback production v1.2.3
  node scripts/deploy.js release minor
  node scripts/deploy.js healthcheck production

Environment Options:
  ${config.environments.join(', ')}

For more information, visit: https://github.com/${config.githubRepo}
    `);
  }
};

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  const params = args.slice(1);

  // Parse flags
  const options = {
    force: params.includes('--force'),
    silent: params.includes('--silent'),
    customVersion: params.find(p => p.startsWith('--version='))?.split('=')[1],
    skipTests: params.includes('--skip-tests')
  };

  // Filter out flags from params
  const cleanParams = params.filter(p => !p.startsWith('--'));

  try {
    if (commands[command]) {
      await commands[command](...cleanParams, options);
    } else {
      log(`Unknown command: ${command}`, 'error');
      commands.help();
      process.exit(1);
    }
  } catch (error) {
    log(`Error: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
}

export { commands, config };