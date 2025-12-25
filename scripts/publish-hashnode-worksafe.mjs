import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import https from 'node:https';

const API_KEY = process.env.HASHNODE_API_KEY;
const PUBLICATION_ID = process.env.HASHNODE_PUBLICATION_ID;
const FILE_PATH = path.join(process.cwd(), 'blog-worksafe-bc-case-study-documentation-time-savings.md');

if (!API_KEY || !PUBLICATION_ID) {
  console.error('❌ Error: HASHNODE_API_KEY or HASHNODE_PUBLICATION_ID is missing in .env');
  process.exit(1);
}

async function publish() {
  try {
    const content = await fs.readFile(FILE_PATH, 'utf-8');
    
    // Extract title from first line
    const lines = content.split('\n');
    const titleLine = lines[0];
    const title = titleLine.replace(/^#\s+/, '').trim();
    
    // Content is the rest
    const contentMarkdown = lines.slice(1).join('\n').trim();
    
    // Generate slug from title
    const slug = 'how-pain-tracker-pro-streamlines-worksafebc-claims-a-composite-case-study';

    console.log('🚀 Publishing to Hashnode...');
    console.log(`Title: ${title}`);
    console.log(`Slug: ${slug}`);

    const mutation = `
      mutation PublishPost($input: PublishPostInput!) {
        publishPost(input: $input) {
          post {
            id
            title
            slug
            url
          }
        }
      }
    `;

    const variables = {
      input: {
        title: title,
        subtitle: "Save 15+ hours on WorkSafeBC claims. A case study on reducing paperwork and protecting privacy with local-first tracking.",
        slug: slug,
        contentMarkdown: contentMarkdown,
        publicationId: PUBLICATION_ID,
        tags: [
          { slug: 'privacy', name: 'Privacy' },
          { slug: 'healthcare', name: 'Healthcare' },
          { slug: 'accessibility', name: 'Accessibility' },
          { slug: 'pwa', name: 'PWA' },
          { slug: 'typescript', name: 'TypeScript' }
        ]
      }
    };

    const data = JSON.stringify({
      query: mutation,
      variables: variables
    });

    const options = {
      hostname: 'gql.hashnode.com',
      path: '/',
      method: 'POST',
      headers: {
        'Authorization': API_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let responseBody = '';

      res.on('data', (chunk) => {
        responseBody += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(responseBody);
          if (json.errors) {
            console.error('❌ GraphQL Errors:', JSON.stringify(json.errors, null, 2));
            process.exit(1);
          }
          
          if (json.data?.publishPost?.post) {
            console.log('✅ Successfully published!');
            console.log(`URL: ${json.data.publishPost.post.url}`);
          } else {
            console.error('❌ Unexpected response:', JSON.stringify(json, null, 2));
          }
        } catch (e) {
          console.error('❌ Error parsing response:', e.message);
          console.error('Raw response:', responseBody);
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
