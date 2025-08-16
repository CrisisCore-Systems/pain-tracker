#!/usr/bin/env node
/**
 * Master pre-commit orchestrator
 * Runs all checks with configurable skipping and comprehensive reporting
 */

import { exit } from 'node:process';
import { execSync } from 'node:child_process';
import { runTypeCheck } from './typecheck.js';
import { runLint } from './lint.js';
import { runBuild } from './build.js';
import { scanSecrets } from './scan-secrets.js';
import { checkMergeMarkers } from './check-merge-markers.js';
import { checkCollapseVectors } from './check-collapse-vectors.js';

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
  rocket: '🚀',
  shield: '🛡️'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function parseSkipTags() {
  try {
    // Get the commit message from git
    const commitMsg = execSync('git log -1 --pretty=%B', { encoding: 'utf8' }).trim();
    
    const skipTags = {
      typecheck: /\[skip typecheck\]|\[skip ts\]/i.test(commitMsg),
      lint: /\[skip lint\]|\[skip eslint\]/i.test(commitMsg),
      build: /\[skip build\]/i.test(commitMsg),
      secrets: /\[skip secrets\]|\[skip secret\]/i.test(commitMsg),
      merge: /\[skip merge\]|\[skip merge-markers\]/i.test(commitMsg),
      collapse: /\[skip collapse\]|\[skip vectors\]/i.test(commitMsg),
      all: /\[skip all\]|\[skip checks\]/i.test(commitMsg)
    };
    
    return { skipTags };
  } catch {
    // If we can't get commit message (e.g., during pre-commit), return empty
    return { skipTags: {} };
  }
}

// Check configuration
const checks = [
  {
    name: 'CrisisCore Collapse Vectors',
    key: 'collapse',
    icon: icon.shield,
    run: checkCollapseVectors,
    critical: true,
    description: 'Security-critical collapse vector detection'
  },
  {
    name: 'TypeScript Type Checking',
    key: 'typecheck', 
    icon: '📝',
    run: runTypeCheck,
    critical: true,
    description: 'Ensures type safety'
  },
  {
    name: 'ESLint Code Quality',
    key: 'lint',
    icon: '🔍', 
    run: runLint,
    critical: false,
    description: 'Code quality and style checks'
  },
  {
    name: 'Build Verification',
    key: 'build',
    icon: '🏗️',
    run: runBuild,
    critical: true,
    description: 'Verifies application builds successfully'
  },
  {
    name: 'Secret Scanning',
    key: 'secrets',
    icon: '🔐',
    run: scanSecrets,
    critical: true,
    description: 'Detects hardcoded secrets and credentials'
  },
  {
    name: 'Merge Conflict Markers',
    key: 'merge',
    icon: '🔀',
    run: checkMergeMarkers,
    critical: true,
    description: 'Finds unresolved merge conflicts'
  },
  {
    name: 'Tree of Thought Security Analysis',
    key: 'collapse',
    icon: '🌳',
    run: checkCollapseVectors,
    critical: true,
    description: 'Advanced security vector detection with hierarchical reasoning'
  }
];

async function runPreCommitChecks() {
  log(`${icon.rocket} ${colors.bold}Running pre-commit checks...${colors.reset}`, colors.blue);
  console.log();
  
  const { skipTags } = await parseSkipTags();
  
  if (skipTags.all) {
    log(`${icon.warning} ${colors.bold}ALL CHECKS SKIPPED${colors.reset} via commit message`, colors.yellow);
    return { success: true, results: [] };
  }
  
  const results = [];
  const startTime = Date.now();
  
  for (const check of checks) {
    const isSkipped = skipTags[check.key];
    
    if (isSkipped) {
      log(`${check.icon} ${colors.dim}${check.name} (SKIPPED)${colors.reset}`);
      results.push({
        name: check.name,
        success: true,
        skipped: true,
        duration: 0
      });
      continue;
    }
    
    const checkStart = Date.now();
    log(`${check.icon} ${colors.bold}${check.name}${colors.reset}`);
    
    try {
      const result = await check.run();
      const duration = Date.now() - checkStart;
      
      results.push({
        name: check.name,
        success: result.success,
        skipped: false,
        duration,
        details: result,
        critical: check.critical
      });
      
      if (!result.success && check.critical) {
        log(`${colors.dim}  ⏱️  ${duration}ms${colors.reset}`);
      } else if (result.success) {
        log(`${colors.dim}  ⏱️  ${duration}ms${colors.reset}`);
      }
      
    } catch (error) {
      const duration = Date.now() - checkStart;
      log(`${icon.error} ${check.name} failed with error: ${error.message}`, colors.red);
      
      results.push({
        name: check.name,
        success: false,
        skipped: false,
        duration,
        error: error.message,
        critical: check.critical
      });
    }
    
    console.log();
  }
  
  const totalDuration = Date.now() - startTime;
  
  // Summary
  log(`${colors.bold}=== PRE-COMMIT SUMMARY ===${colors.reset}`, colors.cyan);
  
  const passed = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const skipped = results.filter(r => r.skipped);
  const criticalFailed = failed.filter(r => r.critical);
  
  log(`${icon.success} Passed: ${passed.length}`, colors.green);
  if (skipped.length > 0) {
    log(`${icon.warning} Skipped: ${skipped.length}`, colors.yellow);
  }
  if (failed.length > 0) {
    log(`${icon.error} Failed: ${failed.length}`, colors.red);
  }
  log(`⏱️  Total time: ${totalDuration}ms`, colors.dim);
  
  if (failed.length > 0) {
    console.log();
    log(`${colors.bold}FAILED CHECKS:${colors.reset}`, colors.red);
    
    for (const result of failed) {
      const severity = result.critical ? 'CRITICAL' : 'WARNING';
      const severityColor = result.critical ? colors.red : colors.yellow;
      log(`  ${icon.error} ${result.name} (${severity})`, severityColor);
    }
    
    console.log();
    
    if (criticalFailed.length > 0) {
      log(`${icon.tip} Fix critical issues before committing`, colors.yellow);
      log(`${icon.tip} Use [skip <check>] in commit message to bypass specific checks`, colors.yellow);
      log(`${icon.tip} Use [skip all] to bypass all checks (not recommended)`, colors.yellow);
    }
  }
  
  if (skipped.length > 0) {
    console.log();
    log(`${colors.dim}Skipped checks: ${skipped.map(r => r.name).join(', ')}${colors.reset}`);
  }
  
  const success = criticalFailed.length === 0;
  
  if (success) {
    log(`${icon.success} ${colors.bold}All checks passed!${colors.reset}`, colors.green);
  } else {
    log(`${icon.error} ${colors.bold}Pre-commit checks failed${colors.reset}`, colors.red);
  }
  
  return { success, results, duration: totalDuration };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = await runPreCommitChecks();
  exit(result.success ? 0 : 1);
}

export { runPreCommitChecks };