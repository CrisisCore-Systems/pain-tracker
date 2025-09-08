#!/usr/bin/env node
/**
 * Dependency Update Helper Script
 * Helps update dependencies while checking for vulnerabilities
 */

import { execSync } from 'child_process';

async function updateDependencies() {
  console.log('🔧 Dependency Update Helper\n');

  try {
    // Check current vulnerabilities
    console.log('1. Checking current vulnerabilities...');
    try {
      execSync('npm audit --audit-level=high', { stdio: 'inherit' });
    } catch (_error) {
      // Ignore error parameter
      console.log('   Found vulnerabilities to address\n');
    }

    // Try safe fixes first
    console.log('2. Applying safe fixes...');
    try {
      execSync('npm audit fix', { stdio: 'inherit' });
      console.log('   ✅ Safe fixes applied\n');
    } catch (_error) {
      // Ignore error parameter
      console.log('   ⚠️  No safe fixes available\n');
    }

    // Update non-breaking dependencies
    console.log('3. Updating patch and minor versions...');
    try {
      execSync('npm update', { stdio: 'inherit' });
      console.log('   ✅ Non-breaking updates applied\n');
    } catch (error) {
      console.log('   ⚠️  Update failed:', error.message);
    }

    // Check outdated packages
    console.log('4. Checking for outdated packages...');
    try {
      execSync('npm outdated', { stdio: 'inherit' });
    } catch (_error) {
      // npm outdated exits with code 1 when packages are outdated
      console.log('   See above for packages that need manual updates\n');
    }

    // Final vulnerability check
    console.log('5. Final vulnerability check...');
    try {
      execSync('npm audit --audit-level=high', { stdio: 'inherit' });
      console.log('   ✅ No high/critical vulnerabilities remaining');
    } catch (_error) {
      // Ignore error for final check
      console.log('   ⚠️  Still have vulnerabilities - consider:');
      console.log('       - npm audit fix --force (may have breaking changes)');
      console.log('       - Manual package updates');
      console.log('       - Alternative packages');
    }

    console.log('\n🎉 Dependency update process complete!');
    console.log('   Remember to test your application after updates');

  } catch (error) {
    console.error('❌ Update process failed:', error.message);
    process.exit(1);
  }
}

updateDependencies();