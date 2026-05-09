#!/usr/bin/env node

import fs from 'fs';
import https from 'https';

const env = fs.readFileSync('.env', 'utf8');
const match = env.match(/DEVTO_API_KEY=(.+)/);
if (!match) {
  console.error('No API key found');
  process.exit(1);
}

const apiKey = match[1].trim();
console.log(`API Key length: ${apiKey.length}`);
console.log('Checking API key validity...\n');

const opts = {
  hostname: 'dev.to',
  path: '/api/articles/me',
  method: 'GET',
  headers: { 'api-key': apiKey }
};

const req = https.request(opts, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    
    if (res.statusCode === 200) {
      const articles = JSON.parse(data);
      console.log(`\nYour articles: ${articles.length}`);
      
      const ids = [3622426, 3622730, 3623050];
      const scheduled = articles.filter(a => ids.includes(a.id));
      
      console.log(`\nScheduled articles found: ${scheduled.length}`);
      scheduled.forEach(a => {
        console.log(`  - [${a.id}] ${a.title.substring(0, 50)}`);
        console.log(`    Published: ${a.published}`);
        console.log(`    URL: ${a.url}`);
      });
    } else {
      console.error('Error response:', data.substring(0, 300));
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
});

req.end();
