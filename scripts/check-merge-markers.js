#!/usr/bin/env node
/**
 * Merge marker detection script
 * Part of the modular pre-commit workflow
 */

import { readFileSync, statSync } from 'node:fs';
import { exit } from 'node:process';
import { glob } from 'glob';

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
  info: '🔀',
  tip: '💡'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Merge conflict markers to detect
const mergeMarkers = [
  { pattern: /^<<<<<<< /, name: 'Start of conflict' },
  { pattern: /^=======$/, name: 'Conflict separator' },
  { pattern: /^>>>>>>> /, name: 'End of conflict' },
  { pattern: /^\|\|\|\|\|\|\| /, name: 'Common ancestor (diff3)' }
];

async function checkMergeMarkers() {
  log(`${icon.info} ${colors.bold}Checking for merge conflict markers...${colors.reset}`, colors.blue);
  
  const conflicts = [];
  
  try {
    // Get all text files
    const files = await glob('**/*.{ts,tsx,js,jsx,mjs,json,md,txt,yml,yaml}', {
      ignore: ['node_modules/**', 'dist/**', 'build/**', '.git/**', 'coverage/**'],
      dot: false
    });
    
    const existingFiles = files.filter(file => {
      try {
        return statSync(file).isFile();
      } catch {
        return false;
      }
    });
    
    log(`${colors.cyan}Scanning ${existingFiles.length} files for merge markers...${colors.reset}`);
    
    for (const file of existingFiles) {
      try {
        const content = readFileSync(file, 'utf8');
        const lines = content.split('\n');
        
        for (let lineNum = 0; lineNum < lines.length; lineNum++) {
          const line = lines[lineNum];
          
          for (const { pattern, name } of mergeMarkers) {
            if (pattern.test(line)) {
              conflicts.push({
                file,
                line: lineNum + 1,
                content: line.trim(),
                markerType: name
              });
            }
          }
        }
      } catch (error) {
        // Skip files that can't be read
        if (error.code !== 'ENOENT' && error.code !== 'EISDIR') {
          log(`${icon.warning} Could not read file ${file}: ${error.message}`, colors.yellow);
        }
      }
    }
    
    if (conflicts.length === 0) {
      log(`${icon.success} No merge conflict markers found`, colors.green);
      return { success: true, conflicts: [] };
    }
    
    log(`${icon.error} Found ${conflicts.length} merge conflict marker(s):`, colors.red);
    console.log();
    
    // Group conflicts by file
    const conflictsByFile = {};
    for (const conflict of conflicts) {
      if (!conflictsByFile[conflict.file]) {
        conflictsByFile[conflict.file] = [];
      }
      conflictsByFile[conflict.file].push(conflict);
    }
    
    for (const [file, fileConflicts] of Object.entries(conflictsByFile)) {
      log(`${colors.cyan}${file}:${colors.reset}`, colors.cyan);
      for (const conflict of fileConflicts) {
        console.log(`  ${colors.yellow}Line ${conflict.line}: ${conflict.markerType}${colors.reset}`);
        console.log(`    ${colors.dim}> ${conflict.content}${colors.reset}`);
      }
      console.log();
    }
    
    log(`${icon.tip} Resolve merge conflicts before committing`, colors.yellow);
    log(`${icon.tip} Remove all <<<<<<, ======, and >>>>>> markers`, colors.yellow);
    
    return { success: false, conflicts };
    
  } catch (error) {
    log(`${icon.error} Error checking merge markers: ${error.message}`, colors.red);
    return { success: false, conflicts: [], error: error.message };
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = await checkMergeMarkers();
  exit(result.success ? 0 : 1);
}

export { checkMergeMarkers };