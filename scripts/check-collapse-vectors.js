#!/usr/bin/env node
/**
 * CrisisCore collapse vector detection script
 * Enhanced with Tree of Thought reasoning capabilities
 * Part of the modular pre-commit workflow
 */

import { execSync } from 'node:child_process';
import { exit } from 'node:process';
import { analyzeWithTreeOfThought } from './tree-thought-analyzer.js';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m',
  dim: '\x1b[2m'
};

const icon = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: '🛡️',
  tip: '💡',
  tree: '🌳',
  brain: '🧠'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

const run = (cmd) => { 
  try { 
    return execSync(cmd, {stdio:['ignore','pipe','ignore']}).toString(); 
  } catch { 
    return ''; 
  } 
};

const g = (pat, dirs=['assets','js','src']) => run(`grep -REn --exclude-dir=node_modules --binary-files=without-match '${pat}' ${dirs.join(' ')}`);

// Legacy collapse vector detection (maintained for compatibility)
function checkLegacyCollapseVectors() {
  log(`${icon.info} ${colors.dim}Running legacy pattern-based detection...${colors.reset}`);
  
  const issues = [];
  
  // 1) Randomness in control flow
  const rand = g(String.raw`\bif\s*\([^)]*Math\.random\(|Math\.random\(\)\s*[<>]=?`);
  if (rand) { 
    issues.push({
      type: 'Math.random() in control path',
      severity: 'CRITICAL',
      details: rand
    });
  }
  
  // 2) Mutable state getters
  const mut = g(String.raw`get\w*\s*\(\)[\s\S]{0,200}\{\s*return\s+(this\.|STATE)`);
  if (mut) { 
    issues.push({
      type: 'Getter returns mutable state',
      severity: 'CRITICAL', 
      details: mut
    });
  }
  
  // 3) Potential publish→publish cascade
  const cas = g(String.raw`NeuralBus\.publish\(.*\n{0,10}.*NeuralBus\.publish`, ['assets/js']);
  if (cas) { 
    issues.push({
      type: 'Possible event cascade',
      severity: 'CRITICAL',
      details: cas
    });
  }
  
  return issues;
}

// Enhanced collapse vector detection with Tree of Thought reasoning
function checkCollapseVectors() {
  log(`${icon.brain} ${colors.bold}CrisisCore Collapse Vector Detection${colors.reset}`, colors.blue);
  log(`${colors.bold}Enhanced with Tree of Thought Reasoning${colors.reset}`, colors.magenta);
  console.log();
  
  const startTime = Date.now();
  
  // Run legacy detection first for backward compatibility
  const legacyIssues = checkLegacyCollapseVectors();
  
  // Run enhanced tree-of-thought analysis
  log(`${icon.tree} ${colors.bold}Engaging Tree of Thought Analysis...${colors.reset}`, colors.cyan);
  const treeAnalysis = analyzeWithTreeOfThought();
  
  const totalTime = Date.now() - startTime;
  
  // Combine results
  const totalIssues = legacyIssues.length + (treeAnalysis.criticalPaths || 0);
  
  console.log();
  log(`${colors.bold}=== COLLAPSE VECTOR ANALYSIS SUMMARY ===${colors.reset}`, colors.cyan);
  log(`${icon.info} Analysis method: Hybrid (Legacy + Tree of Thought)`);
  log(`${icon.info} Total analysis time: ${totalTime}ms`);
  log(`${icon.info} Legacy patterns detected: ${legacyIssues.length}`);
  log(`${icon.info} Tree reasoning vectors: ${treeAnalysis.totalIssues || 0}`);
  log(`${icon.info} Critical reasoning paths: ${treeAnalysis.criticalPaths || 0}`);
  console.log();
  
  // Report legacy issues if found
  if (legacyIssues.length > 0) {
    log(`${colors.red}${icon.error} Legacy Pattern Violations:${colors.reset}`);
    for (const issue of legacyIssues) {
      log(`  ${colors.bold}${issue.severity}: ${issue.type}${colors.reset}`, colors.red);
      console.log(`  ${colors.dim}${issue.details.split('\n')[0]}...${colors.reset}`);
    }
    console.log();
  }
  
  // Determine overall result
  const hasCriticalIssues = legacyIssues.some(i => i.severity === 'CRITICAL') || 
                           (treeAnalysis.criticalPaths && treeAnalysis.criticalPaths > 0);
  
  if (totalIssues === 0) {
    log(`${icon.success} ${colors.green}No collapse vectors detected${colors.reset}`);
    log(`${colors.dim}Both legacy and tree-of-thought analysis passed${colors.reset}`);
    return { success: true, issues: [], treeAnalysis };
  } else if (hasCriticalIssues) {
    log(`${icon.error} ${colors.red}CRISIS: Critical collapse vectors detected!${colors.reset}`);
    log(`${colors.dim}Tree of thought reasoning identified high-risk patterns${colors.reset}`);
    return { success: false, issues: legacyIssues, treeAnalysis };
  } else {
    log(`${icon.warning} ${colors.yellow}Potential security vectors found${colors.reset}`);
    log(`${colors.dim}Review tree reasoning analysis for detailed recommendations${colors.reset}`);
    return { success: true, issues: legacyIssues, treeAnalysis, warnings: totalIssues };
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = checkCollapseVectors();
  exit(result.success ? 0 : 1);
}

export { checkCollapseVectors };
