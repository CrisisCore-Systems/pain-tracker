import Stripe from 'stripe';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read environment variables
const envFile = readFileSync(join(__dirname, '.env.local'), 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    env[key.trim()] = valueParts.join('=').trim();
  }
});

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

async function createProductionCheckout() {
  try {
    console.log('Creating checkout session for production webhook test...\n');
    
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: env.STRIPE_PRICE_BASIC_MONTHLY,
          quantity: 1,
        },
      ],
      success_url: 'https://pain-tracker-rklvusgs6-kalyim-overton-s-projects.vercel.app/pain-tracker/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://pain-tracker-rklvusgs6-kalyim-overton-s-projects.vercel.app/pain-tracker/cancel',
      client_reference_id: 'production_test_user',
      subscription_data: {
        trial_period_days: 14,
      },
      billing_address_collection: 'required',
    });

    console.log('✅ Checkout session created successfully!');
    console.log('Session ID:', session.id);
    console.log('Checkout URL:', session.url);
    console.log('\n📝 Instructions:');
    console.log('1. Open the checkout URL in your browser');
    console.log('2. Complete payment with test card: 4242 4242 4242 4242');
    console.log('3. Webhooks will be sent to production endpoint');
    console.log('4. Check database for new subscription after payment');
    console.log('\nTest card details:');
    console.log('  Card: 4242 4242 4242 4242');
    console.log('  Expiry: Any future date (e.g., 12/26)');
    console.log('  CVC: Any 3 digits (e.g., 123)');
    console.log('  ZIP: Any 5 digits (e.g., 12345)');
    
  } catch (error) {
    console.error('❌ Error creating checkout session:', error.message);
    process.exit(1);
  }
}

createProductionCheckout();
