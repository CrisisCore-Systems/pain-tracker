import 'dotenv/config';
import https from 'node:https';

const API_KEY = process.env.HASHNODE_API_KEY;
const PUBLICATION_ID = process.env.HASHNODE_PUBLICATION_ID;
const PUBLICATION_HOST = process.env.HASHNODE_HOST || 'blog.paintracker.ca';

if (!API_KEY || !PUBLICATION_ID) {
  console.error('❌ Error: HASHNODE_API_KEY or HASHNODE_PUBLICATION_ID is missing in .env');
  process.exit(1);
}

const CTA_MARKDOWN = `

---

### 🚀 Take Control of Your Pain Management

**Pain Tracker Pro** is built by a chronic pain survivor for survivors. No servers, no tracking, just privacy-first insights.

-   **Secure:** Your data never leaves your device.
-   **Fast:** One-tap logging for crisis moments.
-   **Empowering:** Clinical-grade reports for your doctor or WorkSafeBC.

👉 **[Start Tracking Now (Free & Private)](https://paintracker.ca)**

*Have you experienced the issues mentioned in this article? Join the discussion in the comments below or [contribute on GitHub](https://github.com/CrisisCore-Systems/pain-tracker).*
`;

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
  console.log(`🔍 Fetching posts from ${PUBLICATION_HOST}...`);
  const query = `
    query GetPosts($host: String!) {
      publication(host: $host) {
        posts(first: 20) {
          edges {
            node {
              id
              title
              slug
              content {
                markdown
              }
            }
          }
        }
      }
    }
  `;
  
  const data = await gqlRequest(query, { host: PUBLICATION_HOST });
  return data?.publication?.posts?.edges?.map(edge => edge.node) || [];
}

async function updatePost(post) {
  console.log(`📝 Updating "${post.title}"...`);
  
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
      id: post.id,
      contentMarkdown: post.content.markdown + CTA_MARKDOWN
    }
  };

  try {
    const data = await gqlRequest(mutation, variables);
    console.log(`✅ Updated: ${data.updatePost.post.url}`);
  } catch (error) {
    console.error(`❌ Failed to update "${post.title}":`, error.message);
  }
}

async function main() {
  try {
    const posts = await getAllPosts();
    console.log(`Found ${posts.length} posts.`);

    for (const post of posts) {
      // Check if CTA already exists to avoid duplication
      if (post.content.markdown.includes('Take Control of Your Pain Management')) {
        console.log(`⏭️  Skipping "${post.title}" (CTA already present)`);
        continue;
      }

      await updatePost(post);
      // Add a small delay to be nice to the API
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('🎉 All done!');

  } catch (error) {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  }
}

main();
