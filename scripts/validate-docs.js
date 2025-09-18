#!/usr/bin/env node

/**
 * Documentation validation script
 * Validates README.md links and test count accuracy
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  testCountThreshold: 5, // Allow delta of up to 5 tests
  allowedFeatureStatuses: ['Implemented', 'Partial', 'Planned']
};

class DocumentationValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  error(message) {
    this.errors.push(message);
    console.error(`❌ ${message}`);
  }

  warning(message) {
    this.warnings.push(message);
    console.warn(`⚠️ ${message}`);
  }

  info(message) {
    console.log(`ℹ️ ${message}`);
  }

  success(message) {
    console.log(`✅ ${message}`);
  }

  /**
   * Parse README.md for local file links and check their existence
   */
  validateReadmeLinks() {
    this.info('Validating README.md links...');
    
    try {
      const readmeContent = fs.readFileSync('README.md', 'utf8');
      
      // Find markdown links that reference local files
      const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
      const links = [];
      let match;
      
      while ((match = linkPattern.exec(readmeContent)) !== null) {
        const [fullMatch, text, url] = match;
        links.push({ text, url, fullMatch });
      }
      
      const localLinks = links.filter(link => {
        const url = link.url;
        // Filter for local files (not URLs, not anchors)
        return !url.startsWith('http') && 
               !url.startsWith('#') && 
               !url.startsWith('mailto:') &&
               (url.includes('.') || url.startsWith('./') || url.startsWith('../'));
      });
      
      this.info(`Found ${localLinks.length} local file links to validate`);
      
      let validLinks = 0;
      for (const link of localLinks) {
        let filePath = link.url;
        
        // Remove anchors
        filePath = filePath.split('#')[0];
        
        // Convert relative paths
        if (filePath.startsWith('./')) {
          filePath = filePath.substring(2);
        }
        
        if (fs.existsSync(filePath)) {
          this.success(`Link exists: ${link.text} -> ${filePath}`);
          validLinks++;
        } else {
          this.error(`Broken link: ${link.text} -> ${filePath}`);
        }
      }
      
      if (validLinks === localLinks.length) {
        this.success(`All ${localLinks.length} local links are valid`);
      }
      
    } catch (error) {
      this.error(`Failed to validate README links: ${error.message}`);
    }
  }

  /**
   * Extract stated test count from README and compare to actual
   */
  validateTestCount() {
    this.info('Validating test count accuracy...');
    
    try {
      const readmeContent = fs.readFileSync('README.md', 'utf8');
      
      // Look for test count in README (various patterns)
      const testCountPatterns = [
        /(\d+)\s+tests/i,
        /tests[:\s]*(\d+)/i,
        /(\d+)\s+comprehensive\s+tests/i,
        /testing[^,]*(\d+)[^,]*tests/i
      ];
      
      let statedTestCount = null;
      for (const pattern of testCountPatterns) {
        const match = readmeContent.match(pattern);
        if (match) {
          statedTestCount = parseInt(match[1], 10);
          this.info(`Found stated test count: ${statedTestCount}`);
          break;
        }
      }
      
      if (!statedTestCount) {
        this.warning('No test count found in README');
        return;
      }
      
      // Count actual test files
      const testFilePattern = /\.(test|spec)\.(ts|tsx|js|jsx)$/;
      const actualTestCount = this.countTestFiles('src', testFilePattern);
      
      this.info(`Actual test files found: ${actualTestCount}`);
      this.info(`Stated test count in README: ${statedTestCount}`);
      
      const delta = Math.abs(actualTestCount - statedTestCount);
      
      if (delta === 0) {
        this.success('Test count in README matches actual test files');
      } else if (delta <= CONFIG.testCountThreshold) {
        this.warning(`Test count delta (${delta}) within threshold (${CONFIG.testCountThreshold})`);
      } else {
        this.error(`Test count delta (${delta}) exceeds threshold (${CONFIG.testCountThreshold})`);
      }
      
    } catch (error) {
      this.error(`Failed to validate test count: ${error.message}`);
    }
  }

  /**
   * Count test files recursively
   */
  countTestFiles(dir, pattern) {
    let count = 0;
    
    if (!fs.existsSync(dir)) {
      return count;
    }
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        count += this.countTestFiles(fullPath, pattern);
      } else if (pattern.test(item)) {
        count++;
      }
    }
    
    return count;
  }

  /**
   * Validate Feature Maturity Matrix statuses (if present)
   */
  validateFeatureMatrix() {
    this.info('Validating Feature Maturity Matrix...');
    
    try {
      const readmeContent = fs.readFileSync('README.md', 'utf8');
      
      // Look for Feature Maturity Matrix section
      const matrixSectionMatch = readmeContent.match(/(?:feature\s+maturity\s+matrix|maturity\s+matrix)(.*?)(?=\n##|\n---|\n\*\*|$)/is);
      
      if (!matrixSectionMatch) {
        this.info('No Feature Maturity Matrix found in README');
        return;
      }
      
      const matrixContent = matrixSectionMatch[1];
      
      // Extract status values (look for common patterns)
      const statusPattern = /(?:status|state)[:\s]*([a-zA-Z]+)/gi;
      const statuses = [];
      let match;
      
      while ((match = statusPattern.exec(matrixContent)) !== null) {
        statuses.push(match[1]);
      }
      
      if (statuses.length === 0) {
        this.info('No status values found in Feature Maturity Matrix');
        return;
      }
      
      let validStatuses = 0;
      for (const status of statuses) {
        if (CONFIG.allowedFeatureStatuses.includes(status)) {
          validStatuses++;
        } else {
          this.error(`Invalid feature status: "${status}". Allowed: ${CONFIG.allowedFeatureStatuses.join(', ')}`);
        }
      }
      
      if (validStatuses === statuses.length) {
        this.success(`All ${statuses.length} feature statuses are valid`);
      }
      
    } catch (error) {
      this.error(`Failed to validate Feature Maturity Matrix: ${error.message}`);
    }
  }

  /**
   * Run all validations
   */
  async validate() {
    console.log('🔍 Starting documentation validation...\n');
    
    this.validateReadmeLinks();
    console.log();
    
    this.validateTestCount();
    console.log();
    
    this.validateFeatureMatrix();
    console.log();
    
    // Summary
    console.log('📋 Validation Summary:');
    console.log(`   Errors: ${this.errors.length}`);
    console.log(`   Warnings: ${this.warnings.length}`);
    
    if (this.errors.length === 0) {
      console.log('\n✅ Documentation validation passed!');
      return true;
    } else {
      console.log('\n❌ Documentation validation failed!');
      return false;
    }
  }
}

// Run validation if called directly
if (process.argv[1] === __filename) {
  const validator = new DocumentationValidator();
  validator.validate().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export { DocumentationValidator };