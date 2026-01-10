#!/usr/bin/env node
/**
 * Tree of Thought Reasoning for Security Analysis
 * Advanced hierarchical security vector detection with decision tree logic
 */

import { execSync } from 'node:child_process';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

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
  tree: '🌳',
  branch: '├─',
  leaf: '└─',
  thought: '💭',
  analysis: '🔍'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Tree node structure for reasoning paths
class ThoughtNode {
  constructor(type, description, severity = 'INFO', evidence = null, confidence = 0.0) {
    this.type = type;
    this.description = description;
    this.severity = severity;
    this.evidence = evidence;
    this.confidence = confidence;
    this.children = [];
    this.reasoning = null;
    this.dependencies = [];
    this.mitigations = [];
  }

  addChild(node) {
    this.children.push(node);
    return node;
  }

  addDependency(node) {
    this.dependencies.push(node);
    return this;
  }

  addMitigation(strategy) {
    this.mitigations.push(strategy);
    return this;
  }

  setReasoning(reasoning) {
    this.reasoning = reasoning;
    return this;
  }

  // Calculate compound severity based on dependencies and evidence
  calculateCompoundSeverity() {
    if (this.dependencies.length === 0) return this.severity;
    
    const severityWeights = { 
      'CRITICAL': 4, 
      'HIGH': 3, 
      'MEDIUM': 2, 
      'LOW': 1, 
      'INFO': 0 
    };
    
    const baseWeight = severityWeights[this.severity] || 0;
    const depWeight = Math.max(...this.dependencies.map(dep => 
      severityWeights[dep.calculateCompoundSeverity()] || 0
    ));
    
    const compoundWeight = Math.min(baseWeight + Math.floor(depWeight * 0.5), 4);
    return Object.keys(severityWeights)[compoundWeight] || 'INFO';
  }

  // Get all paths from root to leaves
  getAllPaths(currentPath = []) {
    const newPath = [...currentPath, this];
    
    if (this.children.length === 0) {
      return [newPath];
    }
    
    return this.children.flatMap(child => child.getAllPaths(newPath));
  }

  toString(indent = 0) {
    const prefix = '  '.repeat(indent);
    const severityColor = {
      'CRITICAL': colors.red,
      'HIGH': colors.yellow,
      'MEDIUM': colors.cyan,
      'LOW': colors.blue,
      'INFO': colors.dim
    }[this.severity] || colors.reset;
    
    let result = `${prefix}${severityColor}[${this.severity}] ${this.type}: ${this.description}${colors.reset}\n`;
    
    if (this.evidence) {
      result += `${prefix}  ${colors.dim}Evidence: ${this.evidence}${colors.reset}\n`;
    }
    
    if (this.reasoning) {
      result += `${prefix}  ${colors.dim}Reasoning: ${this.reasoning}${colors.reset}\n`;
    }
    
    if (this.confidence > 0) {
      result += `${prefix}  ${colors.dim}Confidence: ${(this.confidence * 100).toFixed(1)}%${colors.reset}\n`;
    }

    this.children.forEach(child => {
      result += child.toString(indent + 1);
    });
    
    return result;
  }
}

// Advanced pattern matcher with contextual analysis
function analyzeCodeContext(filepath, content) {
  const analysis = {
    imports: [],
    exports: [],
    functions: [],
    classes: [],
    hooks: [],
    eventListeners: [],
    asyncOperations: [],
    stateManagement: [],
    errorHandling: []
  };

  // Extract imports
  const importMatches = content.match(/import\s+.*?from\s+['"][^'"]*['"]/g) || [];
  analysis.imports = importMatches.map(imp => imp.trim());

  // Extract function definitions
  const functionMatches = content.match(/(?:function\s+\w+|const\s+\w+\s*=\s*(?:\([^)]*\)\s*=>|\w+\s*=>|function))/g) || [];
  analysis.functions = functionMatches;

  // Extract React hooks usage
  const hookMatches = content.match(/use[A-Z]\w*/g) || [];
  analysis.hooks = [...new Set(hookMatches)];

  // Extract async operations
  const asyncMatches = content.match(/(?:async\s+function|await\s+|\.then\(|\.catch\(|Promise\.|setTimeout|setInterval)/g) || [];
  analysis.asyncOperations = asyncMatches;

  // Extract state management patterns
  const stateMatches = content.match(/(?:useState|useReducer|setState|this\.state|dispatch|store\.|global\.)/g) || [];
  analysis.stateManagement = stateMatches;

  // Extract error handling
  const errorMatches = content.match(/(?:try\s*\{|catch\s*\(|throw\s+|Error\(|console\.error)/g) || [];
  analysis.errorHandling = errorMatches;

  return analysis;
}

// Core tree-of-thought reasoning engine
function buildSecurityReasoningTree() {
  log(`${icon.tree} ${colors.bold}Building Tree of Thought Security Analysis...${colors.reset}`, colors.blue);
  
  const rootNode = new ThoughtNode(
    'SECURITY_ANALYSIS_ROOT',
    'Comprehensive security vector analysis using tree-of-thought reasoning',
    'INFO',
    null,
    1.0
  );

  // Branch 1: Code Execution Risks
  const codeExecBranch = rootNode.addChild(new ThoughtNode(
    'CODE_EXECUTION_RISKS',
    'Analysis of dynamic code execution and injection vectors',
    'HIGH'
  ));

  // Branch 2: State Management Risks  
  const stateBranch = rootNode.addChild(new ThoughtNode(
    'STATE_MANAGEMENT_RISKS', 
    'Analysis of state mutation and data flow security',
    'MEDIUM'
  ));

  // Branch 3: Async/Concurrency Risks
  const asyncBranch = rootNode.addChild(new ThoughtNode(
    'ASYNC_CONCURRENCY_RISKS',
    'Analysis of race conditions and async security vectors', 
    'HIGH'
  ));

  // Branch 4: Data Flow Risks - only flag if actual issues found
  const dataFlowBranch = rootNode.addChild(new ThoughtNode(
    'DATA_FLOW_RISKS',
    'Analysis of data exposure and leakage vectors',
    'HIGH'  // Reduce from CRITICAL since it's analysis-only
  ));

  return { rootNode, codeExecBranch, stateBranch, asyncBranch, dataFlowBranch };
}

// Enhanced file analysis with tree reasoning
function analyzeFileWithTreeReasoning(filepath, tree) {
  if (!existsSync(filepath)) return [];

  const content = readFileSync(filepath, 'utf8');
  const context = analyzeCodeContext(filepath, content);
  const issues = [];

  const { codeExecBranch, stateBranch, asyncBranch, dataFlowBranch } = tree;

  // Code Execution Analysis
  const randomInControl = content.match(/\bif\s*\([^)]*Math\.random\(|Math\.random\(\)\s*[<>]=?/g);
  if (randomInControl) {
    const issue = codeExecBranch.addChild(new ThoughtNode(
      'RANDOM_CONTROL_FLOW',
      'Non-deterministic control flow detected',
      'CRITICAL',
      `Found ${randomInControl.length} instances in ${filepath}`,
      0.9
    ));
    
    issue.setReasoning(
      'Math.random() in control flow creates unpredictable execution paths that can be exploited for collapse vectors'
    );
    
    // Check for compound risk - random + async
    if (context.asyncOperations.length > 0) {
      const compoundIssue = issue.addChild(new ThoughtNode(
        'ASYNC_RANDOM_COMPOUND',
        'Random control flow combined with async operations',
        'CRITICAL',
        `Async operations: ${context.asyncOperations.length}`,
        0.95
      ));
      compoundIssue.setReasoning(
        'Combination of randomness and async operations significantly increases collapse vector risk'
      );
    }
    
    issues.push(issue);
  }

  // State Management Analysis
  const mutableGetters = content.match(/get\w*\s*\(\)[\s\S]{0,200}\{\s*return\s+(this\.|STATE)/g);
  if (mutableGetters) {
    const issue = stateBranch.addChild(new ThoughtNode(
      'MUTABLE_GETTER_EXPOSURE',
      'Getters exposing mutable state references',
      'HIGH',
      `Found ${mutableGetters.length} potential violations in ${filepath}`,
      0.8
    ));
    
    issue.setReasoning(
      'Getters returning direct references to mutable state allow external manipulation'
    );
    
    // Check if this file has state management
    if (context.stateManagement.length > 0) {
      issue.confidence = Math.min(issue.confidence + 0.15, 1.0);
      issue.addChild(new ThoughtNode(
        'STATE_MANAGEMENT_DETECTED',
        'File contains state management patterns',
        'MEDIUM',
        `Patterns: ${context.stateManagement.slice(0, 3).join(', ')}`,
        0.9
      ));
    }
    
    issues.push(issue);
  }

  // Async Analysis with dependency tracking
  const asyncWrite = content.match(/async.*=.*(?!await)/g);
  if (asyncWrite) {
    const issue = asyncBranch.addChild(new ThoughtNode(
      'ASYNC_WITHOUT_AWAIT',
      'Async operations without proper await handling',
      'MEDIUM',
      `Found ${asyncWrite.length} instances in ${filepath}`,
      0.7
    ));
    
    issue.setReasoning(
      'Async operations without await can lead to race conditions and state corruption'
    );
    
    // Enhanced reasoning: check error handling
    if (context.errorHandling.length === 0) {
      const errorIssue = issue.addChild(new ThoughtNode(
        'NO_ERROR_HANDLING',
        'Missing error handling for async operations',
        'HIGH',
        'No try/catch or error handling detected',
        0.85
      ));
      errorIssue.setReasoning(
        'Unhandled async errors can propagate and cause system instability'
      );
    }
    
    issues.push(issue);
  }

  // Data Flow Analysis
  const memoryBleed = content.match(/window\[.*\].*=.*(?!null)/g);
  if (memoryBleed) {
    const issue = dataFlowBranch.addChild(new ThoughtNode(
      'MEMORY_POLLUTION',
      'Global scope pollution detected',
      'HIGH',
      `Found ${memoryBleed.length} global assignments in ${filepath}`,
      0.75
    ));
    
    issue.setReasoning(
      'Direct window object manipulation can lead to memory leaks and global state pollution'
    );
    
    issues.push(issue);
  }

  // Event cascade analysis (enhanced from original)
  const cascadePattern = content.match(/\.publish\(.*\n{0,10}.*\.publish/g);
  if (cascadePattern) {
    const issue = asyncBranch.addChild(new ThoughtNode(
      'EVENT_CASCADE_RISK',
      'Potential event publishing cascade detected',
      'CRITICAL',
      `Found ${cascadePattern.length} cascade patterns in ${filepath}`,
      0.8
    ));
    
    issue.setReasoning(
      'Rapid event cascades can overwhelm the system and create collapse conditions'
    );
    
    // Check for event listener cleanup
    if (!content.includes('removeEventListener') && !content.includes('unsubscribe')) {
      const cleanupIssue = issue.addChild(new ThoughtNode(
        'NO_EVENT_CLEANUP',
        'Missing event listener cleanup',
        'MEDIUM',
        'No cleanup patterns detected',
        0.7
      ));
      cleanupIssue.setReasoning(
        'Without proper cleanup, event cascades can accumulate and cause memory leaks'
      );
    }
    
    issues.push(issue);
  }

  return issues;
}


// Enhanced directory scanner
function scanDirectory(dir, extensions = ['.js', '.jsx', '.ts', '.tsx'], fileList = [], depth = 0) {
  if (depth > 10 || fileList.length >= 100) return fileList; // simple limits

  try {
    const files = readdirSync(dir);
    for (const file of files) {
      if (file === 'node_modules' || file.startsWith('.')) continue;
      
      const filePath = join(dir, file);
      const stat = statSync(filePath);

      if (stat.isDirectory()) {
         scanDirectory(filePath, extensions, fileList, depth + 1);
      } else {
        if (extensions.some(ext => file.endsWith(ext))) {
          fileList.push(filePath);
        }
      }
      if (fileList.length >= 100) break;
    }
  } catch (e) {
    // Directory access error or not found
  }
  
  return fileList;
}

// Main tree-of-thought analysis function
export function analyzeWithTreeOfThought() {
  log(`${icon.thought} ${colors.bold}Tree of Thought Security Reasoning${colors.reset}`, colors.magenta);
  log(`${colors.dim}Analyzing security vectors with hierarchical decision trees...${colors.reset}`);
  
  const startTime = Date.now();
  const tree = buildSecurityReasoningTree();
  const directories = ['src', 'assets/js', 'scripts'];
  
  let totalFiles = 0;
  let totalIssues = 0;
  
  for (const dir of directories) {
    if (!existsSync(dir)) continue;
    
    log(`${colors.dim}Scanning directory: ${dir}${colors.reset}`);
    const files = scanDirectory(dir);
    totalFiles += files.length;
    
    for (const file of files) {
      const issues = analyzeFileWithTreeReasoning(file, tree);
      totalIssues += issues.length;
    }
  }
  
  const analysisTime = Date.now() - startTime;
  
  // Generate comprehensive report
  log(`\n${colors.bold}=== TREE OF THOUGHT ANALYSIS RESULTS ===${colors.reset}`, colors.cyan);
  log(`${icon.analysis} Files analyzed: ${totalFiles}`);
  log(`${icon.analysis} Analysis time: ${analysisTime}ms`);
  log(`${icon.analysis} Security vectors found: ${totalIssues}\n`);
  
  // Display the reasoning tree
  log(`${icon.tree} ${colors.bold}Security Reasoning Tree:${colors.reset}`);
  log(tree.rootNode.toString());
  
  // Analyze reasoning paths
  const allPaths = tree.rootNode.getAllPaths();
  const criticalPaths = allPaths.filter(path => 
    path.some(node => node.calculateCompoundSeverity() === 'CRITICAL' && node.confidence >= 0.8)
  );
  
  if (criticalPaths.length > 0) {
    log(`${colors.red}${icon.error} CRITICAL: ${criticalPaths.length} critical reasoning paths detected!${colors.reset}`);
    log(`${colors.dim}These paths indicate high-risk collapse vector combinations.${colors.reset}\n`);
    
    criticalPaths.forEach((path, index) => {
      log(`${colors.red}Critical Path ${index + 1}:${colors.reset}`);
      path.forEach((node, nodeIndex) => {
        const prefix = nodeIndex === path.length - 1 ? icon.leaf : icon.branch;
        log(`  ${prefix} ${node.type}: ${node.description}`);
        if (node.reasoning) {
          log(`    ${colors.dim}→ ${node.reasoning}${colors.reset}`);
        }
      });
      log('');
    });
    
    return { success: false, criticalPaths: criticalPaths.length, totalIssues, analysisTime };
  }
  
  if (totalIssues > 0) {
    log(`${colors.yellow}${icon.warning} Found ${totalIssues} potential security vectors.${colors.reset}`);
    log(`${colors.dim}Review the reasoning tree above for detailed analysis.${colors.reset}`);
  } else {
    log(`${colors.green}${icon.success} No critical security vectors detected.${colors.reset}`);
    log(`${colors.dim}Tree of thought analysis completed successfully.${colors.reset}`);
  }
  
  return { 
    success: criticalPaths.length === 0, 
    criticalPaths: criticalPaths.length, 
    totalIssues, 
    analysisTime,
    reasoningTree: tree.rootNode
  };
}

import { pathToFileURL } from 'url';

// Command line interface
// Normalize paths for Windows/Unix compatibility
const currentFileUrl = import.meta.url;
const executedFileUrl = pathToFileURL(process.argv[1]).href;

if (currentFileUrl === executedFileUrl) {
  const result = analyzeWithTreeOfThought();
  process.exit(result.success ? 0 : 1);
}