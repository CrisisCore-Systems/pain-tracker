#!/usr/bin/env node
/**
 * TypeScript type checking script
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
  info: '📝',
  tip: '💡'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function runTypeCheck() {
  log(`${icon.info} ${colors.bold}Running TypeScript type checking...${colors.reset}`, colors.blue);
  
  try {
    const output = execSync('npm run typecheck', { 
      encoding: 'utf8', 
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    log(`${icon.success} TypeScript type checking passed`, colors.green);
    return { success: true, output };
  } catch (error) {
    const errorOutput = error.stdout + error.stderr;
    log(`${icon.error} TypeScript type checking failed`, colors.red);
    log(`${icon.tip} Fix type errors before committing:`, colors.yellow);
    console.log(errorOutput);
    return { success: false, output: errorOutput };
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = runTypeCheck();
  exit(result.success ? 0 : 1);
}

export { runTypeCheck };