/**
 * Development webhook server
 * Runs the Stripe webhook handler locally during development
 * Usage: node scripts/webhook-dev-server.js
 */

import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.WEBHOOK_DEV_PORT || 3001;

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover',
});

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'webhook-dev-server' });
});

// Webhook endpoint with raw body parsing for signature verification
app.post('/api/stripe/webhook', 
  express.raw({ type: 'application/json' }), 
  async (req, res) => {
    console.log('[WEBHOOK-DEV] Received POST to /api/stripe/webhook');
    
    try {
      const signature = req.headers['stripe-signature'];
      
      if (!signature) {
        console.error('[WEBHOOK-DEV] Missing stripe-signature header');
        return res.status(400).json({ error: 'Missing stripe-signature header' });
      }
      
      if (!WEBHOOK_SECRET) {
        console.error('[WEBHOOK-DEV] STRIPE_WEBHOOK_SECRET not configured');
        return res.status(500).json({ error: 'Webhook secret not configured' });
      }
      
      // Verify webhook signature
      let event;
      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          Array.isArray(signature) ? signature[0] : signature,
          WEBHOOK_SECRET
        );
      } catch (err) {
        console.error('[WEBHOOK-DEV] Signature verification failed:', err.message);
        return res.status(401).json({ error: 'Invalid signature' });
      }
      
      console.log('[WEBHOOK-DEV] ✓ Signature verified - Event type:', event.type);
      console.log('[WEBHOOK-DEV] Event ID:', event.id);
      
      // For development, just log the event and return success
      // In production, this would call the full webhook handler
      console.log('[WEBHOOK-DEV] Event data:', JSON.stringify(event.data.object, null, 2));
      
      res.status(200).json({ 
        received: true, 
        type: event.type,
        id: event.id,
        dev: true 
      });
      
    } catch (error) {
      console.error('[WEBHOOK-DEV] Error:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
});

// Start server
app.listen(PORT, () => {
  console.log(`[WEBHOOK-DEV] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`[WEBHOOK-DEV] Webhook dev server ready! 🎉`);
  console.log(`[WEBHOOK-DEV] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`[WEBHOOK-DEV] Listening on: http://localhost:${PORT}`);
  console.log(`[WEBHOOK-DEV] Webhook endpoint: http://localhost:${PORT}/api/stripe/webhook`);
  console.log(`[WEBHOOK-DEV] Health check: http://localhost:${PORT}/health`);
  console.log(`[WEBHOOK-DEV] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`[WEBHOOK-DEV] Stripe CLI command:`);
  console.log(`[WEBHOOK-DEV]   stripe listen --forward-to localhost:${PORT}/api/stripe/webhook`);
  console.log(`[WEBHOOK-DEV] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
});
