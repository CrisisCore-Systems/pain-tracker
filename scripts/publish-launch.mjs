import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import https from 'node:https';

const API_KEY = process.env.DEVTO_API_KEY;
const FILE_PATH = path.join(process.cwd(), 'docs', 'marketing', 'launch', 'DEVTO_LAUNCH_v1.0.0.md');

if (!API_KEY) {
  console.error('❌ Error: DEVTO_API_KEY is missing in .env');
  process.exit(1);
}

async function publish() {
  try {
    const content = await fs.readFile(FILE_PATH, 'utf-8');
    
    // Simple frontmatter parser
    // Handle both LF and CRLF line endings
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    if (!match) {
      throw new Error('Could not parse frontmatter. Ensure the file starts with ---, has a closing ---, and uses consistent line endings.');
    }

    const frontmatterRaw = match[1];
    const body_markdown = match[2];
    
    const article = {
      body_markdown,
      published: false // Always draft first for safety
    };

    // Parse frontmatter lines
    frontmatterRaw.split('\n').forEach(line => {
      const [key, ...values] = line.split(':');
      if (key && values.length) {
        let value = values.join(':').trim();
        // Remove quotes
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        // Handle tags array
        if (key.trim() === 'tags') {
          article.tags = value.replace(/[[\]"]/g, '').split(',').map(t => t.trim());
        } else {
          article[key.trim()] = value;
        }
      }
    });

    console.log('🚀 Publishing to Dev.to...');
    console.log(`Title: ${article.title}`);
    console.log(`Tags: ${article.tags}`);

    const data = JSON.stringify({ article });

    const options = {
      hostname: 'dev.to',
      path: '/api/articles',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': API_KEY,
        'User-Agent': 'PainTracker-Publisher/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let responseBody = '';

      res.on('data', (chunk) => {
        responseBody += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const json = JSON.parse(responseBody);
          console.log('✅ Successfully published!');
          console.log(`URL: ${json.url}`);
          console.log(`Manage: https://dev.to/dashboard`);
        } else {
          console.error(`❌ Failed with status ${res.statusCode}`);
          console.error(responseBody);
        }
      });
    });

    req.on('error', (e) => {
      console.error(`❌ Request error: ${e.message}`);
    });

    req.write(data);
    req.end();

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

publish();
