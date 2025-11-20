#!/usr/bin/env node

/**
 * Vercel Environment Setup Helper
 * Generates commands to set environment variables in Vercel
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

class VercelEnvSetup {
  constructor() {
    this.envPath = join(process.cwd(), '.env');
    this.envVars = {};
  }

  parseEnvFile() {
    if (!existsSync(this.envPath)) {
      console.error('❌ .env file not found');
      process.exit(1);
    }

    const content = readFileSync(this.envPath, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          this.envVars[key.trim()] = valueParts.join('=').trim();
        }
      }
    });

    console.log(`✓ Parsed ${Object.keys(this.envVars).length} environment variables\n`);
  }

  generateVercelCommands() {
    console.log('📋 Vercel CLI Commands to Set Environment Variables');
    console.log('=' .repeat(70));
    console.log('\nCopy and run these commands in your terminal:\n');

    Object.entries(this.envVars).forEach(([key, value]) => {
      // Escape special characters in PowerShell
      const escapedValue = value.replace(/"/g, '`"').replace(/\$/g, '`$');
      console.log(`vercel env add ${key} production`);
      console.log(`# When prompted, enter: ${escapedValue}\n`);
    });

    console.log('\n' + '='.repeat(70));
    console.log('\n💡 Alternative: Use Vercel Dashboard');
    console.log('Visit: https://vercel.com/dashboard/[project]/settings/environment-variables\n');
  }

  generateEnvList() {
    console.log('\n📝 Environment Variables to Add in Vercel Dashboard:');
    console.log('=' .repeat(70) + '\n');

    const categories = {
      'Stripe Configuration': [
        'STRIPE_SECRET_KEY',
        'STRIPE_PUBLISHABLE_KEY',
        'STRIPE_WEBHOOK_SECRET',
      ],
      'Stripe Price IDs': [
        'STRIPE_PRICE_BASIC_MONTHLY',
        'STRIPE_PRICE_BASIC_YEARLY',
        'STRIPE_PRICE_PRO_MONTHLY',
        'STRIPE_PRICE_PRO_YEARLY',
      ],
      'Application': [
        'NODE_ENV',
        'VITE_APP_ENVIRONMENT',
        'DATABASE_URL',
      ],
    };

    Object.entries(categories).forEach(([category, keys]) => {
      console.log(`\n${category}:`);
      console.log('-'.repeat(70));
      keys.forEach((key) => {
        const value = this.envVars[key] || '[NOT SET]';
        const masked = this.maskSensitive(key, value);
        console.log(`${key}=${masked}`);
      });
    });

    console.log('\n' + '='.repeat(70));
  }

  maskSensitive(key, value) {
    const sensitiveKeys = ['SECRET', 'KEY', 'PASSWORD', 'TOKEN'];
    const isSensitive = sensitiveKeys.some((k) => key.includes(k));

    if (isSensitive && value !== '[NOT SET]') {
      return value.substring(0, 10) + '...' + value.substring(value.length - 4);
    }

    return value;
  }

  printInstructions() {
    console.log('\n' + '='.repeat(70));
    console.log('🚀 Vercel Environment Setup Instructions');
    console.log('='.repeat(70) + '\n');

    console.log('Option 1: Use Vercel CLI');
    console.log('-'.repeat(70));
    console.log('1. Install Vercel CLI: npm install -g vercel');
    console.log('2. Login: vercel login');
    console.log('3. Link project: vercel link');
    console.log('4. Run the commands above to add each variable\n');

    console.log('Option 2: Use Vercel Dashboard (Recommended)');
    console.log('-'.repeat(70));
    console.log('1. Go to: https://vercel.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Go to: Settings → Environment Variables');
    console.log('4. Add each variable listed above');
    console.log('5. Select environment: Production');
    console.log('6. Click "Save"\n');

    console.log('⚠️  Important:');
    console.log('-'.repeat(70));
    console.log('• Make sure to use LIVE Stripe keys (sk_live_...)');
    console.log('• Set NODE_ENV=production');
    console.log('• Update webhook URL in Stripe Dashboard after deployment');
    console.log('• Never commit .env file to version control\n');

    console.log('📖 Full deployment guide: DEPLOYMENT_CHECKLIST.md\n');
  }

  run() {
    console.clear();
    this.parseEnvFile();
    this.generateEnvList();
    this.printInstructions();
    this.generateVercelCommands();
  }
}

// Run the setup helper
const setup = new VercelEnvSetup();
setup.run();
