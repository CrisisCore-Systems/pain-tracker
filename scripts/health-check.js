#!/usr/bin/env node

/**
 * Deployment Health Check Script
 * Performs comprehensive health checks on deployed environments
 */

import https from 'https';
import http from 'http';
import fs from 'fs';

// Configuration
const config = {
  environments: {
    production: 'https://crisiscore-systems.github.io/pain-tracker/',
    staging: 'https://crisiscore-systems.github.io/pain-tracker/staging/',
    preview: 'https://crisiscore-systems.github.io/pain-tracker/preview/'
  },
  timeout: 30000,
  retries: 3,
  healthChecks: [
    'accessibility',
    'assets',
    'performance',
    'security',
    'functionality'
  ]
};

// Utility functions
const log = (message, level = 'info') => {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: '🔍',
    success: '✅',
    warn: '⚠️',
    error: '❌'
  }[level] || 'ℹ️';
  
  console.log(`${prefix} [${timestamp}] ${message}`);
};

const makeRequest = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    const timeout = setTimeout(() => {
      reject(new Error(`Request timeout after ${config.timeout}ms`));
    }, config.timeout);

    const req = client.get(url, options, (res) => {
      clearTimeout(timeout);
      let data = '';
      
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          timing: {
            start: Date.now(),
            end: Date.now()
          }
        });
      });
    });

    req.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
};

// Health check implementations
const healthChecks = {
  async accessibility(url) {
    log(`Checking accessibility for ${url}`);
    
    try {
      const response = await makeRequest(url);
      
      if (response.statusCode !== 200) {
        throw new Error(`HTTP ${response.statusCode}`);
      }

      // Basic accessibility checks
      const body = response.body;
      const checks = {
        hasTitle: /<title[^>]*>(.+?)<\/title>/i.test(body),
        hasLang: /<html[^>]*lang=/i.test(body),
        hasViewport: /viewport/i.test(body),
        hasSkipLinks: /skip.*content|skip.*main/i.test(body)
      };

      const passed = Object.values(checks).filter(Boolean).length;
      const total = Object.keys(checks).length;

      log(`Accessibility: ${passed}/${total} checks passed`, passed === total ? 'success' : 'warn');
      
      return {
        passed: passed === total,
        score: passed / total,
        details: checks
      };
    } catch (error) {
      log(`Accessibility check failed: ${error.message}`, 'error');
      return { passed: false, error: error.message };
    }
  },

  async assets(url) {
    log(`Checking assets for ${url}`);
    
    try {
      const response = await makeRequest(url);
      const body = response.body;

      // Check for critical assets
      const assets = {
        css: /<link[^>]*rel=["']stylesheet["'][^>]*>/gi.test(body),
        javascript: /<script[^>]*src=/gi.test(body),
        favicon: /<link[^>]*rel=["'](?:icon|shortcut icon)["'][^>]*>/gi.test(body),
        images: /<img[^>]*src=/gi.test(body)
      };

      const assetCount = Object.values(assets).filter(Boolean).length;
      const passed = assetCount >= 2; // At least CSS and JS

      log(`Assets: ${assetCount}/4 asset types found`, passed ? 'success' : 'warn');
      
      return {
        passed,
        details: assets,
        count: assetCount
      };
    } catch (error) {
      log(`Asset check failed: ${error.message}`, 'error');
      return { passed: false, error: error.message };
    }
  },

  async performance(url) {
    log(`Checking performance for ${url}`);
    
    try {
      const start = Date.now();
      const response = await makeRequest(url);
      const loadTime = Date.now() - start;

      const metrics = {
        loadTime,
        responseSize: response.body.length,
        gzipEnabled: response.headers['content-encoding'] === 'gzip'
      };

      // Performance thresholds
      const thresholds = {
        loadTime: 5000, // 5 seconds
        responseSize: 5 * 1024 * 1024 // 5MB
      };

      const passed = loadTime < thresholds.loadTime && 
                    metrics.responseSize < thresholds.responseSize;

      log(`Performance: ${loadTime}ms load time, ${Math.round(metrics.responseSize / 1024)}KB`, 
          passed ? 'success' : 'warn');
      
      return {
        passed,
        metrics,
        thresholds
      };
    } catch (error) {
      log(`Performance check failed: ${error.message}`, 'error');
      return { passed: false, error: error.message };
    }
  },

  async security(url) {
    log(`Checking security for ${url}`);
    
    try {
      const response = await makeRequest(url);
      const headers = response.headers;

      const securityHeaders = {
        'x-content-type-options': headers['x-content-type-options'] === 'nosniff',
        'x-frame-options': !!headers['x-frame-options'],
        'referrer-policy': !!headers['referrer-policy'],
        'permissions-policy': !!headers['permissions-policy']
      };

      const body = response.body;
      const contentChecks = {
        noInlineScripts: !/<script[^>]*>(?!.*src=)/gi.test(body),
        httpsLinks: !/http:\/\/(?!localhost)/gi.test(body),
        noHardcodedSecrets: !/(?:api[_-]?key|secret|password|token).*[:=].*['"]/gi.test(body)
      };

      const allChecks = { ...securityHeaders, ...contentChecks };
      const passed = Object.values(allChecks).filter(Boolean).length;
      const total = Object.keys(allChecks).length;

      log(`Security: ${passed}/${total} checks passed`, passed === total ? 'success' : 'warn');
      
      return {
        passed: passed === total,
        score: passed / total,
        details: allChecks
      };
    } catch (error) {
      log(`Security check failed: ${error.message}`, 'error');
      return { passed: false, error: error.message };
    }
  },

  async functionality(url) {
    log(`Checking functionality for ${url}`);
    
    try {
      const response = await makeRequest(url);
      const body = response.body;

      // Check for application-specific elements
      const functionalityChecks = {
        hasReactRoot: /id=["']root["']/i.test(body) || /id=["']app["']/i.test(body),
        hasNavigation: /nav|menu|header/gi.test(body),
        hasMainContent: /main|content|container/gi.test(body),
        hasAppScript: /<script[^>]*>.*<\/script>/gi.test(body) || /<script[^>]*src=/gi.test(body)
      };

      const passed = Object.values(functionalityChecks).filter(Boolean).length;
      const total = Object.keys(functionalityChecks).length;

      log(`Functionality: ${passed}/${total} checks passed`, passed >= 3 ? 'success' : 'warn');
      
      return {
        passed: passed >= 3,
        score: passed / total,
        details: functionalityChecks
      };
    } catch (error) {
      log(`Functionality check failed: ${error.message}`, 'error');
      return { passed: false, error: error.message };
    }
  }
};

// Main health check function
async function runHealthCheck(environment, retryCount = 0) {
  const url = config.environments[environment];
  if (!url) {
    throw new Error(`Unknown environment: ${environment}`);
  }

  log(`Starting health check for ${environment} environment: ${url}`);
  
  const results = {
    environment,
    url,
    timestamp: new Date().toISOString(),
    overall: { passed: true, score: 0 },
    checks: {}
  };

  let totalScore = 0;
  let checkCount = 0;

  for (const checkName of config.healthChecks) {
    if (healthChecks[checkName]) {
      try {
        log(`Running ${checkName} check...`);
        const result = await healthChecks[checkName](url);
        results.checks[checkName] = result;
        
        if (result.passed === false) {
          results.overall.passed = false;
        }
        
        if (typeof result.score === 'number') {
          totalScore += result.score;
          checkCount++;
        } else {
          totalScore += result.passed ? 1 : 0;
          checkCount++;
        }
      } catch (error) {
        log(`Check ${checkName} failed: ${error.message}`, 'error');
        results.checks[checkName] = { passed: false, error: error.message };
        results.overall.passed = false;
        checkCount++;
      }
    }
  }

  results.overall.score = checkCount > 0 ? totalScore / checkCount : 0;

  // Retry logic for failed checks
  if (!results.overall.passed && retryCount < config.retries) {
    log(`Health check failed, retrying... (attempt ${retryCount + 1}/${config.retries})`, 'warn');
    await new Promise(resolve => setTimeout(resolve, 2000));
    return runHealthCheck(environment, retryCount + 1);
  }

  return results;
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const environment = args[0] || 'production';
  const outputFile = args[1];

  if (!config.environments[environment]) {
    console.error(`❌ Unknown environment: ${environment}`);
    console.error(`Available environments: ${Object.keys(config.environments).join(', ')}`);
    process.exit(1);
  }

  try {
    log(`🚀 Starting health check for ${environment} environment`);
    const results = await runHealthCheck(environment);
    
    // Output results
    if (outputFile) {
      fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
      log(`Results written to ${outputFile}`, 'success');
    }

    // Summary
    const score = Math.round(results.overall.score * 100);
    log(`Health check completed - Score: ${score}%`, results.overall.passed ? 'success' : 'error');
    
    if (!results.overall.passed) {
      log('Failed checks:', 'error');
      Object.entries(results.checks).forEach(([name, result]) => {
        if (!result.passed) {
          log(`  - ${name}: ${result.error || 'Failed'}`, 'error');
        }
      });
    }

    process.exit(results.overall.passed ? 0 : 1);
  } catch (error) {
    log(`Health check failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
}

export { runHealthCheck, healthChecks };