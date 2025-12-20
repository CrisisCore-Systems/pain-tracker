/**
 * API Development Server
 * Runs Vercel serverless functions locally for development
 * Usage: node scripts/api-dev-server.js
 */

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });
dotenv.config({ path: join(__dirname, '..', '.env') });

// Check if TEST_MODE is enabled via CLI argument or environment variable
const isTestMode = process.argv.includes('--test') || process.env.TEST_MODE === 'true';
if (isTestMode) {
  console.log('[API-DEV] ⚠️  TEST MODE ENABLED - Rate limiting disabled');
  process.env.DISABLE_RATE_LIMIT = 'true';
}

const app = express();
const PORT = process.env.API_DEV_PORT || 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Log all requests
app.use((req, res, next) => {
  console.log(`[API-DEV] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api-dev-server' });
});

// Dynamically load and mount API routes
async function loadApiRoutes() {
  const apiDir = join(__dirname, '..', 'api');
  
  // Helper to load a Vercel serverless function
  async function loadHandler(filePath, route) {
    try {
      // Convert Windows path to file:// URL
      const fileUrl = new URL(`file:///${filePath.replace(/\\/g, '/')}`);
      const module = await import(fileUrl.href);
      const handler = module.default;
      
      if (!handler) {
        console.warn(`[API-DEV] No default export in ${filePath}`);
        return;
      }
      
      // Wrap Vercel handler for Express
      app.all(route, async (req, res) => {
        try {
          // Create Vercel-compatible request object
          const vercelReq = {
            ...req,
            query: req.query,
            cookies: req.cookies || {},
            body: req.body,
            headers: req.headers,
            method: req.method,
            url: req.url,
          };
          
          // Create Vercel-compatible response object
          const vercelRes = {
            status: (code) => {
              res.status(code);
              return vercelRes;
            },
            json: (data) => {
              res.json(data);
            },
            send: (data) => {
              res.send(data);
            },
            setHeader: (name, value) => {
              res.setHeader(name, value);
            },
            end: () => {
              res.end();
            },
          };
          
          await handler(vercelReq, vercelRes);
        } catch (error) {
          console.error(`[API-DEV] Error in ${route}:`, error);
          res.status(500).json({ error: 'Internal server error' });
        }
      });
      
      console.log(`[API-DEV] ✓ Loaded ${route}`);
    } catch (error) {
      console.error(`[API-DEV] Failed to load ${filePath}:`, error.message);
    }
  }
  
  // Load clinic auth routes
  await loadHandler(
    join(apiDir, 'clinic', 'auth', 'login.ts'),
    '/api/clinic/auth/login'
  );
  await loadHandler(
    join(apiDir, 'clinic', 'auth', 'logout.ts'),
    '/api/clinic/auth/logout'
  );
  await loadHandler(
    join(apiDir, 'clinic', 'auth', 'refresh.ts'),
    '/api/clinic/auth/refresh'
  );
  await loadHandler(
    join(apiDir, 'clinic', 'auth', 'verify.ts'),
    '/api/clinic/auth/verify'
  );
  await loadHandler(
    join(apiDir, 'clinic', 'auth', 'register.ts'),
    '/api/clinic/auth/register'
  );
  await loadHandler(
    join(apiDir, 'clinic', 'auth', 'verify-email.ts'),
    '/api/clinic/auth/verify-email'
  );
  await loadHandler(
    join(apiDir, 'clinic', 'auth', 'password-reset', 'request.ts'),
    '/api/clinic/auth/password-reset/request'
  );
  await loadHandler(
    join(apiDir, 'clinic', 'auth', 'password-reset', 'confirm.ts'),
    '/api/clinic/auth/password-reset/confirm'
  );
  await loadHandler(
    join(apiDir, 'clinic', 'auth', 'mfa', 'setup.ts'),
    '/api/clinic/auth/mfa/setup'
  );
  await loadHandler(
    join(apiDir, 'clinic', 'auth', 'mfa', 'verify.ts'),
    '/api/clinic/auth/mfa/verify'
  );
}

// Start server
loadApiRoutes().then(() => {
  app.listen(PORT, () => {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 API Development Server');
    console.log('='.repeat(60));
    console.log(`Server running at: http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log('\nAvailable endpoints:');
    console.log('  POST   /api/clinic/auth/login');
    console.log('  POST   /api/clinic/auth/logout');
    console.log('  POST   /api/clinic/auth/refresh');
    console.log('  GET    /api/clinic/auth/verify');
    console.log('  POST   /api/clinic/auth/register');
    console.log('  GET    /api/clinic/auth/verify-email');
    console.log('  POST   /api/clinic/auth/password-reset/request');
    console.log('  POST   /api/clinic/auth/password-reset/confirm');
    console.log('  POST   /api/clinic/auth/mfa/setup');
    console.log('  POST   /api/clinic/auth/mfa/verify');
    console.log('='.repeat(60) + '\n');
  });
}).catch(error => {
  console.error('[API-DEV] Failed to start server:', error);
  process.exit(1);
});
