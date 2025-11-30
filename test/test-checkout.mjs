import Stripe from 'stripe';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.development.local
const envFile = readFileSync(join(__dirname, '.env.development.local'), 'utf8');
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)="?([^"]+)"?$/);
  if (match) {
    process.env[match[1]] = match[2].replace(/^"|"$/g, '');
  }
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function testCheckout() {
  console.log('🔑 Using Stripe key:', process.env.STRIPE_SECRET_KEY.substring(0, 20) + '...');
  console.log('💰 Testing with price:', process.env.STRIPE_PRICE_BASIC_MONTHLY);
  
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_BASIC_MONTHLY,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel',
      client_reference_id: 'test_user',
      subscription_data: {
        trial_period_days: 14,
      },
      billing_address_collection: 'required',
    });

    console.log('✅ SUCCESS! Checkout session created:');
    console.log('   Session ID:', session.id);
    console.log('   URL:', session.url);
    console.log('\n🎉 Open this URL in your browser to test the checkout:');
    console.log(session.url);
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    if (error.type === 'StripeInvalidRequestError') {
      console.error('   Type:', error.type);
      console.error('   Code:', error.code);
    }
  }
}

testCheckout();
