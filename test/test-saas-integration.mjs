/**
 * Quick SaaS Integration Test
 * Tests checkout API endpoint locally
 */

const TEST_CONFIG = {
  // Local test (use when running `npm run dev`)
  local: {
    checkoutUrl: 'http://localhost:5173/api/stripe/create-checkout-session',
    webhookUrl: 'http://localhost:5173/api/stripe/webhook',
  },
  // Production test (use after deployment)
  production: {
    checkoutUrl: 'https://paintracker.ca/api/stripe/create-checkout-session',
    webhookUrl: 'https://paintracker.ca/api/stripe/webhook',
  },
};

async function testCheckoutSession(env = 'local') {
  const config = TEST_CONFIG[env];
  
  console.log(`\n🧪 Testing Checkout Session Creation (${env})...`);
  console.log(`📍 Endpoint: ${config.checkoutUrl}\n`);

  const testPayload = {
    userId: 'test-user-' + Date.now(),
    tier: 'basic',
    interval: 'monthly',
    successUrl: 'https://paintracker.ca/app?checkout=success',
    cancelUrl: 'https://paintracker.ca/pricing?checkout=canceled',
    email: 'test@example.com',
  };

  console.log('📤 Request Payload:');
  console.log(JSON.stringify(testPayload, null, 2));

  try {
    const response = await fetch(config.checkoutUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });

    console.log(`\n📥 Response Status: ${response.status} ${response.statusText}`);

    const data = await response.json();
    console.log('\n📥 Response Data:');
    console.log(JSON.stringify(data, null, 2));

    if (response.ok && data.url) {
      console.log('\n✅ SUCCESS! Checkout session created.');
      console.log(`🔗 Checkout URL: ${data.url}`);
      console.log(`📋 Session ID: ${data.sessionId}`);
    } else {
      console.log('\n❌ FAILED! Checkout session creation failed.');
      console.error('Error:', data.error || 'Unknown error');
    }
  } catch (error) {
    console.error('\n❌ REQUEST FAILED!');
    console.error('Error:', error.message);
  }
}

function displayHelp() {
  console.log('\n📖 SaaS Integration Test Script');
  console.log('================================\n');
  console.log('Usage:');
  console.log('  node test-saas-integration.mjs [env]\n');
  console.log('Environments:');
  console.log('  local       - Test against localhost:5173 (dev server)');
  console.log('  production  - Test against paintracker.ca (deployed)\n');
  console.log('Examples:');
  console.log('  node test-saas-integration.mjs local');
  console.log('  node test-saas-integration.mjs production\n');
  console.log('Prerequisites:');
  console.log('  - For local: Run `npm run dev` first');
  console.log('  - For production: Ensure app is deployed to Vercel\n');
}

// Main execution
const env = process.argv[2];

if (!env || !['local', 'production'].includes(env)) {
  displayHelp();
  console.error('❌ Invalid or missing environment argument!\n');
  process.exit(1);
}

testCheckoutSession(env);
