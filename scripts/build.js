#!/usr/bin/env node
/**
 * Build verification script
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
  info: '🏗️',
  tip: '💡'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function runBuild() {
  log(`${icon.info} ${colors.bold}Verifying build integrity...${colors.reset}`, colors.blue);
  
  const buildEnv = {
    ...process.env,
    VITE_APP_ENVIRONMENT: 'development',
    VITE_WCB_API_ENDPOINT: '/api/wcb'
  };
  
  try {
    const output = execSync('npm run build', { 
      encoding: 'utf8', 
      stdio: ['ignore', 'pipe', 'pipe'],
      env: buildEnv
    });
    
    log(`${icon.success} Build verification passed`, colors.green);
    
    // Extract build stats from output
    const lines = output.split('\n');
    const statsLines = lines.filter(line => 
      line.includes('kB') && (line.includes('dist/') || line.includes('gzip'))
    );
    
    if (statsLines.length > 0) {
      log(`${colors.cyan}Build output summary:${colors.reset}`);
      statsLines.forEach(line => console.log(`  ${line.trim()}`));
    }
    
    return { success: true, output };
  } catch (error) {
    const errorOutput = error.stdout + error.stderr;
    log(`${icon.error} Build verification failed`, colors.red);
    log(`${icon.tip} Fix build errors before committing`, colors.yellow);
    console.log(errorOutput);
    return { success: false, output: errorOutput };
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = runBuild();
  exit(result.success ? 0 : 1);
}

export { runBuild };