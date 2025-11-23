import fs from 'fs';
import path from 'path';
import Stripe from 'stripe';

// Load .env if present (local dev only)
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const dotenv = (await import('dotenv')).default;
  dotenv.config({ path: envPath });
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
if (!webhookSecret) {
  console.error('STRIPE_WEBHOOK_SECRET not found in environment');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2025-10-29.clover' });

// Craft a synthetic event
const eventPayload = {
  id: 'evt_test_copilot_1',
  object: 'event',
  api_version: '2025-10-29.clover',
  type: 'checkout.session.completed',
  data: {
    object: {
      id: 'cs_test_copilot_1',
      object: 'checkout.session',
      client_reference_id: 'test-user-123',
      customer: 'cus_test_123',
      subscription: 'sub_test_123',
      metadata: {
        userId: 'test-user-123',
        tier: 'basic',
        interval: 'monthly'
      }
    }
  }
};

const payload = JSON.stringify(eventPayload);

// Generate signature header using stripe.webhooks.generateTestHeaderString
const header = stripe.webhooks.generateTestHeaderString({ payload, secret: webhookSecret });

console.log('Sending webhook with signature header:', header);

async function send() {
  const url = 'https://paintracker.ca/api/stripe/webhook';
  try {
    const res = await globalThis.fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Stripe-Signature': header,
      },
      body: payload,
    });
    console.log('Response status:', res.status);
    const text = await res.text();
    try {
      console.log('Response JSON:', JSON.parse(text));
    } catch (e) {
      console.log('Response text:', text);
    }
  } catch (err) {
    console.error('Error sending webhook:', err);
    process.exit(1);
  }
}

send();
