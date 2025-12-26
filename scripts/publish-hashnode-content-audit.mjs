import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import https from 'node:https';

const API_KEY = process.env.HASHNODE_API_KEY;
const PUBLICATION_ID = process.env.HASHNODE_PUBLICATION_ID;
const PUBLICATION_HOST = process.env.HASHNODE_HOST || 'blog.paintracker.ca';
const FILE_PATH = path.join(process.cwd(), 'CONTENT_STRATEGY_AUDIT_2025.md');

if (!API_KEY || !PUBLICATION_ID) {
  console.error('❌ Error: HASHNODE_API_KEY or HASHNODE_PUBLICATION_ID is missing in .env');
  process.exit(1);
}

async function gqlRequest(query, variables) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      query,
      variables
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
            reject(new Error(JSON.stringify(json.errors, null, 2)));
          } else {
            resolve(json.data);
          }
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function getPostIdBySlug(slug) {
  console.log(`🔍 Checking if post exists (Host: ${PUBLICATION_HOST}, Slug: ${slug})...`);
  const query = `
    query GetPost($host: String!, $slug: String!) {
      publication(host: $host) {
        post(slug: $slug) {
          id
          title
        }
      }
    }
  `;
  
  try {
    const data = await gqlRequest(query, { host: PUBLICATION_HOST, slug });
    return data?.publication?.post?.id || null;
  } catch (error) {
    console.warn('⚠️ Warning: Could not check for existing post. Assuming new.', error.message);
    return null;
  }
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
    const slug = 'comprehensive-article-review-and-analysis-report';
    const subtitle = "A systematic review of 12 published articles, performance metrics, and a strategic roadmap for 2025.";
    
    const tags = [
      { slug: 'content-strategy', name: 'Content Strategy' },
      { slug: 'building-in-public', name: 'Building in Public' },
      { slug: 'audit', name: 'Audit' },
      { slug: 'transparency', name: 'Transparency' }
    ];

    // Check if post exists
    const existingPostId = await getPostIdBySlug(slug);

    if (existingPostId) {
      console.log(`📝 Found existing post (ID: ${existingPostId}). Updating...`);
      
      const mutation = `
        mutation UpdatePost($input: UpdatePostInput!) {
          updatePost(input: $input) {
            post {
              id
              url
              title
            }
          }
        }
      `;

      const variables = {
        input: {
          id: existingPostId,
          title: title,
          subtitle: subtitle,
          contentMarkdown: contentMarkdown,
          tags: tags,
        }
      };

      const data = await gqlRequest(mutation, variables);
      console.log('✅ Successfully updated!');
      console.log(`URL: ${data.updatePost.post.url}`);

    } else {
      console.log('🚀 Post not found. Creating new post...');
      
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
          subtitle: subtitle,
          slug: slug,
          contentMarkdown: contentMarkdown,
          publicationId: PUBLICATION_ID,
          tags: tags
        }
      };

      const data = await gqlRequest(mutation, variables);
      console.log('✅ Successfully published!');
      console.log(`URL: ${data.publishPost.post.url}`);
    }

  } catch (error) {
    console.error('❌ Failed:', error.message);
    process.exit(1);
  }
}

publish();