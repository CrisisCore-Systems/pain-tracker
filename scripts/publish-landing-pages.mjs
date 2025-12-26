import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import https from 'node:https';

const API_KEY = process.env.HASHNODE_API_KEY;
const PUBLICATION_ID = process.env.HASHNODE_PUBLICATION_ID;
const PUBLICATION_HOST = process.env.HASHNODE_HOST || 'blog.paintracker.ca';

if (!API_KEY || !PUBLICATION_ID) {
  console.error('❌ Error: HASHNODE_API_KEY or HASHNODE_PUBLICATION_ID is missing in .env');
  process.exit(1);
}

const PAGES = [
  {
    file: 'pages/start-here.md',
    title: 'Start Here: The Pain Tracker Guide',
    slug: 'start-here',
    subtitle: 'New to Pain Tracker? Begin your journey here.'
  },
  {
    file: 'pages/contribute.md',
    title: 'Contribute to Pain Tracker',
    slug: 'contribute',
    subtitle: 'Help us build the future of privacy-first healthcare.'
  },
  {
    file: 'pages/why-pain-tracker.md',
    title: 'Why Pain Tracker?',
    slug: 'why-pain-tracker',
    subtitle: 'The philosophy behind the code.'
  }
];

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

async function getAllPosts() {
  console.log(`🔍 Fetching existing posts from ${PUBLICATION_HOST}...`);
  const query = `
    query GetPosts($host: String!) {
      publication(host: $host) {
        posts(first: 50) {
          edges {
            node {
              id
              title
              slug
            }
          }
        }
      }
    }
  `;
  
  const data = await gqlRequest(query, { host: PUBLICATION_HOST });
  return data?.publication?.posts?.edges?.map(edge => edge.node) || [];
}

async function publishNewPost(page, content) {
  console.log(`✨ Creating new post: "${page.title}" (${page.slug})...`);
  
  const mutation = `
    mutation PublishPost($input: PublishPostInput!) {
      publishPost(input: $input) {
        post {
          id
          url
          slug
        }
      }
    }
  `;

  const variables = {
    input: {
      publicationId: PUBLICATION_ID,
      title: page.title,
      subtitle: page.subtitle,
      slug: page.slug,
      contentMarkdown: content,
      tags: [] // Optional: Add tags if needed
    }
  };

  const data = await gqlRequest(mutation, variables);
  return data.publishPost.post;
}

async function updateExistingPost(postId, page, content) {
  console.log(`📝 Updating existing post: "${page.title}" (${page.slug})...`);

  const mutation = `
    mutation UpdatePost($input: UpdatePostInput!) {
      updatePost(input: $input) {
        post {
          id
          url
          slug
        }
      }
    }
  `;

  const variables = {
    input: {
      id: postId,
      title: page.title,
      subtitle: page.subtitle,
      contentMarkdown: content
      // Note: We don't update the slug to avoid breaking links if it's already set
    }
  };

  const data = await gqlRequest(mutation, variables);
  return data.updatePost.post;
}

async function main() {
  try {
    // 1. Get existing posts to check for collisions
    const existingPosts = await getAllPosts();
    
    // 2. Process each page
    for (const page of PAGES) {
      const filePath = path.join(process.cwd(), page.file);
      console.log(`\n📖 Reading ${page.file}...`);
      const content = await fs.readFile(filePath, 'utf-8');

      // Check if post exists by slug
      const existingPost = existingPosts.find(p => p.slug === page.slug);

      if (existingPost) {
        const result = await updateExistingPost(existingPost.id, page, content);
        console.log(`✅ Updated: ${result.url}`);
      } else {
        const result = await publishNewPost(page, content);
        console.log(`✅ Published: ${result.url}`);
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n🎉 All landing pages processed!');

  } catch (error) {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  }
}

main();
