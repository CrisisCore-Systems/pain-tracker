#!/usr/bin/env node
/**
 * ESLint checking script
 * Part of the modular pre-commit workflow
 */

import { execSync } from 'node:child_process';
import { exit } from 'node:process';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

const icon = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: '🔍',
  tip: '💡'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function runLint() {
  log(`${icon.info} ${colors.bold}Running ESLint...${colors.reset}`, colors.blue);
  
  try {
    const output = execSync('npm run lint', { 
      encoding: 'utf8', 
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    // Check if there are warnings in the output
    const hasWarnings = output.includes('warning');
    const warningCount = (output.match(/warning/g) || []).length;
    
    if (hasWarnings) {
      log(`${icon.warning} ESLint passed with ${warningCount} warning(s)`, colors.yellow);
      console.log(output);
    } else {
      log(`${icon.success} ESLint checks passed`, colors.green);
    }
    
    return { success: true, output, warnings: warningCount };
  } catch (error) {
    const errorOutput = error.stdout + error.stderr;
    log(`${icon.error} ESLint checks failed`, colors.red);
    log(`${icon.tip} Run 'npm run lint' to see issues and fix them`, colors.yellow);
    console.log(errorOutput);
    return { success: false, output: errorOutput, warnings: 0 };
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = runLint();
  exit(result.success ? 0 : 1);
}

export { runLint };