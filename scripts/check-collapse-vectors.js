#!/usr/bin/env node
/**
 * CrisisCore collapse vector detection script
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
  info: '🛡️',
  tip: '💡'
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

function checkCollapseVectors() {
  log(`${icon.info} ${colors.bold}Checking for CrisisCore collapse vectors...${colors.reset}`, colors.blue);
  
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
  
  if (issues.length === 0) {
    log(`${icon.success} No collapse vectors detected`, colors.green);
    return { success: true, issues: [] };
  }
  
  log(`${icon.error} CRISIS: ${issues.length} collapse vector(s) detected!`, colors.red);
  console.log();
  
  for (const issue of issues) {
    log(`${colors.bold}${issue.severity}: ${issue.type}${colors.reset}`, colors.red);
    console.log(issue.details);
    console.log();
  }
  
  return { success: false, issues };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = checkCollapseVectors();
  exit(result.success ? 0 : 1);
}

export { checkCollapseVectors };
