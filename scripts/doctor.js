#!/usr/bin/env node
/**
 * Environment and setup diagnostic script
 * Validates development environment and helps troubleshoot common issues
 */

import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { exit } from 'node:process';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  dim: '\x1b[2m'
};

const icon = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: '🔍',
  tip: '💡',
  doctor: '👨‍⚕️',
  heart: '💓',
  tools: '🔧'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function getVersion(command) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}

function checkFileExists(path, required = true) {
  const exists = existsSync(path);
  const severity = required ? (exists ? 'success' : 'error') : (exists ? 'success' : 'warning');
  const iconType = severity === 'success' ? icon.success : (severity === 'error' ? icon.error : icon.warning);
  const colorType = severity === 'success' ? colors.green : (severity === 'error' ? colors.red : colors.yellow);
  
  log(`  ${iconType} ${path} ${exists ? 'exists' : 'missing'}`, colorType);
  return { exists, severity };
}

function checkNodeVersion() {
  log(`${icon.tools} ${colors.bold}Node.js Environment${colors.reset}`, colors.blue);
  
  const issues = [];
  
  // Node.js version
  const nodeVersion = getVersion('node --version');
  if (nodeVersion) {
    const majorVersion = parseInt(nodeVersion.replace('v', '').split('.')[0]);
    if (majorVersion >= 18) {
      log(`  ${icon.success} Node.js: ${nodeVersion}`, colors.green);
    } else {
      log(`  ${icon.error} Node.js: ${nodeVersion} (requires v18+)`, colors.red);
      issues.push('Node.js version too old - upgrade to v18 or newer');
    }
  } else {
    log(`  ${icon.error} Node.js: Not found`, colors.red);
    issues.push('Node.js not installed');
  }
  
  // npm version
  const npmVersion = getVersion('npm --version');
  if (npmVersion) {
    log(`  ${icon.success} npm: ${npmVersion}`, colors.green);
  } else {
    log(`  ${icon.error} npm: Not found`, colors.red);
    issues.push('npm not installed');
  }
  
  return issues;
}

function checkGitSetup() {
  log(`${icon.tools} ${colors.bold}Git Configuration${colors.reset}`, colors.blue);
  
  const issues = [];
  
  // Git version
  const gitVersion = getVersion('git --version');
  if (gitVersion) {
    log(`  ${icon.success} Git: ${gitVersion}`, colors.green);
  } else {
    log(`  ${icon.error} Git: Not found`, colors.red);
    issues.push('Git not installed');
    return issues;
  }
  
  // Git user configuration
  const gitUser = getVersion('git config user.name');
  const gitEmail = getVersion('git config user.email');
  
  if (gitUser) {
    log(`  ${icon.success} Git user: ${gitUser}`, colors.green);
  } else {
    log(`  ${icon.warning} Git user not set`, colors.yellow);
    issues.push('Set git user: git config --global user.name "Your Name"');
  }
  
  if (gitEmail) {
    log(`  ${icon.success} Git email: ${gitEmail}`, colors.green);
  } else {
    log(`  ${icon.warning} Git email not set`, colors.yellow);
    issues.push('Set git email: git config --global user.email "you@example.com"');
  }
  
  // Husky setup
  const huskyExists = existsSync('.husky');
  if (huskyExists) {
    log(`  ${icon.success} Husky hooks installed`, colors.green);
  } else {
    log(`  ${icon.warning} Husky hooks not installed`, colors.yellow);
    issues.push('Run "npm run prepare" to install Husky hooks');
  }
  
  return issues;
}

function checkProjectFiles() {
  log(`${icon.tools} ${colors.bold}Project Files${colors.reset}`, colors.blue);
  
  const issues = [];
  
  // Required files
  const requiredFiles = [
    'package.json',
    'tsconfig.json', 
    '.env.example',
    'src/',
    'scripts/'
  ];
  
  for (const file of requiredFiles) {
    const result = checkFileExists(file, true);
    if (!result.exists) {
      issues.push(`Missing required file: ${file}`);
    }
  }
  
  // Optional but recommended files
  const optionalFiles = [
    '.env',
    '.gitignore',
    'README.md',
    'vite.config.ts'
  ];
  
  for (const file of optionalFiles) {
    checkFileExists(file, false);
  }
  
  return issues;
}

function checkDependencies() {
  log(`${icon.tools} ${colors.bold}Dependencies${colors.reset}`, colors.blue);
  
  const issues = [];
  
  // Check if node_modules exists
  const nodeModulesExists = existsSync('node_modules');
  if (nodeModulesExists) {
    log(`  ${icon.success} node_modules directory exists`, colors.green);
  } else {
    log(`  ${icon.error} node_modules directory missing`, colors.red);
    issues.push('Run "npm install" to install dependencies');
    return issues;
  }
  
  // Check package-lock.json
  const lockExists = existsSync('package-lock.json');
  if (lockExists) {
    log(`  ${icon.success} package-lock.json exists`, colors.green);
  } else {
    log(`  ${icon.warning} package-lock.json missing`, colors.yellow);
    issues.push('Consider running "npm install" to generate package-lock.json');
  }
  
  // Check for potential dependency issues
  try {
    execSync('npm ls --depth=0', { stdio: 'ignore' });
    log(`  ${icon.success} Dependencies are properly installed`, colors.green);
  } catch {
    log(`  ${icon.warning} Some dependencies may have issues`, colors.yellow);
    issues.push('Run "npm ls" to check for dependency problems');
  }
  
  return issues;
}

function validateEnvFile() {
  log(`${icon.tools} ${colors.bold}Environment Configuration${colors.reset}`, colors.blue);
  
  const issues = [];
  
  // Check .env.example
  if (existsSync('.env.example')) {
    log(`  ${icon.success} .env.example found`, colors.green);
    
    try {
      const envExample = readFileSync('.env.example', 'utf8');
      const exampleVars = envExample.split('\n')
        .filter(line => line.trim() && !line.startsWith('#'))
        .map(line => line.split('=')[0].trim());
      
      log(`  ${icon.info} Example environment variables:`, colors.cyan);
      for (const variable of exampleVars) {
        log(`    - ${variable}`, colors.dim);
      }
      
      // Check if .env exists and has required variables
      if (existsSync('.env')) {
        log(`  ${icon.success} .env file exists`, colors.green);
        
        const envContent = readFileSync('.env', 'utf8');
        const envVars = envContent.split('\n')
          .filter(line => line.trim() && !line.startsWith('#'))
          .map(line => line.split('=')[0].trim());
        
        const missingVars = exampleVars.filter(variable => !envVars.includes(variable));
        if (missingVars.length > 0) {
          log(`  ${icon.warning} Missing environment variables:`, colors.yellow);
          for (const variable of missingVars) {
            log(`    - ${variable}`, colors.yellow);
          }
          issues.push('Copy missing variables from .env.example to .env');
        } else {
          log(`  ${icon.success} All example variables present in .env`, colors.green);
        }
      } else {
        log(`  ${icon.warning} .env file not found`, colors.yellow);
        issues.push('Copy .env.example to .env and configure variables');
      }
      
    } catch (error) {
      log(`  ${icon.error} Could not read .env.example: ${error.message}`, colors.red);
      issues.push('Fix .env.example file permissions or content');
    }
  } else {
    log(`  ${icon.error} .env.example not found`, colors.red);
    issues.push('Create .env.example with required environment variables');
  }
  
  return issues;
}

function checkScripts() {
  log(`${icon.tools} ${colors.bold}Build and Test Commands${colors.reset}`, colors.blue);
  
  const issues = [];
  
  const scripts = [
    { name: 'typecheck', description: 'TypeScript type checking' },
    { name: 'lint', description: 'ESLint code quality' },
    { name: 'build', description: 'Production build' },
    { name: 'test', description: 'Unit tests' }
  ];
  
  try {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    
    for (const { name, description } of scripts) {
      if (packageJson.scripts && packageJson.scripts[name]) {
        log(`  ${icon.success} ${name}: ${description}`, colors.green);
        
        // Test basic commands
        try {
          if (name === 'typecheck') {
            execSync('npm run typecheck', { stdio: 'ignore', timeout: 10000 });
            log(`    ${icon.success} Command works`, colors.green);
          }
        } catch {
          log(`    ${icon.warning} Command failed (may need setup)`, colors.yellow);
          issues.push(`Fix "${name}" script or install missing dependencies`);
        }
      } else {
        log(`  ${icon.error} ${name}: Missing script`, colors.red);
        issues.push(`Add "${name}" script to package.json`);
      }
    }
  } catch (error) {
    log(`  ${icon.error} Could not read package.json: ${error.message}`, colors.red);
    issues.push('Fix package.json syntax or permissions');
  }
  
  return issues;
}

function generateSummary(allIssues) {
  console.log();
  log(`${icon.doctor} ${colors.bold}=== DIAGNOSIS SUMMARY ===${colors.reset}`, colors.cyan);
  
  if (allIssues.length === 0) {
    log(`${icon.heart} ${colors.bold}Excellent! Your development environment is healthy!${colors.reset}`, colors.green);
    log(`${icon.success} All checks passed - you're ready to develop`, colors.green);
    return true;
  }
  
  const criticalIssues = allIssues.filter(issue => 
    issue.includes('not installed') || 
    issue.includes('Missing required') ||
    issue.includes('upgrade to')
  );
  
  const warningIssues = allIssues.filter(issue => !criticalIssues.includes(issue));
  
  if (criticalIssues.length > 0) {
    log(`${icon.error} ${colors.bold}CRITICAL ISSUES (${criticalIssues.length}):${colors.reset}`, colors.red);
    for (const issue of criticalIssues) {
      log(`  ${icon.error} ${issue}`, colors.red);
    }
    console.log();
  }
  
  if (warningIssues.length > 0) {
    log(`${icon.warning} ${colors.bold}RECOMMENDATIONS (${warningIssues.length}):${colors.reset}`, colors.yellow);
    for (const issue of warningIssues) {
      log(`  ${icon.warning} ${issue}`, colors.yellow);
    }
    console.log();
  }
  
  // Helpful tips
  log(`${icon.tip} ${colors.bold}Quick Fixes:${colors.reset}`, colors.cyan);
  log(`  ${icon.tools} Run "npm install" to install dependencies`, colors.cyan);
  log(`  ${icon.tools} Copy ".env.example" to ".env" for environment setup`, colors.cyan);
  log(`  ${icon.tools} Run "npm run prepare" to set up git hooks`, colors.cyan);
  log(`  ${icon.tools} Run "npm run typecheck" to verify TypeScript setup`, colors.cyan);
  
  return criticalIssues.length === 0;
}

async function runDiagnostics() {
  log(`${icon.doctor} ${colors.bold}Pain Tracker Environment Doctor${colors.reset}`, colors.blue);
  log(`${colors.dim}Diagnosing your development environment...${colors.reset}`);
  console.log();
  
  const allIssues = [
    ...checkNodeVersion(),
    ...checkGitSetup(),
    ...checkProjectFiles(),
    ...checkDependencies(),
    ...validateEnvFile(),
    ...checkScripts()
  ];
  
  const healthy = generateSummary(allIssues);
  
  return { healthy, issues: allIssues };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = await runDiagnostics();
  exit(result.healthy ? 0 : 1);
}

export { runDiagnostics };