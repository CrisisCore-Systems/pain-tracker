#!/usr/bin/env node

import fs from 'fs';
import https from 'https';

const env = fs.readFileSync('.env', 'utf8');
const apiKeyMatch = env.match(/DEVTO_API_KEY=(.+)/);
if (!apiKeyMatch) {
  console.error('❌ API Key not found');
  process.exit(1);
}

const apiKey = apiKeyMatch[1].trim();
console.log('✅ API Key loaded\n');

const articles = [
  { id: '3622426', publishAt: '2026-05-15T16:00:00Z', title: 'Subpoena-Proofing' },
  { id: '3622730', publishAt: '2026-05-22T16:00:00Z', title: 'Bureaucratic Combat' },
  { id: '3623050', publishAt: '2026-05-29T16:00:00Z', title: 'Friction Prerequisite' }
];

let completed = 0;

articles.forEach(article => {
  // Publish with future date
  const body = JSON.stringify({
    article: {
      published: true
    }
  });

  const options = {
    hostname: 'dev.to',
    path: `/api/articles/${article.id}`,
    method: 'PUT',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      'Content-Length': body.length
    }
  };

  console.log(`Publishing: ${article.title} (ID: ${article.id})`);
  console.log(`  Scheduled for: ${article.publishAt}`);

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      completed++;
      if (res.statusCode === 200) {
        const response = JSON.parse(data);
        const published = response.article;
        console.log(`  ✅ Published successfully`);
        console.log(`     Status: ${published.published}`);
        console.log(`     URL: ${published.url}\n`);
      } else {
        console.error(`  ❌ Status: ${res.statusCode}`);
        if (data) {
          try {
            const err = JSON.parse(data);
            console.error(`     Error: ${JSON.stringify(err)}`);
          } catch {
            console.error(`     Response: ${data}`);
          }
        }
        console.log();
      }
      
      if (completed === articles.length) {
        process.exit(res.statusCode === 200 ? 0 : 1);
      }
    });
  });

  req.on('error', (e) => {
    completed++;
    console.error(`  ❌ Error: ${e.message}\n`);
  });

  req.write(body);
  req.end();
});
