#!/usr/bin/env node

/**
 * Production Deployment Script
 * Automates deployment to Vercel with environment validation
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const REQUIRED_ENV_VARS = [
  'STRIPE_SECRET_KEY',
  'STRIPE_PUBLISHABLE_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PRICE_BASIC_MONTHLY',
  'STRIPE_PRICE_BASIC_YEARLY',
  'STRIPE_PRICE_PRO_MONTHLY',
  'STRIPE_PRICE_PRO_YEARLY',
];

class DeploymentManager {
  constructor() {
    this.projectRoot = process.cwd();
    this.envPath = join(this.projectRoot, '.env');
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m',
    };

    const icons = {
      info: 'ℹ',
      success: '✓',
      warning: '⚠',
      error: '✗',
    };

    console.log(`${colors[type]}${icons[type]} ${message}${colors.reset}`);
  }

  async checkPrerequisites() {
    this.log('Checking deployment prerequisites...', 'info');

    // Check if Vercel CLI is installed
    try {
      execSync('vercel --version', { stdio: 'ignore' });
      this.log('Vercel CLI is installed', 'success');
    } catch (error) {
      this.log('Vercel CLI not found. Installing...', 'warning');
      try {
        execSync('npm install -g vercel', { stdio: 'inherit' });
        this.log('Vercel CLI installed successfully', 'success');
      } catch (installError) {
        this.log('Failed to install Vercel CLI. Please install manually: npm install -g vercel', 'error');
        process.exit(1);
      }
    }

    // Check if .env exists
    if (!existsSync(this.envPath)) {
      this.log('.env file not found. Please create it with required variables.', 'error');
      process.exit(1);
    }

    this.log('Prerequisites check passed', 'success');
  }

  validateEnvironmentVariables() {
    this.log('Validating environment variables...', 'info');

    const envContent = readFileSync(this.envPath, 'utf8');
    const missing = [];

    REQUIRED_ENV_VARS.forEach((varName) => {
      const regex = new RegExp(`^${varName}=.+`, 'm');
      if (!regex.test(envContent)) {
        missing.push(varName);
      }
    });

    if (missing.length > 0) {
      this.log(`Missing required environment variables: ${missing.join(', ')}`, 'error');
      process.exit(1);
    }

    // Check for live vs test keys
    if (envContent.includes('sk_test_')) {
      this.log('WARNING: Using Stripe TEST keys. Switch to LIVE keys for production!', 'warning');
    }

    if (envContent.includes('sk_live_')) {
      this.log('Using Stripe LIVE keys', 'success');
    }

    this.log('Environment variables validated', 'success');
  }

  async runTests() {
    this.log('Running test suite...', 'info');

    try {
      execSync('npm run test -- --run', { stdio: 'inherit' });
      this.log('All tests passed', 'success');
    } catch (error) {
      this.log('Tests failed. Fix errors before deploying.', 'error');
      process.exit(1);
    }
  }

  async runTypeCheck() {
    this.log('Running TypeScript type check...', 'info');

    try {
      execSync('npm run typecheck', { stdio: 'inherit' });
      this.log('Type check passed', 'success');
    } catch (error) {
      this.log('Type check failed. Fix errors before deploying.', 'error');
      process.exit(1);
    }
  }

  async buildProject() {
    this.log('Building project...', 'info');

    try {
      execSync('npm run build', { stdio: 'inherit' });
      this.log('Build successful', 'success');
    } catch (error) {
      this.log('Build failed. Check the errors above.', 'error');
      process.exit(1);
    }
  }

  async deployToVercel(environment = 'production') {
    this.log(`Deploying to Vercel (${environment})...`, 'info');

    const prodFlag = environment === 'production' ? '--prod' : '';

    try {
      execSync(`vercel ${prodFlag}`, { stdio: 'inherit' });
      this.log('Deployment successful!', 'success');
    } catch (error) {
      this.log('Deployment failed. Check the errors above.', 'error');
      process.exit(1);
    }
  }

  printNextSteps() {
    console.log('\n' + '='.repeat(60));
    this.log('Deployment Complete! 🎉', 'success');
    console.log('='.repeat(60) + '\n');

    console.log('📋 Next Steps:\n');
    console.log('1. Configure Environment Variables in Vercel Dashboard');
    console.log('   → https://vercel.com/dashboard/[project]/settings/environment-variables\n');
    
    console.log('2. Add these variables to Vercel:');
    REQUIRED_ENV_VARS.forEach((varName) => {
      console.log(`   - ${varName}`);
    });
    console.log('   - NODE_ENV=production');
    console.log('   - VITE_APP_ENVIRONMENT=production\n');

    console.log('3. Update Stripe Webhook URL');
    console.log('   → https://dashboard.stripe.com/webhooks');
    console.log('   → Set URL to: https://your-domain.com/api/stripe-webhook\n');

    console.log('4. Test the deployment:');
    console.log('   → Visit: https://your-domain.com/pricing');
    console.log('   → Try a test purchase');
    console.log('   → Verify webhook in Stripe Dashboard\n');

    console.log('5. Monitor:');
    console.log('   → Vercel Logs: vercel logs --follow');
    console.log('   → Stripe Dashboard: https://dashboard.stripe.com/dashboard\n');

    console.log('📖 Full guide: DEPLOYMENT_CHECKLIST.md\n');
  }

  async run(skipTests = false) {
    try {
      console.log('\n🚀 Starting Production Deployment\n');

      await this.checkPrerequisites();
      this.validateEnvironmentVariables();

      if (!skipTests) {
        await this.runTypeCheck();
        await this.runTests();
      } else {
        this.log('Skipping tests (--skip-tests flag)', 'warning');
      }

      await this.buildProject();
      await this.deployToVercel('production');

      this.printNextSteps();
    } catch (error) {
      this.log(`Deployment failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const skipTests = args.includes('--skip-tests');
const staging = args.includes('--staging');

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Usage: node scripts/deploy-production.js [options]

Options:
  --skip-tests    Skip test suite and type checking
  --staging       Deploy to staging environment
  --help, -h      Show this help message

Examples:
  node scripts/deploy-production.js                  # Full deployment with tests
  node scripts/deploy-production.js --skip-tests     # Quick deployment
  node scripts/deploy-production.js --staging        # Deploy to staging
`);
  process.exit(0);
}

// Run deployment
const manager = new DeploymentManager();
manager.run(skipTests);
