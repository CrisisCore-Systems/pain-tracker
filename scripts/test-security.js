#!/usr/bin/env node
/**
 * Security Features Testing Script
 * Tests all production security implementations
 */

const BASE_URL = process.env.API_URL || 'http://localhost:3001';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(80));
  log('cyan', title);
  console.log('='.repeat(80));
}

function test(name, passed) {
  const symbol = passed ? '✅' : '❌';
  const color = passed ? 'green' : 'red';
  log(color, `${symbol} ${name}`);
  return passed;
}

let totalTests = 0;
let passedTests = 0;

// Delay helper
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// Test 1: Login with Rate Limiting
// ============================================================================
async function testRateLimiting() {
  section('Test 1: Rate Limiting on Login');
  
  try {
    const results = [];
    
    // Attempt login 6 times with wrong password
    for (let i = 1; i <= 6; i++) {
      const response = await fetch(`${BASE_URL}/api/clinic/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@test.com',
          password: 'wrongpassword' + i,
        }),
      });
      
      await response.json();
      results.push({ attempt: i, status: response.status, rateLimited: response.status === 429 });
      
      console.log(`  Attempt ${i}: Status ${response.status}`);
      
      if (response.status === 429) {
        log('blue', `  Rate limit triggered after ${i} attempts`);
        break;
      }
    }
    
    totalTests++;
    if (results.some(r => r.rateLimited)) {
      passedTests++;
      return test('Rate limiting working', true);
    } else {
      return test('Rate limiting NOT working', false);
    }
  } catch (error) {
    log('red', `  Error: ${error.message}`);
    totalTests++;
    return test('Rate limiting test FAILED', false);
  }
}

// ============================================================================
// Test 2: HttpOnly Cookies
// ============================================================================
async function testHttpOnlyCookies() {
  section('Test 2: HttpOnly Cookies');
  
  try {
    // Use test user with known password
    const response = await fetch(`${BASE_URL}/api/clinic/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        email: 'testuser@clinic.com',
        password: 'password123',
      }),
    });
    
    await response.json();
    const setCookieHeader = response.headers.get('set-cookie');
    
    console.log(`  Response status: ${response.status}`);
    console.log(`  Set-Cookie header present: ${!!setCookieHeader}`);
    
    totalTests++;
    if (setCookieHeader && setCookieHeader.includes('HttpOnly')) {
      passedTests++;
      return test('HttpOnly cookies set correctly', true);
    } else {
      return test('HttpOnly cookies NOT set', false);
    }
  } catch (error) {
    log('red', `  Error: ${error.message}`);
    totalTests++;
    return test('HttpOnly cookies test FAILED', false);
  }
}

// ============================================================================
// Test 3: CSRF Token Generation
// ============================================================================
async function testCSRFTokens() {
  section('Test 3: CSRF Token Generation');
  
  try {
    // Use test user with known password
    const loginResponse = await fetch(`${BASE_URL}/api/clinic/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        email: 'testuser@clinic.com',
        password: 'password123',
      }),
    });
    
    const loginData = await loginResponse.json();
    
    console.log(`  Login status: ${loginResponse.status}`);
    console.log(`  CSRF token in response: ${!!loginData.csrfToken}`);
    
    totalTests++;
    if (loginData.csrfToken) {
      passedTests++;
      return test('CSRF token generated', true);
    } else {
      return test('CSRF token NOT generated', false);
    }
  } catch (error) {
    log('red', `  Error: ${error.message}`);
    totalTests++;
    return test('CSRF token test FAILED', false);
  }
}

// ============================================================================
// Test 4: Password Reset Flow
// ============================================================================
async function testPasswordReset() {
  section('Test 4: Password Reset Flow');
  
  try {
    // Use unique email to avoid rate limiting
    const testEmail = `reset-${Date.now()}@clinic.com`;
    
    // Request password reset
    const response = await fetch(`${BASE_URL}/api/clinic/auth/password-reset/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
      }),
    });
    
    const data = await response.json();
    
    console.log(`  Request status: ${response.status}`);
    console.log(`  Response: ${JSON.stringify(data, null, 2)}`);
    
    totalTests++;
    if (response.status === 200 && data.success) {
      passedTests++;
      return test('Password reset request accepted', true);
    } else {
      return test('Password reset request FAILED', false);
    }
  } catch (error) {
    log('red', `  Error: ${error.message}`);
    totalTests++;
    return test('Password reset test FAILED', false);
  }
}

// ============================================================================
// Test 5: Email Verification
// ============================================================================
async function testEmailVerification() {
  section('Test 5: Email Verification');
  
  try {
    // Try to verify with invalid token
    const response = await fetch(`${BASE_URL}/api/clinic/auth/verify-email?token=invalid-token-123`, {
      method: 'GET',
    });
    
    const data = await response.json();
    
    console.log(`  Verification status: ${response.status}`);
    console.log(`  Response: ${JSON.stringify(data, null, 2)}`);
    
    totalTests++;
    // Expecting 400 or 404 for invalid token
    if (response.status === 400 || response.status === 404) {
      passedTests++;
      return test('Email verification validates tokens', true);
    } else {
      return test('Email verification NOT validating tokens properly', false);
    }
  } catch (error) {
    log('red', `  Error: ${error.message}`);
    totalTests++;
    return test('Email verification test FAILED', false);
  }
}

// ============================================================================
// Test 6: MFA Setup
// ============================================================================
async function testMFASetup() {
  section('Test 6: MFA Setup (Requires Authentication)');
  
  try {
    // Use test user with known password
    // First login
    const loginResponse = await fetch(`${BASE_URL}/api/clinic/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        email: 'testuser@clinic.com',
        password: 'password123',
      }),
    });
    
    const loginData = await loginResponse.json();
    
    if (!loginData.success || !loginData.accessToken) {
      log('yellow', '  Could not login to test MFA setup');
      totalTests++;
      return test('MFA setup test SKIPPED (login failed)', false);
    }
    
    // Try MFA setup
    const mfaResponse = await fetch(`${BASE_URL}/api/clinic/auth/mfa/setup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginData.accessToken}`,
      },
      credentials: 'include',
    });
    
    const mfaData = await mfaResponse.json();
    
    console.log(`  MFA setup status: ${mfaResponse.status}`);
    console.log(`  QR code present: ${!!mfaData.qrCode}`);
    console.log(`  Secret present: ${!!mfaData.secret}`);
    
    totalTests++;
    if (mfaResponse.status === 200 && mfaData.qrCode && mfaData.secret) {
      passedTests++;
      return test('MFA setup working', true);
    } else {
      return test('MFA setup FAILED', false);
    }
  } catch (error) {
    log('red', `  Error: ${error.message}`);
    totalTests++;
    return test('MFA setup test FAILED', false);
  }
}

// ============================================================================
// Test 7: Bcrypt Password Hashing
// ============================================================================
async function testBcryptHashing() {
  section('Test 7: Bcrypt Password Hashing (Database Check)');
  
  log('yellow', '  This test requires manual database verification');
  log('blue', '  Run: SELECT password_hash FROM clinicians LIMIT 1;');
  log('blue', '  Hash should start with $2b$ (bcrypt)');
  
  totalTests++;
  return test('Bcrypt hashing verification (manual)', null);
}

// ============================================================================
// Test 8: Session Refresh
// ============================================================================
async function testSessionRefresh() {
  section('Test 8: Session Refresh with HttpOnly Cookies');
  
  try {
    // Use test user with known password
    // First login
    const loginResponse = await fetch(`${BASE_URL}/api/clinic/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        email: 'testuser@clinic.com',
        password: 'password123',
      }),
    });
    
    const loginData = await loginResponse.json();
    
    if (!loginData.success) {
      log('yellow', '  Login failed, cannot test refresh');
      totalTests++;
      return test('Session refresh SKIPPED (login failed)', false);
    }
    
    // Extract cookies from login response
    const cookies = loginResponse.headers.get('set-cookie');
    
    // Try refresh
    const refreshResponse = await fetch(`${BASE_URL}/api/clinic/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies || '',
      },
      credentials: 'include',
    });
    
    const refreshData = await refreshResponse.json();
    
    console.log(`  Refresh status: ${refreshResponse.status}`);
    console.log(`  New token received: ${!!refreshData.accessToken}`);
    
    totalTests++;
    if (refreshResponse.status === 200 && refreshData.success) {
      passedTests++;
      return test('Session refresh working', true);
    } else {
      return test('Session refresh FAILED', false);
    }
  } catch (error) {
    log('red', `  Error: ${error.message}`);
    totalTests++;
    return test('Session refresh test FAILED', false);
  }
}

// ============================================================================
// Main Test Runner
// ============================================================================
async function runAllTests() {
  console.log('\n');
  log('cyan', '╔═══════════════════════════════════════════════════════════════════════════╗');
  log('cyan', '║              PAIN TRACKER - SECURITY FEATURES TEST SUITE                  ║');
  log('cyan', '╚═══════════════════════════════════════════════════════════════════════════╝');
  console.log(`\nTesting API at: ${BASE_URL}\n`);
  
  const startTime = Date.now();
  
  await testRateLimiting();
  
  // Wait 2 seconds between tests to avoid rate limit conflicts
  log('yellow', '\n⏱️  Waiting 2 seconds before next test...');
  await delay(2000);
  
  await testHttpOnlyCookies();
  await delay(2000);
  
  await testCSRFTokens();
  await delay(2000);
  
  await testPasswordReset();
  await delay(2000);
  
  await testEmailVerification();
  await delay(2000);
  
  await testMFASetup();
  await delay(2000);
  
  await testBcryptHashing();
  await delay(2000);
  
  await testSessionRefresh();
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  // Summary
  section('Test Summary');
  console.log(`  Total tests: ${totalTests}`);
  log('green', `  Passed: ${passedTests}`);
  log('red', `  Failed: ${totalTests - passedTests}`);
  console.log(`  Duration: ${duration}s`);
  
  const passRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;
  console.log(`  Pass rate: ${passRate}%`);
  
  console.log('\n' + '='.repeat(80) + '\n');
  
  if (passedTests === totalTests) {
    log('green', '🎉 ALL TESTS PASSED! Security features are working correctly.');
  } else {
    log('yellow', '⚠️  Some tests failed. Review the output above for details.');
  }
  
  console.log();
  
  process.exit(totalTests === passedTests ? 0 : 1);
}

// Run tests
runAllTests().catch(error => {
  console.error('Test suite error:', error);
  process.exit(1);
});
