#!/usr/bin/env node
/**
 * Comprehensive secret scanning script
 * Replaces inline grep-based secret detection with maintainable patterns
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
  info: '🔐',
  tip: '💡',
  scan: '🔍'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Comprehensive secret patterns
const secretPatterns = [
  {
    name: 'Generic API Keys/Secrets',
    pattern: /(api[_-]?key|secret|password|token)\s*[=:]\s*['""]([^'""]{8,})['""]/, 
    severity: 'high',
    description: 'Generic API key, secret, password or token'
  },
  {
    name: 'Hardcoded Sentry DSN',
    pattern: /https:\/\/.*@.*\.ingest\..*\.sentry\.io/,
    severity: 'high', 
    description: 'Hardcoded Sentry DSN - use VITE_SENTRY_DSN environment variable'
  },
  {
    name: 'OpenAI API Key',
    pattern: /sk-[a-zA-Z0-9]{32,}/,
    severity: 'critical',
    description: 'OpenAI API key'
  },
  {
    name: 'Stripe API Key',
    pattern: /(sk|pk)_[a-z]+_[a-zA-Z0-9]+/,
    severity: 'critical',
    description: 'Stripe API key'
  },
  {
    name: 'Google API Key',
    pattern: /AIza[0-9A-Za-z\-_]{35}/,
    severity: 'critical',
    description: 'Google API key'
  },
  {
    name: 'Google OAuth Token',
    pattern: /ya29\.[0-9A-Za-z\-_]+/,
    severity: 'critical',
    description: 'Google OAuth access token'
  },
  {
    name: 'AWS Access Key',
    pattern: /AKIA[0-9A-Z]{16}/,
    severity: 'critical',
    description: 'AWS access key ID'
  },
  {
    name: 'AWS Secret Key',
    pattern: /[0-9a-zA-Z\/+]{40}/,
    severity: 'medium',
    description: 'Potential AWS secret access key (40 chars base64)'
  },
  {
    name: 'GitHub Token',
    pattern: /gh[pousr]_[A-Za-z0-9_]{36,255}/,
    severity: 'critical',
    description: 'GitHub personal access token'
  },
  {
    name: 'JWT Token',
    pattern: /eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/,
    severity: 'high',
    description: 'JWT token'
  },
  {
    name: 'Private Key Headers',
    pattern: /-----BEGIN [A-Z]+ PRIVATE KEY-----/,
    severity: 'critical',
    description: 'Private key file content'
  },
  {
    name: 'Database URL with Password',
    pattern: /[a-zA-Z][a-zA-Z0-9+.-]*:\/\/[^:\/\s]+:[^@\/\s]+@[^\/\s]+/,
    severity: 'high',
    description: 'Database connection string with embedded credentials'
  }
];

// File patterns to scan
const includePatterns = [
  'src/**/*.{ts,tsx,js,jsx}',
  'scripts/**/*.{ts,tsx,js,jsx,mjs}',
  '*.{ts,tsx,js,jsx,mjs}',
  'public/**/*.{js,html}',
  '.env.example'
];

// Allowlist patterns (reduce false positives)
const allowlistPatterns = [
  /console\.(log|error|warn|info)/,
  /placeholder.*=.*['""][^'""]*['""]/, 
  /example.*=.*['""][^'""]*['""]/, 
  /test.*=.*['""][^'""]*['""]/, 
  /demo.*=.*['""][^'""]*['""]/, 
  /mock.*=.*['""][^'""]*['""]/, 
  /VITE_[A-Z_]+\s*=\s*['""][^'""]*['""]/ // Environment variable definitions
];

function shouldIgnoreLine(line) {
  // Ignore lines that match allowlist patterns
  return allowlistPatterns.some(pattern => pattern.test(line));
}

function scanFile(filePath) {
  const findings = [];
  
  try {
    const content = readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum];
      
      if (shouldIgnoreLine(line)) {
        continue;
      }
      
      for (const { name, pattern, severity, description } of secretPatterns) {
        const match = pattern.exec(line);
        if (match) {
          findings.push({
            file: filePath,
            line: lineNum + 1,
            content: line.trim(),
            pattern: name,
            severity,
            description,
            match: match[0]
          });
        }
      }
    }
  } catch (error) {
    // Skip files that can't be read
    if (error.code !== 'ENOENT' && error.code !== 'EISDIR') {
      log(`${icon.warning} Could not read file ${filePath}: ${error.message}`, colors.yellow);
    }
  }
  
  return findings;
}

async function scanSecrets() {
  log(`${icon.info} ${colors.bold}Scanning for hardcoded secrets...${colors.reset}`, colors.blue);
  
  const allFindings = [];
  
  try {
    // Get all files to scan using glob patterns
    const allFiles = [];
    for (const pattern of includePatterns) {
      try {
        const files = await glob(pattern, { 
          ignore: ['node_modules/**', 'dist/**', 'build/**', '.git/**', 'coverage/**'],
          dot: false
        });
        allFiles.push(...files);
      } catch (error) {
        // Ignore glob errors for missing patterns
      }
    }
    
    // Remove duplicates and filter existing files
    const uniqueFiles = [...new Set(allFiles)].filter(file => {
      try {
        return statSync(file).isFile();
      } catch {
        return false;
      }
    });
    
    log(`${icon.scan} Scanning ${uniqueFiles.length} files...`, colors.cyan);
    
    for (const file of uniqueFiles) {
      const findings = scanFile(file);
      allFindings.push(...findings);
    }
    
    if (allFindings.length === 0) {
      log(`${icon.success} No hardcoded secrets found`, colors.green);
      return { success: true, findings: [] };
    }
    
    // Group findings by severity
    const critical = allFindings.filter(f => f.severity === 'critical');
    const high = allFindings.filter(f => f.severity === 'high');
    const medium = allFindings.filter(f => f.severity === 'medium');
    
    log(`${icon.error} Found ${allFindings.length} potential secret(s):`, colors.red);
    console.log();
    
    // Display findings grouped by severity
    const groups = [
      { label: 'CRITICAL', findings: critical, color: colors.red },
      { label: 'HIGH', findings: high, color: colors.red },
      { label: 'MEDIUM', findings: medium, color: colors.yellow }
    ];
    
    for (const { label, findings, color } of groups) {
      if (findings.length > 0) {
        log(`${colors.bold}${label} SEVERITY (${findings.length}):${colors.reset}`, color);
        for (const finding of findings) {
          console.log(`  ${colors.cyan}${finding.file}:${finding.line}${colors.reset}`);
          console.log(`    ${colors.dim}Pattern: ${finding.pattern}${colors.reset}`);
          console.log(`    ${colors.dim}Description: ${finding.description}${colors.reset}`);
          console.log(`    ${colors.yellow}> ${finding.content}${colors.reset}`);
          console.log();
        }
      }
    }
    
    log(`${icon.tip} Use environment variables instead of hardcoded secrets`, colors.yellow);
    log(`${icon.tip} For false positives, consider adding to allowlist in scan-secrets.js`, colors.yellow);
    
    return { success: false, findings: allFindings };
    
  } catch (error) {
    log(`${icon.error} Error during secret scan: ${error.message}`, colors.red);
    return { success: false, findings: [] };
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = await scanSecrets();
  exit(result.success ? 0 : 1);
}

export { scanSecrets };