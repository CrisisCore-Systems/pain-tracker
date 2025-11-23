#!/usr/bin/env node
/* eslint-disable */
/**
 * Automated Dark Mode Color Fix Script
 * This script adds dark mode variants to hardcoded Tailwind color classes
 */

const fs = require('fs');
const path = require('path');

// Color mapping for text colors (light → dark)
const textColorMap = {
  'text-gray-900': 'text-gray-900 dark:text-gray-100',
  'text-gray-800': 'text-gray-800 dark:text-gray-200',
  'text-gray-700': 'text-gray-700 dark:text-gray-300',
  'text-gray-600': 'text-gray-600 dark:text-gray-400',
  'text-gray-500': 'text-gray-500 dark:text-gray-400', // Slightly adjusted for better visibility
  'text-gray-400': 'text-gray-400 dark:text-gray-500',
  'text-gray-300': 'text-gray-300 dark:text-gray-600',
  'text-gray-200': 'text-gray-200 dark:text-gray-700',
  'text-gray-100': 'text-gray-100 dark:text-gray-800',
  'text-slate-900': 'text-slate-900 dark:text-slate-100',
  'text-slate-800': 'text-slate-800 dark:text-slate-200',
  'text-slate-700': 'text-slate-700 dark:text-slate-300',
  'text-slate-600': 'text-slate-600 dark:text-slate-400',
  'text-slate-500': 'text-slate-500 dark:text-slate-400',
  'text-slate-400': 'text-slate-400 dark:text-slate-500',
  'text-slate-300': 'text-slate-300 dark:text-slate-600',
  'text-slate-200': 'text-slate-200 dark:text-slate-700',
  'text-slate-100': 'text-slate-100 dark:text-slate-800',
};

// Color mapping for background colors (light → dark)
const bgColorMap = {
  'bg-gray-50': 'bg-gray-50 dark:bg-gray-900',
  'bg-gray-100': 'bg-gray-100 dark:bg-gray-800',
  'bg-gray-200': 'bg-gray-200 dark:bg-gray-700',
  'bg-gray-300': 'bg-gray-300 dark:bg-gray-600',
  'bg-gray-400': 'bg-gray-400 dark:bg-gray-500',
  'bg-gray-500': 'bg-gray-500 dark:bg-gray-500',
  'bg-gray-600': 'bg-gray-600 dark:bg-gray-400',
  'bg-gray-700': 'bg-gray-700 dark:bg-gray-300',
  'bg-gray-800': 'bg-gray-800 dark:bg-gray-200',
  'bg-gray-900': 'bg-gray-900 dark:bg-gray-100',
  'bg-slate-50': 'bg-slate-50 dark:bg-slate-900',
  'bg-slate-100': 'bg-slate-100 dark:bg-slate-800',
  'bg-slate-200': 'bg-slate-200 dark:bg-slate-700',
  'bg-slate-300': 'bg-slate-300 dark:bg-slate-600',
  'bg-slate-400': 'bg-slate-400 dark:bg-slate-500',
  'bg-slate-500': 'bg-slate-500 dark:bg-slate-500',
  'bg-slate-600': 'bg-slate-600 dark:bg-slate-400',
  'bg-slate-700': 'bg-slate-700 dark:bg-slate-300',
  'bg-slate-800': 'bg-slate-800 dark:bg-slate-200',
  'bg-slate-900': 'bg-slate-900 dark:bg-slate-100',
};

// Border color mapping
const borderColorMap = {
  'border-gray-200': 'border-gray-200 dark:border-gray-700',
  'border-gray-300': 'border-gray-300 dark:border-gray-600',
  'border-gray-400': 'border-gray-400 dark:border-gray-500',
  'border-gray-500': 'border-gray-500 dark:border-gray-500',
  'border-gray-600': 'border-gray-600 dark:border-gray-400',
  'border-gray-700': 'border-gray-700 dark:border-gray-300',
  'border-slate-200': 'border-slate-200 dark:border-slate-700',
  'border-slate-300': 'border-slate-300 dark:border-slate-600',
  'border-slate-400': 'border-slate-400 dark:border-slate-500',
  'border-slate-500': 'border-slate-500 dark:border-slate-500',
  'border-slate-600': 'border-slate-600 dark:border-slate-400',
  'border-slate-700': 'border-slate-700 dark:border-slate-300',
};

// Merge all mappings
const colorMap = { ...textColorMap, ...bgColorMap, ...borderColorMap };

function fixDarkModeInFile(filePath, dryRun = false) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let changeCount = 0;
  
  const processedLines = lines.map(line => {
    let processedLine = line;
    
    // Only process lines that have className
    if (!line.includes('className')) {
      return line;
    }
    
    // For each color in our map
    for (const [oldColor, newColor] of Object.entries(colorMap)) {
      // Extract the color type (e.g., "text", "bg", "border")
      const colorType = oldColor.split('-')[0];
      
      // Check if this line contains the old color
      const oldColorRegex = new RegExp(`\\b${oldColor}\\b`, 'g');
      if (oldColorRegex.test(processedLine)) {
        // Check if this line already has ANY dark: variant for this color type
        // This checks for dark:text-*, dark:bg-*, dark:border-*
        const darkVariantRegex = new RegExp(`\\bdark:${colorType}-[\\w-]+\\b`);
        
        // Only add dark variant if none exists for this color type
        if (!darkVariantRegex.test(processedLine)) {
          processedLine = processedLine.replace(oldColorRegex, newColor);
          changeCount++;
        }
      }
    }
    
    return processedLine;
  });
  
  const newContent = processedLines.join('\n');

  if (changeCount > 0) {
    console.log(`${dryRun ? '[DRY RUN] ' : ''}Fixed ${changeCount} colors in: ${filePath}`);
    
    if (!dryRun) {
      fs.writeFileSync(filePath, newContent, 'utf8');
    }
    return changeCount;
  }

  return 0;
}

function processDirectory(dirPath, dryRun = false) {
  const files = fs.readdirSync(dirPath);
  let totalChanges = 0;

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules, dist, build, .git
      if (!['node_modules', 'dist', 'build', '.git', '.vite', 'test', '__tests__'].includes(file)) {
        totalChanges += processDirectory(filePath, dryRun);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      // Skip test files
      if (!file.includes('.test.') && !file.includes('.spec.')) {
        totalChanges += fixDarkModeInFile(filePath, dryRun);
      }
    }
  }

  return totalChanges;
}

// Main execution
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const targetPath = args.find(arg => !arg.startsWith('--')) || 'src';

console.log(`${dryRun ? 'DRY RUN: ' : ''}Processing ${targetPath}...`);
console.log('');

const totalChanges = processDirectory(targetPath, dryRun);

console.log('');
console.log(`${dryRun ? '[DRY RUN] ' : ''}Total changes: ${totalChanges}`);

if (dryRun) {
  console.log('');
  console.log('Run without --dry-run to apply changes.');
}
