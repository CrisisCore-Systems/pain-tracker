#!/usr/bin/env node
/**
 * Automated Security Audit Script
 * Performs dependency vulnerability scanning and reports security issues
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const AUDIT_REPORT_FILE = 'security-audit-report.json';
const HIGH_SEVERITY_THRESHOLD = 1; // Fail if any high/critical vulnerabilities

async function runSecurityAudit() {
  console.log('🔍 Running dependency security audit...\n');

  try {
    // Run npm audit and capture output
    const auditOutput = execSync('npm audit --json', { 
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    const auditData = JSON.parse(auditOutput);
    const { vulnerabilities, metadata } = auditData;
    
    // Generate report
    const report = {
      timestamp: new Date().toISOString(),
      summary: metadata,
      criticalCount: metadata.vulnerabilities.critical || 0,
      highCount: metadata.vulnerabilities.high || 0,
      moderateCount: metadata.vulnerabilities.moderate || 0,
      lowCount: metadata.vulnerabilities.low || 0,
      infoCount: metadata.vulnerabilities.info || 0,
      totalVulnerabilities: metadata.vulnerabilities.total || 0,
      vulnerabilities: Object.entries(vulnerabilities).map(([name, vuln]) => ({
        name,
        severity: vuln.severity,
        via: vuln.via,
        effects: vuln.effects,
        range: vuln.range,
        fixAvailable: vuln.fixAvailable
      }))
    };

    // Save report
    fs.writeFileSync(AUDIT_REPORT_FILE, JSON.stringify(report, null, 2));
    
    // Print summary
    console.log('📊 Security Audit Summary:');
    console.log(`   Critical: ${report.criticalCount}`);
    console.log(`   High:     ${report.highCount}`);
    console.log(`   Moderate: ${report.moderateCount}`);
    console.log(`   Low:      ${report.lowCount}`);
    console.log(`   Info:     ${report.infoCount}`);
    console.log(`   Total:    ${report.totalVulnerabilities}\n`);

    // Check if audit should fail
    const criticalIssues = report.criticalCount + report.highCount;
    if (criticalIssues > HIGH_SEVERITY_THRESHOLD) {
      console.log(`❌ Security audit failed: ${criticalIssues} critical/high severity vulnerabilities found`);
      console.log(`   Report saved to: ${AUDIT_REPORT_FILE}`);
      console.log('   Run "npm audit" for details');
      process.exit(1);
    } else {
      console.log('✅ Security audit passed');
      console.log(`   Report saved to: ${AUDIT_REPORT_FILE}`);
    }

  } catch (error) {
    if (error.status === 1) {
      // npm audit found vulnerabilities - this is expected, parse the output
      try {
        const auditData = JSON.parse(error.stdout);
        const metadata = auditData.metadata;
        
        console.log('📊 Security Audit Summary:');
        console.log(`   Critical: ${metadata.vulnerabilities.critical || 0}`);
        console.log(`   High:     ${metadata.vulnerabilities.high || 0}`);
        console.log(`   Moderate: ${metadata.vulnerabilities.moderate || 0}`);
        console.log(`   Low:      ${metadata.vulnerabilities.low || 0}`);
        console.log(`   Total:    ${metadata.vulnerabilities.total || 0}\n`);

        const criticalIssues = (metadata.vulnerabilities.critical || 0) + (metadata.vulnerabilities.high || 0);
        
        console.log(`⚠️  Found ${metadata.vulnerabilities.total} vulnerabilities (${criticalIssues} critical/high)`);
        console.log('   Run "npm audit fix" to address fixable issues');
        console.log('   Run "npm audit fix --force" for breaking changes (test thoroughly!)');
        
        if (criticalIssues > HIGH_SEVERITY_THRESHOLD) {
          process.exit(1);
        }
      } catch (parseError) {
        console.error('❌ Failed to parse audit output:', parseError.message);
        process.exit(1);
      }
    } else {
      console.error('❌ Security audit failed:', error.message);
      process.exit(1);
    }
  }
}

runSecurityAudit();