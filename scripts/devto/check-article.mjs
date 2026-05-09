#!/usr/bin/env node

import fs from 'fs';
import https from 'https';

const env = fs.readFileSync('.env', 'utf8');
const apiKeyMatch = env.match(/DEVTO_API_KEY=(.+)/);
const apiKey = apiKeyMatch[1].trim();

const articleId = '3622426'; // Subpoena-Proofing

const options = {
  hostname: 'dev.to',
  path: `/api/articles/${articleId}`,
  method: 'GET',
  headers: {
    'api-key': apiKey,
    'Content-Type': 'application/json'
  }
};

console.log(`Fetching article ${articleId}...\n`);

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    if (res.statusCode === 200) {
      const article = JSON.parse(data).article;
      console.log('Current article state:');
      console.log(JSON.stringify(article, null, 2));
      
      console.log('\n\nAttempting to publish with published_at flag...\n');
      
      // Try publishing with the published flag
      const updateBody = JSON.stringify({
        article: {
          published: true,
          published_at: '2026-05-15T16:00:00Z'
        }
      });

      const updateOptions = {
        hostname: 'dev.to',
        path: `/api/articles/${articleId}`,
        method: 'PUT',
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
          'Content-Length': updateBody.length
        }
      };

      const updateReq = https.request(updateOptions, (updateRes) => {
        let updateData = '';
        updateRes.on('data', chunk => updateData += chunk);
        updateRes.on('end', () => {
          console.log(`Status: ${updateRes.statusCode}`);
          if (updateRes.statusCode === 200) {
            const updated = JSON.parse(updateData).article;
            console.log('Updated article:');
            console.log(`Published: ${updated.published}`);
            console.log(`Published At: ${updated.published_at}`);
          } else {
            console.log('Response:', updateData);
          }
        });
      });

      updateReq.on('error', (e) => console.error('Error:', e.message));
      updateReq.write(updateBody);
      updateReq.end();
    } else {
      console.error(`Status: ${res.statusCode}`);
      console.log(data);
    }
  });
});

req.on('error', (e) => console.error('Error:', e.message));
req.end();
